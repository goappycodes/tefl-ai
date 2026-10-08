"use client";

import { useMemo, useState } from "react";
import { AudioLines, RefreshCw, AlertCircle, Loader2, Sparkles } from "lucide-react";
import { useAiTool } from "@/lib/useAiTool";
import { ResultActions } from "@/components/tools/ResultActions";
import { ScrollIntoViewOnMount } from "@/components/tools/ScrollIntoViewOnMount";
import { AudioRecorder, type AudioValue } from "@/components/tools/AudioRecorder";
import type { SpeakingBandResult, SpeakingPrompt } from "@/lib/tools/speaking-band-estimator";

const MIN_SECONDS = 30;
const MAX_SECONDS = 180;

const PROMPTS: SpeakingPrompt[] = [
  {
    title: "Talk about your typical day.",
    points: [
      "What you usually do in the morning",
      "How you spend your afternoon and evening",
      "What part of the day you enjoy most and why",
    ],
  },
  {
    title: "Describe a hobby or activity you enjoy.",
    points: [
      "What the hobby is and how you got into it",
      "How often you do it",
      "Why you find it enjoyable or rewarding",
    ],
  },
  {
    title: "Talk about a place you would love to visit.",
    points: [
      "Where it is and what it's like",
      "Why you want to go there",
      "What you would do once you arrived",
    ],
  },
  {
    title: "Describe something you have learned recently.",
    points: [
      "What you learned",
      "How you learned it",
      "Why it was useful or interesting to you",
    ],
  },
  {
    title: "Talk about your goals for the next few years.",
    points: [
      "What you want to achieve",
      "Why these goals matter to you",
      "What steps you will take to reach them",
    ],
  },
  {
    title: "Describe a person you admire.",
    points: [
      "Who the person is",
      "What they are like",
      "Why you admire them",
    ],
  },
];

const CRITERIA: { key: keyof SpeakingBandResult["criteria"]; label: string }[] = [
  { key: "fluency", label: "Fluency & Coherence" },
  { key: "vocabulary", label: "Vocabulary" },
  { key: "grammar", label: "Grammar" },
  { key: "pronunciation", label: "Pronunciation" },
];

export function SpeakingBandTool() {
  const { submit, loading, error, data, reset } = useAiTool<SpeakingBandResult>(
    "estimate_speaking_band"
  );

  const [pIndex, setPIndex] = useState(() => Math.floor(Math.random() * PROMPTS.length));
  const [audio, setAudio] = useState<AudioValue | null>(null);
  const [consent, setConsent] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const prompt = PROMPTS[pIndex];

  const canSubmit = useMemo(
    () => consent && audio != null && audio.duration >= MIN_SECONDS && !loading,
    [consent, audio, loading]
  );

  function newPrompt() {
    let next = pIndex;
    while (next === pIndex && PROMPTS.length > 1) {
      next = Math.floor(Math.random() * PROMPTS.length);
    }
    setPIndex(next);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError(null);
    if (!consent) return setLocalError("Please consent to audio recording before submitting.");
    if (!audio) return setLocalError("Please record or upload your speaking response first.");
    if (audio.duration < MIN_SECONDS)
      return setLocalError(`Please record for at least ${MIN_SECONDS} seconds.`);

    await submit({
      audio_data: audio.data,
      audio_duration: audio.duration,
      audio_format: audio.format,
      recording_consent: "on",
      selected_question: JSON.stringify(prompt),
    });
  }

  function resultText() {
    if (!data) return "";
    const lines = [`Spoken English Assessment`, `Estimated CEFR level: ${data.overall_level}`, ""];
    for (const c of CRITERIA) {
      const cr = data.criteria[c.key];
      lines.push(`${c.label}: ${cr.level}`);
      if (cr.feedback) lines.push(cr.feedback);
      cr.suggestions.forEach((s) => lines.push(`• ${s}`));
      lines.push("");
    }
    if (data.task_coverage) lines.push(`Task coverage: ${data.task_coverage}`, "");
    if (data.strengths.length) lines.push("Strengths:", ...data.strengths.map((s) => `• ${s}`), "");
    if (data.areas_for_improvement.length)
      lines.push("Areas for improvement:", ...data.areas_for_improvement.map((s) => `• ${s}`), "");
    if (data.next_steps) lines.push(`Next steps: ${data.next_steps}`, "");
    if (data.transcription) lines.push("Transcription:", data.transcription);
    return lines.join("\n");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,440px)_1fr]">
      {/* Form */}
      <form onSubmit={onSubmit} className="surface-card h-fit space-y-5 p-6 lg:sticky lg:top-24">
        {/* Prompt card */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--brand-gradient-soft)] p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="chip text-xs">Speaking prompt</span>
            <button
              type="button"
              onClick={newPrompt}
              className="inline-flex items-center gap-1.5 text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)]"
            >
              <RefreshCw className="h-3.5 w-3.5" /> New prompt
            </button>
          </div>
          <h3 className="mt-3 text-base font-semibold text-[var(--color-ink)]">{prompt.title}</h3>
          <p className="mt-2 text-xs font-medium uppercase tracking-wide text-[var(--color-faint)]">
            You could talk about
          </p>
          <ul className="mt-1.5 space-y-1 text-sm text-[var(--color-muted)]">
            {prompt.points.map((p, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-[var(--color-accent)]">•</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-[var(--color-ink)]">Your response</p>
          <AudioRecorder
            value={audio}
            onChange={setAudio}
            minSeconds={MIN_SECONDS}
            maxSeconds={MAX_SECONDS}
            disabled={loading}
          />
        </div>

        <label className="flex cursor-pointer items-start gap-2.5 text-sm text-[var(--color-muted)]">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-accent)]"
          />
          <span>
            I consent to my voice being recorded for assessment. The recording is processed by AI and
            not stored after analysis.
          </span>
        </label>

        <button
          type="submit"
          disabled={!canSubmit}
          className="btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Analysing…
            </>
          ) : (
            <>
              <AudioLines className="h-4 w-4" /> Estimate my level
            </>
          )}
        </button>

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
            <p className="text-sm text-[var(--color-muted)]">
              Transcribing your response and estimating your CEFR level…
            </p>
          </div>
        )}

        {!loading && !data && (
          <div className="surface-card flex h-full flex-col items-center justify-center gap-4 p-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-gradient-soft)] text-[var(--color-accent)]">
              <AudioLines className="h-7 w-7" />
            </span>
            <h3 className="text-lg font-semibold">Your proficiency estimate appears here</h3>
            <p className="max-w-sm text-sm text-[var(--color-muted)]">
              Speak for 30+ seconds on the prompt and get an estimated CEFR level (A1–C2) with
              feedback on fluency, vocabulary, grammar and pronunciation.
            </p>
          </div>
        )}

        {!loading && data && (
          <div className="surface-card p-6 md:p-8">
            <ScrollIntoViewOnMount />
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--color-border)] pb-5">
              <div>
                <h2 className="text-xl font-semibold">Spoken English Assessment</h2>
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  {data.word_count} words · {Math.round(data.duration)}s response
                </p>
              </div>
              <ResultActions getText={resultText} onReset={reset} printTargetId="speaking-band-output" />
            </div>

            <div id="speaking-band-output" className="mt-6 space-y-7">
              {/* Overall level */}
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--brand-gradient-soft)] p-6 text-center">
                <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-faint)]">
                  Estimated CEFR level
                </span>
                <span className="text-5xl font-bold text-gradient">{data.overall_level}</span>
              </div>

              {/* Criteria */}
              <div className="grid gap-4 sm:grid-cols-2">
                {CRITERIA.map((c) => {
                  const cr = data.criteria[c.key];
                  return (
                    <section
                      key={c.key}
                      className="rounded-xl border border-[var(--color-border)] bg-white/[0.02] p-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold text-[var(--color-ink)]">{c.label}</h3>
                        <span className="rounded-lg bg-[var(--brand-gradient-soft)] px-2.5 py-1 text-sm font-semibold text-[var(--color-accent)]">
                          {cr.level}
                        </span>
                      </div>
                      {cr.feedback && (
                        <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
                          {cr.feedback}
                        </p>
                      )}
                      {cr.suggestions.length > 0 && (
                        <ul className="mt-3 space-y-1.5">
                          {cr.suggestions.map((s, i) => (
                            <li key={i} className="flex gap-2 text-xs text-[var(--color-muted)]">
                              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-accent)]" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </section>
                  );
                })}
              </div>

              {data.task_coverage && (
                <section>
                  <h3 className="text-base font-semibold text-gradient">Task coverage</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
                    {data.task_coverage}
                  </p>
                </section>
              )}

              {data.strengths.length > 0 && (
                <section>
                  <h3 className="text-base font-semibold text-gradient">Strengths</h3>
                  <ul className="mt-2 space-y-1.5">
                    {data.strengths.map((s, i) => (
                      <li key={i} className="flex gap-2 text-sm text-[var(--color-muted)]">
                        <span className="text-[var(--color-success)]">✓</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {data.areas_for_improvement.length > 0 && (
                <section>
                  <h3 className="text-base font-semibold text-gradient">Areas for improvement</h3>
                  <ul className="mt-2 space-y-1.5">
                    {data.areas_for_improvement.map((s, i) => (
                      <li key={i} className="flex gap-2 text-sm text-[var(--color-muted)]">
                        <span className="text-[var(--color-warning)]">→</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {data.next_steps && (
                <section>
                  <h3 className="text-base font-semibold text-gradient">Next steps</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
                    {data.next_steps}
                  </p>
                </section>
              )}

              {data.transcription && (
                <section>
                  <h3 className="text-base font-semibold text-gradient">Your response transcription</h3>
                  <p className="mt-2 rounded-xl border border-[var(--color-border)] bg-white/[0.02] p-4 text-sm leading-relaxed text-[var(--color-muted)] whitespace-pre-wrap">
                    {data.transcription}
                  </p>
                </section>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
