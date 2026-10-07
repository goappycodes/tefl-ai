import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, ChevronRight, Clock, GraduationCap, ShieldCheck, Sparkles, Target } from "lucide-react";
import * as Icons from "lucide-react";
import { COURSES, courseBySlug, enrolUrl, formatPrice } from "@/content/courses";
import { Sparkle } from "@/components/ui/Sparkle";
import { ACCREDITATIONS } from "@/lib/site";

export function generateStaticParams() {
  return COURSES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = courseBySlug(slug);
  if (!course) return {};
  return {
    title: course.title,
    description: course.blurb,
    alternates: { canonical: `/courses/${slug}` },
    openGraph: { title: `${course.title} · TEFL.ai`, description: course.blurb },
  };
}

function CIcon({ name, className }: { name: string; className?: string }) {
  const Cmp = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name] ?? Icons.GraduationCap;
  return <Cmp className={className} />;
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = courseBySlug(slug);
  if (!course) notFound();

  const others = COURSES.filter((c) => c.slug !== slug);

  return (
    <>
      <section className="relative overflow-hidden pt-28 md:pt-32">
        <Sparkle size={22} className="absolute right-[12%] top-28 animate-float opacity-40" />
        <div className="container-tai">
          <nav className="flex items-center gap-1.5 text-xs text-[var(--color-faint)]">
            <Link href="/" className="hover:text-[var(--color-muted)]">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/courses" className="hover:text-[var(--color-muted)]">Courses</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-[var(--color-muted)]">{course.title}</span>
          </nav>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-gradient-soft)] text-[var(--color-accent)]">
                  <CIcon name={course.icon} className="h-7 w-7" />
                </span>
                {course.badge && <span className="chip">{course.badge}</span>}
              </div>
              <h1 className="mt-6 max-w-2xl text-balance text-3xl font-bold leading-[1.1] md:text-5xl">
                {course.title}
              </h1>
              <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-[var(--color-muted)] md:text-lg">
                {course.tagline}
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-sm text-[var(--color-muted)]">
                <span className="chip"><GraduationCap className="h-4 w-4" /> {course.level}</span>
                <span className="chip"><Clock className="h-4 w-4" /> {course.duration}</span>
                <span className="chip"><ShieldCheck className="h-4 w-4" /> Accredited</span>
              </div>
            </div>

            {/* Enrol card */}
            <div className="surface-card h-fit p-7 lg:sticky lg:top-24">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{formatPrice(course.price, course.currency)}</span>
                {course.regularPrice && (
                  <span className="text-lg text-[var(--color-faint)] line-through">
                    {formatPrice(course.regularPrice, course.currency)}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-[var(--color-faint)]">One-time payment · lifetime access</p>
              <a href={enrolUrl(course.productId)} className="btn btn-primary mt-6 w-full">
                Enrol now <ArrowRight className="h-4 w-4" />
              </a>
              <ul className="mt-6 space-y-2.5">
                {course.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 text-sm text-[var(--color-muted)]">
                    <Check className="mt-0.5 h-4 w-4 flex-none text-[var(--color-success)]" /> {h}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex items-center gap-2 border-t border-[var(--color-border)] pt-5 text-xs text-[var(--color-faint)]">
                <ShieldCheck className="h-4 w-4 text-[var(--color-accent)]" /> 14-day money-back guarantee
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About + outcomes */}
      <section className="container-tai mt-20">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div className="surface-card p-8">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <Sparkles className="h-5 w-5 text-[var(--color-accent)]" /> About this course
            </h2>
            <p className="mt-4 leading-relaxed text-[var(--color-muted)]">{course.blurb}</p>

            <h3 className="mt-8 flex items-center gap-2 font-semibold">
              <Target className="h-4 w-4 text-[var(--color-accent)]" /> What you&apos;ll be able to do
            </h3>
            <ul className="mt-4 space-y-2.5">
              {course.outcomes.map((o) => (
                <li key={o} className="flex items-start gap-2 text-sm text-[var(--color-muted)]">
                  <Check className="mt-0.5 h-4 w-4 flex-none text-[var(--color-success)]" /> {o}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-5">
            <div className="surface-card p-6">
              <h3 className="flex items-center gap-2 font-semibold">
                <ShieldCheck className="h-4 w-4 text-[var(--color-accent)]" /> Accreditation
              </h3>
              <div className="mt-3 space-y-2">
                {ACCREDITATIONS.map((a) => (
                  <div key={a.name} className="text-sm">
                    <span className="font-medium text-[var(--color-ink)]">{a.name}</span>
                    <span className="block text-xs text-[var(--color-faint)]">{a.detail}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="surface-card p-6">
              <h3 className="font-semibold">Not sure yet?</h3>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                Try the free AI Course Finder to compare options for your goals.
              </p>
              <Link href="/tefl-course-finder" className="btn btn-ghost mt-4 w-full">
                Find my course
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Other courses */}
      <section className="container-tai mt-24">
        <h2 className="text-2xl font-semibold">Other courses</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {others.map((c) => (
            <Link key={c.slug} href={`/courses/${c.slug}`} className="ring-card surface-card flex items-center justify-between gap-4 p-6">
              <div>
                <h3 className="font-semibold">{c.title}</h3>
                <p className="mt-1 text-sm text-[var(--color-muted)]">{c.tagline}</p>
                <span className="mt-2 inline-block text-sm font-semibold text-gradient">
                  {formatPrice(c.price, c.currency)}
                </span>
              </div>
              <ArrowRight className="h-5 w-5 flex-none text-[var(--color-faint)]" />
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
