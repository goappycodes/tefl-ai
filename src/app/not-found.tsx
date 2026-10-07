import Link from "next/link";
import { Home, Sparkles } from "lucide-react";
import { Sparkle } from "@/components/ui/Sparkle";

export default function NotFound() {
  return (
    <section className="relative flex min-h-[70vh] items-center overflow-hidden pt-28">
      <Sparkle size={28} className="absolute left-[14%] top-32 animate-float opacity-50" />
      <Sparkle size={20} className="absolute right-[16%] top-48 animate-float opacity-40" />
      <div className="container-tai text-center">
        <p className="text-7xl font-bold text-gradient md:text-9xl">404</p>
        <h1 className="mt-4 text-2xl font-semibold md:text-3xl">This page took a gap year</h1>
        <p className="mx-auto mt-4 max-w-md text-[var(--color-muted)]">
          We couldn&apos;t find that page. Try our free AI tools, or head back home.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="btn btn-primary">
            <Home className="h-4 w-4" /> Back home
          </Link>
          <Link href="/ai-tool-overview" className="btn btn-ghost">
            <Sparkles className="h-4 w-4" /> Explore AI tools
          </Link>
        </div>
      </div>
    </section>
  );
}
