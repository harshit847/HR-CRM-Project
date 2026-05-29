"use client";

import { useEffect, useMemo, useState } from "react";
import type { BlueprintRun } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SamplePrompts } from "@/components/dashboard/sample-prompts";
import { RuntimePreview } from "@/components/dashboard/runtime-preview";
import { SchemaTabs } from "@/components/dashboard/schema-tabs";
import { JsonViewer } from "@/components/dashboard/json-viewer";
import { MetricsPanel } from "@/components/dashboard/metrics-panel";
import { StatusPill } from "@/components/dashboard/status-pill";
import { PIPELINE_STAGES } from "@/lib/constants";
import {
  ArrowRight,
  Boxes,
  ChevronRight,
  Clock3,
  History,
  LayoutDashboard,
  Loader2,
  Play,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import type { EvaluationSummary } from "@/evaluation/metrics";

type StageStatus = "done" | "running" | "pending" | "warning" | "repaired";

const stageMeta = {
  intent: LayoutDashboard,
  architecture: Boxes,
  schemas: Boxes,
  validation: ShieldCheck,
  repair: WandSparkles,
  runtime: Play,
  estimation: Clock3,
} as const;

function stageLabel(status: StageStatus) {
  if (status === "running") return "Streaming";
  if (status === "warning") return "Review";
  if (status === "repaired") return "Repaired";
  if (status === "done") return "Done";
  return "Queued";
}

function stageTone(status: StageStatus) {
  if (status === "running") return "warning" as const;
  if (status === "warning") return "warning" as const;
  if (status === "repaired") return "success" as const;
  if (status === "done") return "success" as const;
  return "muted" as const;
}

export function FlowforgeDashboard({
  initialRun,
  evaluation,
  samplePrompts,
}: {
  initialRun: BlueprintRun;
  evaluation: EvaluationSummary;
  samplePrompts: readonly string[];
}) {
  const [prompt, setPrompt] = useState(initialRun.prompt);
  const [run, setRun] = useState<BlueprintRun>(initialRun);
  const [activeSchemaTab, setActiveSchemaTab] = useState<"ui" | "api" | "db" | "auth">("ui");
  const [activePageId, setActivePageId] = useState(initialRun.schemas.ui[0]?.id ?? "dashboard");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStageIndex, setLoadingStageIndex] = useState(0);
  const [history, setHistory] = useState<string[]>([initialRun.prompt]);

  useEffect(() => {
    setActivePageId(run.schemas.ui[0]?.id ?? "dashboard");
  }, [run]);

  useEffect(() => {
    if (!isLoading) {
      setLoadingStageIndex(PIPELINE_STAGES.length - 1);
      return;
    }

    setLoadingStageIndex(0);
    const timer = window.setInterval(() => {
      setLoadingStageIndex((current) => Math.min(current + 1, PIPELINE_STAGES.length - 1));
    }, 260);

    return () => window.clearInterval(timer);
  }, [isLoading]);

  const metrics = useMemo(
    () => [
      { label: "Confidence", value: `${Math.round(run.intent.confidence * 100)}%` },
      { label: "Repairs", value: run.repairs.repairs.length },
      { label: "Latency", value: `${run.metrics.averageLatencyMs}ms` },
      { label: "Entities", value: run.intent.entities.length },
    ],
    [run],
  );

  const stageStates = useMemo(() => {
    return PIPELINE_STAGES.map((stage, index) => {
      if (isLoading) {
        if (index < loadingStageIndex) return "done" as StageStatus;
        if (index === loadingStageIndex) return "running" as StageStatus;
        return "pending" as StageStatus;
      }

      if (stage.id === "validation" && run.repairs.beforeValidation.issues.length > 0) {
        return run.repairs.repairs.length > 0 ? "warning" : "warning";
      }

      if (stage.id === "repair" && run.repairs.repairs.length > 0) {
        return "repaired";
      }

      return "done";
    });
  }, [isLoading, loadingStageIndex, run]);

  async function generateBlueprint(nextPrompt: string) {
    setIsLoading(true);
    setPrompt(nextPrompt);
    try {
      const response = await fetch("/api/blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: nextPrompt }),
      });

      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as { run: BlueprintRun };
      setRun(data.run);
      setActiveSchemaTab("ui");
      setActivePageId(data.run.schemas.ui[0]?.id ?? "dashboard");
      setHistory((current) => [nextPrompt, ...current.filter((item) => item !== nextPrompt)].slice(0, 6));
    } finally {
      setIsLoading(false);
    }
  }

  const validationSummary = run.repairs.beforeValidation;

  return (
    <main className="min-h-screen text-foreground">
      <div className="mx-auto max-w-[1680px] px-4 py-5 lg:px-6">
        <div className="mb-5 rounded-[28px] border border-border/70 bg-card/70 px-5 py-4 shadow-soft backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="muted">FlowForge AI</Badge>
                {isLoading ? <Badge tone="warning">Streaming</Badge> : <StatusPill status={run.validation.isValid ? "pass" : "fail"} />}
                <Badge tone="muted">{run.intent.appName}</Badge>
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight lg:text-5xl">
                AI systems engineering for software blueprints, runtime preview, and repair
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground lg:text-base">
                Turn a product prompt into a validated application blueprint with stage-by-stage intent extraction,
                architecture planning, schema generation, validation, repair, and live execution preview.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
              <div className="rounded-2xl border border-border/70 bg-background/60 px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Mode</div>
                <div className="mt-2 text-sm font-medium text-foreground">{isLoading ? "Streaming generation" : "Compiled run"}</div>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/60 px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Latency</div>
                <div className="mt-2 text-sm font-medium text-foreground">{run.metrics.averageLatencyMs}ms</div>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/60 px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Repairs</div>
                <div className="mt-2 text-sm font-medium text-foreground">{run.repairs.repairs.length}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)_440px] xl:items-start">
          <aside className="min-w-0 space-y-5">
            <Card className="overflow-hidden border-border/70 bg-card/70">
              <CardHeader className="border-b border-border/60">
                <CardTitle>Prompt Studio</CardTitle>
                <CardDescription>Write a requirement and run it through the compiler pipeline.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <Textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  className="min-h-[180px] border-border/70 bg-background/70"
                />
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={() => generateBlueprint(prompt)} disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    Build blueprint
                  </Button>
                  <Button variant="outline" onClick={() => setPrompt(initialRun.prompt)} disabled={isLoading}>
                    Reset
                  </Button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {metrics.map((metric) => (
                    <div key={metric.label} className="rounded-2xl border border-border/70 bg-background/50 px-3 py-2">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{metric.label}</div>
                      <div className="mt-1 text-sm font-semibold text-foreground">{metric.value}</div>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/40 p-3">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Prompt interpretation</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {run.intent.features.slice(0, 6).map((feature) => (
                      <Badge key={feature} tone="muted">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-3 space-y-3 text-sm">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Assumptions applied</div>
                      <ul className="mt-2 space-y-1 text-muted-foreground">
                        {run.intent.assumptions.length ? (
                          run.intent.assumptions.slice(0, 3).map((item) => (
                            <li key={item} className="break-words">
                              - {item}
                            </li>
                          ))
                        ) : (
                          <li> - No extra assumptions were needed.</li>
                        )}
                      </ul>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Conflicts detected</div>
                      <ul className="mt-2 space-y-1 text-muted-foreground">
                        {run.intent.conflicts.length ? (
                          run.intent.conflicts.slice(0, 3).map((item) => (
                            <li key={item} className="break-words">
                              - {item}
                            </li>
                          ))
                        ) : (
                          <li> - No major conflicts detected.</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-border/70 bg-card/70">
              <CardHeader className="border-b border-border/60">
                <CardTitle>Presets</CardTitle>
                <CardDescription>Click any preset to stream a new blueprint.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 pt-4">
                {samplePrompts.map((sample) => (
                  <Button
                    key={sample}
                    variant="secondary"
                    className="h-auto w-full justify-start whitespace-normal p-3 text-left"
                    onClick={() => generateBlueprint(sample)}
                    disabled={isLoading}
                  >
                    <ArrowRight className="h-4 w-4 shrink-0" />
                    {sample}
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-border/70 bg-card/70">
              <CardHeader className="border-b border-border/60">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <CardTitle>History</CardTitle>
                    <CardDescription>Recent prompts for quick reruns.</CardDescription>
                  </div>
                  <Badge tone="muted">{history.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 pt-4">
                {history.map((item, index) => (
                  <button
                    key={`${item}-${index}`}
                    onClick={() => setPrompt(item)}
                    className="flex w-full items-start gap-3 rounded-2xl border border-border/70 bg-background/50 px-3 py-3 text-left transition hover:border-border hover:bg-background/80"
                  >
                    <History className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-foreground">{item}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{index === 0 ? "Latest run" : "Previous run"}</div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </aside>

          <section className="min-w-0 space-y-5">
            <Card className="overflow-hidden border-border/70 bg-card/70">
              <CardHeader className="border-b border-border/60">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                      <Loader2 className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                      Pipeline Flow
                    </div>
                    <CardTitle className="mt-4 text-2xl">Prompt to runtime blueprint compiler</CardTitle>
                    <CardDescription className="mt-2 max-w-2xl">
                      The pipeline stays legible: prompt, intent, architecture, schemas, validation, repair, and runtime.
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="muted">{run.intent.entities.length} entities</Badge>
                    <Badge tone="muted">{run.intent.roles.length} roles</Badge>
                    <Badge tone="muted">{run.schemas.ui.length} screens</Badge>
                    <Badge tone="muted">{Math.round(run.intent.confidence * 100)}% confidence</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5 pt-5">
                <div className="rounded-3xl border border-border/70 bg-background/50 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="success">Prompt</Badge>
                    {PIPELINE_STAGES.map((stage, index) => (
                      <div key={stage.id} className="flex items-center gap-2">
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        <Badge tone={stageStates[index] === "running" ? "warning" : stageTone(stageStates[index])}>
                          {stage.label}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 h-px bg-border/70" />
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                    <div>
                      Current stage:{" "}
                      <span className="font-medium text-foreground">
                        {isLoading ? PIPELINE_STAGES[loadingStageIndex].label : "Runtime and delivery ready"}
                      </span>
                    </div>
                    <div>
                      Status:{" "}
                      <span className="font-medium text-foreground">
                        {isLoading ? "Streaming generation" : run.validation.isValid ? "Validated" : "Repair required"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  {PIPELINE_STAGES.map((stage, index) => {
                    const Icon = stageMeta[stage.id as keyof typeof stageMeta];
                    const status = stageStates[index];
                    return (
                      <div
                        key={stage.id}
                        className={`relative isolate flex min-h-[188px] flex-col overflow-hidden rounded-3xl border p-5 transition lg:col-span-1 ${
                          status === "running"
                            ? "border-blue-400/40 bg-blue-500/10 shadow-[0_0_0_1px_rgba(59,130,246,0.08)] glow-pulse"
                            : status === "warning"
                              ? "border-amber-400/30 bg-amber-500/8"
                              : status === "repaired"
                                ? "border-emerald-400/30 bg-emerald-500/8"
                                : "border-border/70 bg-background/50"
                        }`}
                      >
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${
                                status === "running"
                                  ? "border-blue-400/40 bg-blue-500/15 text-blue-200"
                                  : status === "warning"
                                    ? "border-amber-400/30 bg-amber-500/15 text-amber-200"
                                    : status === "repaired"
                                      ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-200"
                                      : "border-border/70 bg-card/70 text-foreground"
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-semibold leading-5 text-pretty text-foreground">{stage.label}</div>
                              <div className="mt-1 text-xs leading-5 text-pretty text-muted-foreground">{stage.subtitle}</div>
                            </div>
                          </div>
                          <Badge className="shrink-0" tone={stageTone(status)}>
                            {stageLabel(status)}
                          </Badge>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                          <span>{status === "running" ? "Streaming" : `Stage ${index + 1}`}</span>
                          <span>
                            {isLoading
                              ? `${180 + index * 24}ms`
                              : `${Math.max(12, Math.round(run.metrics.averageLatencyMs / 7 + index * 4))}ms`}
                          </span>
                        </div>

                        <div className="mt-auto pt-4">
                          <div className="h-1.5 rounded-full bg-border/60">
                            <div
                              className={`h-full rounded-full ${
                                status === "running"
                                  ? "w-2/3 animate-pulse bg-blue-400"
                                  : status === "warning"
                                    ? "w-full bg-amber-400"
                                    : status === "repaired"
                                      ? "w-full bg-emerald-400"
                                      : "w-full bg-sky-400"
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-3xl border border-border/70 bg-background/50 p-4">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Application</div>
                    <div className="mt-2 text-sm font-medium text-foreground">{run.intent.appName}</div>
                  </div>
                  <div className="rounded-3xl border border-border/70 bg-background/50 p-4">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Entities</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {run.intent.entities.slice(0, 4).map((entity) => (
                        <Badge key={entity}>{entity}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-3xl border border-border/70 bg-background/50 p-4">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Architecture</div>
                    <div className="mt-2 text-sm font-medium text-foreground">{run.architecture.modules.length} modules planned</div>
                  </div>
                  <div className="rounded-3xl border border-border/70 bg-background/50 p-4">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Execution</div>
                    <div className="mt-2 text-sm font-medium text-foreground">{run.schemas.ui.length} runtime screens</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <aside className="min-w-0 space-y-5">
            <RuntimePreview run={run} activePageId={activePageId} onPageChange={setActivePageId} />
          </aside>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            <Card className="overflow-hidden border-border/70 bg-card/70">
              <CardHeader className="border-b border-border/60">
                <CardTitle>Validation and Repair Trace</CardTitle>
                <CardDescription>Human-readable compiler diagnostics and repair notes.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 pt-4 xl:grid-cols-2">
                <div className="rounded-3xl border border-border/70 bg-background/50 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold text-foreground">Validation Log</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {validationSummary.issues.length} issue(s), {validationSummary.warnings.length} warning(s)
                      </div>
                    </div>
                    <Badge tone={validationSummary.issues.length ? "warning" : "success"}>
                      {validationSummary.issues.length ? "Detected" : "Clean"}
                    </Badge>
                  </div>
                  <div className="mt-4 space-y-3">
                    {validationSummary.checks.map((check) => (
                      <div key={check.id} className="rounded-2xl border border-border/70 bg-card/70 px-3 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 break-words text-sm font-medium text-foreground">{check.name}</div>
                          <Badge tone={check.status === "pass" ? "success" : check.status === "warn" ? "warning" : "danger"}>
                            {check.status}
                          </Badge>
                        </div>
                        <div className="mt-1 break-words text-xs leading-5 text-muted-foreground">{check.details}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-border/70 bg-background/50 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold text-foreground">Repair Log</div>
                      <div className="mt-1 text-xs text-muted-foreground">{run.repairs.repairs.length} targeted repair(s)</div>
                    </div>
                    <Badge tone={run.repairs.repairs.length ? "success" : "muted"}>
                      {run.repairs.repairs.length ? "Patched" : "None"}
                    </Badge>
                  </div>
                  <div className="mt-4 space-y-3">
                    {run.repairs.repairs.length ? (
                      run.repairs.repairs.map((repair) => (
                        <div key={`${repair.target}-${repair.patchSummary}`} className="rounded-2xl border border-border/70 bg-card/70 px-3 py-3">
                          <div className="break-words text-sm font-medium text-foreground">{repair.target}</div>
                          <div className="mt-1 break-words text-xs leading-5 text-muted-foreground">{repair.reason}</div>
                          <div className="mt-2 break-words text-xs uppercase tracking-[0.18em] text-emerald-300">{repair.patchSummary}</div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-border/70 bg-card/70 px-3 py-4 text-sm text-muted-foreground">
                        No repairs were needed for this run.
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-5">
            <MetricsPanel evaluation={evaluation} />
            <Card className="overflow-hidden border-border/70 bg-card/70">
              <CardHeader className="border-b border-border/60">
                <CardTitle>Generated Schemas</CardTitle>
                <CardDescription>Rendered late in the pipeline, after validation and repair.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <SchemaTabs run={run} activeTab={activeSchemaTab} onTabChange={setActiveSchemaTab} />
              </CardContent>
            </Card>
            <Card className="overflow-hidden border-border/70 bg-card/70">
              <CardHeader className="border-b border-border/60">
                <CardTitle>Blueprint Snapshot</CardTitle>
                <CardDescription>Intent and repair artifacts are available for audit.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <JsonViewer label="Intent" summary="Structured extraction from the prompt" value={run.intent} />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-5">
          <Card className="overflow-hidden border-border/70 bg-card/70">
            <CardHeader className="border-b border-border/60">
              <CardTitle>Runtime Execution Trace</CardTitle>
              <CardDescription>Stage-by-stage textual log from the most recent run.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2 rounded-3xl border border-border/70 bg-background/60 p-4 font-mono text-xs leading-6 text-foreground">
                {run.logs.map((log) => (
                  <div key={log} className="flex gap-3 break-words">
                    <span className="text-muted-foreground">-</span>
                    <span className="min-w-0 break-words">{log}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
