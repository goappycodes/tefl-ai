"use client";

import { useState } from "react";
import { Wallet, AlertCircle, Loader2 } from "lucide-react";
import { useAiTool } from "@/lib/useAiTool";
import { Field, TextInput, Select, RadioCards, SubmitButton } from "@/components/ui/form";
import { ResultActions } from "@/components/tools/ResultActions";
import type {
  EarningProjectionResult,
  EarningTimelinePhase,
} from "@/lib/tools/earning-projection";

const COUNTRIES_BY_REGION: Record<string, string[]> = {
  Asia: ["China", "South Korea", "Japan", "Thailand", "Vietnam", "Taiwan", "Indonesia", "Malaysia", "Singapore"],
  Europe: ["Spain", "Italy", "France", "Germany", "Czech Republic", "Poland", "Turkey", "Russia"],
  "Middle East": ["Saudi Arabia", "UAE", "Qatar", "Kuwait", "Oman"],
  "Latin America": ["Mexico", "Brazil", "Argentina", "Chile", "Colombia", "Costa Rica"],
  Africa: ["South Africa", "Morocco", "Egypt", "Kenya"],
};

const EXPERIENCE = ["No experience", "1-3 years", "3-5 years", "5+ years"];

const QUALIFICATIONS = [
  "Bachelor's Degree only",
  "TEFL/TESOL Certificate (120+ hours)",
  "CELTA/Trinity CertTESOL",
  "Master's in Education/Applied Linguistics",
  "DELTA/Trinity DipTESOL",
  "Other teaching qualification",
];

const WEEKLY_HOURS = [
  { value: "1-5", label: "1 to 5 hours per week" },
  { value: "6-10", label: "6 to 10 hours per week" },
  { value: "11-20", label: "11 to 20 hours per week" },
  { value: "21-30", label: "21 to 30 hours per week" },
  { value: "31+", label: "More than 30 hours per week" },
];

const TEACHING_MODES = [
  { value: "Online", label: "I teach online" },
  { value: "In-person", label: "I teach in person" },
  { value: "Both", label: "I teach both online and in person" },
];

const PHASES: { key: keyof NonNullable<EarningProjectionResult["career_progression_timeline"]>; title: string }[] = [
  { key: "year_1_2", title: "Years 1-2" },
  { key: "year_3_5", title: "Years 3-5" },
  { key: "year_5_10", title: "Years 5-10" },
  { key: "year_10_plus", title: "10+ Years" },
];

function PhaseList({ title, items }: { title: string; items?: string[] }) {
  if (!items?.length) return null;
  return (
    <div className="mt-2">
      <p className="text-xs font-semibold text-[var(--color-faint)]">{title}</p>
      <ul className="mt-1 space-y-1">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2 text-sm text-[var(--color-muted)]">
            <span className="text-[var(--color-accent)]">•</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function EarningProjectionTool() {
  const { submit, loading, error, data, reset } = useAiTool<EarningProjectionResult>(
    "generate_earning_projection"
  );
  const [form, setForm] = useState({
    country: "",
    custom_country: "",
    experience_level: "1-3 years",
    qualification_level: "TEFL/TESOL Certificate (120+ hours)",
    weekly_hours: "11-20",
    class_type: "In-person",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await submit(form);
  }

  function resultText() {
    if (!data) return "";
    const lines: string[] = ["Your TEFL Earning Projection", ""];
    const m = data.market_overview;
    if (m) {
      lines.push("MARKET OVERVIEW");
      if (m.country_demand) lines.push(`Demand: ${m.country_demand}`);
      if (m.competition_level) lines.push(`Competition: ${m.competition_level}`);
      if (m.best_opportunities) lines.push(`Best opportunities: ${m.best_opportunities}`);
      if (m.cost_of_living_context) lines.push(`Cost of living: ${m.cost_of_living_context}`);
      lines.push("");
    }
    const e = data.current_earning_potential;
    if (e) {
      lines.push("CURRENT EARNING POTENTIAL");
      if (e.monthly_range_usd) lines.push(`Monthly: ${e.monthly_range_usd}`);
      if (e.annual_equivalent) lines.push(`Annual: ${e.annual_equivalent}`);
      if (e.hourly_breakdown) lines.push(`Hourly: ${e.hourly_breakdown}`);
      if (e.confidence_level) lines.push(`Confidence: ${e.confidence_level}`);
      lines.push("");
    }
    return lines.join("\n");
  }

  const timeline = data?.career_progression_timeline;
  const benefits = data?.benefits_package;
  const rec = data?.strategic_recommendations;
  const reality = data?.reality_check;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
      {/* Form */}
      <form onSubmit={onSubmit} className="surface-card h-fit space-y-4 p-6 lg:sticky lg:top-24">
        <Field label="Where do you want to teach?" htmlFor="country" required>
          <Select id="country" value={form.country} onChange={(e) => set("country", e.target.value)} required>
            <option value="">Select a country</option>
            {Object.entries(COUNTRIES_BY_REGION).map(([region, countries]) => (
              <optgroup key={region} label={region}>
                {countries.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </optgroup>
            ))}
            <option value="custom">Any other country…</option>
          </Select>
        </Field>

        {form.country === "custom" && (
          <Field label="Country name" htmlFor="custom_country" required>
            <TextInput
              id="custom_country"
              value={form.custom_country}
              onChange={(e) => set("custom_country", e.target.value)}
              placeholder="Enter any country name"
              required
            />
          </Field>
        )}

        <Field label="Teaching experience" required>
          <RadioCards
            name="experience_level"
            value={form.experience_level}
            onChange={(v) => set("experience_level", v)}
            options={EXPERIENCE.map((x) => ({ value: x, label: x }))}
            columns={2}
          />
        </Field>

        <Field label="Current qualifications" required>
          <RadioCards
            name="qualification_level"
            value={form.qualification_level}
            onChange={(v) => set("qualification_level", v)}
            options={QUALIFICATIONS.map((x) => ({ value: x, label: x }))}
            columns={2}
          />
        </Field>

        <Field label="Weekly teaching hours" required>
          <RadioCards
            name="weekly_hours"
            value={form.weekly_hours}
            onChange={(v) => set("weekly_hours", v)}
            options={WEEKLY_HOURS}
            columns={2}
          />
        </Field>

        <Field label="Online or in-person teaching" required>
          <RadioCards
            name="class_type"
            value={form.class_type}
            onChange={(v) => set("class_type", v)}
            options={TEACHING_MODES}
            columns={3}
          />
        </Field>

        <SubmitButton loading={loading}>
          <Wallet className="h-4 w-4" /> See your earning
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
            <p className="text-sm text-[var(--color-muted)]">Estimating your earning…</p>
          </div>
        )}

        {!loading && !data && (
          <div className="surface-card flex h-full flex-col items-center justify-center gap-4 p-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-gradient-soft)] text-[var(--color-accent)]">
              <Wallet className="h-7 w-7" />
            </span>
            <h3 className="text-lg font-semibold">Your earning projection appears here</h3>
            <p className="max-w-sm text-sm text-[var(--color-muted)]">
              Pick your destination and profile and we&apos;ll project your monthly earnings,
              benefits, career timeline and a realistic market outlook.
            </p>
          </div>
        )}

        {!loading && data && (
          <div className="surface-card p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--color-border)] pb-5">
              <h2 className="text-xl font-semibold">Your TEFL Earning Projection</h2>
              <ResultActions getText={resultText} onReset={reset} printTargetId="earning-output" />
            </div>

            <div id="earning-output" className="mt-6 space-y-8">
              {/* Current earning potential */}
              {data.current_earning_potential && (
                <section className="rounded-xl border border-[var(--color-accent)]/40 bg-[var(--brand-gradient-soft)] p-6 text-center">
                  <h3 className="text-base font-semibold text-gradient">Your Current Earning Potential</h3>
                  <p className="mt-3 text-3xl font-bold">
                    {data.current_earning_potential.monthly_range_usd || "Not available"}
                  </p>
                  <p className="text-sm text-[var(--color-muted)]">per month</p>
                  <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm">
                    {data.current_earning_potential.annual_equivalent && (
                      <span className="text-[var(--color-muted)]">
                        <strong className="text-[var(--color-ink)]">Annual:</strong>{" "}
                        {data.current_earning_potential.annual_equivalent}
                      </span>
                    )}
                    {data.current_earning_potential.hourly_breakdown && (
                      <span className="text-[var(--color-muted)]">
                        <strong className="text-[var(--color-ink)]">Hourly:</strong>{" "}
                        {data.current_earning_potential.hourly_breakdown}
                      </span>
                    )}
                  </div>
                  {data.current_earning_potential.confidence_level && (
                    <span className="mt-4 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
                      Confidence: {data.current_earning_potential.confidence_level}
                    </span>
                  )}
                </section>
              )}

              {/* Market overview */}
              {data.market_overview && (
                <section>
                  <h3 className="text-base font-semibold text-gradient">Market Overview</h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {([
                      ["Demand Level", data.market_overview.country_demand],
                      ["Competition", data.market_overview.competition_level],
                      ["Best Opportunities", data.market_overview.best_opportunities],
                      ["Cost of Living", data.market_overview.cost_of_living_context],
                    ] as const).map(([label, val]) =>
                      val ? (
                        <div key={label} className="rounded-xl border border-[var(--color-border)] bg-white/[0.02] p-4">
                          <p className="text-xs font-medium text-[var(--color-faint)]">{label}</p>
                          <p className="mt-1 text-sm text-[var(--color-muted)]">{val}</p>
                        </div>
                      ) : null
                    )}
                  </div>
                </section>
              )}

              {/* Career progression timeline */}
              {timeline && (
                <section>
                  <h3 className="text-base font-semibold text-gradient">Career Progression Timeline</h3>
                  <div className="mt-3 space-y-3">
                    {PHASES.map((p) => {
                      const phase = timeline[p.key] as EarningTimelinePhase | undefined;
                      if (!phase) return null;
                      return (
                        <div key={p.key} className="rounded-xl border border-[var(--color-border)] bg-white/[0.02] p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h4 className="font-semibold">{p.title}</h4>
                            <span className="text-sm font-medium text-[var(--color-accent)]">
                              {phase.salary_range || "TBD"}
                            </span>
                          </div>
                          {phase.role && (
                            <p className="mt-1 text-sm text-[var(--color-muted)]">
                              <strong className="text-[var(--color-ink)]">Role:</strong> {phase.role}
                            </p>
                          )}
                          {phase.key_focus && (
                            <p className="mt-1 text-sm text-[var(--color-muted)]">
                              <strong className="text-[var(--color-ink)]">Focus:</strong> {phase.key_focus}
                            </p>
                          )}
                          <PhaseList title="Required qualifications" items={phase.required_qualifications} />
                          <PhaseList title="Leadership paths" items={phase.leadership_opportunities} />
                          <PhaseList title="Specializations" items={phase.specialization_paths} />
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Benefits package */}
              {benefits && (
                <section>
                  <h3 className="text-base font-semibold text-gradient">Complete Benefits Package</h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {benefits.housing && (
                      <div className="rounded-xl border border-[var(--color-border)] bg-white/[0.02] p-4">
                        <h5 className="font-semibold">Housing</h5>
                        {benefits.housing.typical_arrangement && (
                          <p className="mt-1 text-sm text-[var(--color-muted)]">{benefits.housing.typical_arrangement}</p>
                        )}
                        {benefits.housing.estimated_value && (
                          <p className="mt-1 text-xs text-[var(--color-faint)]">Value: {benefits.housing.estimated_value}</p>
                        )}
                      </div>
                    )}
                    {([
                      ["Flights & Vacation", benefits.flights_vacation],
                      ["Health Insurance", benefits.health_insurance],
                      ["Contract Terms", benefits.contract_terms],
                    ] as const).map(([label, val]) =>
                      val ? (
                        <div key={label} className="rounded-xl border border-[var(--color-border)] bg-white/[0.02] p-4">
                          <h5 className="font-semibold">{label}</h5>
                          <p className="mt-1 text-sm text-[var(--color-muted)]">{val}</p>
                        </div>
                      ) : null
                    )}
                  </div>
                  {benefits.total_compensation_value && (
                    <p className="mt-3 rounded-xl border border-[var(--color-accent)]/40 bg-[var(--brand-gradient-soft)] p-4 text-center text-sm font-semibold">
                      Total Compensation: {benefits.total_compensation_value}
                    </p>
                  )}
                </section>
              )}

              {/* Strategic recommendations */}
              {rec && (
                <section>
                  <h3 className="text-base font-semibold text-gradient">Strategic Recommendations</h3>
                  <div className="mt-3 space-y-3">
                    <PhaseList title="Immediate action steps" items={rec.immediate_steps} />
                    <PhaseList title="Qualification priorities" items={rec.qualification_priorities} />
                    {rec.market_positioning && (
                      <div>
                        <p className="text-xs font-semibold text-[var(--color-faint)]">Market positioning</p>
                        <p className="mt-1 text-sm text-[var(--color-muted)]">{rec.market_positioning}</p>
                      </div>
                    )}
                    <PhaseList title="Alternative opportunities" items={rec.alternative_opportunities} />
                  </div>
                </section>
              )}

              {/* Reality check */}
              {reality && (
                <section>
                  <h3 className="text-base font-semibold text-gradient">Reality Check</h3>
                  <div className="mt-3 space-y-3">
                    <PhaseList title="Potential challenges" items={reality.potential_challenges} />
                    {reality.market_saturation && (
                      <div>
                        <p className="text-xs font-semibold text-[var(--color-faint)]">Market saturation</p>
                        <p className="mt-1 text-sm text-[var(--color-muted)]">{reality.market_saturation}</p>
                      </div>
                    )}
                    {reality.economic_factors && (
                      <div>
                        <p className="text-xs font-semibold text-[var(--color-faint)]">Economic factors</p>
                        <p className="mt-1 text-sm text-[var(--color-muted)]">{reality.economic_factors}</p>
                      </div>
                    )}
                    {reality.success_probability && (
                      <div>
                        <p className="text-xs font-semibold text-[var(--color-faint)]">Success probability</p>
                        <p className="mt-1 text-sm text-[var(--color-muted)]">{reality.success_probability}</p>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
