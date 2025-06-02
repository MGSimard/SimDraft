import { championsMap } from "@/_datasets/championPreprocessed";
import { useDraftStore } from "@/_store/DraftStoreProvider";
import React from "react";

export function ChampionList({ filter = "" }: { filter?: string }) {
  const { selectChampion, selectedChampion, isDraftComplete, bans, picks } = useDraftStore((state) => state);
  const allBans = [...bans[0], ...bans[1]].filter((c): c is string => c !== null);
  const allPicks = [...picks[0], ...picks[1]].filter((c): c is string => c !== null);

  const disabled = (champKey: string) => isDraftComplete || allBans.includes(champKey) || allPicks.includes(champKey);

  const handleClick = (champKey: string) => {
    if (disabled(champKey)) return;
    selectChampion(champKey);
  };

  const filteredChampions = championsMap.filter((champ) => champ.name.toLowerCase().includes(filter.toLowerCase()));

  return (
    <>
      {filteredChampions.map((champ) => (
        <button
          key={champ.key}
          type="button"
          disabled={disabled(champ.key)}
          onClick={() => handleClick(champ.key)}
          className={selectedChampion === champ.key ? "selected" : undefined}>
          <img src={`/assets/champions/${champ.key}.png`} alt="" />
          <span>{champ.name}</span>
        </button>
      ))}
    </>
  );
}
