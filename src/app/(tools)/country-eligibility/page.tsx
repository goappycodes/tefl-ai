import { toolBySlug } from "@/lib/site";
import { toolMetadata } from "@/lib/toolMeta";
import { ToolLanding } from "@/components/tools/ToolLanding";
import content from "@/content/tools/country-eligibility";

export const metadata = toolMetadata("country-eligibility");

export default function Page() {
  const tool = toolBySlug("country-eligibility")!;
  return <ToolLanding content={content} tool={tool} />;
}
