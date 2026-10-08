"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User } from "lucide-react";
import { SITE } from "@/lib/site";

interface Me {
  logged_in: boolean;
  display_name?: string;
  first_name?: string;
  avatar?: string;
  account_url?: string;
  logout_url?: string;
}

const ME_URL =
  process.env.NEXT_PUBLIC_WP_ME_URL || `${SITE.checkoutBase}/wp-json/teflai/v1/me`;
const ACCOUNT_URL = `${SITE.checkoutBase}/my-account/`;

/**
 * Reflects the WordPress login session in the header. Reads
 * /wp-json/teflai/v1/me with credentials. This lights up when the Next.js app
 * and WordPress share a cookie context (same domain, or a /wp-json proxy, or WP
 * on a subdomain with SameSite=None cookies). Otherwise it shows the logged-out
 * state gracefully.
 */
export function HeaderAuth({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    let active = true;
    fetch(ME_URL, { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: Me | null) => {
        if (active) setMe(d);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const loggedIn = me?.logged_in === true;
  const name = me?.first_name || me?.display_name || "My account";
  const accountUrl = me?.account_url || ACCOUNT_URL;

  if (variant === "mobile") {
    return (
      <div className="mt-4 flex flex-col gap-3 px-1">
        {loggedIn ? (
          <>
            <a href={accountUrl} className="btn btn-ghost">
              <User className="h-4 w-4" /> {name}&apos;s account
            </a>
            {me?.logout_url && (
              <a href={me.logout_url} className="text-center text-sm text-[var(--color-muted)]">
                Log out
              </a>
            )}
          </>
        ) : (
          <a href={accountUrl} className="btn btn-ghost">
            Log in
          </a>
        )}
        <Link href="/courses" className="btn btn-primary">
          Get Certified
        </Link>
      </div>
    );
  }

  return (
    <div className="hidden items-center gap-3 lg:flex">
      {loggedIn ? (
        <a
          href={accountUrl}
          className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white/5 py-1.5 pl-1.5 pr-3.5 text-sm font-medium text-[var(--color-ink)] transition hover:border-[var(--color-accent)]"
        >
          {me?.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={me.avatar} alt="" className="h-6 w-6 rounded-full" />
          ) : (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--brand-gradient-soft)] text-[var(--color-accent)]">
              <User className="h-3.5 w-3.5" />
            </span>
          )}
          {name}
        </a>
      ) : (
        <a
          href={accountUrl}
          className="text-sm font-medium text-[var(--color-muted)] transition hover:text-[var(--color-ink)]"
        >
          Log in
        </a>
      )}
      <Link href="/courses" className="btn btn-primary !py-2.5 !px-5 text-sm">
        Get Certified
      </Link>
    </div>
  );
}
