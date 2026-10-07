import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";
import type { WpPost } from "@/lib/wp";

export function BlogCard({ post, featured = false }: { post: WpPost; featured?: boolean }) {
  const date = new Date(post.date).toLocaleDateString("en-IE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return (
    <Link
      href={`/${post.slug}`}
      className={`ring-card surface-card group flex flex-col overflow-hidden ${
        featured ? "lg:flex-row" : ""
      }`}
    >
      <div
        className={`relative overflow-hidden bg-[var(--color-surface-2)] ${
          featured ? "aspect-[16/10] lg:aspect-auto lg:w-1/2" : "aspect-[16/10]"
        }`}
      >
        {post.image ? (
          <Image
            src={post.image.src}
            alt={post.image.alt}
            fill
            sizes={featured ? "(max-width:1024px) 100vw, 50vw" : "(max-width:768px) 100vw, 33vw"}
            priority={featured}
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[var(--brand-gradient-soft)]">
            <span className="text-2xl font-bold text-gradient">TEFL.ai</span>
          </div>
        )}
      </div>
      <div className={`flex flex-1 flex-col p-6 ${featured ? "lg:justify-center lg:p-10" : ""}`}>
        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-faint)]">
          {post.categories[0] && (
            <span className="rounded-full bg-[var(--brand-gradient-soft)] px-2.5 py-0.5 font-medium text-[var(--color-accent)]">
              {post.categories[0].name}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> {post.readingTime} min read
          </span>
        </div>
        <h3
          className={`mt-3 font-semibold leading-snug text-[var(--color-ink)] transition group-hover:text-[var(--color-accent)] ${
            featured ? "text-2xl" : "text-lg"
          }`}
        >
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--color-muted)]">
          {post.excerpt}
        </p>
        <div className="mt-auto pt-4 text-xs text-[var(--color-faint)]">
          {post.author} · {date}
        </div>
      </div>
    </Link>
  );
}
