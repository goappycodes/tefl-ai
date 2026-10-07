import { chat } from "@/lib/llm";
import { LLM } from "@/lib/models";
import { type ToolHandler, type ValidateResult, str } from "./types";

// angle key -> human label (mirrors process_vlog_script_request()).
const ANGLES: Record<string, string> = {
  day_life: "Day in the Life (Routine & Lifestyle)",
  hidden_gems: "Hidden Gems (Local Travel Tips)",
  budget: "Budget Breakdown (What I Spend in a Day)",
  classroom: "Classroom Realities (Funny or Moving Teacher Moments)",
};

// duration key -> label.
const DURATIONS: Record<string, string> = {
  "30": "30 Seconds",
  "60": "60 Seconds",
  "90": "90 Seconds",
};

export interface VlogScriptInput {
  location: string;
  angleKey: string;
  angleLabel: string;
  durationKey: string;
  durationLabel: string;
}

export interface VlogScriptResult {
  script_markdown: string;
  location: string;
  angle: string; // angle KEY (as returned by wp_send_json_success)
  duration: string; // duration LABEL
}

// Mirrors the heredoc system instruction in api_generate_vlog_script.php.
const SYSTEM = `[SYSTEM INSTRUCTION: TEFL.AI TRAVEL VLOG SCRIPTWRITER]
You are an expert AI Social Media Director specializing in the global TEFL (Teaching English as a Foreign Language) and digital nomad industry. Your job is to convert a teacher's location and desired video angle into a highly engaging, platform-native vertical video script (TikTok, Instagram Reels, YouTube Shorts).

Output MUST strictly adhere to the following rules:
1. Do not include introductory text, pleasantries, or chatty explanations. Start directly with the markdown table.
2. Structure the output into a 4-column Markdown table with these exact headers: | Timestamp | Visuals / B-Roll Prompts (What to Film) | Voiceover / Text Overlay Script (What to Say) | Creator Strategy Note |
3. The "Visuals" column must give concrete, physical instructions on what to shoot in that specific location.
4. The "Voiceover" column must include both "Text on Screen" (hooks) and spoken dialogue. Ensure the tone is conversational, authentic, and modern.
5. In the "Voiceover" column, naturally integrate a contextual mention of how free AI tools (like the TEFL.ai Lesson Plan Generator) or online teaching flexibility makes this lifestyle possible.
6. The "Creator Strategy Note" must give specific engagement, editing, or pacing tips based on modern vertical video algorithms.
7. Include a strong, natural Call to Action (CTA) at the end directing viewers to check the link in the creator's bio for free TEFL resources or certification info.`;

// Mirrors $user_prompt assembly in api_generate_vlog_script.php.
function buildUserPrompt(location: string, angleLabel: string, durationLabel: string): string {
  let p = "Generate a complete, platform-native vertical video script based on these user inputs:\n";
  p += `- Location: ${location}\n`;
  p += `- Core Video Angle: ${angleLabel}\n`;
  p += `- Targeted Video Duration: ${durationLabel}\n\n`;
  p += `Ensure the script perfectly matches the geography and cultural context of ${location}. `;
  p += `Write the script tailored precisely to the ${angleLabel} theme. `;
  p += "Format the entire response into the 4-column matrix table defined in your system instructions.";
  return p;
}

function stripCodeFences(content: string): string {
  // Mirrors the PHP preg_replace fence stripping.
  return content
    .trim()
    .replace(/^```[a-zA-Z]*\s*/, "")
    .replace(/```\s*$/, "")
    .trim();
}

export const vlogScriptwriter: ToolHandler<VlogScriptInput, VlogScriptResult> = {
  action: "generate_vlog_script",
  slug: "travel-vlog-scriptwriter",

  validate(body): ValidateResult<VlogScriptInput> {
    const location = str(body.location);
    if (location === "" || location.length > 80) {
      return { ok: false, error: "Please provide a valid location (max 80 characters)." };
    }

    const angleKey = str(body.angle);
    if (!ANGLES[angleKey]) {
      return { ok: false, error: "Please select a valid video angle." };
    }

    // Default to 60 when missing/invalid (mirrors intval + fallback).
    const rawDuration = String(parseInt(str(body.duration), 10) || "");
    const durationKey = DURATIONS[rawDuration] ? rawDuration : "60";

    return {
      ok: true,
      input: {
        location,
        angleKey,
        angleLabel: ANGLES[angleKey],
        durationKey,
        durationLabel: DURATIONS[durationKey],
      },
    };
  },

  async run(input): Promise<VlogScriptResult> {
    const messages = [
      { role: "system" as const, content: SYSTEM },
      {
        role: "user" as const,
        content: buildUserPrompt(input.location, input.angleLabel, input.durationLabel),
      },
    ];

    let content = await chat({
      model: LLM.models.small,
      messages,
      temperature: 0.7,
    });

    // The script must contain a markdown table; retry once if it doesn't
    // (mirrors the "no table found" retry in generateVlogScript()).
    if (!content.includes("|")) {
      content = await chat({
        model: LLM.models.small,
        messages,
        temperature: 0.7,
      });
    }

    return {
      script_markdown: stripCodeFences(content),
      location: input.location,
      angle: input.angleKey,
      duration: input.durationLabel,
    };
  },
};
