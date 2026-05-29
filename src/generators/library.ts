import { capitalize, slugify, uniqueSorted } from "@/lib/utils";

export type EntityProfile = {
  entity: string;
  tableName: string;
  displayName: string;
  columns: Array<{ name: string; type: string; required: boolean; unique?: boolean }>;
  sampleRow: Record<string, string | number | boolean>;
};

const ENTITY_LIBRARY: Record<string, Omit<EntityProfile, "entity" | "tableName" | "displayName">> = {
  contacts: {
    columns: [
      { name: "id", type: "string", required: true, unique: true },
      { name: "name", type: "string", required: true },
      { name: "email", type: "string", required: true, unique: true },
      { name: "phone", type: "string", required: false },
      { name: "company", type: "string", required: false },
      { name: "ownerId", type: "string", required: true },
      { name: "status", type: "string", required: true },
      { name: "createdAt", type: "datetime", required: true },
      { name: "updatedAt", type: "datetime", required: true },
    ],
    sampleRow: {
      id: "ct_1024",
      name: "Avery Brooks",
      email: "avery@northwind.co",
      phone: "+1 415 555 0138",
      company: "Northwind",
      ownerId: "usr_1",
      status: "Active",
      createdAt: "2026-05-29T09:00:00Z",
      updatedAt: "2026-05-29T09:15:00Z",
    },
  },
  deals: {
    columns: [
      { name: "id", type: "string", required: true, unique: true },
      { name: "title", type: "string", required: true },
      { name: "amount", type: "number", required: true },
      { name: "stage", type: "string", required: true },
      { name: "contactId", type: "string", required: true },
      { name: "ownerId", type: "string", required: true },
      { name: "closeDate", type: "datetime", required: false },
      { name: "createdAt", type: "datetime", required: true },
      { name: "updatedAt", type: "datetime", required: true },
    ],
    sampleRow: {
      id: "dl_241",
      title: "Enterprise Renewal",
      amount: 12000,
      stage: "Negotiation",
      contactId: "ct_1024",
      ownerId: "usr_1",
      closeDate: "2026-06-10T00:00:00Z",
      createdAt: "2026-05-27T11:00:00Z",
      updatedAt: "2026-05-29T10:30:00Z",
    },
  },
  leads: {
    columns: [
      { name: "id", type: "string", required: true, unique: true },
      { name: "name", type: "string", required: true },
      { name: "email", type: "string", required: false, unique: true },
      { name: "source", type: "string", required: true },
      { name: "status", type: "string", required: true },
      { name: "ownerId", type: "string", required: false },
      { name: "score", type: "number", required: false },
      { name: "createdAt", type: "datetime", required: true },
      { name: "updatedAt", type: "datetime", required: true },
    ],
    sampleRow: {
      id: "ld_88",
      name: "Jordan Reed",
      email: "jordan@northwind.co",
      source: "Website",
      status: "Qualified",
      ownerId: "usr_1",
      score: 82,
      createdAt: "2026-05-28T13:00:00Z",
      updatedAt: "2026-05-29T08:45:00Z",
    },
  },
  subscriptions: {
    columns: [
      { name: "id", type: "string", required: true, unique: true },
      { name: "customerId", type: "string", required: true },
      { name: "planId", type: "string", required: true },
      { name: "status", type: "string", required: true },
      { name: "renewalDate", type: "datetime", required: false },
      { name: "stripeCustomerId", type: "string", required: false, unique: true },
      { name: "createdAt", type: "datetime", required: true },
      { name: "updatedAt", type: "datetime", required: true },
    ],
    sampleRow: {
      id: "sub_9001",
      customerId: "ct_1024",
      planId: "pro_monthly",
      status: "Active",
      renewalDate: "2026-06-29T00:00:00Z",
      stripeCustomerId: "cus_abc123",
      createdAt: "2026-05-01T00:00:00Z",
      updatedAt: "2026-05-29T00:00:00Z",
    },
  },
  users: {
    columns: [
      { name: "id", type: "string", required: true, unique: true },
      { name: "name", type: "string", required: true },
      { name: "email", type: "string", required: true, unique: true },
      { name: "role", type: "string", required: true },
      { name: "isActive", type: "boolean", required: true },
      { name: "lastLoginAt", type: "datetime", required: false },
      { name: "createdAt", type: "datetime", required: true },
      { name: "updatedAt", type: "datetime", required: true },
    ],
    sampleRow: {
      id: "usr_1",
      name: "Mina Patel",
      email: "mina@flowforge.ai",
      role: "admin",
      isActive: true,
      lastLoginAt: "2026-05-28T18:15:00Z",
      createdAt: "2026-01-12T08:00:00Z",
      updatedAt: "2026-05-28T18:15:00Z",
    },
  },
  tasks: {
    columns: [
      { name: "id", type: "string", required: true, unique: true },
      { name: "title", type: "string", required: true },
      { name: "status", type: "string", required: true },
      { name: "assigneeId", type: "string", required: false },
      { name: "dueDate", type: "datetime", required: false },
      { name: "priority", type: "string", required: true },
      { name: "createdAt", type: "datetime", required: true },
      { name: "updatedAt", type: "datetime", required: true },
    ],
    sampleRow: {
      id: "tsk_22",
      title: "Follow up on onboarding checklist",
      status: "In Progress",
      assigneeId: "usr_1",
      dueDate: "2026-05-31T00:00:00Z",
      priority: "High",
      createdAt: "2026-05-25T08:00:00Z",
      updatedAt: "2026-05-29T06:20:00Z",
    },
  },
  tickets: {
    columns: [
      { name: "id", type: "string", required: true, unique: true },
      { name: "subject", type: "string", required: true },
      { name: "status", type: "string", required: true },
      { name: "priority", type: "string", required: true },
      { name: "assigneeId", type: "string", required: false },
      { name: "slaDueAt", type: "datetime", required: false },
      { name: "createdAt", type: "datetime", required: true },
      { name: "updatedAt", type: "datetime", required: true },
    ],
    sampleRow: {
      id: "tck_81",
      subject: "Login issue on mobile",
      status: "Open",
      priority: "Urgent",
      assigneeId: "usr_1",
      slaDueAt: "2026-05-29T20:00:00Z",
      createdAt: "2026-05-29T08:30:00Z",
      updatedAt: "2026-05-29T09:30:00Z",
    },
  },
};

export function normalizeEntityName(entity: string) {
  const clean = entity.toLowerCase().trim().replace(/[^a-z0-9]+/g, " ");
  return uniqueSorted(clean.split(" ")).join(" ");
}

export function getEntityProfile(entity: string): EntityProfile {
  const key = slugify(entity).replace(/-/g, "");
  const normalized = slugify(entity);
  const base =
    ENTITY_LIBRARY[normalized] ||
    ENTITY_LIBRARY[normalized.replace(/s$/, "")] ||
    ENTITY_LIBRARY[key] ||
    ENTITY_LIBRARY[key.replace(/s$/, "")];

  if (base) {
    return {
      entity: normalized,
      tableName: normalized,
      displayName: capitalize(entity.replace(/s$/, "")),
      columns: base.columns,
      sampleRow: base.sampleRow,
    };
  }

  const fallbackDisplay = capitalize(entity.replace(/s$/, ""));
  return {
    entity: normalized,
    tableName: normalized,
    displayName: fallbackDisplay,
    columns: [
      { name: "id", type: "string", required: true, unique: true },
      { name: "name", type: "string", required: true },
      { name: "status", type: "string", required: true },
      { name: "ownerId", type: "string", required: false },
      { name: "createdAt", type: "datetime", required: true },
      { name: "updatedAt", type: "datetime", required: true },
    ],
    sampleRow: {
      id: `${slugify(entity)}_1`,
      name: `${fallbackDisplay} A`,
      status: "Active",
      ownerId: "usr_1",
      createdAt: "2026-05-29T00:00:00Z",
      updatedAt: "2026-05-29T00:00:00Z",
    },
  };
}
