import { createFileRoute } from "@tanstack/react-router";
import { ButtonPrimaryAction } from "@/_components/ButtonPrimaryAction";
import { championsMap } from "@/_datasets/championPreprocessed";
import { ScrollContainer } from "@/_components/ScrollContainer";
import { PickRow } from "@/_components/PickRow";
import { PickSeparator } from "@/_components/PickSeparator";

export const Route = createFileRoute("/")({
  component: PageHome,
});

function PageHome() {
  return (
    <main id="draft">
      <div id="team-blue">
        Blue Team
        <PickSeparator />
        <PickRow team={0} order="B1" />
        <PickSeparator />
        <PickRow team={0} order="B2" />
        <PickSeparator />
        <PickRow team={0} order="B3" />
        <PickSeparator />
        <PickRow team={0} order="B4" />
        <PickSeparator />
        <PickRow team={0} order="B5" />
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
        <ButtonPrimaryAction label="LOCK IN" />
      </div>
      <div id="team-red">
        <PickSeparator />
        <PickRow team={1} order="R1" />
        <PickSeparator />
        <PickRow team={1} order="R2" />
        <PickSeparator />
        <PickRow team={1} order="R3" />
        <PickSeparator />
        <PickRow team={1} order="R4" />
        <PickSeparator />
        <PickRow team={1} order="R5" />
        <PickSeparator />
      </div>
    </main>
  );
}
