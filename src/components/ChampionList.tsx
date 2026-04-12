import { useDraftStore } from "@/lib/store/draftStore";
import { championsMap, searchChampions, type Champion } from "@/datasets/championPreprocessed";
import { useEffect, useEffectEvent, useMemo } from "react";
import { clsx } from "clsx";
import { useShallow } from "zustand/react/shallow";

interface ChampionListProps {
  searchQuery: string;
  roleFilters: Array<string>;
}

export function ChampionList({ searchQuery, roleFilters }: ChampionListProps) {
  const { cancelAnyOverride, isDraftComplete, isOverridingAny, selectChampion, selectedChampion, unavailableChampions } =
    useDraftStore(
      useShallow(
      (state) => ({
        cancelAnyOverride: state.cancelAnyOverride,
        isDraftComplete: state.isDraftComplete,
        isOverridingAny: state.isOverridingAny(),
        selectChampion: state.selectChampion,
        selectedChampion: state.selectedChampion,
        unavailableChampions: state.getUnavailableChampions(),
      })
      )
    );

  const roleFilterSet = useMemo(() => new Set(roleFilters), [roleFilters]);

  const displayChampions = useMemo(() => {
    const baseChampions = searchQuery.trim() ? searchChampions(searchQuery) : championsMap;
    if (roleFilterSet.size === 0) {
      return baseChampions;
    }

    return baseChampions.filter((champion) => champion.roles.some((role) => roleFilterSet.has(role)));
  }, [roleFilterSet, searchQuery]);

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

  const onDocumentKeyDown = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === "Escape" && isOverridingAny) {
      cancelAnyOverride();
    }
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      onDocumentKeyDown(e);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {displayChampions.map((champ: Champion, index: number) => {
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
            }`}>
            <img
              src={`/assets/champions/${champ.key}.png`}
              alt=""
              decoding="async"
              loading={index < 24 ? "eager" : "lazy"}
              onError={handleImageError}
            />
            <span>{champ.name}</span>
          </button>
        );
      })}
    </>
  );
}
