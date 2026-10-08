"use client";

import { useState } from "react";
import { Globe2, AlertCircle, Loader2, Check, X, Sparkles } from "lucide-react";
import { useAiTool } from "@/lib/useAiTool";
import { Field, TextInput, Select, RadioCards, SubmitButton } from "@/components/ui/form";
import { ResultActions } from "@/components/tools/ResultActions";
import { ScrollIntoViewOnMount } from "@/components/tools/ScrollIntoViewOnMount";
import type { CountryEligibilityResult, CountryDetails } from "@/lib/tools/country-eligibility";

const DEGREE_OPTIONS = [
  { value: "bachelor", label: "I have a bachelor's degree" },
  { value: "master", label: "I have a master's degree or higher" },
  { value: "completed", label: "I have completed my degree" },
  { value: "pursuing", label: "I am currently pursuing my degree" },
  { value: "diploma", label: "I have a diploma / equivalent qualification" },
  { value: "no_degree", label: "I do not have a degree" },
] as const;

const TEFL_OPTIONS = [
  "120 hours + TEFL certification",
  "Level 5 TEFL certification",
  "CELTA / CertTESOL",
  "DELTA / DipTESOL",
  "Masters Degree in TEFL",
  "No TEFL certification",
];

const DETAIL_ROWS: { key: keyof CountryDetails; label: string }[] = [
  { key: "earning_estimation", label: "Expected Earnings" },
  { key: "teacher_demand", label: "Teacher Demand" },
  { key: "best_time_to_apply", label: "Best Time to Apply" },
  { key: "native_speaker_preference", label: "Native Speaker Status" },
  { key: "visa_requirements", label: "Visa Requirements" },
  { key: "reasons_to_choose", label: "Why Choose This Country" },
];

export function CountryEligibilityTool() {
  const { submit, loading, error, data, reset } = useAiTool<CountryEligibilityResult>(
    "generate_country_eligibility"
  );
  const [form, setForm] = useState({
    passport_nationality: "",
    age: "",
    degree_status: "bachelor",
    tefl_certification: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await submit(form);
  }

  function resultText() {
    if (!data) return "";
    const lines: string[] = ["Your TEFL Eligibility Summary", ""];
    if (data.summary) {
      lines.push(`Eligible countries: ${data.summary.total_eligible_countries ?? 0}`);
      if (data.summary.top_recommendations?.length) {
        lines.push(`Top recommendations: ${data.summary.top_recommendations.join(", ")}`);
      }
      if (data.summary.visa_advantages) lines.push(`Passport advantages: ${data.summary.visa_advantages}`);
      if (data.summary.qualification_strengths)
        lines.push(`Qualification assessment: ${data.summary.qualification_strengths}`);
      if (data.summary.improvement_suggestions?.length) {
        lines.push("Suggestions for improvement:");
        data.summary.improvement_suggestions.forEach((s) => lines.push(`  • ${s}`));
      }
      lines.push("");
    }
    if (data.regions) {
      for (const [region, countries] of Object.entries(data.regions)) {
        lines.push(region.toUpperCase());
        for (const [country, details] of Object.entries(countries)) {
          lines.push(`  ${country}: ${details.eligible ? "Eligible" : "Not Eligible"}`);
          for (const row of DETAIL_ROWS) {
            const v = details[row.key];
            if (typeof v === "string" && v) lines.push(`    ${row.label}: ${v}`);
          }
        }
        lines.push("");
      }
    }
    return lines.join("\n");
  }

  const hasResult = data && data.regions;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
      {/* Form */}
      <form onSubmit={onSubmit} className="surface-card h-fit space-y-4 p-6 lg:sticky lg:top-24">
        <Field label="Passport nationality" htmlFor="passport_nationality" required hint="e.g. United States, United Kingdom, Canada">
          <TextInput
            id="passport_nationality"
            value={form.passport_nationality}
            onChange={(e) => set("passport_nationality", e.target.value)}
            placeholder="Enter your passport country"
            required
          />
        </Field>

        <Field label="Age" htmlFor="age" required>
          <TextInput
            id="age"
            type="number"
            min={18}
            max={70}
            value={form.age}
            onChange={(e) => set("age", e.target.value)}
            placeholder="Enter your age"
            required
          />
        </Field>

        <Field label="Degree status" required>
          <RadioCards
            name="degree_status"
            value={form.degree_status}
            onChange={(v) => set("degree_status", v)}
            options={DEGREE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            columns={2}
          />
        </Field>

        <Field label="TEFL certification status" htmlFor="tefl_certification" required>
          <Select
            id="tefl_certification"
            value={form.tefl_certification}
            onChange={(e) => set("tefl_certification", e.target.value)}
            required
          >
            <option value="">Please select</option>
            {TEFL_OPTIONS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </Select>
        </Field>

        <SubmitButton loading={loading}>
          <Globe2 className="h-4 w-4" /> Check my eligibility
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
            <p className="text-sm text-[var(--color-muted)]">Checking your eligibility…</p>
          </div>
        )}

        {!loading && !hasResult && (
          <div className="surface-card flex h-full flex-col items-center justify-center gap-4 p-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-gradient-soft)] text-[var(--color-accent)]">
              <Globe2 className="h-7 w-7" />
            </span>
            <h3 className="text-lg font-semibold">Your eligibility report appears here</h3>
            <p className="max-w-sm text-sm text-[var(--color-muted)]">
              Tell us about your passport, age and qualifications and we&apos;ll map out every
              country you&apos;re eligible to teach in — with salaries, demand and visa notes.
            </p>
          </div>
        )}

        {!loading && hasResult && (
          <div className="surface-card p-6 md:p-8">
            <ScrollIntoViewOnMount />
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--color-border)] pb-5">
              <h2 className="text-xl font-semibold">Your TEFL Eligibility Summary</h2>
              <ResultActions getText={resultText} onReset={reset} printTargetId="country-eligibility-output" />
            </div>

            <div id="country-eligibility-output" className="mt-6 space-y-8">
              {/* Summary */}
              {data!.summary && (
                <section className="rounded-xl border border-[var(--color-border)] bg-white/[0.02] p-5">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-bold text-gradient">
                      {data!.summary.total_eligible_countries ?? 0}
                    </span>
                    <span className="text-sm text-[var(--color-muted)]">Eligible countries</span>
                  </div>

                  {data!.summary.top_recommendations?.length > 0 && (
                    <div className="mt-5">
                      <h4 className="text-sm font-semibold">Top recommendations for you</h4>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {data!.summary.top_recommendations.map((c) => (
                          <span
                            key={c}
                            className="inline-flex items-center gap-1 rounded-full border border-[var(--color-accent)] bg-[var(--brand-gradient-soft)] px-3 py-1 text-xs font-medium text-[var(--color-ink)]"
                          >
                            <Sparkles className="h-3 w-3 text-[var(--color-accent)]" /> {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {data!.summary.visa_advantages && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold">Your passport advantages</h4>
                      <p className="mt-1 text-sm text-[var(--color-muted)]">{data!.summary.visa_advantages}</p>
                    </div>
                  )}

                  {data!.summary.qualification_strengths && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold">Your qualification assessment</h4>
                      <p className="mt-1 text-sm text-[var(--color-muted)]">{data!.summary.qualification_strengths}</p>
                    </div>
                  )}

                  {data!.summary.improvement_suggestions && data!.summary.improvement_suggestions.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold">Suggestions for improvement</h4>
                      <ul className="mt-2 space-y-1">
                        {data!.summary.improvement_suggestions.map((s, i) => (
                          <li key={i} className="flex gap-2 text-sm text-[var(--color-muted)]">
                            <span className="text-[var(--color-accent)]">•</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </section>
              )}

              {/* Regions */}
              {data!.regions && (
                <section className="space-y-7">
                  <h3 className="text-base font-semibold text-gradient">Detailed Country Analysis by Region</h3>
                  {Object.entries(data!.regions).map(([region, countries]) => (
                    <div key={region}>
                      <h4 className="text-sm font-semibold text-[var(--color-ink)]">{region}</h4>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        {Object.entries(countries).map(([country, details]) => (
                          <div
                            key={country}
                            className={`rounded-xl border p-4 ${
                              details.eligible
                                ? "border-[var(--color-success)]/40 bg-[var(--color-success)]/[0.05]"
                                : "border-[var(--color-border)] bg-white/[0.02]"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <h5 className="font-semibold">{country}</h5>
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  details.eligible
                                    ? "bg-[var(--color-success)]/15 text-[var(--color-success)]"
                                    : "bg-[var(--color-danger)]/15 text-[var(--color-danger)]"
                                }`}
                              >
                                {details.eligible ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                {details.eligible ? "Eligible" : "Not Eligible"}
                              </span>
                            </div>
                            <dl className="mt-3 space-y-2">
                              {DETAIL_ROWS.map((row) => {
                                const v = details[row.key];
                                if (typeof v !== "string" || !v) return null;
                                return (
                                  <div key={row.key}>
                                    <dt className="text-xs font-medium text-[var(--color-faint)]">{row.label}</dt>
                                    <dd className="text-sm text-[var(--color-muted)]">{v}</dd>
                                  </div>
                                );
                              })}
                            </dl>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </section>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
