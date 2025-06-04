import { IconUndo } from "@/_components/Icons";

export function ButtonUndo() {
  return (
    <button type="button" className="bottom-control" aria-label="Undo" title="Undo">
      <IconUndo aria-hidden="true" />
    </button>
  );
}
