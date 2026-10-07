import { toolBySlug } from "@/lib/site";
import { toolTryMetadata } from "@/lib/toolMeta";
import { ToolShell } from "@/components/tools/ToolShell";
import { CefrWritingGraderTool } from "@/components/tools/clients/CefrWritingGraderTool";

export const metadata = toolTryMetadata("cefr-writing-grader");

export default function Page() {
  const tool = toolBySlug("cefr-writing-grader")!;
  return (
    <ToolShell tool={tool}>
      <CefrWritingGraderTool />
    </ToolShell>
  );
}
