import { chat, extractJson } from "@/lib/llm";
import { LLM } from "@/lib/models";
import { type ToolHandler, type ValidateResult, str } from "./types";

const VALID_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

export interface MaterialsAdaptorInput {
  originalText: string;
  targetCefrLevel: string;
  includeDefinitions: boolean;
  highlightChanges: boolean;
  culturalNotes: boolean;
  textSource?: string;
}

export interface VocabularyItem {
  word: string;
  definition: string;
  example?: string;
}

export interface ComprehensionQuestion {
  question: string;
  type?: string;
  suggested_answer?: string;
}

export interface MaterialsAdaptorResult {
  simplified_text: string;
  original_level_estimate?: string;
  target_level: string;
  comprehension_questions: Array<ComprehensionQuestion | string>;
  key_vocabulary: VocabularyItem[];
  adaptation_notes?: string;
  cultural_notes?: string[];
  source_attribution?: string;
  word_count?: { original: number; simplified: number };
}

// Mirrors api_get_adapted_material.php system message.
const SYSTEM =
  "You are an expert ESL teacher and materials developer. You specialize in adapting authentic texts to different CEFR levels while preserving meaning and creating appropriate learning materials. Always respond in valid JSON format as specified in the user's prompt.";

// Mirrors build_material_adaptor_prompt() exactly.
function buildUserPrompt(i: MaterialsAdaptorInput): string {
  const targetLevel = i.targetCefrLevel;
  const source = i.textSource ?? "";

  let p = "You are an expert ESL teacher and materials developer.\n\n";
  p += `Please adapt the following text to ${targetLevel} level while preserving the original meaning and context.\n\n`;

  if (source) {
    p += `Original source: ${source}\n\n`;
  }

  p += `Original text:\n"${i.originalText}"\n\n`;

  p += "Requirements:\n";
  p += `- Adapt vocabulary and sentence structure to ${targetLevel} level\n`;
  p += "- Maintain the original meaning and context\n";
  p += "- Create 5 comprehension questions (mix of literal and inferential)\n";
  p += "- Identify 10 key vocabulary items with simple definitions\n";

  if (i.includeDefinitions) {
    p += "- Include vocabulary definitions within the text\n";
  }

  if (i.highlightChanges) {
    p += "- Mark simplified sections with [SIMPLIFIED] tags\n";
  }

  if (i.culturalNotes) {
    p += "- Add cultural context notes where relevant\n";
  }

  p += "\nRespond ONLY in valid JSON with the following structure:\n";
  p += "{\n";
  p += '  "simplified_text": "adapted text here",\n';
  p += '  "original_level_estimate": "estimated original CEFR level",\n';
  p += `  "target_level": "${targetLevel}",\n`;
  p += '  "comprehension_questions": [\n';
  p += '    {"question": "question text", "type": "literal/inferential", "suggested_answer": "answer"},\n';
  p += "    // ... 4 more questions\n";
  p += "  ],\n";
  p += '  "key_vocabulary": [\n';
  p += '    {"word": "vocabulary item", "definition": "simple definition", "example": "example sentence"},\n';
  p += "    // ... 9 more items\n";
  p += "  ],\n";
  p += '  "adaptation_notes": "brief explanation of main changes made",\n';

  if (i.culturalNotes) {
    p += '  "cultural_notes": ["note1", "note2"],\n';
  }

  if (source) {
    p += `  "source_attribution": "${source}",\n`;
  }

  p += '  "word_count": {\n';
  p += '    "original": number,\n';
  p += '    "simplified": number\n';
  p += "  }\n";
  p += "}";

  return p;
}

export const materialsAdaptor: ToolHandler<MaterialsAdaptorInput, MaterialsAdaptorResult> = {
  action: "generate_adapted_material",
  slug: "ai-materials-adaptor",

  validate(body): ValidateResult<MaterialsAdaptorInput> {
    const originalText = str(body.original_text);
    if (!originalText) return { ok: false, error: "Original text is required." };

    const targetCefrLevel = str(body.target_cefr_level);
    if (!targetCefrLevel) return { ok: false, error: "Target CEFR level is required." };
    if (!VALID_LEVELS.includes(targetCefrLevel)) {
      return { ok: false, error: "Invalid CEFR level selected." };
    }

    // PHP uses isset() on the checkbox fields; here a truthy value means checked.
    const flag = (v: unknown) => str(v) === "1" || v === true;

    return {
      ok: true,
      input: {
        originalText,
        targetCefrLevel,
        includeDefinitions: flag(body.include_definitions),
        highlightChanges: flag(body.highlight_changes),
        culturalNotes: flag(body.cultural_notes),
        textSource: str(body.text_source) || undefined,
      },
    };
  },

  async run(input): Promise<MaterialsAdaptorResult> {
    const content = await chat({
      model: LLM.models.small,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: buildUserPrompt(input) },
      ],
      temperature: 0.7,
      maxTokens: 3000,
      json: true,
    });

    const parsed = extractJson<Partial<MaterialsAdaptorResult>>(content);

    const vocab: VocabularyItem[] = Array.isArray(parsed.key_vocabulary)
      ? parsed.key_vocabulary.map((v) => ({
          word: str((v as VocabularyItem)?.word),
          definition: str((v as VocabularyItem)?.definition),
          example: (v as VocabularyItem)?.example ? str((v as VocabularyItem).example) : undefined,
        }))
      : [];

    const questions: Array<ComprehensionQuestion | string> = Array.isArray(
      parsed.comprehension_questions
    )
      ? parsed.comprehension_questions
      : [];

    const culturalNotes = Array.isArray(parsed.cultural_notes)
      ? parsed.cultural_notes.map(String)
      : undefined;

    return {
      simplified_text: str(parsed.simplified_text),
      original_level_estimate: parsed.original_level_estimate
        ? str(parsed.original_level_estimate)
        : undefined,
      target_level: str(parsed.target_level) || input.targetCefrLevel,
      comprehension_questions: questions,
      key_vocabulary: vocab,
      adaptation_notes: parsed.adaptation_notes ? str(parsed.adaptation_notes) : undefined,
      cultural_notes: culturalNotes,
      source_attribution: parsed.source_attribution
        ? str(parsed.source_attribution)
        : input.textSource,
      word_count: parsed.word_count,
    };
  },
};
