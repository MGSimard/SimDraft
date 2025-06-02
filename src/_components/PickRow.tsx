import { ACTION_TYPE, TEAM } from "@/_store/constants";
import { useDraftStore } from "@/_store/DraftStoreProvider";
import { championByKey } from "@/_datasets/championPreprocessed";
import type { TeamIndex, ActionIndex, PickLabel } from "@/_store/types";
import React, { useMemo } from "react";

interface PickRowProps {
  team: TeamIndex;
  pickIndex: ActionIndex;
  label: PickLabel;
}

export function PickRow({ team, pickIndex, label }: PickRowProps) {
  const getPickRowState = useDraftStore((state) => state.getPickRowState);
  const selectedChampion = useDraftStore((state) => state.selectedChampion);
  const { isPicking, isBanning, pick } = getPickRowState(team, pickIndex);

  const champName = pick ? championByKey.get(pick)?.name || pick : null;

  const selectedChampInfo = useMemo(() => {
    if (!isPicking || !selectedChampion) return null;
    const champion = championByKey.get(selectedChampion);
    if (!champion) return null;

    return {
      key: selectedChampion,
      name: champion.name,
      imageSrc: `/assets/champions/${selectedChampion}.png`,
    };
  }, [isPicking, selectedChampion]);

  const statusContent = useMemo(() => {
    if (isBanning && pickIndex === 0) return <span>Banning...</span>;
    if (!pick && isPicking) return <span>Picking...</span>;
    if (pick && champName) return <span className="cName">{champName}</span>;
    return null;
  }, [isBanning, pickIndex, pick, isPicking, champName]);

  const isPendingAction = isPicking || (isBanning && pickIndex === 0);
  const imageSrc = pick ? `/assets/champions/${pick}.png` : "/assets/champions/-1.png";

  const renderContent = () => (
    <>
      {statusContent}
      {selectedChampInfo && (
        <>
          <img
            src={selectedChampInfo.imageSrc}
            alt={selectedChampInfo.name}
            className="selected-champ-frame"
            decoding="async"
          />
          <span className="cName">{selectedChampInfo.name}</span>
        </>
      )}
      <span>{label}</span>
    </>
  );

  return (
    <div className={`pick-row${isPendingAction ? " pending-action" : ""}`}>
      {team === 0 ? (
        <>
          <img src={imageSrc} alt={champName || "Empty slot"} decoding="async" />
          <div>{renderContent()}</div>
        </>
      ) : (
        <>
          <div>{renderContent()}</div>
          <img src={imageSrc} alt={champName || "Empty slot"} decoding="async" />
        </>
      )}
    </div>
  );
}
