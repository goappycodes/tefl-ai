import { toolBySlug } from "@/lib/site";
import { toolMetadata } from "@/lib/toolMeta";
import { ToolShell } from "@/components/tools/ToolShell";
import { EnglishLevelTestTool } from "@/components/tools/clients/EnglishLevelTestTool";

export const metadata = toolMetadata("english-level-test");

export default function Page() {
  const tool = toolBySlug("english-level-test")!;
  return (
    <ToolShell tool={tool}>
      <EnglishLevelTestTool />
    </ToolShell>
  );
}
