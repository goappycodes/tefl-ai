import { toolBySlug } from "@/lib/site";
import { toolMetadata } from "@/lib/toolMeta";
import { ToolLanding } from "@/components/tools/ToolLanding";
import content from "@/content/tools/speaking-band-estimator";

export const metadata = toolMetadata("speaking-band-estimator");

export default function Page() {
  const tool = toolBySlug("speaking-band-estimator")!;
  return <ToolLanding content={content} tool={tool} />;
}
