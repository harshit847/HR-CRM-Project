import { z } from "zod";

export const evaluationPromptSchema = z.object({
  id: z.string(),
  category: z.enum(["real-world", "edge-case"]),
  prompt: z.string(),
  expectedSignals: z.array(z.string()),
});

export type EvaluationPrompt = z.infer<typeof evaluationPromptSchema>;
