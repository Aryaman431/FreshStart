"""
FastAPI resume parsing service.

Run:
    uvicorn parser.api.main:app --reload --port 8000

Endpoint:
    POST /parse-resume   multipart/form-data  field: file (PDF)
"""

import logging
import os
import tempfile
from pathlib import Path

from dotenv import load_dotenv

# Load env vars from project root before anything else
_root = Path(__file__).resolve().parent.parent.parent
load_dotenv(_root / ".env.local", override=True)
load_dotenv(_root / ".env", override=False)

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from parser.extractors import extract_text
from parser.parsers import parse_resume_text

logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

app = FastAPI(
    title="FreshStart Resume Parser",
    version="1.0.0",
)

# ── CORS — allow all origins in dev, restrict via env in prod ─────────────────
ALLOWED_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://localhost:9003,http://127.0.0.1:3000,http://127.0.0.1:9003",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in ALLOWED_ORIGINS],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    """
    Accept a PDF upload, extract text, parse with Gemini.
    Returns builder-compatible JSON.
    """
    # ── Validate file type ────────────────────────────────────────────────────
    filename = (file.filename or "").lower()
    content_type = file.content_type or ""
    if not filename.endswith(".pdf") and "pdf" not in content_type:
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    # ── Read + size check ─────────────────────────────────────────────────────
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large. Max 10 MB.")

    if len(contents) < 100:
        raise HTTPException(status_code=400, detail="File appears to be empty.")

    log.info("Received file: %s (%d bytes)", file.filename, len(contents))

    # ── Save to temp file ─────────────────────────────────────────────────────
    tmp_path = None
    try:
        # On Windows, NamedTemporaryFile holds a lock — must close before reading
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
            tmp.write(contents)
            tmp_path = tmp.name
        # File is now closed and fully flushed — safe to open with fitz/pdfplumber

        # ── Extract text ──────────────────────────────────────────────────────
        resume_text = extract_text(tmp_path)

        if not resume_text.strip():
            raise HTTPException(
                status_code=422,
                detail=(
                    "Could not extract text from this PDF. "
                    "Make sure it is not a scanned/image-only document."
                ),
            )

        log.info("Extracted %d chars — sending to Gemini", len(resume_text))

        # ── Parse with Gemini ─────────────────────────────────────────────────
        structured = parse_resume_text(resume_text)
        log.info("Parsing complete")
        return structured

    except HTTPException:
        raise
    except EnvironmentError as e:
        log.error("Env error: %s", e)
        raise HTTPException(status_code=500, detail=str(e))
    except ValueError as e:
        log.error("Parse error: %s", e)
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        log.exception("Unexpected error")
        raise HTTPException(status_code=500, detail=f"Parsing failed: {e}")
    finally:
        if tmp_path:
            Path(tmp_path).unlink(missing_ok=True)
