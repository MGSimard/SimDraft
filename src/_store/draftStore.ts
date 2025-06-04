import { create } from "zustand";
import { TEAM, ACTION_TYPE, draftOrder } from "./constants";
import type { FiveArray, TeamIndex, ActionIndex, DraftState, DraftStore } from "./types";

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
      const teamIndex: TeamIndex = currentStep.team === TEAM.BLUE ? 0 : 1;
      if (currentStep.type === ACTION_TYPE.BAN) {
        const newBans: typeof state.bans = [
          [...state.bans[0]] as FiveArray<string | null>,
          [...state.bans[1]] as FiveArray<string | null>,
        ];
        newBans[teamIndex][currentStep.actionIndex] = state.selectedChampion;
        return {
          ...state,
          bans: newBans,
          selectedChampion: null,
        };
      } else {
        const newPicks: typeof state.picks = [
          [...state.picks[0]] as FiveArray<string | null>,
          [...state.picks[1]] as FiveArray<string | null>,
        ];
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
      cachedUnavailableChampions = null;
      cachedStateHash = null;
      cachedStepDetails = null;
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

      const teamIndex: TeamIndex = previousStep.team === TEAM.BLUE ? 0 : 1;

      if (previousStep.type === ACTION_TYPE.BAN) {
        const newBans: typeof state.bans = [
          [...state.bans[0]] as FiveArray<string | null>,
          [...state.bans[1]] as FiveArray<string | null>,
        ];
        newBans[teamIndex][previousStep.actionIndex] = null;

        cachedUnavailableChampions = null;
        cachedStateHash = null;
        cachedStepDetails = null;

        return {
          ...state,
          bans: newBans,
          currentStepIndex: previousStepIndex,
          isDraftComplete: false,
          selectedChampion: null,
          overridingPick: null,
          overridingBan: null,
        };
      } else {
        const newPicks: typeof state.picks = [
          [...state.picks[0]] as FiveArray<string | null>,
          [...state.picks[1]] as FiveArray<string | null>,
        ];
        newPicks[teamIndex][previousStep.actionIndex] = null;

        cachedUnavailableChampions = null;
        cachedStateHash = null;
        cachedStepDetails = null;

        return {
          ...state,
          picks: newPicks,
          currentStepIndex: previousStepIndex,
          isDraftComplete: false,
          selectedChampion: null,
          overridingPick: null,
          overridingBan: null,
        };
      }
    });
  },

  reset: () => {
    cachedUnavailableChampions = null;
    cachedStateHash = null;
    cachedStepDetails = null;
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
    return [...state.bans[0], ...state.bans[1]].filter((champion): champion is string => champion !== null);
  },

  getAllPickedChampions: () => {
    const state = get();
    return [...state.picks[0], ...state.picks[1]].filter((champion): champion is string => champion !== null);
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
    return currentStep.team === TEAM.BLUE ? 0 : 1;
  },

  getCurrentActionType: () => {
    const currentStep = get().getCurrentStepDetails();
    return currentStep?.type || null;
  },

  getTeamBans: (teamIndex: TeamIndex) => {
    const state = get();
    return state.bans[teamIndex].filter((champion): champion is string => champion !== null);
  },

  getTeamPicks: (teamIndex: TeamIndex) => {
    const state = get();
    return state.picks[teamIndex].filter((champion): champion is string => champion !== null);
  },

  getCurrentStepInfo: () => {
    const state = get();
    const stepDetails = state.getCurrentStepDetails();
    return {
      stepDetails,
      currentTeam: stepDetails ? (stepDetails.team === TEAM.BLUE ? 0 : 1) : null,
      actionType: stepDetails?.type || null,
      isDraftComplete: state.isDraftComplete,
    };
  },

  getPickRowState: (team: TeamIndex, pickIndex: ActionIndex) => {
    const state = get();
    const stepInfo = state.getCurrentStepInfo();
    const teamName = team === 0 ? TEAM.BLUE : TEAM.RED;

    const isPicking =
      stepInfo.stepDetails?.type === ACTION_TYPE.PICK &&
      stepInfo.stepDetails?.actionIndex === pickIndex &&
      stepInfo.stepDetails?.team === teamName;

    const pick = state.picks[team][pickIndex] || null;

    return { isPicking, pick };
  },

  startPickOverride: (team: TeamIndex, pickIndex: ActionIndex) => {
    const state = get();
    // Only allow override if there's already a pick in that slot
    if (state.picks[team][pickIndex] !== null) {
      set({
        overridingPick: { team, pickIndex },
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

      const newPicks: typeof state.picks = [
        [...state.picks[0]] as FiveArray<string | null>,
        [...state.picks[1]] as FiveArray<string | null>,
      ];

      newPicks[team][pickIndex] = championKey;

      // Clear cache since picks have changed
      cachedUnavailableChampions = null;
      cachedStateHash = null;

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

  isOverridingPick: () => {
    const state = get();
    return state.overridingPick !== null;
  },

  getOverridingPickData: () => {
    const state = get();
    return state.overridingPick;
  },

  startBanOverride: (team: TeamIndex, banIndex: ActionIndex) => {
    const state = get();
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

      const newBans: typeof state.bans = [
        [...state.bans[0]] as FiveArray<string | null>,
        [...state.bans[1]] as FiveArray<string | null>,
      ];

      newBans[team][banIndex] = championKey;

      // Clear cache since bans have changed
      cachedUnavailableChampions = null;
      cachedStateHash = null;

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
    set({
      overridingPick: null,
      overridingBan: null,
      selectedChampion: null,
    });
  },

  isOverridingBan: () => {
    const state = get();
    return state.overridingBan !== null;
  },

  getOverridingBanData: () => {
    const state = get();
    return state.overridingBan;
  },

  isOverridingAny: () => {
    const state = get();
    return state.overridingPick !== null || state.overridingBan !== null;
  },
}));
