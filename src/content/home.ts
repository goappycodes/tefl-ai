/** Real homepage content, carried over from the live site (testimonials, FAQ,
 * about copy, pricing claims) so nothing is fabricated. */

export const HERO = {
  eyebrow: "Powered by The TEFL Institute",
  title: "Where are you on your TEFL journey?",
  subtitle:
    "Whether you're just starting out or already an experienced teacher, TEFL.ai brings accredited courses and a suite of free AI tools together in one place.",
  paths: [
    {
      key: "new",
      title: "I'm new to TEFL",
      text: "Get guidance, explore accredited courses, and plan your teaching career.",
      cta: "Explore courses & resources",
      href: "#featured-tools",
    },
    {
      key: "experienced",
      title: "I'm an experienced teacher",
      text: "Find teaching jobs, access AI tools, and advance your career.",
      cta: "Browse jobs & tools",
      href: "#experienced",
    },
  ],
};

export const PROOF_STRIP = {
  bold: "Schools now shortlist for AI skills.",
  text: "Every tool you use here is evidence for your CV.",
  cta: "Earn the free AI-Skilled Teacher Certificate",
  href: "/ai-skilled-teacher-certificate",
};

export const HOW_IT_HELPS = {
  title: "How TEFL.ai helps",
  subtitle: "Everything you need for your TEFL journey, all in one place.",
  items: [
    {
      icon: "Wand2",
      title: "Smart AI tools",
      text: "Generate lesson plans, estimate IELTS bands, and simplify materials in seconds.",
    },
    {
      icon: "GraduationCap",
      title: "Accredited courses",
      text: "Find the right qualification to start or progress your TEFL career.",
    },
    {
      icon: "Globe2",
      title: "Global job opportunities",
      text: "Search the latest TEFL jobs worldwide and see country requirements.",
    },
  ],
};

export const STATS = [
  { value: 15, suffix: "", label: "Free AI tools" },
  { value: 100, suffix: "%", label: "Online & self-paced" },
  { value: 2017, suffix: "", label: "Trusted since", raw: true },
  { value: 50, suffix: "+", label: "Countries covered" },
];

export const ABOUT = {
  eyebrow: "About",
  title: "We redefine TEFL careers with AI",
  tagline:
    "AI-powered tools, courses, jobs, and opportunities — built for the next generation of TEFL teachers.",
  body: "TEFL.ai is part of the TEFL Institute family, a trusted leader in English teacher training and support since 2017. Built on this foundation, TEFL.ai goes beyond traditional courses — offering AI-powered job search, smart career tools, and future-ready training for teachers worldwide. Our mission is to make building a TEFL career smarter, faster, and more connected.",
};

export interface Testimonial {
  quote: string;
  name: string;
  location: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "The Generative AI TEFL Mastery course blew me away. It didn't just teach theory — it showed me exactly how to use AI in real lessons. I feel ahead of the curve now.",
    name: "Emma",
    location: "UK",
  },
  {
    quote:
      "The AI Materials Adaptor changed how I prep. I can take any article or video and instantly create exercises at the right level. My students love it.",
    name: "Lucas",
    location: "Brazil",
  },
  {
    quote:
      "I used the job board and CV builder together — within a week I had interviews lined up. The AI really does make applications stand out.",
    name: "Hannah",
    location: "Australia",
  },
  {
    quote:
      "The 120 Hour Advanced TEFL course was the smoothest learning experience I've had. The AI quizzes and instant feedback kept me motivated the whole way.",
    name: "Daniel",
    location: "Ireland",
  },
  {
    quote:
      "I didn't expect much from the job matcher, but it was incredible. It filtered jobs that fit me perfectly, saving me so much time.",
    name: "Marta",
    location: "Spain",
  },
  {
    quote:
      "The AI Lesson Plan Generator is a lifesaver. I can create a full, tailored lesson in minutes — it saves me hours every week.",
    name: "James",
    location: "UK",
  },
  {
    quote:
      "I loved how interactive the Travel Influencer Launchpad was. It gave me practical steps to build my brand and connect it with teaching opportunities abroad.",
    name: "Sophia",
    location: "USA",
  },
  {
    quote:
      "The combination of tools and job resources gave me real confidence. I found a role abroad quickly, and I know exactly how to keep growing my career.",
    name: "Li Wei",
    location: "China",
  },
  {
    quote:
      "The TEFL Career Roadmap Generator showed me exactly which qualifications I need to move forward. It felt like having a career coach, instantly.",
    name: "Aoife",
    location: "Ireland",
  },
  {
    quote:
      "I tried the AI IELTS Writing Band Estimator with my students and the feedback was spot-on. It's like having an examiner in your pocket.",
    name: "Michael",
    location: "USA",
  },
];

export interface Faq {
  q: string;
  a: string;
}

export const FAQS: Faq[] = [
  {
    q: "What is TEFL.ai?",
    a: "TEFL.ai is part of the TEFL Institute family. We combine accredited TEFL courses, AI-powered tools, and global job opportunities — all designed to help teachers launch and grow their careers.",
  },
  {
    q: "Is TEFL.ai free to use?",
    a: "TEFL.ai offers affordable, career-ready TEFL certifications from €69 for specialist micro-certifications up to €135 for our flagship 120 Hour Advanced TEFL. Every course is Ofqual-regulated, Highfield Approved, and OTCAC accredited. The AI tools are completely free.",
  },
  {
    q: "How do the AI tools work?",
    a: "Our AI tools make teaching easier and careers stronger. You can generate lesson plans, adapt authentic materials, check IELTS bands, build a CV, and more — all instantly.",
  },
  {
    q: "Do I need to pay extra to use the tools?",
    a: "No. You can use the tools as much as you like, completely free, to support your teaching and job applications.",
  },
  {
    q: "How can TEFL.ai help me find a job?",
    a: "We offer an AI-powered job board and resources to connect you with schools, recruiters, and online platforms worldwide — a vault of in-person and online jobs across the globe.",
  },
  {
    q: "Do I need a degree to get a TEFL job?",
    a: "Not always. Some countries and employers require one, but many don't. Our Country Eligibility Checker shows you exactly where you can teach with your qualifications.",
  },
  {
    q: "Are the courses accredited?",
    a: "Yes. Our 120 Hour Advanced TEFL Course is fully accredited and internationally recognised through the TEFL Institute, a trusted leader in training since 2017.",
  },
  {
    q: "Can I use TEFL.ai even if I've already taken a TEFL course elsewhere?",
    a: "Yes. Many teachers use our tools and job board to advance their careers, even if they trained with another provider.",
  },
  {
    q: "Why choose TEFL.ai over other TEFL sites?",
    a: "Because we don't just sell courses. We combine accredited training, free AI-powered tools, and global job opportunities — everything you need to start and grow your TEFL career, all in one place.",
  },
];
