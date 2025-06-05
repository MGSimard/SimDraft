import { useEffect, useState } from "react";
import { useDraftStore } from "@/_store/draftStore";
import { ACTION_TYPE, TEAM } from "@/_store/constants";

export function DraftAnnouncer() {
  const [announcement, setAnnouncement] = useState("");
  const currentStepIndex = useDraftStore((state) => state.currentStepIndex);
  const isDraftComplete = useDraftStore((state) => state.isDraftComplete);
  const stepDetails = useDraftStore((state) => state.getCurrentStepDetails());

  useEffect(() => {
    if (isDraftComplete) {
      setAnnouncement("Draft complete");
      return;
    }

    if (!stepDetails) return;

    const teamName = stepDetails.team === TEAM.BLUE ? "Blue team" : "Red team";

    if (stepDetails.type === ACTION_TYPE.PICK) {
      const pickNumber = stepDetails.actionIndex + 1;
      setAnnouncement(`${teamName} pick ${pickNumber}`);
    } else if (stepDetails.type === ACTION_TYPE.BAN) {
      const banNumber = stepDetails.actionIndex + 1;
      setAnnouncement(`${teamName} ban ${banNumber}`);
    }
  }, [currentStepIndex, isDraftComplete, stepDetails]);

  if (!announcement) return null;

  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only" tabIndex={-1}>
      {announcement}
    </div>
  );
}
