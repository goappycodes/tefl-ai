import type { Metadata } from "next";
import { toolBySlug } from "./site";

/** Build consistent SEO metadata for a tool page from its slug. */
export function toolMetadata(slug: string): Metadata {
  const tool = toolBySlug(slug);
  if (!tool) return {};
  const title = tool.title;
  const description = tool.description;
  return {
    title,
    description,
    alternates: { canonical: `/${slug}` },
    openGraph: {
      title: `${title} · TEFL.ai`,
      description,
      url: `/${slug}`,
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

/** Metadata for the interactive tool page at /{slug}/tool. The landing at
 *  /{slug} is the canonical SEO page, so this points its canonical there. */
export function toolTryMetadata(slug: string): Metadata {
  const tool = toolBySlug(slug);
  if (!tool) return {};
  return {
    title: `${tool.title} — Try it now`,
    description: tool.description,
    alternates: { canonical: `/${slug}` },
  };
}
