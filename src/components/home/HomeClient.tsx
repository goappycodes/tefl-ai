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
import { Plus, Quote } from "lucide-react";
import { STATS, TESTIMONIALS, FAQS } from "@/content/home";

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
