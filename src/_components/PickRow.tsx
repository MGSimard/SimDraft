import { ACTION_TYPE } from "@/_store/draftStore";
import { useDraftStore } from "@/_store/DraftStoreProvider";
import { championsMap } from "@/_datasets/championPreprocessed";

interface PickRowProps {
  team: 0 | 1;
  pickIndex: 0 | 1 | 2 | 3 | 4;
  label: "B1" | "B2" | "B3" | "B4" | "B5" | "R1" | "R2" | "R3" | "R4" | "R5";
}
export function PickRow({ team, pickIndex, label }: PickRowProps) {
  const { picks, getCurrentStepDetails, selectedChampion } = useDraftStore((state) => state);
  const currentStepDetails = getCurrentStepDetails();
  const type = currentStepDetails?.type;
  const actionIndex = currentStepDetails?.actionIndex;
  const currentTeam = currentStepDetails?.team;

  const isPicking =
    type === ACTION_TYPE.PICK && actionIndex === pickIndex && currentTeam === (team === 0 ? "BLUE" : "RED");
  const isBanning = type === ACTION_TYPE.BAN && currentTeam === (team === 0 ? "BLUE" : "RED");

  const pick = picks[team][pickIndex];

  // Find champion name if picked
  let champName: string | null = null;
  if (pick) {
    const champ = championsMap.find((c) => c.key === pick);
    champName = champ ? champ.name : pick;
  }

  // Determine what to render in the first span
  let statusSpan: React.ReactNode = null;
  let champSpan: React.ReactNode = null;
  if (isBanning && pickIndex === 0) {
    statusSpan = <span>Banning...</span>;
  } else if (!pick) {
    if (isPicking) {
      statusSpan = <span>Picking...</span>;
    }
  } else if (pick && champName) {
    champSpan = <span className="cName">{champName}</span>;
  }

  // Only apply pending-action if this row is currently picking or (banning and pickIndex === 0)
  const isPendingAction = isPicking || (isBanning && pickIndex === 0);

  // If picking and this is the current row, show selected champion's frame and name
  let selectedChampFrame: React.ReactNode = null;
  let selectedChampName: React.ReactNode = null;
  if (isPicking && selectedChampion) {
    const champ = championsMap.find((c) => c.key === selectedChampion);
    selectedChampFrame = (
      <img
        src={`/assets/champions/${selectedChampion}.png`}
        alt={champ ? champ.name : selectedChampion}
        className="selected-champ-frame"
      />
    );
    selectedChampName = <span className="cName">{champ ? champ.name : selectedChampion}</span>;
  }

  return (
    <div className={`pick-row${isPendingAction ? " pending-action" : ""}`}>
      {team === 0 ? (
        <>
          <img src={pick ? `/assets/champions/${pick}.png` : "/assets/champions/-1.png"} alt="img" />
          <div>
            {statusSpan}
            {isPicking && selectedChampion && (
              <>
                {selectedChampFrame}
                {selectedChampName}
              </>
            )}
            {champSpan}
            <span>{label}</span>
          </div>
        </>
      ) : (
        <>
          <div>
            {statusSpan}
            {isPicking && selectedChampion && (
              <>
                {selectedChampFrame}
                {selectedChampName}
              </>
            )}
            {champSpan}
            <span>{label}</span>
          </div>
          <img src={pick ? `/assets/champions/${pick}.png` : "/assets/champions/-1.png"} alt="img" />
        </>
      )}
    </div>
  );
}
