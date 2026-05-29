import type { ArchitecturePlan, Intent } from "@/lib/types";
import { capitalize, uniqueSorted } from "@/lib/utils";

export function planArchitecture(intent: Intent): ArchitecturePlan {
  const modules = [
    {
      id: "core-dashboard",
      name: "Dashboard",
      purpose: "Operational overview and health metrics.",
      pages: ["/", "/dashboard"],
      owner: "product",
    },
    ...intent.entities.map((entity) => ({
      id: `${entity}-module`,
      name: `${capitalize(entity)} Management`,
      purpose: `CRUD workflow for ${entity}.`,
      pages: [`/${entity}`, `/${entity}/new`, `/${entity}/[id]`],
      owner: "operations",
    })),
    ...(intent.features.includes("analytics")
      ? [
          {
            id: "analytics-module",
            name: "Analytics",
            purpose: "Metrics, trends, and summary reporting.",
            pages: ["/analytics"],
            owner: "analytics",
          },
        ]
      : []),
    ...(intent.features.includes("subscriptions")
      ? [
          {
            id: "billing-module",
            name: "Billing",
            purpose: "Plans, subscriptions, invoices, and payment status.",
            pages: ["/billing", "/billing/plans"],
            owner: "finance",
          },
        ]
      : []),
    ...(intent.features.includes("notifications")
      ? [
          {
            id: "notifications-module",
            name: "Notifications",
            purpose: "In-app alerts, delivery status, and notification preferences.",
            pages: ["/notifications"],
            owner: "platform",
          },
        ]
      : []),
    {
      id: "settings-module",
      name: "Settings",
      purpose: "Organization settings, roles, and system preferences.",
      pages: ["/settings"],
      owner: "platform",
    },
  ];

  const sidebarNavigation = uniqueSorted([
    "Dashboard",
    ...intent.entities.map((entity) => capitalize(entity)),
    ...(intent.features.includes("analytics") ? ["Analytics"] : []),
    ...(intent.features.includes("subscriptions") ? ["Billing"] : []),
    ...(intent.features.includes("notifications") ? ["Notifications"] : []),
    "Settings",
  ]);

  const relationships = intent.entities.includes("contacts")
    ? ["contacts.userId -> users.id", "deals.contactId -> contacts.id"]
    : [];

  if (intent.features.includes("subscriptions")) {
    relationships.push(
      intent.entities.includes("contacts")
        ? "subscriptions.customerId -> contacts.id"
        : "subscriptions.customerId -> users.id",
    );
  }

  if (intent.roles.includes("admin")) {
    relationships.push("users.role -> roles.name");
  }

  const crudFlows = intent.entities.flatMap((entity) => [
    `Create ${entity}`,
    `List ${entity}`,
    `Update ${entity}`,
    `Archive ${entity}`,
  ]);

  const authFlow = [
    "Sign in with email/password",
    "Resolve session and role",
    "Route to dashboard based on permissions",
    "Gate restricted pages with role-aware checks",
  ];

  const businessRules = [
    "All entity mutations require authenticated access.",
    "Admin can access audit and user-management screens.",
    "Analytics pages are read-only and derived from operational data.",
  ];

  if (intent.features.includes("subscriptions")) {
    businessRules.push("Billing pages must preserve plan, status, and renewal state.");
  }

  if (intent.features.includes("notifications")) {
    businessRules.push("Notification reads and delivery events should stay auditable.");
  }

  return {
    appName: intent.appName,
    modules,
    pageHierarchy: modules.flatMap((module) => module.pages),
    sidebarNavigation,
    crudFlows,
    relationships,
    authFlow,
    businessRules,
    assumptions: intent.assumptions,
  };
}
