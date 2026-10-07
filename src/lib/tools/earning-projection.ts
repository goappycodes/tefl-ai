import { chat, extractJson } from "@/lib/llm";
import { LLM } from "@/lib/models";
import { type ToolHandler, type ValidateResult, str } from "./types";

export interface EarningProjectionInput {
  country: string;
  experienceLevel: string;
  qualificationLevel: string;
  weeklyHours: string;
  classType: string;
}

export interface EarningMarketOverview {
  country_demand?: string;
  competition_level?: string;
  best_opportunities?: string;
  cost_of_living_context?: string;
}

export interface EarningCurrentPotential {
  monthly_range_usd?: string;
  annual_equivalent?: string;
  hourly_breakdown?: string;
  confidence_level?: string;
}

export interface EarningTimelinePhase {
  role?: string;
  salary_range?: string;
  key_focus?: string;
  required_qualifications?: string[];
  leadership_opportunities?: string[];
  specialization_paths?: string[];
}

export interface EarningBenefits {
  housing?: { typical_arrangement?: string; estimated_value?: string };
  flights_vacation?: string;
  health_insurance?: string;
  contract_terms?: string;
  total_compensation_value?: string;
}

export interface EarningRecommendations {
  immediate_steps?: string[];
  qualification_priorities?: string[];
  market_positioning?: string;
  alternative_opportunities?: string[];
}

export interface EarningRealityCheck {
  potential_challenges?: string[];
  market_saturation?: string;
  economic_factors?: string;
  success_probability?: string;
}

export interface EarningProjectionResult {
  market_overview?: EarningMarketOverview;
  current_earning_potential?: EarningCurrentPotential;
  career_progression_timeline?: {
    year_1_2?: EarningTimelinePhase;
    year_3_5?: EarningTimelinePhase;
    year_5_10?: EarningTimelinePhase;
    year_10_plus?: EarningTimelinePhase;
  };
  benefits_package?: EarningBenefits;
  strategic_recommendations?: EarningRecommendations;
  reality_check?: EarningRealityCheck;
}

const SYSTEM = "You are an IELTS examiner outputting only the JSON structure requested.";

function buildUserPrompt(i: EarningProjectionInput): string {
  return `You are a senior TEFL industry analyst with 15+ years of experience in international education markets. Research current market conditions and provide data-driven, realistic career projections.

ANALYSIS REQUEST:
Country: "${i.country}"
Experience: "${i.experienceLevel}"
Qualifications: "${i.qualificationLevel}"
Weekly hours: "${i.weeklyHours}"
Teaching mode: "${i.classType}"

RESEARCH AND ANALYZE:
Research current TEFL/ESL market data for the specified country and analyze how the user's profile affects their earning potential.

CAREER GROWTH ANALYSIS:
Provide specific advancement paths, required qualifications for each step, realistic timeframes, and market demand in the chosen country.

REQUIRED JSON STRUCTURE:
{
  "success": true,
  "data": {
    "market_overview": {
      "country_demand": "High/Medium/Low demand description",
      "competition_level": "Competitive landscape",
      "best_opportunities": "Where to find the best jobs",
      "cost_of_living_context": "How salary relates to living costs"
    },
    "current_earning_potential": {
      "monthly_range_usd": "$XXX-XXX (specific range)",
      "annual_equivalent": "$X,XXX-X,XXX annually",
      "hourly_breakdown": "$XX-XX per hour",
      "confidence_level": "High/Medium/Low based on market data"
    },
    "career_progression_timeline": {
      "year_1_2": {
        "role": "Expected position",
        "salary_range": "$XXX-XXX/month",
        "key_focus": "What to focus on"
      },
      "year_3_5": {
        "role": "Likely advancement",
        "salary_range": "$XXX-XXX/month",
        "required_qualifications": ["What's needed to advance"]
      },
      "year_5_10": {
        "role": "Senior positions available",
        "salary_range": "$XXX-XXX/month",
        "leadership_opportunities": ["Management paths"]
      },
      "year_10_plus": {
        "role": "Top-tier possibilities",
        "salary_range": "$XXX-XXX/month",
        "specialization_paths": ["Expert/consultant roles"]
      }
    },
    "benefits_package": {
      "housing": {
        "typical_arrangement": "What to expect",
        "estimated_value": "$XXX/month equivalent"
      },
      "flights_vacation": "Annual allowance details",
      "health_insurance": "Coverage expectations",
      "contract_terms": "Typical contract length and conditions",
      "total_compensation_value": "$XXX-XXX/month including all benefits"
    },
    "strategic_recommendations": {
      "immediate_steps": ["Actions to take now"],
      "qualification_priorities": ["Most valuable certifications to pursue"],
      "market_positioning": "How to stand out in this market",
      "alternative_opportunities": ["Related career paths to consider"]
    },
    "reality_check": {
      "potential_challenges": ["Honest obstacles to expect"],
      "market_saturation": "Competition level in chosen location",
      "economic_factors": "Current economic impacts on demand",
      "success_probability": "Realistic assessment of outcomes"
    }
  }
}

CRITICAL REQUIREMENTS:
• Research and use current, specific salary data for the exact country mentioned.
• ALWAYS show salaries in local currency first, then USD in parentheses (e.g., '฿45,000-75,000 ($1,500-2,500 USD)')
• For countries where local salary data is unavailable, clearly state 'USD equivalent' in the display
• Include current exchange rate context in the cost_of_living_context section
• Factor in current economic conditions and post-COVID market changes
• Provide actionable, specific advice rather than generic statements
• Include realistic timeframes for career advancement
• Address the specific teaching mode (online/in-person/hybrid) implications
• Be honest about market challenges while highlighting genuine opportunities
• Consider visa requirements and work permit realities for the country
• Include local market insights specific to the chosen destination`;
}

export const earningProjection: ToolHandler<EarningProjectionInput, EarningProjectionResult> = {
  action: "generate_earning_projection",
  slug: "earning-projection",

  validate(body): ValidateResult<EarningProjectionInput> {
    // Resolve the country the same way the PHP handler does.
    let country = str(body.country);
    if (country === "custom") {
      country = str(body.custom_country);
    } else if (country.startsWith("other_")) {
      const region = country.replace("other_", "");
      country = str(body[`other_country_${region}`]);
    }

    const experienceLevel = str(body.experience_level);
    const qualificationLevel = str(body.qualification_level);
    const weeklyHours = str(body.weekly_hours);
    const classType = str(body.class_type);

    if (!country) return { ok: false, error: "Please select a country or enter a custom country name." };
    if (!experienceLevel) return { ok: false, error: "Please select your experience level." };
    if (!qualificationLevel) return { ok: false, error: "Please select your qualification level." };
    if (!weeklyHours) return { ok: false, error: "Please select your weekly teaching hours." };
    if (!classType) return { ok: false, error: "Please select your teaching mode." };

    return {
      ok: true,
      input: { country, experienceLevel, qualificationLevel, weeklyHours, classType },
    };
  },

  async run(input): Promise<EarningProjectionResult> {
    const content = await chat({
      model: LLM.models.small,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: buildUserPrompt(input) },
      ],
      temperature: 0.5,
      maxTokens: 1200,
    });

    // The model returns { success, data: {...} }; the frontend consumes the inner data.
    const parsed = extractJson<{ data?: EarningProjectionResult } & EarningProjectionResult>(content);
    return (parsed.data ?? parsed) as EarningProjectionResult;
  },
};
