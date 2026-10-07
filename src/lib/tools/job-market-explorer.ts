import { chat, extractJson } from "@/lib/llm";
import { LLM } from "@/lib/models";
import { type ToolHandler, type ValidateResult, req, str } from "./types";

export interface JobMarketInput {
  country: string;
  jobType: string;
  experienceLevel: string;
  teflCertification: string;
  englishLevel: string;
  educationLevel: string;
}

export interface JobMarketSalary {
  amount?: string;
  currency?: string;
  period?: string;
  benefits?: string;
}

/** Shape of the first element of the JSON array the model returns
 *  (PHP sends $parsed_data[0]). Fields are HTML fragments. */
export interface JobMarketResult {
  job_demand_overview?: string;
  average_salary_range?: JobMarketSalary;
  job_requirements?: string;
  additional_notes?: string;
}

const SYSTEM =
  "You are a TEFL job market expert. Provide detailed information about teaching opportunities based on the given criteria in json format [{'job_demand_overview':'<p>Start with a 2-3 sentence overview of general demand for the specific job type. min 50 words.</p><h4>Opportunities for Your Profile</h4><ul><li>Include 3-5 specific opportunities based on their qualifications</li></ul><h4>High-Demand Cities</h4><ul><li>List 3-5 cities with highest demand for this job type</li></ul>','average_salary_range':{'amount':'int-int','currency':'chosen country currency symbol','period':'per month','benefits':'<h4>Common Benefits for This Job Type</h4><ul><li>Housing allowance/accommodation</li><li>Flight reimbursement</li><li>Contract completion bonus</li><li>Health insurance</li></ul><h4>Salary Expectations for Your Qualifications</h4><p>Based on your experience and qualifications: realistic salary range</p><p>Entry Level: salary range</p><p>Experienced: salary range</p>'},'job_requirements':'<h4>Requirements for ' + job_type + '</h4><ul><li>Minimum qualifications needed</li><li>Preferred qualifications</li><li>Skills and experience valued</li></ul>','additional_notes':'<h4>Career Progression</h4><p>How your profile fits and advancement opportunities</p><h4>Contract Details</h4><p>Average contract length for this job type</p><h4>Application Tips</h4><p>Best practices for applying to this type of position</p><h4>Cultural Considerations</h4><p>Important cultural aspects for this role</p><h4>Living Conditions</h4><p>Cost of living, accommodation, lifestyle</p><h4>Visa Requirements</h4><p>Common visa types, necessary documents</p>'}]";

export const jobMarketExplorer: ToolHandler<JobMarketInput, JobMarketResult> = {
  action: "get_job_market_data",
  slug: "tefl-jobs",

  validate(body): ValidateResult<JobMarketInput> {
    // Resolve country exactly as process_job_market_request() does.
    let country = str(body.country);
    if (country === "custom") {
      country = str(body.custom_country);
    } else if (country.startsWith("other_")) {
      const region = country.replace("other_", "");
      country = str(body[`other_country_${region}`]);
    }

    const resolved: Record<string, unknown> = {
      country,
      job_type: body.job_type,
      experience_level: body.experience_level,
      tefl_certification: body.tefl_certification,
      english_level: body.english_level,
      education_level: body.education_level,
    };

    const missing = req(resolved, [
      "country",
      "job_type",
      "experience_level",
      "tefl_certification",
      "english_level",
      "education_level",
    ]);
    if (missing) return { ok: false, error: missing };

    return {
      ok: true,
      input: {
        country,
        jobType: str(body.job_type),
        experienceLevel: str(body.experience_level),
        teflCertification: str(body.tefl_certification),
        englishLevel: str(body.english_level),
        educationLevel: str(body.education_level),
      },
    };
  },

  async run(input): Promise<JobMarketResult> {
    const user = `Country/Region: ${input.country}, Job Type: ${input.jobType}, Experience Level: ${input.experienceLevel}, TEFL Certification: ${input.teflCertification}, English Level: ${input.englishLevel}, Education Level: ${input.educationLevel}. Provide comprehensive job market analysis including demand overview, salary expectations based on qualifications, specific requirements for this job type, and detailed additional information.`;

    const content = await chat({
      model: LLM.models.small,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: user },
      ],
      temperature: 0.7,
    });

    const parsed = extractJson<JobMarketResult[] | JobMarketResult>(content);
    return Array.isArray(parsed) ? parsed[0] : parsed;
  },
};
