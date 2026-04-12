import { useDraftStore } from "@/lib/store/draftStore";
import type { TeamIndex, ActionIndex } from "@/lib/store/types";
import { championByKey } from "@/datasets/championPreprocessed";
import { clsx } from "clsx";

interface BanRowProps {
  team: TeamIndex;
}

export function BanRow({ team }: BanRowProps) {
  const bans = useDraftStore((state) => state.bans);
  const startBanOverride = useDraftStore((state) => state.startBanOverride);
  const overridingBanData = useDraftStore((state) => state.getOverridingBanData());

  const teamDisplayName = team === 0 ? "Blue team" : "Red team";
  const teamBans = bans[team];
  const banOrder = team === 0 ? teamBans : [...teamBans].reverse();

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "/assets/champions/-1.png";
  };

  const handleBanClick = (actualIndex: ActionIndex) => {
    const ban = teamBans[actualIndex];
    if (ban) {
      startBanOverride(team, actualIndex);
    }
  };

  return (
    <div className="ban-row">
      {banOrder.map((ban: string | null, i: number) => {
        const actualIndex = (team === 0 ? i : teamBans.length - 1 - i) as ActionIndex;
        const isBeingOverridden = overridingBanData?.team === team && overridingBanData?.banIndex === actualIndex;
        const banName = ban ? championByKey.get(ban)?.name : null;
        const className = clsx("ban-slot", ban && "swappable", isBeingOverridden && "overriding");
        const image = (
          <img
            src={ban ? `/assets/champions/${ban}.png` : "/assets/ban_placeholder.svg"}
            alt={ban ? `Banned champion ${ban}` : "Empty ban slot"}
            decoding="async"
            onError={handleImageError}
          />
        );

        if (!ban) {
          return (
            <div key={`${team}-${actualIndex}`} className={className}>
              {image}
            </div>
          );
        }

        return (
          <button
            key={`${team}-${actualIndex}`}
            type="button"
            className={className}
            onClick={() => handleBanClick(actualIndex)}
            aria-label={`Override ${banName ?? ban} for ${teamDisplayName}`}>
            {image}
          </button>
        );
      })}
    </div>
  );
}
