import { createFileRoute } from "@tanstack/react-router";
import { ButtonPrimaryAction } from "@/_components/ButtonPrimaryAction";
import { championsMap } from "@/_datasets/championPreprocessed";

export const Route = createFileRoute("/")({
  component: PageHome,
});

function PageHome() {
  return (
    <main id="draft">
      <div id="team-blue">Blue Team</div>
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
        <div id="champion-list">
          {championsMap.map((champ) => (
            <button key={champ.key} type="button">
              <img src={`/assets/champions/${champ.key}.png`} alt={champ.name} />
              <span>{champ.name}</span>
            </button>
          ))}
        </div>
      </div>
      <div id="team-red">Red Team</div>
    </main>
  );
}
