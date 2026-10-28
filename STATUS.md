# TEFL.ai Next.js — Build Status & Audit

_Last audit: 2026-10-28 · Live (staging): https://next.tefl.ai · Repo: goappycodes/tefl-ai (main) · Vercel: tefl-ai (team appycodes)_

## Architecture (recap)
Headless: **Next.js (next.tefl.ai) = front-end**, **WordPress (tefl.ai) = backend** for blog/content (WP REST), commerce + LMS (WooCommerce/LearnDash), auth, and certificates. AI tools run as Next API routes → **OpenRouter** (keys in Vercel env). Commerce/courses hand off to the WP host via `NEXT_PUBLIC_CHECKOUT_BASE_URL`.

---

## ✅ Done & live
- **Design system** — dark, AI-forward; cyan→blue→violet gradient, green accent for jobs/experienced path, aurora + grid motion, sparkle motif, WP favicon.
- **Homepage** — hero, how-it-helps, featured tools, courses, stats, about, testimonials, FAQ, CTA.
- **15 AI tools** — each a faithful OpenRouter port of the WP handler. Every tool now = **SEO landing (`/{slug}`)** + **interactive tool (`/{slug}/tool`)**, single-column layout, result below form, scroll-to-result. reCAPTCHA v3 (fail-open), verified generating end-to-end.
- **Content pages** — AI Tools overview, Courses catalogue (links into WP enrolment), Blog (headless WP + post pages via root catch-all), Contact (CF7 REST), Certificate verification ×2 (WP `/me`-style endpoint), AI-Skilled Certificate, Survey, Terms (extracted from WP template), Privacy + Future-of-AI Report (full WP content, no email gate), 404, sitemap, robots.
- **Footer** — "The Hire Wire" MailerLite newsletter; social links removed; accreditation badges.
- **Infra** — Vercel project, all env vars set (secrets as sensitive), GitHub auto-deploy on push to main, `next.tefl.ai` public domain, WP mu-plugin (`teflai-rest.php`) for cert verification + `/me` session.
- **UX** — clear option selection, pointer cursors, fullscreen mobile menu, readable blog content on dark theme, header reflects WP login state (when same cookie context), reset ("New") scrolls back to the form top.
- **Performance / AI-SEO** — `inlineCss` + `optimizePackageImports` (framer-motion, lucide) and LCP-safe hero for faster first paint; `llms.txt` added for AI crawlers.

---

## 🔧 Pending — prioritized

### P0 — before production cutover (parity / launch)
1. **Analytics & Search Console** — NONE in the Next app yet. WP had Google Tag Manager, Ahrefs Analytics, and a Google site-verification meta. Add GTM, Ahrefs, and verification (per-domain) or tracking/SEO data is lost at cutover.
2. **Commerce/auth path redirects** — add Next redirects → WP host for `/cart`, `/checkout`, `/my-account`, `/registration`, `/registration-success`, `/reset-password` (today only `/shop`, `/profile`, `/home`, `/courses/:slug` are handled). Without these, those paths hit the catch-all and render empty once Next is the origin.
3. **reCAPTCHA domain** — `RECAPTCHA_ENFORCE` is currently `false` on Vercel so tools work on `next.tefl.ai`. Add `next.tefl.ai` (and `tefl.ai`) to the reCAPTCHA v3 key, then flip `ENFORCE=true`. _(User action in Google reCAPTCHA admin.)_
4. **WP "Redirection" plugin rules** — the live site has custom SEO redirects (Redirection plugin). Export and port into `next.config.ts` to preserve old-URL SEO.

### P1 — quality / fidelity
5. **PDF / Word downloads** — WP tools (esp. CV & Cover Letter, Lesson Plan) offered PDF/DOCX export; Next tools currently do Copy + browser Print only. Add real PDF/DOCX generation.
6. **Blog taxonomy pages** — only `/blog` + single posts exist. Category/tag/author archives aren't rebuilt (minor SEO).
7. **`/tool` hero trim** — the full marketing hero repeats on the interactive `/tool` page; tighten it so users land closer to the form.
8. **Logged-in header across subdomains** — `/me` endpoint + HeaderAuth are built, but `next.tefl.ai` ≠ `tefl.ai` means WP cookies aren't sent cross-subdomain. To activate: set WP auth cookies `domain=.tefl.ai; SameSite=None; Secure`, or cut `tefl.ai` over to Next with a `/wp-json` proxy.

### P2 — nice-to-have
9. **Per-page OG/social images** (currently text-only OG metadata).
10. **API token/cost tracking dashboard** (WP had one; OpenRouter dashboard covers most of it).
11. **Email lead-capture** on tools (WP captured some via Zapier/MailerLite) — only if lead-gen is wanted.
12. **Automated tests + Lighthouse/a11y pass.**

---

## 👤 Needs you / infra decisions
- **reCAPTCHA**: add the domain(s) to the key, then we flip `ENFORCE=true`.
- **Deployment Protection**: SSO is on for `*.vercel.app`; `next.tefl.ai` (custom domain) is public. Confirm that's intended.
- **Domain plan**: keep `next.tefl.ai` as staging, or cut `tefl.ai` → Next? And when does WooCommerce move to `shop.tefl.ai` (then update `NEXT_PUBLIC_CHECKOUT_BASE_URL`)?
- **Logged-in header**: decide the cookie/proxy approach above if you want it live pre-cutover.

---

## Suggested next sprint
1. Add **GTM + Ahrefs + Search Console verification** (P0-1).
2. Add the **commerce/auth → WP redirects** (P0-2).
3. Port **WP Redirection rules** (P0-4).
4. Add **PDF/DOCX downloads** to the tools (P1-5).
5. Trim the **/tool hero** (P1-7).
Then: reCAPTCHA enable (after you add the domain) and the logged-in-header cookie wiring.
