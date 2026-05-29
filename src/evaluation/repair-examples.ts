export const REPAIR_EXAMPLES = [
  {
    prompt: "Build a CRM with contacts, admin dashboard, subscriptions and analytics.",
    repairedSection: "db.subscriptions",
    before: ["id", "customerId", "planId", "status", "renewalDate"],
    after: ["id", "customerId", "planId", "status", "renewalDate", "billingStatus"],
    reason: "Billing UI and API require an explicit billing status field.",
  },
  {
    prompt: "Build a CRM with contacts, admin dashboard, subscriptions and analytics.",
    repairedSection: "auth.admin",
    before: ["manage:users"],
    after: ["manage:users", "view:analytics"],
    reason: "Analytics page requires read access for admin users.",
  },
];
