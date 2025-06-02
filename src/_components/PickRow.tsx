import { useDraftStore } from "@/_store/DraftStoreProvider";
import { ACTION_TYPE, TEAM } from "@/_store/constants";
import type { TeamIndex, ActionIndex, PickLabel } from "@/_store/types";
import { championByKey } from "@/_datasets/championPreprocessed";

interface PickRowProps {
  team: TeamIndex;
  pickIndex: ActionIndex;
  label: PickLabel;
}

export function PickRow({ team, pickIndex, label }: PickRowProps) {
  const stepDetails = useDraftStore((state) => state.getCurrentStepDetails());
  const selectedChampion = useDraftStore((state) => state.selectedChampion);
  const picks = useDraftStore((state) => state.picks);
  const teamName = team === 0 ? TEAM.BLUE : TEAM.RED;
  const pick = picks[team][pickIndex];

  const isPicking =
    stepDetails?.type === ACTION_TYPE.PICK && stepDetails?.actionIndex === pickIndex && stepDetails?.team === teamName;

  const isBanning = stepDetails?.type === ACTION_TYPE.BAN && stepDetails?.team === teamName && pickIndex === 0;

  const champName = pick ? championByKey.get(pick)?.name || pick : null;

  const showSelectedChampion = isPicking && selectedChampion;
  const selectedChampionName = showSelectedChampion ? championByKey.get(selectedChampion)?.name : null;

  const statusContent = (() => {
    if (isBanning) return <span>Banning...</span>;
    if (!pick && isPicking) return <span>Picking...</span>;
    if (pick && champName) return <span className="cName">{champName}</span>;
    return null;
  })();

  const isPendingAction = isPicking || isBanning;

  const displayImageSrc = showSelectedChampion
    ? `/assets/champions/${selectedChampion}.png`
    : pick
    ? `/assets/champions/${pick}.png`
    : "/assets/champions/-1.png";

  const displayImageAlt = showSelectedChampion ? selectedChampionName || selectedChampion : champName || "Empty slot";

  const renderContent = () => (
    <>
      {statusContent}
      {showSelectedChampion && selectedChampionName && <span className="cName">{selectedChampionName}</span>}
      <span>{label}</span>
    </>
  );

  return (
    <div
      className={`pick-row${isPendingAction ? " pending-action" : ""}${
        showSelectedChampion ? " selected-champ-frame" : ""
      }`}>
      {team === 0 ? (
        <>
          <div className="pick-row-image">
            <img src={displayImageSrc} alt={displayImageAlt} decoding="async" />
          </div>
          <div>{renderContent()}</div>
        </>
      ) : (
        <>
          <div>{renderContent()}</div>
          <div className="pick-row-image">
            <img src={displayImageSrc} alt={displayImageAlt} decoding="async" />
          </div>
        </>
      )}
    </div>
  );
}
