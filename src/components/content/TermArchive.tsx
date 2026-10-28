import Link from "next/link";
import { Sparkles } from "lucide-react";
import { BlogCard } from "@/components/content/BlogCard";
import type { WpPost } from "@/lib/wp";

export function TermArchive({
  kind,
  name,
  description,
  posts,
  page,
  totalPages,
  basePath,
}: {
  kind: "Category" | "Tag";
  name: string;
  description?: string;
  posts: WpPost[];
  page: number;
  totalPages: number;
  basePath: string;
}) {
  return (
    <>
      <section className="relative overflow-hidden pt-28 md:pt-36">
        <div className="container-tai text-center">
          <span className="chip mx-auto">
            <Sparkles className="h-4 w-4 text-[var(--color-accent)]" /> {kind}
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-balance text-4xl font-bold leading-[1.05] md:text-5xl">
            {name}
          </h1>
          {description && (
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-[var(--color-muted)]">
              {description}
            </p>
          )}
          <div className="mt-6">
            <Link href="/blog" className="text-sm font-semibold text-[var(--color-accent)]">
              ← All articles
            </Link>
          </div>
        </div>
      </section>

      <section className="container-tai mt-14">
        {posts.length === 0 ? (
          <div className="surface-card p-16 text-center text-[var(--color-muted)]">
            No articles here yet.
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => (
                <BlogCard key={p.id} post={p} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-3">
                {page > 1 && (
                  <Link href={`${basePath}?page=${page - 1}`} className="btn btn-ghost">
                    Previous
                  </Link>
                )}
                <span className="text-sm text-[var(--color-faint)]">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <Link href={`${basePath}?page=${page + 1}`} className="btn btn-ghost">
                    Next
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}
