export const PIPELINE_STAGES = [
  { id: "intent", label: "Intent Extraction", subtitle: "Parse the product request into a typed spec." },
  { id: "architecture", label: "Architecture Planner", subtitle: "Map modules, routes, and business flows." },
  { id: "schemas", label: "Schema Generation", subtitle: "Emit UI, API, DB, and auth contracts." },
  { id: "validation", label: "Validation Engine", subtitle: "Cross-check the blueprint like a compiler." },
  { id: "repair", label: "Repair Engine", subtitle: "Patch only the broken sections." },
  { id: "runtime", label: "Runtime Preview", subtitle: "Render generated schema into live UI." },
  { id: "estimation", label: "Estimation", subtitle: "Estimate scope, stack, and delivery effort." },
] as const;

export const DEFAULT_PROMPT =
  "Build a CRM with contacts, admin dashboard, subscriptions and analytics.";

export const SAMPLE_PROMPTS = [
  "Build a CRM with contacts, admin dashboard, subscriptions and analytics.",
  "Create a subscription billing portal for a SaaS product with team members, invoices, and role-based access.",
  "Design an internal HR operations dashboard with employee records, onboarding, approvals, and audit logs.",
  "Build a customer support console with tickets, SLAs, assignments, and reporting.",
] as const;

export const EDGE_CASE_PROMPTS = [
  "Make it like Slack but also like an ERP and a marketplace, keep it simple.",
  "Build an app with everything, no login, but only admins can see sensitive data.",
  "Create a CRM for contacts and deals, but the database should not store email addresses.",
  "I need analytics, subscriptions, multi-tenant permissions, and offline mode in one sprint.",
  "Build a dashboard for projects and tasks. I do not know the entities yet.",
] as const;
