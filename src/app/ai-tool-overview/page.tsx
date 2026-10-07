import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ToolCard } from "@/components/ui/ToolCard";
import { Sparkle } from "@/components/ui/Sparkle";
import { TOOLS, toolsByGroup, GROUP_LABELS, type ToolGroup } from "@/lib/site";

export const metadata: Metadata = {
  title: "Free AI Tools for English Teachers",
  description:
    "Explore all of TEFL.ai's free AI tools for English teachers — lesson plans, IELTS & CEFR grading, career roadmaps, job insights, materials adaptation and more.",
  alternates: { canonical: "/ai-tool-overview" },
};

const GROUPS: ToolGroup[] = ["new-teachers", "experienced-teachers", "insights"];

const GROUP_BLURB: Record<ToolGroup, string> = {
  "new-teachers": "Just starting out? Find your course, check where you can teach, and plan your earnings.",
  "experienced-teachers": "Already teaching? Plan, grade and create in seconds — and level up your career.",
  insights: "Explore the market, check your readiness, and estimate speaking proficiency.",
};

export default function AiToolOverviewPage() {
  return (
    <>
      <section className="relative overflow-hidden pt-28 md:pt-36">
        <Sparkle size={24} className="absolute left-[10%] top-28 animate-float opacity-60" />
        <Sparkle size={18} className="absolute right-[14%] top-36 animate-float opacity-40" />
        <div className="container-tai text-center">
          <span className="chip mx-auto">
            <Sparkles className="h-4 w-4 text-[var(--color-accent)]" /> {TOOLS.length} free tools · no sign-up
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-balance text-4xl font-bold leading-[1.05] md:text-6xl">
            Free AI tools for <span className="text-gradient">English teachers</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-[var(--color-muted)] md:text-lg">
            Everything you need to plan lessons, assess students, and grow your TEFL
            career — powered by AI, free forever.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="#new-teachers" className="btn btn-primary">
              Explore tools <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/courses" className="btn btn-ghost">
              Get certified
            </Link>
          </div>
        </div>
      </section>

      {GROUPS.map((g) => (
        <section key={g} id={g} className="container-tai mt-24 scroll-mt-24">
          <SectionHeading eyebrow={GROUP_LABELS[g]} title={GROUP_LABELS[g]} subtitle={GROUP_BLURB[g]} />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {toolsByGroup(g).map((t) => (
              <ToolCard key={t.slug} tool={t} />
            ))}
          </div>
        </section>
      ))}

      <section className="container-tai mt-28">
        <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[rgba(58,208,248,0.25)] p-10 text-center md:p-16">
          <div className="absolute inset-0 -z-10 bg-[var(--brand-gradient-soft)]" />
          <Sparkle size={40} className="mx-auto" />
          <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-bold md:text-4xl">
            Turn your AI skills into a certificate
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[var(--color-muted)]">
            Schools now shortlist for AI skills. Every tool you use here is evidence
            for your CV — earn the free AI-Skilled Teacher Certificate.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/ai-skilled-teacher-certificate" className="btn btn-primary">
              Get the certificate <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
