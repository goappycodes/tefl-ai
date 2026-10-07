"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, X, ArrowRight } from "lucide-react";
import * as Icons from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Sparkle } from "@/components/ui/Sparkle";
import {
  PRIMARY_NAV,
  TOOLS,
  toolsByGroup,
  GROUP_LABELS,
  SITE,
  type ToolGroup,
} from "@/lib/site";

const GROUP_ORDER: ToolGroup[] = [
  "new-teachers",
  "experienced-teachers",
  "insights",
];

function ToolIcon({ name, className }: { name: string; className?: string }) {
  const Cmp = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name] ?? Icons.Sparkles;
  return <Cmp className={className} />;
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMegaOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[100] transition-all duration-300 ${
        scrolled
          ? "border-b border-[var(--color-border)] bg-[rgba(6,9,18,0.96)] backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <div className="container-tai flex h-16 items-center justify-between gap-4 md:h-[72px]">
        <Logo priority height={28} />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {PRIMARY_NAV.map((item) =>
            item.mega ? (
              <div
                key={item.href}
                className="relative"
                onMouseEnter={() => setMegaOpen(true)}
                onMouseLeave={() => setMegaOpen(false)}
              >
                <Link
                  href={item.href}
                  className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-[var(--color-muted)] transition hover:text-[var(--color-ink)]"
                >
                  {item.label}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${megaOpen ? "rotate-180" : ""}`}
                  />
                </Link>
                <AnimatePresence>
                  {megaOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute left-1/2 top-full w-[min(92vw,860px)] -translate-x-1/2 pt-3"
                    >
                      <div className="grid grid-cols-3 gap-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[rgba(8,12,24,0.98)] p-4 shadow-[var(--shadow-card)] backdrop-blur-xl">
                        {GROUP_ORDER.map((g) => (
                          <div key={g} className="p-2">
                            <p className="mb-2 px-2 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-faint)]">
                              {GROUP_LABELS[g]}
                            </p>
                            <ul className="space-y-0.5">
                              {toolsByGroup(g).map((t) => (
                                <li key={t.slug}>
                                  <Link
                                    href={`/${t.slug}`}
                                    className="group flex items-center gap-2.5 rounded-xl px-2 py-2 transition hover:bg-white/5"
                                  >
                                    <span className="flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-[var(--brand-gradient-soft)] text-[var(--color-accent)]">
                                      <ToolIcon name={t.icon} className="h-4 w-4" />
                                    </span>
                                    <span className="text-sm font-medium leading-tight text-[var(--color-muted)] group-hover:text-[var(--color-ink)]">
                                      {t.short}
                                    </span>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                        <div className="col-span-3 mt-1 flex items-center justify-between rounded-xl bg-[var(--brand-gradient-soft)] px-4 py-3">
                          <span className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
                            <Sparkle size={16} />
                            {TOOLS.length} free AI tools for English teachers
                          </span>
                          <Link
                            href="/ai-tool-overview"
                            className="flex items-center gap-1 text-sm font-semibold text-[var(--color-accent)]"
                          >
                            View all <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition hover:text-[var(--color-ink)] ${
                  pathname === item.href
                    ? "text-[var(--color-ink)]"
                    : "text-[var(--color-muted)]"
                }`}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={`${SITE.checkoutBase}/my-account/`}
            className="text-sm font-medium text-[var(--color-muted)] transition hover:text-[var(--color-ink)]"
          >
            Log in
          </a>
          <Link href="/courses" className="btn btn-primary !py-2.5 !px-5 text-sm">
            Get Certified
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setMobileOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-border)] bg-white/5 lg:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{ willChange: "transform, opacity" }}
            className="fixed inset-0 top-16 z-[90] overflow-y-auto overscroll-contain bg-[rgba(6,9,18,0.98)] px-5 pb-24 pt-4 backdrop-blur-xl lg:hidden"
          >
            <nav className="flex flex-col gap-1">
              {PRIMARY_NAV.filter((i) => !i.mega).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-xl px-3 py-3 text-base font-medium text-[var(--color-ink)] hover:bg-white/5"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4">
              <p className="px-3 pb-2 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-faint)]">
                AI Tools
              </p>
              {GROUP_ORDER.map((g) => (
                <div key={g} className="mb-3">
                  <p className="px-3 pb-1 text-xs font-medium text-[var(--color-accent)]">
                    {GROUP_LABELS[g]}
                  </p>
                  <div className="grid grid-cols-1 gap-0.5">
                    {toolsByGroup(g).map((t) => (
                      <Link
                        key={t.slug}
                        href={`/${t.slug}`}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5"
                      >
                        <span className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-[var(--brand-gradient-soft)] text-[var(--color-accent)]">
                          <ToolIcon name={t.icon} className="h-4 w-4" />
                        </span>
                        <span className="text-sm text-[var(--color-muted)]">
                          {t.short}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-3 px-1">
              <a href={`${SITE.checkoutBase}/my-account/`} className="btn btn-ghost">
                Log in
              </a>
              <Link href="/courses" className="btn btn-primary">
                Get Certified
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
