# FreshStart Resume Parser

FastAPI service that extracts and structures resume data from PDF uploads using PyMuPDF + pdfplumber + Gemini.

## Local development

```bash
pip install -r parser/requirements.txt
uvicorn parser.api.main:app --reload --port 8000
```

Set in `.env.local` (project root):
```
GEMINI_API_KEY=your_key
NEXT_PUBLIC_PARSER_URL=http://localhost:8000
```

---

## Deploy to Render (recommended)

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your repo
4. Render auto-detects `render.yaml` — confirm settings:
   - **Build command:** `pip install -r parser/requirements.txt`
   - **Start command:** `uvicorn parser.api.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables in Render dashboard:
   - `GEMINI_API_KEY` = your Gemini API key
   - `CORS_ORIGINS` = `https://your-app.vercel.app` (your Vercel frontend URL)
6. Deploy — note the service URL (e.g. `https://freshstart-parser.onrender.com`)

---

## Deploy to Railway

1. Push this repo to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Railway auto-detects `railway.toml`
4. Add environment variables:
   - `GEMINI_API_KEY` = your Gemini API key
   - `CORS_ORIGINS` = `https://your-app.vercel.app`
5. Deploy — note the service URL

---

## Connect frontend (Vercel)

In your Vercel project settings → Environment Variables, add:
```
NEXT_PUBLIC_PARSER_URL=https://your-backend-url.onrender.com
```

Redeploy the frontend. The Import PDF button will now call the deployed backend.

---

## Endpoint

### `POST /parse-resume`
- **Content-Type:** `multipart/form-data`
- **Field:** `file` (PDF, max 10 MB)
- **Returns:** Builder-compatible JSON

```bash
curl -X POST https://your-backend.onrender.com/parse-resume \
  -F "file=@resume.pdf"
```
