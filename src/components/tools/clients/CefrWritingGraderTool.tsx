"use client";

import { useMemo, useState } from "react";
import {
  GraduationCap,
  AlertCircle,
  Loader2,
  CheckCircle2,
  BookOpen,
  PenLine,
  Target,
  ClipboardList,
} from "lucide-react";
import { useAiTool } from "@/lib/useAiTool";
import { Field, TextInput, TextArea, RadioCards, SubmitButton } from "@/components/ui/form";
import { ResultActions } from "@/components/tools/ResultActions";
import { ScrollIntoViewOnMount } from "@/components/tools/ScrollIntoViewOnMount";
import type { CefrWritingResult } from "@/lib/tools/cefr-writing-grader";

const PROFILES = [
  { value: "young learner", label: "Young Learner" },
  { value: "teen", label: "Teen" },
  { value: "adult", label: "Adult" },
] as const;

const CONF_STYLES: Record<string, string> = {
  high: "bg-[rgba(34,197,94,0.18)] text-[#4ade80]",
  medium: "bg-[rgba(234,179,8,0.18)] text-[#fbbf24]",
  low: "bg-[rgba(148,163,184,0.2)] text-[#cbd5e1]",
};

function countWords(text: string): number {
  return (text.trim().match(/\S+/g) || []).length;
}

export function CefrWritingGraderTool() {
  const { submit, loading, error, data, reset } = useAiTool<CefrWritingResult>("grade_cefr_writing");

  const [taskContext, setTaskContext] = useState("");
  const [learnerProfile, setLearnerProfile] = useState<(typeof PROFILES)[number]["value"]>("adult");
  const [studentWriting, setStudentWriting] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const wordCount = useMemo(() => countWords(studentWriting), [studentWriting]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (wordCount < 40) {
      setLocalError("Please enter at least 40 words for an accurate assessment.");
      return;
    }
    setLocalError(null);
    await submit({
      student_writing: studentWriting,
      task_context: taskContext,
      learner_profile: learnerProfile,
    });
  }

  function resultText() {
    if (!data) return "";
    const lines = [
      `CEFR Writing Assessment`,
      `Level: ${data.cefr_level}${data.confidence ? ` (confidence: ${data.confidence})` : ""}`,
      "",
      "Summary",
      data.summary,
      "",
    ];
    if (data.strengths.length) lines.push("Strengths", ...data.strengths.map((s) => `• ${s}`), "");
    if (data.vocabulary_feedback.length)
      lines.push("Vocabulary & Collocation", ...data.vocabulary_feedback.map((s) => `• ${s}`), "");
    if (data.grammar_feedback.length) {
      lines.push("Grammar Feedback");
      data.grammar_feedback.forEach((g) => {
        lines.push(`• Error: ${g.error}`, `  Fix: ${g.correction}`);
        if (g.note) lines.push(`  Note: ${g.note}`);
      });
      lines.push("");
    }
    if (data.next_steps.length) lines.push("Next Steps", ...data.next_steps.map((s) => `• ${s}`));
    return lines.join("\n");
  }

  const confKey = data?.confidence?.toLowerCase() ?? "";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
      {/* Form */}
      <form onSubmit={onSubmit} className="surface-card h-fit space-y-4 p-6 lg:sticky lg:top-24">
        <Field label="Task / prompt context" htmlFor="task_context" hint="Optional — what was the writer asked to do?">
          <TextInput
            id="task_context"
            value={taskContext}
            maxLength={300}
            onChange={(e) => setTaskContext(e.target.value)}
            placeholder="e.g. Describe your last vacation"
          />
        </Field>

        <Field label="Learner profile">
          <RadioCards
            name="learner_profile"
            value={learnerProfile}
            onChange={setLearnerProfile}
            options={PROFILES.map((p) => ({ value: p.value, label: p.label }))}
            columns={3}
          />
        </Field>

        <Field
          label="Your writing"
          htmlFor="student_writing"
          required
          hint="Minimum ~40 words for a reliable result. Beyond ~800 words is truncated."
        >
          <TextArea
            id="student_writing"
            value={studentWriting}
            onChange={(e) => setStudentWriting(e.target.value)}
            placeholder="Paste the writing here (at least 40 words)…"
            className="min-h-48"
            required
          />
        </Field>

        <div className="flex items-center justify-between text-xs text-[var(--color-faint)]">
          <span>{wordCount} word{wordCount === 1 ? "" : "s"}</span>
          <span className={wordCount >= 40 ? "text-[var(--color-success)]" : ""}>
            {wordCount >= 40 ? "Ready to grade" : `${Math.max(0, 40 - wordCount)} more to go`}
          </span>
        </div>

        <p className="text-xs text-[var(--color-faint)]">
          Results are AI-generated estimates for self-study purposes only and do not constitute an official CEFR certification.
        </p>

        <SubmitButton loading={loading}>
          <GraduationCap className="h-4 w-4" /> Grade my writing
        </SubmitButton>

        {(localError || error) && (
          <p className="flex items-center gap-2 text-sm text-[var(--color-danger)]">
            <AlertCircle className="h-4 w-4" /> {localError || error}
          </p>
        )}
      </form>

      {/* Result */}
      <div className="min-h-[400px]">
        {loading && (
          <div className="surface-card flex flex-col items-center justify-center gap-4 p-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent)]" />
            <p className="text-sm text-[var(--color-muted)]">Assessing the writing against CEFR descriptors…</p>
          </div>
        )}

        {!loading && !data && (
          <div className="surface-card flex h-full flex-col items-center justify-center gap-4 p-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-gradient-soft)] text-[var(--color-accent)]">
              <GraduationCap className="h-7 w-7" />
            </span>
            <h3 className="text-lg font-semibold">Your CEFR assessment appears here</h3>
            <p className="max-w-sm text-sm text-[var(--color-muted)]">
              Paste any English writing and get an estimated level (A1–C2) with strengths, grammar corrections and next steps.
            </p>
          </div>
        )}

        {!loading && data && (
          <div className="surface-card p-6 md:p-8">
            <ScrollIntoViewOnMount />
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--color-border)] pb-5">
              <div className="flex items-center gap-4">
                <span className="flex h-16 min-w-16 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0170b9,#64be9f)] px-4 text-3xl font-extrabold tracking-wide text-white shadow-[0_6px_18px_rgba(1,112,185,0.35)]">
                  {data.cefr_level}
                </span>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs uppercase tracking-wider text-[var(--color-faint)]">CEFR Level</span>
                  {data.confidence && (
                    <span className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${CONF_STYLES[confKey] ?? CONF_STYLES.low}`}>
                      Confidence: {data.confidence}
                    </span>
                  )}
                </div>
              </div>
              <ResultActions getText={resultText} onReset={reset} printTargetId="cefr-output" />
            </div>

            <div id="cefr-output" className="mt-6 space-y-5">
              {data.summary && (
                <section className="rounded-xl border border-[var(--color-border)] bg-white/[0.02] p-5">
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)]">
                    <ClipboardList className="h-4 w-4 text-[var(--color-accent)]" /> Summary
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--color-muted)]">{data.summary}</p>
                </section>
              )}

              <div className="grid gap-5 md:grid-cols-2">
                <section className="rounded-xl border border-[var(--color-border)] bg-white/[0.02] p-5">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)]">
                    <CheckCircle2 className="h-4 w-4 text-[#4ade80]" /> Strengths
                  </h3>
                  {data.strengths.length ? (
                    <ul className="space-y-2 text-sm text-[var(--color-muted)]">
                      {data.strengths.map((s, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-[#4ade80]">✓</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm italic text-[var(--color-faint)]">None noted.</p>
                  )}
                </section>

                <section className="rounded-xl border border-[var(--color-border)] bg-white/[0.02] p-5">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)]">
                    <BookOpen className="h-4 w-4 text-[#64be9f]" /> Vocabulary & Collocation
                  </h3>
                  {data.vocabulary_feedback.length ? (
                    <ul className="space-y-2 text-sm text-[var(--color-muted)]">
                      {data.vocabulary_feedback.map((s, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-[#64be9f]">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm italic text-[var(--color-faint)]">None noted.</p>
                  )}
                </section>
              </div>

              <section className="rounded-xl border border-[var(--color-border)] bg-white/[0.02] p-5">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)]">
                  <PenLine className="h-4 w-4 text-[var(--color-accent)]" /> Grammar Feedback
                </h3>
                {data.grammar_feedback.length ? (
                  <div className="space-y-3">
                    {data.grammar_feedback.map((g, i) => (
                      <div key={i} className="rounded-lg border border-[var(--color-border)] border-l-2 border-l-[#64be9f] bg-white/[0.02] p-3.5">
                        <div className="flex flex-wrap items-baseline gap-2 text-sm">
                          <span className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#f87171] bg-[rgba(239,68,68,0.18)]">Error</span>
                          <span className="text-[#fca5a5] line-through decoration-[rgba(239,68,68,0.5)]">{g.error}</span>
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-baseline gap-2 text-sm">
                          <span className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#4ade80] bg-[rgba(34,197,94,0.18)]">Fix</span>
                          <span className="text-[#bbf7d0]">{g.correction}</span>
                        </div>
                        {g.note && <p className="mt-2 text-xs italic text-[var(--color-faint)]">{g.note}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm italic text-[var(--color-faint)]">No significant grammar errors identified.</p>
                )}
              </section>

              <section className="rounded-xl border border-[var(--color-border)] bg-white/[0.02] p-5">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)]">
                  <Target className="h-4 w-4 text-[#60a5fa]" /> Next Steps
                </h3>
                {data.next_steps.length ? (
                  <ul className="space-y-2 text-sm text-[var(--color-muted)]">
                    {data.next_steps.map((s, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-[#60a5fa]">→</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm italic text-[var(--color-faint)]">None noted.</p>
                )}
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
