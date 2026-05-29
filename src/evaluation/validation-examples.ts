export const VALIDATION_EXAMPLES = [
  {
    prompt: "Build a CRM with contacts, admin dashboard, subscriptions and analytics.",
    issue: "UI form requests billingStatus while DB only has status.",
    phase: "validation",
    result: "repair triggered",
  },
  {
    prompt: "Create a dashboard for projects and tasks. I do not know the entities yet.",
    issue: "Vague intent, assumptions required.",
    phase: "validation",
    result: "warning emitted",
  },
];
