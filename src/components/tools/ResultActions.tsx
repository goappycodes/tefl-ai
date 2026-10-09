"use client";

import { useState } from "react";
import { Check, Copy, Printer, RotateCcw } from "lucide-react";
import { scrollToToolStart } from "@/components/tools/ScrollIntoViewOnMount";

export function ResultActions({
  getText,
  onReset,
  printTargetId,
}: {
  getText?: () => string;
  onReset?: () => void;
  printTargetId?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!getText) return;
    try {
      await navigator.clipboard.writeText(getText());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  function print() {
    if (printTargetId) {
      const el = document.getElementById(printTargetId);
      if (el) {
        const w = window.open("", "_blank", "width=800,height=900");
        if (w) {
          w.document.write(
            `<html><head><title>TEFL.ai</title><style>body{font-family:Inter,system-ui,sans-serif;color:#111;line-height:1.6;padding:40px;max-width:760px;margin:auto}h1,h2,h3{font-family:Poppins,system-ui,sans-serif}h3{margin-top:24px;border-bottom:1px solid #eee;padding-bottom:6px}ul{padding-left:20px}li{margin:6px 0}</style></head><body>${el.innerHTML}</body></html>`
          );
          w.document.close();
          w.focus();
          setTimeout(() => w.print(), 300);
          return;
        }
      }
    }
    window.print();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {getText && (
        <button type="button" onClick={copy} className="btn btn-ghost !py-2 !px-3.5 text-sm">
          {copied ? <Check className="h-4 w-4 text-[var(--color-success)]" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy"}
        </button>
      )}
      <button type="button" onClick={print} className="btn btn-ghost !py-2 !px-3.5 text-sm">
        <Printer className="h-4 w-4" /> Print / PDF
      </button>
      {onReset && (
        <button
          type="button"
          onClick={() => {
            onReset();
            scrollToToolStart();
          }}
          className="btn btn-ghost !py-2 !px-3.5 text-sm"
        >
          <RotateCcw className="h-4 w-4" /> New
        </button>
      )}
    </div>
  );
}
