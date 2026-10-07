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
