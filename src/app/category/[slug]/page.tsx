import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getPosts } from "@/lib/wp";
import { TermArchive } from "@/components/content/TermArchive";

export const revalidate = 900;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const term = await getCategoryBySlug(slug);
  if (!term) return {};
  return {
    title: `${term.name} — TEFL.ai Blog`,
    description: term.description || `Articles about ${term.name} from the TEFL.ai blog.`,
    alternates: { canonical: `/category/${slug}` },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const pageNum = Math.max(1, parseInt(sp.page || "1", 10) || 1);

  const term = await getCategoryBySlug(slug);
  if (!term) notFound();

  const { posts, totalPages } = await getPosts({
    category: String(term.id),
    page: pageNum,
    perPage: 12,
  });

  return (
    <TermArchive
      kind="Category"
      name={term.name}
      description={term.description}
      posts={posts}
      page={pageNum}
      totalPages={totalPages}
      basePath={`/category/${slug}`}
    />
  );
}
