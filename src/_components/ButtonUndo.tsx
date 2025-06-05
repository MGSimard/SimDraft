import { IconUndo } from "@/_components/Icons";
import { useDraftStore } from "@/_store/draftStore";

export function ButtonUndo() {
  const undoStep = useDraftStore((state) => state.undoStep);
  const currentStepIndex = useDraftStore((state) => state.currentStepIndex);
  const isOverridingAny = useDraftStore((state) => state.isOverridingAny());

  const canUndo = currentStepIndex > 0 && !isOverridingAny;

  return (
    <button
      type="button"
      className="bottom-control"
      aria-label="Undo"
      title="Undo"
      onClick={undoStep}
      disabled={!canUndo}
      tabIndex={10}>
      <IconUndo aria-hidden="true" />
    </button>
  );
}
