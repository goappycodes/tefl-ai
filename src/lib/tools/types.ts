/** Shared contract every AI tool handler implements. The API dispatcher
 *  (src/app/api/ai/route.ts) validates reCAPTCHA, then calls validate() + run().
 *  Each handler mirrors its WordPress api_*.php counterpart (same inputs,
 *  prompt, model and output shape). */

export type ValidateResult<T> =
  | { ok: true; input: T }
  | { ok: false; error: string };

export interface ToolHandler<TInput = unknown, TOutput = unknown> {
  /** Mirrors the WP wp_ajax action name. */
  action: string;
  /** URL slug of the tool page (for reference). */
  slug: string;
  validate: (body: Record<string, unknown>) => ValidateResult<TInput>;
  run: (input: TInput) => Promise<TOutput>;
}

export function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : v == null ? "" : String(v).trim();
}

export function req(
  body: Record<string, unknown>,
  fields: string[]
): string | null {
  for (const f of fields) {
    if (!str(body[f])) return `${f.replace(/_/g, " ")} is required`;
  }
  return null;
}
