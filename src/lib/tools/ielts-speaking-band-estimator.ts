import { chat, extractJson } from "@/lib/llm";
import { LLM } from "@/lib/models";
import { transcribeAudio } from "./audio-transcription";
import { type ToolHandler, type ValidateResult, str } from "./types";

/** One IELTS speaking criterion (fluency / lexical / grammar / pronunciation). */
export interface SpeakingCriterion {
  band: number | string;
  feedback: string;
  suggestions: string[];
}

export interface IeltsSpeakingResult {
  overall_band: number | string;
  criteria: {
    fluency: SpeakingCriterion;
    vocabulary: SpeakingCriterion;
    grammar: SpeakingCriterion;
    pronunciation: SpeakingCriterion;
  };
  task_coverage: string;
  strengths: string[];
  areas_for_improvement: string[];
  next_steps: string;
  /** Added server-side after the assessment, mirroring the WP handler. */
  transcription: string;
  word_count: number;
  duration: number;
}

export interface SpeakingQuestion {
  title: string;
  points: string[];
}

export interface IeltsSpeakingInput {
  /** base64-encoded audio payload (no data: prefix). */
  audioData: string;
  /** Container format of the base64 audio — "wav" for openrouter_multimodal. */
  audioFormat: string;
  /** Recording length in seconds (client-measured). */
  audioDuration: number;
  /** The IELTS Part 2 cue card the learner answered. */
  question: SpeakingQuestion;
}

/** Build the IELTS examiner assessment prompt — a faithful port of
 *  generate_speaking_assessment() in api_estimate_speaking_band.php. */
function buildAssessmentPrompt(
  transcription: string,
  question: SpeakingQuestion,
  duration: number
): string {
  let prompt =
    "You are an expert IELTS examiner with 15+ years of experience. Assess this IELTS Part 2 speaking response.\n\n";
  prompt += `QUESTION: ${question.title}\n`;
  prompt += "POINTS TO COVER:\n";
  for (const point of question.points) {
    prompt += `• ${point}\n`;
  }
  prompt += `\nRESPONSE DURATION: ${Math.round(duration)} seconds\n`;
  prompt += `TRANSCRIBED RESPONSE: "${transcription}"\n\n`;

  prompt += "Evaluate based on IELTS Speaking Assessment Criteria:\n\n";
  prompt += "1. FLUENCY & COHERENCE: Speech rate, pauses, repetitions, self-correction, logical sequencing\n";
  prompt += "2. LEXICAL RESOURCE: Vocabulary range, appropriateness, and accuracy\n";
  prompt += "3. GRAMMATICAL RANGE & ACCURACY: Sentence structures, complexity, grammatical errors\n";
  prompt += "4. PRONUNCIATION: Individual sounds, word stress, rhythm, intonation\n\n";

  prompt += "Return assessment in this JSON format:\n";
  prompt += "{\n";
  prompt += '  "overall_band": 6.5,\n';
  prompt += '  "criteria": {\n';
  prompt += '    "fluency": {\n';
  prompt += '      "band": 6.5,\n';
  prompt += '      "feedback": "Detailed assessment of fluency and coherence",\n';
  prompt += '      "suggestions": ["specific improvement tip 1", "specific improvement tip 2"]\n';
  prompt += "    },\n";
  prompt += '    "vocabulary": {\n';
  prompt += '      "band": 6.0,\n';
  prompt += '      "feedback": "Assessment of lexical resource",\n';
  prompt += '      "suggestions": ["vocabulary improvement tip 1", "vocabulary improvement tip 2"]\n';
  prompt += "    },\n";
  prompt += '    "grammar": {\n';
  prompt += '      "band": 6.5,\n';
  prompt += '      "feedback": "Grammar range and accuracy assessment",\n';
  prompt += '      "suggestions": ["grammar improvement tip 1", "grammar improvement tip 2"]\n';
  prompt += "    },\n";
  prompt += '    "pronunciation": {\n';
  prompt += '      "band": 6.0,\n';
  prompt += '      "feedback": "Pronunciation assessment",\n';
  prompt += '      "suggestions": ["pronunciation tip 1", "pronunciation tip 2"]\n';
  prompt += "    }\n";
  prompt += "  },\n";
  prompt += '  "task_coverage": "How well the response addressed the question points",\n';
  prompt += '  "strengths": ["strength 1", "strength 2", "strength 3"],\n';
  prompt += '  "areas_for_improvement": ["improvement area 1", "improvement area 2"],\n';
  prompt += '  "next_steps": "Specific advice for improvement"\n';
  prompt += "}\n\n";

  prompt += "IMPORTANT:\n";
  prompt += "• Be constructive and encouraging while maintaining assessment standards\n";
  prompt += "• Consider that transcription may have minor errors due to speech-to-text processing\n";
  prompt += "• Focus on patterns rather than isolated mistakes\n";
  prompt += "• Provide specific, actionable feedback\n";
  prompt +=
    "• Overall band should reflect realistic IELTS scoring (average of four criteria, rounded to nearest 0.5)";

  return prompt;
}

const arr = (v: unknown): string[] =>
  Array.isArray(v) ? v.map(String) : v ? [String(v)] : [];

function normaliseCriterion(v: unknown): SpeakingCriterion {
  const c = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  return {
    band: typeof c.band === "number" || typeof c.band === "string" ? c.band : "",
    feedback: str(c.feedback),
    suggestions: arr(c.suggestions),
  };
}

export const ieltsSpeakingBandEstimator: ToolHandler<IeltsSpeakingInput, IeltsSpeakingResult> = {
  action: "estimate_ielts_speaking_band",
  slug: "ai-ielts-speaking-band-estimator",

  validate(body): ValidateResult<IeltsSpeakingInput> {
    // Audio recording required.
    const audioData = str(body.audio_data);
    if (!audioData) return { ok: false, error: "Audio recording is required." };

    // Recording consent required (checkbox posts "on").
    const consent = body.recording_consent;
    if (consent !== "on" && consent !== true) {
      return { ok: false, error: "Recording consent is required." };
    }

    // Question data required.
    const rawQuestion = str(body.selected_question);
    if (!rawQuestion) return { ok: false, error: "Question data is missing." };

    // Minimum 30 seconds of speech.
    const duration = Number(body.audio_duration ?? 0);
    if (!Number.isFinite(duration) || duration < 30) {
      return { ok: false, error: "Recording must be at least 30 seconds long for assessment." };
    }

    let question: SpeakingQuestion;
    try {
      const parsed = JSON.parse(rawQuestion) as Partial<SpeakingQuestion>;
      if (!parsed || !parsed.title) return { ok: false, error: "Invalid question data." };
      question = { title: String(parsed.title), points: arr(parsed.points) };
    } catch {
      return { ok: false, error: "Invalid question data." };
    }

    return {
      ok: true,
      input: {
        audioData,
        audioFormat: str(body.audio_format) || "wav",
        audioDuration: duration,
        question,
      },
    };
  },

  async run(input): Promise<IeltsSpeakingResult> {
    // 1) Transcribe the audio.
    const transcription = await transcribeAudio(input.audioData, input.audioFormat);
    if (!transcription) {
      throw new Error("Failed to transcribe audio. Please ensure clear audio quality and try again.");
    }

    // 2) Guard against transcriptions too short to assess.
    const wordCount = transcription.split(/\s+/).filter(Boolean).length;
    if (wordCount < 20) {
      throw new Error(
        "Transcription too short for meaningful assessment. Please speak more clearly or for longer duration."
      );
    }

    // 3) Assess against the four IELTS speaking criteria (LLM_MODEL_LARGE, temp 0.3).
    const prompt = buildAssessmentPrompt(transcription, input.question, input.audioDuration);
    const content = await chat({
      model: LLM.models.large,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      maxTokens: 2000,
    });

    const parsed = extractJson<Partial<IeltsSpeakingResult>>(content);
    const criteria = (parsed.criteria ?? {}) as Record<string, unknown>;

    return {
      overall_band:
        typeof parsed.overall_band === "number" || typeof parsed.overall_band === "string"
          ? parsed.overall_band
          : "",
      criteria: {
        fluency: normaliseCriterion(criteria.fluency),
        vocabulary: normaliseCriterion(criteria.vocabulary),
        grammar: normaliseCriterion(criteria.grammar),
        pronunciation: normaliseCriterion(criteria.pronunciation),
      },
      task_coverage: str(parsed.task_coverage),
      strengths: arr(parsed.strengths),
      areas_for_improvement: arr(parsed.areas_for_improvement),
      next_steps: str(parsed.next_steps),
      transcription,
      word_count: wordCount,
      duration: input.audioDuration,
    };
  },
};
