"use client";

import { useState } from "react";
import { Clapperboard, AlertCircle, Loader2, MapPin } from "lucide-react";
import { useAiTool } from "@/lib/useAiTool";
import { Field, TextInput, RadioCards, SubmitButton } from "@/components/ui/form";
import { ResultActions } from "@/components/tools/ResultActions";
import { ScrollIntoViewOnMount } from "@/components/tools/ScrollIntoViewOnMount";
import type { VlogScriptResult } from "@/lib/tools/travel-vlog-scriptwriter";

const ANGLE_LABELS: Record<string, string> = {
  day_life: "Day in the Life (Routine & Lifestyle)",
  hidden_gems: "Hidden Gems (Local Travel Tips)",
  budget: "Budget Breakdown (What I Spend in a Day)",
  classroom: "Classroom Realities (Funny or Moving Teacher Moments)",
};

const ANGLE_OPTIONS = [
  { value: "day_life", label: "Day in the Life", desc: "Routine & lifestyle" },
  { value: "hidden_gems", label: "Hidden Gems", desc: "Local travel tips" },
  { value: "budget", label: "Budget Breakdown", desc: "What I spend in a day" },
  { value: "classroom", label: "Classroom Realities", desc: "Funny or moving moments" },
];

const DURATIONS = [
  { value: "30", label: "30s", desc: "Short / Reel" },
  { value: "60", label: "60s", desc: "TikTok standard" },
  { value: "90", label: "90s", desc: "Deep-dive short" },
];

interface ParsedTable {
  header: string[];
  body: string[][];
  intro: string;
  outro: string;
}

function parseMarkdownTable(md: string): ParsedTable | null {
  const lines = String(md || "").split(/\r?\n/);
  const intro: string[] = [];
  const outro: string[] = [];
  const rows: string[][] = [];
  let inTable = false;
  let tableDone = false;

  for (const line of lines) {
    const t = line.trim();
    const isRow =
      t.indexOf("|") === 0 && t.lastIndexOf("|") === t.length - 1 && t.length > 2;
    if (isRow && !tableDone) {
      inTable = true;
      if (/^\|[\s:|-]+\|$/.test(t)) continue; // separator row
      const cells = t.slice(1, -1).split("|").map((c) => c.trim());
      rows.push(cells);
    } else if (inTable && !isRow && t !== "") {
      tableDone = true;
      outro.push(t);
    } else if (!inTable && t !== "") {
      intro.push(t);
    } else if (tableDone && t !== "") {
      outro.push(t);
    }
  }

  if (rows.length < 2) return null;
  return {
    header: rows[0],
    body: rows.slice(1),
    intro: intro.join(" "),
    outro: outro.join(" "),
  };
}

// Render **bold** and <br> inline, escaping everything else via React text nodes.
function InlineText({ raw }: { raw: string }) {
  const segments = String(raw || "")
    .split(/(\*\*[^*]+\*\*|<br\s*\/?>)/gi)
    .filter(Boolean);
  return (
    <>
      {segments.map((seg, i) => {
        if (/^<br\s*\/?>$/i.test(seg)) return <br key={i} />;
        const bold = seg.match(/^\*\*([^*]+)\*\*$/);
        if (bold) return <strong key={i}>{bold[1]}</strong>;
        return <span key={i}>{seg}</span>;
      })}
    </>
  );
}

export function VlogScriptwriterTool() {
  const { submit, loading, error, data, reset } = useAiTool<VlogScriptResult>(
    "generate_vlog_script"
  );

  const [form, setForm] = useState({
    location: "",
    angle: "day_life",
    duration: "60",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await submit(form);
  }

  const parsed = data ? parseMarkdownTable(data.script_markdown) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
      {/* Form */}
      <form onSubmit={onSubmit} className="surface-card h-fit space-y-5 p-6 lg:sticky lg:top-24">
        <Field
          label="Current destination / context"
          htmlFor="location"
          required
          hint="Where are you located, or where do you plan to teach?"
        >
          <TextInput
            id="location"
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder="e.g. Ho Chi Minh City, Vietnam"
            maxLength={80}
            autoComplete="off"
            required
          />
        </Field>

        <Field label="The core angle" hint="Pick the focus of your video.">
          <RadioCards
            name="angle"
            value={form.angle}
            onChange={(v) => set("angle", v)}
            options={ANGLE_OPTIONS}
            columns={2}
          />
        </Field>

        <Field label="Targeted video duration" hint="How long should your video run?">
          <RadioCards
            name="duration"
            value={form.duration}
            onChange={(v) => set("duration", v)}
            options={DURATIONS}
            columns={3}
          />
        </Field>

        <p className="text-xs leading-relaxed text-[var(--color-faint)]">
          AI-generated scripts are a creative starting point. Always check that filming is allowed at
          your chosen locations and adapt the script to your own voice.
        </p>

        <SubmitButton loading={loading}>
          <Clapperboard className="h-4 w-4" /> Generate my script
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
            <p className="text-sm text-[var(--color-muted)]">Generating your script…</p>
          </div>
        )}

        {!loading && !data && (
          <div className="surface-card flex h-full flex-col items-center justify-center gap-4 p-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-gradient-soft)] text-[var(--color-accent)]">
              <Clapperboard className="h-7 w-7" />
            </span>
            <h3 className="text-lg font-semibold">Your vertical video script appears here</h3>
            <p className="max-w-sm text-sm text-[var(--color-muted)]">
              Tell us where you are and pick your angle — we&apos;ll write a shot-by-shot script for
              TikTok, Reels and Shorts.
            </p>
          </div>
        )}

        {!loading && data && (
          <div className="surface-card p-6 md:p-8">
            <ScrollIntoViewOnMount />
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--color-border)] pb-5">
              <div>
                <h2 className="text-xl font-semibold">Your Vertical Video Script</h2>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className="chip">
                    <MapPin className="h-3.5 w-3.5" /> {data.location}
                  </span>
                  <span className="chip">{ANGLE_LABELS[data.angle] || data.angle}</span>
                  <span className="chip">{data.duration}</span>
                </div>
              </div>
              <ResultActions
                getText={() => data.script_markdown}
                onReset={reset}
                printTargetId="vlog-script-output"
              />
            </div>

            <div id="vlog-script-output" className="mt-6">
              {parsed ? (
                <>
                  {parsed.intro && (
                    <p className="mb-4 text-sm leading-relaxed text-[var(--color-muted)]">
                      <InlineText raw={parsed.intro} />
                    </p>
                  )}
                  <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
                    <table className="w-full border-collapse text-left text-sm">
                      <thead>
                        <tr className="bg-white/[0.03]">
                          {parsed.header.map((h, i) => (
                            <th
                              key={i}
                              className="border-b border-[var(--color-border)] px-4 py-3 font-semibold text-[var(--color-ink)]"
                            >
                              <InlineText raw={h} />
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {parsed.body.map((row, r) => (
                          <tr key={r} className="align-top">
                            {parsed.header.map((_, c) => (
                              <td
                                key={c}
                                className="border-b border-[var(--color-border)] px-4 py-3 leading-relaxed text-[var(--color-muted)]"
                              >
                                <InlineText raw={row[c] || ""} />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {parsed.outro && (
                    <p className="mt-4 text-sm leading-relaxed text-[var(--color-muted)]">
                      <InlineText raw={parsed.outro} />
                    </p>
                  )}
                </>
              ) : (
                <div className="whitespace-pre-wrap rounded-xl border border-[var(--color-border)] bg-white/[0.02] p-4 text-sm leading-relaxed text-[var(--color-muted)]">
                  {data.script_markdown}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
