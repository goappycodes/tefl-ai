"use client";

import { useState } from "react";
import { NotebookPen, AlertCircle, Loader2 } from "lucide-react";
import { useAiTool } from "@/lib/useAiTool";
import { Field, TextInput, TextArea, Select, SubmitButton } from "@/components/ui/form";
import { ResultActions } from "@/components/tools/ResultActions";
import { ScrollIntoViewOnMount } from "@/components/tools/ScrollIntoViewOnMount";
import type { LessonPlanResult } from "@/lib/tools/lesson-plan-generator";

const CEFR = ["A1", "A2", "B1", "B2", "C1", "C2"];
const DURATIONS = ["30 minutes", "45 minutes", "60 minutes", "90 minutes", "120 minutes"];
const CLASS_TYPES = ["One-to-one", "Small group", "Large group", "Online", "In-person"];
const AGE_GROUPS = ["Young learners (6–12)", "Teenagers (13–17)", "Adults (18+)", "Business professionals"];

const STAGES: { key: keyof LessonPlanResult; label: string }[] = [
  { key: "warm_up", label: "Warm-up" },
  { key: "presentation", label: "Presentation" },
  { key: "practice", label: "Practice" },
  { key: "production", label: "Production" },
  { key: "wrap_up", label: "Wrap-up" },
];

export function LessonPlanTool() {
  const { submit, loading, error, data, reset } = useAiTool<LessonPlanResult>(
    "generate_lesson_plan"
  );
  const [form, setForm] = useState({
    cefr_level: "B1",
    lesson_topic: "",
    lesson_duration: "60 minutes",
    class_type: "Small group",
    age_group: "Adults (18+)",
    special_request: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await submit(form);
  }

  function resultText() {
    if (!data) return "";
    const lines = [
      `Lesson Plan — ${data.topic}`,
      `Level: ${data.level} | Age: ${data.age_group} | Duration: ${data.duration}`,
      "",
    ];
    for (const s of STAGES) {
      const items = data[s.key] as string[];
      if (items?.length) {
        lines.push(s.label.toUpperCase());
        items.forEach((i) => lines.push(`• ${i}`));
        lines.push("");
      }
    }
    if (data.materials?.length) {
      lines.push("MATERIALS");
      data.materials.forEach((m) => lines.push(`• ${m}`));
    }
    return lines.join("\n");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Form */}
      <form onSubmit={onSubmit} className="surface-card space-y-4 p-6">
        <Field label="CEFR level" htmlFor="cefr_level" required>
          <Select id="cefr_level" value={form.cefr_level} onChange={(e) => set("cefr_level", e.target.value)}>
            {CEFR.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </Field>

        <Field label="Lesson topic" htmlFor="lesson_topic" required hint="e.g. Past simple for travel, ordering in a restaurant">
          <TextInput
            id="lesson_topic"
            value={form.lesson_topic}
            onChange={(e) => set("lesson_topic", e.target.value)}
            placeholder="What is the lesson about?"
            required
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Duration" htmlFor="lesson_duration" required>
            <Select id="lesson_duration" value={form.lesson_duration} onChange={(e) => set("lesson_duration", e.target.value)}>
              {DURATIONS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </Select>
          </Field>
          <Field label="Class type" htmlFor="class_type" required>
            <Select id="class_type" value={form.class_type} onChange={(e) => set("class_type", e.target.value)}>
              {CLASS_TYPES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Age group" htmlFor="age_group" required>
          <Select id="age_group" value={form.age_group} onChange={(e) => set("age_group", e.target.value)}>
            {AGE_GROUPS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </Select>
        </Field>

        <Field label="Special focus" htmlFor="special_request" hint="Optional — grammar point, skill focus, exam, etc.">
          <TextArea
            id="special_request"
            value={form.special_request}
            onChange={(e) => set("special_request", e.target.value)}
            placeholder="Anything specific you'd like included?"
            className="min-h-20"
          />
        </Field>

        <SubmitButton loading={loading}>
          <NotebookPen className="h-4 w-4" /> Generate lesson plan
        </SubmitButton>

        {error && (
          <p className="flex items-center gap-2 text-sm text-[var(--color-danger)]">
            <AlertCircle className="h-4 w-4" /> {error}
          </p>
        )}
      </form>

      {/* Result */}
      <div>
        {loading && (
          <div className="surface-card flex flex-col items-center justify-center gap-4 p-16 text-center">
            <ScrollIntoViewOnMount />
            <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent)]" />
            <p className="text-sm text-[var(--color-muted)]">
              Writing your complete, ready-to-teach lesson plan…
            </p>
          </div>
        )}

        {!loading && data && (
          <div className="surface-card p-6 md:p-8">
            <ScrollIntoViewOnMount />
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--color-border)] pb-5">
              <div>
                <h2 className="text-xl font-semibold">{data.topic}</h2>
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  {data.level} · {data.age_group} · {data.duration}
                </p>
              </div>
              <ResultActions getText={resultText} onReset={reset} printTargetId="lesson-plan-output" />
            </div>

            <div id="lesson-plan-output" className="mt-6 space-y-7">
              {STAGES.map((s) => {
                const items = data[s.key] as string[];
                if (!items?.length) return null;
                return (
                  <section key={s.key}>
                    <h3 className="text-base font-semibold text-gradient">{s.label}</h3>
                    <ul className="mt-3 space-y-3">
                      {items.map((item, i) => (
                        <li
                          key={i}
                          className="rounded-xl border border-[var(--color-border)] bg-white/[0.02] p-4 text-sm leading-relaxed text-[var(--color-muted)] whitespace-pre-wrap"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })}
              {data.materials?.length > 0 && (
                <section>
                  <h3 className="text-base font-semibold text-gradient">Materials</h3>
                  <ul className="mt-3 space-y-2">
                    {data.materials.map((m, i) => (
                      <li key={i} className="flex gap-2 text-sm text-[var(--color-muted)]">
                        <span className="text-[var(--color-accent)]">•</span>
                        <span className="whitespace-pre-wrap">{m}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
