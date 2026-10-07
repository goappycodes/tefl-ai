import { toolBySlug } from "@/lib/site";
import { toolMetadata } from "@/lib/toolMeta";
import { ToolLanding } from "@/components/tools/ToolLanding";
import content from "@/content/tools/cefr-writing-grader";

export const metadata = toolMetadata("cefr-writing-grader");

export default function Page() {
  const tool = toolBySlug("cefr-writing-grader")!;
  return <ToolLanding content={content} tool={tool} />;
}
