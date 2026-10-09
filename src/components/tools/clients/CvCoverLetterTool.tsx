"use client";

import { useState } from "react";
import {
  FileText,
  AlertCircle,
  Loader2,
  User,
  GraduationCap,
  Briefcase,
  Sparkles,
  Target,
  SlidersHorizontal,
  Check,
  Mail,
  FileSignature,
  Lightbulb,
} from "lucide-react";
import { useAiTool } from "@/lib/useAiTool";
import { Field, TextInput, TextArea, Select, SubmitButton } from "@/components/ui/form";
import { ResultActions } from "@/components/tools/ResultActions";
import { ScrollIntoViewOnMount } from "@/components/tools/ScrollIntoViewOnMount";
import type { CvCoverLetterResult } from "@/lib/tools/cv-cover-letter-generator";

const TEFL_CERTS = [
  "120-Hour TEFL Certificate",
  "140-Hour TEFL Certificate",
  "168-Hour TEFL Certificate",
  "CELTA",
  "DELTA",
  "Trinity CertTESOL",
  "Other Certification",
  "No TEFL Certification",
];
const POSITION_TYPES = [
  "ESL Teacher",
  "Online English Tutor",
  "Academic Coordinator",
  "Curriculum Developer",
  "Teacher Trainer",
  "Business English Instructor",
  "IELTS/TOEFL Instructor",
  "Other",
];
const ENVIRONMENTS = [
  "Language School",
  "International School",
  "University",
  "Private Academy",
  "Online Platform",
  "Corporate Training",
  "Government Institution",
];
const TONES = [
  { value: "professional", label: "Professional & Formal" },
  { value: "approachable", label: "Approachable & Friendly" },
  { value: "confident", label: "Confident & Assertive" },
  { value: "academic", label: "Academic & Scholarly" },
];
const LENGTHS = [
  { value: "standard", label: "Standard Length" },
  { value: "concise", label: "Concise & Brief" },
  { value: "detailed", label: "Detailed & Comprehensive" },
];
const SKILL_OPTIONS = [
  "Lesson Planning",
  "Curriculum Development",
  "Business English",
  "IELTS/TOEFL Preparation",
  "Young Learners",
  "Online Teaching",
  "Educational Technology",
  "Classroom Management",
  "Assessment Design",
];
const AI_SKILL_OPTIONS = [
  "AI-Assisted Lesson Planning",
  "AI Materials Creation & Differentiation",
  "AI-Assisted Assessment & Feedback",
  "Prompt Writing for Classroom AI",
  "Student AI Literacy & Ethics",
  "Responsible AI Use & Data Privacy",
];

function Chip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition ${
        active
          ? "border-[var(--color-accent)] bg-[var(--brand-gradient-soft)] text-[var(--color-ink)]"
          : "border-[var(--color-border)] bg-white/[0.03] text-[var(--color-muted)] hover:border-[var(--color-faint)]"
      }`}
    >
      {active && <Check className="h-3.5 w-3.5 text-[var(--color-accent)]" />}
      {label}
    </button>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className="flex items-center gap-3 text-left text-sm text-[var(--color-muted)]"
    >
      <span
        className={`relative h-5 w-9 flex-none rounded-full transition ${
          checked ? "bg-[var(--color-accent)]" : "bg-white/15"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
            checked ? "left-4" : "left-0.5"
          }`}
        />
      </span>
      {label}
    </button>
  );
}

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 pt-1 text-sm font-semibold text-[var(--color-ink)]">
      <Icon className="h-4 w-4 text-[var(--color-accent)]" />
      {children}
    </div>
  );
}

/** Render multi-line model text into paragraphs. */
function RichText({ text }: { text: string }) {
  if (!text) return null;
  return (
    <>
      {text.split(/\n{2,}/).map((para, i) => (
        <p key={i} className="whitespace-pre-wrap leading-relaxed">
          {para}
        </p>
      ))}
    </>
  );
}

export function CvCoverLetterTool() {
  const { submit, loading, error, data, reset } = useAiTool<CvCoverLetterResult>("generate_cv_cl");

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    location: "",
    professional_summary: "",
    tefl_certification: "",
    tefl_provider: "",
    degree: "",
    university: "",
    additional_qualifications: "",
    teaching_experience: "",
    additional_skills: "",
    ai_tools_used: "",
    target_position_type: "",
    target_environment: "",
    target_countries: "",
    document_tone: "professional",
    document_length: "standard",
    specific_requirements: "",
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [aiSkills, setAiSkills] = useState<string[]>([]);
  const [photo, setPhoto] = useState(false);
  const [international, setInternational] = useState(false);
  const [references, setReferences] = useState(true);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const toggleIn = (list: string[], v: string) =>
    list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await submit({
      ...form,
      skills,
      ai_skills: aiSkills,
      include_photo_placeholder: photo ? "Yes" : "No",
      emphasize_international: international ? "Yes" : "No",
      include_references_note: references ? "Yes" : "No",
    });
  }

  function resultText() {
    if (!data) return "";
    const { cv, cover_letter: cl, document_tips: tips } = data;
    const out: string[] = ["CURRICULUM VITAE", ""];
    if (cv.header) out.push(cv.header, "");
    if (cv.professional_summary) out.push("Professional Summary", cv.professional_summary, "");
    if (cv.education) out.push("Education & Qualifications", cv.education, "");
    if (cv.teaching_experience) out.push("Teaching Experience", cv.teaching_experience, "");
    const sk = cv.skills;
    const skLines: string[] = [];
    if (sk.teaching_skills.length) skLines.push(`Teaching Skills: ${sk.teaching_skills.join(", ")}`);
    if (sk.technical_skills.length) skLines.push(`Technical Skills: ${sk.technical_skills.join(", ")}`);
    if (sk.language_skills.length) skLines.push(`Language Skills: ${sk.language_skills.join(", ")}`);
    if (sk.ai_edtech_skills?.length) skLines.push(`AI & EdTech Skills: ${sk.ai_edtech_skills.join(", ")}`);
    if (skLines.length) out.push("Core Skills", ...skLines, "");
    if (cv.additional_sections) out.push(cv.additional_sections, "");
    out.push("", "COVER LETTER", "");
    [
      cl.header,
      cl.greeting,
      cl.opening_paragraph,
      cl.body_paragraphs,
      cl.closing_paragraph,
      cl.signature,
    ].forEach((s) => s && out.push(s, ""));
    if (tips.cv_tips.length) out.push("CV Tips", ...tips.cv_tips.map((t) => `• ${t}`), "");
    if (tips.cover_letter_tips.length)
      out.push("Cover Letter Tips", ...tips.cover_letter_tips.map((t) => `• ${t}`), "");
    if (tips.customization_suggestions.length)
      out.push("Customization Suggestions", ...tips.customization_suggestions.map((t) => `• ${t}`));
    return out.join("\n");
  }

  const skillList = (list?: string[]) => (list?.length ? list.join(", ") : null);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Form */}
      <form onSubmit={onSubmit} className="surface-card space-y-5 p-6">
        <SectionTitle icon={User}>Personal details</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full name" htmlFor="full_name" required>
            <TextInput id="full_name" value={form.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="Jane Smith" required />
          </Field>
          <Field label="Email" htmlFor="email" required>
            <TextInput id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="jane@example.com" required />
          </Field>
          <Field label="Phone" htmlFor="phone">
            <TextInput id="phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="Phone number" />
          </Field>
          <Field label="Location" htmlFor="location">
            <TextInput id="location" value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="City, Country" />
          </Field>
        </div>

        <Field label="Professional summary" htmlFor="professional_summary" required hint="Teaching background, experience level and specializations.">
          <TextArea id="professional_summary" value={form.professional_summary} onChange={(e) => set("professional_summary", e.target.value)} placeholder="Brief description of your teaching background…" className="min-h-24" required />
        </Field>

        <div className="border-t border-[var(--color-border)] pt-4" />
        <SectionTitle icon={GraduationCap}>Qualifications & education</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="TEFL certification" htmlFor="tefl_certification">
            <Select id="tefl_certification" value={form.tefl_certification} onChange={(e) => set("tefl_certification", e.target.value)}>
              <option value="">Select level</option>
              {TEFL_CERTS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <Field label="Certification provider" htmlFor="tefl_provider">
            <TextInput id="tefl_provider" value={form.tefl_provider} onChange={(e) => set("tefl_provider", e.target.value)} placeholder="e.g. TEFL Institute" />
          </Field>
          <Field label="Degree" htmlFor="degree">
            <TextInput id="degree" value={form.degree} onChange={(e) => set("degree", e.target.value)} placeholder="e.g. BA in English Literature" />
          </Field>
          <Field label="University" htmlFor="university">
            <TextInput id="university" value={form.university} onChange={(e) => set("university", e.target.value)} placeholder="University name" />
          </Field>
        </div>
        <Field label="Additional qualifications" htmlFor="additional_qualifications">
          <TextArea id="additional_qualifications" value={form.additional_qualifications} onChange={(e) => set("additional_qualifications", e.target.value)} placeholder="Other degrees, language proficiencies, coursework…" className="min-h-16" />
        </Field>

        <div className="border-t border-[var(--color-border)] pt-4" />
        <SectionTitle icon={Briefcase}>Teaching experience</SectionTitle>
        <Field label="Experience" htmlFor="teaching_experience" required hint="Most recent first — institutions, roles, dates, achievements.">
          <TextArea id="teaching_experience" value={form.teaching_experience} onChange={(e) => set("teaching_experience", e.target.value)} placeholder="Describe your teaching experience…" className="min-h-28" required />
        </Field>

        <div className="border-t border-[var(--color-border)] pt-4" />
        <SectionTitle icon={Sparkles}>Skills & expertise</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {SKILL_OPTIONS.map((s) => (
            <Chip key={s} label={s} active={skills.includes(s)} onClick={() => setSkills((l) => toggleIn(l, s))} />
          ))}
        </div>
        <Field label="Additional skills" htmlFor="additional_skills">
          <TextArea id="additional_skills" value={form.additional_skills} onChange={(e) => set("additional_skills", e.target.value)} placeholder="Technical skills, software, language abilities…" className="min-h-16" />
        </Field>

        <div className="pt-1">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--color-faint)]">AI & EdTech competencies</p>
          <div className="flex flex-wrap gap-2">
            {AI_SKILL_OPTIONS.map((s) => (
              <Chip key={s} label={s} active={aiSkills.includes(s)} onClick={() => setAiSkills((l) => toggleIn(l, s))} />
            ))}
          </div>
        </div>
        <Field label="AI tools used" htmlFor="ai_tools_used" hint="Select only competencies you can genuinely evidence.">
          <TextArea id="ai_tools_used" value={form.ai_tools_used} onChange={(e) => set("ai_tools_used", e.target.value)} placeholder="AI tools you actually use…" className="min-h-16" />
        </Field>

        <div className="border-t border-[var(--color-border)] pt-4" />
        <SectionTitle icon={Target}>Target position</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Position type" htmlFor="target_position_type">
            <Select id="target_position_type" value={form.target_position_type} onChange={(e) => set("target_position_type", e.target.value)}>
              <option value="">Select type</option>
              {POSITION_TYPES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </Select>
          </Field>
          <Field label="Work environment" htmlFor="target_environment">
            <Select id="target_environment" value={form.target_environment} onChange={(e) => set("target_environment", e.target.value)}>
              <option value="">Select environment</option>
              {ENVIRONMENTS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Target countries / regions" htmlFor="target_countries">
          <TextInput id="target_countries" value={form.target_countries} onChange={(e) => set("target_countries", e.target.value)} placeholder="e.g. Asia, Europe, Online" />
        </Field>

        <div className="border-t border-[var(--color-border)] pt-4" />
        <SectionTitle icon={SlidersHorizontal}>Document preferences</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Tone" htmlFor="document_tone">
            <Select id="document_tone" value={form.document_tone} onChange={(e) => set("document_tone", e.target.value)}>
              {TONES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Select>
          </Field>
          <Field label="Length" htmlFor="document_length">
            <Select id="document_length" value={form.document_length} onChange={(e) => set("document_length", e.target.value)}>
              {LENGTHS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="space-y-3 rounded-xl border border-[var(--color-border)] bg-white/[0.02] p-4">
          <Toggle checked={photo} onChange={setPhoto} label="Include photo placeholder in CV" />
          <Toggle checked={international} onChange={setInternational} label="Emphasize international experience" />
          <Toggle checked={references} onChange={setReferences} label='Include "References available upon request"' />
        </div>

        <Field label="Additional information" htmlFor="specific_requirements" hint="Optional — awards, publications, anything to highlight.">
          <TextArea id="specific_requirements" value={form.specific_requirements} onChange={(e) => set("specific_requirements", e.target.value)} placeholder="Any specific requirements or achievements…" className="min-h-16" />
        </Field>

        <SubmitButton loading={loading}>
          <FileText className="h-4 w-4" /> Generate documents
        </SubmitButton>

        {error && (
          <p className="flex items-center gap-2 text-sm text-[var(--color-danger)]">
            <AlertCircle className="h-4 w-4" /> {error}
          </p>
        )}
      </form>

      {/* Result (appears below the form) */}
      <div>
        {loading && (
          <div className="surface-card flex flex-col items-center justify-center gap-4 p-16 text-center">
            <ScrollIntoViewOnMount />
            <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent)]" />
            <p className="text-sm text-[var(--color-muted)]">Generating your professional documents…</p>
          </div>
        )}

        {!loading && data && (
          <div className="surface-card p-6 md:p-8">
            <ScrollIntoViewOnMount />
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--color-border)] pb-5">
              <div>
                <h2 className="text-xl font-semibold">Your professional TEFL documents</h2>
                <p className="mt-1 text-sm text-[var(--color-muted)]">CV and tailored cover letter, ready to customise.</p>
              </div>
              <ResultActions getText={resultText} onReset={reset} printTargetId="cvcl-output" />
            </div>

            <div id="cvcl-output" className="mt-6 space-y-8">
              {/* CV */}
              <section>
                <h3 className="flex items-center gap-2 text-base font-semibold text-gradient">
                  <FileText className="h-4 w-4" /> Curriculum Vitae
                </h3>
                <div className="mt-3 space-y-5 rounded-xl border border-[var(--color-border)] bg-white/[0.02] p-5 text-sm text-[var(--color-muted)]">
                  {data.cv.header && (
                    <div className="border-b border-[var(--color-border)] pb-4 text-[var(--color-ink)]">
                      <RichText text={data.cv.header} />
                    </div>
                  )}
                  {data.cv.professional_summary && (
                    <div>
                      <h4 className="mb-1.5 font-semibold text-[var(--color-ink)]">Professional Summary</h4>
                      <RichText text={data.cv.professional_summary} />
                    </div>
                  )}
                  {data.cv.education && (
                    <div>
                      <h4 className="mb-1.5 font-semibold text-[var(--color-ink)]">Education & Qualifications</h4>
                      <RichText text={data.cv.education} />
                    </div>
                  )}
                  {data.cv.teaching_experience && (
                    <div>
                      <h4 className="mb-1.5 font-semibold text-[var(--color-ink)]">Teaching Experience</h4>
                      <RichText text={data.cv.teaching_experience} />
                    </div>
                  )}
                  {(data.cv.skills.teaching_skills.length > 0 ||
                    data.cv.skills.technical_skills.length > 0 ||
                    data.cv.skills.language_skills.length > 0 ||
                    (data.cv.skills.ai_edtech_skills?.length ?? 0) > 0) && (
                    <div>
                      <h4 className="mb-1.5 font-semibold text-[var(--color-ink)]">Core Skills</h4>
                      <div className="space-y-1">
                        {skillList(data.cv.skills.teaching_skills) && (
                          <p><span className="font-medium text-[var(--color-ink)]">Teaching:</span> {skillList(data.cv.skills.teaching_skills)}</p>
                        )}
                        {skillList(data.cv.skills.technical_skills) && (
                          <p><span className="font-medium text-[var(--color-ink)]">Technical:</span> {skillList(data.cv.skills.technical_skills)}</p>
                        )}
                        {skillList(data.cv.skills.language_skills) && (
                          <p><span className="font-medium text-[var(--color-ink)]">Language:</span> {skillList(data.cv.skills.language_skills)}</p>
                        )}
                        {skillList(data.cv.skills.ai_edtech_skills) && (
                          <p><span className="font-medium text-[var(--color-ink)]">AI & EdTech:</span> {skillList(data.cv.skills.ai_edtech_skills)}</p>
                        )}
                      </div>
                    </div>
                  )}
                  {data.cv.additional_sections && (
                    <div><RichText text={data.cv.additional_sections} /></div>
                  )}
                </div>
              </section>

              {/* Cover letter */}
              <section>
                <h3 className="flex items-center gap-2 text-base font-semibold text-gradient">
                  <Mail className="h-4 w-4" /> Cover Letter
                </h3>
                <div className="mt-3 space-y-4 rounded-xl border border-[var(--color-border)] bg-white/[0.02] p-5 text-sm leading-relaxed text-[var(--color-muted)]">
                  {data.cover_letter.header && <div className="text-[var(--color-ink)]"><RichText text={data.cover_letter.header} /></div>}
                  {data.cover_letter.greeting && <RichText text={data.cover_letter.greeting} />}
                  {data.cover_letter.opening_paragraph && <RichText text={data.cover_letter.opening_paragraph} />}
                  {data.cover_letter.body_paragraphs && <RichText text={data.cover_letter.body_paragraphs} />}
                  {data.cover_letter.closing_paragraph && <RichText text={data.cover_letter.closing_paragraph} />}
                  {data.cover_letter.signature && <div className="flex items-center gap-2 pt-1 text-[var(--color-ink)]"><FileSignature className="h-4 w-4 text-[var(--color-accent)]" /><RichText text={data.cover_letter.signature} /></div>}
                </div>
              </section>

              {/* Tips */}
              {(data.document_tips.cv_tips.length > 0 ||
                data.document_tips.cover_letter_tips.length > 0 ||
                data.document_tips.customization_suggestions.length > 0) && (
                <section>
                  <h3 className="flex items-center gap-2 text-base font-semibold text-gradient">
                    <Lightbulb className="h-4 w-4" /> Professional enhancement tips
                  </h3>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    {([
                      { title: "CV tips", items: data.document_tips.cv_tips },
                      { title: "Cover letter tips", items: data.document_tips.cover_letter_tips },
                      { title: "Customization suggestions", items: data.document_tips.customization_suggestions },
                    ] as const).map((grp) =>
                      grp.items.length ? (
                        <div key={grp.title} className="rounded-xl border border-[var(--color-border)] bg-white/[0.02] p-4">
                          <h4 className="mb-2 text-sm font-semibold text-[var(--color-ink)]">{grp.title}</h4>
                          <ul className="space-y-1.5 text-sm text-[var(--color-muted)]">
                            {grp.items.map((t, i) => (
                              <li key={i} className="flex gap-2">
                                <span className="text-[var(--color-accent)]">•</span>
                                <span>{t}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null
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
