import { DEFAULT_PROMPT, SAMPLE_PROMPTS } from "@/lib/constants";
import { getCachedFlowforgePipeline } from "@/pipeline/run-pipeline";
import { getCachedEvaluationSummary } from "@/evaluation/metrics";
import { FlowforgeDashboard } from "@/components/dashboard/flowforge-dashboard";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [initialRun, evaluation] = await Promise.all([
    getCachedFlowforgePipeline(DEFAULT_PROMPT),
    getCachedEvaluationSummary(),
  ]);

  return <FlowforgeDashboard initialRun={initialRun} evaluation={evaluation} samplePrompts={SAMPLE_PROMPTS} />;
}
