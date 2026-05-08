"""
Gemini-powered resume parser.
Sends cleaned text -> returns structured JSON matching the builder schema.
"""

import json
import os
import re
import time
from google import genai

_client: genai.Client | None = None

# Try models in order — falls back if one is quota-exhausted
MODELS = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
]


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise EnvironmentError("GEMINI_API_KEY environment variable is not set.")
        _client = genai.Client(api_key=api_key)
    return _client


PROMPT_TEMPLATE = """You are an expert ATS resume parser.

Extract ALL resume information from the text below into STRICT JSON.

Rules:
- Return ONLY valid JSON - no markdown fences, no explanations, no extra text
- Preserve bullet points as separate lines joined by \\n
- Infer section names intelligently (e.g. "Work History" -> experience)
- Extract technologies/tools into skills where possible
- If a field is missing, use an empty string "" or empty array []
- Dates: preserve original format (e.g. "Jan 2023", "2021 -- Present")
- responsibilities and description: join bullet points with \\n

Return exactly this JSON shape:
{{
  "personalInfo": {{
    "fullName": "",
    "email": "",
    "phone": "",
    "linkedin": "",
    "github": "",
    "countryCode": "+91"
  }},
  "professionalSummary": "",
  "education": [
    {{
      "institution": "",
      "degree": "",
      "startDate": "",
      "endDate": "",
      "coursework": ""
    }}
  ],
  "experience": [
    {{
      "company": "",
      "role": "",
      "startDate": "",
      "endDate": "",
      "responsibilities": ""
    }}
  ],
  "projects": [
    {{
      "title": "",
      "techStack": "",
      "link": "",
      "startDate": "",
      "endDate": "",
      "description": ""
    }}
  ],
  "skills": [
    {{
      "category": "",
      "values": ""
    }}
  ],
  "certifications": [
    {{
      "name": "",
      "issuer": "",
      "year": ""
    }}
  ],
  "achievements": ""
}}

Resume text:
{resume_text}
"""


def _strip_markdown(text: str) -> str:
    text = text.strip()
    text = re.sub(r"^```(?:json)?", "", text, flags=re.MULTILINE)
    text = re.sub(r"```$", "", text, flags=re.MULTILINE)
    return text.strip()


def _safe_parse_json(raw: str) -> dict:
    cleaned = _strip_markdown(raw)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass
        raise ValueError(f"Gemini returned invalid JSON: {e}\n\nRaw:\n{cleaned[:500]}")


def _normalise(raw: dict) -> dict:
    def _str(v) -> str:
        if isinstance(v, list):
            return "\n".join(str(x) for x in v)
        return v if isinstance(v, str) else ""

    def _list(v) -> list:
        return v if isinstance(v, list) else []

    pi = raw.get("personalInfo") or {}
    return {
        "personalInfo": {
            "fullName":    _str(pi.get("fullName")),
            "email":       _str(pi.get("email")),
            "phone":       _str(pi.get("phone")),
            "linkedin":    _str(pi.get("linkedin")),
            "github":      _str(pi.get("github")),
            "countryCode": _str(pi.get("countryCode")) or "+91",
        },
        "professionalSummary": _str(raw.get("professionalSummary")),
        "education": [
            {
                "id":          f"edu-{i}",
                "institution": _str(e.get("institution")),
                "degree":      _str(e.get("degree")),
                "startDate":   _str(e.get("startDate")),
                "endDate":     _str(e.get("endDate")),
                "coursework":  _str(e.get("coursework")),
            }
            for i, e in enumerate(_list(raw.get("education")))
        ],
        "experience": [
            {
                "id":               f"exp-{i}",
                "company":          _str(e.get("company")),
                "role":             _str(e.get("role")),
                "startDate":        _str(e.get("startDate")),
                "endDate":          _str(e.get("endDate")),
                "responsibilities": _str(e.get("responsibilities")),
            }
            for i, e in enumerate(_list(raw.get("experience")))
        ],
        "projects": [
            {
                "id":          f"proj-{i}",
                "title":       _str(p.get("title")),
                "techStack":   _str(p.get("techStack")),
                "link":        _str(p.get("link")),
                "startDate":   _str(p.get("startDate")),
                "endDate":     _str(p.get("endDate")),
                "description": _str(p.get("description")),
                "date":        "",
            }
            for i, p in enumerate(_list(raw.get("projects")))
        ],
        "skills": [
            {
                "id":       f"sk-{i}",
                "category": _str(s.get("category")),
                "values":   _str(s.get("values")),
            }
            for i, s in enumerate(_list(raw.get("skills")))
        ],
        "certifications": [
            {
                "id":     f"cert-{i}",
                "name":   _str(c.get("name")),
                "issuer": _str(c.get("issuer")),
                "year":   _str(c.get("year")),
            }
            for i, c in enumerate(_list(raw.get("certifications")))
        ],
        "achievements": _str(raw.get("achievements")),
    }


def parse_resume_text(resume_text: str) -> dict:
    """
    Try each model in MODELS order.
    On 429 quota error, wait the retry delay then try next model.
    """
    client = _get_client()
    prompt = PROMPT_TEMPLATE.format(resume_text=resume_text)
    last_error = None

    for model in MODELS:
        try:
            response = client.models.generate_content(
                model=model,
                contents=prompt,
            )
            raw = _safe_parse_json(response.text)
            return _normalise(raw)
        except Exception as e:
            err_str = str(e)
            last_error = e
            if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                # Extract retry delay if present, wait briefly then try next model
                delay_match = re.search(r"retryDelay.*?(\d+)s", err_str)
                wait = min(int(delay_match.group(1)) if delay_match else 5, 10)
                time.sleep(wait)
                continue
            # Non-quota error — raise immediately
            raise

    raise ValueError(
        f"All Gemini models exhausted quota. Last error: {last_error}\n"
        "Please wait a minute and try again, or check your API quota at https://ai.dev/rate-limit"
    )
