import type { Intent } from "@/lib/types";
import { capitalize, uniqueSorted } from "@/lib/utils";
import { structuredGenerate } from "@/lib/ai";
import { intentSchema } from "@/schemas/blueprint";

const ENTITY_KEYWORDS: Array<[string, string[]]> = [
  ["contacts", ["contact", "contacts", "crm", "customer", "customers", "client", "clients"]],
  ["deals", ["deal", "deals", "pipeline", "opportunity", "opportunities"]],
  ["leads", ["lead", "leads", "prospect", "prospects"]],
  ["subscriptions", ["subscription", "subscriptions", "billing", "plan", "plans", "invoice", "invoices", "payment", "payments"]],
  ["users", ["user", "users", "team", "members", "admin", "admins", "role", "roles"]],
  ["tasks", ["task", "tasks", "todo", "todos", "workflow", "workflows"]],
  ["tickets", ["ticket", "tickets", "support", "sla", "helpdesk"]],
];

const ROLE_KEYWORDS: Array<[string, string[]]> = [
  ["admin", ["admin", "administrator", "owner", "super admin"]],
  ["manager", ["manager", "lead", "leadership"]],
  ["employee", ["employee", "staff", "agent", "operator"]],
  ["analyst", ["analyst", "finance", "data"]],
  ["customer", ["customer", "client", "subscriber", "user"]],
];

function detectKeywords(text: string, map: Array<[string, string[]]>) {
  const hits = map
    .filter(([, keywords]) => keywords.some((keyword) => text.includes(keyword)))
    .map(([value]) => value);
  return uniqueSorted(hits);
}

function inferAppName(prompt: string, entities: string[]) {
  const explicitMatch = prompt.match(/(?:build|create|design|make)\s+(?:a|an)?\s*([^.!,]+)/i);
  if (explicitMatch) {
    return capitalize(explicitMatch[1].trim().split(/\bwith\b/i)[0].replace(/\b(and|for|but|also)\b.*$/i, "").trim());
  }
  if (entities.length) {
    return `${capitalize(entities[0])} Platform`;
  }
  return "FlowForge App";
}

function inferAuth(text: string) {
  const auth: string[] = [];
  if (text.includes("oauth") || text.includes("google login")) auth.push("oauth");
  if (text.includes("sso")) auth.push("sso");
  if (text.includes("mfa") || text.includes("2fa")) auth.push("mfa");
  if (text.includes("role") || text.includes("permission") || text.includes("rbac")) auth.push("rbac");
  if (text.includes("team") || text.includes("admin")) auth.push("organization-scoped access");
  if (!auth.includes("email/password")) auth.unshift("email/password");
  return uniqueSorted(auth);
}

function inferIntegrations(text: string) {
  const integrations: string[] = [];
  if (text.includes("stripe") || text.includes("billing") || text.includes("subscription")) integrations.push("Stripe");
  if (text.includes("slack")) integrations.push("Slack");
  if (text.includes("email") || text.includes("newsletter")) integrations.push("Email service");
  if (text.includes("webhook")) integrations.push("Webhooks");
  if (text.includes("google")) integrations.push("Google Workspace");
  return uniqueSorted(integrations);
}

function inferMonetization(text: string) {
  const monetization: string[] = [];
  if (text.includes("subscription") || text.includes("billing")) monetization.push("Tiered subscriptions");
  if (text.includes("usage")) monetization.push("Usage-based pricing");
  if (text.includes("invoice")) monetization.push("Invoice-driven billing");
  return uniqueSorted(monetization);
}

function inferFeatures(text: string, entities: string[]) {
  const features = new Set<string>();
  for (const [feature, keywords] of ENTITY_KEYWORDS) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      features.add(feature);
    }
  }
  if (text.includes("crud") || entities.length) features.add("CRUD management");
  if (text.includes("dashboard")) features.add("dashboard");
  if (text.includes("analytics") || text.includes("metrics")) features.add("analytics");
  if (text.includes("subscription") || text.includes("billing")) features.add("subscriptions");
  if (text.includes("notification") || text.includes("alert")) features.add("notifications");
  if (text.includes("lead")) features.add("lead management");
  if (text.includes("deal")) features.add("deal management");
  if (text.includes("search")) features.add("search");
  if (text.includes("import")) features.add("import/export");
  if (text.includes("audit")) features.add("audit log");
  return uniqueSorted([...features]);
}

export function extractIntent(prompt: string): Intent {
  const text = prompt.toLowerCase();
  const entities = detectKeywords(text, ENTITY_KEYWORDS);
  const roles = detectKeywords(text, ROLE_KEYWORDS);
  const features = inferFeatures(text, entities);
  const authRequirements = inferAuth(text);
  const integrations = inferIntegrations(text);
  const monetization = inferMonetization(text);
  const dashboards = uniqueSorted(
    [
      text.includes("dashboard") ? "Operations dashboard" : "",
      text.includes("analytics") ? "Analytics dashboard" : "",
      text.includes("admin") ? "Admin dashboard" : "",
      features.includes("notifications") ? "Notifications dashboard" : "",
    ].filter(Boolean),
  );
  const assumptions: string[] = [];
  if (!text.includes("login")) assumptions.push("Assumed authenticated users with email/password login.");
  if (!text.includes("mobile")) assumptions.push("Assumed desktop-first responsive UI.");
  if (!text.includes("data model")) assumptions.push("Assumed a relational model with CRUD-first entities.");
  if (!roles.length) assumptions.push("Assumed admin and employee roles for operational workflows.");
  if (features.includes("notifications")) assumptions.push("Assumed notifications are system alerts managed in-app.");
  if (features.includes("lead management")) assumptions.push("Assumed leads are tracked as a separate CRM entity.");
  if (features.includes("deal management")) assumptions.push("Assumed deals are tracked through a sales pipeline.");
  const conflicts: string[] = [];
  if (text.includes("no login") && (text.includes("permission") || text.includes("admin"))) {
    conflicts.push("Prompt requests no login but also requires restricted access.");
  }
  if (text.includes("nothing") || text.includes("everything")) {
    conflicts.push("Prompt is overly broad and may need scope boundaries.");
  }
  if (features.includes("notifications") && text.includes("email") && text.includes("sms")) {
    conflicts.push("Prompt mentions multiple notification channels; channel priority may need clarification.");
  }
  const confidence =
    Math.min(
      0.95,
      0.45 +
        entities.length * 0.08 +
        features.length * 0.04 +
        roles.length * 0.05 +
        integrations.length * 0.03 -
        conflicts.length * 0.04,
    );

  return {
    appName: inferAppName(prompt, entities),
    description: `Compiler-style blueprint for ${prompt.replace(/\s+/g, " ").trim()}`,
    entities,
    features,
    roles: roles.length ? roles : ["admin", "employee"],
    dashboards: dashboards.length ? dashboards : ["Operations dashboard"],
    authRequirements,
    integrations,
    monetization,
    assumptions,
    conflicts,
    confidence: Number(confidence.toFixed(2)),
    requestSummary: prompt.replace(/\s+/g, " ").trim(),
  };
}

export async function extractIntentWithModel(prompt: string): Promise<Intent> {
  return structuredGenerate({
    name: "flowforge_intent",
    schema: intentSchema,
    system:
      "Extract a concise product intent for a software blueprint compiler. Return only the structured JSON object.",
    user: prompt,
    fallback: () => extractIntent(prompt),
  });
}
