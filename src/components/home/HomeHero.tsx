import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Sparkle } from "@/components/ui/Sparkle";
import { HERO } from "@/content/home";

/**
 * Above-the-fold hero. Deliberately a server component — it has no
 * interactivity, so it ships zero client JS and its markup paints on first
 * render. The reveal is pure CSS (.rise / .rise-hero), not hydration-gated.
 */
export function HomeHero() {
  return (
    <section className="relative overflow-hidden pt-28 md:pt-36">
      {/* glowing hero orb */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-10 -z-10 h-[460px] w-[560px] max-w-[92vw] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(58,208,248,0.22), rgba(139,116,255,0.14) 45%, transparent 70%)",
        }}
      />
      {/* floating sparkles */}
      <Sparkle
        size={28}
        className="absolute left-[8%] top-28 animate-float opacity-70"
      />
      <Sparkle
        size={18}
        className="absolute right-[12%] top-40 animate-float opacity-50"
      />
      <Sparkle
        size={22}
        className="absolute right-[22%] top-24 animate-float opacity-40"
      />

      <div className="container-tai relative text-center">
        <span className="chip mx-auto rise">
          <Sparkles className="h-4 w-4 text-[var(--color-accent)]" />
          {HERO.eyebrow}
        </span>

        <h1 className="rise-hero mx-auto mt-6 max-w-4xl text-balance text-4xl font-bold leading-[1.05] md:text-6xl lg:text-7xl">
          Where are you on your{" "}
          <span className="text-gradient">TEFL journey?</span>
        </h1>

        <p
          className="rise mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-[var(--color-muted)] md:text-lg"
          style={{ animationDelay: "0.12s" }}
        >
          {HERO.subtitle}
        </p>

        <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
          {HERO.paths.map((p, i) => {
            const green = p.key === "experienced";
            return (
              <a
                key={p.key}
                href={p.href}
                className={`ring-card surface-card rise group flex flex-col gap-3 p-6 text-left ${green ? "ring-card-green" : ""}`}
                style={{ animationDelay: `${0.2 + i * 0.1}s` }}
              >
                <h3 className="text-lg font-semibold text-[var(--color-ink)]">
                  {p.title}
                </h3>
                <p className="text-sm leading-relaxed text-[var(--color-muted)]">
                  {p.text}
                </p>
                <span
                  className={`mt-2 inline-flex items-center gap-1.5 text-sm font-semibold ${green ? "accent-green" : "text-[var(--color-accent)]"}`}
                >
                  {p.cta}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
