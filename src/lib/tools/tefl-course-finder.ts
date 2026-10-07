import { chat, extractJson } from "@/lib/llm";
import { LLM } from "@/lib/models";
import { COURSES } from "@/content/courses";
import { type ToolHandler, type ValidateResult, req, str } from "./types";

/* ────────────────────────────────────────────────────────────────────────────
 * TEFL Course Finder
 *
 * The WordPress original (assets/js/ai-tefl-course-finder.js) is a CLIENT-SIDE
 * decision-tree recommender — it has NO api_*.php handler and makes NO LLM call
 * (see investigation notes in the build report). Its 4-course database points at
 * external teflinstitute.com courses that are NOT in this site's catalogue.
 *
 * Per the build brief, this port instead recommends among the THREE real courses
 * in src/content/courses.ts. It keeps the SAME six input questions/options as the
 * WP form modal (goal, experience, english_level, intensity, study_style, budget)
 * and uses the LLM to pick the best-fit course + reasoning, with a deterministic
 * guard so the returned slugs are always valid catalogue courses.
 *
 * action: "find_tefl_course"  (matches the TOOLS registry entry in src/lib/site.ts)
 * ──────────────────────────────────────────────────────────────────────────── */

export interface CourseFinderInput {
  goal: string;
  experience: string;
  english_level: string;
  intensity: string;
  study_style: string;
  budget: string;
}

export interface CourseFinderResult {
  recommendedSlug: string;
  reasoning: string;
  profileSummary: string;
  alternatives: { slug: string; reason: string }[];
}

const GOALS = ["abroad", "online", "career", "travel"];
const EXPERIENCE = ["none", "little", "yes"];
const ENGLISH_LEVELS = ["native", "c2", "c1", "b2", "b1", "below_b1"];
const INTENSITY = ["quick", "in-depth", "professional"];
const STUDY_STYLES = ["self-paced", "tutor"];
const BUDGETS = ["under_100", "100_200", "200_400", "over_400"];

const inList = (v: string, list: string[]) => list.includes(v);

function catalogueForPrompt(): string {
  return COURSES.map(
    (c) =>
      `- slug: "${c.slug}"\n  title: ${c.title}\n  level: ${c.level}\n  duration: ${c.duration}\n  price: €${c.price}\n  summary: ${c.blurb}\n  highlights: ${c.highlights.join("; ")}\n  outcomes: ${c.outcomes.join("; ")}`
  ).join("\n");
}

const LABELS = {
  goal: {
    abroad: "Teach English abroad",
    online: "Teach English online",
    career: "Improve my teaching career",
    travel: "Travel and work short-term",
  } as Record<string, string>,
  experience: {
    none: "No teaching experience",
    little: "A little (tutoring or volunteering)",
    yes: "Has taught before",
  } as Record<string, string>,
  english_level: {
    native: "Native speaker",
    c2: "C2 – Proficient",
    c1: "C1 – Advanced",
    b2: "B2 – Upper Intermediate",
    b1: "B1 – Intermediate",
    below_b1: "Below B1",
  } as Record<string, string>,
  intensity: {
    quick: "Quick and basic introduction",
    "in-depth": "In-depth and recognised",
    professional: "Full professional training for top jobs",
  } as Record<string, string>,
  study_style: {
    "self-paced": "100% self-paced, flexible",
    tutor: "With tutor feedback and assignments",
  } as Record<string, string>,
  budget: {
    under_100: "Under €115",
    "100_200": "€115–€230",
    "200_400": "€230–€460",
    over_400: "Over €460",
  } as Record<string, string>,
};

function describeProfile(i: CourseFinderInput): string {
  return [
    `Goal: ${LABELS.goal[i.goal] ?? i.goal}`,
    `Experience: ${LABELS.experience[i.experience] ?? i.experience}`,
    `English level: ${LABELS.english_level[i.english_level] ?? i.english_level}`,
    `Course intensity preference: ${LABELS.intensity[i.intensity] ?? i.intensity}`,
    `Study style: ${LABELS.study_style[i.study_style] ?? i.study_style}`,
    `Budget: ${LABELS.budget[i.budget] ?? i.budget}`,
  ].join("\n- ");
}

export const teflCourseFinder: ToolHandler<CourseFinderInput, CourseFinderResult> = {
  action: "find_tefl_course",
  slug: "tefl-course-finder",

  validate(body): ValidateResult<CourseFinderInput> {
    const missing = req(body, [
      "goal",
      "experience",
      "english_level",
      "intensity",
      "study_style",
      "budget",
    ]);
    if (missing) return { ok: false, error: missing };

    const input: CourseFinderInput = {
      goal: str(body.goal),
      experience: str(body.experience),
      english_level: str(body.english_level),
      intensity: str(body.intensity),
      study_style: str(body.study_style),
      budget: str(body.budget),
    };

    if (
      !inList(input.goal, GOALS) ||
      !inList(input.experience, EXPERIENCE) ||
      !inList(input.english_level, ENGLISH_LEVELS) ||
      !inList(input.intensity, INTENSITY) ||
      !inList(input.study_style, STUDY_STYLES) ||
      !inList(input.budget, BUDGETS)
    ) {
      return { ok: false, error: "Please answer every question before submitting." };
    }

    return { ok: true, input };
  },

  async run(input): Promise<CourseFinderResult> {
    const slugs = COURSES.map((c) => c.slug);
    const flagship = "120-hour-accredited-tefl-course";

    const system =
      "You are an expert TEFL course advisor for TEFL.ai. Recommend the single best course for the learner from the provided catalogue ONLY, then rank the remaining courses as alternatives. Base every recommendation on the learner's stated goal, experience, English level, preferred intensity, study style and budget. Be encouraging, specific and concise. Respond with valid JSON only.";

    const user = `LEARNER PROFILE:
- ${describeProfile(input)}

AVAILABLE COURSES (recommend only from these, by slug):
${catalogueForPrompt()}

Return ONLY this JSON object:
{
  "recommendedSlug": "<slug of the single best-fit course>",
  "reasoning": "<2-3 sentences explaining why this course fits THIS learner's goal, level and budget>",
  "profileSummary": "<1 sentence summarising what the learner is looking for>",
  "alternatives": [
    { "slug": "<slug>", "reason": "<1 sentence on who this alternative suits>" }
  ]
}
Rules:
- "recommendedSlug" and every alternative "slug" MUST be one of: ${slugs.map((s) => `"${s}"`).join(", ")}.
- List every course other than the recommended one as an alternative.
- Do not invent courses, prices or URLs.`;

    let result: Partial<CourseFinderResult> = {};
    try {
      const content = await chat({
        model: LLM.models.large,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.4,
        json: true,
      });
      result = extractJson<Partial<CourseFinderResult>>(content);
    } catch {
      result = {};
    }

    // Deterministic guard: guarantee valid catalogue slugs and complete alternatives.
    let recommendedSlug =
      typeof result.recommendedSlug === "string" && slugs.includes(result.recommendedSlug)
        ? result.recommendedSlug
        : flagship;

    if (!slugs.includes(recommendedSlug)) recommendedSlug = slugs[0];

    const altReasons = new Map<string, string>();
    if (Array.isArray(result.alternatives)) {
      for (const a of result.alternatives) {
        if (a && typeof a.slug === "string" && slugs.includes(a.slug) && a.slug !== recommendedSlug) {
          altReasons.set(a.slug, typeof a.reason === "string" ? a.reason : "");
        }
      }
    }
    const alternatives = slugs
      .filter((s) => s !== recommendedSlug)
      .map((s) => ({ slug: s, reason: altReasons.get(s) || "" }));

    return {
      recommendedSlug,
      reasoning:
        typeof result.reasoning === "string" && result.reasoning.trim()
          ? result.reasoning.trim()
          : "Based on your goals and experience, this course gives you the strongest, most recognised foundation to start teaching.",
      profileSummary:
        typeof result.profileSummary === "string" ? result.profileSummary.trim() : "",
      alternatives,
    };
  },
};
