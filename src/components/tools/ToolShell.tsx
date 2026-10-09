import Link from "next/link";
import { ChevronRight, Sparkles, ShieldCheck, Zap } from "lucide-react";
import * as Icons from "lucide-react";
import { ToolCard } from "@/components/ui/ToolCard";
import { TOOLS, type AiTool } from "@/lib/site";

function TIcon({ name, className }: { name: string; className?: string }) {
  const Cmp =
    (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name] ??
    Icons.Sparkles;
  return <Cmp className={className} />;
}

export function ToolShell({
  tool,
  children,
}: {
  tool: AiTool;
  children: React.ReactNode;
}) {
  const related = TOOLS.filter(
    (t) => t.slug !== tool.slug && t.group === tool.group
  ).slice(0, 3);
  const fallback = TOOLS.filter((t) => t.slug !== tool.slug).slice(0, 3);
  const show = related.length ? related : fallback;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden pt-28 md:pt-32">
        <div className="container-tai">
          <nav className="flex items-center gap-1.5 text-xs text-[var(--color-faint)]">
            <Link href="/" className="hover:text-[var(--color-muted)]">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/ai-tool-overview" className="hover:text-[var(--color-muted)]">AI Tools</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-[var(--color-muted)]">{tool.short}</span>
          </nav>

          <div className="mt-8 flex flex-col items-start gap-5">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-gradient-soft)] text-[var(--color-accent)]">
              <TIcon name={tool.icon} className="h-7 w-7" />
            </span>
            <div>
              <span className="eyebrow flex">
                <Sparkles className="h-3.5 w-3.5" /> {tool.audience}
              </span>
              <h1 className="mt-3 max-w-3xl text-balance text-3xl font-bold leading-[1.1] md:text-5xl">
                {tool.title}
              </h1>
              <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-[var(--color-muted)] md:text-lg">
                {tool.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-[var(--color-muted)]">
              <span className="chip"><Zap className="h-4 w-4" /> Instant results</span>
              <span className="chip"><ShieldCheck className="h-4 w-4" /> Free · no sign-up</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tool body — id="tool-start" is the scroll target for reset ("New") */}
      <section id="tool-start" className="container-tai mt-12 scroll-mt-24">
        {children}
      </section>

      {/* Related tools */}
      <section className="container-tai mt-28">
        <h2 className="text-2xl font-semibold">More free AI tools</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {show.map((t) => (
            <ToolCard key={t.slug} tool={t} />
          ))}
        </div>
      </section>
    </>
  );
}
