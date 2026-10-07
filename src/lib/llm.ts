import "server-only";
import { LLM } from "./models";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content:
    | string
    | Array<
        | { type: "text"; text: string }
        | { type: "image_url"; image_url: { url: string } }
        | { type: "input_audio"; input_audio: { data: string; format: string } }
      >;
}

export interface ChatOptions {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  /** Ask the model for strict JSON when supported. */
  json?: boolean;
  retries?: number;
}

export class LlmError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "LlmError";
  }
}

/**
 * Call the OpenRouter (OpenAI-compatible) chat completions endpoint.
 * Mirrors the WordPress handlers: Bearer LLM_API_KEY, {base}/chat/completions,
 * with retry/backoff on 429 and transient failures.
 */
export async function chat(opts: ChatOptions): Promise<string> {
  if (!LLM.key) {
    throw new LlmError("LLM_API_KEY is not configured", 500);
  }
  const body: Record<string, unknown> = {
    model: opts.model,
    messages: opts.messages,
    temperature: opts.temperature ?? 0.3,
  };
  if (opts.maxTokens) body.max_tokens = opts.maxTokens;
  if (opts.json) body.response_format = { type: "json_object" };

  const retries = opts.retries ?? 3;
  let lastErr: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${LLM.base}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${LLM.key}`,
          "HTTP-Referer": LLM.referer,
          "X-Title": LLM.appName,
        },
        body: JSON.stringify(body),
        // Tools can take a while; allow generous time.
        signal: AbortSignal.timeout(90_000),
      });

      if (res.status === 429 || res.status >= 500) {
        lastErr = new LlmError(`Upstream ${res.status}`, res.status);
        await sleep(1500 * (attempt + 1));
        continue;
      }
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new LlmError(`LLM request failed (${res.status}): ${txt.slice(0, 300)}`, res.status);
      }

      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = data?.choices?.[0]?.message?.content;
      if (typeof content !== "string" || content.length === 0) {
        lastErr = new LlmError("Empty response from model");
        await sleep(1200 * (attempt + 1));
        continue;
      }
      return content;
    } catch (err) {
      lastErr = err;
      // Retry on network/timeout; otherwise rethrow non-retryable.
      if (err instanceof LlmError && err.status && err.status < 500 && err.status !== 429) {
        throw err;
      }
      await sleep(1200 * (attempt + 1));
    }
  }
  throw lastErr instanceof Error ? lastErr : new LlmError("LLM request failed");
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Robustly extract a JSON object/array from a model response that may be
 *  wrapped in ```json fences or prose. */
export function extractJson<T = unknown>(raw: string): T {
  const cleaned = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // Find the first {...} or [...] block
    const match = cleaned.match(/[\{\[][\s\S]*[\}\]]/);
    if (match) {
      return JSON.parse(match[0]) as T;
    }
    throw new LlmError("Could not parse JSON from model response");
  }
}
