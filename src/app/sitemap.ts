import type { MetadataRoute } from "next";
import { SITE, TOOLS } from "@/lib/site";
import { getAllPostSlugs } from "@/lib/wp";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url.replace(/\/$/, "");
  const now = new Date();

  const staticRoutes = [
    "",
    "/ai-tool-overview",
    "/courses",
    "/blog",
    "/contact",
    "/future-of-ai-report",
    "/survey",
    "/ai-skilled-teacher-certificate",
    "/certificate-verification",
    "/verify-ai-teacher-certificate",
    "/terms-and-conditions",
    "/privacy-policy",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const toolRoutes = TOOLS.map((t) => ({
    url: `${base}/${t.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Course detail/delivery pages live on WordPress (LearnDash) — not in this
  // sitemap; WordPress serves its own for them.

  let postRoutes: MetadataRoute.Sitemap = [];
  try {
    const slugs = await getAllPostSlugs();
    postRoutes = slugs.map((slug) => ({
      url: `${base}/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch {
    /* WP unreachable at build time — skip post URLs */
  }

  return [...staticRoutes, ...toolRoutes, ...postRoutes];
}
