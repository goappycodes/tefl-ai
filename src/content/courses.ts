import { SITE } from "@/lib/site";

export interface Course {
  slug: string; // /courses/{slug}
  title: string;
  productId: number; // WooCommerce product → checkout hand-off
  courseId: number; // LearnDash course id (reference)
  price: number;
  regularPrice?: number;
  currency: "EUR";
  badge?: string;
  tagline: string;
  blurb: string;
  level: string;
  duration: string;
  icon: string; // lucide-react
  highlights: string[];
  outcomes: string[];
}

export const COURSES: Course[] = [
  {
    slug: "120-hour-accredited-tefl-course",
    title: "120 Hour Advanced TEFL",
    productId: 681,
    courseId: 711,
    price: 135,
    regularPrice: 150,
    currency: "EUR",
    badge: "Flagship",
    tagline: "Get certified to teach English online or abroad, worldwide.",
    blurb:
      "Our flagship, internationally recognised certification. Ofqual-regulated, Highfield Approved and OTCAC accredited — everything you need to start teaching English anywhere.",
    level: "Beginner → Job-ready",
    duration: "120 hours · self-paced",
    icon: "GraduationCap",
    highlights: [
      "Ofqual-regulated & Highfield Approved",
      "OTCAC accredited and internationally recognised",
      "100% online, self-paced with AI-assisted quizzes",
      "Lifetime certificate with verification",
    ],
    outcomes: [
      "Teach English online or abroad worldwide",
      "Plan and deliver effective ESL/EFL lessons",
      "Apply with a globally recognised qualification",
    ],
  },
  {
    slug: "generative-ai",
    title: "Generative AI TEFL Mastery",
    productId: 2157,
    courseId: 240,
    price: 69,
    currency: "EUR",
    badge: "Most popular",
    tagline: "Learn to use AI tools to transform your TEFL teaching.",
    blurb:
      "Go beyond theory. Master practical, classroom-ready workflows for using generative AI to plan lessons, create materials and give feedback — and stand out to schools now hiring for AI skills.",
    level: "Practising teachers",
    duration: "Micro-certification · self-paced",
    icon: "Sparkles",
    highlights: [
      "Real lesson workflows, not just theory",
      "Prompt libraries for planning & materials",
      "Evidence for an AI-skilled teaching CV",
      "Accredited micro-certification",
    ],
    outcomes: [
      "Use AI confidently in real lessons",
      "Cut planning time dramatically",
      "Signal in-demand AI skills to employers",
    ],
  },
  {
    slug: "travel-influencer",
    title: "Travel Influencer Launchpad",
    productId: 2156,
    courseId: 439,
    price: 69,
    currency: "EUR",
    badge: "New",
    tagline: "Build your brand, grow an audience, and earn while you travel.",
    blurb:
      "Turn teaching abroad into a content career. Learn to build a personal brand, grow an audience across TikTok, Reels and Shorts, and monetise your teach-and-travel lifestyle.",
    level: "Teachers & creators",
    duration: "Micro-certification · self-paced",
    icon: "Plane",
    highlights: [
      "Personal brand & audience growth",
      "Short-form video strategy that converts",
      "Monetisation for teach-and-travel creators",
      "Accredited micro-certification",
    ],
    outcomes: [
      "Launch a teach-and-travel content brand",
      "Grow and engage an audience",
      "Create income streams while abroad",
    ],
  },
];

export const courseBySlug = (slug: string) =>
  COURSES.find((c) => c.slug === slug);

/** The actual course page lives on WordPress (LearnDash LMS) — it is NOT
 * rebuilt in Next.js. "Learn more" links out to the WP/commerce host. Swap the
 * host to shop.tefl.ai later via NEXT_PUBLIC_CHECKOUT_BASE_URL. */
export const courseUrl = (slug: string) =>
  `${SITE.checkoutBase}/courses/${slug}/`;

/** WooCommerce add-to-cart hand-off. Cart redirects straight to checkout
 * on the live store (see REBUILD-BLUEPRINT.md §4). Swap checkoutBase to
 * shop.tefl.ai later via NEXT_PUBLIC_CHECKOUT_BASE_URL. */
export const enrolUrl = (productId: number) =>
  `${SITE.checkoutBase}/cart/?add-to-cart=${productId}`;

export const formatPrice = (n: number, currency = "EUR") =>
  new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(n);
