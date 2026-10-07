import type { Metadata } from "next";
import { Mail, MessageSquare, Sparkles, ShieldCheck } from "lucide-react";
import { ContactForm } from "@/components/contact/ContactForm";
import { Sparkle } from "@/components/ui/Sparkle";
import { ACCREDITATIONS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with the TEFL.ai team — questions about courses, certifications, AI tools, jobs or partnerships.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <section className="relative overflow-hidden pt-28 md:pt-36">
        <Sparkle size={22} className="absolute left-[12%] top-28 animate-float opacity-50" />
        <div className="container-tai">
          <span className="eyebrow flex"><Sparkles className="h-3.5 w-3.5" /> Contact</span>
          <h1 className="mt-4 max-w-2xl text-balance text-4xl font-bold leading-[1.05] md:text-5xl">
            Let&apos;s talk about your <span className="text-gradient">TEFL journey</span>
          </h1>
          <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-[var(--color-muted)] md:text-lg">
            Whether it&apos;s a question about courses, the AI tools, or teaching abroad —
            our team is here to help.
          </p>
        </div>
      </section>

      <section className="container-tai mt-14">
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <ContactForm />

          <div className="space-y-5">
            <div className="surface-card p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand-gradient-soft)] text-[var(--color-accent)]">
                <MessageSquare className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-semibold">Quick answers</h3>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                Many questions are answered on the homepage FAQ and across our free AI
                tools — have a look before reaching out.
              </p>
            </div>

            <div className="surface-card p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand-gradient-soft)] text-[var(--color-accent)]">
                <Mail className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-semibold">Part of the TEFL Institute</h3>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                TEFL.ai is part of the TEFL Institute Group, a trusted leader in English
                teacher training since 2017.
              </p>
            </div>

            <div className="surface-card p-6">
              <h3 className="flex items-center gap-2 font-semibold">
                <ShieldCheck className="h-4 w-4 text-[var(--color-accent)]" /> Accredited & approved
              </h3>
              <div className="mt-3 space-y-2">
                {ACCREDITATIONS.map((a) => (
                  <div key={a.name} className="text-sm">
                    <span className="font-medium text-[var(--color-ink)]">{a.name}</span>
                    <span className="block text-xs text-[var(--color-faint)]">{a.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
