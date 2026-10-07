import { toolBySlug } from "@/lib/site";
import { toolTryMetadata } from "@/lib/toolMeta";
import { ToolShell } from "@/components/tools/ToolShell";
import { IeltsSpeakingBandTool } from "@/components/tools/clients/IeltsSpeakingBandTool";

export const metadata = toolTryMetadata("ai-ielts-speaking-band-estimator");

export default function Page() {
  const tool = toolBySlug("ai-ielts-speaking-band-estimator")!;
  return (
    <ToolShell tool={tool}>
      <IeltsSpeakingBandTool />
    </ToolShell>
  );
}
