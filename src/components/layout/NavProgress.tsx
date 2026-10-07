"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/** A lightweight top "snake" progress bar for client-side route transitions.
 *  Starts on internal link clicks, completes when the pathname changes. */
export function NavProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);

  // Start the bar when an internal link is clicked.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }
      const a = (e.target as HTMLElement | null)?.closest("a");
      if (!a) return;
      const href = a.getAttribute("href");
      const target = a.getAttribute("target");
      if (!href || href.startsWith("#") || target === "_blank") return;
      // Internal navigation only
      const isInternal = href.startsWith("/") && !href.startsWith("//");
      if (!isInternal) return;
      if (href === pathname) return;
      setActive(true);
    }
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [pathname]);

  // Complete the bar once the new route has rendered.
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setActive(false), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div className="nav-progress" data-active={active} aria-hidden="true">
      <div className="nav-progress__bar" />
    </div>
  );
}
