import { chat, extractJson } from "@/lib/llm";
import { LLM } from "@/lib/models";
import { type ToolHandler, type ValidateResult, req, str } from "./types";

export interface CefrWritingInput {
  studentWriting: string;
  taskContext: string;
  learnerProfile: "young learner" | "teen" | "adult";
}

export interface CefrGrammarItem {
  error: string;
  correction: string;
  note: string;
}

export interface CefrWritingResult {
  cefr_level: string;
  confidence: string;
  summary: string;
  strengths: string[];
  grammar_feedback: CefrGrammarItem[];
  vocabulary_feedback: string[];
  next_steps: string[];
}

const ALLOWED_PROFILES = ["young learner", "teen", "adult"] as const;

const SYSTEM =
  "You are a strict, experienced CEFR (Common European Framework of Reference for Languages) writing examiner. " +
  "You assess English writing samples using the official Council of Europe CEFR descriptors (A1, A2, B1, B2, C1, C2). " +
  "Be rigorous and evidence-based: base the level on actual grammatical range and accuracy, vocabulary range and control, " +
  "coherence and cohesion, and task achievement demonstrated in the text — never on length or effort alone. " +
  "You must respond with STRICT JSON only, matching exactly the schema you are given, with no markdown code fences and no extra commentary.";

/** Faithful port of the user prompt built in api_grade_cefr_writing.php. */
function buildPrompt(writingSample: string, taskContext: string, learnerProfile: string): string {
  let p = "Assess the following student writing sample and determine its CEFR level.\n\n";
  p += `Learner profile: ${learnerProfile}\n`;
  if (taskContext) {
    p += `Task / prompt context: "${taskContext}"\n`;
  }
  p += `\nStudent writing sample:\n"""\n${writingSample}\n"""\n\n`;
  p += "Evaluate using the Common European Framework of Reference (CEFR) descriptors covering range, accuracy, ";
  p += "coherence/cohesion, and task achievement. Consider the learner profile when phrasing feedback tone (encouraging for young learners/teens, more direct for adults), ";
  p += "but grade the CEFR level strictly on linguistic evidence.\n\n";
  p += "Return STRICT JSON with EXACTLY this schema and no additional keys:\n";
  p += "{\n";
  p += '  "cefr_level": "A1|A2|B1|B2|C1|C2",\n';
  p += '  "confidence": "high|medium|low",\n';
  p += '  "summary": "2-3 sentence overall summary of the writing quality and level",\n';
  p += '  "strengths": ["specific strength 1", "specific strength 2", "..."],\n';
  p += '  "grammar_feedback": [{"error": "quoted or described error from the text", "correction": "corrected version", "note": "brief explanation"}],\n';
  p += '  "vocabulary_feedback": ["specific vocabulary or collocation observation or suggestion", "..."],\n';
  p += '  "next_steps": ["concrete actionable next step 1", "concrete actionable next step 2", "..."]\n';
  p += "}\n\n";
  p += "Guidelines:\n";
  p += "- grammar_feedback should contain 3-6 concrete, real errors found in the text (or state there are none if the writing is largely error-free at a high level).\n";
  p += "- vocabulary_feedback should contain 3-5 concrete observations about word choice, range, or collocations.\n";
  p += "- strengths should contain 2-4 genuine, specific positives.\n";
  p += "- next_steps should contain 3-5 concrete, actionable recommendations tailored to the learner_profile and the identified CEFR level.\n";
  p += "- Return only the JSON object, nothing else.";
  return p;
}

const strArray = (v: unknown): string[] =>
  Array.isArray(v) ? v.map((x) => str(x)).filter(Boolean) : [];

export const cefrWritingGrader: ToolHandler<CefrWritingInput, CefrWritingResult> = {
  action: "grade_cefr_writing",
  slug: "cefr-writing-grader",

  validate(body): ValidateResult<CefrWritingInput> {
    const missing = req(body, ["student_writing"]);
    if (missing) return { ok: false, error: "Student writing sample is required." };

    const profileRaw = str(body.learner_profile) || "adult";
    const learnerProfile = (ALLOWED_PROFILES as readonly string[]).includes(profileRaw)
      ? (profileRaw as CefrWritingInput["learnerProfile"])
      : "adult";

    return {
      ok: true,
      input: {
        studentWriting: str(body.student_writing),
        taskContext: str(body.task_context),
        learnerProfile,
      },
    };
  },

  async run(input): Promise<CefrWritingResult> {
    // Truncate input beyond ~800 words server-side (mirrors the PHP handler).
    let writingSample = input.studentWriting.trim();
    const words = writingSample.split(/\s+/);
    if (words.length > 800) {
      writingSample = words.slice(0, 800).join(" ");
    }

    const content = await chat({
      model: LLM.models.grader,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: buildPrompt(writingSample, input.taskContext, input.learnerProfile) },
      ],
      temperature: 0.3,
      maxTokens: 1800,
    });

    const parsed = extractJson<Partial<CefrWritingResult>>(content);

    const grammar = Array.isArray(parsed.grammar_feedback)
      ? parsed.grammar_feedback.map((g) => ({
          error: str((g as Partial<CefrGrammarItem>)?.error),
          correction: str((g as Partial<CefrGrammarItem>)?.correction),
          note: str((g as Partial<CefrGrammarItem>)?.note),
        }))
      : [];

    return {
      cefr_level: str(parsed.cefr_level) || "N/A",
      confidence: str(parsed.confidence),
      summary: str(parsed.summary),
      strengths: strArray(parsed.strengths),
      grammar_feedback: grammar,
      vocabulary_feedback: strArray(parsed.vocabulary_feedback),
      next_steps: strArray(parsed.next_steps),
    };
  },
};
