"use client";

import { useState } from "react";
import { Check, Copy, FileText, Printer, RotateCcw } from "lucide-react";
import { scrollToToolStart } from "@/components/tools/ScrollIntoViewOnMount";

const PRINT_CSS = `body{font-family:Calibri,Inter,Arial,sans-serif;color:#111;line-height:1.6;padding:40px;max-width:760px;margin:auto}h1,h2,h3,h4{font-family:Calibri,Poppins,Arial,sans-serif;color:#0a1929}h3{margin-top:22px;border-bottom:1px solid #e5e7eb;padding-bottom:6px}ul,ol{padding-left:20px}li{margin:6px 0}table{border-collapse:collapse;width:100%}th,td{border:1px solid #d5dbdf;padding:8px 10px;text-align:left}`;

export function ResultActions({
  getText,
  onReset,
  printTargetId,
  fileName = "tefl-ai-result",
}: {
  getText?: () => string;
  onReset?: () => void;
  printTargetId?: string;
  fileName?: string;
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

  function resultHtml(): string {
    if (printTargetId) {
      const el = document.getElementById(printTargetId);
      if (el) return el.innerHTML;
    }
    const text = getText ? getText() : "";
    const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return `<pre style="white-space:pre-wrap;font-family:inherit">${escaped}</pre>`;
  }

  function print() {
    const w = window.open("", "_blank", "width=800,height=900");
    if (!w) {
      window.print();
      return;
    }
    w.document.write(
      `<html><head><meta charset="utf-8"><title>TEFL.ai</title><style>${PRINT_CSS}</style></head><body>${resultHtml()}</body></html>`
    );
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  }

  function downloadWord() {
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>TEFL.ai</title><style>${PRINT_CSS}</style></head><body>${resultHtml()}</body></html>`;
    const blob = new Blob(["﻿", html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.doc`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  const btn = "btn btn-ghost !py-2 !px-3.5 text-sm";
  const canExport = Boolean(printTargetId || getText);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {getText && (
        <button type="button" onClick={copy} className={btn}>
          {copied ? <Check className="h-4 w-4 text-[var(--color-success)]" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy"}
        </button>
      )}
      {canExport && (
        <button type="button" onClick={downloadWord} className={btn}>
          <FileText className="h-4 w-4" /> Word
        </button>
      )}
      <button type="button" onClick={print} className={btn}>
        <Printer className="h-4 w-4" /> Print / PDF
      </button>
      {onReset && (
        <button
          type="button"
          onClick={() => {
            onReset();
            scrollToToolStart();
          }}
          className={btn}
        >
          <RotateCcw className="h-4 w-4" /> New
        </button>
      )}
    </div>
  );
}
