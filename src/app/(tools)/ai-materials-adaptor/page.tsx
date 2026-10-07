import { toolBySlug } from "@/lib/site";
import { toolMetadata } from "@/lib/toolMeta";
import { ToolShell } from "@/components/tools/ToolShell";
import { MaterialsAdaptorTool } from "@/components/tools/clients/MaterialsAdaptorTool";

export const metadata = toolMetadata("ai-materials-adaptor");

export default function Page() {
  const tool = toolBySlug("ai-materials-adaptor")!;
  return (
    <ToolShell tool={tool}>
      <MaterialsAdaptorTool />
    </ToolShell>
  );
}
