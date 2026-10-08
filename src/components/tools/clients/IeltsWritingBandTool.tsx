"use client";

import { useMemo, useState } from "react";
import { GraduationCap, AlertCircle, Loader2, AlertTriangle, Info } from "lucide-react";
import { useAiTool } from "@/lib/useAiTool";
import { SITE } from "@/lib/site";
import { Field, TextArea, Select, RadioCards, SubmitButton } from "@/components/ui/form";
import { ResultActions } from "@/components/tools/ResultActions";
import { ScrollIntoViewOnMount } from "@/components/tools/ScrollIntoViewOnMount";
import type {
  IeltsWritingBandResult,
  IeltsCriterion,
} from "@/lib/tools/ielts-writing-band-estimator";

const TASK2_QUESTIONS = [
  "Some people believe that unpaid community service should be a compulsory part of high school programmes. Do you agree or disagree?",
  "In many countries, the proportion of older people is increasing steadily. How will this affect society, and what measures can be taken to deal with this problem?",
  "Some people think that governments should focus on reducing environmental pollution, while others believe they should focus on economic development. Discuss both views and give your opinion.",
  "Nowadays, more and more people decide to have children later in their life. What are the reasons for this and what are the effects on society?",
  "In some countries, the gap between the rich and the poor is becoming wider. What problems does this cause and what solutions can you suggest?",
];

interface Task1Question {
  text: string;
  image: string;
  type: string;
  visualDescription: string;
}

const TASK1_QUESTIONS: Task1Question[] = [
  {
    text: "The graph below shows the per capita consumption of whole milk and low-fat milk in the United States between 1970 and 2015. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.",
    image: "/wp-content/uploads/2025/08/2_RsEu8cy.webp",
    type: "Line Chart",
    visualDescription:
      "Line chart showing U.S. per capita consumption of whole milk and low-fat milk from 1970 to 2015. Whole milk starts highest at about 25 gallons in 1970 and steadily declines to around 5 gallons by 2015. Low-fat milk begins much lower, near 7 gallons in 1970, rises sharply until about 1990 where it peaks near 14 gallons, then remains relatively stable with a slight decrease toward 2015. Around 1990, both milk types cross, with low-fat overtaking whole milk as the more consumed option.",
  },
  {
    text: "The bar chart below shows the percentage of New Zealander men and women who did regular physical activity in 2008 across different age groups. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    image: "/wp-content/uploads/2025/08/c12_p27_bar.webp",
    type: "Bar Chart",
    visualDescription:
      "Bar chart showing the percentage of New Zealander men and women who engaged in regular physical activity in 2008, across different age groups. Men had the highest participation in the 14–23 age group (51.7%), but their rate generally declined with age, reaching 47.2% in those 64 and above. Women started lower at 46.9% in the youngest group but peaked at 54.2% in the 44–53 age group before slightly declining to 48.1% in the oldest group. Overall, men were more active in the youngest group, while women had higher participation in most other age groups.",
  },
  {
    text: "The charts below show the average amounts of three types of nutrients in typical meals, all of which can be unhealthy if consumed too much. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    image: "/wp-content/uploads/2025/08/c14_p29_pie.webp",
    type: "Pie Chart",
    visualDescription:
      "Three pie charts showing the average proportion of sodium, saturated fat, and added sugar consumed in meals in the UK. For sodium, dinner accounts for the largest share (44%), followed by lunch (30%), with breakfast and snacks both at 13%. For saturated fat, lunch is highest (34%), dinner follows at 26%, snacks 22%, and breakfast 18%. For added sugar, snacks dominate at 40%, lunch contributes 24%, dinner 20%, and breakfast 16%.",
  },
  {
    text: "The line graph below shows the number of international visitors, in millions, to three cities (Paris, Dubai and Tokyo) between 2000 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    image: "/wp-content/uploads/2026/09/task1-visitors-line.svg",
    type: "Line Chart",
    visualDescription:
      "Line graph of international visitors (in millions) to Paris, Dubai and Tokyo from 2000 to 2020, shown at five-year intervals. Paris had the most visitors throughout, rising steadily from 12 million in 2000 to 19 million in 2020. Dubai grew the fastest, climbing from just 3 million in 2000 to 16 million in 2020 and overtaking Tokyo at around 2012. Tokyo rose more gradually from 5 million to 14 million, with its sharpest increase after 2010. By 2020 Paris remained highest, followed by Dubai and then Tokyo.",
  },
  {
    text: "The bar chart below shows the percentage of households with internet access in four countries (the UK, Brazil, India and Nigeria) in 2005 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    image: "/wp-content/uploads/2026/09/task1-internet-bar.svg",
    type: "Bar Chart",
    visualDescription:
      "Grouped bar chart comparing the percentage of households with internet access in the UK, Brazil, India and Nigeria in 2005 and 2020. Access rose sharply in every country. The UK was highest in both years, up from 55% to 96%. Brazil increased from 20% to 81%, India from just 5% to 55%, and Nigeria from 3% to 45%. Although the UK led throughout, India and Nigeria showed the largest relative growth, and the gap between the countries narrowed by 2020.",
  },
  {
    text: "The pie charts below show the sources of electricity generation in a country in 2000 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    image: "/wp-content/uploads/2026/09/task1-electricity-pie.svg",
    type: "Pie Chart",
    visualDescription:
      "Two pie charts comparing the sources of electricity generation in a country in 2000 and 2020, divided between coal, gas, hydro and renewables. In 2000 coal dominated at 60%, followed by gas (20%), hydro (15%) and renewables (5%). By 2020 coal had halved to 30%, while renewables surged from 5% to 30%, becoming joint-largest with coal. Gas rose slightly from 20% to 25%, and hydro was unchanged at 15%. Overall the country shifted away from coal towards renewable energy.",
  },
  {
    text: "The table below shows the average weekly household expenditure, in US dollars, on three categories (food, housing and leisure) in the USA, Japan and Germany in 2023. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    image: "/wp-content/uploads/2026/09/task1-expenditure-table.svg",
    type: "Table",
    visualDescription:
      "Table showing average weekly household expenditure in US dollars on food, housing and leisure in the USA, Japan and Germany in 2023. Housing was the largest expense in all three countries, highest in Japan at 380 dollars, followed by the USA (320) and Germany (300). Japan also spent the most on food (210 dollars), compared with the USA (180) and Germany (160). Germany spent the most on leisure (140 dollars), ahead of the USA (120) and Japan (90). Overall Japan had the highest total spending, driven by food and housing, while leisure spending was relatively low in every country.",
  },
  {
    text: "The diagram below shows the process by which glass bottles are recycled. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    image: "/wp-content/uploads/2026/09/task1-glass-process.svg",
    type: "Process Diagram",
    visualDescription:
      "A diagram showing the recycling of glass bottles as a six-stage cyclical process. First, used glass bottles are collected in bottle banks. Second, they are transported to a recycling plant and sorted by colour. Third, the glass is washed to remove labels and impurities. Fourth, it is crushed into small pieces known as cullet. Fifth, the cullet is melted in a furnace at very high temperature. Sixth, the molten glass is moulded into new bottles, which are sent to shops. Once used, these bottles re-enter the process, making it a continuous cycle.",
  },
  {
    text: "The two maps below show the town of Meadowville in 1990 and today. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    image: "/wp-content/uploads/2026/09/task1-town-map.svg",
    type: "Map",
    visualDescription:
      "Two maps comparing the town of Meadowville in 1990 and today. A river runs along the north in both maps, and a main road crosses the town from east to west. In 1990 the town was largely rural: there was farmland and a small group of houses in the north, an area of woods in the south-west, and a primary school beside the main road. Today the area has been heavily developed. The farmland and houses have been replaced by blocks of flats and a large supermarket with a car park. The woods have been cleared to create a car park, and the primary school has been enlarged. A roundabout has been built on the main road where the junction used to be, and a pedestrian footbridge now crosses the river. Overall, Meadowville has changed from a small rural settlement into a built-up urban area.",
  },
];

const TASK2_CRITERIA: { key: keyof IeltsWritingBandResult; label: string }[] = [
  { key: "task_response", label: "Task Response" },
  { key: "coherence_cohesion", label: "Coherence & Cohesion" },
  { key: "lexical_resource", label: "Lexical Resource" },
  { key: "grammatical_range_accuracy", label: "Grammatical Range & Accuracy" },
];

const TASK1_CRITERIA: { key: keyof IeltsWritingBandResult; label: string }[] = [
  { key: "task_achievement", label: "Task Achievement" },
  { key: "coherence_cohesion", label: "Coherence & Cohesion" },
  { key: "lexical_resource", label: "Lexical Resource" },
  { key: "grammatical_range_accuracy", label: "Grammatical Range & Accuracy" },
];

function issueDescription(issue?: string): string {
  switch (issue) {
    case "question_repeated":
      return "You submitted the question prompt instead of your essay response";
    case "insufficient_content":
      return "The submitted text is too short to evaluate";
    case "irrelevant_text":
      return "The submitted text is not related to the question";
    case "test_input":
      return "The submitted text appears to be test input or placeholder content";
    default:
      return "Unable to identify a valid essay response in your submission";
  }
}

export function IeltsWritingBandTool() {
  const { submit, loading, error, data, reset } = useAiTool<IeltsWritingBandResult>(
    "estimate_ielts_band"
  );

  const [taskType, setTaskType] = useState<"1" | "2">("2");
  const [questionMode, setQuestionMode] = useState<"select" | "custom">("select");
  const [task2Sample, setTask2Sample] = useState(TASK2_QUESTIONS[0]);
  const [task2Custom, setTask2Custom] = useState("");
  const [task1Index, setTask1Index] = useState(0);
  const [writingSample, setWritingSample] = useState("");

  const wordCount = useMemo(() => {
    const t = writingSample.trim();
    return t === "" ? 0 : t.split(/\s+/).filter(Boolean).length;
  }, [writingSample]);

  const wordColor = useMemo(() => {
    if (taskType === "1") return wordCount >= 150 ? "var(--color-success)" : "var(--color-faint)";
    if (wordCount > 300) return "var(--color-danger)";
    if (wordCount >= 250) return "var(--color-success)";
    return "var(--color-faint)";
  }, [taskType, wordCount]);

  const activeQuestion =
    taskType === "1"
      ? TASK1_QUESTIONS[task1Index].text
      : questionMode === "select"
        ? task2Sample
        : task2Custom;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fields: Record<string, string> = {
      task_type: taskType,
      writing_sample: writingSample,
    };
    if (taskType === "1") {
      const q = TASK1_QUESTIONS[task1Index];
      fields.task1_question = q.text;
      fields.visual_description = q.visualDescription;
      fields.task1_image_url = q.image;
    } else {
      fields.task2_question = questionMode === "select" ? task2Sample : task2Custom;
    }
    await submit(fields);
  }

  function resultText() {
    if (!data) return "";
    if (data.evaluation_possible === false) {
      return `Unable to evaluate.\nIssue: ${issueDescription(data.issue_identified)}\nWord count: ${data.word_count}\n${data.feedback || ""}`;
    }
    const criteria = taskType === "1" ? TASK1_CRITERIA : TASK2_CRITERIA;
    const lines = [
      `IELTS ${taskType === "1" ? "Task 1" : "Task 2"} Band Estimate`,
      `Overall band: ${data.overall_band}`,
      data.comments || "",
      "",
    ];
    for (const c of criteria) {
      const crit = data[c.key] as IeltsCriterion | undefined;
      if (crit) {
        lines.push(`${c.label} — Band ${crit.band}`);
        lines.push(`Assessment: ${crit.explanation}`);
        lines.push(`Improvement: ${crit.improvement}`);
        lines.push("");
      }
    }
    return lines.join("\n");
  }

  const criteria = taskType === "1" ? TASK1_CRITERIA : TASK2_CRITERIA;
  const invalid = data?.evaluation_possible === false;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,440px)_1fr]">
      {/* Form */}
      <form onSubmit={onSubmit} className="surface-card h-fit space-y-5 p-6 lg:sticky lg:top-24">
        <Field label="Task type" required>
          <RadioCards
            name="task_type"
            value={taskType}
            onChange={(v) => setTaskType(v as "1" | "2")}
            options={[
              { value: "2", label: "Task 2 Essay", desc: "Opinion / argument essay" },
              { value: "1", label: "Task 1 Visual", desc: "Describe a chart or diagram" },
            ]}
          />
        </Field>

        {taskType === "2" ? (
          <>
            <Field label="Question" required>
              <RadioCards
                name="question_option"
                value={questionMode}
                onChange={(v) => setQuestionMode(v as "select" | "custom")}
                options={[
                  { value: "select", label: "Sample question" },
                  { value: "custom", label: "Paste your own" },
                ]}
              />
            </Field>
            {questionMode === "select" ? (
              <Field label="Sample Task 2 question" htmlFor="task2_sample">
                <Select
                  id="task2_sample"
                  value={task2Sample}
                  onChange={(e) => setTask2Sample(e.target.value)}
                >
                  {TASK2_QUESTIONS.map((q) => (
                    <option key={q} value={q}>
                      {q}
                    </option>
                  ))}
                </Select>
              </Field>
            ) : (
              <Field label="Your Task 2 question" htmlFor="task2_custom">
                <TextArea
                  id="task2_custom"
                  value={task2Custom}
                  onChange={(e) => setTask2Custom(e.target.value)}
                  placeholder="Paste your Task 2 question here"
                  className="min-h-20"
                />
              </Field>
            )}
          </>
        ) : (
          <Field label="Task 1 prompt" htmlFor="task1_q" required>
            <Select
              id="task1_q"
              value={String(task1Index)}
              onChange={(e) => setTask1Index(Number(e.target.value))}
            >
              {TASK1_QUESTIONS.map((q, i) => (
                <option key={q.text} value={i}>
                  {q.type}: {q.text.slice(0, 60)}…
                </option>
              ))}
            </Select>
          </Field>
        )}

        {activeQuestion && (
          <div className="rounded-xl border-l-2 border-[var(--color-accent)] bg-white/[0.02] px-4 py-3 text-sm italic text-[var(--color-muted)]">
            {activeQuestion}
          </div>
        )}

        {taskType === "1" && (
          <figure className="space-y-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${SITE.checkoutBase}${TASK1_QUESTIONS[task1Index].image}`}
              alt={`${TASK1_QUESTIONS[task1Index].type} — IELTS Task 1 visual`}
              className="mx-auto max-h-80 w-full rounded-xl border border-[var(--color-border)] bg-white object-contain p-3"
              loading="lazy"
            />
            <figcaption className="text-center text-xs text-[var(--color-faint)]">
              {TASK1_QUESTIONS[task1Index].type} — describe the visual above
            </figcaption>
          </figure>
        )}

        <Field
          label="Your writing sample"
          htmlFor="writing_sample"
          required
          hint={
            taskType === "1"
              ? "Write at least 150 words for accurate analysis."
              : "Aim for 250–300 words. Text beyond 300 words may be ignored."
          }
        >
          <TextArea
            id="writing_sample"
            value={writingSample}
            onChange={(e) => setWritingSample(e.target.value)}
            placeholder={
              taskType === "1" ? "Write your Task 1 summary here…" : "Write your Task 2 essay here…"
            }
            className="min-h-48"
            required
          />
        </Field>

        <div className="flex items-center justify-between text-xs">
          <span className="text-[var(--color-faint)]">
            Word count: <span style={{ color: wordColor }} className="font-semibold">{wordCount}</span>
          </span>
          <span className="text-[var(--color-faint)]">Approximate · self-study only</span>
        </div>

        <SubmitButton loading={loading}>
          <GraduationCap className="h-4 w-4" /> Estimate band
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
              Estimating your IELTS writing band…
            </p>
          </div>
        )}

        {!loading && !data && (
          <div className="surface-card flex h-full flex-col items-center justify-center gap-4 p-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-gradient-soft)] text-[var(--color-accent)]">
              <GraduationCap className="h-7 w-7" />
            </span>
            <h3 className="text-lg font-semibold">Your band estimate appears here</h3>
            <p className="max-w-sm text-sm text-[var(--color-muted)]">
              Paste a Task 1 or Task 2 response and get an AI-estimated band score with
              criterion-by-criterion feedback.
            </p>
          </div>
        )}

        {!loading && data && invalid && (
          <div className="surface-card p-6 md:p-8">
            <ScrollIntoViewOnMount />
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--color-border)] pb-5">
              <div>
                <h2 className="text-xl font-semibold">Unable to evaluate response</h2>
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  Please submit a proper {taskType === "1" ? "Task 1" : "Task 2"} response.
                </p>
              </div>
              <ResultActions getText={resultText} onReset={reset} />
            </div>
            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-[var(--color-danger)]/40 bg-[var(--color-danger)]/10 p-4 text-sm">
                <p className="flex items-center gap-2 font-semibold text-[var(--color-danger)]">
                  <AlertTriangle className="h-4 w-4" /> Evaluation not possible
                </p>
                <p className="mt-2 text-[var(--color-muted)]">
                  <strong>Issue detected:</strong> {issueDescription(data.issue_identified)}
                </p>
                <p className="mt-1 text-[var(--color-muted)]">
                  <strong>Word count:</strong> {String(data.word_count)} words
                </p>
                {data.feedback && (
                  <p className="mt-2 text-[var(--color-muted)]">
                    <strong>What to do:</strong> {data.feedback}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {!loading && data && !invalid && (
          <div className="surface-card p-6 md:p-8">
            <ScrollIntoViewOnMount />
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--color-border)] pb-5">
              <div>
                <h2 className="text-xl font-semibold">
                  Your IELTS {taskType === "1" ? "Task 1" : "Task 2"} band estimate
                </h2>
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  Band scores and improvement tips for each criterion.
                </p>
              </div>
              <ResultActions getText={resultText} onReset={reset} printTargetId="ielts-output" />
            </div>

            <div id="ielts-output" className="mt-6 space-y-6">
              <div className="flex flex-col items-center gap-2 rounded-2xl bg-[var(--brand-gradient-soft)] p-8 text-center">
                <span className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
                  Overall band score
                </span>
                <span className="text-5xl font-bold text-gradient">{String(data.overall_band)}</span>
                {data.comments && (
                  <p className="mt-2 max-w-xl text-sm text-[var(--color-muted)]">{data.comments}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {criteria.map((c) => {
                  const crit = data[c.key] as IeltsCriterion | undefined;
                  if (!crit) return null;
                  return (
                    <div
                      key={c.key}
                      className="rounded-xl border border-[var(--color-border)] bg-white/[0.02] p-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold">{c.label}</h3>
                        <span className="rounded-full bg-[var(--brand-gradient-soft)] px-3 py-1 text-sm font-semibold text-[var(--color-accent)]">
                          {String(crit.band)}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
                        <strong className="text-[var(--color-ink)]">Assessment:</strong>{" "}
                        {crit.explanation}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
                        <strong className="text-[var(--color-ink)]">Improvement:</strong>{" "}
                        {crit.improvement}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 rounded-xl border border-[var(--color-warning)]/40 bg-[var(--color-warning)]/10 p-4 text-sm text-[var(--color-muted)]">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-warning)]" />
                <p>
                  This is an AI-generated estimate for practice purposes only. Your actual IELTS
                  score may vary. For official preparation, use certified IELTS materials.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
