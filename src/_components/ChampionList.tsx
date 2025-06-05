import { useDraftStore } from "@/_store/draftStore";
import { searchChampions, championsMap, type Champion } from "@/_datasets/championPreprocessed";
import { useEffect } from "react";
import { clsx } from "clsx";

interface ChampionListProps {
  searchQuery: string;
  roleFilters: string[];
}

export function ChampionList({ searchQuery, roleFilters }: ChampionListProps) {
  const selectChampion = useDraftStore((state) => state.selectChampion);
  const selectedChampion = useDraftStore((state) => state.selectedChampion);
  const isDraftComplete = useDraftStore((state) => state.isDraftComplete);
  const isOverridingAny = useDraftStore((state) => state.isOverridingAny());
  const cancelAnyOverride = useDraftStore((state) => state.cancelAnyOverride);

  // Subscribe to the actual state that affects champion availability
  const unavailableChampions = useDraftStore((state) => state.getUnavailableChampions());

  let displayChampions = championsMap;

  if (searchQuery.trim()) {
    displayChampions = searchChampions(searchQuery);
  }

  if (roleFilters.length > 0) {
    displayChampions = displayChampions.filter((champion) => champion.roles.some((role) => roleFilters.includes(role)));
  }

  const handleChampionClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isDraftComplete && !isOverridingAny) return;
    const button = e.currentTarget;
    const championKey = button.dataset.championKey;
    if (!championKey || typeof championKey !== "string") return;
    if (unavailableChampions.has(championKey)) {
      return;
    }
    selectChampion(championKey);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (!img.src.endsWith("-1.png")) {
      img.src = "/assets/champions/-1.png";
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOverridingAny) {
        cancelAnyOverride();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOverridingAny, cancelAnyOverride]);

  return (
    <>
      {displayChampions.map((champ: Champion) => {
        const isAvailable = isDraftComplete && !isOverridingAny ? false : !unavailableChampions.has(champ.key);
        const isSelected = selectedChampion === champ.key;

        return (
          <button
            key={champ.key}
            type="button"
            disabled={!isAvailable}
            data-champion-key={champ.key}
            onClick={handleChampionClick}
            className={clsx(isSelected && "selected", isOverridingAny && "override-mode")}
            aria-label={`${isSelected ? "Selected" : "Select"} ${champ.name}${
              isOverridingAny ? " (Override Mode)" : ""
            }`}
            role="option"
            aria-selected={isSelected}
            tabIndex={8}>
            <img
              src={`/assets/champions/${champ.key}.png`}
              alt=""
              aria-hidden="true"
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
