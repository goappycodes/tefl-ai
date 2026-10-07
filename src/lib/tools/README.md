# AI Tool build spec (follow exactly)

Every AI tool is a faithful port of its WordPress `api_*.php` handler + `ai-*.js`
frontend. Preserve **inputs, prompt text, model, temperature, and output shape**.
Reimagine only the UI (match the look of the reference tool).

## Reference implementation (copy this pattern)
- Handler:   `src/lib/tools/lesson-plan-generator.ts`
- Client UI: `src/components/tools/clients/LessonPlanTool.tsx`
- Page:      `src/app/(tools)/lesson-plan-generator/page.tsx`

## Framework you MUST reuse (do not recreate)
- `src/lib/llm.ts` — `chat({ model, messages, temperature, json })` → returns string; `extractJson(raw)`; `LlmError`.
- `src/lib/models.ts` — `LLM.models.{small,large,lesson,grader,country,elt}`, `LLM.audio`.
- `src/lib/tools/types.ts` — `ToolHandler`, `ValidateResult`, `str()`, `req()`.
- `src/lib/useAiTool.ts` — client hook `useAiTool<T>(action)` → `{ submit, loading, error, data, reset }`.
- `src/components/tools/ToolShell.tsx` — page hero + related tools wrapper.
- `src/components/tools/ResultActions.tsx` — copy / print / reset buttons.
- `src/components/ui/form.tsx` — `Field, TextInput, TextArea, Select, RadioCards, SubmitButton`.
- `src/lib/toolMeta.ts` — `toolMetadata(slug)` for page metadata.
- `src/lib/site.ts` — `toolBySlug(slug)` (the TOOLS registry already has every tool).

## Model mapping (from functions.php / wp-config)
- Default text tools → `LLM.models.large` (openai/gpt-4o)
- `generate_lesson_plan` → `LLM.models.lesson`
- `grade_cefr_writing` → `LLM.models.grader`
- `generate_country_eligibility` → `LLM.models.country`
- Read each `api_*.php` for `LLM_MODEL_*` usage and match it.

## Model constant → env mapping
`LLM_MODEL_LESSON`→lesson, `LLM_MODEL_GRADER`→grader, `LLM_MODEL_LARGE`→large,
`LLM_MODEL_SMALL`→small, `LLM_MODEL_COUNTRY`→country. If a handler uses plain
`LLM_MODEL_LARGE`, use `LLM.models.large`.

## Per-tool deliverables
1. `src/lib/tools/{slug}.ts` — exports a `ToolHandler` named in camelCase (e.g. `countryEligibility`).
   - `action` = the exact wp_ajax action name.
   - `validate(body)` — body is the raw field object; validate required fields (match the JS `requiredFields`), return `{ ok, input }` or `{ ok:false, error }`.
   - `run(input)` — build the SAME system/user prompt as the PHP, call `chat()` with the SAME model + temperature, parse with `extractJson` if the PHP returns JSON. Return the SAME output shape the frontend JS consumes.
2. `src/components/tools/clients/{Name}Tool.tsx` — `"use client"`, uses `useAiTool`, renders the form (same fields/options as the WP template) and the result (same structure the WP `displayResults`/renderer produces). Match the reference's visual style.
3. `src/app/(tools)/{slug}/page.tsx` — server component:
   ```tsx
   import { toolBySlug } from "@/lib/site";
   import { toolMetadata } from "@/lib/toolMeta";
   import { ToolShell } from "@/components/tools/ToolShell";
   import { XyzTool } from "@/components/tools/clients/XyzTool";
   export const metadata = toolMetadata("{slug}");
   export default function Page() {
     const tool = toolBySlug("{slug}")!;
     return <ToolShell tool={tool}><XyzTool /></ToolShell>;
   }
   ```

## DO NOT
- Do NOT edit `src/lib/tools/index.ts` (the parent agent wires the registry).
- Do NOT edit `src/lib/site.ts`, `globals.css`, layout, header, or footer.
- Do NOT run the dev server, `npm`, or git.
- Do NOT invent fields/prompts — read the WP source and match it.

## WP source location (read-only reference)
`discovery/themes/tefl-ai/` →
- `includes/api_*.php` (handlers + prompts + models)
- `includes/ajax_functions.php` (dispatcher: input parsing + response shape; search your action)
- `assets/js/ai-*.js` (frontend: requiredFields + result rendering)
- `page-*.php` (form markup + field options)
Ignore all `*.bak-*` files.
