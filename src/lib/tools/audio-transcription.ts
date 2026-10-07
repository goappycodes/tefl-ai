import { chat } from "@/lib/llm";
import { LLM } from "@/lib/models";

/**
 * Transcribe spoken audio via the OpenRouter multimodal model.
 *
 * Faithful port of process_audio_transcription_openrouter() from
 * includes/api_estimate_speaking_band.php: a single user turn carrying a text
 * instruction plus an `input_audio` content part (base64 payload + container
 * format). Shared by the IELTS and general speaking-band estimators.
 *
 * LLM.audio.mode is "openrouter_multimodal" by default, so the client
 * re-encodes recordings/uploads to 16 kHz mono WAV and sends format "wav".
 */
export async function transcribeAudio(base64Audio: string, format: string): Promise<string> {
  const text = await chat({
    model: LLM.audio.model,
    temperature: 0,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Transcribe the spoken audio verbatim in English. Return only the transcription text with no commentary or labels. If there is no discernible speech, return an empty string.",
          },
          { type: "input_audio", input_audio: { data: base64Audio, format } },
        ],
      },
    ],
  });
  return text.trim();
}
