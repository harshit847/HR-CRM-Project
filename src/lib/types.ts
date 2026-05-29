export type PipelineStageId =
  | "intent"
  | "architecture"
  | "schemas"
  | "validation"
  | "repair"
  | "runtime"
  | "estimation";

export type Intent = {
  appName: string;
  description: string;
  entities: string[];
  features: string[];
  roles: string[];
  dashboards: string[];
  authRequirements: string[];
  integrations: string[];
  monetization: string[];
  assumptions: string[];
  conflicts: string[];
  confidence: number;
  requestSummary: string;
};

export type ArchitectureModule = {
  id: string;
  name: string;
  purpose: string;
  pages: string[];
  owner: string;
};

export type ArchitecturePlan = {
  appName: string;
  modules: ArchitectureModule[];
  pageHierarchy: string[];
  sidebarNavigation: string[];
  crudFlows: string[];
  relationships: string[];
  authFlow: string[];
  businessRules: string[];
  assumptions: string[];
};

export type UiComponentType =
  | "sidebar"
  | "header"
  | "stats"
  | "table"
  | "form"
  | "card"
  | "chart"
  | "timeline"
  | "log";

export type UiComponent = {
  id: string;
  type: UiComponentType;
  title: string;
  entity?: string;
  props: Record<string, unknown>;
};

export type UiPage = {
  id: string;
  title: string;
  route: string;
  description: string;
  components: UiComponent[];
};

export type ApiEndpoint = {
  id: string;
  path: string;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  description: string;
  authRequired: boolean;
  entity?: string;
  requestFields: string[];
  responseFields: string[];
};

export type DbColumn = {
  name: string;
  type: string;
  required: boolean;
  unique?: boolean;
  relation?: string;
};

export type DbTable = {
  name: string;
  columns: DbColumn[];
  relations: Array<{
    name: string;
    targetTable: string;
    foreignKey: string;
    cardinality: "one-to-one" | "one-to-many" | "many-to-many" | "many-to-one";
  }>;
};

export type RolePermission = {
  role: string;
  permissions: string[];
};

export type AuthSchema = {
  strategy: string;
  roles: RolePermission[];
  sessionModel: string;
  loginMethods: string[];
  notes: string[];
};

export type SchemaBundle = {
  ui: UiPage[];
  api: ApiEndpoint[];
  db: DbTable[];
  auth: AuthSchema;
};

export type ValidationCheck = {
  id: string;
  name: string;
  status: "pass" | "warn" | "fail";
  details: string;
};

export type ValidationIssue = {
  code:
    | "MISSING_TABLE"
    | "MISSING_DB_FIELD"
    | "MISSING_ENDPOINT"
    | "UI_FIELD_MISSING_IN_DB"
    | "BROKEN_RELATION"
    | "MISSING_PERMISSION"
    | "AUTH_INCONSISTENCY";
  severity: "warning" | "error";
  target: string;
  message: string;
  fixHint: string;
  metadata?: Record<string, string>;
};

export type ValidationResult = {
  checks: ValidationCheck[];
  issues: ValidationIssue[];
  warnings: string[];
  errors: string[];
  isValid: boolean;
};

export type RepairAction = {
  target: string;
  reason: string;
  before: unknown;
  after: unknown;
  patchSummary: string;
};

export type RepairResult = {
  repairs: RepairAction[];
  repairedSections: string[];
  beforeValidation: ValidationResult;
  afterValidation: ValidationResult;
  repairedBundle: SchemaBundle;
};

export type Estimation = {
  complexity: "Low" | "Medium" | "High";
  timeline: string;
  recommendedStack: string;
  estimatedModules: number;
  estimatedScreens: number;
  riskNotes: string[];
};

export type Metrics = {
  successRate: number;
  retries: number;
  repairCount: number;
  validationFailures: number;
  averageLatencyMs: number;
};

export type BlueprintRun = {
  prompt: string;
  intent: Intent;
  architecture: ArchitecturePlan;
  schemas: SchemaBundle;
  validation: ValidationResult;
  repairs: RepairResult;
  estimation: Estimation;
  logs: string[];
  metrics: Metrics;
  runtimeData: Record<string, Array<Record<string, string | number | boolean>>>;
};
