import type { ArchitecturePlan, ApiEndpoint, AuthSchema, Intent, SchemaBundle, UiPage } from "@/lib/types";
import { getEntityProfile } from "@/generators/library";
import { capitalize, slugify } from "@/lib/utils";

function buildDbTables(intent: Intent) {
  const subscriptionTarget = intent.entities.includes("contacts")
    ? "contacts"
    : "users";
  const tables = intent.entities.map((entity) => {
    const profile = getEntityProfile(entity);
    return {
      name: profile.tableName,
      columns: profile.columns,
      relations: [
        ...(profile.tableName === "contacts"
          ? [
              {
                name: "contacts_owner",
                targetTable: "users",
                foreignKey: "ownerId",
                cardinality: "many-to-one" as const,
              },
            ]
          : []),
      ],
    };
  });

  const addTable = (table: (typeof tables)[number]) => {
    if (!tables.some((existing) => existing.name === table.name)) {
      tables.push(table);
    }
  };

  const needsUsersTable =
    intent.roles.includes("admin") ||
    intent.entities.includes("contacts") ||
    intent.features.includes("notifications") ||
    (intent.features.includes("subscriptions") && subscriptionTarget === "users");

  if (needsUsersTable) {
    addTable({
      name: "users",
      columns: [
        { name: "id", type: "string", required: true, unique: true },
        { name: "name", type: "string", required: true },
        { name: "email", type: "string", required: true, unique: true },
        { name: "role", type: "string", required: true },
        { name: "isActive", type: "boolean", required: true },
        { name: "createdAt", type: "datetime", required: true },
        { name: "updatedAt", type: "datetime", required: true },
      ],
      relations: [],
    });
  }

  if (intent.roles.includes("admin")) {
    addTable({
      name: "auditLogs",
      columns: [
        { name: "id", type: "string", required: true, unique: true },
        { name: "actorId", type: "string", required: true },
        { name: "action", type: "string", required: true },
        { name: "resource", type: "string", required: true },
        { name: "createdAt", type: "datetime", required: true },
      ],
      relations: [
        {
          name: "audit_actor",
          targetTable: "users",
          foreignKey: "actorId",
          cardinality: "many-to-one",
        },
      ],
    });
  }

  if (intent.features.includes("subscriptions")) {
    addTable({
      name: "subscriptions",
      columns: [
        { name: "id", type: "string", required: true, unique: true },
        { name: "customerId", type: "string", required: true },
        { name: "planId", type: "string", required: true },
        { name: "status", type: "string", required: true },
        { name: "renewalDate", type: "datetime", required: false },
        { name: "createdAt", type: "datetime", required: true },
        { name: "updatedAt", type: "datetime", required: true },
      ],
      relations: [
        {
          name: "subscriptions_customer",
          targetTable: subscriptionTarget,
          foreignKey: "customerId",
          cardinality: "many-to-one",
        },
      ],
    });
    addTable({
      name: "plans",
      columns: [
        { name: "id", type: "string", required: true, unique: true },
        { name: "name", type: "string", required: true },
        { name: "price", type: "number", required: true },
        { name: "interval", type: "string", required: true },
        { name: "createdAt", type: "datetime", required: true },
      ],
      relations: [],
    });
  }

  if (intent.features.includes("notifications")) {
    addTable({
      name: "notifications",
      columns: [
        { name: "id", type: "string", required: true, unique: true },
        { name: "recipientId", type: "string", required: true },
        { name: "type", type: "string", required: true },
        { name: "title", type: "string", required: true },
        { name: "body", type: "string", required: true },
        { name: "channel", type: "string", required: true },
        { name: "status", type: "string", required: true },
        { name: "readAt", type: "datetime", required: false },
        { name: "createdAt", type: "datetime", required: true },
        { name: "updatedAt", type: "datetime", required: true },
      ],
      relations: [
        {
          name: "notifications_recipient",
          targetTable: "users",
          foreignKey: "recipientId",
          cardinality: "many-to-one",
        },
      ],
    });
  }

  return tables;
}

function buildUiPages(intent: Intent, architecture: ArchitecturePlan) {
  const pages: UiPage[] = [
    {
      id: "dashboard",
      title: "Dashboard",
      route: "/",
      description: "Executive overview of the system.",
      components: [
        {
          id: "dashboard-sidebar",
          type: "sidebar" as const,
          title: "Sidebar navigation",
          props: {
            items: architecture.sidebarNavigation,
          },
        },
        {
          id: "dashboard-header",
          type: "header" as const,
          title: `${intent.appName} Overview`,
          props: {
            eyebrow: "System summary",
            description: "High-signal view of the generated blueprint and runtime status.",
          },
        },
        {
          id: "dashboard-stats",
          type: "stats" as const,
          title: "Operational metrics",
          props: {
            metrics: [
              { label: "Modules", value: architecture.modules.length },
              { label: "Entities", value: intent.entities.length },
              { label: "Roles", value: intent.roles.length },
              { label: "Confidence", value: `${Math.round(intent.confidence * 100)}%` },
            ],
          },
        },
        {
          id: "dashboard-activity",
          type: "timeline" as const,
          title: "Pipeline activity",
          props: {
            items: [
              "Intent extracted",
              "Architecture planned",
              "Schemas generated",
              "Validation completed",
            ],
          },
        },
      ],
    },
    ...intent.entities.map((entity) => ({
      id: `entity-${slugify(entity)}-page`,
      title: `${capitalize(entity)} Management`,
      route: `/${slugify(entity)}`,
      description: `Manage ${entity} records and related workflows.`,
      components: [
        {
          id: `${entity}-table`,
          type: "table" as const,
          title: `${capitalize(entity)} table`,
          entity,
          props: {
            columns: getEntityProfile(entity).columns.map((column) => column.name),
          },
        },
        {
          id: `${entity}-form`,
          type: "form" as const,
          title: `Create ${capitalize(entity)}`,
          entity,
          props: {
            fields: getEntityProfile(entity).columns
              .filter((column) => !["id", "createdAt", "updatedAt"].includes(column.name))
              .map((column) => column.name),
          },
        },
      ],
    })),
  ];

  if (intent.features.includes("analytics")) {
    pages.push({
      id: "analytics-page",
      title: "Analytics",
      route: "/analytics",
      description: "Performance and trend analysis.",
      components: [
        {
          id: "analytics-cards",
          type: "stats" as const,
          title: "Analytics cards",
          props: {
            metrics: [
              { label: "MRR", value: "$24.2k" },
              { label: "Conversion", value: "6.1%" },
              { label: "Churn", value: "2.4%" },
            ],
          },
        },
        {
          id: "analytics-chart",
          type: "chart" as const,
          title: "Trend chart",
          props: {
            metric: "revenue",
          },
        },
      ],
    });
  }

  if (intent.features.includes("subscriptions")) {
    pages.push({
      id: "billing-page",
      title: "Billing",
      route: "/billing",
      description: "Subscription lifecycle and plan management.",
      components: [
        {
          id: "billing-table",
          type: "table" as const,
          title: "Subscriptions",
          entity: "subscriptions",
          props: {
            columns: ["id", "customerId", "planId", "status", "renewalDate"],
          },
        },
        {
          id: "billing-form",
          type: "form" as const,
          title: "Update billing",
          entity: "subscriptions",
          props: {
            fields: ["customerId", "planId", "status", "billingStatus"],
          },
        },
      ],
    });
  }

  if (intent.features.includes("notifications")) {
    pages.push({
      id: "notifications-page",
      title: "Notifications",
      route: "/notifications",
      description: "Alerts, delivery status, and user-facing communication.",
      components: [
        {
          id: "notifications-header",
          type: "header" as const,
          title: "Notifications center",
          props: {
            eyebrow: "Delivery and alerts",
            description: "Track system notifications, read state, and dispatch health.",
          },
        },
        {
          id: "notifications-stats",
          type: "stats" as const,
          title: "Notification metrics",
          props: {
            metrics: [
              { label: "Unread", value: 12 },
              { label: "Email", value: "98%" },
              { label: "Push", value: "87%" },
            ],
          },
        },
        {
          id: "notifications-table",
          type: "table" as const,
          title: "Notification log",
          entity: "notifications",
          props: {
            columns: ["id", "title", "type", "channel", "status", "readAt"],
          },
        },
        {
          id: "notifications-timeline",
          type: "timeline" as const,
          title: "Delivery timeline",
          props: {
            items: [
              "Alert generated from a CRM event",
              "Delivery queued for the selected channel",
              "Recipient read state synchronized",
              "Unread notifications rolled into dashboard summary",
            ],
          },
        },
      ],
    });
  }

  return pages;
}

function buildApiSchema(intent: Intent) {
  const apis: ApiEndpoint[] = intent.entities.flatMap((entity) => {
    const profile = getEntityProfile(entity);
    const requestFields = profile.columns
      .map((column) => column.name)
      .filter((field) => !["id", "createdAt", "updatedAt"].includes(field));
    const base = `/${slugify(entity)}`;
    return [
      {
        id: `${entity}-list`,
        path: `/api${base}`,
        method: "GET" as const,
        description: `List ${entity}.`,
        authRequired: true,
        entity,
        requestFields: [],
        responseFields: ["items", "count"],
      },
      {
        id: `${entity}-create`,
        path: `/api${base}`,
        method: "POST" as const,
        description: `Create ${entity.slice(0, -1)} record.`,
        authRequired: true,
        entity,
        requestFields: requestFields.length ? requestFields : ["name", "status"],
        responseFields: ["id", "createdAt"],
      },
      {
        id: `${entity}-update`,
        path: `/api${base}/[id]`,
        method: "PATCH" as const,
        description: `Update ${entity}.`,
        authRequired: true,
        entity,
        requestFields: ["id", ...requestFields.slice(0, 3)],
        responseFields: ["updatedAt"],
      },
    ];
  });

  if (intent.features.includes("analytics")) {
    apis.push({
      id: "analytics-summary",
      path: "/api/analytics/summary",
      method: "GET",
      description: "Read analytics summary metrics.",
      authRequired: true,
      requestFields: [],
      responseFields: ["mrr", "churn", "conversionRate"],
    } as ApiEndpoint);
  }

  if (intent.features.includes("subscriptions")) {
    apis.push({
      id: "billing-sync",
      path: "/api/billing/sync",
      method: "POST",
      description: "Sync subscription billing state.",
      authRequired: true,
      entity: "subscriptions",
      requestFields: ["customerId", "planId", "billingStatus"],
      responseFields: ["status", "renewalDate"],
    } as ApiEndpoint);
  }

  if (intent.features.includes("notifications")) {
    apis.push(
      {
        id: "notifications-list",
        path: "/api/notifications",
        method: "GET",
        description: "List notification events.",
        authRequired: true,
        entity: "notifications",
        requestFields: [],
        responseFields: ["items", "count"],
      },
      {
        id: "notifications-mark-read",
        path: "/api/notifications/[id]",
        method: "PATCH",
        description: "Mark a notification as read or update delivery state.",
        authRequired: true,
        entity: "notifications",
        requestFields: ["status", "readAt"],
        responseFields: ["updatedAt"],
      },
    );
  }

  return apis;
}

function buildAuthSchema(intent: Intent): AuthSchema {
  const permissions = intent.entities.flatMap((entity) => [
    `view:${entity}`,
    `create:${entity}`,
    `update:${entity}`,
  ]);

  if (intent.features.includes("analytics")) {
    permissions.push("view:analytics");
  }

  if (intent.features.includes("subscriptions")) {
    permissions.push("view:billing", "manage:billing");
  }

  if (intent.features.includes("notifications")) {
    permissions.push("view:notifications", "manage:notifications");
  }

  return {
    strategy: "email/password + session cookies",
    roles: intent.roles.map((role) => ({
      role,
      permissions: [
        ...permissions,
        ...(role === "admin" ? ["manage:users", "view:audit-logs"] : []),
        ...(role === "manager" ? ["view:reports"] : []),
      ],
    })),
    sessionModel: "database-backed sessions",
    loginMethods: intent.authRequirements,
    notes: [
      "RBAC is resolved at route boundary and component boundary.",
      "Sensitive pages are guarded server-side and client-side.",
    ],
  };
}

export function generateSchemas(intent: Intent, architecture: ArchitecturePlan): SchemaBundle {
  return {
    ui: buildUiPages(intent, architecture),
    api: buildApiSchema(intent),
    db: buildDbTables(intent),
    auth: buildAuthSchema(intent),
  };
}
