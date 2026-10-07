import type { ToolLandingContent } from "./types";

export const content: ToolLandingContent = {
  slug: "ai-ielts-writing-band-estimator",
  badge: "IELTS Band Estimator",
  heroTitle: "Instantly Gauge Your IELTS Writing Band",
  heroSubtitle:
    "Paste any Task 1 or Task 2 response and get an estimated IELTS writing band — with criterion-by-criterion feedback — in seconds.",
  ctaLabel: "Get Started",
  poweredBy: "Powered by AI Technology",
  features: [
    {
      icon: "Gauge",
      title: "Band Estimate",
      desc: "Receive an approximate IELTS band (0 – 9) in seconds using advanced AI analysis.",
    },
    {
      icon: "MessageSquareText",
      title: "Detailed Feedback",
      desc: "Targeted advice on Task Response, Coherence, Lexical Resource, and Grammar accuracy.",
    },
    {
      icon: "TrendingUp",
      title: "Track Progress",
      desc: "Store and review previous estimates to monitor improvement over time.",
    },
  ],
  about: {
    eyebrow: "About",
    title: "Improve Your IELTS Writing Skills",
    paragraphs: [
      "Paste any Task 1 or Task 2 response (≈250–300 words) and instantly get an estimated band score alongside targeted feedback. Perfect for self-study or classroom use.",
    ],
    bullets: [
      "Realistic band prediction",
      "Actionable improvement tips",
      "Unlimited free assessments",
    ],
  },
  tryTitle: "Test Your Writing Sample",
  tryText:
    "Submit your IELTS writing sample and get instant AI-powered feedback. Perfect for practice sessions and progress tracking — takes just 30 seconds.",
  tryCtaLabel: "Start Assessment",
  guidance: {
    eyebrow: "Get professional help",
    title: "Need Expert IELTS Guidance?",
    text: "For comprehensive preparation and guaranteed improvement, consider our structured IELTS courses and one-to-one tutoring.",
    ctaLabel: "Explore Our Courses",
    href: "/courses",
  },
  faqs: [
    {
      q: "How accurate is the AI band estimator?",
      a: "Our AI estimator shows high correlation with human raters, with reliability coefficients around 0.81 in research studies. However, this is an approximate estimate for practice purposes only and should not be considered a guarantee of your official IELTS score. Individual results may vary, and we recommend using this tool alongside professional preparation.",
    },
    {
      q: "What are the limitations of AI-powered assessment?",
      a: "AI assessment has several limitations: it may struggle with nuanced content evaluation, cultural context, and creative expression. The system can occasionally produce \"hallucinations\" (inaccurate feedback) and may not fully understand abstract concepts like irony or sophisticated argumentation. It's best used as a supplementary practice tool rather than a definitive assessment.",
    },
    {
      q: "How does the AI evaluate the four IELTS criteria?",
      a: "The AI analyzes your writing based on the four official IELTS criteria: Task Response (how well you address the question), Coherence and Cohesion (organization and flow), Lexical Resource (vocabulary range and accuracy), and Grammatical Range and Accuracy (sentence variety and grammar). Each criterion receives a separate assessment contributing to your overall estimated band.",
    },
    {
      q: "Why is there a 300-word limit for submissions?",
      a: "The word limit helps control processing costs and ensures faster response times. Most IELTS Task 1 responses are around 150 words and Task 2 around 250-300 words, so this limit accommodates typical essay lengths while maintaining system efficiency. Longer texts may not be fully processed.",
    },
    {
      q: "Can I use this tool for both Task 1 and Task 2?",
      a: "Yes, the estimator works for both Academic and General Training Task 1 (reports, letters) and Task 2 (essays). Simply select the appropriate task type before submitting your writing. The AI adjusts its assessment criteria accordingly, though Task 2 essays generally receive more detailed feedback due to their length and complexity.",
    },
    {
      q: "Is my writing data stored or used for training?",
      a: "We prioritize your privacy. Submitted writing samples are processed temporarily for assessment purposes only. We do not use individual submissions for AI training. Always avoid submitting personal or sensitive information in your practice essays.",
    },
    {
      q: "What should I do if the estimated band seems inaccurate?",
      a: "AI estimates can occasionally be inconsistent, especially for complex or creative writing. If results seem off, try submitting another essay or seek feedback from a qualified IELTS instructor. Remember that official IELTS scoring involves trained human examiners who consider context and nuance that AI may miss. Use our estimator as one of several practice tools.",
    },
    {
      q: "How often should I use this tool during IELTS preparation?",
      a: "We recommend using the estimator 2-3 times per week as part of a balanced study routine. Focus on implementing the feedback suggestions between submissions rather than seeking multiple assessments of the same piece. Combine AI feedback with human instruction, official practice materials, and varied writing practice for optimal results.",
    },
    {
      q: "Does the AI provide feedback or just a band score?",
      a: "Our AI provides both an estimated band score (0-9 scale) and detailed feedback across all four assessment criteria. You'll receive specific suggestions for improvement in areas like task completion, paragraph organization, vocabulary usage, and grammar accuracy, helping you understand exactly how to enhance your writing skills.",
    },
  ],
};

export default content;
