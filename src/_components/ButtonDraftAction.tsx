import { useDraftStore } from "@/_store/draftStore";
import { ACTION_TYPE } from "@/_store/constants";

export function ButtonDraftAction() {
  const actionType = useDraftStore((state) => state.getCurrentActionType());
  const isDraftComplete = useDraftStore((state) => state.isDraftComplete);
  const lockIn = useDraftStore((state) => state.lockIn);
  const selectedChampion = useDraftStore((state) => state.selectedChampion);
  const isChampionAvailable = useDraftStore((state) => state.isChampionAvailable);
  const reset = useDraftStore((state) => state.reset);
  const isOverridingAny = useDraftStore((state) => state.isOverridingAny());
  const cancelAnyOverride = useDraftStore((state) => state.cancelAnyOverride);

  const buttonLabel = isOverridingAny
    ? "CANCEL OVERRIDE"
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
    : !isChampionAvailable(selectedChampion);

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
      type="submit"
      className={`btn-primary-action${isOverridingAny ? " override-mode" : ""}`}
      disabled={isDisabled}
      onClick={handleClick}
      aria-label={`${buttonLabel} ${selectedChampion ? `champion ${selectedChampion}` : ""}`}
      tabIndex={3}>
      <span>{buttonLabel}</span>
    </button>
  );
}
