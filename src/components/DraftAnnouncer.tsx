import { useDraftStore } from "@/lib/store/draftStore";
import { ACTION_TYPE, TEAM } from "@/lib/store/constants";

export function DraftAnnouncer() {
  const isDraftComplete = useDraftStore((state) => state.isDraftComplete);
  const stepDetails = useDraftStore((state) => state.getCurrentStepDetails());

  const announcement = (() => {
    if (isDraftComplete) return "Draft complete";

    if (!stepDetails) return "";

    const teamName = stepDetails.team === TEAM.BLUE ? "Blue team" : "Red team";

    if (stepDetails.type === ACTION_TYPE.PICK) {
      const pickNumber = stepDetails.actionIndex + 1;
      return `${teamName} pick ${pickNumber}`;
    }

    if (stepDetails.type === ACTION_TYPE.BAN) {
      const banNumber = stepDetails.actionIndex + 1;
      return `${teamName} ban ${banNumber}`;
    }

    return "";
  })();

  if (!announcement) return null;

  return <div role="status" className="sr-only">{announcement}</div>;
}
