"use client";

import { useState } from "react";
import { Send, Check, AlertCircle, Loader2 } from "lucide-react";
import { Field, TextInput, TextArea, Select } from "@/components/ui/form";
import { getRecaptchaToken } from "@/lib/recaptcha-client";

const ENQUIRY_TYPES = [
  "General enquiry",
  "Courses & certification",
  "AI tools",
  "Jobs & careers",
  "Partnerships",
  "Something else",
];

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", enquiryType: ENQUIRY_TYPES[0], message: "" });
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setState("error");
      setMsg("Please complete all required fields.");
      return;
    }
    setState("loading");
    try {
      const recaptchaToken = await getRecaptchaToken("contact");
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, recaptchaToken }),
      });
      const data = (await res.json()) as { success: boolean; error?: string };
      if (data.success) {
        setState("done");
        setMsg("Thank you! Your message has been sent — we'll be in touch soon.");
        setForm({ name: "", email: "", enquiryType: ENQUIRY_TYPES[0], message: "" });
      } else {
        setState("error");
        setMsg(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setState("error");
      setMsg("Network error. Please try again.");
    }
  }

  if (state === "done") {
    return (
      <div className="surface-card flex flex-col items-center gap-4 p-12 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(40,196,149,0.12)] text-[var(--color-success)]">
          <Check className="h-7 w-7" />
        </span>
        <h3 className="text-xl font-semibold">Message sent</h3>
        <p className="max-w-sm text-sm text-[var(--color-muted)]">{msg}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="surface-card space-y-5 p-6 md:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" htmlFor="name" required>
          <TextInput id="name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Jane Doe" required />
        </Field>
        <Field label="Email address" htmlFor="email" required>
          <TextInput id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" required />
        </Field>
      </div>
      <Field label="What's this about?" htmlFor="enquiryType" required>
        <Select id="enquiryType" value={form.enquiryType} onChange={(e) => set("enquiryType", e.target.value)}>
          {ENQUIRY_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </Select>
      </Field>
      <Field label="Message" htmlFor="message" required>
        <TextArea id="message" value={form.message} onChange={(e) => set("message", e.target.value)} placeholder="How can we help?" className="min-h-36" required />
      </Field>

      <button type="submit" disabled={state === "loading"} className="btn btn-primary w-full disabled:opacity-60">
        {state === "loading" ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
        ) : (
          <><Send className="h-4 w-4" /> Send message</>
        )}
      </button>

      {state === "error" && (
        <p className="flex items-center gap-2 text-sm text-[var(--color-danger)]">
          <AlertCircle className="h-4 w-4" /> {msg}
        </p>
      )}
    </form>
  );
}
