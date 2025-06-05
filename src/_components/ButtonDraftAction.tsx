import { useDraftStore } from "@/_store/draftStore";
import { ACTION_TYPE } from "@/_store/constants";
import { clsx } from "clsx";

export function ButtonDraftAction() {
  const actionType = useDraftStore((state) => state.getCurrentActionType());
  const isDraftComplete = useDraftStore((state) => state.isDraftComplete);
  const lockIn = useDraftStore((state) => state.lockIn);
  const selectedChampion = useDraftStore((state) => state.selectedChampion);
  const reset = useDraftStore((state) => state.reset);
  const isOverridingAny = useDraftStore((state) => state.isOverridingAny());
  const cancelAnyOverride = useDraftStore((state) => state.cancelAnyOverride);

  // Subscribe to the actual state that affects champion availability
  const unavailableChampions = useDraftStore((state) => state.getUnavailableChampions());

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
      tabIndex={9}
      aria-describedby={isDisabled ? "draft-button-tooltip" : undefined}>
      <span>{buttonLabel}</span>
    </button>
  );
}
