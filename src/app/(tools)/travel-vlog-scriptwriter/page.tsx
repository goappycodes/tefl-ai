import { toolBySlug } from "@/lib/site";
import { toolMetadata } from "@/lib/toolMeta";
import { ToolLanding } from "@/components/tools/ToolLanding";
import content from "@/content/tools/travel-vlog-scriptwriter";

export const metadata = toolMetadata("travel-vlog-scriptwriter");

export default function Page() {
  const tool = toolBySlug("travel-vlog-scriptwriter")!;
  return <ToolLanding content={content} tool={tool} />;
}
