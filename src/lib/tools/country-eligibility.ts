import { chat, extractJson } from "@/lib/llm";
import { LLM } from "@/lib/models";
import { type ToolHandler, type ValidateResult, req, str } from "./types";

export interface CountryEligibilityInput {
  passportNationality: string;
  age: string;
  degreeStatus: string;
  teflCertification: string;
}

export interface CountryDetails {
  eligible: boolean;
  earning_estimation?: string;
  best_time_to_apply?: string;
  reasons_to_choose?: string;
  teacher_demand?: string;
  visa_requirements?: string;
  native_speaker_preference?: string;
}

export interface CountryEligibilitySummary {
  total_eligible_countries: number;
  top_recommendations: string[];
  visa_advantages?: string;
  qualification_strengths?: string;
  improvement_suggestions?: string[];
}

export interface CountryEligibilityResult {
  regions: Record<string, Record<string, CountryDetails>>;
  summary: CountryEligibilitySummary;
}

const SYSTEM =
  "You are an expert TEFL eligibility consultant specializing in international teaching requirements and visa regulations. Output only the JSON structure requested - valid JSON, no markdown fences, no commentary.";

function buildUserPrompt(i: CountryEligibilityInput): string {
  return `You are an expert TEFL eligibility consultant specializing in international teaching requirements and visa regulations.

    Based on the user's profile, analyze their eligibility for TEFL teaching positions worldwide and group results by geographical regions.

    User Profile:
    - Passport nationality: ${i.passportNationality}
    - Age: ${i.age}
    - Degree status: ${i.degreeStatus}
    - TEFL certification: ${i.teflCertification}

    IMPORTANT: Consider passport nationality for visa-free access, working holiday agreements, and native speaker preferences in different countries.

    Please analyze eligibility for major TEFL destinations grouped by regions and return results in the following JSON structure:

    {
    "regions": {
        "Asia": {
        "China": {
            "eligible": true/false,
            "earning_estimation": "Monthly salary range in USD",
            "best_time_to_apply": "Optimal application months",
            "reasons_to_choose": "Key benefits and opportunities",
            "teacher_demand": "High/Medium/Low",
            "visa_requirements": "Brief visa/work permit info",
            "native_speaker_preference": "Required/Preferred/Not Required"
        },
        "Japan": { /* same structure */ },
        "South Korea": { /* same structure */ },
        "Taiwan": { /* same structure */ },
        "Indonesia": { /* same structure */ },
        "Malaysia": { /* same structure */ },
        "Philippines": { /* same structure */ },
        "Cambodia": { /* same structure */ },
        "Myanmar": { /* same structure */ }
        },
        "Middle East": {
        "UAE": { /* same structure */ },
        "Qatar": { /* same structure */ },
        "Saudi Arabia": { /* same structure */ },
        "Kuwait": { /* same structure */ },
        "Oman": { /* same structure */ }
        },
        "Europe": {
        "Spain": { /* same structure */ },
        "Italy": { /* same structure */ },
        "France": { /* same structure */ },
        "Germany": { /* same structure */ },
        "Czech Republic": { /* same structure */ },
        "Poland": { /* same structure */ }
        },
        "Latin America": {
        "Mexico": { /* same structure */ },
        "Brazil": { /* same structure */ },
        "Colombia": { /* same structure */ },
        "Chile": { /* same structure */ },
        "Argentina": { /* same structure */ },
        "Costa Rica": { /* same structure */ }
        },
        "Africa & Others": {
        "Morocco": { /* same structure */ },
        "Turkey": { /* same structure */ },
        "Russia": { /* same structure */ },
        "Egypt": { /* same structure */ }
        }
    },
    "summary": {
        "total_eligible_countries": number,
        "top_recommendations": ["Country1", "Country2", "Country3"],
        "visa_advantages": "Brief explanation of passport advantages",
        "qualification_strengths": "Assessment of current qualifications",
        "improvement_suggestions": ["suggestion1", "suggestion2"]
    }
    }

    Key Eligibility Rules to Consider:
    - Most countries require a bachelor's degree minimum
    - Native English speakers (US, UK, Canada, Australia, NZ, Ireland, South Africa) have advantages
    - China requires native passport holders under 60 with degrees
    - Middle East generally requires degrees and often prefers native speakers
    - Europe varies by country, some accept non-native speakers
    - Age limits vary by country (China 60, South Korea 62, etc.)
    - TEFL certification requirements vary by country and employer type
    - Work visa eligibility depends heavily on passport nationality
    - For each region show atmost 5 countries and atleast 1

    HARD VISA RULES (never violate):
    - A bachelor's degree is a legal work-visa requirement in China, Japan, South Korea, Taiwan, Vietnam, UAE, Qatar, Saudi Arabia, Kuwait and Oman. If the user does NOT hold at least a bachelor's degree, every one of these countries MUST be "eligible": false.
    - Typical no-degree-friendly options are Cambodia, Mexico, Costa Rica, Argentina, Colombia and parts of Eastern Europe (employer dependent) - assess these honestly.

    OUTPUT LENGTH: keep every string value concise - maximum 15 words per field.

    CRITICAL CONSISTENCY RULES (must follow exactly):
    - summary.top_recommendations MUST contain ONLY countries whose "eligible" field is true in your regions output. NEVER recommend a country marked "eligible": false.
    - If fewer than 3 countries are eligible, list only the eligible ones (or an empty array if none).
    - summary.total_eligible_countries MUST equal the exact count of countries with "eligible": true in your regions output.

    Provide realistic salary estimates in USD and consider current market conditions (2025).`;
}

const DEGREE_REQUIRED = [
  "China",
  "Japan",
  "South Korea",
  "Taiwan",
  "Vietnam",
  "UAE",
  "Qatar",
  "Saudi Arabia",
  "Kuwait",
  "Oman",
];

/** Mirrors sanitize_country_eligibility_output() in ajax_functions.php. */
function sanitizeOutput(
  data: CountryEligibilityResult,
  degreeStatus: string
): CountryEligibilityResult {
  if (!data || typeof data !== "object" || !data.regions || typeof data.regions !== "object") {
    return data;
  }

  const deg = degreeStatus.toLowerCase().trim();
  const hasBachelor = ["bachelor", "master", "completed"].includes(deg);
  if (deg !== "" && !hasBachelor) {
    for (const region of Object.keys(data.regions)) {
      const countries = data.regions[region];
      if (!countries || typeof countries !== "object") continue;
      for (const cn of Object.keys(countries)) {
        const info = countries[cn];
        if (DEGREE_REQUIRED.includes(cn) && info && info.eligible) {
          info.eligible = false;
          info.visa_requirements = "Bachelor's degree required for a work visa";
          info.native_speaker_preference = info.native_speaker_preference ?? "";
        }
      }
    }
  }

  const eligible: string[] = [];
  for (const region of Object.keys(data.regions)) {
    const countries = data.regions[region];
    if (!countries || typeof countries !== "object") continue;
    for (const country of Object.keys(countries)) {
      if (countries[country] && countries[country].eligible) {
        eligible.push(country);
      }
    }
  }

  if (!data.summary || typeof data.summary !== "object") {
    data.summary = {} as CountryEligibilitySummary;
  }
  data.summary.total_eligible_countries = eligible.length;
  let recs = Array.isArray(data.summary.top_recommendations)
    ? data.summary.top_recommendations
    : [];
  recs = recs.filter((r) => eligible.includes(r));
  if (recs.length === 0) {
    recs = eligible;
  }
  data.summary.top_recommendations = recs.slice(0, 3);
  return data;
}

export const countryEligibility: ToolHandler<CountryEligibilityInput, CountryEligibilityResult> = {
  action: "generate_country_eligibility",
  slug: "country-eligibility",

  validate(body): ValidateResult<CountryEligibilityInput> {
    const missing = req(body, ["passport_nationality", "age", "degree_status", "tefl_certification"]);
    if (missing) return { ok: false, error: missing };
    return {
      ok: true,
      input: {
        passportNationality: str(body.passport_nationality),
        age: str(body.age),
        degreeStatus: str(body.degree_status),
        teflCertification: str(body.tefl_certification),
      },
    };
  },

  async run(input): Promise<CountryEligibilityResult> {
    const content = await chat({
      model: LLM.models.country,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: buildUserPrompt(input) },
      ],
      temperature: 0.3,
      json: true,
    });

    const parsed = extractJson<CountryEligibilityResult>(content);
    return sanitizeOutput(parsed, input.degreeStatus);
  },
};
