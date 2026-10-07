import "server-only";

/**
 * Google reCAPTCHA v3 server-side verification.
 * Mirrors the WordPress behaviour (includes/recaptcha.php):
 *  - Master switch RECAPTCHA_ENFORCE; when false, verification is a no-op.
 *  - FAIL-OPEN (return true) when: not enforced, no secret configured, Google
 *    unreachable, malformed response, or server config error — so the tools keep
 *    working during an outage instead of locking out every visitor.
 *  - FAIL-CLOSED (return false) when: no token, token invalid/expired, or score
 *    below RECAPTCHA_MIN_SCORE.
 */
export async function verifyRecaptcha(
  token: string | undefined | null,
  expectedAction = ""
): Promise<boolean> {
  const enforce = (process.env.RECAPTCHA_ENFORCE ?? "true").toLowerCase() !== "false";
  if (!enforce) return true;

  const secret = process.env.RECAPTCHA_SECRET_KEY || "";
  if (!secret) return true; // not configured -> don't block

  if (!token) return false; // enforced + configured but no token -> bot

  const minScore = parseFloat(process.env.RECAPTCHA_MIN_SCORE || "0.5");

  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return true; // Google unreachable -> fail open

    const data = (await res.json()) as {
      success?: boolean;
      score?: number;
      action?: string;
      "error-codes"?: string[];
    };

    // Config errors (bad/missing secret) -> fail open, don't lock users out.
    const errs = data["error-codes"] || [];
    if (errs.includes("invalid-input-secret") || errs.includes("missing-input-secret")) {
      return true;
    }

    if (data.success !== true) return false; // invalid/expired/used -> fail closed
    if (typeof data.score === "number" && data.score < minScore) return false;

    // Optional action binding (advisory; don't hard-fail on mismatch).
    void expectedAction;
    return true;
  } catch {
    return true; // network/timeout -> fail open
  }
}
