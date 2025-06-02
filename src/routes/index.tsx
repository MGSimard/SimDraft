import { createFileRoute } from "@tanstack/react-router";
import { ScrollContainer } from "@/_components/ScrollContainer";
import { PickRow } from "@/_components/PickRow";
import { PickSeparator } from "@/_components/PickSeparator";
import { ButtonDraftAction } from "@/_components/ButtonDraftAction";
import { ChampionList } from "@/_components/ChampionList";
import { BanRow } from "@/_components/BanRow";
import { ACTION_TYPE } from "@/_store/constants";
import { useDraftStore } from "@/_store/draftStore";
import { useState, useEffect } from "react";
import { IconTop, IconJungle, IconMiddle, IconBottom, IconSupport } from "@/_components/Icons";

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
  const [search, setSearch] = useState("");
  const [activeRoleFilters, setActiveRoleFilters] = useState<string[]>([]);
  const debouncedSearch = useDebounce(search, 200);

  const mainThemeClass =
    actionType === ACTION_TYPE.PICK ? "theme-picking" : actionType === ACTION_TYPE.BAN ? "theme-banning" : "";

  const actionText = isDraftComplete
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
        <header>
          <h2>{actionText}</h2>
        </header>
        <div id="champion-controls">
          {ROLES.map((role) => {
            const IconComponent = ROLE_ICONS[role];
            return (
              <button
                key={role}
                type="button"
                aria-label={`Filter by ${role}`}
                onClick={() => handleRoleFilterToggle(role)}
                className={activeRoleFilters.includes(role) ? "active" : ""}>
                <IconComponent />
              </button>
            );
          })}
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={handleSearchChange}
            aria-label="Search champions"
          />
        </div>
        <ScrollContainer>
          <ChampionList searchQuery={debouncedSearch} roleFilters={activeRoleFilters} />
        </ScrollContainer>
        <ButtonDraftAction />
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
