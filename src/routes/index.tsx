import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ACTION_TYPE } from "@/_store/constants";
import { useDraftStore } from "@/_store/draftStore";
import { BanRow } from "@/_components/BanRow";
import { PickRow } from "@/_components/PickRow";
import { PickSeparator } from "@/_components/PickSeparator";
import { ScrollContainer } from "@/_components/ScrollContainer";
import { ChampionList } from "@/_components/ChampionList";
import { ButtonDraftAction } from "@/_components/ButtonDraftAction";
import { ButtonUndo } from "@/_components/ButtonUndo";
import { ButtonReset } from "@/_components/ButtonReset";
import { IconTop, IconJungle, IconMiddle, IconBottom, IconSupport, IconSearch, IconClose } from "@/_components/Icons";

export const Route = createFileRoute("/")({
  component: PageHome,
});

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const ROLES = ["TOP", "JUNGLE", "MIDDLE", "BOTTOM", "SUPPORT"] as const;

const ROLE_ICONS = {
  TOP: IconTop,
  JUNGLE: IconJungle,
  MIDDLE: IconMiddle,
  BOTTOM: IconBottom,
  SUPPORT: IconSupport,
} as const;

function PageHome() {
  const actionType = useDraftStore((state) => state.getCurrentActionType());
  const isDraftComplete = useDraftStore((state) => state.isDraftComplete);
  const isOverridingPick = useDraftStore((state) => state.isOverridingPick());
  const overridingPickData = useDraftStore((state) => state.getOverridingPickData());
  const isOverridingBan = useDraftStore((state) => state.isOverridingBan());
  const overridingBanData = useDraftStore((state) => state.getOverridingBanData());
  const isOverridingAny = useDraftStore((state) => state.isOverridingAny());
  const [search, setSearch] = useState("");
  const [activeRoleFilters, setActiveRoleFilters] = useState<string[]>([]);
  const debouncedSearch = useDebounce(search, 100);

  const mainThemeClass = isOverridingAny
    ? "theme-overriding"
    : actionType === ACTION_TYPE.PICK
    ? "theme-picking"
    : actionType === ACTION_TYPE.BAN
    ? "theme-banning"
    : "";

  const actionText = isOverridingPick
    ? `OVERRIDE ${overridingPickData?.team === 0 ? "B" : "R"}${(overridingPickData?.pickIndex || 0) + 1}`
    : isOverridingBan
    ? `OVERRIDE ${overridingBanData?.team === 0 ? "BLUE" : "RED"} BAN ${(overridingBanData?.banIndex || 0) + 1}`
    : isDraftComplete
    ? "DRAFT COMPLETE"
    : actionType === ACTION_TYPE.BAN
    ? "BAN A CHAMPION!"
    : actionType === ACTION_TYPE.PICK
    ? "PICK A CHAMPION!"
    : "DRAFT COMPLETE";

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleRoleFilterToggle = (role: string) => {
    setActiveRoleFilters((prev) => (prev.includes(role) ? [] : [role]));
  };

  return (
    <main id="draft" className={mainThemeClass}>
      <div id="team-blue">
        <BanRow team={0} />
        <PickSeparator />
        <PickRow team={0} pickIndex={0} label="B1" />
        <PickSeparator />
        <PickRow team={0} pickIndex={1} label="B2" />
        <PickSeparator />
        <PickRow team={0} pickIndex={2} label="B3" />
        <PickSeparator />
        <PickRow team={0} pickIndex={3} label="B4" />
        <PickSeparator />
        <PickRow team={0} pickIndex={4} label="B5" />
        <PickSeparator />
      </div>

      <div id="center">
        <div id="header">
          <h2>{actionText}</h2>
          {isOverridingAny && (
            <p className="override-hint" role="status" aria-live="polite" aria-atomic="true">
              Select a champion, ESC to cancel.
            </p>
          )}
        </div>
        <div id="champion-controls">
          {ROLES.map((role) => {
            const IconComponent = ROLE_ICONS[role];
            return (
              <div key={role} className="tooltip-detect">
                <button
                  type="button"
                  aria-label={`Filter by ${role}`}
                  aria-describedby={`info-popover-${role}`}
                  onClick={() => handleRoleFilterToggle(role)}
                  className={activeRoleFilters.includes(role) ? "active" : undefined}
                  tabIndex={3}>
                  <IconComponent />
                </button>
                <div role="tooltip" id={`info-popover-${role}`} className="tooltip">
                  <span>Show the most commonly-picked champions at {role} during the previous patch.</span>
                </div>
              </div>
            );
          })}
          <div id="search-wrapper">
            <IconSearch />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={handleSearchChange}
              aria-label="Search champions"
              tabIndex={3}
            />
            {search && (
              <button type="button" aria-label="Clear search" onClick={() => setSearch("")} tabIndex={3}>
                <IconClose aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
        <ScrollContainer>
          <ChampionList searchQuery={debouncedSearch} roleFilters={activeRoleFilters} />
        </ScrollContainer>
        <div id="center-footer">
          <ButtonDraftAction />
          <ButtonUndo />
          <ButtonReset />
        </div>
      </div>

      <div id="team-red">
        <BanRow team={1} />
        <PickSeparator />
        <PickRow team={1} pickIndex={0} label="R1" />
        <PickSeparator />
        <PickRow team={1} pickIndex={1} label="R2" />
        <PickSeparator />
        <PickRow team={1} pickIndex={2} label="R3" />
        <PickSeparator />
        <PickRow team={1} pickIndex={3} label="R4" />
        <PickSeparator />
        <PickRow team={1} pickIndex={4} label="R5" />
        <PickSeparator />
      </div>
    </main>
  );
}
