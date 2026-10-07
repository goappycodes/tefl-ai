import * as Icons from "lucide-react";
import type { LucideProps } from "lucide-react";

const registry = Icons as unknown as Record<
  string,
  React.ComponentType<LucideProps>
>;

/** Render a lucide-react icon by its string name (safe dynamic lookup). */
export function DynamicIcon({
  name,
  className,
  size,
}: {
  name: string;
  className?: string;
  size?: number;
}) {
  const Cmp = registry[name] ?? Icons.Sparkles;
  return <Cmp className={className} size={size} />;
}
