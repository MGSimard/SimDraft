import { ACTION_TYPE } from "@/_store/draftStore";
import { useDraftStore } from "@/_store/DraftStoreProvider";

export function ButtonDraftAction() {
  const { getCurrentStepDetails, lockIn, selectedChampion, isDraftComplete, reset, bans, picks } = useDraftStore(
    (state) => state
  );
  const currentStepDetails = getCurrentStepDetails();

  const type = currentStepDetails?.type;
  const label =
    type === ACTION_TYPE.PICK
      ? "LOCK IN"
      : type === ACTION_TYPE.BAN
      ? "BAN"
      : !type && isDraftComplete
      ? "RESET"
      : !type && !isDraftComplete
      ? (console.warn("ERROR: No action type and draft isn't complete."), "ERROR")
      : "";

  const allBans = [...bans[0], ...bans[1]].filter((c): c is string => c !== null);
  const allPicks = [...picks[0], ...picks[1]].filter((c): c is string => c !== null);

  const isSelectedDisabled =
    !isDraftComplete &&
    (!selectedChampion || allBans.includes(selectedChampion) || allPicks.includes(selectedChampion));

  const handleClick = () => {
    if (isDraftComplete) {
      if (window.confirm("Are you sure you want to reset the draft?")) {
        reset();
      }
    } else {
      if (isSelectedDisabled) return;
      lockIn();
    }
  };

  return (
    <button type="submit" className="btn-primary-action" disabled={isSelectedDisabled} onClick={handleClick}>
      <span>{label}</span>
    </button>
  );
}
