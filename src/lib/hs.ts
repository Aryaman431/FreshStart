const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = process.env.GROQ_API_URL ?? "https://api.groq.com/v1";
const GROQ_MODEL = process.env.GROQ_MODEL ?? "groq-1";

if (!GROQ_API_KEY) {
  throw new Error("Missing GROQ_API_KEY environment variable. Set GROQ_API_KEY in .env.local or your deployment environment.");
}

export const groq = {
  apiKey: GROQ_API_KEY,
  url: GROQ_API_URL,
  model: GROQ_MODEL,

  async complete(prompt: string, options?: { maxTokens?: number; temperature?: number }) {
    const body = {
      input: prompt,
      max_output_tokens: options?.maxTokens ?? 256,
      temperature: options?.temperature ?? 0.7,
    };

    const response = await fetch(`${GROQ_API_URL}/models/${GROQ_MODEL}/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  },
};