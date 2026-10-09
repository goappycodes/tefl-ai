import Link from "next/link";
import { ArrowRight, ArrowUpRight, Award } from "lucide-react";
import * as Icons from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ToolCard } from "@/components/ui/ToolCard";
import { CourseCard } from "@/components/ui/CourseCard";
import { Sparkle } from "@/components/ui/Sparkle";
import { HomeHero } from "@/components/home/HomeHero";
import {
  StatsRow,
  Testimonials,
  FaqAccordion,
} from "@/components/home/HomeClient";
import { TOOLS, featuredTools } from "@/lib/site";
import { COURSES } from "@/content/courses";
import { PROOF_STRIP, HOW_IT_HELPS, ABOUT } from "@/content/home";

function HIcon({ name, className }: { name: string; className?: string }) {
  const Cmp =
    (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name] ??
    Icons.Sparkles;
  return <Cmp className={className} />;
}

export default function HomePage() {
  const featured = featuredTools();
  return (
    <>
      <HomeHero />

      {/* Proof strip */}
      <section className="container-tai mt-14">
        <div className="surface-glass flex flex-col items-center gap-2 rounded-2xl border border-[rgba(58,208,248,0.22)] px-6 py-4 text-center sm:flex-row sm:justify-center sm:gap-4">
          <span className="font-semibold text-gradient">{PROOF_STRIP.bold}</span>
          <span className="text-sm text-[var(--color-muted)]">
            {PROOF_STRIP.text}
          </span>
          <Link
            href={PROOF_STRIP.href}
            className="inline-flex items-center gap-1 whitespace-nowrap text-sm font-semibold text-[var(--color-accent)] underline-offset-4 hover:underline"
          >
            {PROOF_STRIP.cta} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* How it helps */}
      <section className="container-tai mt-24">
        <SectionHeading
          center
          eyebrow="How TEFL.ai helps"
          title={HOW_IT_HELPS.title}
          subtitle={HOW_IT_HELPS.subtitle}
        />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {HOW_IT_HELPS.items.map((item) => (
            <div key={item.title} className="surface-card ring-card p-7">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--brand-gradient-soft)] text-[var(--color-accent)]">
                <HIcon name={item.icon} className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-[var(--color-ink)]">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured AI tools */}
      <section id="featured-tools" className="container-tai mt-28 scroll-mt-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Free forever"
            title={
              <>
                Free AI tools for <span className="text-gradient">English teachers</span>
              </>
            }
            subtitle="Generate, grade and plan in seconds. No sign-up, no limits."
          />
          <Link href="/ai-tool-overview" className="btn btn-ghost">
            View all {TOOLS.length} tools <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((t) => (
            <ToolCard key={t.slug} tool={t} />
          ))}
        </div>
      </section>

      {/* Courses */}
      <section id="courses" className="container-tai mt-28 scroll-mt-24">
        <SectionHeading
          center
          eyebrow="Accredited courses"
          title="Get certified, get hired"
          subtitle="Ofqual-regulated, Highfield Approved and OTCAC accredited. Master your skills with specialised, career-ready programmes."
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {COURSES.map((c) => (
            <CourseCard key={c.slug} course={c} />
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="container-tai mt-28">
        <StatsRow />
      </section>

      {/* About */}
      <section className="container-tai mt-28">
        <div className="surface-card grid items-center gap-10 overflow-hidden rounded-[var(--radius-xl)] p-8 md:p-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <SectionHeading
              eyebrow={ABOUT.eyebrow}
              title={ABOUT.title}
              subtitle={ABOUT.tagline}
            />
            <p className="mt-6 text-sm leading-relaxed text-[var(--color-muted)]">
              {ABOUT.body}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="chip">
                <Award className="h-4 w-4" /> Ofqual-regulated
              </span>
              <span className="chip">Highfield Approved · 21335</span>
              <span className="chip">OTCAC Accredited</span>
            </div>
          </div>
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-[var(--brand-gradient-soft)] blur-3xl" />
            <div className="surface-glass relative grid aspect-square w-full max-w-sm place-items-center rounded-[var(--radius-xl)] p-10">
              <Sparkle size={96} className="animate-float" />
              <p className="absolute bottom-8 text-center text-sm text-[var(--color-muted)]">
                Part of the <strong className="text-[var(--color-ink)]">TEFL Institute</strong> family · since 2017
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="experienced" className="mt-28 scroll-mt-24">
        <div className="container-tai">
          <SectionHeading
            center
            eyebrow="Loved by teachers"
            title="What our teachers say"
          />
        </div>
        <div className="mt-12">
          <Testimonials />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="container-tai mt-28 scroll-mt-24">
        <SectionHeading center eyebrow="FAQ" title="Frequently asked questions" />
        <div className="mt-12">
          <FaqAccordion />
        </div>
      </section>

      {/* CTA band */}
      <section className="container-tai mt-28">
        <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[rgba(58,208,248,0.25)] p-10 text-center md:p-16">
          <div className="absolute inset-0 -z-10 bg-[var(--brand-gradient-soft)]" />
          <Sparkle size={40} className="mx-auto" />
          <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-bold md:text-4xl">
            Start building your TEFL career today
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[var(--color-muted)]">
            Explore 15 free AI tools, or get certified with an accredited course
            recognised worldwide.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/ai-tool-overview" className="btn btn-primary">
              Explore AI tools <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/courses" className="btn btn-ghost">
              View courses <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
