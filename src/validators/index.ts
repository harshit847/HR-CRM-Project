import type { ApiEndpoint, AuthSchema, DbTable, SchemaBundle, ValidationCheck, ValidationIssue, ValidationResult, UiPage } from "@/lib/types";
import { slugify } from "@/lib/utils";

function getTable(db: DbTable[], name: string) {
  return db.find((table) => table.name === name);
}

function tableHasColumn(table: DbTable | undefined, column: string) {
  return Boolean(table?.columns.find((item) => item.name === column));
}

function checkUiAgainstDb(ui: UiPage[], db: DbTable[]) {
  const issues: ValidationIssue[] = [];
  for (const page of ui) {
    for (const component of page.components) {
      if (!component.entity) continue;
      const table = getTable(db, slugify(component.entity));
      if (!table) {
        issues.push({
          code: "MISSING_TABLE",
          severity: "error",
          target: component.entity,
          message: `UI component "${component.title}" references ${component.entity}, but the database has no matching table.`,
          fixHint: `Add a ${component.entity} table or adjust the UI component to a supported entity.`,
          metadata: { entity: component.entity, source: page.route },
        });
        continue;
      }

      if (component.type === "form") {
        const fields = Array.isArray(component.props.fields) ? component.props.fields : [];
        for (const field of fields) {
          if (!tableHasColumn(table, String(field))) {
            issues.push({
              code: "UI_FIELD_MISSING_IN_DB",
              severity: "error",
              target: `${page.route}:${component.id}`,
              message: `Form field "${String(field)}" is missing from ${table.name}.`,
              fixHint: `Add column "${String(field)}" to ${table.name} or remove it from the form.`,
              metadata: { table: table.name, field: String(field) },
            });
          }
        }
      }
    }
  }
  return issues;
}

function checkApiAgainstDb(api: ApiEndpoint[], db: DbTable[]) {
  const issues: ValidationIssue[] = [];
  for (const endpoint of api) {
    if (!endpoint.entity) continue;
    const table = getTable(db, slugify(endpoint.entity));
    if (!table) {
      issues.push({
        code: "MISSING_TABLE",
        severity: "error",
        target: endpoint.entity,
        message: `Endpoint ${endpoint.path} references missing table ${endpoint.entity}.`,
        fixHint: `Create the ${endpoint.entity} table or remove the endpoint.`,
        metadata: { entity: endpoint.entity, endpoint: endpoint.path },
      });
      continue;
    }

    for (const field of endpoint.requestFields) {
      if (!tableHasColumn(table, field) && !["id"].includes(field)) {
        issues.push({
          code: "MISSING_DB_FIELD",
          severity: "error",
          target: `${endpoint.path}:${field}`,
          message: `Endpoint ${endpoint.path} expects "${field}" but ${table.name} does not define it.`,
          fixHint: `Add "${field}" to ${table.name} or change the endpoint contract.`,
          metadata: { table: table.name, field, endpoint: endpoint.path },
        });
      }
    }
  }
  return issues;
}

function checkRelations(db: DbTable[]) {
  const issues: ValidationIssue[] = [];
  for (const table of db) {
    for (const relation of table.relations) {
      const sourceColumn = table.columns.find((column) => column.name === relation.foreignKey);
      const targetTable = getTable(db, relation.targetTable);
      if (!sourceColumn || !targetTable) {
        issues.push({
          code: "BROKEN_RELATION",
          severity: "error",
          target: `${table.name}.${relation.name}`,
          message: `Relation ${relation.name} cannot be resolved.`,
          fixHint: `Ensure ${table.name}.${relation.foreignKey} and ${relation.targetTable} both exist.`,
          metadata: { table: table.name, targetTable: relation.targetTable, foreignKey: relation.foreignKey },
        });
      }
    }
  }
  return issues;
}

function checkAuth(auth: AuthSchema, api: ApiEndpoint[]) {
  const issues: ValidationIssue[] = [];
  const admin = auth.roles.find((role) => role.role === "admin");
  if (admin && !admin.permissions.includes("view:analytics") && api.some((endpoint) => endpoint.path.includes("analytics"))) {
    issues.push({
      code: "MISSING_PERMISSION",
      severity: "error",
      target: "admin",
      message: "Admin role cannot read analytics endpoints.",
      fixHint: "Add view:analytics to the admin permission set.",
      metadata: { role: "admin", permission: "view:analytics" },
    });
  }

  if (api.some((endpoint) => endpoint.authRequired) && !auth.loginMethods.length) {
    issues.push({
      code: "AUTH_INCONSISTENCY",
      severity: "error",
      target: "auth",
      message: "Authenticated endpoints exist, but the auth schema does not define a login method.",
      fixHint: "Declare a login strategy and methods.",
      metadata: { issue: "login_methods" },
    });
  }

  return issues;
}

export function validateBlueprintSchemas(bundle: SchemaBundle): ValidationResult {
  const checks: ValidationCheck[] = [];
  const issues: ValidationIssue[] = [];

  const requiredTables = [...new Set(
    bundle.ui
    .flatMap((page) => page.components)
    .map((component) => component.entity)
    .filter(Boolean),
  )] as string[];

  for (const entity of requiredTables) {
    const table = getTable(bundle.db, slugify(entity));
    checks.push({
      id: `db-${entity}`,
      name: `Database table for ${entity}`,
      status: table ? "pass" : "fail",
      details: table ? `${table.name} is present.` : `${entity} is not present in the database schema.`,
    });
  }

  const uiIssues = checkUiAgainstDb(bundle.ui, bundle.db);
  const apiIssues = checkApiAgainstDb(bundle.api, bundle.db);
  const relationIssues = checkRelations(bundle.db);
  const authIssues = checkAuth(bundle.auth, bundle.api);

  issues.push(...uiIssues, ...apiIssues, ...relationIssues, ...authIssues);

  checks.push({
    id: "ui-db-alignment",
    name: "UI to DB alignment",
    status: uiIssues.length ? "fail" : "pass",
    details: uiIssues.length ? `${uiIssues.length} UI field(s) need DB support.` : "UI fields match database columns.",
  });
  checks.push({
    id: "api-db-alignment",
    name: "API to DB alignment",
    status: apiIssues.length ? "fail" : "pass",
    details: apiIssues.length ? `${apiIssues.length} API request field(s) need DB support.` : "API contracts align with DB tables.",
  });
  checks.push({
    id: "relations",
    name: "Relation integrity",
    status: relationIssues.length ? "fail" : "pass",
    details: relationIssues.length ? `${relationIssues.length} relation(s) are broken.` : "All relations resolve cleanly.",
  });
  checks.push({
    id: "auth",
    name: "Auth consistency",
    status: authIssues.length ? "fail" : "pass",
    details: authIssues.length ? `${authIssues.length} auth issue(s) detected.` : "Auth schema is consistent.",
  });

  const warnings = [
    ...bundle.ui.flatMap((page) =>
      page.components.some((component) => component.type === "chart") ? [`Chart component on ${page.route} depends on derived data.`] : [],
    ),
  ];
  const errors = issues.filter((issue) => issue.severity === "error").map((issue) => issue.message);

  return {
    checks,
    issues,
    warnings,
    errors,
    isValid: issues.length === 0,
  };
}
