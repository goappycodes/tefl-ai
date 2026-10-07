import { chat, extractJson } from "@/lib/llm";
import { LLM } from "@/lib/models";
import { type ToolHandler, type ValidateResult, req, str } from "./types";

export interface CareerRoadmapInput {
  currentExperience: string;
  currentQualifications: string;
  careerGoals: string;
  desiredTimeframe: string;
}

/** The model may return a flat structure or one nested under
 *  ACHIEVING_INITIAL_GOAL / CAREER_GROWTH_THEREAFTER. The frontend handles both.
 *  Array items may be plain strings or objects, so fields stay intentionally loose. */
export interface CareerRoadmapResult {
  current_experience?: string;
  current_qualifications?: string;
  career_goals?: string;
  desired_timeframe?: string;
  interpreted_timeline?: string;
  immediate_action_plan?: unknown[];
  progression_milestones?: unknown[];
  essential_qualifications?: unknown[];
  initial_salary_expectations?: unknown;
  success_strategy?: string;
  career_growth_phases?: unknown[];
  long_term_specializations?: unknown[];
  advanced_qualifications_timeline?: unknown[];
  leadership_progression?: unknown;
  career_vision_summary?: string;
  ACHIEVING_INITIAL_GOAL?: Partial<CareerRoadmapResult>;
  CAREER_GROWTH_THEREAFTER?: Partial<CareerRoadmapResult>;
  [key: string]: unknown;
}

const SYSTEM = "You are an IELTS examiner outputting only the JSON structure requested.";

function buildUserPrompt(i: CareerRoadmapInput): string {
  return `Create a TEFL career roadmap in TWO PARTS for achieving '${i.careerGoals}' within '${i.desiredTimeframe}' and career growth thereafter:

Current Experience: ${i.currentExperience}
Current Qualifications: ${i.currentQualifications}
Initial Career Goal: ${i.careerGoals}
Initial Timeline: ${i.desiredTimeframe}

Provide JSON response with FLAT structure (no nested objects):

1. current_experience, current_qualifications, career_goals, desired_timeframe
2. interpreted_timeline: (e.g., '24 months to Business English Specialist')

=== PART 1: INITIAL GOAL (within timeframe) ===
3. immediate_action_plan: Array of strings - specific actions for first 6 months
4. progression_milestones: Array of strings - key milestones within their timeframe
5. essential_qualifications: Array of strings - qualifications needed for their goal
6. initial_salary_expectations: Object with starting and target salary for their timeframe
7. success_strategy: String - key strategy for achieving their goal

=== PART 2: CAREER GROWTH THEREAFTER ===
8. career_growth_phases: Array of phases after achieving initial goal, each with:
   - phase, timeframe, description, qualifications_needed, salary_range, advancement_path

9. long_term_specializations: Array of specialization options:
   - specialization, when_to_consider, requirements, career_potential

10. advanced_qualifications_timeline: Array of advanced qualifications:
   - qualification, optimal_timing, career_doors_opened, investment_return

11. leadership_progression: Single object (not array) for leadership path:
   - leadership_level, typical_timeline, responsibilities, preparation_needed, salary_potential

12. career_vision_summary: String - overview of 10-15 year trajectory

MANDATORY SALARY GUIDELINES (ALWAYS FOLLOW):
- ALWAYS include currency symbols ($, £, €, etc.)
- NEVER leave salary fields empty or null
- Online teaching: Usually 20-30% lower than in-person
- Always be CONSERVATIVE, not optimistic
- Base estimates on current market reality, not ideal scenarios
- Consider economic factors and competition in TEFL marketFocus first on their '${i.desiredTimeframe}' goal, then show career growth beyond. Keep salary ranges realistic and conservative. Make it specific to Business English specialization if that's their goal.`;
}

export const careerRoadmap: ToolHandler<CareerRoadmapInput, CareerRoadmapResult> = {
  action: "generate_career_roadmap",
  slug: "career-roadmap",

  validate(body): ValidateResult<CareerRoadmapInput> {
    const missing = req(body, [
      "current_experience",
      "current_qualifications",
      "career_goals",
      "desired_timeframe",
    ]);
    if (missing) return { ok: false, error: missing };
    return {
      ok: true,
      input: {
        currentExperience: str(body.current_experience),
        currentQualifications: str(body.current_qualifications),
        careerGoals: str(body.career_goals),
        desiredTimeframe: str(body.desired_timeframe),
      },
    };
  },

  async run(input): Promise<CareerRoadmapResult> {
    const content = await chat({
      model: LLM.models.small,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: buildUserPrompt(input) },
      ],
      temperature: 0.5,
    });

    return extractJson<CareerRoadmapResult>(content);
  },
};
