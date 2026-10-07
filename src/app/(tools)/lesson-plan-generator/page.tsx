import { toolBySlug } from "@/lib/site";
import { toolMetadata } from "@/lib/toolMeta";
import { ToolShell } from "@/components/tools/ToolShell";
import { LessonPlanTool } from "@/components/tools/clients/LessonPlanTool";

export const metadata = toolMetadata("lesson-plan-generator");

export default function Page() {
  const tool = toolBySlug("lesson-plan-generator")!;
  return (
    <ToolShell tool={tool}>
      <LessonPlanTool />
    </ToolShell>
  );
}
