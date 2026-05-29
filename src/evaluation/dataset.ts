import type { EvaluationPrompt } from "@/schemas/evaluation";

export const EVALUATION_DATASET: EvaluationPrompt[] = [
  {
    id: "real-world-01",
    category: "real-world",
    prompt: "Build a CRM with contacts, admin dashboard, subscriptions and analytics.",
    expectedSignals: ["contacts", "admin", "subscriptions", "analytics"],
  },
  {
    id: "real-world-02",
    category: "real-world",
    prompt: "Create a subscription billing portal for a SaaS product with team members, invoices, and role-based access.",
    expectedSignals: ["subscriptions", "users", "billing", "rbac"],
  },
  {
    id: "real-world-03",
    category: "real-world",
    prompt: "Design an internal HR operations dashboard with employee records, onboarding, approvals, and audit logs.",
    expectedSignals: ["dashboard", "audit", "users", "approvals"],
  },
  {
    id: "real-world-04",
    category: "real-world",
    prompt: "Build a customer support console with tickets, SLAs, assignments, and reporting.",
    expectedSignals: ["tickets", "reporting", "workflow"],
  },
  {
    id: "real-world-05",
    category: "real-world",
    prompt: "Create a project tracker for tasks, owners, deadlines, and analytics for managers.",
    expectedSignals: ["tasks", "analytics", "manager"],
  },
  {
    id: "edge-case-01",
    category: "edge-case",
    prompt: "Make it like Slack but also like an ERP and a marketplace, keep it simple.",
    expectedSignals: ["conflict", "scope"],
  },
  {
    id: "edge-case-02",
    category: "edge-case",
    prompt: "Build an app with everything, no login, but only admins can see sensitive data.",
    expectedSignals: ["auth conflict", "admin"],
  },
  {
    id: "edge-case-03",
    category: "edge-case",
    prompt: "Create a CRM for contacts and deals, but the database should not store email addresses.",
    expectedSignals: ["contacts", "deals", "field conflict"],
  },
  {
    id: "edge-case-04",
    category: "edge-case",
    prompt: "I need analytics, subscriptions, multi-tenant permissions, and offline mode in one sprint.",
    expectedSignals: ["analytics", "subscriptions", "permissions"],
  },
  {
    id: "edge-case-05",
    category: "edge-case",
    prompt: "Build a dashboard for projects and tasks. I do not know the entities yet.",
    expectedSignals: ["tasks", "vague"],
  },
];
