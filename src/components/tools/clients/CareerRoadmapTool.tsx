"use client";

import { useState } from "react";
import { Route, AlertCircle, Loader2 } from "lucide-react";
import { useAiTool } from "@/lib/useAiTool";
import { Field, TextInput, RadioCards, SubmitButton } from "@/components/ui/form";
import { ResultActions } from "@/components/tools/ResultActions";
import type { CareerRoadmapResult } from "@/lib/tools/career-roadmap";

const EXPERIENCE = [
  { value: "No experience", label: "No TEFL/ESL experience" },
  { value: "0-1 years", label: "0-1 years experience" },
  { value: "1-3 years", label: "1-3 years experience" },
  { value: "3-5 years", label: "3-5 years experience" },
  { value: "5-10 years", label: "5-10 years experience" },
  { value: "10+ years", label: "More than 10 years experience" },
];

const QUALIFICATIONS = [
  { value: "No certification", label: "No TEFL/ESL certification" },
  { value: "Basic TEFL", label: "Basic TEFL certificate (under 120 hours)" },
  { value: "120-hour TEFL/TESOL", label: "120-hour TEFL/TESOL certificate" },
  { value: "CELTA", label: "CELTA (Certificate in English Language Teaching)" },
  { value: "DELTA", label: "DELTA (Diploma in English Language Teaching)" },
  { value: "Trinity CertTESOL", label: "Trinity CertTESOL" },
  { value: "Trinity DipTESOL", label: "Trinity DipTESOL" },
  { value: "Bachelor Education", label: "Bachelor's in Education/English" },
  { value: "MA TESOL", label: "Master's in TESOL/Applied Linguistics" },
  { value: "Other advanced", label: "Other advanced qualification" },
];

const CAREER_GOALS = [
  { value: "Classroom teacher", label: "Become a full-time classroom teacher" },
  { value: "Online teacher", label: "Specialize in online English teaching" },
  { value: "Academic management", label: "Move into academic management/DOS role" },
  { value: "Teacher training", label: "Become a teacher trainer/mentor" },
  { value: "Curriculum development", label: "Work in curriculum/materials development" },
  { value: "Business English", label: "Specialize in Business English training" },
  { value: "Exam preparation", label: "Focus on exam preparation (IELTS, TOEFL, etc.)" },
  { value: "School ownership", label: "Open/manage my own language school" },
  { value: "Educational consulting", label: "Work as an educational consultant" },
  { value: "University teaching", label: "Teach at university level" },
];

// --- helpers for the loosely-typed AI payload ---
type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const asArr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const asStr = (v: unknown): string => (typeof v === "string" ? v : typeof v === "number" ? String(v) : "");
function pick(o: unknown, ...keys: string[]): string {
  if (!isObj(o)) return "";
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string" && v) return v;
    if (typeof v === "number") return String(v);
  }
  return "";
}
const humanize = (k: string) =>
  k.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

export function CareerRoadmapTool() {
  const { submit, loading, error, data, reset } = useAiTool<CareerRoadmapResult>(
    "generate_career_roadmap"
  );
  const [form, setForm] = useState({
    current_experience: "1-3 years",
    current_qualifications: "120-hour TEFL/TESOL",
    career_goals: "Business English",
    desired_timeframe: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await submit(form);
  }

  // Mirror the WP renderer's flat/nested resolution.
  const part1 = (data?.ACHIEVING_INITIAL_GOAL ?? {}) as CareerRoadmapResult;
  const part2 = (data?.CAREER_GROWTH_THEREAFTER ?? {}) as CareerRoadmapResult;
  const immediateActions = asArr(part1.immediate_action_plan ?? data?.immediate_action_plan);
  const milestones = asArr(part1.progression_milestones ?? data?.progression_milestones);
  const qualifications = asArr(part1.essential_qualifications ?? data?.essential_qualifications);
  const initialSalary = part1.initial_salary_expectations ?? data?.initial_salary_expectations;
  const successStrategy = asStr(part1.success_strategy ?? data?.success_strategy);
  const careerPhases = asArr(part2.career_growth_phases ?? data?.career_growth_phases);
  const specializations = asArr(part2.long_term_specializations ?? data?.long_term_specializations);
  const advancedQuals = asArr(part2.advanced_qualifications_timeline ?? data?.advanced_qualifications_timeline);
  const leadershipRaw = part2.leadership_progression ?? data?.leadership_progression;
  const visionSummary = asStr(part2.career_vision_summary ?? data?.career_vision_summary);

  const leadership: unknown[] = Array.isArray(leadershipRaw)
    ? leadershipRaw
    : leadershipRaw
    ? [leadershipRaw]
    : [];

  function resultText() {
    if (!data) return "";
    const lines: string[] = ["Your TEFL Career Roadmap", ""];
    lines.push(`Starting point: ${asStr(data.current_experience) || "Not specified"}`);
    lines.push(`Current qualifications: ${asStr(data.current_qualifications) || "Not specified"}`);
    lines.push(`Career goal: ${asStr(data.career_goals) || "Not specified"}`);
    lines.push(`Timeline: ${asStr(data.desired_timeframe) || "Not specified"}`);
    if (data.interpreted_timeline) lines.push(`Plan summary: ${asStr(data.interpreted_timeline)}`);
    if (visionSummary) {
      lines.push("", "Career vision:", visionSummary);
    }
    return lines.join("\n");
  }

  const hasResult = !!data;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
      {/* Form */}
      <form onSubmit={onSubmit} className="surface-card h-fit space-y-4 p-6 lg:sticky lg:top-24">
        <Field label="Current experience" required>
          <RadioCards
            name="current_experience"
            value={form.current_experience}
            onChange={(v) => set("current_experience", v)}
            options={EXPERIENCE}
            columns={2}
          />
        </Field>

        <Field label="Current qualifications" required>
          <RadioCards
            name="current_qualifications"
            value={form.current_qualifications}
            onChange={(v) => set("current_qualifications", v)}
            options={QUALIFICATIONS}
            columns={2}
          />
        </Field>

        <Field label="Career goal" required>
          <RadioCards
            name="career_goals"
            value={form.career_goals}
            onChange={(v) => set("career_goals", v)}
            options={CAREER_GOALS}
            columns={2}
          />
        </Field>

        <Field
          label="Desired timeframe"
          htmlFor="desired_timeframe"
          required
          hint='e.g. "6 months", "2 years", "18 months"'
        >
          <TextInput
            id="desired_timeframe"
            value={form.desired_timeframe}
            onChange={(e) => set("desired_timeframe", e.target.value)}
            placeholder="e.g. 2 years, 18 months…"
            required
          />
        </Field>

        <SubmitButton loading={loading}>
          <Route className="h-4 w-4" /> Generate my roadmap
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
            <p className="text-sm text-[var(--color-muted)]">
              Generating your personalized career roadmap…
            </p>
          </div>
        )}

        {!loading && !hasResult && (
          <div className="surface-card flex h-full flex-col items-center justify-center gap-4 p-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-gradient-soft)] text-[var(--color-accent)]">
              <Route className="h-7 w-7" />
            </span>
            <h3 className="text-lg font-semibold">Your career roadmap appears here</h3>
            <p className="max-w-sm text-sm text-[var(--color-muted)]">
              Share where you are and where you want to be — we&apos;ll chart the qualifications,
              milestones and salary expectations to get you there.
            </p>
          </div>
        )}

        {!loading && hasResult && (
          <div className="surface-card p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--color-border)] pb-5">
              <h2 className="text-xl font-semibold">Your TEFL Career Roadmap</h2>
              <ResultActions getText={resultText} onReset={reset} printTargetId="roadmap-output" />
            </div>

            <div id="roadmap-output" className="mt-6 space-y-8">
              {/* Overview */}
              <section className="rounded-xl border border-[var(--color-border)] bg-white/[0.02] p-5">
                <dl className="grid gap-3 sm:grid-cols-2">
                  {[
                    ["Starting point", asStr(data!.current_experience)],
                    ["Current qualifications", asStr(data!.current_qualifications)],
                    ["Career goal", asStr(data!.career_goals)],
                    ["Timeline", asStr(data!.desired_timeframe)],
                    ["Plan summary", asStr(data!.interpreted_timeline)],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <dt className="text-xs font-medium text-[var(--color-faint)]">{label}</dt>
                      <dd className="mt-0.5 text-sm text-[var(--color-muted)]">{val || "Not specified"}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              {/* PART 1 */}
              <section className="space-y-6">
                <h3 className="text-base font-semibold text-gradient">Achieving Your Initial Goal</h3>

                {immediateActions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold">Start immediately</h4>
                    <ol className="mt-3 space-y-3">
                      {immediateActions.map((action, i) => {
                        const title = typeof action === "string" ? action : pick(action, "action", "step") || `Action ${i + 1}`;
                        return (
                          <li key={i} className="rounded-xl border border-[var(--color-border)] bg-white/[0.02] p-4">
                            <p className="flex gap-2 text-sm font-medium">
                              <span className="text-[var(--color-accent)]">{i + 1}.</span> {title}
                            </p>
                            {isObj(action) && pick(action, "timeline") && (
                              <p className="mt-1 text-xs text-[var(--color-faint)]">
                                <strong>Timeline:</strong> {pick(action, "timeline")}
                              </p>
                            )}
                            {isObj(action) && pick(action, "importance") && (
                              <p className="mt-1 text-sm text-[var(--color-muted)]">{pick(action, "importance")}</p>
                            )}
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                )}

                {milestones.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold">Key milestones</h4>
                    <ul className="mt-3 space-y-3">
                      {milestones.map((m, i) => {
                        const title = typeof m === "string" ? m : pick(m, "milestone", "goal") || `Milestone ${i + 1}`;
                        return (
                          <li key={i} className="rounded-xl border border-[var(--color-border)] bg-white/[0.02] p-4">
                            <p className="text-sm font-medium">{title}</p>
                            {isObj(m) && pick(m, "target_date") && (
                              <p className="mt-1 text-xs text-[var(--color-accent)]">{pick(m, "target_date")}</p>
                            )}
                            {isObj(m) && pick(m, "requirements") && (
                              <p className="mt-1 text-sm text-[var(--color-muted)]">
                                <strong>Requirements:</strong> {pick(m, "requirements")}
                              </p>
                            )}
                            {isObj(m) && pick(m, "next_step") && (
                              <p className="mt-1 text-sm text-[var(--color-muted)]">{pick(m, "next_step")}</p>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {qualifications.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold">Essential qualifications</h4>
                    <ul className="mt-3 space-y-3">
                      {qualifications.map((q, i) => {
                        const title = typeof q === "string" ? q : pick(q, "qualification", "name");
                        return (
                          <li key={i} className="rounded-xl border border-[var(--color-border)] bg-white/[0.02] p-4">
                            <p className="text-sm font-medium">{title}</p>
                            {isObj(q) && pick(q, "when_to_get") && (
                              <p className="mt-1 text-xs text-[var(--color-accent)]">{pick(q, "when_to_get")}</p>
                            )}
                            {isObj(q) && pick(q, "time_to_complete") && (
                              <p className="mt-1 text-sm text-[var(--color-muted)]">
                                <strong>Duration:</strong> {pick(q, "time_to_complete")}
                              </p>
                            )}
                            {isObj(q) && pick(q, "why_essential") && (
                              <p className="mt-1 text-sm text-[var(--color-muted)]">{pick(q, "why_essential")}</p>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {initialSalary != null && (isObj(initialSalary) || Array.isArray(initialSalary)) && (
                  <div>
                    <h4 className="text-sm font-semibold">Initial salary expectations</h4>
                    {isObj(initialSalary) && (
                      <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                        {Object.entries(initialSalary).map(([k, v]) => (
                          <div key={k} className="rounded-lg border border-[var(--color-border)] bg-white/[0.02] p-3">
                            <dt className="text-xs font-medium text-[var(--color-faint)]">{humanize(k)}</dt>
                            <dd className="mt-0.5 text-sm text-[var(--color-muted)]">{asStr(v)}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                    {Array.isArray(initialSalary) && (
                      <ul className="mt-3 space-y-3">
                        {initialSalary.map((item, i) => (
                          <li key={i} className="rounded-xl border border-[var(--color-border)] bg-white/[0.02] p-4">
                            <p className="text-sm font-medium">{pick(item, "timepoint", "period")}</p>
                            {pick(item, "expected_position") && (
                              <p className="mt-1 text-sm text-[var(--color-muted)]">{pick(item, "expected_position")}</p>
                            )}
                            <p className="mt-1 text-sm font-medium text-[var(--color-accent)]">
                              {pick(item, "salary_range", "range")}
                            </p>
                            {pick(item, "location_note") && (
                              <p className="mt-1 text-xs text-[var(--color-faint)]">{pick(item, "location_note")}</p>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {successStrategy && (
                  <div>
                    <h4 className="text-sm font-semibold">Your success strategy</h4>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">{successStrategy}</p>
                  </div>
                )}
              </section>

              {/* PART 2 */}
              <section className="space-y-6">
                <h3 className="text-base font-semibold text-gradient">Career Growth Beyond Your Initial Goal</h3>

                {careerPhases.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold">Career growth phases</h4>
                    <ol className="mt-3 space-y-3">
                      {careerPhases.map((phase, i) => (
                        <li key={i} className="rounded-xl border border-[var(--color-border)] bg-white/[0.02] p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h5 className="font-semibold">{pick(phase, "phase", "title")}</h5>
                            {pick(phase, "timeframe") && (
                              <span className="text-xs text-[var(--color-accent)]">{pick(phase, "timeframe")}</span>
                            )}
                          </div>
                          {pick(phase, "description") && (
                            <p className="mt-1 text-sm text-[var(--color-muted)]">{pick(phase, "description")}</p>
                          )}
                          {pick(phase, "qualifications_needed") && (
                            <p className="mt-2 text-sm text-[var(--color-muted)]">
                              <strong className="text-[var(--color-ink)]">Qualifications needed:</strong> {pick(phase, "qualifications_needed")}
                            </p>
                          )}
                          {pick(phase, "salary_range") && (
                            <p className="mt-1 text-sm text-[var(--color-muted)]">
                              <strong className="text-[var(--color-ink)]">Salary range:</strong> {pick(phase, "salary_range")}
                            </p>
                          )}
                          {pick(phase, "advancement_path") && (
                            <p className="mt-1 text-sm text-[var(--color-muted)]">
                              <strong className="text-[var(--color-ink)]">How to get there:</strong> {pick(phase, "advancement_path")}
                            </p>
                          )}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {specializations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold">Specialization paths</h4>
                    <ul className="mt-3 space-y-3">
                      {specializations.map((spec, i) => (
                        <li key={i} className="rounded-xl border border-[var(--color-border)] bg-white/[0.02] p-4">
                          <h5 className="font-semibold">{pick(spec, "specialization", "name")}</h5>
                          {pick(spec, "when_to_consider") && (
                            <p className="mt-1 text-xs text-[var(--color-accent)]">{pick(spec, "when_to_consider")}</p>
                          )}
                          {pick(spec, "requirements") && (
                            <p className="mt-1 text-sm text-[var(--color-muted)]">
                              <strong>Requirements:</strong> {pick(spec, "requirements")}
                            </p>
                          )}
                          {pick(spec, "career_potential") && (
                            <p className="mt-1 text-sm text-[var(--color-muted)]">{pick(spec, "career_potential")}</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {advancedQuals.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold">Advanced qualifications timeline</h4>
                    <ul className="mt-3 space-y-3">
                      {advancedQuals.map((qual, i) => (
                        <li key={i} className="rounded-xl border border-[var(--color-border)] bg-white/[0.02] p-4">
                          <h5 className="font-semibold">{pick(qual, "qualification", "name")}</h5>
                          {pick(qual, "optimal_timing") && (
                            <p className="mt-1 text-xs text-[var(--color-accent)]">{pick(qual, "optimal_timing")}</p>
                          )}
                          {pick(qual, "career_doors_opened") && (
                            <p className="mt-1 text-sm text-[var(--color-muted)]">
                              <strong>Opens doors to:</strong> {pick(qual, "career_doors_opened")}
                            </p>
                          )}
                          {pick(qual, "investment_return") && (
                            <p className="mt-1 text-sm text-[var(--color-muted)]">
                              <strong>Return on investment:</strong> {pick(qual, "investment_return")}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {leadership.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold">Leadership &amp; management path</h4>
                    <ul className="mt-3 space-y-3">
                      {leadership.map((leader, i) =>
                        isObj(leader) ? (
                          <li key={i} className="rounded-xl border border-[var(--color-border)] bg-white/[0.02] p-4">
                            <h5 className="font-semibold">{pick(leader, "leadership_level", "title")}</h5>
                            {pick(leader, "typical_timeline") && (
                              <p className="mt-1 text-xs text-[var(--color-accent)]">{pick(leader, "typical_timeline")}</p>
                            )}
                            {pick(leader, "responsibilities") && (
                              <p className="mt-1 text-sm text-[var(--color-muted)]">{pick(leader, "responsibilities")}</p>
                            )}
                            {pick(leader, "preparation_needed") && (
                              <p className="mt-1 text-sm text-[var(--color-muted)]">
                                <strong>Preparation needed:</strong> {pick(leader, "preparation_needed")}
                              </p>
                            )}
                            {pick(leader, "salary_potential") && (
                              <p className="mt-1 text-sm text-[var(--color-muted)]">
                                <strong>Salary potential:</strong> {pick(leader, "salary_potential")}
                              </p>
                            )}
                          </li>
                        ) : null
                      )}
                    </ul>
                  </div>
                )}
              </section>

              {/* Vision */}
              {visionSummary && (
                <section className="rounded-xl border border-[var(--color-accent)]/40 bg-[var(--brand-gradient-soft)] p-6">
                  <h3 className="text-base font-semibold text-gradient">Your Career Vision</h3>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">{visionSummary}</p>
                </section>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
