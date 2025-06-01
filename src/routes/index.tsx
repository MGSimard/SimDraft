import { createFileRoute } from "@tanstack/react-router";
import { ButtonPrimaryAction } from "@/_components/ButtonPrimaryAction";
import { championsMap } from "@/_datasets/championPreprocessed";

export const Route = createFileRoute("/")({
  component: PageHome,
});

function PageHome() {
  return (
    <div>
      <h1>vsdraft</h1>
      <ButtonPrimaryAction label="Start" />
      hellohtrhrt
      {championsMap.map((champ) => (
        <div key={champ.key}>
          <img src={`/assets/champions/${champ.key}.png`} alt={champ.name} />
          <p>{champ.name}</p>
        </div>
      ))}
    </div>
  );
}
