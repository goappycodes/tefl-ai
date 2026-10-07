import { toolBySlug } from "@/lib/site";
import { toolMetadata } from "@/lib/toolMeta";
import { ToolShell } from "@/components/tools/ToolShell";
import { CountryEligibilityTool } from "@/components/tools/clients/CountryEligibilityTool";

export const metadata = toolMetadata("country-eligibility");

export default function Page() {
  const tool = toolBySlug("country-eligibility")!;
  return (
    <ToolShell tool={tool}>
      <CountryEligibilityTool />
    </ToolShell>
  );
}
