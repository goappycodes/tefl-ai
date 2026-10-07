import type { ToolLandingContent } from "./types";

export const content: ToolLandingContent = {
  slug: "tefl-course-finder",
  badge: "AI TEFL Course Recommender",
  heroTitle: "Find Your Perfect TEFL Course Match Instantly",
  heroSubtitle:
    "Answer a few quick questions and let AI match you with the TEFL courses that best fit your goals, experience and preferences.",
  ctaLabel: "Get Started",
  features: [
    {
      icon: "Target",
      title: "Intelligent Matching",
      desc: "AI matches you with the best TEFL courses based on your goals, experience, and preferences.",
    },
    {
      icon: "GitBranch",
      title: "Smart Logic",
      desc: "Uses a decision tree based on your unique responses.",
    },
    {
      icon: "Share2",
      title: "Share & Save",
      desc: "Save your recommendations and share them with ease.",
    },
  ],
  about: {
    eyebrow: "Why Use AI?",
    title: "Save Time, Choose Smart",
    paragraphs: [
      "Instant Course Recommendations",
      "Whether you are starting new or enhancing your skills, get fast, personalized TEFL course matches tailored for you.",
    ],
    bullets: [
      "Personalized to your goals and experience",
      "Multiple options with direct access to course pages",
      "Easy to share and revisit your recommendations",
    ],
  },
  tryTitle: "Instant Course Matches Tailored to Your Goals",
  tryText:
    "Find your ideal TEFL course in seconds by answering a few quick questions about your experience, goals, and preferences.",
  tryCtaLabel: "Get My Recommendations",
  guidance: {
    eyebrow: "Start Your Journey",
    title: "Find Your Perfect TEFL Course Today",
    text: "Let AI guide you to the right TEFL certification. Start your teaching journey today!",
    ctaLabel: "Browse All TEFL Courses",
    href: "/courses",
  },
  faqs: [
    {
      q: "How accurate are the course recommendations?",
      a: "Our AI uses a smart decision tree based on your experience, goals, and preferences to match you with the most suitable TEFL courses available.",
    },
    {
      q: "How many courses will I be recommended?",
      a: "You'll receive one primary recommendation perfectly matched to your needs, plus alternative course options to consider.",
    },
    {
      q: "Can I save my recommendations?",
      a: "Yes! You can easily save and share your recommendations to review later or discuss with others.",
    },
    {
      q: "Is the recommender free to use?",
      a: "Yes, the TEFL Course Recommender is completely free. Simply answer a few questions to get personalized course matches instantly.",
    },
    {
      q: "What if I'm new to teaching?",
      a: "Perfect! The recommender is designed for all experience levels, from complete beginners to experienced teachers looking to upgrade their certification.",
    },
  ],
};

export default content;
