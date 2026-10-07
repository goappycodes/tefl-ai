import { toolBySlug } from "@/lib/site";
import { toolMetadata } from "@/lib/toolMeta";
import { ToolLanding } from "@/components/tools/ToolLanding";
import content from "@/content/tools/lesson-plan-generator";

export const metadata = toolMetadata("lesson-plan-generator");

export default function Page() {
  const tool = toolBySlug("lesson-plan-generator")!;
  return <ToolLanding content={content} tool={tool} />;
}
