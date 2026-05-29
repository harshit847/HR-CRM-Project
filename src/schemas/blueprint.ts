import { z } from "zod";

export const intentSchema = z.object({
  appName: z.string(),
  description: z.string(),
  entities: z.array(z.string()),
  features: z.array(z.string()),
  roles: z.array(z.string()),
  dashboards: z.array(z.string()),
  authRequirements: z.array(z.string()),
  integrations: z.array(z.string()),
  monetization: z.array(z.string()),
  assumptions: z.array(z.string()),
  conflicts: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  requestSummary: z.string(),
});

const architectureSchema = z.object({
  appName: z.string(),
  modules: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      purpose: z.string(),
      pages: z.array(z.string()),
      owner: z.string(),
    }),
  ),
  pageHierarchy: z.array(z.string()),
  sidebarNavigation: z.array(z.string()),
  crudFlows: z.array(z.string()),
  relationships: z.array(z.string()),
  authFlow: z.array(z.string()),
  businessRules: z.array(z.string()),
  assumptions: z.array(z.string()),
});

const uiSchema = z.array(
  z.object({
    id: z.string(),
    title: z.string(),
    route: z.string(),
    description: z.string(),
    components: z.array(
      z.object({
        id: z.string(),
        type: z.enum([
          "sidebar",
          "header",
          "stats",
          "table",
          "form",
          "card",
          "chart",
          "timeline",
          "log",
        ]),
        title: z.string(),
        entity: z.string().optional(),
        props: z.record(z.unknown()),
      }),
    ),
  }),
);

const apiSchema = z.array(
  z.object({
    id: z.string(),
    path: z.string(),
    method: z.enum(["GET", "POST", "PATCH", "DELETE"]),
    description: z.string(),
    authRequired: z.boolean(),
    entity: z.string().optional(),
    requestFields: z.array(z.string()),
    responseFields: z.array(z.string()),
  }),
);

const dbSchema = z.array(
  z.object({
    name: z.string(),
    columns: z.array(
      z.object({
        name: z.string(),
        type: z.string(),
        required: z.boolean(),
        unique: z.boolean().optional(),
        relation: z.string().optional(),
      }),
    ),
    relations: z.array(
      z.object({
        name: z.string(),
        targetTable: z.string(),
        foreignKey: z.string(),
          cardinality: z.enum(["one-to-one", "one-to-many", "many-to-many", "many-to-one"]),
      }),
    ),
  }),
);

const authSchema = z.object({
  strategy: z.string(),
  roles: z.array(
    z.object({
      role: z.string(),
      permissions: z.array(z.string()),
    }),
  ),
  sessionModel: z.string(),
  loginMethods: z.array(z.string()),
  notes: z.array(z.string()),
});

export const blueprintSchema = z.object({
  intent: intentSchema,
  architecture: architectureSchema,
  schemas: z.object({
    ui: uiSchema,
    api: apiSchema,
    db: dbSchema,
    auth: authSchema,
  }),
  validation: z
    .object({
      checks: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          status: z.enum(["pass", "warn", "fail"]),
          details: z.string(),
        }),
      ),
      issues: z.array(
        z.object({
          code: z.enum([
            "MISSING_TABLE",
            "MISSING_DB_FIELD",
            "MISSING_ENDPOINT",
            "UI_FIELD_MISSING_IN_DB",
            "BROKEN_RELATION",
            "MISSING_PERMISSION",
            "AUTH_INCONSISTENCY",
          ]),
          severity: z.enum(["warning", "error"]),
          target: z.string(),
          message: z.string(),
          fixHint: z.string(),
          metadata: z.record(z.string()).optional(),
        }),
      ),
      warnings: z.array(z.string()),
      errors: z.array(z.string()),
      isValid: z.boolean(),
    })
    .passthrough(),
  repairs: z
    .object({
      repairs: z.array(
        z.object({
          target: z.string(),
          reason: z.string(),
          before: z.unknown(),
          after: z.unknown(),
          patchSummary: z.string(),
        }),
      ),
      repairedSections: z.array(z.string()),
      beforeValidation: z.any(),
      afterValidation: z.any(),
    })
    .passthrough(),
  estimation: z.object({
    complexity: z.enum(["Low", "Medium", "High"]),
    timeline: z.string(),
    recommendedStack: z.string(),
    estimatedModules: z.number().int(),
    estimatedScreens: z.number().int(),
    riskNotes: z.array(z.string()),
  }),
  logs: z.array(z.string()),
  metrics: z.object({
    successRate: z.number(),
    retries: z.number().int(),
    repairCount: z.number().int(),
    validationFailures: z.number().int(),
    averageLatencyMs: z.number(),
  }),
  runtimeData: z.record(z.array(z.record(z.union([z.string(), z.number(), z.boolean()])))),
});

export type BlueprintSchema = z.infer<typeof blueprintSchema>;
