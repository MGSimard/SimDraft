import { create } from "zustand";
import { z } from "zod";
import { TEAM, ACTION_TYPE, draftOrder } from "./constants";
import { DraftSchema } from "./schemas";
import type { FiveArray, TeamIndex, ActionIndex, DraftState, DraftStore, Team } from "./types";

export const initialState: DraftState = {
  currentStepIndex: 0,
  isDraftComplete: false,
  selectedChampion: null,
  bans: [
    [null, null, null, null, null],
    [null, null, null, null, null],
  ],
  picks: [
    [null, null, null, null, null],
    [null, null, null, null, null],
  ],
  overridingPick: null,
  overridingBan: null,
};

let cachedUnavailableChampions: Set<string> | null = null;
let cachedStateHash: string | null = null;
let cachedStepDetails: { stepIndex: number; details: any } | null = null;

// Helper function to clear all caches
const clearCaches = () => {
  cachedUnavailableChampions = null;
  cachedStateHash = null;
  cachedStepDetails = null;
};

// Helper function to clear override state
const clearOverrides = () => ({
  overridingPick: null,
  overridingBan: null,
  selectedChampion: null,
});

// Helper function to create new ban array copies
const createBanArrayCopies = (originalBans: typeof initialState.bans) =>
  [
    [...originalBans[0]] as FiveArray<string | null>,
    [...originalBans[1]] as FiveArray<string | null>,
  ] as typeof originalBans;

// Helper function to create new pick array copies
const createPickArrayCopies = (originalPicks: typeof initialState.picks) =>
  [
    [...originalPicks[0]] as FiveArray<string | null>,
    [...originalPicks[1]] as FiveArray<string | null>,
  ] as typeof originalPicks;

// Helper function to convert team enum to index
const teamToIndex = (team: Team): TeamIndex => (team === TEAM.BLUE ? 0 : 1);

// Helper function to convert team index to enum
const indexToTeam = (index: TeamIndex): Team => (index === 0 ? TEAM.BLUE : TEAM.RED);

const filterNonNullChampions = (champion: string | null): champion is string => champion !== null;

export const useDraftStore = create<DraftStore>()((set, get) => ({
  ...initialState,

  selectChampion: (championKey: string) => {
    const state = get();

    // If we're overriding a pick, complete the pick override
    if (state.overridingPick) {
      get().completePickOverride(championKey);
      return;
    }

    // If we're overriding a ban, complete the ban override
    if (state.overridingBan) {
      get().completeBanOverride(championKey);
      return;
    }

    if (state.isDraftComplete || !state.isChampionAvailable(championKey)) {
      return;
    }
    set({ selectedChampion: championKey });
  },

  lockIn: () => {
    set((state) => {
      if (state.isDraftComplete || !state.selectedChampion) {
        return state;
      }
      const currentStep = state.getCurrentStepDetails();
      if (!currentStep) return state;
      const teamIndex = teamToIndex(currentStep.team);
      if (currentStep.type === ACTION_TYPE.BAN) {
        const newBans = createBanArrayCopies(state.bans);
        newBans[teamIndex][currentStep.actionIndex] = state.selectedChampion;
        return {
          ...state,
          bans: newBans,
          selectedChampion: null,
        };
      } else {
        const newPicks = createPickArrayCopies(state.picks);
        newPicks[teamIndex][currentStep.actionIndex] = state.selectedChampion;
        return {
          ...state,
          picks: newPicks,
          selectedChampion: null,
        };
      }
    });

    const state = get();
    if (!state.isDraftComplete) {
      get().nextStep();
    }
  },

  nextStep: () => {
    set((state) => {
      if (state.isDraftComplete) return state;
      const newStepIndex = state.currentStepIndex + 1;
      const isDraftComplete = newStepIndex >= draftOrder.length;
      clearCaches();
      return {
        ...state,
        currentStepIndex: newStepIndex,
        isDraftComplete,
      };
    });
  },

  undoStep: () => {
    set((state) => {
      if (state.currentStepIndex <= 0) return state;

      const previousStepIndex = state.currentStepIndex - 1;
      const previousStep = draftOrder[previousStepIndex];

      if (!previousStep) return state;

      const teamIndex = teamToIndex(previousStep.team);

      if (previousStep.type === ACTION_TYPE.BAN) {
        const newBans = createBanArrayCopies(state.bans);
        newBans[teamIndex][previousStep.actionIndex] = null;

        clearCaches();

        return {
          ...state,
          bans: newBans,
          currentStepIndex: previousStepIndex,
          isDraftComplete: false,
          ...clearOverrides(),
        };
      } else {
        const newPicks = createPickArrayCopies(state.picks);
        newPicks[teamIndex][previousStep.actionIndex] = null;

        clearCaches();

        return {
          ...state,
          picks: newPicks,
          currentStepIndex: previousStepIndex,
          isDraftComplete: false,
          ...clearOverrides(),
        };
      }
    });
  },

  reset: () => {
    clearCaches();
    set(initialState);
  },

  getCurrentStepDetails: () => {
    const state = get();

    if (cachedStepDetails && cachedStepDetails.stepIndex === state.currentStepIndex) {
      return cachedStepDetails.details;
    }

    let details = null;
    if (!state.isDraftComplete && state.currentStepIndex < draftOrder.length) {
      details = draftOrder[state.currentStepIndex] || null;
    }

    cachedStepDetails = {
      stepIndex: state.currentStepIndex,
      details,
    };

    return details;
  },

  getAllBannedChampions: () => {
    const state = get();
    return [...state.bans[0], ...state.bans[1]].filter(filterNonNullChampions);
  },

  getAllPickedChampions: () => {
    const state = get();
    return [...state.picks[0], ...state.picks[1]].filter(filterNonNullChampions);
  },

  getUnavailableChampions: () => {
    const state = get();
    const currentStateHash = JSON.stringify({
      bans: state.bans,
      picks: state.picks,
      isDraftComplete: state.isDraftComplete,
      overridingPick: state.overridingPick,
      overridingBan: state.overridingBan,
    });
    if (cachedStateHash === currentStateHash && cachedUnavailableChampions) {
      return cachedUnavailableChampions;
    }
    const unavailable = new Set([...state.getAllBannedChampions(), ...state.getAllPickedChampions()]);
    cachedUnavailableChampions = unavailable;
    cachedStateHash = currentStateHash;
    return unavailable;
  },

  isChampionAvailable: (championKey: string) => {
    const state = get();
    if (state.isDraftComplete && !state.overridingPick && !state.overridingBan) return false;
    return !state.getUnavailableChampions().has(championKey);
  },

  getCurrentTeam: () => {
    const currentStep = get().getCurrentStepDetails();
    if (!currentStep) return null;
    return teamToIndex(currentStep.team);
  },

  getCurrentActionType: () => {
    const currentStep = get().getCurrentStepDetails();
    return currentStep?.type || null;
  },

  getTeamBans: (teamIndex: TeamIndex) => {
    const state = get();
    return state.bans[teamIndex].filter(filterNonNullChampions);
  },

  getTeamPicks: (teamIndex: TeamIndex) => {
    const state = get();
    return state.picks[teamIndex].filter(filterNonNullChampions);
  },

  getCurrentStepInfo: () => {
    const state = get();
    const stepDetails = state.getCurrentStepDetails();
    return {
      stepDetails,
      currentTeam: stepDetails ? teamToIndex(stepDetails.team) : null,
      actionType: stepDetails?.type || null,
      isDraftComplete: state.isDraftComplete,
    };
  },

  getPickRowState: (team: TeamIndex, pickIndex: ActionIndex) => {
    const state = get();
    const stepInfo = state.getCurrentStepInfo();
    const teamName = indexToTeam(team);

    const isPicking =
      stepInfo.stepDetails?.type === ACTION_TYPE.PICK &&
      stepInfo.stepDetails?.actionIndex === pickIndex &&
      stepInfo.stepDetails?.team === teamName;

    const pick = state.picks[team][pickIndex] || null;

    return { isPicking, pick };
  },

  startPickOverride: (team: TeamIndex, pickIndex: ActionIndex) => {
    const state = get();

    // If we're already overriding something, check if we should swap
    if (state.overridingPick) {
      const { team: overridingTeam, pickIndex: overridingPickIndex } = state.overridingPick;

      // If clicking the same slot, cancel override
      if (overridingTeam === team && overridingPickIndex === pickIndex) {
        get().cancelPickOverride();
        return;
      }

      // If there's a pick in the clicked slot, swap them
      if (state.picks[team][pickIndex] !== null) {
        get().swapPicks(overridingTeam, overridingPickIndex, team, pickIndex);
        return;
      }
    }

    // If we're overriding a ban and clicked a pick, try to swap
    if (state.overridingBan) {
      const { team: overridingTeam, banIndex: overridingBanIndex } = state.overridingBan;

      // If there's a pick in the clicked slot, swap ban with pick
      if (state.picks[team][pickIndex] !== null) {
        get().swapBetweenTypes(overridingTeam, overridingBanIndex, team, pickIndex, "ban-to-pick");
        return;
      }
    }

    // Only allow override if there's already a pick in that slot
    if (state.picks[team][pickIndex] !== null) {
      set({
        overridingPick: { team, pickIndex },
        overridingBan: null, // Cancel any ban override
        selectedChampion: null,
      });
    }
  },

  completePickOverride: (championKey: string) => {
    set((state) => {
      if (!state.overridingPick) {
        return state;
      }

      const { team, pickIndex } = state.overridingPick;
      const championBeingReplaced = state.picks[team][pickIndex];

      // Allow the override if the champion is available OR if it's the same champion being replaced
      const canOverride = state.isChampionAvailable(championKey) || championKey === championBeingReplaced;

      if (!canOverride) {
        return state;
      }

      const newPicks = createPickArrayCopies(state.picks);
      newPicks[team][pickIndex] = championKey;

      clearCaches();

      return {
        ...state,
        picks: newPicks,
        overridingPick: null,
        selectedChampion: null,
      };
    });
  },

  cancelPickOverride: () => {
    set({
      overridingPick: null,
      selectedChampion: null,
    });
  },

  isOverridingPick: () => get().overridingPick !== null,
  getOverridingPickData: () => get().overridingPick,

  startBanOverride: (team: TeamIndex, banIndex: ActionIndex) => {
    const state = get();

    // If we're already overriding something, check if we should swap
    if (state.overridingBan) {
      const { team: overridingTeam, banIndex: overridingBanIndex } = state.overridingBan;

      // If clicking the same slot, cancel override
      if (overridingTeam === team && overridingBanIndex === banIndex) {
        get().cancelBanOverride();
        return;
      }

      // If there's a ban in the clicked slot, swap them
      if (state.bans[team][banIndex] !== null) {
        get().swapBans(overridingTeam, overridingBanIndex, team, banIndex);
        return;
      }
    }

    // If we're overriding a pick and clicked a ban, try to swap
    if (state.overridingPick) {
      const { team: overridingTeam, pickIndex: overridingPickIndex } = state.overridingPick;

      // If there's a ban in the clicked slot, swap pick with ban
      if (state.bans[team][banIndex] !== null) {
        get().swapBetweenTypes(overridingTeam, overridingPickIndex, team, banIndex, "pick-to-ban");
        return;
      }
    }

    // Only allow override if there's already a ban in that slot
    if (state.bans[team][banIndex] !== null) {
      set({
        overridingBan: { team, banIndex },
        overridingPick: null, // Cancel any pick override
        selectedChampion: null,
      });
    }
  },

  completeBanOverride: (championKey: string) => {
    set((state) => {
      if (!state.overridingBan) {
        return state;
      }

      const { team, banIndex } = state.overridingBan;
      const championBeingReplaced = state.bans[team][banIndex];

      // Allow the override if the champion is available OR if it's the same champion being replaced
      const canOverride = state.isChampionAvailable(championKey) || championKey === championBeingReplaced;

      if (!canOverride) {
        return state;
      }

      const newBans = createBanArrayCopies(state.bans);
      newBans[team][banIndex] = championKey;

      clearCaches();

      return {
        ...state,
        bans: newBans,
        overridingBan: null,
        selectedChampion: null,
      };
    });
  },

  cancelBanOverride: () => {
    set({
      overridingBan: null,
      selectedChampion: null,
    });
  },

  cancelAnyOverride: () => {
    set(clearOverrides());
  },

  isOverridingBan: () => get().overridingBan !== null,
  getOverridingBanData: () => get().overridingBan,

  isOverridingAny: () => {
    const state = get();
    return state.overridingPick !== null || state.overridingBan !== null;
  },

  exportDraft: () => {
    const state = get();
    return {
      version: "1.0",
      timestamp: new Date().toISOString(),
      appName: "SimDraft",
      currentStepIndex: state.currentStepIndex,
      isDraftComplete: state.isDraftComplete,
      bans: state.bans,
      picks: state.picks,
    };
  },

  importDraft: (data: any) => {
    try {
      // Validate with Zod
      const validatedData = DraftSchema.parse(data);

      clearCaches();

      set({
        currentStepIndex: validatedData.currentStepIndex,
        isDraftComplete: validatedData.isDraftComplete,
        bans: validatedData.bans,
        picks: validatedData.picks,
        ...clearOverrides(),
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join(", ");
        throw new Error(`Invalid draft file: ${errorMessages}`);
      }
      throw new Error("Invalid draft file format");
    }
  },

  swapPicks: (team1: TeamIndex, pickIndex1: ActionIndex, team2: TeamIndex, pickIndex2: ActionIndex) => {
    set((state) => {
      const newPicks = createPickArrayCopies(state.picks);

      const temp = newPicks[team1][pickIndex1];
      newPicks[team1][pickIndex1] = newPicks[team2][pickIndex2];
      newPicks[team2][pickIndex2] = temp;

      clearCaches();

      return {
        ...state,
        picks: newPicks,
        ...clearOverrides(),
      };
    });
  },

  swapBans: (team1: TeamIndex, banIndex1: ActionIndex, team2: TeamIndex, banIndex2: ActionIndex) => {
    set((state) => {
      const newBans = createBanArrayCopies(state.bans);

      const temp = newBans[team1][banIndex1];
      newBans[team1][banIndex1] = newBans[team2][banIndex2];
      newBans[team2][banIndex2] = temp;

      clearCaches();

      return {
        ...state,
        bans: newBans,
        ...clearOverrides(),
      };
    });
  },

  swapBetweenTypes: (
    team1: TeamIndex,
    index1: ActionIndex,
    team2: TeamIndex,
    index2: ActionIndex,
    direction: "ban-to-pick" | "pick-to-ban"
  ) => {
    set((state) => {
      const newBans = createBanArrayCopies(state.bans);
      const newPicks = createPickArrayCopies(state.picks);

      if (direction === "ban-to-pick") {
        // team1/index1 is a ban, team2/index2 is a pick
        const temp = newBans[team1][index1];
        newBans[team1][index1] = newPicks[team2][index2];
        newPicks[team2][index2] = temp;
      } else {
        // team1/index1 is a pick, team2/index2 is a ban
        const temp = newPicks[team1][index1];
        newPicks[team1][index1] = newBans[team2][index2];
        newBans[team2][index2] = temp;
      }

      clearCaches();

      return {
        ...state,
        bans: newBans,
        picks: newPicks,
        ...clearOverrides(),
      };
    });
  },
}));
