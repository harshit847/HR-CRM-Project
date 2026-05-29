import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { EvaluationSummary } from "@/evaluation/metrics";

export function MetricsPanel({ evaluation }: { evaluation: EvaluationSummary }) {
  const metrics = [
    { label: "Success rate", value: `${Math.round(evaluation.successRate * 100)}%` },
    { label: "Avg retries", value: evaluation.averageRetries.toFixed(2) },
    { label: "Avg repairs", value: evaluation.averageRepairCount.toFixed(2) },
    { label: "Avg validation failures", value: evaluation.averageValidationFailures.toFixed(2) },
    { label: "Avg latency", value: `${Math.round(evaluation.averageLatencyMs)}ms` },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Evaluation Metrics</CardTitle>
          <Badge tone="muted">{evaluation.total} prompts</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-2xl border border-border bg-muted/20 p-3">
              <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{metric.label}</div>
              <div className="mt-2 text-xl font-semibold text-foreground">{metric.value}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
