import { SITE, TOOLS, type ToolGroup } from "@/lib/site";

/**
 * /llms.txt — machine-readable site guide for AI agents and LLMs.
 * Spec: https://llmstxt.org/
 *
 * Generated dynamically so the base URL (SITE.url) and the AI-tool registry
 * stay in sync with the rest of the site — mirrors robots.ts / sitemap.ts.
 */

// Static file: no request-time work, safe to cache at the edge.
export const dynamic = "force-static";

const GROUP_LABELS: Record<ToolGroup, string> = {
  "new-teachers": "For new teachers",
  "experienced-teachers": "For experienced teachers",
  insights: "Market insights",
};

const GROUP_ORDER: ToolGroup[] = [
  "new-teachers",
  "experienced-teachers",
  "insights",
];

export function GET() {
  const base = SITE.url.replace(/\/$/, "");

  const lines: string[] = [];

  lines.push(`# ${SITE.name}`);
  lines.push("");
  lines.push(`> ${SITE.description}`);
  lines.push("");
  lines.push(
    `${SITE.name} offers accredited TEFL/TESOL certification alongside a suite of free, no-signup AI tools for English teachers — covering lesson planning, IELTS and CEFR assessment, career planning, job-market insights and more. The tools below run in the browser and return results instantly.`,
  );
  lines.push("");

  // --- AI tools, grouped by audience -------------------------------------
  for (const group of GROUP_ORDER) {
    const tools = TOOLS.filter((t) => t.group === group);
    if (tools.length === 0) continue;

    lines.push(`## AI tools — ${GROUP_LABELS[group]}`);
    lines.push("");
    for (const t of tools) {
      lines.push(`- [${t.title}](${base}/${t.slug}): ${t.tagline}`);
    }
    lines.push("");
  }

  // --- Certification & courses -------------------------------------------
  lines.push("## Certification & courses");
  lines.push("");
  lines.push(
    `- [TEFL courses](${base}/courses): Accredited TEFL/TESOL certification courses.`,
  );
  lines.push(
    `- [AI-Skilled Teacher Certificate](${base}/ai-skilled-teacher-certificate): Certification in using AI tools for English teaching.`,
  );
  lines.push(
    `- [Certificate verification](${base}/certificate-verification): Verify the authenticity of a TEFL.ai certificate.`,
  );
  lines.push("");

  // --- Resources ----------------------------------------------------------
  lines.push("## Resources");
  lines.push("");
  lines.push(
    `- [AI tool overview](${base}/ai-tool-overview): Browse all free AI tools for English teachers.`,
  );
  lines.push(
    `- [Blog](${base}/blog): Guides and articles on TEFL, teaching English and AI in the classroom.`,
  );
  lines.push(
    `- [Future of AI report](${base}/future-of-ai-report): Research on AI's impact on English language teaching.`,
  );
  lines.push(`- [Contact](${base}/contact): Get in touch with the TEFL.ai team.`);
  lines.push("");

  // --- Legal --------------------------------------------------------------
  lines.push("## Legal");
  lines.push("");
  lines.push(`- [Terms and conditions](${base}/terms-and-conditions)`);
  lines.push(`- [Privacy policy](${base}/privacy-policy)`);
  lines.push("");

  const body = lines.join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
