import championDataset from "@/datasets/champion.json";
import { beforeEach, describe, expect, it } from "vitest";
import { ACTION_TYPE, TEAM, draftOrder } from "./constants";
import { initialState, useDraftStore } from "./draftStore";

const availableChampionKeys = Object.values(championDataset.data).map((champion) => champion.key);

const createEmptyTeamSlots = () => [null, null, null, null, null] as const;

function buildDraft({
  completedSteps,
  currentStepIndex = completedSteps,
  isDraftComplete = false,
}: {
  completedSteps: number;
  currentStepIndex?: number;
  isDraftComplete?: boolean;
}) {
  const bans = [Array.from(createEmptyTeamSlots()), Array.from(createEmptyTeamSlots())] as [
    Array<string | null>,
    Array<string | null>,
  ];
  const picks = [Array.from(createEmptyTeamSlots()), Array.from(createEmptyTeamSlots())] as [
    Array<string | null>,
    Array<string | null>,
  ];

  draftOrder.slice(0, completedSteps).forEach((step, index) => {
    const championKey = availableChampionKeys[index];
    if (!championKey) {
      throw new Error(`Missing test champion key for step ${index}.`);
    }

    const teamIndex = step.team === TEAM.BLUE ? 0 : 1;
    const slots = step.type === ACTION_TYPE.BAN ? bans : picks;
    slots[teamIndex][step.actionIndex] = championKey;
  });

  return {
    version: "1.0",
    timestamp: new Date("2026-01-01T00:00:00.000Z").toISOString(),
    appName: "SimDraft",
    currentStepIndex,
    isDraftComplete,
    bans,
    picks,
  };
}

describe("draftStore import validation", () => {
  beforeEach(() => {
    useDraftStore.setState(initialState);
  });

  it("imports a consistent partial draft and clears transient override state", () => {
    const draft = buildDraft({ completedSteps: 4, currentStepIndex: 4 });

    useDraftStore.setState({
      selectedChampion: availableChampionKeys[10] ?? null,
      overridingPick: { team: 0, pickIndex: 0 },
      overridingBan: { team: 1, banIndex: 0 },
    });

    useDraftStore.getState().importDraft(draft);

    const state = useDraftStore.getState();
    expect(state.currentStepIndex).toBe(4);
    expect(state.isDraftComplete).toBe(false);
    expect(state.bans).toEqual(draft.bans);
    expect(state.picks).toEqual(draft.picks);
    expect(state.selectedChampion).toBeNull();
    expect(state.overridingPick).toBeNull();
    expect(state.overridingBan).toBeNull();
  });

  it("rejects duplicate champions across the imported draft", () => {
    const draft = buildDraft({ completedSteps: 2, currentStepIndex: 2 });
    const duplicatedChampion = draft.bans[0][0];
    if (typeof duplicatedChampion !== "string") {
      throw new Error("Expected the first ban slot to be populated in the duplicate-champion test.");
    }
    draft.bans[1][0] = duplicatedChampion;

    expect(() => useDraftStore.getState().importDraft(draft)).toThrow(/cannot appear more than once/i);
  });

  it("rejects unknown champion keys", () => {
    const draft = buildDraft({ completedSteps: 1, currentStepIndex: 1 });
    draft.bans[0][0] = "not-a-real-champion";

    expect(() => useDraftStore.getState().importDraft(draft)).toThrow(/unknown champion key/i);
  });

  it("rejects slots filled beyond the current step", () => {
    const draft = buildDraft({ completedSteps: 2, currentStepIndex: 1 });

    expect(() => useDraftStore.getState().importDraft(draft)).toThrow(/unexpected champion assigned beyond completed step/i);
  });

  it("rejects drafts marked complete before the final step", () => {
    const draft = buildDraft({
      completedSteps: draftOrder.length - 1,
      currentStepIndex: draftOrder.length - 1,
      isDraftComplete: true,
    });

    expect(() => useDraftStore.getState().importDraft(draft)).toThrow(/completed drafts must use step index/i);
  });
});
