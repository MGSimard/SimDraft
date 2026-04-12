import { useDraftStore } from "@/lib/store/draftStore";
import { ACTION_TYPE } from "@/lib/store/constants";
import { clsx } from "clsx";
import { useShallow } from "zustand/react/shallow";

export function ButtonDraftAction() {
  const { actionType, cancelAnyOverride, isDraftComplete, isOverridingAny, lockIn, reset, selectedChampion, unavailableChampions } =
    useDraftStore(
      useShallow(
      (state) => ({
        actionType: state.getCurrentActionType(),
        cancelAnyOverride: state.cancelAnyOverride,
        isDraftComplete: state.isDraftComplete,
        isOverridingAny: state.isOverridingAny(),
        lockIn: state.lockIn,
        reset: state.reset,
        selectedChampion: state.selectedChampion,
        unavailableChampions: state.getUnavailableChampions(),
      })
      )
    );

  const buttonLabel = isOverridingAny
    ? "CANCEL"
    : isDraftComplete
    ? "RESET"
    : actionType === ACTION_TYPE.PICK
    ? "LOCK IN"
    : actionType === ACTION_TYPE.BAN
    ? "BAN"
    : "ERROR";

  const isDisabled = isOverridingAny
    ? false
    : isDraftComplete
    ? false
    : !selectedChampion
    ? true
    : unavailableChampions.has(selectedChampion);

  const handleClick = () => {
    if (isOverridingAny) {
      cancelAnyOverride();
    } else if (isDraftComplete) {
      if (window.confirm("Are you sure you want to reset the draft?")) {
        reset();
      }
    } else {
      if (isDisabled) return;
      lockIn();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      className={clsx("btn-primary-action", isOverridingAny && "override-mode")}
      aria-describedby={isDisabled ? "draft-button-tooltip" : undefined}>
      <span>{buttonLabel}</span>
    </button>
  );
}
