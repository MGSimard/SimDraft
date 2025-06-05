import { useDraftStore } from "@/_store/draftStore";
import type { TeamIndex, ActionIndex } from "@/_store/types";
import { championByKey } from "@/_datasets/championPreprocessed";
import { clsx } from "clsx";

interface BanRowProps {
  team: TeamIndex;
}

export function BanRow({ team }: BanRowProps) {
  const bans = useDraftStore((state) => state.bans);
  const startBanOverride = useDraftStore((state) => state.startBanOverride);
  const overridingBanData = useDraftStore((state) => state.getOverridingBanData());

  const teamBans = bans[team];
  const banOrder = team === 0 ? teamBans : [...teamBans].reverse();
  const banTabIndex = team === 0 ? 2 : 4; // Blue bans = 2, Red bans = 4

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "/assets/champions/-1.png";
  };

  const handleBanClick = (actualIndex: ActionIndex) => {
    const ban = teamBans[actualIndex];
    if (ban) {
      startBanOverride(team, actualIndex);
    }
  };

  const handleBanKeyDown = (e: React.KeyboardEvent, actualIndex: ActionIndex) => {
    const ban = teamBans[actualIndex];
    if (ban && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      startBanOverride(team, actualIndex);
    }
  };

  return (
    <div className="ban-row">
      {banOrder.map((ban: string | null, i: number) => {
        const actualIndex = (team === 0 ? i : teamBans.length - 1 - i) as ActionIndex;
        const isBeingOverridden = overridingBanData?.team === team && overridingBanData?.banIndex === actualIndex;
        const banName = ban ? championByKey.get(ban)?.name : null;

        return (
          <div
            key={`${team}-${actualIndex}`}
            className={clsx("ban-slot", ban && "swappable", isBeingOverridden && "overriding")}
            onClick={ban ? () => handleBanClick(actualIndex) : undefined}
            onKeyDown={ban ? (e) => handleBanKeyDown(e, actualIndex) : undefined}
            tabIndex={ban ? banTabIndex : -1}
            role={ban ? "button" : undefined}
            aria-label={ban ? `Override ${banName ?? ban}` : undefined}>
            <img
              src={ban ? `/assets/champions/${ban}.png` : "/assets/ban_placeholder.svg"}
              alt={ban ? `Banned champion ${ban}` : "Empty ban slot"}
              decoding="async"
              onError={handleImageError}
            />
          </div>
        );
      })}
    </div>
  );
}
