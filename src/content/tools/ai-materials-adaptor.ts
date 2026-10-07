import type { ToolLandingContent } from "./types";

export const content: ToolLandingContent = {
  slug: "ai-materials-adaptor",
  badge: "Materials Adaptor",
  heroTitle: "Simplify Any Text to Your Target CEFR Level",
  heroSubtitle:
    "Turn authentic articles, stories, and texts into level-appropriate learning materials with built-in comprehension questions and vocabulary support.",
  ctaLabel: "Adapt Materials",
  features: [
    {
      icon: "Wand2",
      title: "Smart Simplification",
      desc: "AI adapts authentic texts to any CEFR level while preserving meaning.",
    },
    {
      icon: "FileQuestion",
      title: "Comprehension Questions",
      desc: "Automatically generates 5 comprehension questions for each adapted text.",
    },
    {
      icon: "Highlighter",
      title: "Vocabulary Highlights",
      desc: "Identifies and highlights 10 key vocabulary items with explanations.",
    },
  ],
  about: {
    eyebrow: "Why Adapt Materials?",
    title: "Transform Any Text Into Perfect Learning Material",
    paragraphs: [
      "Turn authentic articles, stories, and texts into level-appropriate materials with built-in exercises and vocabulary support.",
    ],
    bullets: [
      "Preserve original meaning and context",
      "Ready-to-use comprehension activities",
      "Targeted vocabulary development",
    ],
  },
  tryTitle: "Adapt Your First Text",
  tryText:
    "Paste any authentic text and transform it into level-appropriate learning materials with comprehension questions and vocabulary support!",
  tryCtaLabel: "Start Adapting",
  guidance: {
    eyebrow: "Transform Now",
    title: "Make Any Text Student-Friendly",
    text: "Transform complex materials into engaging, level-appropriate learning resources instantly!",
    ctaLabel: "Explore Teaching Tools",
    href: "/courses",
  },
  faqs: [
    {
      q: "What text length can I adapt?",
      a: "You can paste texts up to 500 words. Longer texts will be automatically truncated to ensure optimal processing.",
    },
    {
      q: "Which CEFR levels are supported?",
      a: "All CEFR levels from A1 (beginner) to C2 (proficiency) are supported for text adaptation.",
    },
    {
      q: "Does the tool preserve the original meaning?",
      a: "Yes, the AI carefully maintains the core meaning and context while simplifying vocabulary and sentence structure.",
    },
    {
      q: "Can I use copyrighted materials?",
      a: "Please ensure you have proper rights to use any copyrighted text. This tool is intended for educational purposes only.",
    },
  ],
};

export default content;
