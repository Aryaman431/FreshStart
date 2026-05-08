# FreshStart Resume Parser

FastAPI service that extracts and structures resume data from PDF uploads using pdfplumber + PyMuPDF + Gemini.

## Setup

```bash
cd parser
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Set your environment variable:
```bash
export GEMINI_API_KEY=your_key_here
# Optional: restrict CORS origins (comma-separated)
export CORS_ORIGINS=http://localhost:3000
```

## Run

```bash
uvicorn parser.api.main:app --reload --port 8000
```

## Endpoint

### `POST /parse-resume`

- **Content-Type:** `multipart/form-data`
- **Field:** `file` (PDF, max 10 MB)
- **Returns:** Builder-compatible JSON

```bash
curl -X POST http://localhost:8000/parse-resume \
  -F "file=@resume.pdf"
```

### Response shape

```json
{
  "personalInfo": { "fullName": "", "email": "", "phone": "", "linkedin": "", "github": "", "countryCode": "+91" },
  "professionalSummary": "",
  "education": [{ "id": "", "institution": "", "degree": "", "startDate": "", "endDate": "", "coursework": "" }],
  "experience": [{ "id": "", "company": "", "role": "", "startDate": "", "endDate": "", "responsibilities": "" }],
  "projects": [{ "id": "", "title": "", "techStack": "", "link": "", "startDate": "", "endDate": "", "description": "", "date": "" }],
  "skills": [{ "id": "", "category": "", "values": "" }],
  "certifications": [{ "id": "", "name": "", "issuer": "", "year": "" }],
  "achievements": ""
}
```

## Architecture

```
parser/
├── extractors/
│   └── pdf_extractor.py   # pdfplumber + PyMuPDF fallback + text cleaning
├── parsers/
│   └── gemini_parser.py   # Gemini prompt, JSON parsing, schema normalisation
├── api/
│   └── main.py            # FastAPI app, CORS, upload endpoint
└── requirements.txt
```
