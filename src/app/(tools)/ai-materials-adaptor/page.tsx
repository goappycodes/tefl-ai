import { toolBySlug } from "@/lib/site";
import { toolMetadata } from "@/lib/toolMeta";
import { ToolLanding } from "@/components/tools/ToolLanding";
import content from "@/content/tools/ai-materials-adaptor";

export const metadata = toolMetadata("ai-materials-adaptor");

export default function Page() {
  const tool = toolBySlug("ai-materials-adaptor")!;
  return <ToolLanding content={content} tool={tool} />;
}
