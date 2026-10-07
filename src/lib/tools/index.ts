import type { ToolHandler } from "./types";
import { lessonPlanGenerator } from "./lesson-plan-generator";
import { materialsAdaptor } from "./ai-materials-adaptor";
import { vlogScriptwriter } from "./travel-vlog-scriptwriter";
import { cvCoverLetter } from "./cv-cover-letter-generator";
import { cefrWritingGrader } from "./cefr-writing-grader";
import { countryEligibility } from "./country-eligibility";
import { earningProjection } from "./earning-projection";
import { careerRoadmap } from "./career-roadmap";
import { eltQuestions, eltAnalysis } from "./english-level-test";
import { teflCourseFinder } from "./tefl-course-finder";
import { ieltsSpeakingBandEstimator } from "./ielts-speaking-band-estimator";
import { speakingBandEstimator } from "./speaking-band-estimator";
import { ieltsWritingBandEstimator } from "./ielts-writing-band-estimator";
import { jobMarketExplorer } from "./job-market-explorer";
import { jobReadinessChecker } from "./job-readiness-checker";

/** Registry of all AI-tool handlers, keyed by their wp_ajax action name.
 *  The dispatcher at src/app/api/ai/route.ts looks handlers up here. */
const ALL: ToolHandler[] = [
  lessonPlanGenerator as ToolHandler,
  materialsAdaptor as ToolHandler,
  vlogScriptwriter as ToolHandler,
  cvCoverLetter as ToolHandler,
  cefrWritingGrader as ToolHandler,
  countryEligibility as ToolHandler,
  earningProjection as ToolHandler,
  careerRoadmap as ToolHandler,
  eltQuestions as ToolHandler,
  eltAnalysis as ToolHandler,
  teflCourseFinder as ToolHandler,
  ieltsSpeakingBandEstimator as ToolHandler,
  speakingBandEstimator as ToolHandler,
  ieltsWritingBandEstimator as ToolHandler,
  jobMarketExplorer as ToolHandler,
  jobReadinessChecker as ToolHandler,
];

export const TOOL_HANDLERS: Record<string, ToolHandler> = Object.fromEntries(
  ALL.map((h) => [h.action, h])
);

export function getHandler(action: string): ToolHandler | undefined {
  return TOOL_HANDLERS[action];
}
