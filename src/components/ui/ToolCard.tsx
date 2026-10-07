import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import * as Icons from "lucide-react";
import type { AiTool } from "@/lib/site";

function ToolIcon({ name, className }: { name: string; className?: string }) {
  const Cmp =
    (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name] ??
    Icons.Sparkles;
  return <Cmp className={className} />;
}

export function ToolCard({ tool }: { tool: AiTool }) {
  return (
    <Link
      href={`/${tool.slug}`}
      className="ring-card surface-card group relative flex flex-col gap-4 p-6"
    >
      <div className="flex items-start justify-between">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--brand-gradient-soft)] text-[var(--color-accent)]">
          <ToolIcon name={tool.icon} className="h-6 w-6" />
        </span>
        <ArrowUpRight className="h-5 w-5 text-[var(--color-faint)] transition group-hover:text-[var(--color-accent)]" />
      </div>
      <div>
        <h3 className="text-lg font-semibold leading-snug text-[var(--color-ink)]">
          {tool.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
          {tool.tagline}
        </p>
      </div>
      <span className="mt-auto inline-flex w-fit rounded-full bg-white/5 px-2.5 py-1 text-[0.7rem] font-medium text-[var(--color-faint)]">
        {tool.audience}
      </span>
    </Link>
  );
}
