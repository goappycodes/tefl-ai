"use client";

import { useRef, useState } from "react";
import * as Icons from "lucide-react";
import {
  Compass,
  AlertCircle,
  Loader2,
  ArrowRight,
  Sparkles,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { useAiTool } from "@/lib/useAiTool";
import { ResultActions } from "@/components/tools/ResultActions";
import { ScrollIntoViewOnMount } from "@/components/tools/ScrollIntoViewOnMount";
import { RadioCards } from "@/components/ui/form";
import { COURSES, courseBySlug, courseUrl, formatPrice, type Course } from "@/content/courses";
import type { CourseFinderResult } from "@/lib/tools/tefl-course-finder";

type Q = {
  key: keyof FormState;
  title: string;
  type: "radio" | "select";
  options: { value: string; label: string; desc?: string }[];
};

interface FormState {
  goal: string;
  experience: string;
  english_level: string;
  intensity: string;
  study_style: string;
  budget: string;
}

const QUESTIONS: Q[] = [
  {
    key: "goal",
    title: "What's your main goal for getting TEFL certified?",
    type: "radio",
    options: [
      { value: "abroad", label: "Teach English abroad" },
      { value: "online", label: "Teach English online" },
      { value: "career", label: "Improve my teaching career" },
      { value: "travel", label: "Travel and work short-term" },
    ],
  },
  {
    key: "experience",
    title: "Do you have any teaching experience?",
    type: "radio",
    options: [
      { value: "none", label: "None at all" },
      { value: "little", label: "A little (tutoring or volunteering)" },
      { value: "yes", label: "Yes, I've taught before" },
    ],
  },
  {
    key: "english_level",
    title: "What's your English proficiency level?",
    type: "select",
    options: [
      { value: "native", label: "Native speaker (UK, USA, etc.)" },
      { value: "c2", label: "C2 – Proficient" },
      { value: "c1", label: "C1 – Advanced" },
      { value: "b2", label: "B2 – Upper Intermediate" },
      { value: "b1", label: "B1 – Intermediate" },
      { value: "below_b1", label: "Below B1" },
    ],
  },
  {
    key: "intensity",
    title: "How intensive do you want your course to be?",
    type: "radio",
    options: [
      { value: "quick", label: "Quick and basic", desc: "Just want an introduction" },
      { value: "in-depth", label: "In-depth and recognised" },
      { value: "professional", label: "Full professional training", desc: "For top jobs" },
    ],
  },
  {
    key: "study_style",
    title: "How do you prefer to study?",
    type: "radio",
    options: [
      { value: "self-paced", label: "100% self-paced", desc: "Flexible study" },
      { value: "tutor", label: "With tutor feedback", desc: "Assignments & support" },
    ],
  },
  {
    key: "budget",
    title: "What's your approximate budget?",
    type: "select",
    options: [
      { value: "under_100", label: "Under €115" },
      { value: "100_200", label: "€115 – €230" },
      { value: "200_400", label: "€230 – €460" },
      { value: "over_400", label: "Over €460" },
    ],
  },
];

function CIcon({ name, className }: { name: string; className?: string }) {
  const Cmp =
    (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name] ?? Icons.GraduationCap;
  return <Cmp className={className} />;
}

function CourseCard({
  course,
  primary,
  reason,
}: {
  course: Course;
  primary?: boolean;
  reason?: string;
}) {
  return (
    <div
      className={`surface-card flex flex-col p-6 ${
        primary ? "ring-1 ring-[var(--color-accent)]" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-gradient-soft)] text-[var(--color-accent)]">
          <CIcon name={course.icon} className="h-6 w-6" />
        </span>
        {primary ? (
          <span className="eyebrow flex">
            <Sparkles className="h-3.5 w-3.5" /> Best match
          </span>
        ) : course.badge ? (
          <span className="chip !py-1 !px-2 text-xs">{course.badge}</span>
        ) : null}
      </div>

      <h3 className="mt-4 text-lg font-semibold">{course.title}</h3>
      <p className="mt-1 text-sm text-[var(--color-muted)]">{course.tagline}</p>

      {reason && (
        <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-white/[0.02] p-3">
          <p className="text-sm leading-relaxed text-[var(--color-muted)]">
            <span className="font-medium text-[var(--color-accent)]">Why this fits you: </span>
            {reason}
          </p>
        </div>
      )}

      <ul className="mt-4 flex-1 space-y-2">
        {course.highlights.slice(0, primary ? 4 : 3).map((h, i) => (
          <li key={i} className="flex gap-2 text-sm text-[var(--color-muted)]">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent)]" />
            <span>{h}</span>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--color-border)] pt-4">
        <div>
          <div className="text-xl font-bold">{formatPrice(course.price, course.currency)}</div>
          <div className="text-xs text-[var(--color-faint)]">{course.duration}</div>
        </div>
        <a
          href={courseUrl(course.slug)}
          target="_blank"
          rel="noopener noreferrer"
          className={`btn ${primary ? "btn-primary" : "btn-ghost"}`}
        >
          Enrol <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}

export function TeflCourseFinderTool() {
  const { submit, loading, error, data, reset } = useAiTool<CourseFinderResult>("find_tefl_course");
  const [form, setForm] = useState<FormState>({
    goal: "",
    experience: "",
    english_level: "",
    intensity: "",
    study_style: "",
    budget: "",
  });

  const set = (k: keyof FormState, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const complete = QUESTIONS.every((q) => form[q.key]);

  const qRefs = useRef<(HTMLDivElement | null)[]>([]);
  const submitRef = useRef<HTMLButtonElement | null>(null);

  // Select an answer, then gently scroll the next question (or submit) into view.
  const selectAndAdvance = (i: number, key: keyof FormState, v: string) => {
    set(key, v);
    if (!v) return;
    const target = i + 1 < QUESTIONS.length ? qRefs.current[i + 1] : submitRef.current;
    if (target) {
      window.setTimeout(
        () => target.scrollIntoView({ behavior: "smooth", block: "center" }),
        150
      );
    }
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!complete) return;
    await submit(form as unknown as Record<string, unknown>);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resultText() {
    if (!data) return "";
    const rec = courseBySlug(data.recommendedSlug);
    const lines = [
      `Recommended TEFL course: ${rec?.title ?? data.recommendedSlug}`,
      data.reasoning,
      "",
      "Alternatives:",
      ...data.alternatives.map((a) => {
        const c = courseBySlug(a.slug);
        return `• ${c?.title ?? a.slug}${a.reason ? ` — ${a.reason}` : ""}`;
      }),
    ];
    return lines.join("\n");
  }

  /* ─────────────── RESULT ─────────────── */
  if (data) {
    const primary = courseBySlug(data.recommendedSlug);
    const alts = data.alternatives
      .map((a) => ({ course: courseBySlug(a.slug), reason: a.reason }))
      .filter((a): a is { course: Course; reason: string } => !!a.course);

    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <ScrollIntoViewOnMount />
        <div className="surface-card flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <span className="eyebrow flex">
              <Sparkles className="h-3.5 w-3.5" /> AI recommendation
            </span>
            <h2 className="mt-2 text-xl font-semibold">Your perfect course match</h2>
            {data.profileSummary && (
              <p className="mt-1 text-sm text-[var(--color-muted)]">{data.profileSummary}</p>
            )}
          </div>
          <ResultActions getText={resultText} onReset={reset} printTargetId="course-finder-output" />
        </div>

        <div id="course-finder-output" className="space-y-8">
          {primary && <CourseCard course={primary} primary reason={data.reasoning} />}

          {alts.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-gradient">Other great options</h3>
              <div className="mt-4 grid gap-5 md:grid-cols-2">
                {alts.map(({ course, reason }) => (
                  <CourseCard key={course.slug} course={course} reason={reason} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <button type="button" onClick={reset} className="btn btn-ghost">
            <RotateCcw className="h-4 w-4" /> Start again
          </button>
        </div>
      </div>
    );
  }

  /* ─────────────── LOADING ─────────────── */
  if (loading) {
    return (
      <div className="surface-card mx-auto flex max-w-2xl flex-col items-center justify-center gap-4 p-16 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-gradient-soft)] text-[var(--color-accent)]">
          <Loader2 className="h-7 w-7 animate-spin" />
        </span>
        <h3 className="text-lg font-semibold">Matching you to the right course…</h3>
        <p className="max-w-sm text-sm text-[var(--color-muted)]">
          Analysing your goals, experience and budget against our course catalogue.
        </p>
      </div>
    );
  }

  /* ─────────────── FORM ─────────────── */
  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl">
      <div className="surface-card space-y-7 p-6 md:p-8">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand-gradient-soft)] text-[var(--color-accent)]">
            <Compass className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-lg font-semibold">Find your perfect TEFL course</h2>
            <p className="text-sm text-[var(--color-muted)]">
              Answer six quick questions for a personalised recommendation.
            </p>
          </div>
        </div>

        {QUESTIONS.map((q, i) => (
          <div
            key={q.key}
            ref={(el) => {
              qRefs.current[i] = el;
            }}
            className="scroll-mt-24 space-y-3"
          >
            <h3 className="flex items-start gap-2 text-sm font-medium text-[var(--color-ink)]">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--brand-gradient-soft)] text-xs font-semibold text-[var(--color-accent)]">
                {i + 1}
              </span>
              {q.title}
            </h3>
            {q.type === "radio" ? (
              <RadioCards
                name={q.key}
                value={form[q.key]}
                onChange={(v) => selectAndAdvance(i, q.key, v)}
                options={q.options}
                columns={q.options.length >= 3 ? 2 : 2}
              />
            ) : (
              <select
                value={form[q.key]}
                onChange={(e) => selectAndAdvance(i, q.key, e.target.value)}
                className="input-tai cursor-pointer appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 fill=%22none%22 stroke=%22%23a6b2cf%22 stroke-width=%222%22><path d=%22M4 6l4 4 4-4%22/></svg>')] bg-[length:16px] bg-[right_1rem_center] bg-no-repeat pr-10"
              >
                <option value="">Please select…</option>
                {q.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}

        <button
          ref={submitRef}
          type="submit"
          disabled={!complete}
          className="btn btn-primary w-full scroll-mt-24 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4" />
          {complete ? "Get my recommendation" : "Answer all questions to continue"}
        </button>

        {error && (
          <p className="flex items-center gap-2 text-sm text-[var(--color-danger)]">
            <AlertCircle className="h-4 w-4" /> {error}
          </p>
        )}

        <p className="text-center text-xs text-[var(--color-faint)]">
          Recommendations are based on your answers and our current course offerings.
        </p>
      </div>
    </form>
  );
}
