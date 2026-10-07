import { NextRequest, NextResponse } from "next/server";
import { getHandler } from "@/lib/tools";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { LlmError } from "@/lib/llm";

export const runtime = "nodejs";
export const maxDuration = 120;

/**
 * Unified AI-tool dispatcher — the headless equivalent of admin-ajax.php.
 * Body: { action: string, data: Record<string, unknown>, recaptchaToken?: string }
 * Returns: { success: true, data } | { success: false, error }
 */
export async function POST(request: NextRequest) {
  let body: { action?: string; data?: Record<string, unknown>; recaptchaToken?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request body." }, { status: 400 });
  }

  const action = typeof body.action === "string" ? body.action : "";
  const handler = getHandler(action);
  if (!handler) {
    return NextResponse.json({ success: false, error: "Unknown tool action." }, { status: 404 });
  }

  // reCAPTCHA v3 (fail-open per server config — see lib/recaptcha.ts)
  const human = await verifyRecaptcha(body.recaptchaToken, action);
  if (!human) {
    return NextResponse.json(
      { success: false, error: "Verification failed. Please refresh and try again." },
      { status: 403 }
    );
  }

  const data = (body.data && typeof body.data === "object" ? body.data : {}) as Record<string, unknown>;
  const validation = handler.validate(data);
  if (!validation.ok) {
    return NextResponse.json({ success: false, error: validation.error }, { status: 422 });
  }

  try {
    const result = await handler.run(validation.input);
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    const message =
      err instanceof LlmError
        ? "The AI service is busy right now. Please try again in a moment."
        : "Something went wrong generating your result. Please try again.";
    console.error(`[ai:${action}]`, err);
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}
