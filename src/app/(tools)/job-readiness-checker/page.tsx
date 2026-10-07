import { toolBySlug } from "@/lib/site";
import { toolMetadata } from "@/lib/toolMeta";
import { ToolShell } from "@/components/tools/ToolShell";
import { JobReadinessCheckerTool } from "@/components/tools/clients/JobReadinessCheckerTool";

export const metadata = toolMetadata("job-readiness-checker");

export default function Page() {
  const tool = toolBySlug("job-readiness-checker")!;
  return (
    <ToolShell tool={tool}>
      <JobReadinessCheckerTool />
    </ToolShell>
  );
}
