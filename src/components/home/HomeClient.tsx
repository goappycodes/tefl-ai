"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  animate,
  AnimatePresence,
} from "framer-motion";
import { ArrowRight, Plus, Quote, Sparkles } from "lucide-react";
import { Sparkle } from "@/components/ui/Sparkle";
import { HERO, STATS, TESTIMONIALS, FAQS } from "@/content/home";

/* ---------------- Hero ---------------- */
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

        <h1
          className="rise mx-auto mt-6 max-w-4xl text-balance text-4xl font-bold leading-[1.05] md:text-6xl lg:text-7xl"
          style={{ animationDelay: "0.05s" }}
        >
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
          {HERO.paths.map((p, i) => (
            <a
              key={p.key}
              href={p.href}
              className="ring-card surface-card rise group flex flex-col gap-3 p-6 text-left"
              style={{ animationDelay: `${0.2 + i * 0.1}s` }}
            >
              <h3 className="text-lg font-semibold text-[var(--color-ink)]">
                {p.title}
              </h3>
              <p className="text-sm leading-relaxed text-[var(--color-muted)]">
                {p.text}
              </p>
              <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-accent)]">
                {p.cta}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Stats counter ---------------- */
function Stat({
  value,
  suffix,
  label,
  raw,
}: {
  value: number;
  suffix: string;
  label: string;
  raw?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, value, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) =>
        setDisplay(raw ? Math.round(v).toString() : Math.round(v).toLocaleString("en-IE")),
    });
    return controls.stop;
  }, [inView, value, mv, raw]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-gradient text-4xl font-bold md:text-5xl">
        {display}
        {suffix}
      </div>
      <div className="mt-2 text-sm text-[var(--color-muted)]">{label}</div>
    </div>
  );
}

export function StatsRow() {
  return (
    <div className="surface-card grid grid-cols-2 gap-8 rounded-[var(--radius-xl)] px-6 py-10 md:grid-cols-4">
      {STATS.map((s) => (
        <Stat key={s.label} {...s} />
      ))}
    </div>
  );
}

/* ---------------- Testimonials ---------------- */
export function Testimonials() {
  const [paused, setPaused] = useState(false);
  const row = [...TESTIMONIALS, ...TESTIMONIALS];
  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{
        maskImage:
          "linear-gradient(to right, transparent, #000 6%, #000 94%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, #000 6%, #000 94%, transparent)",
      }}
    >
      <div
        className="flex w-max gap-5"
        style={{
          animation: "tai-marquee 60s linear infinite",
          animationPlayState: paused ? "paused" : "running",
        }}
      >
        {row.map((t, i) => (
          <figure
            key={i}
            className="surface-card flex w-[340px] flex-none flex-col gap-4 p-6"
          >
            <Quote className="h-6 w-6 text-[var(--color-accent)]" />
            <blockquote className="text-sm leading-relaxed text-[var(--color-muted)]">
              “{t.quote}”
            </blockquote>
            <figcaption className="mt-auto flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand-gradient-soft)] text-sm font-semibold text-[var(--color-accent)]">
                {t.name[0]}
              </span>
              <span className="text-sm font-medium text-[var(--color-ink)]">
                {t.name}{" "}
                <span className="text-[var(--color-faint)]">· {t.location}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
      <style>{`@keyframes tai-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
    </div>
  );
}

/* ---------------- FAQ ---------------- */
export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mx-auto max-w-3xl divide-y divide-[var(--color-border)]">
      {FAQS.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.q} className="py-1">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 py-5 text-left"
              aria-expanded={isOpen}
            >
              <span className="text-base font-medium text-[var(--color-ink)] md:text-lg">
                {f.q}
              </span>
              <span
                className={`flex h-8 w-8 flex-none items-center justify-center rounded-full border border-[var(--color-border)] transition ${
                  isOpen ? "rotate-45 bg-[var(--brand-gradient-soft)] text-[var(--color-accent)]" : "text-[var(--color-muted)]"
                }`}
              >
                <Plus className="h-4 w-4" />
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="pb-5 pr-12 text-sm leading-relaxed text-[var(--color-muted)]">
                    {f.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
