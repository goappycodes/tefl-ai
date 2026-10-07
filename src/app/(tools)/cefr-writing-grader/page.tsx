import { toolBySlug } from "@/lib/site";
import { toolMetadata } from "@/lib/toolMeta";
import { ToolShell } from "@/components/tools/ToolShell";
import { CefrWritingGraderTool } from "@/components/tools/clients/CefrWritingGraderTool";

export const metadata = toolMetadata("cefr-writing-grader");

export default function Page() {
  const tool = toolBySlug("cefr-writing-grader")!;
  return (
    <ToolShell tool={tool}>
      <CefrWritingGraderTool />
    </ToolShell>
  );
}
