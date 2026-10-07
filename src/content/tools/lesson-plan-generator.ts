import type { ToolLandingContent } from "./types";

export const content: ToolLandingContent = {
  slug: "lesson-plan-generator",
  badge: "Lesson Plan Generator",
  heroTitle: "Generate Customized English Lesson Plans Instantly",
  heroSubtitle:
    "Whether you're a teacher or independent learner, get high-quality customized lesson plans instantly — tailored to your CEFR level, topic, and duration.",
  ctaLabel: "Generate Lesson Plan",
  features: [
    {
      icon: "Wand2",
      title: "Smart Planning",
      desc: "AI creates lesson plans tailored to your CEFR level, topic, and duration.",
    },
    {
      icon: "ListChecks",
      title: "Detailed Structure",
      desc: "Includes objectives, warm-up, main activities, and wrap-up in your lesson plans.",
    },
    {
      icon: "Download",
      title: "Download & Share",
      desc: "Download your lesson plan as PDF or Word for easy use.",
    },
  ],
  about: {
    eyebrow: "Why Use AI?",
    title: "Save Time, Teach Better — Instantly Generate Professional Plans",
    paragraphs: [
      "Whether you're a teacher or independent learner, get high-quality customized lesson plans instantly.",
    ],
    bullets: [
      "Reduce planning time drastically",
      "Personalized to your teaching needs",
    ],
  },
  tryTitle: "Instantly Generate Lessons — Perfect For Your Classroom",
  tryText:
    "Transform your teaching with customized lesson plans—just choose your level, topic, and duration! AI handles the planning so you can focus on what matters most: engaging students.",
  tryCtaLabel: "Generate a Lesson Plan",
  guidance: {
    eyebrow: "Join Us Now",
    title: "Empower Your Teaching With Instant Plans",
    text: "Let AI handle the planning so you can inspire. Join our community today!",
    ctaLabel: "Browse Teacher Resources",
    href: "/courses",
  },
  faqs: [
    {
      q: "How fast does the AI generate a lesson plan?",
      a: "Most lesson plans are generated within seconds after you submit your request.",
    },
    {
      q: "Are lesson plans unique?",
      a: "Yes. Each lesson plan is customized based on your selected CEFR level, topic, and duration.",
    },
    {
      q: "Can I edit or customize the plans further?",
      a: "Absolutely. You can copy and tailor the AI-generated lesson plans as much as you want.",
    },
    {
      q: "Is there a usage limit?",
      a: "Usage limits can be implemented; user authentication is planned for future versions to manage this better.",
    },
  ],
};

export default content;
