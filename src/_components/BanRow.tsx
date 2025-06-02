import { useDraftStore } from "@/_store/DraftStoreProvider";

export function BanRow({ team }: { team: 0 | 1 }) {
  const { bans } = useDraftStore((state) => state);

  // If we're on team 1, we want to reverse the bans array so that it visually starts from the right rather than the left
  const banOrder = team === 0 ? bans[0] : bans[1].reverse();

  return (
    <div className="ban-row">
      {banOrder.map((ban, i) => (
        <img src={ban ? `/assets/champions/${ban}.png` : "/assets/champions/-1.png"} key={team + i} alt="img" />
      ))}
    </div>
  );
}
