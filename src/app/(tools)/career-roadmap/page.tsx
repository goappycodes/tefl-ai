import { toolBySlug } from "@/lib/site";
import { toolMetadata } from "@/lib/toolMeta";
import { ToolLanding } from "@/components/tools/ToolLanding";
import content from "@/content/tools/career-roadmap";

export const metadata = toolMetadata("career-roadmap");

export default function Page() {
  const tool = toolBySlug("career-roadmap")!;
  return <ToolLanding content={content} tool={tool} />;
}
