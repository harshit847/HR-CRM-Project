import { z } from "zod";

export const promptInputSchema = z.object({
  prompt: z.string().min(10).max(1000),
});

export type PromptInput = z.infer<typeof promptInputSchema>;
