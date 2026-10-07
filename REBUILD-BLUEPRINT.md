# TEFL.ai — Next.js Rebuild Blueprint

> Discovery completed 2026-10-07 against the live WordPress install at
> `/home/teflai.coming-soon.xyz/public_html` (CyberPanel/LiteSpeed, DigitalOcean).
> Goal: rebuild the entire site in **Next.js on Vercel** with a completely reimagined,
> modern UI/UX — while retaining the **exact same pages, URLs, functionality, forms,
> results, and handling**. Same logo.

---

## 1. Current stack (what exists today)

| Layer | Technology |
|---|---|
| CMS | WordPress 7.1.3 |
| Theme | `tefl-ai` child theme of **Astra** 4.8.9 |
| LMS | **LearnDash** (`sfwd-lms` 5.1.8) + gradebook, certificate builder, verify/share, WooCommerce integration |
| Commerce | **WooCommerce** 10.9.4, **Stripe** (`woo-stripe-payment` 4.0.8), country-based pricing (`woocommerce-product-price-based-on-countries` 4.3.3), currency **EUR** |
| AI tools | Custom code in the child theme → **OpenAI** (`gpt-4o`, `gpt-4o-mini`, `whisper-1`); OpenRouter/Gemini migration pre-staged |
| Forms | Contact Form 7 (Contact, Footer Newsletter, Job Explorer) |
| Email capture | MailerLite |
| SEO | Rank Math + Redirection plugin |
| Analytics | Google Tag Manager, Ahrefs, Google site verification |
| Certificates | Custom plugin `tefl-ai-certificate` 2.1.0 (+ LearnDash cert verify/share) |
| Other plugins | `royal-mcp` (third-party MCP/security suite — not frontend), `tefl-ai-asset-restore`, H5P, UpdraftPlus (backups), WP Fastest Cache, WP Mail SMTP Pro |

**Content volume:** 38 pages · 62 blog posts · 3 WooCommerce products · 3 LearnDash courses · 117 media attachments.

> Security note: the site had a malware/SEO-cloaking injection cleaned ~2026-09-16
> (quarantine dir + `.htaccess` cloak backups + Imunify). `wp-file-manager` (known RCE
> vector) was **deleted on 2026-10-07** per request.

---

## 2. Complete page/URL inventory (must be preserved 1:1)

Permalink structure: `/%postname%/`. Front page = page 144 ("Homepage Redesigned") at `/`.

### Marketing / core
| URL | Purpose |
|---|---|
| `/` | Homepage (redesigned) |
| `/home/` | Legacy homepage (page 2) |
| `/ai-tool-overview/` | Index of all free AI tools |
| `/contact/` | Contact (CF7) |
| `/blog/` | Blog index (62 posts) |
| `/terms-and-conditions/`, `/privacy-policy/`, `/refund_returns/` (draft) | Legal |
| `/future-of-ai-report/` | Lead-gen report |
| `/survey/` | TEFL AI Adoption Survey |

### Free AI tools (the crown jewels — each = page + JS + CSS + OpenAI-backed endpoint)
| URL | Tool | AJAX action |
|---|---|---|
| `/tefl-jobs/` | Job Market Explorer | `get_job_market_data` |
| `/job-readiness-checker/` | Job Readiness Checker | `get_job_readiness_feedback` |
| `/english-level-test/` | English Level Test | `process_english_level_test` (+ `get_tefl_elt_questions` gen) |
| `/lesson-plan-generator/` | Lesson Plan Generator | `generate_lesson_plan` |
| `/tefl-course-finder/` | TEFL Course Finder | (course finder logic) |
| `/ai-ielts-writing-band-estimator/` | IELTS Writing Band Estimator | `estimate_ielts_band` |
| `/ai-ielts-speaking-band-estimator/` | IELTS Speaking Band Estimator | `estimate_ielts_speaking_band` (audio → Whisper) |
| `/speaking-band-estimator/` | Speaking Band Estimator | (speaking band) |
| `/ai-materials-adaptor/` | AI Materials Adaptor | `generate_adapted_material` |
| `/cefr-writing-grader/` | CEFR Writing Grader | `grade_cefr_writing` |
| `/cv-and-cover-letter-generator/` | CV & Cover Letter Generator | `generate_cv_cl` |
| `/travel-vlog-scriptwriter/` | Travel Vlog Scriptwriter | `generate_vlog_script` |
| `/career-roadmap/` | Career Roadmap | `generate_career_roadmap` |
| `/earning-projection/` | Earning Projection | `generate_earning_projection` |
| `/country-eligibility/` | Country Eligibility | `generate_country_eligibility` |

### Commerce + LMS + account (WooCommerce/LearnDash)
| URL | Purpose | Notes |
|---|---|---|
| `/courses/` | Course catalogue | LearnDash archive |
| `/courses/120-hour-accredited-tefl-course/` | Course (product 681, "120 TEFL.ai") | |
| `/courses/travel-influencer/` | Course (product 2156) | |
| `/courses/generative-ai/` | Course (product 2157) | |
| `/shop/` | → **301 redirect to `/courses/`** | |
| `/cart/` | → **redirects to checkout** when non-empty | |
| `/checkout/` | WooCommerce + Stripe checkout | custom field layout, trust row, 14-day guarantee |
| `/my-account/` | Account dashboard | WooCommerce dashboard **replaced** with LearnDash profile (`[ld_profile]`); menu trimmed to Dashboard / Account details / Logout |
| `/profile/` | → **301 redirect to `/my-account/`** | |
| `/registration/`, `/registration-success/` | LearnDash registration (marketing opt-in, privacy text) | |
| `/reset-password/` | Custom lost-password URL | |

### Certificates
| URL | Purpose |
|---|---|
| `/ai-skilled-teacher-certificate/` | AI-Skilled Teacher Certificate landing |
| `/verify-ai-teacher-certificate/` | Verify a certificate |
| `/certificate-verification/` | Certificate verification (AJAX `verify_certificate`, format `TEFL-YYYY-XXXXX`) |

---

## 3. AI tools — technical contract (identical behavior required)

**Flow:** page template renders form → per-tool JS (`assets/js/ai-*.js`) validates and
submits via `admin-ajax.php` → PHP handler (`includes/api_*.php`) builds a tool-specific
prompt → calls OpenAI Chat Completions (or Whisper for audio) → returns JSON → JS renders
the result (often with a modal, copy/download, email-gate).

**Shared JS modules:** `ai-utils.js`, `ai-validation.js`, `ai-modals.js`, `ai-form-handler.js`, `ai-main.js`.

**Cross-cutting concerns to replicate:**
- **reCAPTCHA v3** server-side verification, **fail-open** (never blocks on outage); token via `recaptcha_token`. Min score 0.5. Master switch `RECAPTCHA_ENFORCE`.
- **Token/cost tracking** per call (`openAI_api_token_tracker.php`) → admin view (`tefl_api_token_ajax`).
- **Models:** small=`gpt-4o-mini`, large=`gpt-4o`, ELT questions currently routed to a Gemini-flash model; audio=`whisper-1`.
- Nonce: `teflai_job_market_nonce` localized as `teflai_obj` (ajax url, nonce, recaptcha site key).
- Likely result caching + email capture gating (to confirm per tool during build).

**Keys (today in `wp-config.php`, to move to Vercel env):**
`CHAT_GPT_API_KEY` (OpenAI), reCAPTCHA site/secret (from CF7 or `RECAPTCHA_*`), Stripe keys, MailerLite, SMTP.

---

## 4. Theme behaviors to preserve (from functions.php)

- `/shop/` → `/courses/` (301); `/profile/` → `/my-account/` (301); `/cart/` → checkout when non-empty.
- Checkout: address fields hidden (digital products), labels → placeholders, field priority order, "Secure Stripe / 14-day guarantee / instant certificate" trust row.
- My-account dashboard replaced with LearnDash student dashboard (enrolled/completed/certificates stats + `[ld_profile]`).
- Subscriber login → `/courses/`.
- Registration: marketing opt-in checkbox + privacy text + data-security notice.
- EUR currency symbol `€`.
- Author avatars served from `/wp-content/uploads/authors/avatar-{firstname}.jpg`.
- "Busy-site" social proof: animated enrollment toasts (fabricated roster), count-up stats, accreditation strip (**Highfield Approved Centre 21335**, **OTCAC 20260330**). *(Marketing/social-proof feature — reproduce as-is per "exact functionality"; flagged for awareness.)*
- SVG uploads allowed; CF7 autop disabled.
- Analytics: GTM, Ahrefs (`data-key ZWjJhGe00N+ok4uLwNDeaQ`), Google site verification meta.

---

## 5. Open architectural decision (blocks commerce/LMS/auth path)

The **AI tools, blog, and all marketing/content pages** will be rebuilt from scratch in
Next.js regardless — that's clean and safe.

The fork is **commerce + LMS + user accounts + certificates** (real payments, real student
course access, real logins). Two paths — see chat for the decision.
