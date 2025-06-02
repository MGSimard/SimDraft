import { createStore } from "zustand/vanilla";

// Should apply to TSS? https://zustand.docs.pmnd.rs/guides/nextjs

// ENUM CONSTANTS
export const DRAFT_PHASE = {
  BAN_PHASE_1: "BAN_PHASE_1",
  PICK_PHASE_1: "PICK_PHASE_1",
  BAN_PHASE_2: "BAN_PHASE_2",
  PICK_PHASE_2: "PICK_PHASE_2",
} as const;
type DraftPhase = (typeof DRAFT_PHASE)[keyof typeof DRAFT_PHASE];
export const TEAM = {
  BLUE: "BLUE",
  RED: "RED",
} as const;
type Team = (typeof TEAM)[keyof typeof TEAM];
export const ACTION_TYPE = {
  BAN: "BAN",
  PICK: "PICK",
} as const;
type ActionType = (typeof ACTION_TYPE)[keyof typeof ACTION_TYPE];

// DRAFT ORDER
interface StepDetails {
  phase: DraftPhase;
  team: Team;
  type: ActionType;
  actionIndex: 0 | 1 | 2 | 3 | 4; // 5 Picks & Bans per team
}
export const draftOrder: readonly StepDetails[] = [
  // BAN_PHASE_1 (6 bans, 3 per team)
  { phase: DRAFT_PHASE.BAN_PHASE_1, team: TEAM.BLUE, type: ACTION_TYPE.BAN, actionIndex: 0 },
  { phase: DRAFT_PHASE.BAN_PHASE_1, team: TEAM.RED, type: ACTION_TYPE.BAN, actionIndex: 0 },
  { phase: DRAFT_PHASE.BAN_PHASE_1, team: TEAM.BLUE, type: ACTION_TYPE.BAN, actionIndex: 1 },
  { phase: DRAFT_PHASE.BAN_PHASE_1, team: TEAM.RED, type: ACTION_TYPE.BAN, actionIndex: 1 },
  { phase: DRAFT_PHASE.BAN_PHASE_1, team: TEAM.BLUE, type: ACTION_TYPE.BAN, actionIndex: 2 },
  { phase: DRAFT_PHASE.BAN_PHASE_1, team: TEAM.RED, type: ACTION_TYPE.BAN, actionIndex: 2 },
  // PICK_PHASE_1 (6 picks, 3 per team)
  { phase: DRAFT_PHASE.PICK_PHASE_1, team: TEAM.BLUE, type: ACTION_TYPE.PICK, actionIndex: 0 },
  { phase: DRAFT_PHASE.PICK_PHASE_1, team: TEAM.RED, type: ACTION_TYPE.PICK, actionIndex: 0 },
  { phase: DRAFT_PHASE.PICK_PHASE_1, team: TEAM.RED, type: ACTION_TYPE.PICK, actionIndex: 1 },
  { phase: DRAFT_PHASE.PICK_PHASE_1, team: TEAM.BLUE, type: ACTION_TYPE.PICK, actionIndex: 1 },
  { phase: DRAFT_PHASE.PICK_PHASE_1, team: TEAM.BLUE, type: ACTION_TYPE.PICK, actionIndex: 2 },
  { phase: DRAFT_PHASE.PICK_PHASE_1, team: TEAM.RED, type: ACTION_TYPE.PICK, actionIndex: 2 },
  // BAN_PHASE_2 (4 bans, 2 per team)
  { phase: DRAFT_PHASE.BAN_PHASE_2, team: TEAM.RED, type: ACTION_TYPE.BAN, actionIndex: 3 },
  { phase: DRAFT_PHASE.BAN_PHASE_2, team: TEAM.BLUE, type: ACTION_TYPE.BAN, actionIndex: 3 },
  { phase: DRAFT_PHASE.BAN_PHASE_2, team: TEAM.RED, type: ACTION_TYPE.BAN, actionIndex: 4 },
  { phase: DRAFT_PHASE.BAN_PHASE_2, team: TEAM.BLUE, type: ACTION_TYPE.BAN, actionIndex: 4 },
  // PICK_PHASE_2 (4 picks, 2 per team)
  { phase: DRAFT_PHASE.PICK_PHASE_2, team: TEAM.RED, type: ACTION_TYPE.PICK, actionIndex: 3 },
  { phase: DRAFT_PHASE.PICK_PHASE_2, team: TEAM.BLUE, type: ACTION_TYPE.PICK, actionIndex: 3 },
  { phase: DRAFT_PHASE.PICK_PHASE_2, team: TEAM.BLUE, type: ACTION_TYPE.PICK, actionIndex: 4 },
  { phase: DRAFT_PHASE.PICK_PHASE_2, team: TEAM.RED, type: ACTION_TYPE.PICK, actionIndex: 4 },
] as const;

// STATE AND ACTIONS
type FiveArr<T> = [T, T, T, T, T];
interface DraftState {
  currentStepIndex: number; // Index into the draftOrder array
  isDraftComplete: boolean;
  selectedChampion: string | null;
  bans: [FiveArr<string | null>, FiveArr<string | null>]; // [blueBans, redBans]
  picks: [FiveArr<string | null>, FiveArr<string | null>]; // [bluePicks, redPicks]
}

interface DraftActions {
  selectChampion: (cKey: string) => void;
  lockIn: () => void;
  nextStep: () => void;
  reset: () => void;
  getCurrentStepDetails: () => StepDetails | null; // Utility
}

export type DraftStore = DraftState & DraftActions;

export const initialState: DraftState = {
  currentStepIndex: 0,
  isDraftComplete: false,
  selectedChampion: null,
  bans: [
    [null, null, null, null, null], // Blue Bans
    [null, null, null, null, null], // Red Bans
  ],
  picks: [
    [null, null, null, null, null], // Blue Picks
    [null, null, null, null, null], // Red Picks
  ],
};

export const createDraftStore = (initState: DraftState = initialState) => {
  return createStore<DraftStore>()((set, get) => ({
    ...initState,

    selectChampion: (cKey: string) => {
      set({ selectedChampion: cKey });
    },

    lockIn: () => {
      set((state) => {
        if (state.isDraftComplete || !state.selectedChampion || state.currentStepIndex >= draftOrder.length) {
          return state;
        }
        const currentStepDetails = draftOrder[state.currentStepIndex];
        if (!currentStepDetails) return state;
        const newBans = [...state.bans] as [FiveArr<string | null>, FiveArr<string | null>];
        const newPicks = [...state.picks] as [FiveArr<string | null>, FiveArr<string | null>];
        const teamId = currentStepDetails.team === TEAM.BLUE ? 0 : 1;
        if (currentStepDetails.type === ACTION_TYPE.BAN) {
          // ACTION_TYPE.BAN
          const teamBans = [...newBans[teamId]] as FiveArr<string | null>;
          teamBans[currentStepDetails.actionIndex] = state.selectedChampion;
          newBans[teamId] = teamBans;
        } else {
          // ACTION_TYPE.PICK
          const teamPicks = [...newPicks[teamId]] as FiveArr<string | null>;
          teamPicks[currentStepDetails.actionIndex] = state.selectedChampion;
          newPicks[teamId] = teamPicks;
        }
        return {
          ...state,
          bans: newBans,
          picks: newPicks,
          selectedChampion: null,
        };
      });
      if (!get().isDraftComplete && get().currentStepIndex < draftOrder.length) {
        get().nextStep();
      }
    },

    nextStep: () => {
      set((state) => {
        if (state.isDraftComplete) return state;
        const newStepIndex = state.currentStepIndex + 1;
        if (newStepIndex >= draftOrder.length) {
          return { ...state, currentStepIndex: newStepIndex, isDraftComplete: true };
        }
        return { ...state, currentStepIndex: newStepIndex, isDraftComplete: false };
      });
    },

    reset: () => {
      set(initialState);
    },

    getCurrentStepDetails: () => {
      const { currentStepIndex, isDraftComplete } = get();
      if (isDraftComplete || currentStepIndex >= draftOrder.length) return null;
      return draftOrder[currentStepIndex] as StepDetails;
    },
  }));
};
