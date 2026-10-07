import type { ToolLandingContent } from "./types";

export const content: ToolLandingContent = {
  slug: "speaking-band-estimator",
  badge: "Spoken English Estimator",
  heroTitle: "Estimate Your Spoken English Proficiency",
  heroSubtitle:
    "Record or upload a short spoken response and get an estimated CEFR-style proficiency level with feedback on fluency, range and accuracy — in seconds.",
  ctaLabel: "Start Speaking",
  poweredBy: "Powered by AI Technology",
  features: [
    {
      icon: "Gauge",
      title: "Instant Level Estimate",
      desc: "Record or upload a response and receive an estimated CEFR-style proficiency level (A1 – C2) in seconds.",
    },
    {
      icon: "MessageSquareText",
      title: "Spoken-Skill Feedback",
      desc: "Targeted feedback on fluency, vocabulary range, grammatical accuracy and pronunciation.",
    },
    {
      icon: "AudioLines",
      title: "Speech Transcription",
      desc: "Accurate speech-to-text so you can review exactly what you said alongside your feedback.",
    },
  ],
  about: {
    eyebrow: "About",
    title: "Measure How You Really Sound in English",
    paragraphs: [
      "Speaking is the hardest skill to self-assess. Record or upload a short response and our AI analyses your spoken English against CEFR-style descriptors, giving you a clear proficiency estimate and practical next steps.",
      "Perfect for learners checking their progress, teachers placing students, and anyone preparing for a spoken-English interview or exam.",
    ],
    bullets: [
      "Record or upload in seconds",
      "CEFR-style level estimate (A1 – C2)",
      "Actionable improvement tips",
    ],
  },
  tryTitle: "Try the Speaking Band Estimator",
  tryText:
    "Pick a prompt or speak freely for a minute or two, then let the AI estimate your level and highlight what to work on next. It only takes a moment.",
  tryCtaLabel: "Record Your Response",
  guidance: {
    eyebrow: "Get professional help",
    title: "Want to Push Your Speaking Further?",
    text: "For structured practice and expert feedback, explore our accredited courses and one-to-one tutoring designed to move your spoken English up a level.",
    ctaLabel: "Explore Our Courses",
    href: "/courses",
  },
  faqs: [
    {
      q: "How does the speaking band estimator work?",
      a: "Record your voice directly in the browser or upload an audio file. The AI transcribes your response, then analyses fluency, vocabulary range, grammatical accuracy and pronunciation to produce an estimated proficiency level with supporting feedback.",
    },
    {
      q: "What proficiency scale does it use?",
      a: "Feedback is aligned to the Common European Framework of Reference (CEFR), from A1 (beginner) through to C2 (proficient), so your estimate maps to a widely recognised international standard.",
    },
    {
      q: "How accurate is the estimate?",
      a: "The estimator gives a reliable approximation for practice and self-assessment, but it is not an official qualification. Automated speech assessment can miss nuance that a trained human examiner would catch, so treat the result as guidance rather than a certified score.",
    },
    {
      q: "What should I talk about?",
      a: "You can respond to one of the suggested prompts or speak freely about any topic — describing a place, telling a story, or giving an opinion all work well. Aim for one to three minutes of continuous speech for the most useful feedback.",
    },
    {
      q: "Do I need a special microphone?",
      a: "No. A standard laptop or phone microphone is fine. Recording in a quiet space and speaking clearly will improve transcription accuracy and make the feedback more reliable.",
    },
    {
      q: "Is my recording stored or used for training?",
      a: "Your audio is processed only to generate your feedback and is not used to train AI models. Avoid sharing personal or sensitive information in your recording.",
    },
    {
      q: "Can teachers use this to place students?",
      a: "Yes. Many teachers use the estimator as a quick, low-stakes placement indicator to complement their own judgement, written tests and course-specific criteria when grouping learners by level.",
    },
    {
      q: "How often should I practise?",
      a: "Regular short sessions beat occasional long ones. Recording two or three responses a week, then acting on the feedback between attempts, is an effective way to build fluency and track improvement over time.",
    },
  ],
};

export default content;
