import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Sparkles } from "lucide-react";
import { getPostBySlug, getPageBySlug, getPosts } from "@/lib/wp";
import { BlogCard } from "@/components/content/BlogCard";
import { Sparkle } from "@/components/ui/Sparkle";

export const revalidate = 900;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (post) {
    return {
      title: post.title,
      description: post.excerpt,
      alternates: { canonical: `/${slug}` },
      openGraph: {
        title: post.title,
        description: post.excerpt,
        type: "article",
        images: post.image ? [{ url: post.image.src }] : undefined,
      },
    };
  }
  const page = await getPageBySlug(slug);
  if (page) {
    return { title: page.title, alternates: { canonical: `/${slug}` } };
  }
  return {};
}

export default async function CatchAllPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // 1) Blog post?
  const post = await getPostBySlug(slug);
  if (post) {
    const { posts } = await getPosts({ perPage: 4 });
    const related = posts.filter((p) => p.slug !== slug).slice(0, 3);
    const date = new Date(post.date).toLocaleDateString("en-IE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return (
      <>
        <article>
          <header className="relative overflow-hidden pt-28 md:pt-32">
            <div className="container-tai max-w-3xl">
              <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-[var(--color-faint)] hover:text-[var(--color-accent)]">
                <ArrowLeft className="h-4 w-4" /> Back to blog
              </Link>
              <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-[var(--color-faint)]">
                {post.categories[0] && (
                  <span className="rounded-full bg-[var(--brand-gradient-soft)] px-2.5 py-0.5 font-medium text-[var(--color-accent)]">
                    {post.categories[0].name}
                  </span>
                )}
                <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {post.readingTime} min read</span>
              </div>
              <h1 className="mt-4 text-balance text-3xl font-bold leading-[1.1] md:text-5xl">{post.title}</h1>
              <div className="mt-6 flex items-center gap-3 text-sm text-[var(--color-muted)]">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand-gradient-soft)] text-sm font-semibold text-[var(--color-accent)]">
                  {post.author[0]}
                </span>
                <span>{post.author} · {date}</span>
              </div>
            </div>
          </header>

          {post.image && (
            <div className="container-tai mt-10 max-w-4xl">
              <div className="relative aspect-[16/8] overflow-hidden rounded-[var(--radius-xl)]">
                <Image src={post.image.src} alt={post.image.alt} fill sizes="(max-width:1024px) 100vw, 900px" className="object-cover" priority />
              </div>
            </div>
          )}

          <div className="container-tai mt-12 max-w-3xl">
            <div className="prose-tai" dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>
        </article>

        {/* Keep reading */}
        {related.length > 0 && (
          <section className="container-tai mt-24">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Keep reading</h2>
              <Link href="/blog" className="text-sm font-semibold text-[var(--color-accent)]">All posts →</Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <BlogCard key={p.id} post={p} />
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="container-tai mt-20">
          <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[rgba(58,208,248,0.25)] p-8 text-center md:p-12">
            <div className="absolute inset-0 -z-10 bg-[var(--brand-gradient-soft)]" />
            <Sparkle size={32} className="mx-auto" />
            <h2 className="mt-4 text-2xl font-bold md:text-3xl">Try our free AI tools for English teachers</h2>
            <Link href="/ai-tool-overview" className="btn btn-primary mt-6">Explore the tools <Sparkles className="h-4 w-4" /></Link>
          </div>
        </section>
      </>
    );
  }

  // 2) WordPress page?
  const page = await getPageBySlug(slug);
  if (page) {
    return (
      <article className="pt-28 md:pt-32">
        <div className="container-tai max-w-3xl">
          <h1 className="text-balance text-3xl font-bold leading-[1.1] md:text-5xl">{page.title}</h1>
          <div className="mt-10 prose-tai" dangerouslySetInnerHTML={{ __html: page.content }} />
        </div>
      </article>
    );
  }

  notFound();
}
