"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ListChecks,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Trophy,
  Target,
  BookOpen,
  GraduationCap,
  RotateCcw,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { useAiTool } from "@/lib/useAiTool";
import { ResultActions } from "@/components/tools/ResultActions";
import type {
  EltQuestion,
  EltAnalysisResult,
} from "@/lib/tools/english-level-test";

const QUESTION_COUNT = 20;

const PROVIDER_NAMES: Record<string, string> = {
  teflinstitute: "TEFL Institute",
  tefl_ie: "TEFL.ie",
  premiertefl: "Premier TEFL",
};

function cefrColor(level: string): string {
  const l = (level || "").toUpperCase();
  if (l.startsWith("A")) return "var(--color-accent)";
  if (l.startsWith("B")) return "var(--color-accent)";
  return "var(--color-accent)";
}

export function EnglishLevelTestTool() {
  const questionsApi = useAiTool<EltQuestion[]>("get_tefl_elt_questions");
  const analysisApi = useAiTool<EltAnalysisResult>("process_english_level_test");

  const [questions, setQuestions] = useState<EltQuestion[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [current, setCurrent] = useState(0);
  const [showAnswers, setShowAnswers] = useState(false);
  const started = useRef(false);

  // Fetch the question set once on mount.
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      const qs = await questionsApi.submit({ count: QUESTION_COUNT });
      if (qs) setQuestions(qs);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const result = analysisApi.data;
  const total = questions?.length ?? 0;
  const answeredCount = useMemo(
    () => (questions ? questions.filter((q) => answers[q.name]).length : 0),
    [questions, answers]
  );

  function choose(name: string, value: string) {
    setAnswers((a) => ({ ...a, [name]: value }));
  }

  async function finish() {
    if (!questions) return;
    const payload: Record<string, unknown> = { questions_data: questions };
    questions.forEach((_, i) => {
      payload[`q${i + 1}`] = answers[`q${i + 1}`] ?? "";
    });
    await analysisApi.submit(payload);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function retake() {
    analysisApi.reset();
    setAnswers({});
    setCurrent(0);
    setShowAnswers(false);
    setQuestions(null);
    started.current = false;
    // re-fetch
    (async () => {
      started.current = true;
      const qs = await questionsApi.submit({ count: QUESTION_COUNT });
      if (qs) setQuestions(qs);
    })();
  }

  function resultText() {
    if (!result) return "";
    const lines = [
      `English Level: ${result.overall_cefr_level}`,
      `Score: ${result.score_percentage}% (${result.correct_answers}/${result.total_questions})`,
      "",
      "SKILL BREAKDOWN",
      ...Object.entries(result.skill_breakdown).map(
        ([k, s]) => `• ${k}: ${s.level} — ${s.score}% — ${s.feedback}`
      ),
      "",
      "STRENGTHS",
      ...result.strengths.map((s) => `• ${s}`),
      "",
      "AREAS FOR IMPROVEMENT",
      ...result.areas_for_improvement.map((s) => `• ${s}`),
      "",
      "NEXT STEPS",
      ...result.next_steps.map((s) => `• ${s}`),
    ];
    return lines.join("\n");
  }

  /* ─────────────── RESULT ─────────────── */
  if (result) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Hero score */}
        <div className="surface-card overflow-hidden p-0">
          <div className="relative bg-[var(--brand-gradient-soft)] p-8 text-center md:p-10">
            <span className="eyebrow mx-auto flex w-fit">
              <Trophy className="h-3.5 w-3.5" /> Your result
            </span>
            <div className="mt-4 flex flex-col items-center gap-2">
              <span
                className="flex h-24 w-24 items-center justify-center rounded-3xl text-4xl font-bold text-white"
                style={{ background: "var(--brand-gradient, var(--color-accent))", color: cefrColor(result.overall_cefr_level) }}
              >
                {result.overall_cefr_level}
              </span>
              <h2 className="mt-2 text-2xl font-bold">
                Your English level is {result.overall_cefr_level}
              </h2>
              <p className="max-w-xl text-pretty text-sm text-[var(--color-muted)]">
                {result.motivational_message}
              </p>
            </div>
            <div className="mt-6 flex items-center justify-center gap-6">
              <div>
                <div className="text-3xl font-bold text-gradient">
                  {result.score_percentage}%
                </div>
                <div className="text-xs text-[var(--color-faint)]">Overall score</div>
              </div>
              <div className="h-10 w-px bg-[var(--color-border)]" />
              <div>
                <div className="text-3xl font-bold">
                  {result.correct_answers}/{result.total_questions}
                </div>
                <div className="text-xs text-[var(--color-faint)]">Correct answers</div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end border-t border-[var(--color-border)] p-4">
            <ResultActions getText={resultText} onReset={retake} printTargetId="elt-output" />
          </div>
        </div>

        <div id="elt-output" className="space-y-6">
          {/* Skill breakdown */}
          <section className="surface-card p-6 md:p-8">
            <h3 className="flex items-center gap-2 text-base font-semibold text-gradient">
              <Target className="h-5 w-5" /> Skill breakdown
            </h3>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {Object.entries(result.skill_breakdown).map(([skill, s]) => (
                <div key={skill} className="rounded-xl border border-[var(--color-border)] bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{skill}</span>
                    {s.level && (
                      <span className="chip !py-1 !px-2 text-xs">{s.level}</span>
                    )}
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-[var(--color-accent)] transition-all"
                      style={{ width: `${Math.max(0, Math.min(100, s.score))}%` }}
                    />
                  </div>
                  <div className="mt-1 text-right text-xs text-[var(--color-faint)]">{s.score}%</div>
                  {s.feedback && (
                    <p className="mt-2 text-xs leading-relaxed text-[var(--color-muted)]">{s.feedback}</p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Strengths & improvements */}
          <div className="grid gap-6 md:grid-cols-2">
            {result.strengths?.length > 0 && (
              <section className="surface-card p-6">
                <h3 className="flex items-center gap-2 text-base font-semibold">
                  <CheckCircle2 className="h-5 w-5 text-[var(--color-success)]" /> Your strengths
                </h3>
                <ul className="mt-3 space-y-2">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="flex gap-2 text-sm text-[var(--color-muted)]">
                      <span className="text-[var(--color-success)]">✓</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {result.areas_for_improvement?.length > 0 && (
              <section className="surface-card p-6">
                <h3 className="flex items-center gap-2 text-base font-semibold">
                  <Target className="h-5 w-5 text-[var(--color-accent)]" /> Areas to improve
                </h3>
                <ul className="mt-3 space-y-2">
                  {result.areas_for_improvement.map((s, i) => (
                    <li key={i} className="flex gap-2 text-sm text-[var(--color-muted)]">
                      <span className="text-[var(--color-accent)]">→</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Detailed analysis */}
          {result.detailed_analysis && (
            <section className="surface-card p-6 md:p-8">
              <h3 className="flex items-center gap-2 text-base font-semibold text-gradient">
                <BookOpen className="h-5 w-5" /> Detailed analysis
              </h3>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-muted)]">
                {result.detailed_analysis}
              </p>
            </section>
          )}

          {/* Next steps */}
          {result.next_steps?.length > 0 && (
            <section className="surface-card p-6 md:p-8">
              <h3 className="flex items-center gap-2 text-base font-semibold text-gradient">
                <ArrowRight className="h-5 w-5" /> Recommended next steps
              </h3>
              <ol className="mt-3 space-y-3">
                {result.next_steps.map((s, i) => (
                  <li key={i} className="flex gap-3 text-sm text-[var(--color-muted)]">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--brand-gradient-soft)] text-xs font-semibold text-[var(--color-accent)]">
                      {i + 1}
                    </span>
                    <span className="pt-0.5">{s}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Course recommendations */}
          {result.course_recommendations && (
            <section className="surface-card p-6 md:p-8">
              <h3 className="flex items-center gap-2 text-base font-semibold text-gradient">
                <GraduationCap className="h-5 w-5" /> Course recommendations
              </h3>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {Object.entries(result.course_recommendations).map(([p, c]) => (
                  <div key={p} className="flex flex-col rounded-xl border border-[var(--color-border)] bg-white/[0.02] p-4">
                    <span className="text-xs font-semibold text-[var(--color-accent)]">
                      {PROVIDER_NAMES[p] ?? p}
                    </span>
                    <span className="mt-1 text-sm font-medium">{c.course}</span>
                    <p className="mt-2 flex-1 text-xs leading-relaxed text-[var(--color-muted)]">{c.reason}</p>
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-accent)] hover:underline"
                    >
                      View course <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Answer review */}
          {questions && (
            <section className="surface-card p-6 md:p-8">
              <button
                type="button"
                onClick={() => setShowAnswers((v) => !v)}
                className="flex w-full items-center justify-between text-base font-semibold"
              >
                <span className="flex items-center gap-2 text-gradient">
                  <ListChecks className="h-5 w-5" /> Review answers & explanations
                </span>
                <ChevronDown className={`h-5 w-5 transition ${showAnswers ? "rotate-180" : ""}`} />
              </button>
              {showAnswers && (
                <div className="mt-5 space-y-4">
                  {questions.map((q, i) => {
                    const ans = answers[q.name] ?? "";
                    const ok =
                      ans.trim().toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, " ") ===
                      q.correct.trim().toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, " ");
                    return (
                      <div key={q.name} className="rounded-xl border border-[var(--color-border)] bg-white/[0.02] p-4">
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="text-sm font-medium">
                            {i + 1}. {q.question}
                          </h4>
                          <span className="chip shrink-0 !py-1 !px-2 text-xs">
                            {q.level} · {q.skill}
                          </span>
                        </div>
                        {q.passage && (
                          <p className="mt-2 rounded-lg bg-white/[0.03] p-3 text-xs italic text-[var(--color-muted)]">
                            {q.passage}
                          </p>
                        )}
                        <div className="mt-3 space-y-1 text-sm">
                          <div className={`flex items-center gap-2 ${ok ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}>
                            {ok ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                            <span>Your answer: {ans || "—"}</span>
                          </div>
                          {!ok && (
                            <div className="flex items-center gap-2 text-[var(--color-success)]">
                              <CheckCircle2 className="h-4 w-4" />
                              <span>Correct: {q.correct}</span>
                            </div>
                          )}
                        </div>
                        {q.explanation && (
                          <p className="mt-2 text-xs leading-relaxed text-[var(--color-faint)]">
                            {q.explanation}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          <div className="flex justify-center">
            <button type="button" onClick={retake} className="btn btn-ghost">
              <RotateCcw className="h-4 w-4" /> Retake the test
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ─────────────── ANALYZING ─────────────── */
  if (analysisApi.loading) {
    return (
      <div className="surface-card mx-auto flex max-w-2xl flex-col items-center justify-center gap-4 p-16 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent)]" />
        <p className="text-sm text-[var(--color-muted)]">Analysing your English level…</p>
      </div>
    );
  }

  /* ─────────────── LOADING QUESTIONS ─────────────── */
  if (questionsApi.loading || (!questions && !questionsApi.error)) {
    return (
      <div className="surface-card mx-auto flex max-w-2xl flex-col items-center justify-center gap-4 p-16 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-gradient-soft)] text-[var(--color-accent)]">
          <Loader2 className="h-7 w-7 animate-spin" />
        </span>
        <h3 className="text-lg font-semibold">Building your adaptive test…</h3>
        <p className="max-w-sm text-sm text-[var(--color-muted)]">
          We&apos;re generating a fresh set of {QUESTION_COUNT} questions across grammar,
          vocabulary and reading, spanning every CEFR level.
        </p>
      </div>
    );
  }

  /* ─────────────── ERROR ─────────────── */
  if (questionsApi.error || !questions) {
    return (
      <div className="surface-card mx-auto flex max-w-2xl flex-col items-center justify-center gap-4 p-16 text-center">
        <AlertCircle className="h-8 w-8 text-[var(--color-danger)]" />
        <h3 className="text-lg font-semibold">Couldn&apos;t load the test</h3>
        <p className="max-w-sm text-sm text-[var(--color-muted)]">
          {questionsApi.error || "Something went wrong generating your questions."}
        </p>
        <button type="button" onClick={retake} className="btn btn-primary">
          <RotateCcw className="h-4 w-4" /> Try again
        </button>
      </div>
    );
  }

  /* ─────────────── QUIZ (one question at a time) ─────────────── */
  const q = questions[current];
  const selected = answers[q.name];
  const isLast = current === total - 1;
  const progress = Math.round(((current + (selected ? 1 : 0)) / total) * 100);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="surface-card p-6 md:p-8">
        {/* Progress */}
        <div className="flex items-center justify-between text-xs text-[var(--color-faint)]">
          <span>
            Question {current + 1} of {total}
          </span>
          <span>{answeredCount} answered</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question */}
        <div className="mt-6">
          <span className="chip !py-1 !px-2 text-xs">
            {q.level} · {q.skill}
          </span>
          {q.passage && (
            <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-white/[0.03] p-4">
              <p className="text-xs font-semibold text-[var(--color-faint)]">📖 Read the passage</p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">{q.passage}</p>
            </div>
          )}
          <h3 className="mt-4 text-lg font-semibold leading-snug">{q.question}</h3>

          <div className="mt-4 space-y-2.5">
            {q.options.map((opt) => {
              const active = selected === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => choose(q.name, opt)}
                  aria-pressed={active}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${
                    active
                      ? "border-[var(--color-accent)] bg-[var(--brand-gradient-soft)] text-[var(--color-ink)]"
                      : "border-[var(--color-border)] bg-white/[0.03] text-[var(--color-muted)] hover:border-[var(--color-faint)]"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                      active
                        ? "border-[var(--color-accent)] bg-[var(--color-accent)]"
                        : "border-[var(--color-faint)]"
                    }`}
                  >
                    {active && <span className="h-2 w-2 rounded-full bg-white" />}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Nav */}
        <div className="mt-7 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
            className="btn btn-ghost disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          {isLast ? (
            <button
              type="button"
              onClick={finish}
              disabled={answeredCount < total}
              className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              {answeredCount < total ? `Answer all ${total} questions` : "See my result"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCurrent((c) => Math.min(total - 1, c + 1))}
              className="btn btn-primary"
            >
              Next <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Quick jump dots */}
      <div className="mt-5 flex flex-wrap justify-center gap-1.5">
        {questions.map((qq, i) => {
          const done = !!answers[qq.name];
          const here = i === current;
          return (
            <button
              key={qq.name}
              type="button"
              onClick={() => setCurrent(i)}
              aria-label={`Go to question ${i + 1}`}
              className={`h-2.5 w-2.5 rounded-full transition ${
                here
                  ? "bg-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/40"
                  : done
                    ? "bg-[var(--color-accent)]/60"
                    : "bg-white/[0.12] hover:bg-white/25"
              }`}
            />
          );
        })}
      </div>

      {analysisApi.error && (
        <p className="mt-4 flex items-center justify-center gap-2 text-sm text-[var(--color-danger)]">
          <AlertCircle className="h-4 w-4" /> {analysisApi.error}
        </p>
      )}
    </div>
  );
}
