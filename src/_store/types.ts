export type TeamIndex = 0 | 1;
export type ActionIndex = 0 | 1 | 2 | 3 | 4;
export type FiveArray<T> = [T, T, T, T, T];

export type DraftPhase = "BAN_PHASE_1" | "PICK_PHASE_1" | "BAN_PHASE_2" | "PICK_PHASE_2";
export type Team = "BLUE" | "RED";
export type ActionType = "BAN" | "PICK";

export type PickLabel = "B1" | "B2" | "B3" | "B4" | "B5" | "R1" | "R2" | "R3" | "R4" | "R5";

export interface StepDetails {
  phase: DraftPhase;
  team: Team;
  type: ActionType;
  actionIndex: ActionIndex;
}

export interface OverridePickData {
  team: TeamIndex;
  pickIndex: ActionIndex;
}

export interface OverrideBanData {
  team: TeamIndex;
  banIndex: ActionIndex;
}

export type OverrideData = OverridePickData | OverrideBanData;

export interface DraftState {
  currentStepIndex: number;
  isDraftComplete: boolean;
  selectedChampion: string | null;
  bans: [FiveArray<string | null>, FiveArray<string | null>];
  picks: [FiveArray<string | null>, FiveArray<string | null>];
  overridingPick: OverridePickData | null;
  overridingBan: OverrideBanData | null;
}

export interface DraftActions {
  selectChampion: (championKey: string) => void;
  lockIn: () => void;
  nextStep: () => void;
  reset: () => void;
  startPickOverride: (team: TeamIndex, pickIndex: ActionIndex) => void;
  completePickOverride: (championKey: string) => void;
  cancelPickOverride: () => void;
  startBanOverride: (team: TeamIndex, banIndex: ActionIndex) => void;
  completeBanOverride: (championKey: string) => void;
  cancelBanOverride: () => void;
  cancelAnyOverride: () => void;
}

export interface DraftSelectors {
  getCurrentStepDetails: () => StepDetails | null;
  getAllBannedChampions: () => string[];
  getAllPickedChampions: () => string[];
  getUnavailableChampions: () => Set<string>;
  isChampionAvailable: (championKey: string) => boolean;
  getCurrentTeam: () => TeamIndex | null;
  getCurrentActionType: () => ActionType | null;
  getTeamBans: (teamIndex: TeamIndex) => string[];
  getTeamPicks: (teamIndex: TeamIndex) => string[];
  getCurrentStepInfo: () => {
    stepDetails: StepDetails | null;
    currentTeam: TeamIndex | null;
    actionType: ActionType | null;
    isDraftComplete: boolean;
  };
  getPickRowState: (
    team: TeamIndex,
    pickIndex: ActionIndex
  ) => {
    isPicking: boolean;
    pick: string | null;
  };
  isOverridingPick: () => boolean;
  getOverridingPickData: () => OverridePickData | null;
  isOverridingBan: () => boolean;
  getOverridingBanData: () => OverrideBanData | null;
  isOverridingAny: () => boolean;
}

export type DraftStore = DraftState & DraftActions & DraftSelectors;
