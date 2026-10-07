import type { Metadata } from "next";
import { ClipboardList, Clock, Lock, BarChart3 } from "lucide-react";
import { Sparkle } from "@/components/ui/Sparkle";

export const metadata: Metadata = {
  title: "The TEFL AI Adoption Survey",
  description:
    "How are English teachers really using AI? Take our anonymous 4-minute survey — twelve questions, no email required. Results published free on TEFL.ai.",
  alternates: { canonical: "/survey" },
};

const SURVEY_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfLtM-WTO-ZoPxiPuSFLuU_DdMYZg9gOMKIZ-KcN7qM0WUcZw/viewform";

const FACTS = [
  { icon: Clock, title: "About 4 minutes", text: "Twelve quick questions — that's it." },
  { icon: Lock, title: "Completely anonymous", text: "No email address required. We never ask who you are." },
  { icon: BarChart3, title: "Results published free", text: "The findings will be shared openly on TEFL.ai." },
];

export default function SurveyPage() {
  return (
    <>
      <section className="relative overflow-hidden pt-28 md:pt-36">
        <Sparkle size={24} className="absolute right-[12%] top-28 animate-float opacity-50" />
        <div className="container-tai text-center">
          <span className="chip mx-auto"><ClipboardList className="h-4 w-4 text-[var(--color-accent)]" /> Teacher research</span>
          <h1 className="mx-auto mt-6 max-w-3xl text-balance text-4xl font-bold leading-[1.05] md:text-6xl">
            How are teachers really using <span className="text-gradient">AI?</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-[var(--color-muted)] md:text-lg">
            Help shape the biggest picture yet of AI in English language teaching. Twelve
            questions, about four minutes, no email address required.
          </p>
          <div className="mt-8">
            <a href={SURVEY_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              Take the survey
            </a>
          </div>
        </div>
      </section>

      <section className="container-tai mt-20">
        <div className="grid gap-5 md:grid-cols-3">
          {FACTS.map((f) => (
            <div key={f.title} className="surface-card p-7 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--brand-gradient-soft)] text-[var(--color-accent)]">
                <f.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-[var(--color-muted)]">{f.text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
