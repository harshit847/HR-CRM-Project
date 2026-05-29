import { NextResponse } from "next/server";
import { promptInputSchema } from "@/schemas/prompt";
import { runFlowforgePipeline } from "@/pipeline/run-pipeline";
import { persistBlueprintRun } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = promptInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid prompt", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const run = await runFlowforgePipeline(parsed.data.prompt);
    void persistBlueprintRun({
      prompt: run.prompt,
      appName: run.intent.appName,
      blueprint: {
        intent: run.intent,
        architecture: run.architecture,
        schemas: run.schemas,
        estimation: run.estimation,
      },
      validation: run.validation,
      repairs: run.repairs,
      metrics: run.metrics,
    });
    return NextResponse.json({ run });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
