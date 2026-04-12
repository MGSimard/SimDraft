import type { StepDetails } from "./types";

// ENUM CONSTANTS
export const DRAFT_PHASE = {
  BAN_PHASE_1: "BAN_PHASE_1",
  PICK_PHASE_1: "PICK_PHASE_1",
  BAN_PHASE_2: "BAN_PHASE_2",
  PICK_PHASE_2: "PICK_PHASE_2",
} as const;

export const TEAM = {
  BLUE: "BLUE",
  RED: "RED",
} as const;

export const ACTION_TYPE = {
  BAN: "BAN",
  PICK: "PICK",
} as const;

// DRAFT ORDER - Complete champion draft sequence
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
