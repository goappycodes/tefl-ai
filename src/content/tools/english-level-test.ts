import type { ToolLandingContent } from "./types";

export const content: ToolLandingContent = {
  slug: "english-level-test",
  badge: "English Level Assessment",
  heroTitle: "What's Your English Level? Take Our Free Test",
  heroSubtitle:
    "Take a free, CEFR-aligned placement test and get your estimated level (A1–C2) with a breakdown of your strengths and gaps.",
  ctaLabel: "Take Test Now",
  features: [
    {
      icon: "ClipboardCheck",
      title: "Comprehensive Assessment",
      desc: "Evaluate your grammar, vocabulary, and reading comprehension in one test.",
    },
    {
      icon: "Award",
      title: "CEFR Aligned Results",
      desc: "Receive your official CEFR level (A1-C2) with detailed breakdown of your English proficiency.",
    },
    {
      icon: "Route",
      title: "Personalized Learning Path",
      desc: "Get customized course recommendations and resources based on your test results.",
    },
  ],
  about: {
    eyebrow: "English Assessment",
    title: "Why knowing your English level matters",
    paragraphs: [
      "Knowing your exact English level is the first step toward effective learning. Our comprehensive assessment evaluates:",
      "Ready to improve your English? Find the right course based on your proficiency level.",
    ],
    bullets: [
      "Grammar and vocabulary skills",
      "Reading comprehension ability",
    ],
  },
  tryTitle: "Take Your English Level Test",
  tryText:
    "Complete our comprehensive English Level Assessment to determine your current CEFR level (A1-C2). The test takes approximately 10-12 minutes and covers grammar, vocabulary, reading, and self-assessment.",
  tryCtaLabel: "Start Your Test",
  guidance: {
    eyebrow: "Join Us Now",
    title: "Ready to Improve Your English Skills?",
    text: "Knowing your level is just the first step. Take an English course tailored to your needs!",
    ctaLabel: "View English Courses",
    href: "https://teflinstitute.com/tefl-courses-overview/",
  },
  faqs: [
    {
      q: "How accurate is this English level test?",
      a: "Our English level test aligns with CEFR standards and provides an accurate assessment of your current proficiency level across multiple skill areas.",
    },
    {
      q: "How long does the English level test take to complete?",
      a: "The test takes approximately 15 minutes to complete all sections, including grammar, vocabulary, reading, and self-assessment portions.",
    },
    {
      q: "What is the CEFR and what do levels A1-C2 mean?",
      a: "The Common European Framework of Reference (CEFR) is an international standard for describing language ability. A1-A2 are beginner levels, B1-B2 are intermediate levels, and C1-C2 are advanced to proficient levels.",
    },
    {
      q: "Can this test replace official exams like IELTS or TOEFL?",
      a: "While our test provides an accurate assessment of your current English level, it is not a substitute for official exams required by universities or immigration authorities. However, it can help you determine if you're ready to take these official tests.",
    },
  ],
};

export default content;
