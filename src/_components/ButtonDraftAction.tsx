import { ACTION_TYPE } from "@/_store/constants";
import { useDraftStore } from "@/_store/DraftStoreProvider";
import React, { useCallback } from "react";

export const ButtonDraftAction = React.memo(function ButtonDraftAction() {
  const actionType = useDraftStore((state) => state.getCurrentActionType());
  const isDraftComplete = useDraftStore((state) => state.isDraftComplete);
  const lockIn = useDraftStore((state) => state.lockIn);
  const selectedChampion = useDraftStore((state) => state.selectedChampion);
  const isChampionAvailable = useDraftStore((state) => state.isChampionAvailable);
  const reset = useDraftStore((state) => state.reset);

  const buttonLabel = isDraftComplete
    ? "RESET"
    : actionType === ACTION_TYPE.PICK
    ? "LOCK IN"
    : actionType === ACTION_TYPE.BAN
    ? "BAN"
    : "ERROR";

  const isDisabled = isDraftComplete ? false : !selectedChampion ? true : !isChampionAvailable(selectedChampion);

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
