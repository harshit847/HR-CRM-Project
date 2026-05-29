import type { ApiEndpoint, DbColumn, DbTable, RepairAction, RepairResult, SchemaBundle, ValidationIssue, ValidationResult } from "@/lib/types";
import { validateBlueprintSchemas } from "@/validators";
import { slugify } from "@/lib/utils";

function cloneBundle(bundle: SchemaBundle): SchemaBundle {
  return {
    ui: structuredClone(bundle.ui),
    api: structuredClone(bundle.api),
    db: structuredClone(bundle.db),
    auth: structuredClone(bundle.auth),
  };
}

function findTable(db: DbTable[], name: string) {
  return db.find((table) => table.name === slugify(name));
}

function ensureTable(db: DbTable[], tableName: string) {
  const normalized = slugify(tableName);
  const existing = findTable(db, normalized);
  if (existing) return existing;
  const table: DbTable = {
    name: normalized,
    columns: [
      { name: "id", type: "string", required: true, unique: true },
      { name: "createdAt", type: "datetime", required: true },
      { name: "updatedAt", type: "datetime", required: true },
    ],
    relations: [],
  };
  db.push(table);
  return table;
}

function addColumn(table: DbTable, column: DbColumn) {
  if (!table.columns.some((item) => item.name === column.name)) {
    table.columns.push(column);
  }
}

function addEndpoint(api: ApiEndpoint[], endpoint: ApiEndpoint) {
  if (!api.some((item) => item.path === endpoint.path && item.method === endpoint.method)) {
    api.push(endpoint);
  }
}

function issueKey(issue: ValidationIssue) {
  return `${issue.code}:${issue.target}`;
}

export function repairBlueprint(bundle: SchemaBundle, validation: ValidationResult): RepairResult {
  const next = cloneBundle(bundle);
  const repairs: RepairAction[] = [];
  const repairedSections = new Set<string>();

  for (const issue of validation.issues) {
    const before = structuredClone(next);

    if (issue.code === "MISSING_TABLE" || issue.code === "UI_FIELD_MISSING_IN_DB" || issue.code === "MISSING_DB_FIELD" || issue.code === "BROKEN_RELATION") {
      const tableName = issue.metadata?.table || issue.metadata?.entity || issue.target.split(":")[0];
      const table = ensureTable(next.db, tableName);

      if (issue.code === "UI_FIELD_MISSING_IN_DB" || issue.code === "MISSING_DB_FIELD") {
        const field = issue.metadata?.field || issue.target.split(":").pop() || "value";
        addColumn(table, {
          name: field,
          type: field.toLowerCase().includes("date") ? "datetime" : field.toLowerCase().includes("amount") || field.toLowerCase().includes("price") ? "number" : "string",
          required: false,
        });
      }

      if (issue.code === "BROKEN_RELATION") {
        const foreignKey = issue.metadata?.foreignKey || "relatedId";
        addColumn(table, {
          name: foreignKey,
          type: "string",
          required: false,
        });
      }

      if (issue.code === "MISSING_TABLE" && issue.metadata?.entity === "metrics") {
        table.name = "metrics";
        table.columns = [
          { name: "id", type: "string", required: true, unique: true },
          { name: "mrr", type: "number", required: true },
          { name: "churn", type: "number", required: true },
          { name: "conversionRate", type: "number", required: true },
          { name: "createdAt", type: "datetime", required: true },
        ];
      }

      if (issue.metadata?.entity === "subscriptions" || issue.target.includes("billing")) {
        const subscriptions = ensureTable(next.db, "subscriptions");
        addColumn(subscriptions, { name: "billingStatus", type: "string", required: false });
      }

      repairs.push({
        target: issue.target,
        reason: issue.message,
        before,
        after: structuredClone(next),
        patchSummary: `Patched database schema for ${issue.target}.`,
      });
      repairedSections.add("db");
    }

    if (issue.code === "MISSING_PERMISSION") {
      const role = next.auth.roles.find((item) => item.role === issue.metadata?.role);
      if (role && issue.metadata?.permission) {
        if (!role.permissions.includes(issue.metadata.permission)) {
          role.permissions.push(issue.metadata.permission);
        }
      }
      repairs.push({
        target: issue.target,
        reason: issue.message,
        before,
        after: structuredClone(next),
        patchSummary: `Updated role permissions for ${issue.target}.`,
      });
      repairedSections.add("auth");
    }

    if (issue.code === "AUTH_INCONSISTENCY") {
      if (!next.auth.loginMethods.length) {
        next.auth.loginMethods.push("email/password");
      }
      repairs.push({
        target: issue.target,
        reason: issue.message,
        before,
        after: structuredClone(next),
        patchSummary: "Added a login method to resolve auth mismatch.",
      });
      repairedSections.add("auth");
    }

    if (issue.code === "MISSING_ENDPOINT") {
      const entity = issue.metadata?.entity || issue.target;
      addEndpoint(next.api, {
        id: `${slugify(entity)}-repair`,
        path: `/api/${slugify(entity)}`,
        method: "POST",
        description: `Repair-generated endpoint for ${entity}.`,
        authRequired: true,
        entity,
        requestFields: ["name"],
        responseFields: ["id"],
      });
      repairs.push({
        target: issue.target,
        reason: issue.message,
        before,
        after: structuredClone(next),
        patchSummary: `Created missing endpoint for ${entity}.`,
      });
      repairedSections.add("api");
    }
  }

  const afterValidation = validateBlueprintSchemas(next);
  return {
    repairs,
    repairedSections: [...repairedSections],
    beforeValidation: validation,
    afterValidation,
    repairedBundle: next,
  };
}
