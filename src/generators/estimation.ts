import type { Estimation, Intent } from "@/lib/types";

export function estimateProject(intent: Intent): Estimation {
  const scopeScore =
    intent.entities.length * 2 +
    intent.features.length * 1.5 +
    intent.roles.length * 1.25 +
    intent.integrations.length * 1.1;

  const complexity: Estimation["complexity"] =
    scopeScore < 7 ? "Low" : scopeScore < 14 ? "Medium" : "High";

  const weeks =
    complexity === "Low" ? "1-2 weeks" : complexity === "Medium" ? "2-3 weeks" : "4-6 weeks";

  return {
    complexity,
    timeline: weeks,
    recommendedStack:
      intent.features.includes("subscriptions") || intent.features.includes("analytics")
        ? "Next.js + Prisma + SQLite/PostgreSQL"
        : "Next.js + Prisma + SQLite",
    estimatedModules: Math.round(
      4 +
        intent.entities.length +
        (intent.features.includes("analytics") ? 1 : 0) +
        (intent.features.includes("subscriptions") ? 1 : 0),
    ),
    estimatedScreens: Math.round(
      3 +
        intent.entities.length * 2 +
        (intent.features.includes("analytics") ? 1 : 0) +
        (intent.features.includes("subscriptions") ? 1 : 0),
    ),
    riskNotes: [
      ...(!intent.roles.length ? ["Role boundaries are ambiguous."] : []),
      ...(!intent.integrations.length ? ["No external integrations identified, which lowers delivery risk."] : []),
      ...(intent.conflicts.length ? ["Prompt includes scope conflicts that may require clarification."] : []),
    ],
  };
}
