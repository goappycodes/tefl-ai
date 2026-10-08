"use client";

import { useState } from "react";
import { Wand2, AlertCircle, Loader2, BookOpen, ListChecks, FileText } from "lucide-react";
import { useAiTool } from "@/lib/useAiTool";
import { Field, TextInput, TextArea, Select, SubmitButton } from "@/components/ui/form";
import { ResultActions } from "@/components/tools/ResultActions";
import { ScrollIntoViewOnMount } from "@/components/tools/ScrollIntoViewOnMount";
import type {
  MaterialsAdaptorResult,
  ComprehensionQuestion,
} from "@/lib/tools/ai-materials-adaptor";

const CEFR = [
  { value: "A1", label: "A1 - Beginner" },
  { value: "A2", label: "A2 - Elementary" },
  { value: "B1", label: "B1 - Intermediate" },
  { value: "B2", label: "B2 - Upper Intermediate" },
  { value: "C1", label: "C1 - Advanced" },
  { value: "C2", label: "C2 - Proficiency" },
];

const OPTIONS: { key: "include_definitions" | "highlight_changes" | "cultural_notes"; label: string }[] = [
  { key: "include_definitions", label: "Include vocabulary definitions" },
  { key: "highlight_changes", label: "Highlight simplified sections" },
  { key: "cultural_notes", label: "Add cultural context notes" },
];

function questionText(q: ComprehensionQuestion | string): string {
  return typeof q === "string" ? q : q.question;
}

export function MaterialsAdaptorTool() {
  const { submit, loading, error, data, reset } = useAiTool<MaterialsAdaptorResult>(
    "generate_adapted_material"
  );

  const [form, setForm] = useState({
    original_text: "",
    target_cefr_level: "",
    include_definitions: true,
    highlight_changes: false,
    cultural_notes: false,
    text_source: "",
  });

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await submit({
      original_text: form.original_text,
      target_cefr_level: form.target_cefr_level,
      include_definitions: form.include_definitions ? "1" : "",
      highlight_changes: form.highlight_changes ? "1" : "",
      cultural_notes: form.cultural_notes ? "1" : "",
      text_source: form.text_source,
    });
  }

  function resultText() {
    if (!data) return "";
    const lines: string[] = [];
    lines.push("Adaptation Overview");
    lines.push(`Target Level: ${data.target_level}`);
    if (data.original_level_estimate) lines.push(`Original Level: ${data.original_level_estimate}`);
    if (data.word_count) {
      lines.push(`Original Word Count: ${data.word_count.original}`);
      lines.push(`Simplified Word Count: ${data.word_count.simplified}`);
    }
    if (data.source_attribution) lines.push(`Source: ${data.source_attribution}`);
    lines.push("");

    if (data.simplified_text) {
      lines.push("Simplified Text");
      lines.push(data.simplified_text);
      lines.push("");
    }

    if (data.key_vocabulary?.length) {
      lines.push("Key Vocabulary");
      data.key_vocabulary.forEach((v) => {
        lines.push(`• ${v.word}: ${v.definition}${v.example ? ` (e.g. ${v.example})` : ""}`);
      });
      lines.push("");
    }

    if (data.comprehension_questions?.length) {
      lines.push("Comprehension Questions");
      data.comprehension_questions.forEach((q, i) => {
        const text = questionText(q);
        const type = typeof q === "object" && q.type ? ` (${q.type})` : "";
        lines.push(`${i + 1}. ${text}${type}`);
        if (typeof q === "object" && q.suggested_answer) {
          lines.push(`   Suggested Answer: ${q.suggested_answer}`);
        }
      });
      lines.push("");
    }

    if (data.adaptation_notes) {
      lines.push("Adaptation Notes");
      lines.push(data.adaptation_notes);
    }

    return lines.join("\n");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
      {/* Form */}
      <form onSubmit={onSubmit} className="surface-card h-fit space-y-4 p-6 lg:sticky lg:top-24">
        <Field
          label="Original text"
          htmlFor="original_text"
          required
          hint="Paste plain text only. Maximum 500 words — longer texts will be truncated."
        >
          <TextArea
            id="original_text"
            value={form.original_text}
            onChange={(e) => set("original_text", e.target.value)}
            placeholder="Paste your article, story, or any authentic text here (max 500 words)…"
            className="min-h-44"
            required
          />
        </Field>

        <Field
          label="Target CEFR level"
          htmlFor="target_cefr_level"
          required
          hint="Choose the level for your students' language proficiency."
        >
          <Select
            id="target_cefr_level"
            value={form.target_cefr_level}
            onChange={(e) => set("target_cefr_level", e.target.value)}
            required
          >
            <option value="">Select CEFR Level</option>
            {CEFR.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Additional options">
          <div className="space-y-2.5">
            {OPTIONS.map((o) => (
              <label
                key={o.key}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--color-border)] bg-white/[0.02] px-4 py-3 text-sm text-[var(--color-muted)] transition hover:border-[var(--color-faint)]"
              >
                <input
                  type="checkbox"
                  checked={form[o.key]}
                  onChange={(e) => set(o.key, e.target.checked)}
                  className="h-4 w-4 accent-[var(--color-accent)]"
                />
                {o.label}
              </label>
            ))}
          </div>
        </Field>

        <Field
          label="Text source"
          htmlFor="text_source"
          hint="Optional — help us attribute the source in your adapted materials."
        >
          <TextInput
            id="text_source"
            value={form.text_source}
            onChange={(e) => set("text_source", e.target.value)}
            placeholder="e.g. BBC News, National Geographic, etc."
          />
        </Field>

        <p className="text-xs leading-relaxed text-[var(--color-faint)]">
          Please ensure you have proper rights to use any copyrighted text. This tool is for
          educational purposes only. AI-generated content may contain inaccuracies — check and edit
          all outputs before using them in lessons.
        </p>

        <SubmitButton loading={loading}>
          <Wand2 className="h-4 w-4" /> Adapt materials
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
            <p className="text-sm text-[var(--color-muted)]">Adapting your material…</p>
          </div>
        )}

        {!loading && !data && (
          <div className="surface-card flex h-full flex-col items-center justify-center gap-4 p-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-gradient-soft)] text-[var(--color-accent)]">
              <Wand2 className="h-7 w-7" />
            </span>
            <h3 className="text-lg font-semibold">Your adapted materials appear here</h3>
            <p className="max-w-sm text-sm text-[var(--color-muted)]">
              Paste any authentic text and choose a target level — we&apos;ll return a simplified
              version with comprehension questions and key vocabulary.
            </p>
          </div>
        )}

        {!loading && data && (
          <div className="surface-card p-6 md:p-8">
            <ScrollIntoViewOnMount />
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--color-border)] pb-5">
              <div>
                <h2 className="text-xl font-semibold">Adapted Materials</h2>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className="chip">Target: {data.target_level}</span>
                  {data.original_level_estimate && (
                    <span className="chip">Original: {data.original_level_estimate}</span>
                  )}
                  {data.word_count && (
                    <span className="chip">
                      {data.word_count.original} → {data.word_count.simplified} words
                    </span>
                  )}
                  {data.source_attribution && <span className="chip">Source: {data.source_attribution}</span>}
                </div>
              </div>
              <ResultActions getText={resultText} onReset={reset} printTargetId="materials-output" />
            </div>

            <div id="materials-output" className="mt-6 space-y-7">
              {data.simplified_text && (
                <section>
                  <h3 className="flex items-center gap-2 text-base font-semibold text-gradient">
                    <FileText className="h-4 w-4" /> Simplified Text
                  </h3>
                  <div className="mt-3 rounded-xl border border-[var(--color-border)] bg-white/[0.02] p-4 text-sm leading-relaxed text-[var(--color-muted)] whitespace-pre-wrap">
                    {data.simplified_text}
                  </div>
                </section>
              )}

              {data.key_vocabulary?.length > 0 && (
                <section>
                  <h3 className="flex items-center gap-2 text-base font-semibold text-gradient">
                    <BookOpen className="h-4 w-4" /> Key Vocabulary
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {data.key_vocabulary.map((v, i) => (
                      <li
                        key={i}
                        className="rounded-xl border border-[var(--color-border)] bg-white/[0.02] p-4 text-sm text-[var(--color-muted)]"
                      >
                        <span className="font-semibold text-[var(--color-ink)]">{v.word}:</span>{" "}
                        {v.definition}
                        {v.example && (
                          <span className="mt-1 block text-xs italic text-[var(--color-faint)]">
                            Example: {v.example}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {data.comprehension_questions?.length > 0 && (
                <section>
                  <h3 className="flex items-center gap-2 text-base font-semibold text-gradient">
                    <ListChecks className="h-4 w-4" /> Comprehension Questions
                  </h3>
                  <ol className="mt-3 space-y-2">
                    {data.comprehension_questions.map((q, i) => {
                      const text = questionText(q);
                      const isObj = typeof q === "object";
                      return (
                        <li
                          key={i}
                          className="rounded-xl border border-[var(--color-border)] bg-white/[0.02] p-4 text-sm text-[var(--color-muted)]"
                        >
                          <span className="font-medium text-[var(--color-ink)]">{i + 1}.</span> {text}
                          {isObj && q.type && (
                            <span className="ml-2 rounded-full bg-[var(--brand-gradient-soft)] px-2 py-0.5 text-xs text-[var(--color-accent)]">
                              {q.type}
                            </span>
                          )}
                          {isObj && q.suggested_answer && (
                            <span className="mt-1.5 block text-xs text-[var(--color-faint)]">
                              <strong>Suggested Answer:</strong> {q.suggested_answer}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                </section>
              )}

              {data.adaptation_notes && (
                <section>
                  <h3 className="text-base font-semibold text-gradient">Adaptation Notes</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)] whitespace-pre-wrap">
                    {data.adaptation_notes}
                  </p>
                </section>
              )}

              {data.cultural_notes && data.cultural_notes.length > 0 && (
                <section>
                  <h3 className="text-base font-semibold text-gradient">Cultural Notes</h3>
                  <ul className="mt-3 space-y-2">
                    {data.cultural_notes.map((n, i) => (
                      <li key={i} className="flex gap-2 text-sm text-[var(--color-muted)]">
                        <span className="text-[var(--color-accent)]">•</span>
                        <span className="whitespace-pre-wrap">{n}</span>
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
