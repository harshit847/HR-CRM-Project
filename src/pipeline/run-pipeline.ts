import { cache } from "react";
import { DEFAULT_PROMPT } from "@/lib/constants";
import type { BlueprintRun, DbTable, Intent, SchemaBundle } from "@/lib/types";
import { estimateProject } from "@/generators/estimation";
import { extractIntentWithModel } from "@/generators/intent";
import { planArchitecture } from "@/generators/architecture";
import { generateSchemas } from "@/generators/schema";
import { getEntityProfile } from "@/generators/library";
import { repairBlueprint } from "@/repair";
import { validateBlueprintSchemas } from "@/validators";

function buildMockRows(table: DbTable, index = 0) {
  const row: Record<string, string | number | boolean> = {};
  for (const column of table.columns) {
    if (column.name === "id") {
      row[column.name] = `${table.name.slice(0, 3)}_${index + 1}`;
    } else if (column.type === "number") {
      row[column.name] = (index + 1) * 1000;
    } else if (column.type === "boolean") {
      row[column.name] = index % 2 === 0;
    } else if (column.name.toLowerCase().includes("email")) {
      row[column.name] = `user${index + 1}@${table.name}.io`;
    } else if (column.name.toLowerCase().includes("date") || column.type === "datetime") {
      row[column.name] = `2026-05-${String(20 + index).padStart(2, "0")}T12:00:00Z`;
    } else if (column.name.toLowerCase().includes("status")) {
      row[column.name] = index % 2 === 0 ? "Active" : "Pending";
    } else {
      row[column.name] = `${column.name}-${index + 1}`;
    }
  }
  return row;
}

function buildRuntimeData(schemas: SchemaBundle, intent: Intent) {
  const runtimeData: Record<string, Array<Record<string, string | number | boolean>>> = {};
  for (const table of schemas.db) {
    const entityProfile = intent.entities.find((entity) => table.name === entity);
    const count = table.name === "metrics" ? 1 : entityProfile ? 3 : 2;
    runtimeData[table.name] = Array.from({ length: count }, (_, index) =>
      table.name === "metrics"
        ? {
            id: `metric_${index + 1}`,
            mrr: 24000 + index * 600,
            churn: 2.4,
            conversionRate: 6.1,
            createdAt: "2026-05-29T00:00:00Z",
          }
        : buildMockRows(table, index),
    );
  }

  for (const entity of intent.entities) {
    if (!runtimeData[entity]) {
      const profile = getEntityProfile(entity);
      runtimeData[entity] = [profile.sampleRow];
    }
  }
  return runtimeData;
}

export async function runFlowforgePipeline(prompt: string = DEFAULT_PROMPT): Promise<BlueprintRun> {
  const startedAt = Date.now();
  const logs: string[] = [];

  logs.push("Stage 1: Intent extraction started.");
  const intent = await extractIntentWithModel(prompt);
  logs.push(`Stage 1 complete. Found ${intent.entities.length} entity signal(s) and ${intent.features.length} feature signal(s).`);
  if (intent.assumptions.length) {
    logs.push(`Intent assumptions applied: ${intent.assumptions.slice(0, 3).join(" | ")}${intent.assumptions.length > 3 ? " ..." : ""}`);
  }
  if (intent.conflicts.length) {
    logs.push(`Intent conflict(s) detected: ${intent.conflicts.slice(0, 2).join(" | ")}${intent.conflicts.length > 2 ? " ..." : ""}`);
    logs.push("Proceeding with conservative defaults so the blueprint remains valid.");
  }

  logs.push("Stage 2: Architecture planning started.");
  const architecture = planArchitecture(intent);
  logs.push(`Stage 2 complete. Planned ${architecture.modules.length} module(s).`);

  logs.push("Stage 3: Schema generation started.");
  const schemas = generateSchemas(intent, architecture);
  logs.push(`Stage 3 complete. Emitted ${schemas.ui.length} UI page(s), ${schemas.api.length} endpoint(s), and ${schemas.db.length} table(s).`);

  logs.push("Stage 4: Validation started.");
  const validation = validateBlueprintSchemas(schemas);
  logs.push(validation.isValid ? "Stage 4 complete. Schema passed validation." : `Stage 4 complete. Found ${validation.issues.length} issue(s).`);

  logs.push("Stage 5: Repair started.");
  const repairs = validation.isValid ? repairBlueprint(schemas, validation) : repairBlueprint(schemas, validation);
  logs.push(
    repairs.repairs.length
      ? `Stage 5 complete. Applied ${repairs.repairs.length} targeted repair(s) across ${repairs.repairedSections.join(", ")}.`
      : "Stage 5 complete. No repairs required.",
  );

  logs.push("Stage 6: Runtime preview assembly started.");
  const runtimeData = buildRuntimeData(repairs.repairedBundle, intent);
  logs.push(`Stage 6 complete. Generated runtime rows for ${Object.keys(runtimeData).length} table(s).`);

  logs.push("Stage 7: Estimation started.");
  const estimation = estimateProject(intent);
  logs.push(`Stage 7 complete. Complexity classified as ${estimation.complexity}.`);

  const afterValidation = repairs.afterValidation;
  const latencyMs = Date.now() - startedAt;
  const repairCount = repairs.repairs.length;
  const validationFailures = validation.issues.length;
  const retries = repairCount > 0 ? 1 : 0;
  const successRate = afterValidation.isValid ? 1 : Math.max(0.45, 1 - afterValidation.issues.length * 0.1);

  const metrics = {
    successRate: Number(successRate.toFixed(2)),
    retries,
    repairCount,
    validationFailures,
    averageLatencyMs: latencyMs,
  };

  logs.push(`Pipeline finished in ${latencyMs}ms with ${metrics.successRate * 100}% success rate.`);

  return {
    prompt,
    intent,
    architecture,
    schemas: repairs.repairedBundle,
    validation: afterValidation,
    repairs,
    estimation,
    logs,
    metrics,
    runtimeData,
  };
}

export const getCachedFlowforgePipeline = cache(runFlowforgePipeline);
