import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Sparkles, Wand2, FileCheck, Award, ShieldCheck } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Sparkle } from "@/components/ui/Sparkle";

export const metadata: Metadata = {
  title: "AI-Skilled Teacher Certificate",
  description:
    "Schools now shortlist for AI skills. Use TEFL.ai's free AI tools and earn the free AI-Skilled Teacher Certificate — proof of AI competency for your teaching CV.",
  alternates: { canonical: "/ai-skilled-teacher-certificate" },
};

const STEPS = [
  { icon: Wand2, title: "Use the AI tools", text: "Plan lessons, grade writing, adapt materials and more with our free AI tools." },
  { icon: FileCheck, title: "Demonstrate your skills", text: "Each tool you use builds practical, classroom-ready AI competency." },
  { icon: Award, title: "Earn your certificate", text: "Claim your free AI-Skilled Teacher Certificate — evidence for your CV." },
];

const BENEFITS = [
  "Stand out to schools shortlisting for AI skills",
  "Add verifiable AI competency to your teaching CV",
  "100% free — no catch, no subscription",
  "Shareable, verifiable certificate with a unique number",
];

export default function AiSkilledTeacherCertificatePage() {
  return (
    <>
      <section className="relative overflow-hidden pt-28 md:pt-36">
        <Sparkle size={26} className="absolute left-[9%] top-28 animate-float opacity-60" />
        <Sparkle size={18} className="absolute right-[13%] top-40 animate-float opacity-40" />
        <div className="container-tai text-center">
          <span className="chip mx-auto"><BadgeCheck className="h-4 w-4 text-[var(--color-accent)]" /> Free · AI-Skilled Teacher Certificate</span>
          <h1 className="mx-auto mt-6 max-w-3xl text-balance text-4xl font-bold leading-[1.05] md:text-6xl">
            Turn your AI skills into a <span className="text-gradient">certificate</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-[var(--color-muted)] md:text-lg">
            Schools now shortlist for AI skills. Every tool you use on TEFL.ai is evidence
            for your CV — earn the free AI-Skilled Teacher Certificate to prove it.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/ai-tool-overview" className="btn btn-primary">
              Start with the AI tools <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/verify-ai-teacher-certificate" className="btn btn-ghost">
              Verify a certificate
            </Link>
          </div>
        </div>
      </section>

      <section className="container-tai mt-24">
        <SectionHeading center eyebrow="How it works" title="Three steps to your certificate" />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="surface-card ring-card relative p-7">
              <span className="absolute right-6 top-6 text-5xl font-bold text-white/5">{i + 1}</span>
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--brand-gradient-soft)] text-[var(--color-accent)]">
                <s.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-tai mt-24">
        <div className="surface-card grid items-center gap-10 rounded-[var(--radius-xl)] p-8 md:p-12 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Why it matters" title="Proof of the skills schools want" />
            <ul className="mt-6 space-y-3">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm text-[var(--color-muted)]">
                  <ShieldCheck className="mt-0.5 h-4 w-4 flex-none text-[var(--color-success)]" /> {b}
                </li>
              ))}
            </ul>
            <Link href="/ai-tool-overview" className="btn btn-primary mt-8">
              Explore the tools <Sparkles className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-[var(--brand-gradient-soft)] blur-3xl" />
            <div className="surface-glass relative flex aspect-[4/3] w-full flex-col items-center justify-center gap-4 rounded-[var(--radius-xl)] p-10 text-center">
              <Award className="h-12 w-12 text-[var(--color-accent)]" />
              <p className="text-lg font-semibold">AI-Skilled Teacher</p>
              <p className="text-sm text-[var(--color-muted)]">Certificate of AI Competency</p>
              <span className="mt-2 rounded-full bg-white/5 px-3 py-1 font-mono text-xs text-[var(--color-faint)]">
                TEFL-2026-XXXXX
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
