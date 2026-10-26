// =============================================================================
// UtsavOps AI — Gemini REST Client & Resilient Model Runner
// Reads API key from VITE_GEMINI_API_KEY env var or sessionStorage fallback.
// Implements multi-model fallback, exponential backoff, and schema recovery
// to protect against Google Gemini 500 "The model encountered an internal error."
// =============================================================================

export const GEMINI_MODELS = [
  'gemini-3.8-flash',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
];

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

/** Retrieves the API key: env var first, then sessionStorage. */
export function getApiKey(): string {
  const envKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  if (envKey && envKey.trim() !== '') return envKey.trim();
  const sessionKey = sessionStorage.getItem('utsavops_gemini_key');
  if (sessionKey && sessionKey.trim() !== '') return sessionKey.trim();
  return '';
}

/** Saves a user-supplied key to sessionStorage only. */
export function saveApiKeyToSession(key: string): void {
  sessionStorage.setItem('utsavops_gemini_key', key.trim());
}

/** Removes the session-stored key. */
export function clearSessionApiKey(): void {
  sessionStorage.removeItem('utsavops_gemini_key');
}

/** Returns true if a key is available from any source. */
export function isApiKeyAvailable(): boolean {
  return getApiKey() !== '';
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface GenerateContentResponse {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
}

/** Internal helper — makes a resilient structured REST call to Gemini with auto-retry and multi-model fallback. */
export async function callGemini(
  prompt: string,
  responseSchema?: object,
  systemInstruction?: string
): Promise<string> {
  const key = getApiKey();
  if (!key) {
    throw new Error('No Gemini API key configured. Please set one via the 🔑 Settings modal.');
  }

  let lastError = 'Unknown Gemini API error';

  for (const model of GEMINI_MODELS) {
    const url = `${GEMINI_BASE_URL}/${model}:generateContent`;

    // Try up to 2 attempts per model (initial + 1 retry with exponential backoff on 500/503/429)
    for (let attempt = 0; attempt < 2; attempt++) {
      if (attempt > 0) {
        await sleep(650 * attempt);
      }

      try {
        const body: Record<string, unknown> = {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
            maxOutputTokens: 8192,
            ...(responseSchema ? { responseSchema } : {}),
          },
        };

        if (systemInstruction && systemInstruction.trim().length > 0) {
          body.systemInstruction = {
            parts: [{ text: systemInstruction.trim() }],
          };
        }

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
          body: JSON.stringify(body),
        });

        if (response.ok) {
          const data = (await response.json()) as GenerateContentResponse;
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text && text.trim().length > 0) {
            return text;
          }
          throw new Error('Empty response received from Gemini API.');
        }

        const errText = await response.text();
        let message = `Gemini API error ${response.status}`;
        try {
          const errJson = JSON.parse(errText) as { error?: { message?: string } };
          if (errJson.error?.message) message = errJson.error.message;
        } catch {
          /* ignore */
        }

        lastError = message;

        // If it's a 404 (model not found / deprecated) or 400 (unsupported config on this model), break immediately to try next candidate model
        if (response.status === 404 || response.status === 400) {
          console.warn(`[UtsavOps AI] Model ${model} returned ${response.status}: ${message}. Trying next model...`);
          break;
        }

        // If it's a 500 or 503 internal server error from Google, wait and retry once on this model, then proceed to fallback model
        if (response.status === 500 || response.status === 503) {
          console.warn(`[UtsavOps AI] Model ${model} returned ${response.status} (${message}) on attempt ${attempt + 1}.`);
        }
      } catch (networkErr) {
        lastError = networkErr instanceof Error ? networkErr.message : 'Network error';
      }
    }
  }

  // If all models failed with responseSchema (sometimes schema parser fails on Google side), attempt one raw JSON prompt fallback
  try {
    const rawFallbackModel = GEMINI_MODELS[0];
    const fallbackUrl = `${GEMINI_BASE_URL}/${rawFallbackModel}:generateContent`;
    const fallbackPrompt = `${prompt}\n\nIMPORTANT: Return ONLY a valid JSON object matching the requested fields, with no markdown, backticks or commentary.`;

    const fallbackBody: Record<string, unknown> = {
      contents: [{ parts: [{ text: fallbackPrompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
        maxOutputTokens: 8192,
      },
    };
    if (systemInstruction) {
      fallbackBody.systemInstruction = { parts: [{ text: systemInstruction }] };
    }

    const fallbackRes = await fetch(fallbackUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify(fallbackBody),
    });

    if (fallbackRes.ok) {
      const data = (await fallbackRes.json()) as GenerateContentResponse;
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text && text.trim().length > 0) {
        return text;
      }
    }
  } catch {
    /* ignore fallback error */
  }

  throw new Error(lastError);
}
