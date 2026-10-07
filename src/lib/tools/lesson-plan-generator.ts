import { chat, extractJson } from "@/lib/llm";
import { LLM } from "@/lib/models";
import { type ToolHandler, type ValidateResult, req, str } from "./types";

export interface LessonPlanInput {
  cefrLevel: string;
  topic: string;
  duration: string;
  classType: string;
  ageGroup: string;
  specialRequest?: string;
}

export interface LessonPlanResult {
  topic: string;
  level: string;
  age_group: string;
  duration: string;
  warm_up: string[];
  presentation: string[];
  practice: string[];
  production: string[];
  wrap_up: string[];
  materials: string[];
}

const SYSTEM = `You are a lesson plan content writer. Your job is to write the ACTUAL materials teachers will use, not describe what the materials should contain.

🎯 YOUR TASK: Write complete, word-for-word content that teachers can immediately use in class.

📋 MANDATORY FORMAT FOR EACH ACTIVITY:
Activity Name (X minutes, grouping): [Brief setup] + COMPLETE MATERIALS BELOW:

For Gap-fill exercises, write out all 12-15 complete sentences.
For Reading comprehension, write a 200+ word text followed by 8+ questions.
For Vocabulary exercises, write every word with a definition and an example sentence.
For Dialogues, write the complete conversation (20+ lines).
For Role-play scenarios, write the full setup with sample dialogue.

🚫 NEVER WRITE THESE PHRASES:
- "Students will complete..."
- "The text describes..."
- "Questions include..."
- "Additional examples..."
- "Continue with more..."
- "Such as..."

✅ ALWAYS WRITE the actual sentences, the actual text, the actual questions, the actual dialogues, and the actual vocabulary with definitions.

🎯 SUCCESS CRITERIA: Teachers can copy-paste your content directly, with no additional preparation needed.

📏 MINIMUM CONTENT REQUIREMENTS:
- Gap-fill exercises: 12-15 complete sentences
- Reading texts: 200+ words with 8+ questions
- Vocabulary lists: all words with definitions and examples
- Dialogues: complete conversations (20+ lines)

Respond in this exact JSON format with all content written in full:

{
  "topic": "exact topic",
  "level": "CEFR level",
  "age_group": "age group",
  "duration": "lesson duration",
  "warm_up": ["Activity with all materials written out..."],
  "presentation": ["Complete activities with all materials written out..."],
  "practice": ["Complete exercises with every question written in full..."],
  "production": ["Complete production activities with all scenarios and materials..."],
  "wrap_up": ["Complete wrap-up activities..."],
  "materials": ["All reading texts, worksheets, and materials written in full"]
}`;

function buildUserPrompt(i: LessonPlanInput): string {
  let p =
    "You must create a lesson plan where EVERY exercise, question, and text is written out completely. I will reject any response that contains descriptions instead of actual content.\n\n";
  p += "LESSON SPECIFICATIONS:\n";
  p += `- CEFR Level: ${i.cefrLevel}\n`;
  p += `- Topic: ${i.topic}\n`;
  p += `- Duration: ${i.duration}\n`;
  p += `- Class Type: ${i.classType}\n`;
  p += `- Age Group: ${i.ageGroup}\n`;
  if (i.specialRequest) p += `- Special Focus: ${i.specialRequest}\n`;
  p += "\n🚨 CRITICAL: I need the ACTUAL content, not descriptions of content!\n\n";
  p +=
    "Write out EVERY sentence, EVERY question, EVERY dialogue line, EVERY vocabulary word with definition. Teachers need to copy-paste this directly into their classroom materials.";
  return p;
}

const FORBIDDEN = [
  "Students will complete",
  "The text describes",
  "Questions include",
  "Additional examples",
  "[Continue",
];

export const lessonPlanGenerator: ToolHandler<LessonPlanInput, LessonPlanResult> = {
  action: "generate_lesson_plan",
  slug: "lesson-plan-generator",

  validate(body): ValidateResult<LessonPlanInput> {
    const missing = req(body, [
      "cefr_level",
      "lesson_topic",
      "lesson_duration",
      "class_type",
      "age_group",
    ]);
    if (missing) return { ok: false, error: missing };
    return {
      ok: true,
      input: {
        cefrLevel: str(body.cefr_level),
        topic: str(body.lesson_topic),
        duration: str(body.lesson_duration),
        classType: str(body.class_type),
        ageGroup: str(body.age_group),
        specialRequest: str(body.special_request) || undefined,
      },
    };
  },

  async run(input): Promise<LessonPlanResult> {
    const messages = [
      { role: "system" as const, content: SYSTEM },
      { role: "user" as const, content: buildUserPrompt(input) },
    ];

    let content = await chat({
      model: LLM.models.lesson,
      messages,
      temperature: 0.3,
      json: true,
    });

    // One corrective retry if the model returned descriptions, not content.
    const lower = content.toLowerCase();
    if (FORBIDDEN.some((f) => lower.includes(f.toLowerCase()))) {
      const retryMessages = [
        ...messages,
        { role: "assistant" as const, content },
        {
          role: "user" as const,
          content:
            "REJECTED. That response contained descriptions instead of actual content. I need the EXACT sentences students will complete, the EXACT text they will read, and the EXACT questions they will answer. Write out every single word. Try again with actual content only.",
        },
      ];
      content = await chat({
        model: LLM.models.lesson,
        messages: retryMessages,
        temperature: 0.3,
        json: true,
      });
    }

    const parsed = extractJson<Partial<LessonPlanResult>>(content);
    const arr = (v: unknown): string[] =>
      Array.isArray(v) ? v.map(String) : v ? [String(v)] : [];

    return {
      topic: parsed.topic || input.topic,
      level: parsed.level || input.cefrLevel,
      age_group: parsed.age_group || input.ageGroup,
      duration: parsed.duration || input.duration,
      warm_up: arr(parsed.warm_up),
      presentation: arr(parsed.presentation),
      practice: arr(parsed.practice),
      production: arr(parsed.production),
      wrap_up: arr(parsed.wrap_up),
      materials: arr(parsed.materials),
    };
  },
};
