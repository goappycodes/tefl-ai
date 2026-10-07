"use client";

/** Lazy-load Google reCAPTCHA v3 and resolve a token for an action.
 *  Always resolves (never rejects): an empty string means reCAPTCHA is
 *  unavailable, and the server decides how to handle a missing token
 *  (fail-open per lib/recaptcha.ts). Mirrors TeflAI.getRecaptchaToken. */

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

let scriptPromise: Promise<void> | null = null;

function loadScript(siteKey: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.grecaptcha?.execute) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve) => {
    const s = document.createElement("script");
    s.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => resolve();
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export async function getRecaptchaToken(action = "submit"): Promise<string> {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";
  if (!siteKey) return "";
  const safeAction = action.replace(/[^a-zA-Z0-9_]/g, "_");
  try {
    await loadScript(siteKey);
    if (!window.grecaptcha?.execute) return "";
    return await new Promise<string>((resolve) => {
      const timeout = setTimeout(() => resolve(""), 8000);
      window.grecaptcha!.ready(() => {
        window
          .grecaptcha!.execute(siteKey, { action: safeAction })
          .then((t) => {
            clearTimeout(timeout);
            resolve(t || "");
          })
          .catch(() => {
            clearTimeout(timeout);
            resolve("");
          });
      });
    });
  } catch {
    return "";
  }
}
