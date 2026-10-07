import { toolBySlug } from "@/lib/site";
import { toolMetadata } from "@/lib/toolMeta";
import { ToolLanding } from "@/components/tools/ToolLanding";
import content from "@/content/tools/cv-and-cover-letter-generator";

export const metadata = toolMetadata("cv-and-cover-letter-generator");

export default function Page() {
  const tool = toolBySlug("cv-and-cover-letter-generator")!;
  return <ToolLanding content={content} tool={tool} />;
}
