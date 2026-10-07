/**
 * Central site configuration: brand, navigation IA, and the AI-tool registry.
 * Mirrors the live WordPress menus and page/URL structure 1:1
 * (see REBUILD-BLUEPRINT.md §2 & the Primary Menu mega-menu).
 */

export const SITE = {
  name: "TEFL.ai",
  title: "TEFL.ai — Free AI Tools for English Teachers",
  description:
    "Accredited TEFL certification, plus a suite of free AI tools for English teachers — lesson plans, IELTS & CEFR grading, career roadmaps, job insights and more.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://tefl.ai",
  locale: "en_IE",
  // "Buy / Enrol" sends users to the WooCommerce checkout (headless hand-off).
  checkoutBase:
    process.env.NEXT_PUBLIC_CHECKOUT_BASE_URL || "https://tefl.ai",
} as const;

export type ToolGroup = "new-teachers" | "experienced-teachers" | "insights";

export interface AiTool {
  slug: string; // URL path segment, preserved from WordPress
  title: string; // full display title
  short: string; // short nav/card label
  group: ToolGroup;
  /** Server action id — mirrors the WP wp_ajax action name. */
  action: string;
  tagline: string;
  description: string;
  /** lucide-react icon name */
  icon: string;
  audience: string;
  featured?: boolean;
}

/**
 * The 15 free AI tools. Slugs match the live URLs exactly so links,
 * SEO and redirects carry over unchanged.
 */
export const TOOLS: AiTool[] = [
  // --- New teachers -------------------------------------------------------
  {
    slug: "tefl-course-finder",
    title: "TEFL Course Finder",
    short: "Course Finder",
    group: "new-teachers",
    action: "find_tefl_course",
    tagline: "Find the right TEFL course for your goals",
    description:
      "Answer a few questions and get a personalised TEFL course recommendation matched to your goals, budget and timeline.",
    icon: "Compass",
    audience: "New teachers",
    featured: true,
  },
  {
    slug: "country-eligibility",
    title: "Country Eligibility Checker",
    short: "Country Eligibility",
    group: "new-teachers",
    action: "generate_country_eligibility",
    tagline: "Where can you teach English abroad?",
    description:
      "Check visa and eligibility requirements for teaching English in countries around the world, tailored to your nationality and qualifications.",
    icon: "Globe2",
    audience: "New teachers",
  },
  {
    slug: "earning-projection",
    title: "AI Earning Projection",
    short: "Earning Projection",
    group: "new-teachers",
    action: "generate_earning_projection",
    tagline: "See what you could earn teaching English",
    description:
      "Project your potential TEFL earnings by destination, experience level and teaching context — powered by real market data.",
    icon: "TrendingUp",
    audience: "New teachers",
  },
  // --- Experienced teachers ----------------------------------------------
  {
    slug: "lesson-plan-generator",
    title: "AI Lesson Plan Generator",
    short: "Lesson Plan Generator",
    group: "experienced-teachers",
    action: "generate_lesson_plan",
    tagline: "Complete lesson plans in seconds",
    description:
      "Generate a full, structured ESL/EFL lesson plan — objectives, warm-up, activities, materials and assessment — for any level and topic.",
    icon: "NotebookPen",
    audience: "Experienced teachers",
    featured: true,
  },
  {
    slug: "ai-ielts-writing-band-estimator",
    title: "AI IELTS Writing Band Estimator",
    short: "IELTS Writing Estimator",
    group: "experienced-teachers",
    action: "estimate_ielts_band",
    tagline: "Estimate an IELTS writing band instantly",
    description:
      "Paste a Task 1 or Task 2 response and get an estimated IELTS writing band with criterion-by-criterion feedback.",
    icon: "PenLine",
    audience: "Experienced teachers",
    featured: true,
  },
  {
    slug: "career-roadmap",
    title: "AI Career Roadmap Generator",
    short: "Career Roadmap",
    group: "experienced-teachers",
    action: "generate_career_roadmap",
    tagline: "Map your next TEFL career move",
    description:
      "Get a personalised, step-by-step roadmap to advance your English-teaching career — qualifications, roles and milestones.",
    icon: "Route",
    audience: "Experienced teachers",
  },
  {
    slug: "ai-ielts-speaking-band-estimator",
    title: "AI IELTS Speaking Band Estimator",
    short: "IELTS Speaking Estimator",
    group: "experienced-teachers",
    action: "estimate_ielts_speaking_band",
    tagline: "Estimate a speaking band from audio",
    description:
      "Record or upload a spoken response and receive an estimated IELTS speaking band with fluency, lexical and pronunciation feedback.",
    icon: "Mic",
    audience: "Experienced teachers",
  },
  {
    slug: "cv-and-cover-letter-generator",
    title: "CV and Cover Letter Generator",
    short: "CV & Cover Letter",
    group: "experienced-teachers",
    action: "generate_cv_cl",
    tagline: "A polished TEFL CV and cover letter",
    description:
      "Generate a professional, ready-to-send TEFL CV and tailored cover letter matched to the role you're applying for.",
    icon: "FileText",
    audience: "Experienced teachers",
  },
  {
    slug: "ai-materials-adaptor",
    title: "AI Materials Adaptor",
    short: "Materials Adaptor",
    group: "experienced-teachers",
    action: "generate_adapted_material",
    tagline: "Adapt any text to your learners' level",
    description:
      "Paste any text and instantly adapt it to a target CEFR level — graded vocabulary, simplified grammar and comprehension questions.",
    icon: "Wand2",
    audience: "Experienced teachers",
  },
  {
    slug: "travel-vlog-scriptwriter",
    title: "AI Travel Vlog Scriptwriter",
    short: "Vlog Scriptwriter",
    group: "experienced-teachers",
    action: "generate_vlog_script",
    tagline: "Scripts for your teach-and-travel content",
    description:
      "Turn your travel-teaching adventures into engaging vlog scripts — hooks, structure and calls to action, ready to film.",
    icon: "Clapperboard",
    audience: "Experienced teachers",
  },
  {
    slug: "cefr-writing-grader",
    title: "Free AI CEFR Writing Grader",
    short: "CEFR Writing Grader",
    group: "experienced-teachers",
    action: "grade_cefr_writing",
    tagline: "Grade writing against the CEFR scale",
    description:
      "Assess any piece of writing against the CEFR (A1–C2) framework, with a level estimate and actionable feedback.",
    icon: "GraduationCap",
    audience: "Experienced teachers",
  },
  {
    slug: "english-level-test",
    title: "English Level Test",
    short: "English Level Test",
    group: "experienced-teachers",
    action: "process_english_level_test",
    tagline: "A free adaptive CEFR placement test",
    description:
      "Take a free, AI-generated English placement test and get an estimated CEFR level with a breakdown of strengths and gaps.",
    icon: "ListChecks",
    audience: "All teachers & learners",
    featured: true,
  },
  // --- Insights / jobs ----------------------------------------------------
  {
    slug: "tefl-jobs",
    title: "Job Market Explorer",
    short: "Job Market Explorer",
    group: "insights",
    action: "get_job_market_data",
    tagline: "Explore the global TEFL job market",
    description:
      "Explore live insights into the global TEFL job market — demand, salaries and requirements by country and region.",
    icon: "Briefcase",
    audience: "All teachers",
    featured: true,
  },
  {
    slug: "job-readiness-checker",
    title: "Job Readiness Checker",
    short: "Job Readiness Checker",
    group: "insights",
    action: "get_job_readiness_feedback",
    tagline: "Are you ready to land a TEFL job?",
    description:
      "Get an honest readiness score and tailored feedback on how prepared you are to apply for TEFL roles right now.",
    icon: "CheckCircle2",
    audience: "All teachers",
  },
  {
    slug: "speaking-band-estimator",
    title: "Speaking Band Estimator",
    short: "Speaking Band Estimator",
    group: "insights",
    action: "estimate_speaking_band",
    tagline: "Estimate spoken English proficiency",
    description:
      "Estimate spoken English proficiency from a response, with feedback on fluency, range and accuracy.",
    icon: "AudioLines",
    audience: "All teachers",
  },
];

export const toolBySlug = (slug: string) => TOOLS.find((t) => t.slug === slug);
export const toolsByGroup = (g: ToolGroup) => TOOLS.filter((t) => t.group === g);
export const featuredTools = () => TOOLS.filter((t) => t.featured);

export const GROUP_LABELS: Record<ToolGroup, string> = {
  "new-teachers": "New Teachers",
  "experienced-teachers": "Experienced Teachers",
  insights: "Insights & Jobs",
};

/** Primary navigation (mirrors the WordPress Primary Menu). */
export interface NavItem {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
  mega?: boolean;
}

export const PRIMARY_NAV: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "AI Tools", href: "/ai-tool-overview", mega: true },
  { label: "Courses", href: "/courses" },
  { label: "AI Report", href: "/future-of-ai-report" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export const FOOTER_NAV = {
  explore: [
    { label: "AI Tools", href: "/ai-tool-overview" },
    { label: "Courses", href: "/courses" },
    { label: "AI Report", href: "/future-of-ai-report" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ],
  group: [
    {
      label: "About The TEFL Institute Group",
      href: "https://teflinstitute.com/blog/what-is-the-tefl-institute-group/",
    },
    { label: "The TEFL Institute", href: "https://teflinstitute.com/" },
    { label: "TEFL.ie", href: "https://tefl.ie/" },
  ],
  legal: [
    { label: "Terms and Conditions", href: "/terms-and-conditions" },
    { label: "Privacy Policy", href: "/privacy-policy" },
  ],
  social: [
    { label: "Instagram", href: "https://www.instagram.com/" },
    { label: "Twitter (X)", href: "https://x.com" },
    { label: "YouTube", href: "https://youtube.com" },
  ],
};

/** Accreditations shown site-wide (from the live footer). */
export const ACCREDITATIONS = [
  {
    name: "Highfield Qualifications",
    detail: "Approved Centre · 21335",
    href: "https://www.highfieldqualifications.com/",
  },
  {
    name: "OTCAC Accredited",
    detail: "Accreditation · 20260330",
    href: "https://otcac.com/accredited/",
  },
];
