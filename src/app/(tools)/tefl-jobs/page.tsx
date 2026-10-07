import { toolBySlug } from "@/lib/site";
import { toolMetadata } from "@/lib/toolMeta";
import { ToolLanding } from "@/components/tools/ToolLanding";
import content from "@/content/tools/tefl-jobs";

export const metadata = toolMetadata("tefl-jobs");

export default function Page() {
  const tool = toolBySlug("tefl-jobs")!;
  return <ToolLanding content={content} tool={tool} />;
}
