/** LLM model + provider config — mirrors wp-config.php / functions.php defaults.
 *  All server-only. Overridable via Vercel env vars. */

export const LLM = {
  base: process.env.LLM_API_BASE || "https://openrouter.ai/api/v1",
  key: process.env.LLM_API_KEY || "",
  models: {
    small: process.env.LLM_MODEL_SMALL || "openai/gpt-4o-mini",
    large: process.env.LLM_MODEL_LARGE || "openai/gpt-4o",
    lesson: process.env.LLM_MODEL_LESSON || "google/gemini-3.5-flash-lite",
    grader: process.env.LLM_MODEL_GRADER || "google/gemini-3.5-flash-lite",
    country: process.env.LLM_MODEL_COUNTRY || process.env.LLM_MODEL_LARGE || "openai/gpt-4o",
    elt: process.env.LLM_MODEL_ELT || "google/gemini-3.5-flash-lite",
  },
  audio: {
    mode: process.env.LLM_AUDIO_MODE || "openrouter_multimodal",
    model: process.env.LLM_AUDIO_OR_MODEL || "google/gemini-3.5-flash",
  },
  // Sent to OpenRouter for dashboards/rankings (optional, harmless defaults)
  referer: process.env.OPENROUTER_SITE_URL || "https://tefl.ai",
  appName: process.env.OPENROUTER_APP_NAME || "TEFL.ai",
} as const;
