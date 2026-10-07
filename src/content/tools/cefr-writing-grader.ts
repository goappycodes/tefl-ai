import type { ToolLandingContent } from "./types";

export const content: ToolLandingContent = {
  slug: "cefr-writing-grader",
  badge: "CEFR Writing Grader",
  heroTitle: "Free AI CEFR Writing Grader & Level Checker",
  heroSubtitle:
    "Paste any piece of English writing and instantly get an estimated CEFR level (A1–C2) with strengths, grammar corrections, and vocabulary feedback.",
  ctaLabel: "Get Started",
  poweredBy: "Powered by AI Technology",
  features: [
    {
      icon: "Gauge",
      title: "Instant CEFR Level",
      desc: "Get an AI-estimated CEFR level (A1–C2) based on official Council of Europe descriptors in seconds.",
    },
    {
      icon: "SpellCheck",
      title: "Grammar & Vocabulary Feedback",
      desc: "Detailed corrections, collocation tips, and vocabulary range feedback tailored to your writing.",
    },
    {
      icon: "Footprints",
      title: "Clear Next Steps",
      desc: "Actionable, level-appropriate recommendations for young learners, teens, and adults alike.",
    },
  ],
  about: {
    eyebrow: "About",
    title: "Check Your CEFR Writing Level",
    paragraphs: [
      "Paste any piece of English writing — an email, essay, story, or short answer — and instantly get an estimated CEFR level (A1–C2) alongside strengths, grammar corrections, and vocabulary feedback. Perfect for self-study, homework checks, or classroom use.",
    ],
    bullets: [
      "Official CEFR descriptor-based grading",
      "Grammar and vocabulary feedback",
      "Unlimited free assessments",
    ],
  },
  tryTitle: "Grade Your Writing Sample",
  tryText: "Paste your writing below and get instant AI-powered CEFR feedback.",
  tryCtaLabel: "Grade My Writing",
  guidance: {
    eyebrow: "Get Professional Help",
    title: "Need Expert Writing Guidance?",
    text: "For structured improvement and guaranteed progress, consider our TEFL and English proficiency courses.",
    ctaLabel: "Explore Our Courses",
    href: "/courses",
  },
  faqs: [
    {
      q: "How accurate is the AI CEFR writing grader?",
      a: "Our AI grader evaluates your writing against the official Council of Europe CEFR descriptors, covering grammar range and accuracy, vocabulary, and coherence. It provides a reliable estimate for practice purposes, but it is not an official CEFR certification. For certified results, please take an accredited CEFR examination.",
    },
    {
      q: "What is CEFR and what do A1–C2 mean?",
      a: "CEFR (Common European Framework of Reference for Languages) describes language ability on a six-level scale: A1 and A2 (Beginner), B1 and B2 (Intermediate), and C1 and C2 (Advanced). Our tool estimates which of these six levels best matches your writing sample.",
    },
    {
      q: "How many words should I submit?",
      a: "We recommend at least 40 words for a meaningful assessment. Samples longer than approximately 800 words will be truncated before grading to keep processing fast and reliable.",
    },
    {
      q: "Can I use this for young learners, teens, and adults?",
      a: "Yes. Select the learner profile that matches your writer before submitting. The AI adjusts the tone of its feedback accordingly, while still grading the CEFR level strictly on linguistic evidence in the text.",
    },
    {
      q: "Is my writing data stored or used for training?",
      a: "We prioritize your privacy. Submitted writing samples are processed temporarily for assessment purposes only and are not used for AI training. Please avoid submitting personal or sensitive information in your practice writing.",
    },
    {
      q: "What kind of feedback will I receive?",
      a: "You'll receive an estimated CEFR level, a confidence rating, a summary of your writing quality, specific strengths, grammar corrections with explanations, vocabulary and collocation feedback, and clear next steps to help you progress to the next level.",
    },
  ],
};

export default content;
