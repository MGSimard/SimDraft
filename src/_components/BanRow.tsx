import { useDraftStore } from "@/_store/draftStore";
import type { TeamIndex } from "@/_store/types";

interface BanRowProps {
  team: TeamIndex;
}

export function BanRow({ team }: BanRowProps) {
  const bans = useDraftStore((state) => state.bans);
  const teamBans = bans[team];
  const banOrder = team === 0 ? teamBans : [...teamBans].reverse();

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "/assets/champions/-1.png";
  };

  return (
    <div className="ban-row">
      {banOrder.map((ban: string | null, i: number) => (
        <div key={`${team}-${i}`}>
          <img
            src={ban ? `/assets/champions/${ban}.png` : "/assets/ban_placeholder.svg"}
            alt={ban ? `Banned champion ${ban}` : "Empty ban slot"}
            decoding="async"
            onError={handleImageError}
          />
        </div>
      ))}
    </div>
  );
}
