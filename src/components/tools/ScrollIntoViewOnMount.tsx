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

/** Anchor id on the ToolShell body; TOOL_START_ID marks the top of the form. */
export const TOOL_START_ID = "tool-start";

/**
 * Scroll back to the top of the tool form — used when a tool is reset ("New"
 * / "Start again"), so the user lands at the start of the form rather than
 * wherever the result left them. Falls back to the page top.
 */
export function scrollToToolStart(offset = 90) {
  if (typeof window === "undefined") return;
  const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const behavior: ScrollBehavior = prefersReduced ? "auto" : "smooth";
  // Defer a frame so the form has re-rendered in place of the result.
  requestAnimationFrame(() => {
    const el = document.getElementById(TOOL_START_ID);
    const y = el ? el.getBoundingClientRect().top + window.scrollY - offset : 0;
    window.scrollTo({ top: Math.max(0, y), behavior });
  });
}
