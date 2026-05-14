"""
PDF text extraction pipeline:
  1. PyMuPDF  (primary  — best for LaTeX/vector PDFs)
  2. pdfplumber (fallback — good for structured PDFs)
  3. OCR via pytesseract (last resort — scanned/image PDFs)
                         skipped gracefully if tesseract not installed
"""

import logging
import re
import shutil

import fitz  # PyMuPDF
import pdfplumber

log = logging.getLogger(__name__)

MIN_CHARS = 100  # below this → try next extractor

# ── OCR availability check ────────────────────────────────────────────────────
_TESSERACT_AVAILABLE = shutil.which("tesseract") is not None
if not _TESSERACT_AVAILABLE:
    log.warning(
        "tesseract not found — OCR fallback disabled. "
        "Install from https://github.com/UB-Mannheim/tesseract/wiki"
    )


# ── Extractor 1: PyMuPDF ─────────────────────────────────────────────────────

def extract_with_pymupdf(pdf_path: str) -> str:
    """Primary extractor — handles LaTeX, vector, and most modern PDFs."""
    text = ""
    try:
        doc = fitz.open(pdf_path)
        for page in doc:
            text += page.get_text("text")
        doc.close()
        log.info("PyMuPDF extracted %d chars", len(text))
    except Exception as e:
        log.warning("PyMuPDF failed: %s", e)
    return text.strip()


# ── Extractor 2: pdfplumber ───────────────────────────────────────────────────

def extract_with_pdfplumber(pdf_path: str) -> str:
    """Secondary extractor — good for table-heavy and structured PDFs."""
    text = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                extracted = page.extract_text() or ""
                if extracted.strip():
                    text += extracted + "\n"
        log.info("pdfplumber extracted %d chars", len(text))
    except Exception as e:
        log.warning("pdfplumber failed: %s", e)
    return text.strip()


# ── Extractor 3: OCR ─────────────────────────────────────────────────────────

def extract_with_ocr(pdf_path: str) -> str:
    """Last-resort extractor for scanned/image-only PDFs."""
    if not _TESSERACT_AVAILABLE:
        log.warning("OCR skipped — tesseract not installed")
        return ""
    try:
        import pytesseract
        from pdf2image import convert_from_path

        images = convert_from_path(pdf_path, dpi=300)
        text = ""
        for img in images:
            text += pytesseract.image_to_string(img, lang="eng")
        log.info("OCR extracted %d chars", len(text))
        return text.strip()
    except Exception as e:
        log.warning("OCR failed: %s", e)
        return ""


# ── Text cleaner ──────────────────────────────────────────────────────────────

def _clean(raw: str) -> str:
    """Normalise whitespace and fix common PDF/LaTeX spacing artifacts."""
    # Remove form-feed / page-break characters from multi-page PDFs
    text = raw.replace("\f", " ")
    text = text.replace("\t", " ")

    # Collapse multiple spaces
    text = re.sub(r" {2,}", " ", text)

    # Collapse multiple blank lines
    text = re.sub(r"\n\s*\n", "\n", text)

    # Fix broken LaTeX line-wrapping: "soft\nware" → "soft ware"
    text = re.sub(r"([a-z])\n([a-z])", r"\1 \2", text)

    # Strip non-printable characters (keep newlines)
    text = re.sub(r"[^\x20-\x7E\n]", " ", text)

    # Trim each line
    lines = [line.strip() for line in text.splitlines()]
    return "\n".join(line for line in lines if line).strip()


# ── Public entry point ────────────────────────────────────────────────────────

def extract_text(pdf_path: str) -> str:
    """
    Run extraction pipeline in order:
      PyMuPDF → pdfplumber → OCR
    Returns cleaned text or raises ValueError if all fail.
    """
    # 1. PyMuPDF
    text = extract_with_pymupdf(pdf_path)

    # 2. pdfplumber fallback
    if len(text) < MIN_CHARS:
        log.info("PyMuPDF weak (%d chars) — trying pdfplumber", len(text))
        text = extract_with_pdfplumber(pdf_path)

    # 3. OCR fallback
    if len(text) < MIN_CHARS:
        log.info("pdfplumber weak (%d chars) — trying OCR", len(text))
        text = extract_with_ocr(pdf_path)

    cleaned = _clean(text)

    # Debug: always print first 3000 chars to server log
    print("===== EXTRACTED TEXT =====")
    print(cleaned[:3000])
    print("==========================")

    if not cleaned:
        raise ValueError(
            "No readable text extracted from PDF. "
            "If this is a scanned document, install Tesseract OCR."
        )

    return cleaned
