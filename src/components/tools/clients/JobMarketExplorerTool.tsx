"use client";

import { useState } from "react";
import { Globe2, AlertCircle, Loader2, TrendingUp, Wallet, ClipboardList, StickyNote } from "lucide-react";
import { useAiTool } from "@/lib/useAiTool";
import { Field, TextInput, Select, RadioCards, SubmitButton } from "@/components/ui/form";
import { ResultActions } from "@/components/tools/ResultActions";
import type { JobMarketResult } from "@/lib/tools/job-market-explorer";

const COUNTRIES_BY_REGION: Record<string, string[]> = {
  Asia: ["China", "South Korea", "Japan", "Thailand", "Vietnam", "Taiwan"],
  Europe: ["Spain", "Italy", "France", "Czech Republic", "Poland"],
  "Middle East": ["UAE (Dubai/Abu Dhabi)", "Saudi Arabia", "Qatar", "Oman"],
  "Latin America": ["Mexico", "Chile", "Argentina", "Colombia"],
  Africa: ["Morocco", "Egypt", "South Africa"],
};

const JOB_TYPES = [
  "Public school",
  "Private language centre",
  "International school",
  "University",
  "Freelance tutoring / online marketplace",
];

const EXPERIENCE = ["None", "1-2 years", "3-5 years", "5+ years"];

const TEFL_CERT: { value: string; label: string }[] = [
  { value: "none", label: "None" },
  { value: "120_hours", label: "120 Hours" },
  { value: "level_5", label: "Level 5 / Diploma" },
  { value: "celta_delta", label: "CELTA / DELTA" },
];

const EDUCATION = ["High school only", "Bachelor's degree", "Master's degree or higher"];

const PROSE =
  "text-sm leading-relaxed text-[var(--color-muted)] [&_h4]:mt-4 [&_h4]:mb-1.5 [&_h4]:text-sm [&_h4]:font-semibold [&_h4]:text-[var(--color-ink)] [&_p]:mb-2 [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_li]:marker:text-[var(--color-accent)]";

export function JobMarketExplorerTool() {
  const { submit, loading, error, data, reset } = useAiTool<JobMarketResult>(
    "get_job_market_data"
  );

  const [form, setForm] = useState({
    country: "Japan",
    custom_country: "",
    job_type: JOB_TYPES[0],
    experience_level: EXPERIENCE[0],
    tefl_certification: "none",
    english_level: "native",
    education_level: EDUCATION[1],
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await submit(form);
  }

  const salary = data?.average_salary_range;
  const amounts = salary?.amount ? salary.amount.split("-").map((a) => a.trim()) : [];

  function resultText() {
    if (!data) return "";
    const strip = (html?: string) =>
      (html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return [
      "TEFL Job Market Insights",
      "",
      `Job Demand Overview: ${strip(data.job_demand_overview)}`,
      salary
        ? `Salary: ${salary.currency || ""}${amounts[0] || ""} - ${salary.currency || ""}${amounts[1] || ""} ${salary.period || ""}`
        : "",
      `Benefits & expectations: ${strip(salary?.benefits)}`,
      `Job Requirements: ${strip(data.job_requirements)}`,
      `Additional Notes: ${strip(data.additional_notes)}`,
    ].join("\n");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,440px)_1fr]">
      {/* Form */}
      <form onSubmit={onSubmit} className="surface-card h-fit space-y-5 p-6 lg:sticky lg:top-24">
        <Field label="Where do you want to teach?" htmlFor="country" required>
          <Select id="country" value={form.country} onChange={(e) => set("country", e.target.value)}>
            {Object.entries(COUNTRIES_BY_REGION).map(([region, countries]) => (
              <optgroup key={region} label={region}>
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
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

        <Field label="Type of teaching job" required>
          <RadioCards
            name="job_type"
            value={form.job_type}
            onChange={(v) => set("job_type", v)}
            columns={2}
            options={JOB_TYPES.map((t) => ({ value: t, label: t }))}
          />
        </Field>

        <Field label="Teaching experience" htmlFor="experience_level" required>
          <Select
            id="experience_level"
            value={form.experience_level}
            onChange={(e) => set("experience_level", e.target.value)}
          >
            {EXPERIENCE.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="TEFL certification" htmlFor="tefl_certification" required>
          <Select
            id="tefl_certification"
            value={form.tefl_certification}
            onChange={(e) => set("tefl_certification", e.target.value)}
          >
            {TEFL_CERT.map((x) => (
              <option key={x.value} value={x.value}>
                {x.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="English level" required>
          <RadioCards
            name="english_level"
            value={form.english_level}
            onChange={(v) => set("english_level", v)}
            options={[
              { value: "native", label: "Native speaker" },
              { value: "fluent_non_native", label: "Fluent non-native" },
            ]}
          />
        </Field>

        <Field label="Highest education" htmlFor="education_level" required>
          <Select
            id="education_level"
            value={form.education_level}
            onChange={(e) => set("education_level", e.target.value)}
          >
            {EDUCATION.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </Select>
        </Field>

        <SubmitButton loading={loading}>
          <Globe2 className="h-4 w-4" /> Find opportunities
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
            <p className="text-sm text-[var(--color-muted)]">Fetching job market insights…</p>
          </div>
        )}

        {!loading && !data && (
          <div className="surface-card flex h-full flex-col items-center justify-center gap-4 p-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-gradient-soft)] text-[var(--color-accent)]">
              <Globe2 className="h-7 w-7" />
            </span>
            <h3 className="text-lg font-semibold">Your job market insights appear here</h3>
            <p className="max-w-sm text-sm text-[var(--color-muted)]">
              Tell us where you want to teach and your profile — we&apos;ll surface demand,
              salaries, requirements, and local considerations.
            </p>
          </div>
        )}

        {!loading && data && (
          <div className="surface-card p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--color-border)] pb-5">
              <div>
                <h2 className="text-xl font-semibold">Your TEFL job market insights</h2>
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  Demand, salaries, and requirements for teaching abroad.
                </p>
              </div>
              <ResultActions getText={resultText} onReset={reset} printTargetId="job-market-output" />
            </div>

            <div id="job-market-output" className="mt-6 grid gap-5 md:grid-cols-2">
              {data.job_demand_overview && (
                <section className="rounded-xl border border-[var(--color-border)] bg-white/[0.02] p-5">
                  <h3 className="flex items-center gap-2 text-base font-semibold text-gradient">
                    <TrendingUp className="h-4 w-4 text-[var(--color-accent)]" /> Job demand overview
                  </h3>
                  <div
                    className={`mt-3 ${PROSE}`}
                    dangerouslySetInnerHTML={{ __html: data.job_demand_overview }}
                  />
                </section>
              )}

              {salary && (
                <section className="rounded-xl border border-[var(--color-border)] bg-white/[0.02] p-5">
                  <h3 className="flex items-center gap-2 text-base font-semibold text-gradient">
                    <Wallet className="h-4 w-4 text-[var(--color-accent)]" /> Average salary range
                  </h3>
                  <p className="mt-3 text-2xl font-bold text-[var(--color-ink)]">
                    {salary.currency}
                    {amounts[0] || "0"} – {salary.currency}
                    {amounts[1] || "0"}{" "}
                    <span className="text-sm font-normal text-[var(--color-muted)]">
                      {salary.period}
                    </span>
                  </p>
                  {salary.benefits && (
                    <div
                      className={`mt-3 ${PROSE}`}
                      dangerouslySetInnerHTML={{ __html: salary.benefits }}
                    />
                  )}
                </section>
              )}

              {data.job_requirements && (
                <section className="rounded-xl border border-[var(--color-border)] bg-white/[0.02] p-5">
                  <h3 className="flex items-center gap-2 text-base font-semibold text-gradient">
                    <ClipboardList className="h-4 w-4 text-[var(--color-accent)]" /> Job requirements
                  </h3>
                  <div
                    className={`mt-3 ${PROSE}`}
                    dangerouslySetInnerHTML={{ __html: data.job_requirements }}
                  />
                </section>
              )}

              {data.additional_notes && (
                <section className="rounded-xl border border-[var(--color-border)] bg-white/[0.02] p-5">
                  <h3 className="flex items-center gap-2 text-base font-semibold text-gradient">
                    <StickyNote className="h-4 w-4 text-[var(--color-accent)]" /> Additional notes
                  </h3>
                  <div
                    className={`mt-3 ${PROSE}`}
                    dangerouslySetInnerHTML={{ __html: data.additional_notes }}
                  />
                </section>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
