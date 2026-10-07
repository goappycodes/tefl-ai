"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import type { ToolFaq } from "@/content/tools/types";

export function FaqList({ faqs }: { faqs: ToolFaq[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mx-auto max-w-3xl divide-y divide-[var(--color-border)]">
      {faqs.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className="py-1">
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
                  isOpen
                    ? "rotate-45 bg-[var(--brand-gradient-soft)] text-[var(--color-accent)]"
                    : "text-[var(--color-muted)]"
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
