/** Headless WordPress REST client. WordPress stays as the content backend
 *  (blog posts, pages). Next.js renders them with the new design.
 *  Base: {WP_API_BASE}/wp/v2/...  (default https://tefl.ai/wp-json) */

const WP_BASE = process.env.WP_API_BASE || "https://tefl.ai/wp-json";
const REVALIDATE = 60 * 15; // 15 min ISR

export interface WpImage {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface WpPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  modified: string;
  author: string;
  authorAvatar?: string;
  image?: WpImage;
  categories: { id: number; name: string; slug: string }[];
  readingTime: number;
}

export interface WpPage {
  id: number;
  slug: string;
  title: string;
  content: string;
  date: string;
  modified: string;
}

interface RawEmbedded {
  "wp:featuredmedia"?: Array<{
    source_url?: string;
    alt_text?: string;
    media_details?: { width?: number; height?: number };
  }>;
  author?: Array<{ name?: string; avatar_urls?: Record<string, string> }>;
  "wp:term"?: Array<Array<{ id: number; name: string; slug: string; taxonomy: string }>>;
}

interface RawPost {
  id: number;
  slug: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  date: string;
  modified: string;
  _embedded?: RawEmbedded;
}

interface RawPage {
  id: number;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  date: string;
  modified: string;
}

const decode = (html: string) =>
  html
    .replace(/&amp;/g, "&")
    .replace(/&#8217;/g, "’")
    .replace(/&#8216;/g, "‘")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&hellip;/g, "…")
    .replace(/&nbsp;/g, " ")
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/<[^>]+>/g, "")
    .trim();

const wordsOf = (html: string) => decode(html).split(/\s+/).filter(Boolean).length;

function mapPost(raw: RawPost): WpPost {
  const emb = raw._embedded || {};
  const media = emb["wp:featuredmedia"]?.[0];
  const author = emb.author?.[0];
  const terms = (emb["wp:term"] || []).flat().filter((t) => t.taxonomy === "category");
  return {
    id: raw.id,
    slug: raw.slug,
    title: decode(raw.title.rendered),
    excerpt: decode(raw.excerpt.rendered),
    content: raw.content.rendered,
    date: raw.date,
    modified: raw.modified,
    author: author?.name || "TEFL.ai",
    authorAvatar: author?.avatar_urls?.["96"],
    image: media?.source_url
      ? {
          src: media.source_url,
          alt: media.alt_text || decode(raw.title.rendered),
          width: media.media_details?.width,
          height: media.media_details?.height,
        }
      : undefined,
    categories: terms.map((t) => ({ id: t.id, name: t.name, slug: t.slug })),
    readingTime: Math.max(1, Math.round(wordsOf(raw.content.rendered) / 220)),
  };
}

async function wpFetch<T>(path: string, revalidate = REVALIDATE): Promise<T | null> {
  try {
    const res = await fetch(`${WP_BASE}${path}`, {
      next: { revalidate },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function getPosts(opts: {
  page?: number;
  perPage?: number;
  category?: string;
  search?: string;
} = {}): Promise<{ posts: WpPost[]; total: number; totalPages: number }> {
  const params = new URLSearchParams({
    _embed: "1",
    per_page: String(opts.perPage || 12),
    page: String(opts.page || 1),
    orderby: "date",
    order: "desc",
  });
  if (opts.search) params.set("search", opts.search);
  if (opts.category) params.set("categories", opts.category);

  try {
    const res = await fetch(`${WP_BASE}/wp/v2/posts?${params}`, {
      next: { revalidate: REVALIDATE },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return { posts: [], total: 0, totalPages: 0 };
    const total = parseInt(res.headers.get("x-wp-total") || "0", 10);
    const totalPages = parseInt(res.headers.get("x-wp-totalpages") || "0", 10);
    const raw = (await res.json()) as RawPost[];
    return { posts: raw.map(mapPost), total, totalPages };
  } catch {
    return { posts: [], total: 0, totalPages: 0 };
  }
}

export async function getPostBySlug(slug: string): Promise<WpPost | null> {
  const raw = await wpFetch<RawPost[]>(`/wp/v2/posts?slug=${encodeURIComponent(slug)}&_embed=1`);
  return raw && raw.length ? mapPost(raw[0]) : null;
}

export async function getPageBySlug(slug: string): Promise<WpPage | null> {
  const raw = await wpFetch<RawPage[]>(`/wp/v2/pages?slug=${encodeURIComponent(slug)}`);
  if (!raw || !raw.length) return null;
  const p = raw[0];
  return {
    id: p.id,
    slug: p.slug,
    title: decode(p.title.rendered),
    content: p.content.rendered,
    date: p.date,
    modified: p.modified,
  };
}

export async function getCategories(): Promise<{ id: number; name: string; slug: string; count: number }[]> {
  const raw = await wpFetch<Array<{ id: number; name: string; slug: string; count: number }>>(
    `/wp/v2/categories?per_page=50&orderby=count&order=desc&hide_empty=true`
  );
  return raw ? raw.filter((c) => c.slug !== "uncategorized") : [];
}

export async function getAllPostSlugs(): Promise<string[]> {
  const raw = await wpFetch<Array<{ slug: string }>>(`/wp/v2/posts?per_page=100&_fields=slug`);
  return raw ? raw.map((p) => p.slug) : [];
}
