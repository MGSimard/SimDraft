import { IconTrash } from "@/_components/Icons";
import { useDraftStore } from "@/_store/draftStore";

export function ButtonReset() {
  const reset = useDraftStore((state) => state.reset);
  const currentStepIndex = useDraftStore((state) => state.currentStepIndex);
  const selectedChampion = useDraftStore((state) => state.selectedChampion);
  const picks = useDraftStore((state) => state.picks);
  const bans = useDraftStore((state) => state.bans);
  const overridingPick = useDraftStore((state) => state.overridingPick);
  const overridingBan = useDraftStore((state) => state.overridingBan);

  // Check if there's anything to reset
  const hasProgressToReset =
    currentStepIndex > 0 ||
    selectedChampion !== null ||
    overridingPick !== null ||
    overridingBan !== null ||
    picks.flat().some((pick) => pick !== null) ||
    bans.flat().some((ban) => ban !== null);

  const handleClick = () => {
    if (window.confirm("Are you sure you want to reset the draft?")) {
      reset();
    }
  };

  return (
    <button
      type="button"
      className="bottom-control"
      aria-label="Reset"
      title="Reset"
      onClick={handleClick}
      disabled={!hasProgressToReset}
      tabIndex={10}>
      <IconTrash aria-hidden="true" />
    </button>
  );
}
