import { toolBySlug } from "@/lib/site";
import { toolTryMetadata } from "@/lib/toolMeta";
import { ToolShell } from "@/components/tools/ToolShell";
import { EarningProjectionTool } from "@/components/tools/clients/EarningProjectionTool";

export const metadata = toolTryMetadata("earning-projection");

export default function Page() {
  const tool = toolBySlug("earning-projection")!;
  return (
    <ToolShell tool={tool}>
      <EarningProjectionTool />
    </ToolShell>
  );
}
