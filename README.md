# TEFL.ai — Next.js

A modern, reimagined front-end for [tefl.ai](https://tefl.ai) — accredited TEFL
courses plus a suite of **15 free, OpenRouter-powered AI tools** for English teachers.
Built with **Next.js (App Router) + TypeScript + Tailwind CSS v4**, deployed on **Vercel**.

> Full discovery notes and the architecture decision log are in
> [`REBUILD-BLUEPRINT.md`](./REBUILD-BLUEPRINT.md).

## Architecture

- **Headless WordPress** — the existing WordPress/WooCommerce/LearnDash install stays
  as the backend. Blog posts and content pages are pulled via the WP REST API
  (`src/lib/wp.ts`) and re-rendered with the new design. URLs are preserved 1:1.
- **Checkout hand-off** — "Enrol / Buy" sends users to the WooCommerce checkout via a
  single env var (`NEXT_PUBLIC_CHECKOUT_BASE_URL`). Flip it to `https://shop.tefl.ai`
  when WooCommerce moves to its own host — no code change.
- **AI tools** — each tool is a faithful port of its WordPress `api_*.php` handler
  (same inputs, prompts, model, output), reimplemented as a Next.js API route
  (`/api/ai`) that calls **OpenRouter** server-side. Keys never reach the browser.
- **reCAPTCHA v3** — enforced server-side (`src/lib/recaptcha.ts`), fail-open on outage.

## The 15 AI tools

Lesson Plan Generator · CEFR Writing Grader · IELTS Writing Band Estimator ·
IELTS Speaking Band Estimator · Speaking Band Estimator · Materials Adaptor ·
CV & Cover Letter Generator · Travel Vlog Scriptwriter · Career Roadmap ·
Earning Projection · Country Eligibility · TEFL Course Finder · English Level Test ·
Job Market Explorer · Job Readiness Checker.

Each lives in `src/lib/tools/*.ts` (server handler) + `src/components/tools/clients/*`
(UI) + `src/app/(tools)/<slug>/page.tsx` (page). The registry is `src/lib/tools/index.ts`.

## Environment variables

Copy `.env.example` → `.env.local` for local dev. In production, set these in
**Vercel → Project Settings → Environment Variables**. Never commit real values.

| Variable | Purpose |
|---|---|
| `LLM_API_BASE` | OpenRouter base — `https://openrouter.ai/api/v1` |
| `LLM_API_KEY` | OpenRouter API key (**secret**) |
| `LLM_MODEL_SMALL` / `_LARGE` / `_LESSON` / `_GRADER` | Model routing (mirrors wp-config) |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | reCAPTCHA v3 site key (public) |
| `RECAPTCHA_SECRET_KEY` | reCAPTCHA v3 secret (**secret**) |
| `RECAPTCHA_MIN_SCORE` / `RECAPTCHA_ENFORCE` | reCAPTCHA tuning |
| `WP_API_BASE` | Headless WordPress REST base — `https://tefl.ai/wp-json` |
| `NEXT_PUBLIC_CHECKOUT_BASE_URL` | WooCommerce checkout host (→ `shop.tefl.ai` later) |
| `MAILERLITE_API_KEY` / `MAILERLITE_GROUP_ID` | Newsletter (optional; falls back to the embedded form) |

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in the keys
npm run dev                  # http://localhost:3000
```

```bash
npm run build && npm start   # production build
```

## Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel, **Import** the repo (framework auto-detected as Next.js).
3. Add the environment variables above (mark the secrets as such).
4. Deploy. Point the `tefl.ai` domain at the Vercel project when ready to cut over.

## WordPress: certificate verification endpoint

Certificate verification (`/api/verify-certificate`) expects a small read-only WP REST
endpoint `teflai/v1/verify-certificate?number=TEFL-YYYY-XXXXX` that wraps the existing
LearnDash verification logic. A ready-to-drop mu-plugin is in
[`wordpress/teflai-rest.php`](./wordpress/teflai-rest.php) — copy it to
`wp-content/mu-plugins/` on the WordPress host. Until it's installed, the verifier
returns a graceful "not found".

---

Part of the TEFL Institute Group. Accredited by Highfield (Approved Centre 21335) and OTCAC.
