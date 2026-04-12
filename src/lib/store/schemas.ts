import championDataset from "@/datasets/champion.json";
import { z } from "zod";
import { TEAM, ACTION_TYPE, draftOrder } from "./constants";

const FiveArraySchema = z.tuple([
  z.string().nullable(),
  z.string().nullable(),
  z.string().nullable(),
  z.string().nullable(),
  z.string().nullable(),
]);

const validChampionKeys = new Set(Object.values(championDataset.data).map((champion) => champion.key));

const DraftSchemaBase = z.object({
  version: z.string(),
  timestamp: z.string().datetime(),
  appName: z.string(),
  currentStepIndex: z.number().int().min(0).max(draftOrder.length),
  isDraftComplete: z.boolean(),
  bans: z.tuple([FiveArraySchema, FiveArraySchema]),
  picks: z.tuple([FiveArraySchema, FiveArraySchema]),
});

const getTeamIndex = (team: typeof TEAM.BLUE | typeof TEAM.RED) => (team === TEAM.BLUE ? 0 : 1);

type DraftPath = ["bans" | "picks", 0 | 1, number];

const getSlotPath = (type: typeof ACTION_TYPE.BAN | typeof ACTION_TYPE.PICK, teamIndex: 0 | 1, actionIndex: number) =>
  (type === ACTION_TYPE.BAN ? ["bans", teamIndex, actionIndex] : ["picks", teamIndex, actionIndex]) as DraftPath;

const getSlotValue = (
  draft: z.infer<typeof DraftSchemaBase>,
  type: typeof ACTION_TYPE.BAN | typeof ACTION_TYPE.PICK,
  teamIndex: 0 | 1,
  actionIndex: number
) => (type === ACTION_TYPE.BAN ? draft.bans[teamIndex][actionIndex] : draft.picks[teamIndex][actionIndex]);

export const DraftSchema = DraftSchemaBase.superRefine((draft, ctx) => {
  const completedSteps = draft.isDraftComplete ? draftOrder.length : draft.currentStepIndex;

  if (draft.isDraftComplete && draft.currentStepIndex !== draftOrder.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["currentStepIndex"],
      message: `Completed drafts must use step index ${draftOrder.length}.`,
    });
  }

  if (!draft.isDraftComplete && draft.currentStepIndex >= draftOrder.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["currentStepIndex"],
      message: "Incomplete drafts must end before the final step.",
    });
  }

  const usedChampions = new Set<string>();

  for (const [type, slots] of [
    [ACTION_TYPE.BAN, draft.bans],
    [ACTION_TYPE.PICK, draft.picks],
  ] as const) {
    slots.forEach((teamSlots, teamIndex) => {
      teamSlots.forEach((championKey, actionIndex) => {
        if (championKey === null) return;

        const path = getSlotPath(type, teamIndex as 0 | 1, actionIndex);

        if (!validChampionKeys.has(championKey)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path,
            message: `Unknown champion key "${championKey}".`,
          });
        }

        if (usedChampions.has(championKey)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path,
            message: `Champion "${championKey}" cannot appear more than once in a draft.`,
          });
          return;
        }

        usedChampions.add(championKey);
      });
    });
  }

  draftOrder.forEach((step, stepIndex) => {
    const teamIndex = getTeamIndex(step.team);
    const slotValue = getSlotValue(draft, step.type, teamIndex, step.actionIndex);
    const path = getSlotPath(step.type, teamIndex, step.actionIndex);

    if (stepIndex < completedSteps && slotValue === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path,
        message: `Missing champion for completed ${step.type.toLowerCase()} step ${stepIndex + 1}.`,
      });
    }

    if (stepIndex >= completedSteps && slotValue !== null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path,
        message: `Unexpected champion assigned beyond completed step ${completedSteps}.`,
      });
    }
  });
});

export type DraftSchemaType = z.infer<typeof DraftSchema>;
