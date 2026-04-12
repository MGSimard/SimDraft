import { IconUndo } from "@/components/Icons";
import { useDraftStore } from "@/lib/store/draftStore";

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
      onClick={undoStep}
      disabled={!canUndo}>
      <IconUndo aria-hidden="true" />
    </button>
  );
}
