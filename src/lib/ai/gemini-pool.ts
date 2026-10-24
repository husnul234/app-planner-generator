/**
 * BYOK (Bring Your Own Key) Multiple Gemini API Key Engine
 * Adapted from Modul Ajar Generator (Fase 4B.1)
 *
 * Provides:
 * 1. API Key validation against Google Generative Language API
 * 2. Multi-key pool rotation
 * 3. Multi-model fallback chain (gemini-2.5-flash -> gemini-2.0-flash -> gemini-1.5-flash -> gemini-1.5-pro)
 * 4. Transparent handling for 429 (Rate Limit / Quota Exceeded) and 503 (Overloaded)
 */

export const GEMINI_MODEL_CHAIN = [
  "gemini-3.8-flash",
  "gemini-3.5-flash-lite",
  "gemini-3-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
];

export interface GeminiKeyRecord {
  id?: string;
  key: string;
  nickname?: string;
  is_active?: boolean;
  status?: string;
}

export interface GenerationResult {
  success: boolean;
  text: string;
  usedModel: string;
  usedKeyMasked: string;
  triedAttempts: string[];
  tokensUsedEstimate: number;
  error?: string;
}

/**
 * Validates a Gemini API Key by querying available models
 */
export async function validateGeminiApiKey(apiKey: string): Promise<{
  valid: boolean;
  error?: string;
  modelCount?: number;
  availableModels?: string[];
}> {
  if (!apiKey || apiKey.trim().length < 20) {
    return { valid: false, error: "Format API Key tidak valid (terlalu pendek)" };
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.trim()}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      let msg = `HTTP ${res.status}: Gagal memvalidasi API Key`;
      try {
        const parsed = JSON.parse(errText);
        if (parsed.error?.message) {
          msg = parsed.error.message;
        }
      } catch {}
      return { valid: false, error: msg };
    }

    const data = await res.json();
    const rawModels: Array<{ name: string; supportedGenerationMethods?: string[] }> = Array.isArray(data.models) ? data.models : [];
    const count = rawModels.length;

    // Filter models supporting generateContent
    const contentModels = rawModels
      .filter((m) => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes("generateContent"))
      .map((m) => m.name.replace("models/", ""));

    return { valid: true, modelCount: count, availableModels: contentModels };
  } catch (err: unknown) {
    return { valid: false, error: (err as Error).message };
  }
}

/**
 * Mask an API key for safe logging & display (e.g., "AIza...8a9F")
 */
export function maskApiKey(key: string): string {
  if (!key) return "";
  if (key.length <= 8) return "••••" + key.slice(-2);
  return key.slice(0, 4) + "..." + key.slice(-4);
}

/**
 * Executes a generation request with multiple Gemini keys and model fallback chain
 */
export async function executeGeminiWithKeyPool(options: {
  prompt: string;
  systemPrompt?: string;
  keys: string[];
  modelChain?: string[];
  temperature?: number;
}): Promise<GenerationResult> {
  const {
    prompt,
    systemPrompt,
    keys,
    modelChain = GEMINI_MODEL_CHAIN,
    temperature = 0.7,
  } = options;

  if (!keys || keys.length === 0) {
    return {
      success: false,
      text: "",
      usedModel: "",
      usedKeyMasked: "",
      triedAttempts: [],
      tokensUsedEstimate: 0,
      error: "Tidak ada Gemini API Key yang tersedia. Silakan tambahkan minimal 1 API Key di menu BYOK Keys.",
    };
  }

  const triedAttempts: string[] = [];
  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    systemInstruction: systemPrompt
      ? {
          parts: [{ text: systemPrompt }],
        }
      : undefined,
    generationConfig: {
      temperature,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
    },
  };

  // Loop through available keys in pool
  for (let keyIdx = 0; keyIdx < keys.length; keyIdx++) {
    const currentKey = keys[keyIdx].trim();
    const maskedKey = maskApiKey(currentKey);

    // For current key, iterate model chain
    for (const model of modelChain) {
      const attemptLabel = `${model} (${maskedKey})`;
      triedAttempts.push(attemptLabel);

      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${currentKey}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        if (res.ok) {
          const data = await res.json();
          const candidate = data.candidates?.[0];
          const text = candidate?.content?.parts?.[0]?.text || "";

          if (text) {
            const wordCount = text.split(/\s+/).filter(Boolean).length;
            const estimatedTokens = Math.round(wordCount * 1.33);

            return {
              success: true,
              text,
              usedModel: model,
              usedKeyMasked: maskedKey,
              triedAttempts,
              tokensUsedEstimate: estimatedTokens,
            };
          }
        }

        // Handle specific error codes
        if (res.status === 429) {
          // Rate limit / Quota reached: try next model or next key
          console.warn(`[Gemini Pool] ${attemptLabel} hit Rate Limit (429), trying fallback...`);
          continue;
        }

        if (res.status === 503 || res.status === 500) {
          // Service overloaded: try next
          console.warn(`[Gemini Pool] ${attemptLabel} hit Service Overload (${res.status}), trying fallback...`);
          continue;
        }

        if (res.status === 404) {
          // Model not found in this region/key: try next model
          continue;
        }

        // Invalid key (400 or 401 or 403): break out of this key's model loop immediately and try next key
        if (res.status === 400 || res.status === 401 || res.status === 403) {
          console.warn(`[Gemini Pool] Key ${maskedKey} rejected with HTTP ${res.status}. Switching to next key.`);
          break;
        }
      } catch (networkErr: unknown) {
        console.warn(`[Gemini Pool] Network error with ${attemptLabel}:`, (networkErr as Error).message);
        continue;
      }
    }
  }

  return {
    success: false,
    text: "",
    usedModel: "",
    usedKeyMasked: "",
    triedAttempts,
    tokensUsedEstimate: 0,
    error: `Semua ${keys.length} API Key dan ${modelChain.length} model dalam rantai fallback gagal atau kehabisan kuota harian. Detail percobaan: ${triedAttempts.join(", ")}`,
  };
}
