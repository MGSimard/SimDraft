import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { ACTION_TYPE } from "@/lib/store/constants";
import { useDraftStore } from "@/lib/store/draftStore";
import { BanRow } from "@/components/BanRow";
import { PickRow } from "@/components/PickRow";
import { PickSeparator } from "@/components/PickSeparator";
import { ScrollContainer, type ScrollContainerRef } from "@/components/ScrollContainer";
import { ChampionList } from "@/components/ChampionList";
import { ButtonDraftAction } from "@/components/ButtonDraftAction";
import { DestructiveButtons } from "@/components/DestructiveButtons";
import { DraftAnnouncer } from "@/components/DraftAnnouncer";
import { IconTop, IconJungle, IconMiddle, IconBottom, IconSupport, IconSearch, IconClose } from "@/components/Icons";
import { SmartTooltip } from "@/components/SmartTooltip";

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
  const {
    actionType,
    isDraftComplete,
    isOverridingAny,
    isOverridingBan,
    isOverridingPick,
    overridingBanData,
    overridingPickData,
    registerPostLockCallback,
  } = useDraftStore(
    useShallow(
    (state) => ({
      actionType: state.getCurrentActionType(),
      isDraftComplete: state.isDraftComplete,
      isOverridingAny: state.isOverridingAny(),
      isOverridingBan: state.isOverridingBan(),
      isOverridingPick: state.isOverridingPick(),
      overridingBanData: state.getOverridingBanData(),
      overridingPickData: state.getOverridingPickData(),
      registerPostLockCallback: state.registerPostLockCallback,
    })
    )
  );
  const [search, setSearch] = useState("");
  const [activeRoleFilters, setActiveRoleFilters] = useState<Array<string>>([]);
  const debouncedSearch = useDebounce(search, 100);
  const scrollContainerRef = useRef<ScrollContainerRef>(null);

  useEffect(() => {
    const handlePostLock = () => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollToTop();
        scrollContainerRef.current.focusFirstAvailableChampion();
      }
    };
    const unregister = registerPostLockCallback(handlePostLock);
    return unregister;
  }, [registerPostLockCallback]);

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
      <DraftAnnouncer />
      <section id="team-blue" aria-label="Blue team">
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
      </section>

      <section id="center">
        <div id="header">
          <h2>{actionText}</h2>
          {isOverridingAny && (
            <p className="override-hint" role="status">
              Select a champion, ESC to cancel.
            </p>
          )}
        </div>
        <div id="champion-controls" role="search" aria-label="Champion filters and search">
          <div id="role-filters">
            {ROLES.map((role) => {
              const IconComponent = ROLE_ICONS[role];
              const isActive = activeRoleFilters.includes(role);
              return (
                <SmartTooltip
                  key={role}
                  tooltip={`Show the most commonly-picked champions at ${role} during the previous patch.`}
                  id={`info-popover-${role}`}>
                  <button
                    type="button"
                    aria-label={`Filter by ${role}`}
                    aria-describedby={`info-popover-${role}`}
                    aria-pressed={isActive}
                    onClick={() => handleRoleFilterToggle(role)}
                    className={isActive ? "active" : undefined}>
                    <IconComponent />
                  </button>
                </SmartTooltip>
              );
            })}
          </div>
          <div id="search-wrapper">
            <IconSearch />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={handleSearchChange}
              aria-label="Search champions"
            />
            {search && (
              <button type="button" aria-label="Clear search" onClick={() => setSearch("")}>
                <IconClose aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
        <ScrollContainer ref={scrollContainerRef}>
          <ChampionList searchQuery={debouncedSearch} roleFilters={activeRoleFilters} />
        </ScrollContainer>
        <div id="center-footer">
          <ButtonDraftAction />
          <DestructiveButtons />
        </div>
      </section>

      <section id="team-red" aria-label="Red team">
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
      </section>
    </main>
  );
}
