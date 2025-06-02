import { createStore } from "zustand/vanilla";
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
};

export const createDraftStore = (initState: DraftState = initialState) => {
  let cachedUnavailableChampions: Set<string> | null = null;
  let cachedStateHash: string | null = null;
  let cachedStepDetails: { stepIndex: number; details: any } | null = null;

  return createStore<DraftStore>()((set, get) => ({
    ...initState,

    selectChampion: (championKey: string) => {
      const state = get();
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
      if (state.isDraftComplete) return false;
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
  }));
};
