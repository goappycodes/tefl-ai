import type { Metadata } from "next";
import { FileText, TrendingUp, Users, Lightbulb, Globe2 } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Sparkle } from "@/components/ui/Sparkle";
import { NewsletterForm } from "@/components/layout/NewsletterForm";

export const metadata: Metadata = {
  title: "The Future of AI in English Language Teaching",
  description:
    "Our report on the future of AI in English language teaching and TEFL — the trends, tools and skills shaping the next decade of teaching careers.",
  alternates: { canonical: "/future-of-ai-report" },
};

const THEMES = [
  { icon: TrendingUp, title: "The shift in hiring", text: "Why schools are starting to shortlist teachers for AI skills — and what that means for your CV." },
  { icon: Lightbulb, title: "AI in the classroom", text: "How teachers are using AI for planning, materials, feedback and assessment today." },
  { icon: Users, title: "The teacher's role", text: "What stays human: the skills that matter more, not less, in an AI-assisted classroom." },
  { icon: Globe2, title: "The global picture", text: "How adoption varies across regions and what it means for teaching abroad." },
];

export default function FutureOfAiReportPage() {
  return (
    <>
      <section className="relative overflow-hidden pt-28 md:pt-36">
        <Sparkle size={24} className="absolute left-[10%] top-28 animate-float opacity-60" />
        <div className="container-tai">
          <div className="grid items-center gap-12 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <span className="chip"><FileText className="h-4 w-4 text-[var(--color-accent)]" /> Free report</span>
              <h1 className="mt-6 max-w-2xl text-balance text-4xl font-bold leading-[1.05] md:text-6xl">
                The future of AI in <span className="text-gradient">English language teaching</span>
              </h1>
              <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-[var(--color-muted)] md:text-lg">
                The trends, tools and skills reshaping TEFL — and how teachers can stay
                ahead. Get the report straight to your inbox, free.
              </p>
              <div className="mt-8 max-w-md">
                <NewsletterForm />
                <p className="mt-2 text-xs text-[var(--color-faint)]">
                  We&apos;ll email you the report and occasional teaching tips. Unsubscribe anytime.
                </p>
              </div>
            </div>
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-[var(--brand-gradient-soft)] blur-3xl" />
              <div className="surface-glass relative flex aspect-[3/4] w-full max-w-xs flex-col justify-between rounded-[var(--radius-xl)] p-8">
                <div>
                  <Sparkle size={32} />
                  <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">TEFL.ai Report</p>
                  <h2 className="mt-2 text-2xl font-bold leading-tight">The Future of AI in ELT &amp; TEFL</h2>
                </div>
                <p className="text-sm text-[var(--color-faint)]">2026 edition</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-tai mt-24">
        <SectionHeading center eyebrow="Inside the report" title="What you'll learn" />
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {THEMES.map((t) => (
            <div key={t.title} className="surface-card ring-card flex gap-4 p-7">
              <span className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-[var(--brand-gradient-soft)] text-[var(--color-accent)]">
                <t.icon className="h-6 w-6" />
              </span>
              <div>
                <h3 className="font-semibold">{t.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">{t.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
