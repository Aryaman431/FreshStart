"""
FreshStart Resume Parser — FastAPI service.

Local:
    uvicorn parser.api.main:app --reload --port 8000

Production (Render / Railway — run from repo root):
    uvicorn parser.api.main:app --host 0.0.0.0 --port $PORT
"""

import logging
import os
import sys
import tempfile
from pathlib import Path

from dotenv import load_dotenv

# ── Env loading ───────────────────────────────────────────────────────────────
# Works both locally (loads .env.local from project root) and on Render/Railway
# (env vars are injected directly, load_dotenv is a no-op).
_root = Path(__file__).resolve().parent.parent.parent
load_dotenv(_root / ".env.local", override=True)
load_dotenv(_root / ".env", override=False)

# ── Path fix so `parser.*` imports resolve when run from repo root ─────────────
_repo_root = str(_root)
if _repo_root not in sys.path:
    sys.path.insert(0, _repo_root)

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from parser.extractors import extract_text
from parser.parsers import parse_resume_text

logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

app = FastAPI(title="FreshStart Resume Parser", version="1.0.0")

# ── CORS ──────────────────────────────────────────────────────────────────────
# In production set CORS_ORIGINS to your Vercel URL, e.g.:
#   CORS_ORIGINS=https://your-app.vercel.app
_raw_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://localhost:9003,http://127.0.0.1:3000,http://127.0.0.1:9003",
)
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
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
    filename = (file.filename or "").lower()
    content_type = file.content_type or ""
    if not filename.endswith(".pdf") and "pdf" not in content_type:
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large. Max 10 MB.")
    if len(contents) < 100:
        raise HTTPException(status_code=400, detail="File appears to be empty.")

    log.info("Received: %s (%d bytes)", file.filename, len(contents))

    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
            tmp.write(contents)
            tmp_path = tmp.name

        resume_text = extract_text(tmp_path)

        if not resume_text.strip():
            raise HTTPException(
                status_code=422,
                detail="Could not extract text. Ensure the PDF is not scanned/image-only.",
            )

        log.info("Extracted %d chars — sending to Gemini", len(resume_text))
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
