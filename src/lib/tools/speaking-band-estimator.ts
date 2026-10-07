import { chat, extractJson } from "@/lib/llm";
import { LLM } from "@/lib/models";
import { transcribeAudio } from "./audio-transcription";
import { type ToolHandler, type ValidateResult, str } from "./types";

/**
 * General spoken-English proficiency estimator.
 *
 * Legacy/general variant of the IELTS speaking estimator (WP page id 582,
 * /speaking-band-estimator/). There is no dedicated WP page template or AJAX
 * handler for it — only the IELTS variant (estimate_ielts_speaking_band) ships
 * a page-*.php. This handler reuses the exact same audio -> transcription ->
 * assessment pipeline (shared transcribeAudio + the same min-duration/consent
 * rules), but assesses against the general CEFR scale (A1–C2) rather than the
 * IELTS 0–9 band scale.
 */

/** One CEFR criterion (fluency / vocabulary / grammar / pronunciation). */
export interface SpeakingCriterion {
  level: string;
  feedback: string;
  suggestions: string[];
}

export interface SpeakingBandResult {
  overall_level: string;
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
  /** Added server-side after the assessment, mirroring the WP pipeline. */
  transcription: string;
  word_count: number;
  duration: number;
}

export interface SpeakingPrompt {
  title: string;
  points: string[];
}

export interface SpeakingBandInput {
  audioData: string;
  audioFormat: string;
  audioDuration: number;
  prompt: SpeakingPrompt;
}

/** Build the general CEFR speaking-assessment prompt. Mirrors the structure of
 *  the IELTS prompt but swaps the band scale for CEFR levels and general
 *  spoken-English proficiency descriptors. */
function buildAssessmentPrompt(
  transcription: string,
  prompt: SpeakingPrompt,
  duration: number
): string {
  let p =
    "You are an expert English language assessor specialising in the CEFR framework. Assess this spoken-English response and estimate the speaker's proficiency level.\n\n";
  p += `SPEAKING PROMPT: ${prompt.title}\n`;
  if (prompt.points.length) {
    p += "SUGGESTED POINTS TO COVER:\n";
    for (const point of prompt.points) {
      p += `• ${point}\n`;
    }
  }
  p += `\nRESPONSE DURATION: ${Math.round(duration)} seconds\n`;
  p += `TRANSCRIBED RESPONSE: "${transcription}"\n\n`;

  p += "Evaluate the response against these four areas of spoken proficiency:\n\n";
  p += "1. FLUENCY & COHERENCE: Speech rate, pauses, hesitation, logical flow and connected speech\n";
  p += "2. VOCABULARY (LEXICAL RANGE): Range, precision and appropriacy of word choice\n";
  p += "3. GRAMMAR (RANGE & ACCURACY): Variety and control of grammatical structures\n";
  p += "4. PRONUNCIATION: Intelligibility, individual sounds, word stress, rhythm and intonation\n\n";

  p += "Estimate a CEFR level (one of A1, A2, B1, B2, C1, C2) overall and for each area.\n\n";
  p += "Return the assessment in this exact JSON format:\n";
  p += "{\n";
  p += '  "overall_level": "B2",\n';
  p += '  "criteria": {\n';
  p += '    "fluency": {\n';
  p += '      "level": "B2",\n';
  p += '      "feedback": "Detailed assessment of fluency and coherence",\n';
  p += '      "suggestions": ["specific improvement tip 1", "specific improvement tip 2"]\n';
  p += "    },\n";
  p += '    "vocabulary": {\n';
  p += '      "level": "B1",\n';
  p += '      "feedback": "Assessment of vocabulary / lexical range",\n';
  p += '      "suggestions": ["vocabulary improvement tip 1", "vocabulary improvement tip 2"]\n';
  p += "    },\n";
  p += '    "grammar": {\n';
  p += '      "level": "B2",\n';
  p += '      "feedback": "Grammatical range and accuracy assessment",\n';
  p += '      "suggestions": ["grammar improvement tip 1", "grammar improvement tip 2"]\n';
  p += "    },\n";
  p += '    "pronunciation": {\n';
  p += '      "level": "B1",\n';
  p += '      "feedback": "Pronunciation assessment",\n';
  p += '      "suggestions": ["pronunciation tip 1", "pronunciation tip 2"]\n';
  p += "    }\n";
  p += "  },\n";
  p += '  "task_coverage": "How fully and relevantly the response addressed the prompt",\n';
  p += '  "strengths": ["strength 1", "strength 2", "strength 3"],\n';
  p += '  "areas_for_improvement": ["improvement area 1", "improvement area 2"],\n';
  p += '  "next_steps": "Specific, actionable advice for improvement"\n';
  p += "}\n\n";

  p += "IMPORTANT:\n";
  p += "• Be constructive and encouraging while maintaining assessment standards\n";
  p += "• Consider that transcription may have minor errors due to speech-to-text processing\n";
  p += "• Focus on patterns rather than isolated mistakes\n";
  p += "• Provide specific, actionable feedback\n";
  p += "• The overall level should reflect the general CEFR descriptor that best matches the four areas";

  return p;
}

const arr = (v: unknown): string[] =>
  Array.isArray(v) ? v.map(String) : v ? [String(v)] : [];

function normaliseCriterion(v: unknown): SpeakingCriterion {
  const c = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  return {
    level: str(c.level) || str(c.band),
    feedback: str(c.feedback),
    suggestions: arr(c.suggestions),
  };
}

export const speakingBandEstimator: ToolHandler<SpeakingBandInput, SpeakingBandResult> = {
  action: "estimate_speaking_band",
  slug: "speaking-band-estimator",

  validate(body): ValidateResult<SpeakingBandInput> {
    // Audio recording required.
    const audioData = str(body.audio_data);
    if (!audioData) return { ok: false, error: "Audio recording is required." };

    // Recording consent required (checkbox posts "on").
    const consent = body.recording_consent;
    if (consent !== "on" && consent !== true) {
      return { ok: false, error: "Recording consent is required." };
    }

    // Minimum 30 seconds of speech.
    const duration = Number(body.audio_duration ?? 0);
    if (!Number.isFinite(duration) || duration < 30) {
      return { ok: false, error: "Recording must be at least 30 seconds long for assessment." };
    }

    // A speaking prompt is provided for context; tolerate its absence.
    let prompt: SpeakingPrompt = { title: "Open speaking response", points: [] };
    const rawPrompt = str(body.selected_question);
    if (rawPrompt) {
      try {
        const parsed = JSON.parse(rawPrompt) as Partial<SpeakingPrompt>;
        if (parsed && parsed.title) {
          prompt = { title: String(parsed.title), points: arr(parsed.points) };
        }
      } catch {
        // Fall back to the open-response prompt rather than failing.
      }
    }

    return {
      ok: true,
      input: {
        audioData,
        audioFormat: str(body.audio_format) || "wav",
        audioDuration: duration,
        prompt,
      },
    };
  },

  async run(input): Promise<SpeakingBandResult> {
    // 1) Transcribe the audio (shared multimodal pipeline).
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

    // 3) Assess against the CEFR scale (LLM_MODEL_LARGE, temp 0.3).
    const prompt = buildAssessmentPrompt(transcription, input.prompt, input.audioDuration);
    const content = await chat({
      model: LLM.models.large,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      maxTokens: 2000,
    });

    const parsed = extractJson<Partial<SpeakingBandResult>>(content);
    const criteria = (parsed.criteria ?? {}) as Record<string, unknown>;

    return {
      overall_level: str(parsed.overall_level) || str((parsed as Record<string, unknown>).overall_band),
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
