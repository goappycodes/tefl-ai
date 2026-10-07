import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { getPosts } from "@/lib/wp";
import { BlogCard } from "@/components/content/BlogCard";
import { Sparkle } from "@/components/ui/Sparkle";

export const metadata: Metadata = {
  title: "Blog — TEFL tips, AI & teaching abroad",
  description:
    "Insights on teaching English, using AI in the classroom, IELTS prep, and building a TEFL career abroad — from the TEFL.ai team.",
  alternates: { canonical: "/blog" },
};

export const revalidate = 900;

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);
  const { posts, totalPages } = await getPosts({ page, perPage: 13 });

  const hasPosts = posts.length > 0;
  const featured = page === 1 && hasPosts ? posts[0] : null;
  const rest = featured ? posts.slice(1) : posts;

  return (
    <>
      <section className="relative overflow-hidden pt-28 md:pt-36">
        <Sparkle size={22} className="absolute left-[11%] top-28 animate-float opacity-50" />
        <div className="container-tai text-center">
          <span className="chip mx-auto"><Sparkles className="h-4 w-4 text-[var(--color-accent)]" /> The TEFL.ai Blog</span>
          <h1 className="mx-auto mt-6 max-w-3xl text-balance text-4xl font-bold leading-[1.05] md:text-6xl">
            Teach smarter with <span className="text-gradient">AI</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-[var(--color-muted)] md:text-lg">
            Practical guides on teaching English, AI in the classroom, IELTS prep and
            building a career abroad.
          </p>
        </div>
      </section>

      <section className="container-tai mt-14">
        {!hasPosts ? (
          <div className="surface-card p-16 text-center text-[var(--color-muted)]">
            <p>Posts are loading from our library. Please check back shortly.</p>
            <Link href="/ai-tool-overview" className="btn btn-ghost mt-6">Explore our AI tools</Link>
          </div>
        ) : (
          <>
            {featured && (
              <div className="mb-8">
                <BlogCard post={featured} featured />
              </div>
            )}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((p) => (
                <BlogCard key={p.id} post={p} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-3">
                {page > 1 && (
                  <Link href={`/blog?page=${page - 1}`} className="btn btn-ghost">Previous</Link>
                )}
                <span className="text-sm text-[var(--color-faint)]">Page {page} of {totalPages}</span>
                {page < totalPages && (
                  <Link href={`/blog?page=${page + 1}`} className="btn btn-ghost">Next</Link>
                )}
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}
