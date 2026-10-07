import { toolBySlug } from "@/lib/site";
import { toolMetadata } from "@/lib/toolMeta";
import { ToolLanding } from "@/components/tools/ToolLanding";
import content from "@/content/tools/ai-ielts-speaking-band-estimator";

export const metadata = toolMetadata("ai-ielts-speaking-band-estimator");

export default function Page() {
  const tool = toolBySlug("ai-ielts-speaking-band-estimator")!;
  return <ToolLanding content={content} tool={tool} />;
}
