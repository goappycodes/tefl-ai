"use client";

import { useEffect, useRef } from "react";

/**
 * Drop this at the very top of a tool's result block. When the result renders
 * (i.e. this mounts), the page smoothly scrolls so the result is at the top of
 * the viewport (accounting for the sticky header). Improves UX on every tool —
 * the user is taken straight to their generated result.
 */
export function ScrollIntoViewOnMount({ offset = 90 }: { offset?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined") return;
    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const y = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(0, y), behavior: prefersReduced ? "auto" : "smooth" });
  }, []);
  return <div ref={ref} aria-hidden="true" className="scroll-mt-24" />;
}
