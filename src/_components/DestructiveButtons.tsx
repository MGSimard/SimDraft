import { ButtonReset } from "./ButtonReset";
import { ButtonUndo } from "./ButtonUndo";

export function DestructiveButtons() {
  return (
    <div id="bottom-controls">
      <ButtonUndo />
      <ButtonReset />
    </div>
  );
}
