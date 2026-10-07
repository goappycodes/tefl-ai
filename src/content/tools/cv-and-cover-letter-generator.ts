import type { ToolLandingContent } from "./types";

export const content: ToolLandingContent = {
  slug: "cv-and-cover-letter-generator",
  badge: "AI CV & Cover Letter Generator",
  heroTitle: "Create Professional TEFL CVs & Cover Letters in Minutes",
  heroSubtitle:
    "Generate a polished, TEFL-focused CV and a tailored cover letter that highlight your certifications, teaching experience and ESL skills — ready to send.",
  ctaLabel: "Generate Documents",
  features: [
    {
      icon: "FileText",
      title: "TEFL-Focused CVs",
      desc: "Tailored CVs highlighting your TEFL certifications, teaching experience, and ESL skills.",
    },
    {
      icon: "Mail",
      title: "Personalized Cover Letters",
      desc: "Custom cover letters that showcase your teaching philosophy and match job requirements.",
    },
    {
      icon: "Download",
      title: "Multiple Formats",
      desc: "Download as PDF or Word documents, with options for different tones and styles.",
    },
  ],
  about: {
    eyebrow: "Why Professional Documents Matter?",
    title: "Stand Out In The TEFL Job Market",
    paragraphs: [
      "Create compelling CVs and cover letters that highlight your TEFL expertise and teaching achievements to land your dream ESL position.",
    ],
    bullets: [
      "Highlight TEFL certifications and qualifications",
      "Showcase teaching methodology expertise",
      "Customize for different countries and institutions",
    ],
  },
  tryTitle: "Generate Your First Documents",
  tryText:
    "Enter your professional details and let our AI create polished, TEFL-focused CVs and cover letters that get you noticed!",
  tryCtaLabel: "Start Creating",
  guidance: {
    eyebrow: "Get Hired",
    title: "Land Your Dream TEFL Position",
    text: "Create professional documents that showcase your teaching expertise and help you stand out to employers worldwide!",
    ctaLabel: "Explore TEFL Courses",
    href: "/courses",
  },
  faqs: [
    {
      q: "What information do I need to provide?",
      a: "You'll need your personal details, TEFL qualifications, work experience, skills, and information about your target position to create tailored documents.",
    },
    {
      q: "Can I customize the tone and style?",
      a: "Yes! You can choose between formal or friendly tones, and specify preferences for different countries or institution types.",
    },
    {
      q: "Are the documents editable after generation?",
      a: "Absolutely! You can edit sections inline and download in both PDF and Word formats for further customization.",
    },
    {
      q: "How TEFL-specific are these documents?",
      a: "The AI is specifically trained on TEFL industry requirements, highlighting relevant certifications, methodologies, and experience that ESL employers value most.",
    },
  ],
};

export default content;
