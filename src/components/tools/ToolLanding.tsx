import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Sparkle } from "@/components/ui/Sparkle";
import { ToolCard } from "@/components/ui/ToolCard";
import { FaqList } from "@/components/ui/FaqList";
import { TOOLS, type AiTool } from "@/lib/site";
import type { ToolLandingContent } from "@/content/tools/types";

export function ToolLanding({
  content,
  tool,
}: {
  content: ToolLandingContent;
  tool: AiTool;
}) {
  const toolHref = `/${content.slug}/tool`;
  const related = TOOLS.filter((t) => t.slug !== tool.slug && t.group === tool.group);
  const show = (related.length ? related : TOOLS.filter((t) => t.slug !== tool.slug)).slice(0, 3);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* HERO — primary CTA up top */}
      <section className="relative overflow-hidden pt-28 md:pt-36">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-10 -z-10 h-[440px] w-[560px] max-w-[92vw] -translate-x-1/2 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(58,208,248,0.2), rgba(139,116,255,0.13) 45%, transparent 70%)",
          }}
        />
        <Sparkle size={24} className="absolute left-[9%] top-28 animate-float opacity-60" />
        <Sparkle size={18} className="absolute right-[12%] top-40 animate-float opacity-40" />

        <div className="container-tai text-center">
          <span className="chip mx-auto rise">
            <DynamicIcon name={tool.icon} className="h-4 w-4" />
            {content.badge || tool.short}
          </span>
          <h1
            className="rise mx-auto mt-6 max-w-4xl text-balance text-4xl font-bold leading-[1.06] md:text-6xl"
            style={{ animationDelay: "0.05s" }}
          >
            {content.heroTitle}
          </h1>
          {content.heroSubtitle && (
            <p
              className="rise mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-[var(--color-muted)] md:text-lg"
              style={{ animationDelay: "0.12s" }}
            >
              {content.heroSubtitle}
            </p>
          )}
          <div
            className="rise mt-9 flex flex-wrap items-center justify-center gap-3"
            style={{ animationDelay: "0.2s" }}
          >
            <Link href={toolHref} className="btn btn-primary !px-7 !py-3.5 text-base">
              {content.ctaLabel} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="#how-it-works" className="btn btn-ghost">
              How it works
            </Link>
          </div>
          {content.poweredBy && (
            <p className="mt-6 flex items-center justify-center gap-2 text-sm text-[var(--color-faint)]">
              <Sparkles className="h-4 w-4 text-[var(--color-accent)]" /> {content.poweredBy}
            </p>
          )}
        </div>
      </section>

      {/* FEATURES */}
      <section id="how-it-works" className="container-tai mt-24 scroll-mt-24">
        <div className="grid gap-5 md:grid-cols-3">
          {content.features.map((f) => (
            <div key={f.title} className="surface-card ring-card p-7">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--brand-gradient-soft)] text-[var(--color-accent)]">
                <DynamicIcon name={f.icon} className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-[var(--color-ink)]">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      {content.about && (
        <section className="container-tai mt-24">
          <div className="surface-card grid items-center gap-10 overflow-hidden rounded-[var(--radius-xl)] p-8 md:p-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <SectionHeading
                eyebrow={content.about.eyebrow || "About"}
                title={content.about.title}
              />
              <div className="mt-6 space-y-4">
                {content.about.paragraphs.map((p, i) => (
                  <p key={i} className="text-sm leading-relaxed text-[var(--color-muted)]">
                    {p}
                  </p>
                ))}
              </div>
              {content.about.bullets && content.about.bullets.length > 0 && (
                <ul className="mt-6 space-y-2.5">
                  {content.about.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-[var(--color-muted)]">
                      <Check className="mt-0.5 h-4 w-4 flex-none text-[var(--color-success)]" /> {b}
                    </li>
                  ))}
                </ul>
              )}
              <Link href={toolHref} className="btn btn-primary mt-8">
                {content.ctaLabel} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-[var(--brand-gradient-soft)] blur-3xl" />
              <div className="surface-glass relative grid aspect-square w-full max-w-sm place-items-center rounded-[var(--radius-xl)] p-10">
                <DynamicIcon name={tool.icon} className="h-20 w-20 text-[var(--color-accent)]" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* MID CTA band */}
      <section className="container-tai mt-24">
        <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[rgba(58,208,248,0.25)] p-10 text-center md:p-16">
          <div className="absolute inset-0 -z-10 bg-[var(--brand-gradient-soft)]" />
          <Sparkle size={36} className="mx-auto" />
          <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-bold md:text-4xl">
            {content.tryTitle || `Try the ${tool.short}`}
          </h2>
          {content.tryText && (
            <p className="mx-auto mt-4 max-w-xl text-[var(--color-muted)]">{content.tryText}</p>
          )}
          <Link href={toolHref} className="btn btn-primary mt-8 !px-7 !py-3.5 text-base">
            {content.tryCtaLabel || content.ctaLabel} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-tai mt-24">
        <SectionHeading center eyebrow="FAQ" title="Frequently asked questions" />
        <div className="mt-10">
          <FaqList faqs={content.faqs} />
        </div>
      </section>

      {/* GUIDANCE */}
      {content.guidance && (
        <section className="container-tai mt-20">
          <div className="surface-card flex flex-col items-center gap-5 rounded-[var(--radius-xl)] p-8 text-center md:p-12">
            <span className="eyebrow flex">
              <Sparkle size={14} /> {content.guidance.eyebrow || "Get professional help"}
            </span>
            <h2 className="max-w-2xl text-2xl font-bold md:text-3xl">{content.guidance.title}</h2>
            <p className="max-w-xl text-[var(--color-muted)]">{content.guidance.text}</p>
            <a
              href={content.guidance.href}
              className="btn btn-primary"
              {...(content.guidance.href.startsWith("http")
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {content.guidance.ctaLabel} <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>
      )}

      {/* RELATED */}
      <section className="container-tai mt-24">
        <h2 className="text-2xl font-semibold">More free AI tools</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {show.map((t) => (
            <ToolCard key={t.slug} tool={t} />
          ))}
        </div>
      </section>
    </>
  );
}
