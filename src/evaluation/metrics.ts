import { cache } from "react";
import { EVALUATION_DATASET } from "@/evaluation/dataset";
import { runFlowforgePipeline } from "@/pipeline/run-pipeline";

export type EvaluationRow = {
  id: string;
  category: "real-world" | "edge-case";
  prompt: string;
  success: boolean;
  retries: number;
  repairCount: number;
  validationFailures: number;
  latencyMs: number;
};

export type EvaluationSummary = {
  total: number;
  successRate: number;
  averageRetries: number;
  averageRepairCount: number;
  averageValidationFailures: number;
  averageLatencyMs: number;
  rows: EvaluationRow[];
};

export async function evaluateFlowforgeDataset(): Promise<EvaluationSummary> {
  const rows: EvaluationRow[] = [];

  for (const item of EVALUATION_DATASET) {
    const result = await runFlowforgePipeline(item.prompt);
    rows.push({
      id: item.id,
      category: item.category,
      prompt: item.prompt,
      success: result.validation.isValid,
      retries: result.metrics.retries,
      repairCount: result.metrics.repairCount,
      validationFailures: result.metrics.validationFailures,
      latencyMs: result.metrics.averageLatencyMs,
    });
  }

  const total = rows.length;
  const summary = rows.reduce(
    (acc, row) => {
      acc.success += row.success ? 1 : 0;
      acc.retries += row.retries;
      acc.repairs += row.repairCount;
      acc.failures += row.validationFailures;
      acc.latency += row.latencyMs;
      return acc;
    },
    { success: 0, retries: 0, repairs: 0, failures: 0, latency: 0 },
  );

  return {
    total,
    successRate: Number((summary.success / total).toFixed(2)),
    averageRetries: Number((summary.retries / total).toFixed(2)),
    averageRepairCount: Number((summary.repairs / total).toFixed(2)),
    averageValidationFailures: Number((summary.failures / total).toFixed(2)),
    averageLatencyMs: Number((summary.latency / total).toFixed(2)),
    rows,
  };
}

export const getCachedEvaluationSummary = cache(evaluateFlowforgeDataset);
