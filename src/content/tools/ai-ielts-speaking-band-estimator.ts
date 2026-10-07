import type { ToolLandingContent } from "./types";

export const content: ToolLandingContent = {
  slug: "ai-ielts-speaking-band-estimator",
  badge: "IELTS Speaking Band Estimator",
  heroTitle: "Get Instant Feedback on Your IELTS Speaking",
  heroSubtitle:
    "Record a 2–3 minute response and get an estimated IELTS speaking band with feedback on fluency, vocabulary, grammar and pronunciation.",
  ctaLabel: "Start Recording",
  poweredBy: "Powered by AI Technology",
  features: [
    {
      icon: "Mic",
      title: "Voice Assessment",
      desc: "Record your speaking response and get an estimated IELTS band (0 – 9) with AI-powered analysis.",
    },
    {
      icon: "MessageSquareText",
      title: "Detailed Analysis",
      desc: "Comprehensive feedback on Fluency, Vocabulary, Grammar, and Pronunciation with improvement tips.",
    },
    {
      icon: "Captions",
      title: "Speech Transcription",
      desc: "Advanced speech-to-text conversion to analyze your spoken response with high accuracy.",
    },
  ],
  about: {
    eyebrow: "About",
    title: "Practice Your IELTS Speaking Skills",
    paragraphs: [
      "Record your speaking response (2-3 minutes) and receive instant AI-powered feedback on all four speaking criteria. Perfect for Part 2 task preparation and confidence building.",
    ],
    bullets: [
      "Real-time speech analysis",
      "Pronunciation assessment",
      "Fluency and coherence feedback",
    ],
  },
  tryTitle: "Record Your Speaking Response",
  tryText:
    "Choose a speaking topic and record your response. Get instant AI-powered feedback on fluency, vocabulary, grammar, and pronunciation!",
  tryCtaLabel: "Start Recording",
  guidance: {
    eyebrow: "Get Professional Help",
    title: "Need Expert Speaking Coach?",
    text: "For personalized speaking practice with certified IELTS instructors, book a one-on-one session for targeted improvement.",
    ctaLabel: "Book Speaking Session",
    href: "/courses",
  },
  faqs: [
    {
      q: "How accurate is the AI speaking assessment?",
      a: "Our AI speaking assessment shows good correlation with human examiners for most speaking criteria. However, pronunciation and fluency assessment may have limitations compared to face-to-face evaluation. This tool provides valuable practice feedback but should be used alongside professional instruction for comprehensive preparation.",
    },
    {
      q: "What microphone quality do I need for accurate assessment?",
      a: "A basic laptop or phone microphone is sufficient for our assessment. However, clearer audio quality improves transcription accuracy and assessment reliability. Ensure you're in a quiet environment and speak clearly into the microphone. External microphones or headsets can provide better results.",
    },
    {
      q: "How does the AI evaluate pronunciation and fluency?",
      a: "The AI analyzes speech patterns, pause frequency, word stress, and rhythm to assess fluency and pronunciation. It compares your speech against standard pronunciation models and evaluates speaking pace, hesitation patterns, and word clarity. While helpful for practice, remember that human assessment of pronunciation involves nuances AI may miss.",
    },
    {
      q: "Is there a time limit for recording?",
      a: "Yes, recordings are limited to 3 minutes to control processing costs and match typical IELTS Part 2 response length (2 minutes + preparation). This ensures efficient processing while providing sufficient content for meaningful assessment. For longer practice, consider multiple recordings with different topics.",
    },
    {
      q: "Can the AI assess all IELTS speaking parts?",
      a: "Currently optimized for Part 2 (long turn) responses where you speak continuously about a topic. Part 1 and Part 3 involve interactive dialogue which requires different assessment approaches. The AI provides general feedback applicable to all speaking parts, focusing on fluency, vocabulary, grammar, and pronunciation.",
    },
    {
      q: "Is my voice recording stored or shared?",
      a: "Voice recordings are processed temporarily for transcription and assessment, then automatically deleted from our servers within 24 hours. We do not store audio files long-term or use them for AI training. Transcriptions may be saved to your dashboard if you're logged in, but audio files are never permanently stored.",
    },
    {
      q: "What if the transcription seems inaccurate?",
      a: "Transcription accuracy depends on audio quality, speaking clarity, and accent familiarity. Minor transcription errors usually don't significantly affect assessment accuracy. If major portions are incorrectly transcribed, try recording again with clearer speech or better audio quality. The AI assessment considers overall patterns rather than individual word accuracy.",
    },
    {
      q: "How often should I use the speaking estimator?",
      a: "Practice 2-3 times weekly with different topics to track improvement and build speaking confidence. Focus on implementing feedback between sessions rather than repeatedly recording the same response. Combine AI assessment with speaking to friends, recording yourself, and professional instruction for comprehensive preparation.",
    },
    {
      q: "Does the AI provide topic suggestions for practice?",
      a: "Yes, our tool includes a variety of authentic IELTS Part 2 topics covering common themes like personal experiences, places, people, objects, and events. Topics are randomly selected to simulate exam conditions. You can also practice with your own topics or use official IELTS practice materials alongside our assessment tool.",
    },
  ],
};

export default content;
