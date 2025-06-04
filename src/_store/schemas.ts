import { z } from "zod";
import { draftOrder } from "./constants";

// Zod schema for draft validation
const FiveArraySchema = z.tuple([
  z.string().nullable(),
  z.string().nullable(),
  z.string().nullable(),
  z.string().nullable(),
  z.string().nullable(),
]);

export const DraftSchema = z.object({
  version: z.string(),
  timestamp: z.string().datetime(),
  appName: z.string(),
  currentStepIndex: z.number().int().min(0).max(draftOrder.length),
  isDraftComplete: z.boolean(),
  bans: z.tuple([FiveArraySchema, FiveArraySchema]),
  picks: z.tuple([FiveArraySchema, FiveArraySchema]),
});

export type DraftSchemaType = z.infer<typeof DraftSchema>;
