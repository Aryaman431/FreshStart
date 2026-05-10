"""
FreshStart Resume Parser — self-contained FastAPI service.
All extraction and parsing logic is in this single file to avoid import issues.

Start command (Render/Railway):
    uvicorn parser.api.main:app --host 0.0.0.0 --port $PORT
"""

import json
import logging
import os
import re
import shutil
import tempfile
import time
from pathlib import Path

from dotenv import load_dotenv

# Load .env.local when running locally (no-op in production)
_root = Path(__file__).resolve().parent.parent.parent
load_dotenv(_root / ".env.local", override=True)
load_dotenv(_root / ".env", override=False)

import fitz  # PyMuPDF
import pdfplumber
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from google import genai

logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

# ── Gemini client ─────────────────────────────────────────────────────────────
_client: genai.Client | None = None
MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite"]


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise EnvironmentError("GEMINI_API_KEY is not set.")
        _client = genai.Client(api_key=api_key)
    return _client


# ── PDF extraction ────────────────────────────────────────────────────────────
_TESSERACT = shutil.which("tesseract") is not None


def _extract_pymupdf(path: str) -> str:
    try:
        doc = fitz.open(path)
        text = "".join(page.get_text("text") for page in doc)
        doc.close()
        return text.strip()
    except Exception as e:
        log.warning("PyMuPDF failed: %s", e)
        return ""


def _extract_pdfplumber(path: str) -> str:
    try:
        text = ""
        with pdfplumber.open(path) as pdf:
            for page in pdf.pages:
                text += (page.extract_text() or "") + "\n"
        return text.strip()
    except Exception as e:
        log.warning("pdfplumber failed: %s", e)
        return ""


def _extract_ocr(path: str) -> str:
    if not _TESSERACT:
        return ""
    try:
        import pytesseract
        from pdf2image import convert_from_path
        images = convert_from_path(path, dpi=300)
        return "".join(pytesseract.image_to_string(img) for img in images).strip()
    except Exception as e:
        log.warning("OCR failed: %s", e)
        return ""


def _clean(raw: str) -> str:
    text = raw.replace("\t", " ")
    text = re.sub(r" {2,}", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"([a-z])\n([a-z])", r"\1 \2", text)
    text = re.sub(r"[^\x20-\x7E\n]", " ", text)
    lines = [l.strip() for l in text.splitlines()]
    return "\n".join(l for l in lines if l).strip()


def extract_text(path: str) -> str:
    text = _extract_pymupdf(path)
    if len(text) < 100:
        text = _extract_pdfplumber(path)
    if len(text) < 100:
        text = _extract_ocr(path)
    cleaned = _clean(text)
    log.info("Extracted %d chars", len(cleaned))
    print("===== EXTRACTED TEXT =====")
    print(cleaned[:2000])
    print("==========================")
    if not cleaned:
        raise ValueError("No readable text extracted from PDF.")
    return cleaned


# ── Gemini parsing ────────────────────────────────────────────────────────────
PROMPT = """You are an expert ATS resume parser.
Extract ALL resume information into STRICT JSON.
Rules:
- Return ONLY valid JSON — no markdown, no explanations
- If a field is missing use "" or []
- Join bullet points with \\n in responsibilities/description

Return exactly this shape:
{{
  "personalInfo": {{"fullName":"","email":"","phone":"","linkedin":"","github":"","countryCode":"+91"}},
  "professionalSummary": "",
  "education": [{{"institution":"","degree":"","startDate":"","endDate":"","coursework":""}}],
  "experience": [{{"company":"","role":"","startDate":"","endDate":"","responsibilities":""}}],
  "projects": [{{"title":"","techStack":"","link":"","startDate":"","endDate":"","description":""}}],
  "skills": [{{"category":"","values":""}}],
  "certifications": [{{"name":"","issuer":"","year":""}}],
  "achievements": ""
}}

Resume:
{text}
"""


def _strip_md(s: str) -> str:
    s = re.sub(r"^```(?:json)?", "", s.strip(), flags=re.MULTILINE)
    return re.sub(r"```$", "", s, flags=re.MULTILINE).strip()


def _normalise(raw: dict) -> dict:
    def s(v):
        if isinstance(v, list): return "\n".join(str(x) for x in v)
        return v if isinstance(v, str) else ""
    def l(v): return v if isinstance(v, list) else []
    pi = raw.get("personalInfo") or {}
    return {
        "personalInfo": {
            "fullName": s(pi.get("fullName")), "email": s(pi.get("email")),
            "phone": s(pi.get("phone")), "linkedin": s(pi.get("linkedin")),
            "github": s(pi.get("github")),
            "countryCode": s(pi.get("countryCode")) or "+91",
        },
        "professionalSummary": s(raw.get("professionalSummary")),
        "education": [{"id": f"edu-{i}", "institution": s(e.get("institution")),
            "degree": s(e.get("degree")), "startDate": s(e.get("startDate")),
            "endDate": s(e.get("endDate")), "coursework": s(e.get("coursework"))}
            for i, e in enumerate(l(raw.get("education")))],
        "experience": [{"id": f"exp-{i}", "company": s(e.get("company")),
            "role": s(e.get("role")), "startDate": s(e.get("startDate")),
            "endDate": s(e.get("endDate")), "responsibilities": s(e.get("responsibilities"))}
            for i, e in enumerate(l(raw.get("experience")))],
        "projects": [{"id": f"proj-{i}", "title": s(p.get("title")),
            "techStack": s(p.get("techStack")), "link": s(p.get("link")),
            "startDate": s(p.get("startDate")), "endDate": s(p.get("endDate")),
            "description": s(p.get("description")), "date": ""}
            for i, p in enumerate(l(raw.get("projects")))],
        "skills": [{"id": f"sk-{i}", "category": s(sk.get("category")),
            "values": s(sk.get("values"))}
            for i, sk in enumerate(l(raw.get("skills")))],
        "certifications": [{"id": f"cert-{i}", "name": s(c.get("name")),
            "issuer": s(c.get("issuer")), "year": s(c.get("year"))}
            for i, c in enumerate(l(raw.get("certifications")))],
        "achievements": s(raw.get("achievements")),
    }


def parse_resume_text(resume_text: str) -> dict:
    client = _get_client()
    prompt = PROMPT.format(text=resume_text)
    last_err = None
    for model in MODELS:
        try:
            resp = client.models.generate_content(model=model, contents=prompt)
            cleaned = _strip_md(resp.text)
            try:
                raw = json.loads(cleaned)
            except json.JSONDecodeError:
                m = re.search(r"\{.*\}", cleaned, re.DOTALL)
                raw = json.loads(m.group()) if m else {}
            return _normalise(raw)
        except Exception as e:
            last_err = e
            if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                time.sleep(5)
                continue
            raise
    raise ValueError(f"All models failed. Last: {last_err}")


# ── FastAPI app ───────────────────────────────────────────────────────────────
app = FastAPI(title="FreshStart Resume Parser", version="1.0.0")

_raw_origins = os.getenv("CORS_ORIGINS", "")
# If CORS_ORIGINS is set, use it; otherwise allow all origins
_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()] or ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "running", "service": "FreshStart Resume Parser"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    fname = (file.filename or "").lower()
    ctype = file.content_type or ""
    if not fname.endswith(".pdf") and "pdf" not in ctype:
        raise HTTPException(400, "Only PDF files accepted.")

    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(413, "File too large. Max 10 MB.")
    if len(contents) < 100:
        raise HTTPException(400, "File appears empty.")

    log.info("Received %s (%d bytes)", file.filename, len(contents))

    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
            tmp.write(contents)
            tmp_path = tmp.name

        resume_text = extract_text(tmp_path)
        result = parse_resume_text(resume_text)
        return result

    except HTTPException:
        raise
    except EnvironmentError as e:
        raise HTTPException(500, str(e))
    except ValueError as e:
        raise HTTPException(422, str(e))
    except Exception as e:
        log.exception("Unexpected error")
        raise HTTPException(500, f"Parsing failed: {e}")
    finally:
        if tmp_path:
            Path(tmp_path).unlink(missing_ok=True)
