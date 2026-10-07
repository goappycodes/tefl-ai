"use client";

import { useState } from "react";
import {
  ClipboardCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
  TriangleAlert,
  BookOpen,
  ListChecks,
} from "lucide-react";
import { useAiTool } from "@/lib/useAiTool";
import { Field, Select, RadioCards, SubmitButton } from "@/components/ui/form";
import { ResultActions } from "@/components/tools/ResultActions";
import type { JobReadinessResult } from "@/lib/tools/job-readiness-checker";

const TEFL_CERT = [
  "Yes, 120-hour TEFL",
  "Yes, 250-hour TEFL Diploma",
  "No, but planning to get one",
  "No, and not planning to get one",
];

const TEACHING_EXPERIENCE = ["No experience", "Less than 1 year", "1-3 years", "3+ years"];

const RESUME_READY = [
  "Yes, it's polished and up-to-date",
  "Somewhat, but it needs improvement",
  "No, I don't have one",
];

const INTERVIEW = [
  "Yes, I've practiced common questions",
  "Somewhat, but I need more preparation",
  "No, I haven't prepared",
];

const TEACHING_METHODS = [
  "Yes, I can confidently explain them",
  "I know some basic strategies",
  "No, I need to learn more",
];

function niceLabel(k: string): string {
  return k
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function JobReadinessCheckerTool() {
  const { submit, loading, error, data, reset } = useAiTool<JobReadinessResult>(
    "get_job_readiness_feedback"
  );

  const [form, setForm] = useState({
    tefl_certification: "",
    teaching_experience: "",
    resume_ready: "",
    resume_proofread: "",
    interview_preparedness: "",
    teaching_methods: "",
    visa_requirements: "",
    lesson_plan: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await submit(form);
  }

  const pct = (() => {
    const raw = data?.overall_readiness?.percentage;
    const n = typeof raw === "number" ? raw : parseInt(String(raw ?? ""), 10);
    return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : null;
  })();

  function resultText() {
    if (!data) return "";
    const lines = ["TEFL Job Readiness Assessment", ""];
    if (data.overall_readiness) {
      lines.push(
        `Readiness: ${data.overall_readiness.score} (${data.overall_readiness.percentage}%)`
      );
    }
    if (data.summary) lines.push("", data.summary);
    if (data.strengths?.length) lines.push("", "Strengths:", ...data.strengths.map((s) => `• ${s}`));
    if (data.areas_for_improvement?.length)
      lines.push("", "Areas for improvement:", ...data.areas_for_improvement.map((s) => `• ${s}`));
    if (data.next_steps)
      lines.push(
        "",
        "Next steps:",
        ...Object.entries(data.next_steps)
          .filter(([, v]) => v)
          .map(([k, v]) => `${niceLabel(k)}: ${v}`)
      );
    if (data.recommended_resources?.length)
      lines.push("", "Recommended resources:", ...data.recommended_resources.map((s) => `• ${s}`));
    return lines.join("\n");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,440px)_1fr]">
      {/* Form */}
      <form onSubmit={onSubmit} className="surface-card h-fit space-y-5 p-6 lg:sticky lg:top-24">
        <Field label="Do you have a TEFL certification?" htmlFor="tefl_certification" required>
          <Select
            id="tefl_certification"
            value={form.tefl_certification}
            onChange={(e) => set("tefl_certification", e.target.value)}
          >
            <option value="">Please select</option>
            {TEFL_CERT.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Prior teaching experience?" htmlFor="teaching_experience" required>
          <Select
            id="teaching_experience"
            value={form.teaching_experience}
            onChange={(e) => set("teaching_experience", e.target.value)}
          >
            <option value="">Please select</option>
            {TEACHING_EXPERIENCE.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Professional TEFL resume ready?" required>
          <RadioCards
            name="resume_ready"
            value={form.resume_ready}
            onChange={(v) => set("resume_ready", v)}
            columns={2}
            options={RESUME_READY.map((x) => ({ value: x, label: x }))}
          />
        </Field>

        <Field label="Proofread your resume for grammar and clarity?" required>
          <RadioCards
            name="resume_proofread"
            value={form.resume_proofread}
            onChange={(v) => set("resume_proofread", v)}
            options={[
              { value: "Yes", label: "Yes" },
              { value: "No", label: "No" },
            ]}
          />
        </Field>

        <Field label="Researched common TEFL interview questions?" htmlFor="interview_preparedness" required>
          <Select
            id="interview_preparedness"
            value={form.interview_preparedness}
            onChange={(e) => set("interview_preparedness", e.target.value)}
          >
            <option value="">Please select</option>
            {INTERVIEW.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Comfortable explaining teaching methods & classroom management?" required>
          <RadioCards
            name="teaching_methods"
            value={form.teaching_methods}
            onChange={(v) => set("teaching_methods", v)}
            columns={2}
            options={TEACHING_METHODS.map((x) => ({ value: x, label: x }))}
          />
        </Field>

        <Field label="Considered visa requirements for your target country?" required>
          <RadioCards
            name="visa_requirements"
            value={form.visa_requirements}
            onChange={(v) => set("visa_requirements", v)}
            options={[
              { value: "Yes, I know the visa process", label: "Yes, I know the process" },
              { value: "No, I haven't prepared", label: "No, I haven't prepared" },
            ]}
          />
        </Field>

        <Field label="Demo lesson plan prepared?" required>
          <RadioCards
            name="lesson_plan"
            value={form.lesson_plan}
            onChange={(v) => set("lesson_plan", v)}
            options={[
              { value: "Yes", label: "Yes" },
              { value: "No", label: "No" },
            ]}
          />
        </Field>

        <SubmitButton loading={loading}>
          <ClipboardCheck className="h-4 w-4" /> Check my readiness
        </SubmitButton>

        {error && (
          <p className="flex items-center gap-2 text-sm text-[var(--color-danger)]">
            <AlertCircle className="h-4 w-4" /> {error}
          </p>
        )}
      </form>

      {/* Result */}
      <div className="min-h-[400px]">
        {loading && (
          <div className="surface-card flex flex-col items-center justify-center gap-4 p-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent)]" />
            <p className="text-sm text-[var(--color-muted)]">Analyzing your readiness…</p>
          </div>
        )}

        {!loading && !data && (
          <div className="surface-card flex h-full flex-col items-center justify-center gap-4 p-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-gradient-soft)] text-[var(--color-accent)]">
              <ClipboardCheck className="h-7 w-7" />
            </span>
            <h3 className="text-lg font-semibold">Your readiness report appears here</h3>
            <p className="max-w-sm text-sm text-[var(--color-muted)]">
              Answer a few questions and get a readiness score, your strengths, improvement areas,
              and next steps for applying to TEFL jobs.
            </p>
          </div>
        )}

        {!loading && data && (
          <div className="surface-card p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--color-border)] pb-5">
              <div>
                <h2 className="text-xl font-semibold">Your TEFL readiness assessment</h2>
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  Readiness status, improvement areas, and next steps.
                </p>
              </div>
              <ResultActions getText={resultText} onReset={reset} printTargetId="readiness-output" />
            </div>

            <div id="readiness-output" className="mt-6 space-y-6">
              {/* Score */}
              {data.overall_readiness && (
                <div className="rounded-2xl bg-[var(--brand-gradient-soft)] p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <span className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
                        Overall readiness
                      </span>
                      <p className="mt-1 text-2xl font-bold text-gradient">
                        {data.overall_readiness.score}
                      </p>
                    </div>
                    {pct !== null && (
                      <span className="text-4xl font-bold text-[var(--color-accent)]">{pct}%</span>
                    )}
                  </div>
                  {pct !== null && (
                    <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-[var(--color-accent)]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}
                </div>
              )}

              {data.summary && (
                <p className="text-sm leading-relaxed text-[var(--color-muted)]">{data.summary}</p>
              )}

              <div className="grid gap-5 md:grid-cols-2">
                {data.strengths?.length ? (
                  <section className="rounded-xl border border-[var(--color-border)] bg-white/[0.02] p-5">
                    <h3 className="flex items-center gap-2 text-base font-semibold text-gradient">
                      <CheckCircle2 className="h-4 w-4 text-[var(--color-success)]" /> Strengths
                    </h3>
                    <ul className="mt-3 space-y-2">
                      {data.strengths.map((s, i) => (
                        <li key={i} className="flex gap-2 text-sm text-[var(--color-muted)]">
                          <span className="text-[var(--color-success)]">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                {data.areas_for_improvement?.length ? (
                  <section className="rounded-xl border border-[var(--color-border)] bg-white/[0.02] p-5">
                    <h3 className="flex items-center gap-2 text-base font-semibold text-gradient">
                      <TriangleAlert className="h-4 w-4 text-[var(--color-warning)]" /> Improvement
                      areas
                    </h3>
                    <ul className="mt-3 space-y-2">
                      {data.areas_for_improvement.map((s, i) => (
                        <li key={i} className="flex gap-2 text-sm text-[var(--color-muted)]">
                          <span className="text-[var(--color-warning)]">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}
              </div>

              {data.next_steps && (
                <section>
                  <h3 className="flex items-center gap-2 text-base font-semibold text-gradient">
                    <ListChecks className="h-4 w-4 text-[var(--color-accent)]" /> Next steps
                  </h3>
                  <div className="mt-3 space-y-3">
                    {Object.entries(data.next_steps)
                      .filter(([, v]) => v)
                      .map(([k, v]) => (
                        <div
                          key={k}
                          className="rounded-xl border border-[var(--color-border)] bg-white/[0.02] p-4 text-sm"
                        >
                          <strong className="text-[var(--color-ink)]">{niceLabel(k)}:</strong>{" "}
                          <span className="text-[var(--color-muted)]">{v}</span>
                        </div>
                      ))}
                  </div>
                </section>
              )}

              {data.recommended_resources?.length ? (
                <section className="rounded-xl border border-[var(--color-border)] bg-white/[0.02] p-5">
                  <h3 className="flex items-center gap-2 text-base font-semibold text-gradient">
                    <BookOpen className="h-4 w-4 text-[var(--color-accent)]" /> Recommended resources
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {data.recommended_resources.map((s, i) => (
                      <li key={i} className="flex gap-2 text-sm text-[var(--color-muted)]">
                        <span className="text-[var(--color-accent)]">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
