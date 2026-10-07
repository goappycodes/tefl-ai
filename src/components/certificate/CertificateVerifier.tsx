"use client";

import { useState } from "react";
import { BadgeCheck, Search, AlertCircle, Loader2, Calendar, User, GraduationCap, Hash } from "lucide-react";
import { TextInput } from "@/components/ui/form";

interface VerifiedCert {
  studentName: string;
  courseTitle: string;
  issueDate: string;
  certificateNumber: string;
}

export function CertificateVerifier() {
  const [number, setNumber] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "verified" | "error">("idle");
  const [cert, setCert] = useState<VerifiedCert | null>(null);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!number.trim()) {
      setState("error");
      setError("Please enter a certificate number.");
      return;
    }
    setState("loading");
    try {
      const res = await fetch("/api/verify-certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ certificateNumber: number.trim() }),
      });
      const data = (await res.json()) as
        | { success: true; data: VerifiedCert }
        | { success: false; error: string };
      if (data.success) {
        setCert(data.data);
        setState("verified");
      } else {
        setError(data.error);
        setState("error");
      }
    } catch {
      setError("Verification is temporarily unavailable. Please try again.");
      setState("error");
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <form onSubmit={onSubmit} className="surface-card p-6 md:p-8">
        <label htmlFor="cert" className="text-sm font-medium text-[var(--color-ink)]">
          Certificate number
        </label>
        <div className="mt-2 flex gap-2">
          <TextInput
            id="cert"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="TEFL-2026-00000"
            className="font-mono"
          />
          <button type="submit" disabled={state === "loading"} className="btn btn-primary flex-none !px-5">
            {state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Verify
          </button>
        </div>
        <p className="mt-2 text-xs text-[var(--color-faint)]">
          Find the number on the certificate, in the format TEFL-YYYY-XXXXX.
        </p>

        {state === "error" && (
          <p className="mt-4 flex items-center gap-2 text-sm text-[var(--color-danger)]">
            <AlertCircle className="h-4 w-4" /> {error}
          </p>
        )}
      </form>

      {state === "verified" && cert && (
        <div className="surface-card mt-6 overflow-hidden">
          <div className="flex items-center gap-3 border-b border-[var(--color-border)] bg-[rgba(40,196,149,0.08)] px-6 py-4">
            <BadgeCheck className="h-6 w-6 text-[var(--color-success)]" />
            <div>
              <p className="font-semibold text-[var(--color-success)]">Certificate verified</p>
              <p className="text-xs text-[var(--color-muted)]">This is a genuine TEFL.ai certificate.</p>
            </div>
          </div>
          <dl className="divide-y divide-[var(--color-border)] px-6">
            {[
              { icon: User, label: "Issued to", value: cert.studentName },
              { icon: GraduationCap, label: "Course", value: cert.courseTitle },
              { icon: Calendar, label: "Issue date", value: cert.issueDate },
              { icon: Hash, label: "Certificate no.", value: cert.certificateNumber },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-3 py-4">
                <row.icon className="h-4 w-4 flex-none text-[var(--color-accent)]" />
                <dt className="w-32 flex-none text-sm text-[var(--color-faint)]">{row.label}</dt>
                <dd className="text-sm font-medium text-[var(--color-ink)]">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}
