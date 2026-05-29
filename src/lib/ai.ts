import OpenAI from "openai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const openaiApiKey = process.env.OPENAI_API_KEY?.trim();
const openaiModel = process.env.OPENAI_MODEL?.trim() || "gpt-4.1-mini";

function getClient() {
  if (!openaiApiKey) return null;
  return new OpenAI({ apiKey: openaiApiKey });
}

export async function structuredGenerate<TSchema extends z.ZodTypeAny>(args: {
  name: string;
  schema: TSchema;
  system: string;
  user: string;
  fallback: () => z.infer<TSchema>;
}): Promise<z.infer<TSchema>> {
  const client = getClient();
  if (!client) {
    return args.fallback();
  }

  try {
    const jsonSchema = zodToJsonSchema(args.schema, args.name);
    const response = await client.responses.create({
      model: openaiModel,
      input: [
        { role: "system", content: args.system },
        { role: "user", content: args.user },
      ],
      text: {
        format: {
          type: "json_schema",
          name: args.name,
          schema: jsonSchema,
          strict: true,
        },
      },
    } as any);

    const output = response.output_text;
    return args.schema.parse(JSON.parse(output));
  } catch {
    return args.fallback();
  }
}

export function hasOpenAI() {
  return Boolean(openaiApiKey);
}
