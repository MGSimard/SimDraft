import { createFileRoute } from "@tanstack/react-router";
import { championsMap } from "@/_datasets/championPreprocessed";
import { ScrollContainer } from "@/_components/ScrollContainer";
import { PickRow } from "@/_components/PickRow";
import { PickSeparator } from "@/_components/PickSeparator";
import { ButtonDraftAction } from "@/_components/ButtonDraftAction";

export const Route = createFileRoute("/")({
  component: PageHome,
});

function PageHome() {
  return (
    <main id="draft">
      <div id="team-blue">
        <PickSeparator />
        <PickRow team={0} label="B1" />
        <PickSeparator />
        <PickRow team={0} label="B2" />
        <PickSeparator />
        <PickRow team={0} label="B3" />
        <PickSeparator />
        <PickRow team={0} label="B4" />
        <PickSeparator />
        <PickRow team={0} label="B5" />
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
          <input type="text" placeholder="Search" />
        </div>
        <ScrollContainer>
          {championsMap.map((champ) => (
            <button key={champ.key} type="button">
              <img src={`/assets/champions/${champ.key}.png`} alt="" />
              <span>{champ.name}</span>
            </button>
          ))}
        </ScrollContainer>
        <ButtonDraftAction />
      </div>
      <div id="team-red">
        <PickSeparator />
        <PickRow team={1} label="R1" />
        <PickSeparator />
        <PickRow team={1} label="R2" />
        <PickSeparator />
        <PickRow team={1} label="R3" />
        <PickSeparator />
        <PickRow team={1} label="R4" />
        <PickSeparator />
        <PickRow team={1} label="R5" />
        <PickSeparator />
      </div>
    </main>
  );
}
