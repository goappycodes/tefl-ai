import { chat, extractJson } from "@/lib/llm";
import { LLM } from "@/lib/models";
import { type ToolHandler, type ValidateResult, req, str } from "./types";

export interface CvCoverLetterInput {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  professionalSummary: string;
  teflCertification: string;
  teflProvider: string;
  degree: string;
  university: string;
  additionalQualifications: string;
  teachingExperience: string;
  skills: string[];
  additionalSkills: string;
  aiSkills: string[];
  aiToolsUsed: string;
  targetPositionType: string;
  targetEnvironment: string;
  targetCountries: string;
  documentTone: string;
  documentLength: string;
  includePhotoPlaceholder: "Yes" | "No";
  emphasizeInternational: "Yes" | "No";
  includeReferencesNote: "Yes" | "No";
  specificRequirements: string;
}

export interface CvCoverLetterResult {
  cv: {
    header: string;
    professional_summary: string;
    education: string;
    teaching_experience: string;
    skills: {
      teaching_skills: string[];
      technical_skills: string[];
      language_skills: string[];
      ai_edtech_skills?: string[];
    };
    additional_sections: string;
  };
  cover_letter: {
    header: string;
    greeting: string;
    opening_paragraph: string;
    body_paragraphs: string;
    closing_paragraph: string;
    signature: string;
  };
  document_tips: {
    cv_tips: string[];
    cover_letter_tips: string[];
    customization_suggestions: string[];
  };
}

/** Matches WordPress date_i18n('F j, Y') — e.g. "October 7, 2026". */
function todayLong(): string {
  return new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** Faithful port of build_cv_cover_letter_prompt() in api_generate_cv_cl.php. */
function buildPrompt(i: CvCoverLetterInput): string {
  const hasAi = i.aiSkills.length > 0 || i.aiToolsUsed !== "";
  const date = todayLong();

  let p =
    "You are an expert TEFL career consultant and professional document writer with 15+ years of experience in international education recruitment.\n\n";

  p += "Create a professional CV and cover letter tailored for TEFL/ESL positions based on the following information:\n\n";

  p += "PERSONAL INFORMATION:\n";
  p += `Name: ${i.fullName}\n`;
  p += `Email: ${i.email}\n`;
  p += `Phone: ${i.phone}\n`;
  p += `Location: ${i.location}\n\n`;

  p += "PROFESSIONAL BACKGROUND:\n";
  p += `Summary: ${i.professionalSummary}\n`;
  p += `TEFL Certification: ${i.teflCertification}${i.teflProvider ? ` from ${i.teflProvider}` : ""}\n`;
  p += `Education: ${i.degree}${i.university ? ` from ${i.university}` : ""}\n`;
  if (i.additionalQualifications) {
    p += `Additional Qualifications: ${i.additionalQualifications}\n`;
  }
  p += `Teaching Experience: ${i.teachingExperience}\n\n`;

  if (i.skills.length > 0) {
    p += `Core Skills: ${i.skills.join(", ")}\n`;
  }
  if (i.additionalSkills) {
    p += `Additional Skills: ${i.additionalSkills}\n`;
  }
  if (i.aiSkills.length > 0) {
    p += `AI & EdTech Competencies: ${i.aiSkills.join(", ")}\n`;
  }
  if (i.aiToolsUsed) {
    p += `AI Tools Used: ${i.aiToolsUsed}\n`;
  }
  p += "\n";

  p += "TARGET POSITION:\n";
  p += `Position Type: ${i.targetPositionType}\n`;
  p += `Work Environment: ${i.targetEnvironment}\n`;
  p += `Target Countries: ${i.targetCountries}\n\n`;

  p += "DOCUMENT PREFERENCES:\n";
  p += `Tone: ${i.documentTone}\n`;
  p += `Length: ${i.documentLength}\n`;
  p += `Include photo placeholder: ${i.includePhotoPlaceholder}\n`;
  p += `Emphasize international experience: ${i.emphasizeInternational}\n`;
  p += `Include references note: ${i.includeReferencesNote}\n\n`;

  if (i.specificRequirements) {
    p += `SPECIAL REQUIREMENTS: ${i.specificRequirements}\n\n`;
  }

  p += "Generate both documents following these specifications:\n\n";

  p += "CV REQUIREMENTS:\n";
  p += "- Professional header with contact information\n";
  p += "- Compelling professional summary (3-4 lines)\n";
  p += "- Education section highlighting degree and TEFL certification\n";
  p += "- Teaching experience in reverse chronological order\n";
  p += `- Skills section categorized (Teaching Skills, Technical Skills, Language Skills${hasAi ? ", AI & EdTech Skills" : ""})\n`;
  p += "- Professional formatting with clear sections\n";
  if (i.includePhotoPlaceholder === "Yes") {
    p += "- Include [PHOTO PLACEHOLDER] in header\n";
  }
  if (i.includeReferencesNote === "Yes") {
    p += "- Include 'References available upon request' at bottom\n";
  }
  p += "\n";

  if (hasAi) {
    p += "AI COMPETENCY REQUIREMENTS (important - schools increasingly shortlist for AI skills):\n";
    p += "- Include a dedicated 'AI & EdTech Skills' category in the CV skills section using ONLY the competencies and tools listed above - never invent tools or skills the candidate did not provide\n";
    p += "- Word each AI skill as a concrete, evidence-based capability a recruiter can verify (e.g. 'Designs CEFR-aligned lessons with AI tools, reviewing all output for accuracy'), not as buzzwords\n";
    p += "- Weave ONE natural mention of the candidate's AI competencies into the CV professional summary\n";
    p += "- Include ONE sentence in the cover letter body showing how the candidate uses AI responsibly to improve teaching outcomes\n";
    p += "- Keep it credible and understated - AI skills support the teaching profile, they do not replace it\n\n";
  }

  p += "COVER LETTER REQUIREMENTS:\n";
  p += "- Professional greeting addressing hiring manager\n";
  p += "- Opening paragraph expressing interest in TEFL position\n";
  p += "- Body paragraphs highlighting relevant experience and qualifications\n";
  p += "- Closing paragraph with call to action\n";
  p += "- Professional sign-off\n";
  p += `- Tone should be ${i.documentTone} and ${i.documentLength}\n\n`;

  p += `Today's date is ${date}. Use this exact date wherever a date is needed (e.g. the cover letter header). NEVER output placeholder text such as [Date], [Month Day, Year] or similar - every field must contain real, final content.\n\n`;
  p += "RESPOND ONLY IN VALID JSON FORMAT:\n";
  p += "{\n";
  p += '  "cv": {\n';
  p += '    "header": "formatted contact information",\n';
  p += '    "professional_summary": "compelling summary paragraph",\n';
  p += '    "education": "education section with degree and TEFL certification",\n';
  p += '    "teaching_experience": "detailed experience section",\n';
  p += '    "skills": {\n';
  p += '      "teaching_skills": ["skill1", "skill2"],\n';
  p += '      "technical_skills": ["skill1", "skill2"],\n';
  p += `      "language_skills": ["skill1", "skill2"]${hasAi ? ',\n      "ai_edtech_skills": ["skill1", "skill2"]' : ""}\n`;
  p += "    },\n";
  p += '    "additional_sections": "any additional relevant sections"\n';
  p += "  },\n";
  p += '  "cover_letter": {\n';
  p += `    "header": "formatted header with today's date (${date}) and contact details - no placeholders",\n`;
  p += '    "greeting": "professional greeting",\n';
  p += '    "opening_paragraph": "engaging opening",\n';
  p += '    "body_paragraphs": "main content highlighting qualifications",\n';
  p += '    "closing_paragraph": "strong closing with call to action",\n';
  p += '    "signature": "professional sign-off"\n';
  p += "  },\n";
  p += '  "document_tips": {\n';
  p += '    "cv_tips": ["tip1", "tip2", "tip3"],\n';
  p += '    "cover_letter_tips": ["tip1", "tip2", "tip3"],\n';
  p += '    "customization_suggestions": ["suggestion1", "suggestion2"]\n';
  p += "  }\n";
  p += "}";

  return p;
}

const strArray = (v: unknown): string[] =>
  Array.isArray(v) ? v.map((x) => str(x)).filter(Boolean) : [];

const yesNo = (v: unknown): "Yes" | "No" => (str(v) === "Yes" ? "Yes" : "No");

export const cvCoverLetter: ToolHandler<CvCoverLetterInput, CvCoverLetterResult> = {
  action: "generate_cv_cl",
  slug: "cv-and-cover-letter-generator",

  validate(body): ValidateResult<CvCoverLetterInput> {
    const missing = req(body, [
      "full_name",
      "email",
      "professional_summary",
      "teaching_experience",
    ]);
    if (missing) return { ok: false, error: missing };
    return {
      ok: true,
      input: {
        fullName: str(body.full_name),
        email: str(body.email),
        phone: str(body.phone),
        location: str(body.location),
        professionalSummary: str(body.professional_summary),
        teflCertification: str(body.tefl_certification),
        teflProvider: str(body.tefl_provider),
        degree: str(body.degree),
        university: str(body.university),
        additionalQualifications: str(body.additional_qualifications),
        teachingExperience: str(body.teaching_experience),
        skills: strArray(body.skills),
        additionalSkills: str(body.additional_skills),
        aiSkills: strArray(body.ai_skills),
        aiToolsUsed: str(body.ai_tools_used),
        targetPositionType: str(body.target_position_type),
        targetEnvironment: str(body.target_environment),
        targetCountries: str(body.target_countries),
        documentTone: str(body.document_tone) || "professional",
        documentLength: str(body.document_length) || "standard",
        includePhotoPlaceholder: yesNo(body.include_photo_placeholder),
        emphasizeInternational: yesNo(body.emphasize_international),
        includeReferencesNote: yesNo(body.include_references_note),
        specificRequirements: str(body.specific_requirements),
      },
    };
  },

  async run(input): Promise<CvCoverLetterResult> {
    const content = await chat({
      model: LLM.models.large,
      messages: [{ role: "user", content: buildPrompt(input) }],
      temperature: 0.7,
      maxTokens: 4000,
    });

    const parsed = extractJson<Partial<CvCoverLetterResult>>(content);
    const cv = parsed.cv ?? ({} as CvCoverLetterResult["cv"]);
    const cl = parsed.cover_letter ?? ({} as CvCoverLetterResult["cover_letter"]);
    const tips = parsed.document_tips ?? ({} as CvCoverLetterResult["document_tips"]);
    const skills = cv.skills ?? ({} as CvCoverLetterResult["cv"]["skills"]);

    return {
      cv: {
        header: cv.header ?? "",
        professional_summary: cv.professional_summary ?? "",
        education: cv.education ?? "",
        teaching_experience: cv.teaching_experience ?? "",
        skills: {
          teaching_skills: strArray(skills.teaching_skills),
          technical_skills: strArray(skills.technical_skills),
          language_skills: strArray(skills.language_skills),
          ai_edtech_skills: strArray(skills.ai_edtech_skills),
        },
        additional_sections: cv.additional_sections ?? "",
      },
      cover_letter: {
        header: cl.header ?? "",
        greeting: cl.greeting ?? "",
        opening_paragraph: cl.opening_paragraph ?? "",
        body_paragraphs: cl.body_paragraphs ?? "",
        closing_paragraph: cl.closing_paragraph ?? "",
        signature: cl.signature ?? "",
      },
      document_tips: {
        cv_tips: strArray(tips.cv_tips),
        cover_letter_tips: strArray(tips.cover_letter_tips),
        customization_suggestions: strArray(tips.customization_suggestions),
      },
    };
  },
};
