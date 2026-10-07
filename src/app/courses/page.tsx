import type { Metadata } from "next";
import Link from "next/link";
import { Award, Check, Sparkles, ShieldCheck } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CourseCard } from "@/components/ui/CourseCard";
import { Sparkle } from "@/components/ui/Sparkle";
import { COURSES } from "@/content/courses";

export const metadata: Metadata = {
  title: "Accredited TEFL Courses",
  description:
    "Ofqual-regulated, Highfield Approved and OTCAC accredited TEFL courses — from the flagship 120 Hour Advanced TEFL to specialist AI and travel-creator certifications.",
  alternates: { canonical: "/courses" },
};

const WHY = [
  { icon: "Award", title: "Internationally recognised", text: "Ofqual-regulated, Highfield Approved (Centre 21335) and OTCAC accredited." },
  { icon: "Sparkles", title: "Future-ready skills", text: "Learn to teach with AI — the skills schools are now shortlisting for." },
  { icon: "ShieldCheck", title: "Trusted since 2017", text: "Part of the TEFL Institute Group, a leader in teacher training." },
];

export default function CoursesPage() {
  return (
    <>
      <section className="relative overflow-hidden pt-28 md:pt-36">
        <Sparkle size={24} className="absolute left-[10%] top-28 animate-float opacity-60" />
        <div className="container-tai text-center">
          <span className="chip mx-auto"><Award className="h-4 w-4 text-[var(--color-accent)]" /> Accredited & internationally recognised</span>
          <h1 className="mx-auto mt-6 max-w-3xl text-balance text-4xl font-bold leading-[1.05] md:text-6xl">
            Get certified, <span className="text-gradient">get hired</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-[var(--color-muted)] md:text-lg">
            Career-ready TEFL certifications from €69 — including our flagship 120 Hour
            Advanced TEFL. 100% online, self-paced, and recognised worldwide.
          </p>
        </div>
      </section>

      <section className="container-tai mt-14">
        <div className="grid gap-6 lg:grid-cols-3">
          {COURSES.map((c) => (
            <CourseCard key={c.slug} course={c} />
          ))}
        </div>
      </section>

      <section className="container-tai mt-24">
        <SectionHeading center eyebrow="Why TEFL.ai" title="Certifications that open doors" />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {WHY.map((w) => (
            <div key={w.title} className="surface-card p-7 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--brand-gradient-soft)] text-[var(--color-accent)]">
                {w.icon === "Award" && <Award className="h-6 w-6" />}
                {w.icon === "Sparkles" && <Sparkles className="h-6 w-6" />}
                {w.icon === "ShieldCheck" && <ShieldCheck className="h-6 w-6" />}
              </span>
              <h3 className="mt-5 font-semibold">{w.title}</h3>
              <p className="mt-2 text-sm text-[var(--color-muted)]">{w.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-tai mt-24">
        <div className="surface-card rounded-[var(--radius-xl)] p-8 md:p-12">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-semibold md:text-3xl">Not sure which course is right for you?</h2>
              <p className="mt-4 text-sm leading-relaxed text-[var(--color-muted)]">
                Our free AI Course Finder asks a few quick questions and recommends the
                best-fit certification for your goals, budget and timeline.
              </p>
              <Link href="/tefl-course-finder" className="btn btn-primary mt-6">
                Try the Course Finder <Sparkles className="h-4 w-4" />
              </Link>
            </div>
            <ul className="space-y-3 self-center">
              {["Ofqual-regulated qualifications", "Lifetime certificate with verification", "Study online, at your own pace", "14-day money-back guarantee"].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-[var(--color-muted)]">
                  <Check className="mt-0.5 h-4 w-4 flex-none text-[var(--color-success)]" /> {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
