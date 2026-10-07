import { toolBySlug } from "@/lib/site";
import { toolTryMetadata } from "@/lib/toolMeta";
import { ToolShell } from "@/components/tools/ToolShell";
import { LessonPlanTool } from "@/components/tools/clients/LessonPlanTool";

export const metadata = toolTryMetadata("lesson-plan-generator");

export default function Page() {
  const tool = toolBySlug("lesson-plan-generator")!;
  return (
    <ToolShell tool={tool}>
      <LessonPlanTool />
    </ToolShell>
  );
}
