import { toolBySlug } from "@/lib/site";
import { toolMetadata } from "@/lib/toolMeta";
import { ToolShell } from "@/components/tools/ToolShell";
import { VlogScriptwriterTool } from "@/components/tools/clients/VlogScriptwriterTool";

export const metadata = toolMetadata("travel-vlog-scriptwriter");

export default function Page() {
  const tool = toolBySlug("travel-vlog-scriptwriter")!;
  return (
    <ToolShell tool={tool}>
      <VlogScriptwriterTool />
    </ToolShell>
  );
}
