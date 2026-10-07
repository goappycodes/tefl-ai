import { chat, extractJson, LlmError } from "@/lib/llm";
import { LLM } from "@/lib/models";
import { type ToolHandler, type ValidateResult } from "./types";

/* ────────────────────────────────────────────────────────────────────────────
 * English Level Test — a TWO-STEP adaptive CEFR placement test.
 *
 * Faithful port of the WordPress pair:
 *   1. includes/api_get_tefl_elt_questions.php  (REST GET /elt/v1/questions)
 *      → generates a validated question set with LLM_MODEL_ELT.
 *   2. includes/api_get_elt_analysis.php         (wp_ajax process_english_level_test)
 *      → scores answers DETERMINISTICALLY in PHP, then asks LLM_MODEL_SMALL for
 *        personalised feedback that echoes the already-computed scores.
 *
 * Exposed as two handlers (wired into the registry by the parent agent):
 *   • eltQuestions  → action "get_tefl_elt_questions"
 *   • eltAnalysis   → action "process_english_level_test"
 * ──────────────────────────────────────────────────────────────────────────── */

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
const SKILLS = ["Grammar", "Vocabulary", "Reading"] as const;

export type EltLevel = (typeof LEVELS)[number];
export type EltSkill = (typeof SKILLS)[number];

export interface EltQuestion {
  level: EltLevel;
  skill: EltSkill;
  question: string;
  passage: string;
  options: string[];
  correct: string;
  explanation: string;
  name: string; // "q1", "q2", …
}

/* ======================= STEP 1 — QUESTION GENERATION ====================== */

export interface EltQuestionsInput {
  count: number;
}

/** Mirrors eltValidateAndSelect() in api_get_tefl_elt_questions.php. */
function eltValidateAndSelect(items: unknown[], count: number): EltQuestion[] | null {
  const valid: EltQuestion[] = [];

  for (const raw of items) {
    if (!raw || typeof raw !== "object") continue;
    const q = raw as Record<string, unknown>;

    const level = String(q.level ?? "").trim().toUpperCase();
    if (!(LEVELS as readonly string[]).includes(level)) continue;

    const skillRaw = String(q.skill ?? "").trim().toLowerCase();
    const skill = skillRaw ? skillRaw[0].toUpperCase() + skillRaw.slice(1) : "";
    if (!(SKILLS as readonly string[]).includes(skill)) continue;

    const qt = String(q.question ?? "").trim();
    if (qt === "") continue;

    const optsRaw = q.options;
    if (!Array.isArray(optsRaw) || optsRaw.length !== 4) continue;
    const opts = optsRaw.map((x) => String(x ?? "").trim());
    if (opts.filter((x) => x !== "").length !== 4) continue;
    if (new Set(opts.map((x) => x.toLowerCase())).size !== 4) continue;

    const correctRaw = String(q.correct ?? "").trim();
    let match: string | null = null;
    for (const x of opts) {
      if (x.toLowerCase() === correctRaw.toLowerCase()) {
        match = x;
        break;
      }
    }
    if (match === null) continue;

    const passage = String(q.passage ?? "").trim();
    if (skill === "Reading" && passage === "") continue;

    valid.push({
      level: level as EltLevel,
      skill: skill as EltSkill,
      question: qt,
      passage,
      options: opts,
      correct: match,
      explanation: String(q.explanation ?? "").trim(),
      name: "",
    });
  }

  if (valid.length < count) return null;

  // One question per CEFR level first, then fill (shuffled) up to count.
  const byLevel: Record<string, EltQuestion[]> = {};
  for (const vq of valid) (byLevel[vq.level] ??= []).push(vq);

  const selected: EltQuestion[] = [];
  for (const lv of LEVELS) {
    const bucket = byLevel[lv];
    if (bucket && bucket.length) selected.push(bucket.shift()!);
  }
  const rest: EltQuestion[] = [];
  for (const arr of Object.values(byLevel)) rest.push(...arr);
  shuffle(rest);
  for (const vq of rest) {
    if (selected.length >= count) break;
    selected.push(vq);
  }
  if (selected.length < count) return null;

  const trimmed = selected.slice(0, count);
  shuffle(trimmed);
  return trimmed;
}

function shuffle<T>(a: T[]): void {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
}

function buildQuestionPrompt(genCount: number): string {
  return `Return an object with a key "questions" whose value is an array of exactly ${genCount} unique English assessment questions.
Each question must be an object with these keys:
level (A1, A2, B1, B2, C1, or C2),
skill (Grammar, Vocabulary, or Reading),
question (string),
options (array of 4 strings),
correct (string),
explanation (string),
name (string, e.g., "q1", "q2", ...).
For Reading questions, include a "passage" key (2–4 sentences).
Distribution:
- 40% Grammar
- 40% Vocabulary
- 20% Reading (with passage)
- All CEFR levels (A1–C2) must be represented, at least one question per level.
STRICT QUALITY RULES:
- Exactly ONE option is unambiguously correct; the other 3 are plausible but clearly wrong for that level. No "all/none of the above" and no opinion-based items.
- "correct" MUST be copied verbatim as one of the 4 options (same spelling and case).
- The 4 options must be distinct (no duplicates), and difficulty must match the stated level.
- Every question must be unique.
Return only the JSON object.`;
}

export const eltQuestions: ToolHandler<EltQuestionsInput, EltQuestion[]> = {
  action: "get_tefl_elt_questions",
  slug: "english-level-test",

  validate(body): ValidateResult<EltQuestionsInput> {
    const n = Number(body.count);
    // Mirrors the REST validate_callback: numeric, > 0, <= 50; default 20.
    const count = Number.isFinite(n) && n > 0 && n <= 50 ? Math.floor(n) : 20;
    return { ok: true, input: { count } };
  },

  async run(input): Promise<EltQuestion[]> {
    const count = input.count || 20;
    const genCount = count + 4; // generate extras so invalid items can be dropped
    const messages = [
      {
        role: "system" as const,
        content:
          "You are an expert TEFL instructor. Always follow user instructions exactly.",
      },
      { role: "user" as const, content: buildQuestionPrompt(genCount) },
    ];

    // Up to 3 attempts to obtain enough valid questions (matches PHP max_retries).
    for (let attempt = 0; attempt < 3; attempt++) {
      const content = await chat({
        model: LLM.models.elt,
        messages,
        temperature: 0.8,
        maxTokens: 6000,
        json: true,
      });
      try {
        const parsed = extractJson<{ questions?: unknown[] }>(content);
        if (parsed && Array.isArray(parsed.questions)) {
          const selected = eltValidateAndSelect(parsed.questions, count);
          if (selected) {
            selected.forEach((q, i) => (q.name = `q${i + 1}`));
            return selected;
          }
        }
      } catch {
        /* fall through to retry */
      }
    }

    throw new LlmError("Failed to generate valid questions after multiple attempts");
  },
};

/* ========================= STEP 2 — ANSWER ANALYSIS ======================== */

export interface EltAnalysisInput {
  questions: EltQuestion[];
  answers: Record<string, string>;
}

interface SkillPerf {
  correct: number;
  total: number;
  percentage: number;
}

export interface EltSkillResult {
  level: string;
  score: number;
  feedback: string;
}

export interface EltCourseRec {
  course: string;
  reason: string;
  url: string;
}

export interface EltAnalysisResult {
  overall_cefr_level: string;
  score_percentage: number;
  correct_answers: number;
  total_questions: number;
  skill_breakdown: {
    grammar: EltSkillResult;
    vocabulary: EltSkillResult;
    reading: EltSkillResult;
    [k: string]: EltSkillResult;
  };
  strengths: string[];
  areas_for_improvement: string[];
  detailed_analysis: string;
  course_recommendations: {
    teflinstitute: EltCourseRec;
    tefl_ie: EltCourseRec;
    premiertefl: EltCourseRec;
    [k: string]: EltCourseRec;
  };
  next_steps: string[];
  motivational_message: string;
}

/** PHP-equivalent answer normalisation: lowercase, strip punctuation, collapse spaces. */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export const eltAnalysis: ToolHandler<EltAnalysisInput, EltAnalysisResult> = {
  action: "process_english_level_test",
  slug: "english-level-test",

  validate(body): ValidateResult<EltAnalysisInput> {
    // questions arrive as an array (JSON) or a JSON string (mirrors questions_data).
    let questions: EltQuestion[] | null = null;
    const raw = body.questions_data;
    if (Array.isArray(raw)) {
      questions = raw as EltQuestion[];
    } else if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) questions = parsed as EltQuestion[];
      } catch {
        return { ok: false, error: "Questions data missing or invalid" };
      }
    }
    if (!questions || questions.length === 0) {
      return { ok: false, error: "Questions data missing or invalid" };
    }

    const answers: Record<string, string> = {};
    questions.forEach((_, i) => {
      const key = `q${i + 1}`;
      const v = body[key];
      answers[key] = typeof v === "string" ? v.trim() : v == null ? "" : String(v).trim();
    });

    return { ok: true, input: { questions, answers } };
  },

  async run(input): Promise<EltAnalysisResult> {
    const { questions, answers } = input;

    const skillPerf: Record<string, SkillPerf> = {
      grammar: { correct: 0, total: 0, percentage: 0 },
      vocabulary: { correct: 0, total: 0, percentage: 0 },
      reading: { correct: 0, total: 0, percentage: 0 },
    };
    const levelPerf: Record<string, { correct: number; total: number; percentage: number | null }> = {
      a1: { correct: 0, total: 0, percentage: null },
      a2: { correct: 0, total: 0, percentage: null },
      b1: { correct: 0, total: 0, percentage: null },
      b2: { correct: 0, total: 0, percentage: null },
      c1: { correct: 0, total: 0, percentage: null },
      c2: { correct: 0, total: 0, percentage: null },
    };

    let correctAnswers = 0;
    const totalQuestions = questions.length;
    const detailed: Array<Record<string, unknown>> = [];

    questions.forEach((q, index) => {
      const key = `q${index + 1}`;
      const studentAnswer = (answers[key] ?? "").trim();
      const correctAnswer = String(q.correct ?? "").trim();
      const skill = String(q.skill ?? "").toLowerCase();

      skillPerf[skill] ??= { correct: 0, total: 0, percentage: 0 };
      skillPerf[skill].total++;

      const qlevel = String(q.level ?? "").trim().toLowerCase();
      if (levelPerf[qlevel]) levelPerf[qlevel].total++;

      const isCorrect = normalize(studentAnswer) === normalize(correctAnswer);
      if (isCorrect) {
        correctAnswers++;
        skillPerf[skill].correct++;
        if (levelPerf[qlevel]) levelPerf[qlevel].correct++;
      }

      detailed.push({
        question_number: index + 1,
        question: q.question,
        student_answer: studentAnswer,
        correct_answer: correctAnswer,
        is_correct: isCorrect,
        skill: q.skill,
        level: q.level,
        explanation: q.explanation ?? "",
      });
    });

    const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);

    for (const skill of Object.keys(skillPerf)) {
      const p = skillPerf[skill];
      p.percentage = p.total > 0 ? Math.round((p.correct / p.total) * 100) : 0;
    }
    for (const lv of Object.keys(levelPerf)) {
      const lp = levelPerf[lv];
      lp.percentage = lp.total > 0 ? Math.round((lp.correct / lp.total) * 100) : null;
    }

    // Difficulty-aware CEFR: highest level passed (>=60% at that level AND
    // >=60% cumulatively up to it), stopping at the first level they fail.
    let cefrLevel = "A1";
    let cumCorrect = 0;
    let cumTotal = 0;
    for (const lv of ["a1", "a2", "b1", "b2", "c1", "c2"]) {
      const lt = levelPerf[lv].total;
      if (lt === 0) continue;
      cumCorrect += levelPerf[lv].correct;
      cumTotal += lt;
      const levelPct = levelPerf[lv].correct / lt;
      const cumPct = cumTotal > 0 ? cumCorrect / cumTotal : 0;
      if (levelPct >= 0.6 && cumPct >= 0.6) {
        cefrLevel = lv.toUpperCase();
      } else {
        break;
      }
    }

    const grammarPct = skillPerf.grammar?.percentage ?? 0;
    const vocabPct = skillPerf.vocabulary?.percentage ?? 0;
    const readingPct = skillPerf.reading?.percentage ?? 0;

    const userPrompt = `Provide personalized English learning analysis based on this COMPLETED assessment:

                PERFORMANCE SUMMARY:
                - Total Score: ${correctAnswers}/${totalQuestions} (${scorePercentage}%)
                - CEFR Level: ${cefrLevel}
                - Skill Performance: ${JSON.stringify(skillPerf)}
                - Performance by CEFR level: ${JSON.stringify(levelPerf)}

                DETAILED QUESTION ANALYSIS:
                ${JSON.stringify(detailed)}

                INSTRUCTIONS:
                1. Use the EXACT scores provided above - do not recalculate
                2. Analyze patterns in incorrect answers to identify specific learning needs
                3. Provide personalized feedback based on actual mistakes made
                4. Recommend appropriate courses based on the ${cefrLevel} level achieved
                5. Give specific next steps based on weak skill areas

                RESPONSE FORMAT (use the EXACT scores provided):
                {
                    "overall_cefr_level": "${cefrLevel}",
                    "score_percentage": ${scorePercentage},
                    "correct_answers": ${correctAnswers},
                    "total_questions": ${totalQuestions},
                    "skill_breakdown": {
                        "grammar": {"level": "[Determine from grammar performance]", "score": ${grammarPct}, "feedback": "[Based on actual grammar mistakes]"},
                        "vocabulary": {"level": "[Determine from vocab performance]", "score": ${vocabPct}, "feedback": "[Based on actual vocab mistakes]"},
                        "reading": {"level": "[Determine from reading performance]", "score": ${readingPct}, "feedback": "[Based on actual reading mistakes]"}
                    },
                    "strengths": ["[List based on highest performing skills]"],
                    "areas_for_improvement": ["[List based on specific mistakes and weak skills]"],
                    "detailed_analysis": "[Comprehensive analysis of performance patterns and specific errors made]",
                    "course_recommendations": {
                        "teflinstitute": {
                            "course": "[Recommend based on ${cefrLevel} level]",
                            "reason": "[Explain based on specific weak areas identified]",
                            "url": "https://teflinstitute.com/tefl-courses-overview/"
                        },
                        "tefl_ie": {
                            "course": "[Recommend based on ${cefrLevel} level]",
                            "reason": "[Explain based on actual skill gaps]",
                            "url": "https://tefl.ie/courses"
                        },
                        "premiertefl": {
                            "course": "[Recommend based on ${cefrLevel} level]",
                            "reason": "[Explain based on specific learning needs]",
                            "url": "https://premiertefl.com/courses"
                        }
                    },
                    "next_steps": [
                        "[Specific action based on actual weak areas]",
                        "[Another recommendation based on mistakes made]",
                        "[Third suggestion based on skill gaps identified]"
                    ],
                    "motivational_message": "[Encouraging message based on actual ${scorePercentage}% performance and ${cefrLevel} level]"
                }

                Return only valid JSON with analysis based on the PROVIDED scoring data and specific mistakes identified.`;

    const content = await chat({
      model: LLM.models.small,
      messages: [
        {
          role: "system" as const,
          content:
            "You are an expert TEFL instructor and CEFR assessment specialist. You will receive ALREADY CALCULATED scoring data and detailed question analysis. Your job is to provide personalized feedback, course recommendations, and learning guidance based on the actual performance data provided.",
        },
        { role: "user" as const, content: userPrompt },
      ],
      temperature: 0.7,
      maxTokens: 2500,
    });

    const parsed = extractJson<Partial<EltAnalysisResult>>(content);

    // The prompt fixes these values exactly; overlay the deterministic figures so
    // the UI is always correct even if the model drifts.
    const skill = (r: Partial<EltSkillResult> | undefined, fallbackScore: number): EltSkillResult => ({
      level: r?.level || "",
      score: typeof r?.score === "number" ? r.score : fallbackScore,
      feedback: r?.feedback || "",
    });
    const arr = (v: unknown): string[] =>
      Array.isArray(v) ? v.map(String) : v ? [String(v)] : [];
    const rec = (r: Partial<EltCourseRec> | undefined, url: string): EltCourseRec => ({
      course: r?.course || "",
      reason: r?.reason || "",
      url: r?.url || url,
    });

    const sb = parsed.skill_breakdown ?? ({} as EltAnalysisResult["skill_breakdown"]);
    const cr = parsed.course_recommendations ?? ({} as EltAnalysisResult["course_recommendations"]);

    return {
      overall_cefr_level: cefrLevel,
      score_percentage: scorePercentage,
      correct_answers: correctAnswers,
      total_questions: totalQuestions,
      skill_breakdown: {
        grammar: skill(sb.grammar, grammarPct),
        vocabulary: skill(sb.vocabulary, vocabPct),
        reading: skill(sb.reading, readingPct),
      },
      strengths: arr(parsed.strengths),
      areas_for_improvement: arr(parsed.areas_for_improvement),
      detailed_analysis: parsed.detailed_analysis || "",
      course_recommendations: {
        teflinstitute: rec(cr.teflinstitute, "https://teflinstitute.com/tefl-courses-overview/"),
        tefl_ie: rec(cr.tefl_ie, "https://tefl.ie/courses"),
        premiertefl: rec(cr.premiertefl, "https://premiertefl.com/courses"),
      },
      next_steps: arr(parsed.next_steps),
      motivational_message: parsed.motivational_message || "",
    };
  },
};
