import { toolBySlug } from "@/lib/site";
import { toolMetadata } from "@/lib/toolMeta";
import { ToolLanding } from "@/components/tools/ToolLanding";
import content from "@/content/tools/earning-projection";

export const metadata = toolMetadata("earning-projection");

export default function Page() {
  const tool = toolBySlug("earning-projection")!;
  return <ToolLanding content={content} tool={tool} />;
}
