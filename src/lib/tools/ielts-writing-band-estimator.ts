import { chat, extractJson } from "@/lib/llm";
import { LLM } from "@/lib/models";
import { type ToolHandler, type ValidateResult, str } from "./types";

export interface IeltsWritingBandInput {
  taskType: string; // "1" or "2"
  writingSample: string;
  task1Question?: string;
  visualDescription?: string;
  task1ImageUrl?: string;
  task2Question?: string;
}

export interface IeltsCriterion {
  band: number | string;
  explanation: string;
  improvement: string;
}

/** Full parsed JSON the PHP returns for context `ielts_band_estimate`
 *  (wp_send_json_success($parsed_data)). Fields vary by whether the model
 *  judged the submission valid. */
export interface IeltsWritingBandResult {
  content_type?: string;
  evaluation_possible?: boolean;
  issue_identified?: string;
  word_count?: number | string;
  feedback?: string;
  length_assessment?: string;
  overall_band?: number | string;
  comments?: string;
  // Task 1 uses task_achievement; Task 2 uses task_response.
  task_achievement?: IeltsCriterion;
  task_response?: IeltsCriterion;
  coherence_cohesion?: IeltsCriterion;
  lexical_resource?: IeltsCriterion;
  grammatical_range_accuracy?: IeltsCriterion;
}

const SYSTEM = "You are an IELTS examiner outputting only the JSON structure requested.";

function buildTask1Prompt(i: IeltsWritingBandInput): string {
  let prompt =
    "You are an expert IELTS examiner. Your first task is to analyze what type of content has been submitted.\n\n";
  prompt += `Task 1 Question: "${i.task1Question}"\n\n`;

  if (i.visualDescription) {
    prompt += `Visual Data Description: ${i.visualDescription}\n\n`;
  } else if (i.task1ImageUrl) {
    prompt += `You can view the related image here: ${i.task1ImageUrl}\n\n`;
    prompt += "Please analyze this image as part of the visual data.\n\n";
  }

  prompt += `Submitted Text: "${i.writingSample}"\n\n`;

  prompt += "ANALYSIS PROCESS:\n";
  prompt += "1. First, determine if the submitted text is:\n";
  prompt += "   a) A genuine attempt at a Task 1 response (even if very short or incomplete)\n";
  prompt += "   b) Just the question prompt repeated\n";
  prompt += "   c) Irrelevant content\n";
  prompt += "   d) Test input or placeholder text\n\n";

  prompt += "2. If it's NOT a genuine response attempt, return:\n";
  prompt += "{\n";
  prompt += '  "content_type": "invalid_submission",\n';
  prompt +=
    "  \"issue_identified\": \"specific issue (e.g., 'question_repeated', 'insufficient_content', 'irrelevant_text')\",\n";
  prompt += '  "word_count": actual_word_count,\n';
  prompt += '  "feedback": "Constructive message explaining what\'s needed for evaluation",\n';
  prompt += '  "evaluation_possible": false\n';
  prompt += "}\n\n";

  prompt +=
    "3. If it IS a genuine response attempt (regardless of length), evaluate based on IELTS Task 1 criteria:\n";
  prompt += "- Task Achievement: How accurately the candidate described the visual data\n";
  prompt += "- Coherence and Cohesion: Organization and linking of ideas\n";
  prompt += "- Lexical Resource: Vocabulary range and accuracy\n";
  prompt += "- Grammatical Range and Accuracy: Grammar variety and correctness\n\n";

  prompt += "For genuine attempts, provide:\n";
  prompt += "{\n";
  prompt += '  "content_type": "valid_response",\n';
  prompt += '  "word_count": actual_word_count,\n';
  prompt += '  "length_assessment": "Comment on whether length affects scoring",\n';
  prompt += '  "evaluation_possible": true,\n';
  prompt +=
    '  "task_achievement": {"band": 0-9, "explanation": "detailed assessment", "improvement": "specific advice"},\n';
  prompt +=
    '  "coherence_cohesion": {"band": 0-9, "explanation": "detailed assessment", "improvement": "specific advice"},\n';
  prompt +=
    '  "lexical_resource": {"band": 0-9, "explanation": "detailed assessment", "improvement": "specific advice"},\n';
  prompt +=
    '  "grammatical_range_accuracy": {"band": 0-9, "explanation": "detailed assessment", "improvement": "specific advice"},\n';
  prompt += '  "overall_band": calculated_band,\n';
  prompt +=
    '  "comments": "Overall assessment with acknowledgment of response length if applicable"\n';
  prompt += "}\n\n";

  prompt +=
    "IMPORTANT: Be honest about what can and cannot be evaluated based on the content provided. If the response is too brief to demonstrate certain criteria fully, acknowledge this in your assessment.";

  return prompt;
}

function buildTask2Prompt(i: IeltsWritingBandInput): string {
  let prompt =
    "You are an expert IELTS examiner. Your first task is to analyze what type of content has been submitted.\n\n";

  if (i.task2Question) {
    prompt += `Task 2 Question: "${i.task2Question}"\n\n`;
  }

  prompt += `Submitted Text: "${i.writingSample}"\n\n`;

  prompt += "ANALYSIS PROCESS:\n";
  prompt += "1. First, determine if the submitted text is:\n";
  prompt += "   a) A genuine attempt at a Task 2 essay response (even if very short or incomplete)\n";
  prompt += "   b) Just the question prompt repeated\n";
  prompt += "   c) Irrelevant content unrelated to the task\n";
  prompt += "   d) Test input, placeholder text, or random content\n\n";

  prompt += "2. If it's NOT a genuine essay attempt, return:\n";
  prompt += "{\n";
  prompt += '  "content_type": "invalid_submission",\n';
  prompt +=
    "  \"issue_identified\": \"specific issue (e.g., 'question_repeated', 'insufficient_content', 'irrelevant_text', 'test_input')\",\n";
  prompt += '  "word_count": actual_word_count,\n';
  prompt +=
    '  "feedback": "Clear explanation of what\'s needed: \'To receive an IELTS evaluation, please submit your own essay response to the question, not the question itself. Your essay should present your opinion with supporting arguments and examples.\'",\n';
  prompt += '  "evaluation_possible": false\n';
  prompt += "}\n\n";

  prompt +=
    "3. If it IS a genuine essay attempt (regardless of length), evaluate based on IELTS Task 2 criteria:\n";
  prompt += "- Task Response: How well the question is answered\n";
  prompt += "- Coherence and Cohesion: Organization and flow\n";
  prompt += "- Lexical Resource: Vocabulary range and accuracy\n";
  prompt += "- Grammatical Range and Accuracy: Grammar variety and correctness\n\n";

  prompt += "For genuine attempts, provide:\n";
  prompt += "{\n";
  prompt += '  "content_type": "valid_response",\n';
  prompt += '  "word_count": actual_word_count,\n';
  prompt +=
    '  "length_assessment": "Comment on how the length affects the evaluation (IELTS Task 2 should be at least 250 words, but evaluate what\'s provided)",\n';
  prompt += '  "evaluation_possible": true,\n';
  prompt +=
    '  "task_response": {"band": 0-9, "explanation": "detailed assessment", "improvement": "specific advice"},\n';
  prompt +=
    '  "coherence_cohesion": {"band": 0-9, "explanation": "detailed assessment", "improvement": "specific advice"},\n';
  prompt +=
    '  "lexical_resource": {"band": 0-9, "explanation": "detailed assessment", "improvement": "specific advice"},\n';
  prompt +=
    '  "grammatical_range_accuracy": {"band": 0-9, "explanation": "detailed assessment", "improvement": "specific advice"},\n';
  prompt += '  "overall_band": calculated_band,\n';
  prompt +=
    '  "comments": "Overall assessment acknowledging the response length and its impact on evaluation if applicable"\n';
  prompt += "}\n\n";

  prompt += "CRITICAL GUIDELINES:\n";
  prompt += "- Only evaluate genuine essay attempts, even if they're incomplete\n";
  prompt += "- Never fabricate detailed band scores for non-essay content\n";
  prompt += "- If the content is just the question repeated, clearly identify this\n";
  prompt += "- Be transparent about limitations when content is very brief\n";
  prompt += "- Provide constructive guidance on what constitutes a proper essay response\n";
  prompt += "- Remember: it's better to decline evaluation than provide misleading scores";

  return prompt;
}

export const ieltsWritingBandEstimator: ToolHandler<
  IeltsWritingBandInput,
  IeltsWritingBandResult
> = {
  action: "estimate_ielts_band",
  slug: "ai-ielts-writing-band-estimator",

  validate(body): ValidateResult<IeltsWritingBandInput> {
    const writingSample = str(body.writing_sample);
    if (!writingSample) return { ok: false, error: "Writing sample is required." };

    // PHP: $task_type defaults to '2'; Task 1 branch only when === '1'.
    const taskType = str(body.task_type) || "2";
    const task1Question = str(body.task1_question);

    if (taskType === "1" && !task1Question) {
      return { ok: false, error: "Task 1 question is required." };
    }

    return {
      ok: true,
      input: {
        taskType,
        writingSample,
        task1Question: task1Question || undefined,
        visualDescription: str(body.visual_description) || undefined,
        task1ImageUrl: str(body.task1_image_url) || undefined,
        task2Question: str(body.task2_question) || undefined,
      },
    };
  },

  async run(input): Promise<IeltsWritingBandResult> {
    const prompt =
      input.taskType === "1" ? buildTask1Prompt(input) : buildTask2Prompt(input);

    const content = await chat({
      model: LLM.models.large,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      maxTokens: 1500,
    });

    return extractJson<IeltsWritingBandResult>(content);
  },
};
