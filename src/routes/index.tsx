import { createFileRoute } from "@tanstack/react-router";
import { ButtonPrimaryAction } from "@/_components/ButtonPrimaryAction";
import championDataset from "@/_datasets/champion.json";

// Preprocess champion dataset into only necessary data
const championsMap = new Map<string, { name: string; imageFull: string }>();
Object.values(championDataset.data).forEach((champInfo) => {
  championsMap.set(champInfo.key, {
    name: champInfo.name,
    imageFull: champInfo.image.full,
  });
});

export const Route = createFileRoute("/")({
  component: PageHome,
});

function PageHome() {
  return (
    <div>
      <h1>vsdraft</h1>
      <ButtonPrimaryAction label="Start" />

      {Array.from(championsMap.entries()).map(([key, { name, imageFull }]) => (
        <img key={key} src={`https://ddragon.leagueoflegends.com/cdn/15.1.1/img/champion/${imageFull}`} alt={name} />
      ))}
    </div>
  );
}
