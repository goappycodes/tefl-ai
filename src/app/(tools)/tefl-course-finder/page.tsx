import { toolBySlug } from "@/lib/site";
import { toolMetadata } from "@/lib/toolMeta";
import { ToolShell } from "@/components/tools/ToolShell";
import { TeflCourseFinderTool } from "@/components/tools/clients/TeflCourseFinderTool";

export const metadata = toolMetadata("tefl-course-finder");

export default function Page() {
  const tool = toolBySlug("tefl-course-finder")!;
  return (
    <ToolShell tool={tool}>
      <TeflCourseFinderTool />
    </ToolShell>
  );
}
