import { toolBySlug } from "@/lib/site";
import { toolTryMetadata } from "@/lib/toolMeta";
import { ToolShell } from "@/components/tools/ToolShell";
import { SpeakingBandTool } from "@/components/tools/clients/SpeakingBandTool";

export const metadata = toolTryMetadata("speaking-band-estimator");

export default function Page() {
  const tool = toolBySlug("speaking-band-estimator")!;
  return (
    <ToolShell tool={tool}>
      <SpeakingBandTool />
    </ToolShell>
  );
}
