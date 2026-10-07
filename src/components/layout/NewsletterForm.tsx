"use client";

import { useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setState("error");
      setMsg("Please enter a valid email address.");
      return;
    }
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setState("done");
      setMsg("You're in! Check your inbox to confirm.");
      setEmail("");
    } catch {
      setState("error");
      setMsg("Something went wrong. Please try again.");
    }
  }

  if (state === "done") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-[rgba(40,196,149,0.3)] bg-[rgba(40,196,149,0.1)] px-4 py-3 text-sm text-[var(--color-success)]">
        <Check className="h-4 w-4" /> {msg}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          className="input-tai"
          aria-label="Email address"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="btn btn-primary flex-none !px-4"
          aria-label="Subscribe"
        >
          {state === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
        </button>
      </div>
      {state === "error" && (
        <p className="text-xs text-[var(--color-danger)]">{msg}</p>
      )}
    </form>
  );
}
