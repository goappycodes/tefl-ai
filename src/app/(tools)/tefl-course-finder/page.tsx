import { toolBySlug } from "@/lib/site";
import { toolMetadata } from "@/lib/toolMeta";
import { ToolLanding } from "@/components/tools/ToolLanding";
import content from "@/content/tools/tefl-course-finder";

export const metadata = toolMetadata("tefl-course-finder");

export default function Page() {
  const tool = toolBySlug("tefl-course-finder")!;
  return <ToolLanding content={content} tool={tool} />;
}
