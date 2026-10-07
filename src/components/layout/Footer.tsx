import Link from "next/link";
import { Instagram, Youtube, Twitter, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Sparkle } from "@/components/ui/Sparkle";
import { FOOTER_NAV, ACCREDITATIONS, SITE } from "@/lib/site";
import { NewsletterForm } from "./NewsletterForm";

const socialIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  Instagram,
  "Twitter (X)": Twitter,
  YouTube: Youtube,
};

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-24 border-t border-[var(--color-border)] bg-[var(--color-bg-soft)]">
      <div className="container-tai py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
          {/* Brand + newsletter */}
          <div>
            <Logo height={30} />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--color-muted)]">
              Accredited TEFL certification and a growing suite of free AI tools
              for English teachers — from lesson plans to career roadmaps.
            </p>
            <div className="mt-6 max-w-sm">
              <p className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--color-ink)]">
                <Sparkle size={14} /> Get teaching tips & new tools
              </p>
              <NewsletterForm />
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-ink)]">Explore</h3>
            <ul className="mt-4 space-y-2.5">
              {FOOTER_NAV.explore.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-[var(--color-muted)] transition hover:text-[var(--color-accent)]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Group */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-ink)]">
              TEFL Institute Group
            </h3>
            <ul className="mt-4 space-y-2.5">
              {FOOTER_NAV.group.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--color-muted)] transition hover:text-[var(--color-accent)]"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Accreditation */}
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)]">
              <ShieldCheck className="h-4 w-4 text-[var(--color-accent)]" /> Accredited & Approved
            </h3>
            <div className="mt-4 space-y-3">
              {ACCREDITATIONS.map((a) => (
                <a
                  key={a.name}
                  href={a.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="surface-card block rounded-xl px-4 py-3 transition hover:border-[var(--color-accent)]"
                >
                  <p className="text-sm font-semibold text-[var(--color-ink)]">
                    {a.name}
                  </p>
                  <p className="text-xs text-[var(--color-faint)]">{a.detail}</p>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-6 border-t border-[var(--color-border)] pt-8 md:flex-row">
          <p className="text-xs text-[var(--color-faint)]">
            © {year} {SITE.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {FOOTER_NAV.legal.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-xs text-[var(--color-muted)] transition hover:text-[var(--color-accent)]"
              >
                {l.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {FOOTER_NAV.social.map((s) => {
              const Icon = socialIcon[s.label] ?? Instagram;
              return (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-white/5 text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
