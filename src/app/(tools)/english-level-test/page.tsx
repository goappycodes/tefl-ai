import { toolBySlug } from "@/lib/site";
import { toolMetadata } from "@/lib/toolMeta";
import { ToolLanding } from "@/components/tools/ToolLanding";
import content from "@/content/tools/english-level-test";

export const metadata = toolMetadata("english-level-test");

export default function Page() {
  const tool = toolBySlug("english-level-test")!;
  return <ToolLanding content={content} tool={tool} />;
}
