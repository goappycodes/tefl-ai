import { toolBySlug } from "@/lib/site";
import { toolTryMetadata } from "@/lib/toolMeta";
import { ToolShell } from "@/components/tools/ToolShell";
import { CareerRoadmapTool } from "@/components/tools/clients/CareerRoadmapTool";

export const metadata = toolTryMetadata("career-roadmap");

export default function Page() {
  const tool = toolBySlug("career-roadmap")!;
  return (
    <ToolShell tool={tool}>
      <CareerRoadmapTool />
    </ToolShell>
  );
}
