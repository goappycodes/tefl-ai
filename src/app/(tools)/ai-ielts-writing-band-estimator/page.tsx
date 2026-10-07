import { toolBySlug } from "@/lib/site";
import { toolMetadata } from "@/lib/toolMeta";
import { ToolShell } from "@/components/tools/ToolShell";
import { IeltsWritingBandTool } from "@/components/tools/clients/IeltsWritingBandTool";

export const metadata = toolMetadata("ai-ielts-writing-band-estimator");

export default function Page() {
  const tool = toolBySlug("ai-ielts-writing-band-estimator")!;
  return (
    <ToolShell tool={tool}>
      <IeltsWritingBandTool />
    </ToolShell>
  );
}
