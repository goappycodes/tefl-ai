import { toolBySlug } from "@/lib/site";
import { toolTryMetadata } from "@/lib/toolMeta";
import { ToolShell } from "@/components/tools/ToolShell";
import { JobMarketExplorerTool } from "@/components/tools/clients/JobMarketExplorerTool";

export const metadata = toolTryMetadata("tefl-jobs");

export default function Page() {
  const tool = toolBySlug("tefl-jobs")!;
  return (
    <ToolShell tool={tool}>
      <JobMarketExplorerTool />
    </ToolShell>
  );
}
