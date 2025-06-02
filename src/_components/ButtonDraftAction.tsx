import { ACTION_TYPE } from "@/_store/draftStore";
import { useDraftStore } from "@/_store/DraftStoreProvider";

export function ButtonDraftAction() {
  const { getCurrentStepDetails, lockIn, selectedChampion, isDraftComplete, reset } = useDraftStore((state) => state);
  const currentStepDetails = getCurrentStepDetails();

  const type = currentStepDetails?.type;
  const label = type === ACTION_TYPE.PICK ? "LOCK IN" : "BAN";

  const disabled = !isDraftComplete && !selectedChampion;

  const handleClick = () => {
    console.log("Button Clicked");
    if (!selectedChampion) return;
    if (isDraftComplete) {
      reset();
    } else {
      lockIn();
    }
  };

  return (
    <button type="submit" className="btn-primary-action" disabled={disabled} onClick={handleClick}>
      <span>{type}</span>
    </button>
  );
}
