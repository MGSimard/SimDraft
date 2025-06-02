import { createFileRoute } from "@tanstack/react-router";
import { ScrollContainer } from "@/_components/ScrollContainer";
import { PickRow } from "@/_components/PickRow";
import { PickSeparator } from "@/_components/PickSeparator";
import { ButtonDraftAction } from "@/_components/ButtonDraftAction";
import { ChampionList } from "@/_components/ChampionList";
import { BanRow } from "@/_components/BanRow";
import { useDraftStore } from "@/_store/DraftStoreProvider";
import { ACTION_TYPE } from "@/_store/draftStore";
import { useState } from "react";

export const Route = createFileRoute("/")({
  component: PageHome,
});

function PageHome() {
  const { getCurrentStepDetails } = useDraftStore((state) => state);
  const currentStepDetails = getCurrentStepDetails();

  const isPicking = currentStepDetails?.type === ACTION_TYPE.PICK;
  const isBanning = currentStepDetails?.type === ACTION_TYPE.BAN;

  const mainClass = isPicking ? "theme-picking" : isBanning ? "theme-banning" : "";

  const [search, setSearch] = useState("");

  return (
    <main id="draft" className={mainClass}>
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
          <h2>BAN A CHAMPION!</h2>
          <span>28</span>
        </header>
        <div id="champion-controls">
          <button type="button">X</button>
          <button type="button">X</button>
          <button type="button">X</button>
          <button type="button">X</button>
          <button type="button">X</button>
          <input type="text" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <ScrollContainer>
          <ChampionList filter={search} />
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
