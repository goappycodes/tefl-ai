"use client";

import { useMemo, useState } from "react";
import { Mic, RefreshCw, AlertCircle, Loader2, Sparkles } from "lucide-react";
import { useAiTool } from "@/lib/useAiTool";
import { ResultActions } from "@/components/tools/ResultActions";
import { ScrollIntoViewOnMount } from "@/components/tools/ScrollIntoViewOnMount";
import { AudioRecorder, type AudioValue } from "@/components/tools/AudioRecorder";
import type { IeltsSpeakingResult, SpeakingQuestion } from "@/lib/tools/ielts-speaking-band-estimator";

const MIN_SECONDS = 30;
const MAX_SECONDS = 180;

const QUESTIONS: SpeakingQuestion[] = [
  {
    title: "Describe a memorable journey you have taken.",
    points: [
      "Where you went",
      "When you took this journey",
      "Who you went with",
      "And explain why this journey was memorable for you",
    ],
  },
  {
    title: "Describe a skill you would like to learn in the future.",
    points: [
      "What skill it is",
      "How you would learn it",
      "Why you want to learn this skill",
      "And explain how this skill would benefit you",
    ],
  },
  {
    title: "Describe a place you visited that was particularly beautiful.",
    points: [
      "Where this place was",
      "When you visited it",
      "What made it beautiful",
      "And explain how you felt about visiting this place",
    ],
  },
  {
    title: "Describe a person who has influenced you in a positive way.",
    points: [
      "Who this person is",
      "How you know them",
      "What they did to influence you",
      "And explain why their influence was positive",
    ],
  },
  {
    title: "Describe an interesting conversation you had recently.",
    points: [
      "Who you had the conversation with",
      "Where it took place",
      "What you talked about",
      "And explain why this conversation was interesting to you",
    ],
  },
  {
    title: "Describe a book or movie that made a strong impression on you.",
    points: [
      "What the book/movie was",
      "When you read/watched it",
      "What it was about",
      "And explain why it made such a strong impression on you",
    ],
  },
];

const CRITERIA: { key: keyof IeltsSpeakingResult["criteria"]; label: string }[] = [
  { key: "fluency", label: "Fluency & Coherence" },
  { key: "vocabulary", label: "Lexical Resource" },
  { key: "grammar", label: "Grammatical Range & Accuracy" },
  { key: "pronunciation", label: "Pronunciation" },
];

export function IeltsSpeakingBandTool() {
  const { submit, loading, error, data, reset } = useAiTool<IeltsSpeakingResult>(
    "estimate_ielts_speaking_band"
  );

  const [qIndex, setQIndex] = useState(() => Math.floor(Math.random() * QUESTIONS.length));
  const [audio, setAudio] = useState<AudioValue | null>(null);
  const [consent, setConsent] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const question = QUESTIONS[qIndex];

  const canSubmit = useMemo(
    () => consent && audio != null && audio.duration >= MIN_SECONDS && !loading,
    [consent, audio, loading]
  );

  function newQuestion() {
    let next = qIndex;
    while (next === qIndex && QUESTIONS.length > 1) {
      next = Math.floor(Math.random() * QUESTIONS.length);
    }
    setQIndex(next);
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
      selected_question: JSON.stringify(question),
    });
  }

  function resultText() {
    if (!data) return "";
    const lines = [
      `IELTS Speaking Assessment`,
      `Overall band: ${data.overall_band}`,
      "",
    ];
    for (const c of CRITERIA) {
      const cr = data.criteria[c.key];
      lines.push(`${c.label}: ${cr.band}`);
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
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Form */}
      <form onSubmit={onSubmit} className="surface-card space-y-5 p-6">
        {/* Cue card */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--brand-gradient-soft)] p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="chip text-xs">Part 2 · Cue card</span>
            <button
              type="button"
              onClick={newQuestion}
              className="inline-flex items-center gap-1.5 text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)]"
            >
              <RefreshCw className="h-3.5 w-3.5" /> New question
            </button>
          </div>
          <h3 className="mt-3 text-base font-semibold text-[var(--color-ink)]">{question.title}</h3>
          <p className="mt-2 text-xs font-medium uppercase tracking-wide text-[var(--color-faint)]">
            You should say
          </p>
          <ul className="mt-1.5 space-y-1 text-sm text-[var(--color-muted)]">
            {question.points.map((p, i) => (
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
              <Mic className="h-4 w-4" /> Analyse my speaking
            </>
          )}
        </button>

        {(localError || error) && (
          <p className="flex items-center gap-2 text-sm text-[var(--color-danger)]">
            <AlertCircle className="h-4 w-4" /> {localError || error}
          </p>
        )}
      </form>

      {/* Result (appears below the form) */}
      <div>
        {loading && (
          <div className="surface-card flex flex-col items-center justify-center gap-4 p-16 text-center">
            <ScrollIntoViewOnMount />
            <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent)]" />
            <p className="text-sm text-[var(--color-muted)]">
              Transcribing your response and scoring it against the four IELTS criteria…
            </p>
          </div>
        )}

        {!loading && data && (
          <div className="surface-card p-6 md:p-8">
            <ScrollIntoViewOnMount />
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--color-border)] pb-5">
              <div>
                <h2 className="text-xl font-semibold">IELTS Speaking Assessment</h2>
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  {data.word_count} words · {Math.round(data.duration)}s response
                </p>
              </div>
              <ResultActions getText={resultText} onReset={reset} printTargetId="ielts-speaking-output" />
            </div>

            <div id="ielts-speaking-output" className="mt-6 space-y-7">
              {/* Overall band */}
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--brand-gradient-soft)] p-6 text-center">
                <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-faint)]">
                  Estimated overall band
                </span>
                <span className="text-5xl font-bold text-gradient">{data.overall_band}</span>
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
                          {cr.band}
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
