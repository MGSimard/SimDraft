import { useDraftStore } from "@/_store/draftStore";
import { ACTION_TYPE, TEAM } from "@/_store/constants";
import type { TeamIndex, ActionIndex, PickLabel } from "@/_store/types";
import { championByKey } from "@/_datasets/championPreprocessed";
import React, { useRef, useEffect, useState } from "react";
import { clsx } from "clsx";

interface PickRowProps {
  team: TeamIndex;
  pickIndex: ActionIndex;
  label: PickLabel;
}

export function PickRow({ team, pickIndex, label }: PickRowProps) {
  const stepDetails = useDraftStore((state) => state.getCurrentStepDetails());
  const selectedChampion = useDraftStore((state) => state.selectedChampion);
  const picks = useDraftStore((state) => state.picks);
  const startPickOverride = useDraftStore((state) => state.startPickOverride);
  const isOverridingPick = useDraftStore((state) => state.isOverridingPick());
  const overridingPickData = useDraftStore((state) => state.getOverridingPickData());
  const isOverridingAny = useDraftStore((state) => state.isOverridingAny());
  const introVideoRef = useRef<HTMLVideoElement>(null);
  const idleVideoRef = useRef<HTMLVideoElement>(null);
  const outroVideoRef = useRef<HTMLVideoElement>(null);
  const teamName = team === 0 ? TEAM.BLUE : TEAM.RED;
  const teamDisplayName = team === 0 ? "Blue team" : "Red team";
  const pick = picks[team][pickIndex];
  const pickTabIndex = team === 0 ? 3 : 5; // Blue picks = 3, Red picks = 5

  const isPicking =
    !isOverridingAny &&
    stepDetails?.type === ACTION_TYPE.PICK &&
    stepDetails?.actionIndex === pickIndex &&
    stepDetails?.team === teamName;

  const isBanning =
    !isOverridingAny && stepDetails?.type === ACTION_TYPE.BAN && stepDetails?.team === teamName && pickIndex === 0;

  const isBeingOverridden =
    isOverridingPick && overridingPickData?.team === team && overridingPickData?.pickIndex === pickIndex;

  const champName = pick ? championByKey.get(pick)?.name ?? pick : null;

  const showSelectedChampion = (isPicking || isBeingOverridden) && selectedChampion;
  const selectedChampionName = showSelectedChampion ? championByKey.get(selectedChampion)?.name ?? null : null;

  const handlePickClick = () => {
    if (pick) {
      startPickOverride(team, pickIndex);
    }
  };

  const handlePickKeyDown = (e: React.KeyboardEvent) => {
    if (pick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      startPickOverride(team, pickIndex);
    }
  };

  const statusContent = (() => {
    if (isBanning) return <span className="doing">Banning...</span>;
    if (!pick && isPicking) return <span className="doing">Picking...</span>;
    if (isBeingOverridden) return <span className="doing">Overriding...</span>;
    if (pick && champName) return <span className="cName">{champName}</span>;
    return null;
  })();

  const isPendingAction = isPicking || isBanning || isBeingOverridden;
  const shouldShowIntroVideo = isPendingAction;
  const [showOutro, setShowOutro] = useState(false);
  const wasPendingRef = useRef(false);
  const [activeTeamColor, setActiveTeamColor] = useState<string | null>(null);
  const teamColor = isBeingOverridden ? "gold" : team === 0 ? "blue" : "red";

  const displayImageSrc = showSelectedChampion
    ? `/assets/champions/${selectedChampion}.png`
    : pick
    ? `/assets/champions/${pick}.png`
    : "/assets/champions/-1.png";

  const displayImageAlt = showSelectedChampion
    ? selectedChampionName ?? selectedChampion
    : pick
    ? `Picked champion: ${champName}`
    : "Empty pick slot";

  useEffect(() => {
    if (isPendingAction && !wasPendingRef.current && introVideoRef.current) {
      setActiveTeamColor(teamColor);
      introVideoRef.current.currentTime = 0;
      introVideoRef.current.play().catch(() => console.warn("Video play failed"));
      setShowOutro(false);
    }
    if (wasPendingRef.current && !isPendingAction) {
      setShowOutro(true);
    }
    wasPendingRef.current = isPendingAction;
  }, [isPendingAction, teamColor]);

  useEffect(() => {
    if (showOutro) {
      requestAnimationFrame(() => {
        if (idleVideoRef.current) {
          idleVideoRef.current.style.display = "none";
        }

        if (outroVideoRef.current) {
          outroVideoRef.current.currentTime = 0;
          outroVideoRef.current.play().catch(() => console.warn("Video play failed"));
        }
      });
    }
  }, [showOutro]);

  const renderContent = () => (
    <>
      {statusContent}
      {showSelectedChampion && selectedChampionName && <span className="cName">{selectedChampionName}</span>}
      <span>{label}</span>
    </>
  );

  return (
    <div
      className={clsx(
        "pick-row",
        isPendingAction && "pending-action",
        showSelectedChampion && "selected-champ-frame",
        isBeingOverridden && "overriding"
      )}>
      {(shouldShowIntroVideo || showOutro) && (
        <>
          <video
            ref={introVideoRef}
            className="pick-row-video"
            muted
            playsInline
            aria-hidden="true"
            onEnded={() => {
              if (introVideoRef.current) {
                introVideoRef.current.style.display = "none";
              }
              if (idleVideoRef.current) {
                idleVideoRef.current.style.display = "block";
                idleVideoRef.current.currentTime = 0;
                idleVideoRef.current.play().catch(console.error);
              }
            }}>
            <source
              src={`/assets/animations/magic-action-${activeTeamColor || teamColor}-intro.webm`}
              type="video/webm"
            />
          </video>
          <video
            ref={idleVideoRef}
            className="pick-row-video"
            muted
            playsInline
            loop
            style={{ display: "none" }}
            aria-hidden="true">
            <source
              src={`/assets/animations/magic-action-${activeTeamColor || teamColor}-idle.webm`}
              type="video/webm"
            />
          </video>
          <video
            ref={outroVideoRef}
            className="pick-row-video"
            muted
            playsInline
            style={{ display: showOutro ? "block" : "none" }}
            aria-hidden="true"
            onEnded={() => {
              setShowOutro(false);
              setActiveTeamColor(null);
            }}>
            <source
              src={`/assets/animations/magic-action-${activeTeamColor || teamColor}-outro.webm`}
              type="video/webm"
            />
          </video>
        </>
      )}
      {team === 0 ? (
        <>
          <div
            className={clsx("pick-row-image-wrapper", pick && "swappable")}
            onClick={pick ? handlePickClick : undefined}
            onKeyDown={pick ? handlePickKeyDown : undefined}
            tabIndex={pick ? pickTabIndex : -1}
            role={pick ? "button" : undefined}
            aria-label={pick ? `Override ${teamDisplayName} ${champName ?? pick}` : undefined}
            aria-disabled={!pick}>
            <img src={displayImageSrc} alt={displayImageAlt} decoding="async" />
          </div>
          <div>{renderContent()}</div>
        </>
      ) : (
        <>
          <div>{renderContent()}</div>
          <div
            className={clsx("pick-row-image-wrapper", pick && "swappable")}
            onClick={pick ? handlePickClick : undefined}
            onKeyDown={pick ? handlePickKeyDown : undefined}
            tabIndex={pick ? pickTabIndex : -1}
            role={pick ? "button" : undefined}
            aria-label={pick ? `Override ${teamDisplayName} ${champName ?? pick}` : undefined}
            aria-disabled={!pick}>
            <img src={displayImageSrc} alt={displayImageAlt} decoding="async" />
          </div>
        </>
      )}
    </div>
  );
}
