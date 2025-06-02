import { ACTION_TYPE } from "@/_store/constants";
import { useDraftStore } from "@/_store/DraftStoreProvider";
import React, { useMemo, useCallback } from "react";

export const ButtonDraftAction = React.memo(function ButtonDraftAction() {
  const getCurrentStepInfo = useDraftStore((state) => state.getCurrentStepInfo);
  const lockIn = useDraftStore((state) => state.lockIn);
  const selectedChampion = useDraftStore((state) => state.selectedChampion);
  const isChampionAvailable = useDraftStore((state) => state.isChampionAvailable);
  const reset = useDraftStore((state) => state.reset);

  const { actionType, isDraftComplete } = getCurrentStepInfo();

  const buttonLabel = useMemo(() => {
    if (isDraftComplete) return "RESET";
    if (actionType === ACTION_TYPE.PICK) return "LOCK IN";
    if (actionType === ACTION_TYPE.BAN) return "BAN";
    return "ERROR";
  }, [actionType, isDraftComplete]);

  const isDisabled = useMemo(() => {
    if (isDraftComplete) return false;
    if (!selectedChampion) return true;
    return !isChampionAvailable(selectedChampion);
  }, [isDraftComplete, selectedChampion, isChampionAvailable]);

  const handleClick = useCallback(() => {
    if (isDraftComplete) {
      if (window.confirm("Are you sure you want to reset the draft?")) {
        reset();
      }
    } else {
      if (isDisabled) return;
      lockIn();
    }
  }, [isDraftComplete, reset, isDisabled, lockIn]);

  return (
    <button
      type="submit"
      className="btn-primary-action"
      disabled={isDisabled}
      onClick={handleClick}
      aria-label={`${buttonLabel} ${selectedChampion ? `champion ${selectedChampion}` : ""}`}>
      <span>{buttonLabel}</span>
    </button>
  );
});
