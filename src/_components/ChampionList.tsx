import { useDraftStore } from "@/_store/draftStore";
import { searchChampions, championsMap, type Champion } from "@/_datasets/championPreprocessed";
import { useCallback, useMemo } from "react";

interface ChampionListProps {
  searchQuery: string;
}

export function ChampionList({ searchQuery }: ChampionListProps) {
  const selectChampion = useDraftStore((state) => state.selectChampion);
  const selectedChampion = useDraftStore((state) => state.selectedChampion);
  const isChampionAvailable = useDraftStore((state) => state.isChampionAvailable);
  const isDraftComplete = useDraftStore((state) => state.isDraftComplete);

  const displayChampions = useMemo(() => {
    if (!searchQuery.trim()) return championsMap;
    return searchChampions(searchQuery);
  }, [searchQuery]);

  const handleChampionClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isDraftComplete) return;
      const button = e.currentTarget;
      const championKey = button.dataset.championKey;
      if (!championKey || !isChampionAvailable(championKey)) {
        return;
      }
      selectChampion(championKey);
    },
    [selectChampion, isDraftComplete, isChampionAvailable]
  );

  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (!img.src.endsWith("-1.png")) {
      img.src = "/assets/champions/-1.png";
    }
  }, []);

  return (
    <>
      {displayChampions.map((champ: Champion) => {
        const isAvailable = isChampionAvailable(champ.key);
        const isSelected = selectedChampion === champ.key;

        return (
          <button
            key={champ.key}
            type="button"
            disabled={!isAvailable}
            data-champion-key={champ.key}
            onClick={handleChampionClick}
            className={isSelected ? "selected" : undefined}
            aria-label={`${isSelected ? "Selected" : "Select"} ${champ.name}`}
            title={champ.name}>
            <img
              src={`/assets/champions/${champ.key}.png`}
              alt={champ.name}
              decoding="async"
              loading="eager"
              onError={handleImageError}
            />
            <span>{champ.name}</span>
          </button>
        );
      })}
    </>
  );
}
