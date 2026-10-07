/** SEO landing content for a tool page. Carried over verbatim from the live
 *  WordPress tool templates (hero, features, about, FAQ, guidance CTA) so all
 *  SEO copy is retained. The landing lives at /{slug}; the interactive tool
 *  lives at /{slug}/tool. */

export interface ToolFeature {
  icon: string; // lucide-react icon name
  title: string;
  desc: string;
}

export interface ToolFaq {
  q: string;
  a: string;
}

export interface ToolAbout {
  eyebrow?: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface ToolGuidance {
  eyebrow?: string;
  title: string;
  text: string;
  ctaLabel: string;
  href: string;
}

export interface ToolLandingContent {
  slug: string;
  badge?: string;
  /** Big hero headline (the marketing H1 from the WP page). */
  heroTitle: string;
  /** Short supporting line under the headline. */
  heroSubtitle?: string;
  ctaLabel: string;
  poweredBy?: string;
  features: ToolFeature[];
  about?: ToolAbout;
  /** Mid-page "try it" CTA band. */
  tryTitle?: string;
  tryText?: string;
  tryCtaLabel?: string;
  guidance?: ToolGuidance;
  faqs: ToolFaq[];
}
