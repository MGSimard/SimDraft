import { useDraftStore } from "@/lib/store/draftStore";
import { ACTION_TYPE, TEAM } from "@/lib/store/constants";
import type { TeamIndex, ActionIndex, PickLabel } from "@/lib/store/types";
import { championByKey } from "@/datasets/championPreprocessed";
import React, { useRef, useEffect, useState } from "react";
import { clsx } from "clsx";

interface PickRowProps {
  team: TeamIndex;
  pickIndex: ActionIndex;
  label: PickLabel;
}

type VideoPhase = "hidden" | "intro" | "idle" | "outro";

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
  const [videoPhase, setVideoPhase] = useState<VideoPhase>("hidden");
  const wasPendingRef = useRef(false);
  const isPendingActionRef = useRef(isPendingAction);
  const [activeTeamColor, setActiveTeamColor] = useState<string | null>(null);
  const teamColor = isBeingOverridden ? "gold" : team === 0 ? "blue" : "red";

  isPendingActionRef.current = isPendingAction;

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

  const stopVideo = (video: HTMLVideoElement | null) => {
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  };

  const playVideo = (video: HTMLVideoElement | null) => {
    if (!video) return;
    video.currentTime = 0;
    video.play().catch(() => console.warn("Video play failed"));
  };

  useEffect(() => {
    if (isPendingAction && !wasPendingRef.current) {
      setActiveTeamColor(teamColor);
      setVideoPhase("intro");
    }
    if (wasPendingRef.current && !isPendingAction) {
      setVideoPhase("outro");
    }
    wasPendingRef.current = isPendingAction;
  }, [isPendingAction, teamColor]);

  useEffect(() => {
    if (videoPhase === "hidden") {
      stopVideo(introVideoRef.current);
      stopVideo(idleVideoRef.current);
      stopVideo(outroVideoRef.current);
      setActiveTeamColor(null);
      return;
    }

    if (videoPhase === "intro") {
      stopVideo(idleVideoRef.current);
      stopVideo(outroVideoRef.current);
      playVideo(introVideoRef.current);
      return;
    }

    if (videoPhase === "idle") {
      stopVideo(introVideoRef.current);
      stopVideo(outroVideoRef.current);
      playVideo(idleVideoRef.current);
      return;
    }

    stopVideo(introVideoRef.current);
    stopVideo(idleVideoRef.current);
    playVideo(outroVideoRef.current);
  }, [videoPhase]);

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
      {videoPhase !== "hidden" && (
        <>
          <video
            ref={introVideoRef}
            className={clsx("pick-row-video", videoPhase === "intro" && "is-visible")}
            muted={true}
            playsInline={true}
            loop={false}
            preload="auto"
            aria-hidden="true"
            onEnded={() => {
              setVideoPhase(isPendingActionRef.current ? "idle" : "outro");
            }}>
            <source
              src={`/assets/animations/magic-action-${activeTeamColor || teamColor}-intro.webm`}
              type="video/webm"
            />
          </video>
          <video
            ref={idleVideoRef}
            className={clsx("pick-row-video", videoPhase === "idle" && "is-visible")}
            muted={true}
            playsInline={true}
            loop={true}
            preload="auto"
            aria-hidden="true">
            <source
              src={`/assets/animations/magic-action-${activeTeamColor || teamColor}-idle.webm`}
              type="video/webm"
            />
          </video>
          <video
            ref={outroVideoRef}
            className={clsx("pick-row-video", videoPhase === "outro" && "is-visible")}
            muted={true}
            playsInline={true}
            loop={false}
            preload="auto"
            aria-hidden="true"
            onEnded={() => {
              setVideoPhase("hidden");
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
            <div>
              <img src={displayImageSrc} alt={displayImageAlt} decoding="async" />
            </div>
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
            <div>
              <img src={displayImageSrc} alt={displayImageAlt} decoding="async" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
