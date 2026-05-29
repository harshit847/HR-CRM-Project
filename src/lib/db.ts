import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export async function persistBlueprintRun(data: {
  prompt: string;
  appName: string;
  blueprint: unknown;
  validation: unknown;
  repairs: unknown;
  metrics: unknown;
}) {
  try {
    await prisma.blueprintRun.create({
      data: {
        prompt: data.prompt,
        appName: data.appName,
        blueprint: JSON.stringify(data.blueprint),
        validation: JSON.stringify(data.validation),
        repairs: JSON.stringify(data.repairs),
        metrics: JSON.stringify(data.metrics),
      },
    });
  } catch {
    // Persistence is best-effort for the assignment demo.
  }
}
