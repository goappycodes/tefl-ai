import { toolBySlug } from "@/lib/site";
import { toolMetadata } from "@/lib/toolMeta";
import { ToolLanding } from "@/components/tools/ToolLanding";
import content from "@/content/tools/job-readiness-checker";

export const metadata = toolMetadata("job-readiness-checker");

export default function Page() {
  const tool = toolBySlug("job-readiness-checker")!;
  return <ToolLanding content={content} tool={tool} />;
}
