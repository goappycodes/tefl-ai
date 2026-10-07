import { chat, extractJson } from "@/lib/llm";
import { LLM } from "@/lib/models";
import { type ToolHandler, type ValidateResult, req, str } from "./types";

export interface JobReadinessInput {
  teflCertification: string;
  teachingExperience: string;
  resumeReady: string;
  resumeProofread: string;
  interviewPreparedness: string;
  teachingMethods: string;
  visaRequirements: string;
  lessonPlan: string;
}

export interface JobReadinessNextSteps {
  certification_advice?: string;
  resume_advice?: string;
  interview_advice?: string;
  teaching_methods_advice?: string;
  visa_advice?: string;
  lesson_plan_advice?: string;
  [key: string]: string | undefined;
}

/** Shape of the first element of the JSON array the model returns
 *  (PHP sends $parsed_data[0]). */
export interface JobReadinessResult {
  overall_readiness?: { score?: string; percentage?: string | number };
  strengths?: string[];
  areas_for_improvement?: string[];
  next_steps?: JobReadinessNextSteps;
  recommended_resources?: string[];
  summary?: string;
}

const SYSTEM = `You are a TEFL job readiness expert. Based on the user's inputs, provide a comprehensive assessment of their readiness to apply for TEFL jobs. Format your response as JSON with the following structure:
                [{
                    'overall_readiness': {
                        'score': 'Beginner/Intermediate/Ready-to-Apply',
                        'percentage': 'numeric value between 0-100'
                    },
                    'strengths': ['strength1', 'strength2', ...],
                    'areas_for_improvement': ['area1', 'area2', ...],
                    'next_steps': {
                        'certification_advice': 'Advice about TEFL certification if needed',
                        'resume_advice': 'Advice about improving resume if needed',
                        'interview_advice': 'Advice about interview preparation if needed',
                        'teaching_methods_advice': 'Advice about teaching methods knowledge if needed',
                        'visa_advice': 'Advice about visa requirements if needed',
                        'lesson_plan_advice': 'Advice about preparing demo lessons if needed'
                    },
                    'recommended_resources': ['resource1', 'resource2', ...],
                    'summary': 'A brief paragraph summarizing the assessment and motivating the user to take action'
                }]`;

export const jobReadinessChecker: ToolHandler<JobReadinessInput, JobReadinessResult> = {
  action: "get_job_readiness_feedback",
  slug: "job-readiness-checker",

  validate(body): ValidateResult<JobReadinessInput> {
    const missing = req(body, [
      "tefl_certification",
      "teaching_experience",
      "resume_ready",
      "resume_proofread",
      "interview_preparedness",
      "teaching_methods",
      "visa_requirements",
      "lesson_plan",
    ]);
    if (missing) return { ok: false, error: missing };

    return {
      ok: true,
      input: {
        teflCertification: str(body.tefl_certification),
        teachingExperience: str(body.teaching_experience),
        resumeReady: str(body.resume_ready),
        resumeProofread: str(body.resume_proofread),
        interviewPreparedness: str(body.interview_preparedness),
        teachingMethods: str(body.teaching_methods),
        visaRequirements: str(body.visa_requirements),
        lessonPlan: str(body.lesson_plan),
      },
    };
  },

  async run(input): Promise<JobReadinessResult> {
    const user = `TEFL Certification: ${input.teflCertification}, Teaching Experience: ${input.teachingExperience},
                Resume Ready: ${input.resumeReady}, Resume Proofread: ${input.resumeProofread},
                Interview Preparedness: ${input.interviewPreparedness}, Teaching Methods Knowledge: ${input.teachingMethods},
                Visa Requirements Knowledge: ${input.visaRequirements}, Demo Lesson Plan: ${input.lessonPlan}`;

    const content = await chat({
      model: LLM.models.small,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: user },
      ],
      temperature: 0.7,
    });

    const parsed = extractJson<JobReadinessResult[] | JobReadinessResult>(content);
    return Array.isArray(parsed) ? parsed[0] : parsed;
  },
};
