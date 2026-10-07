import { toolBySlug } from "@/lib/site";
import { toolMetadata } from "@/lib/toolMeta";
import { ToolShell } from "@/components/tools/ToolShell";
import { CvCoverLetterTool } from "@/components/tools/clients/CvCoverLetterTool";

export const metadata = toolMetadata("cv-and-cover-letter-generator");

export default function Page() {
  const tool = toolBySlug("cv-and-cover-letter-generator")!;
  return (
    <ToolShell tool={tool}>
      <CvCoverLetterTool />
    </ToolShell>
  );
}
