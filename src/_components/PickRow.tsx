import { useDraftStore } from "@/_store/DraftStoreProvider";
import { ACTION_TYPE, TEAM } from "@/_store/constants";
import type { TeamIndex, ActionIndex, PickLabel } from "@/_store/types";
import { championByKey } from "@/_datasets/championPreprocessed";
import React, { useRef, useEffect, useState } from "react";

interface PickRowProps {
  team: TeamIndex;
  pickIndex: ActionIndex;
  label: PickLabel;
}

export function PickRow({ team, pickIndex, label }: PickRowProps) {
  const stepDetails = useDraftStore((state) => state.getCurrentStepDetails());
  const selectedChampion = useDraftStore((state) => state.selectedChampion);
  const picks = useDraftStore((state) => state.picks);
  const introVideoRef = useRef<HTMLVideoElement>(null);
  const idleVideoRef = useRef<HTMLVideoElement>(null);
  const outroVideoRef = useRef<HTMLVideoElement>(null);
  const teamName = team === 0 ? TEAM.BLUE : TEAM.RED;
  const pick = picks[team][pickIndex];

  const isPicking =
    stepDetails?.type === ACTION_TYPE.PICK && stepDetails?.actionIndex === pickIndex && stepDetails?.team === teamName;

  const isBanning = stepDetails?.type === ACTION_TYPE.BAN && stepDetails?.team === teamName && pickIndex === 0;

  const champName = pick ? championByKey.get(pick)?.name || pick : null;

  const showSelectedChampion = isPicking && selectedChampion;
  const selectedChampionName = showSelectedChampion ? championByKey.get(selectedChampion)?.name : null;

  const statusContent = (() => {
    if (isBanning) return <span className="doing">Banning...</span>;
    if (!pick && isPicking) return <span className="doing">Picking...</span>;
    if (pick && champName) return <span className="cName">{champName}</span>;
    return null;
  })();

  const isPendingAction = isPicking || isBanning;
  const shouldShowIntroVideo = isPendingAction; // Both teams
  const [showOutro, setShowOutro] = useState(false);
  const wasPendingRef = useRef(false);
  const teamColor = team === 0 ? "blue" : "red";

  const displayImageSrc = showSelectedChampion
    ? `/assets/champions/${selectedChampion}.png`
    : pick
    ? `/assets/champions/${pick}.png`
    : "/assets/champions/-1.png";

  const displayImageAlt = showSelectedChampion ? selectedChampionName || selectedChampion : champName || "Empty slot";

  // Track when isPendingAction changes and detect lock-ins
  useEffect(() => {
    console.log(`${teamColor} PickRow ${pickIndex} pending state:`, {
      isPendingAction,
      wasPending: wasPendingRef.current,
    });

    // Start intro when action begins
    if (isPendingAction && !wasPendingRef.current && introVideoRef.current) {
      console.log(`🎬 Starting intro for: ${teamColor} ${pickIndex}`);
      introVideoRef.current.currentTime = 0;
      introVideoRef.current.play().catch(console.error);
      setShowOutro(false);
    }

    // Detect lock-in: was pending, now not pending
    if (wasPendingRef.current && !isPendingAction) {
      console.log(`🎉 LOCK-IN DETECTED! Playing outro for: ${teamColor} ${pickIndex}`);
      setShowOutro(true);
    }

    wasPendingRef.current = isPendingAction;
  }, [isPendingAction, pickIndex, teamColor]);

  // Handle outro playback when showOutro becomes true
  useEffect(() => {
    if (showOutro) {
      requestAnimationFrame(() => {
        console.log(`🔧 ${teamColor} outro effect triggered, checking refs...`);
        console.log("Refs exist:", {
          idle: !!idleVideoRef.current,
          outro: !!outroVideoRef.current,
          showOutro,
        });

        // Hide idle video and play outro
        if (idleVideoRef.current) {
          idleVideoRef.current.style.display = "none";
          console.log(`🛑 ${teamColor} idle video hidden`);
        }

        if (outroVideoRef.current) {
          outroVideoRef.current.currentTime = 0;
          outroVideoRef.current.play().catch(console.error);
          console.log(`🎬 ${teamColor} outro video started`);
        }
      });
    }
  }, [showOutro, teamColor]);

  const renderContent = () => (
    <>
      {statusContent}
      {showSelectedChampion && selectedChampionName && <span className="cName">{selectedChampionName}</span>}
      <span>{label}</span>
    </>
  );

  return (
    <div
      className={`pick-row${isPendingAction ? " pending-action" : ""}${
        showSelectedChampion ? " selected-champ-frame" : ""
      }`}>
      {(shouldShowIntroVideo || showOutro) && (
        <>
          <video
            ref={introVideoRef}
            className="pick-row-video"
            muted
            playsInline
            onEnded={() => {
              console.log(`🎬 ${teamColor} intro video ended, switching to idle`);
              if (introVideoRef.current) {
                introVideoRef.current.style.display = "none";
                console.log(`✅ ${teamColor} intro video hidden`);
              }
              if (idleVideoRef.current) {
                idleVideoRef.current.style.display = "block";
                idleVideoRef.current.currentTime = 0;
                idleVideoRef.current.play().catch(console.error);
                console.log(`✅ ${teamColor} idle video started`);
              }
            }}>
            <source src={`/assets/animations/magic-action-${teamColor}-intro.webm`} type="video/webm" />
          </video>
          <video ref={idleVideoRef} className="pick-row-video" muted playsInline loop style={{ display: "none" }}>
            <source src={`/assets/animations/magic-action-${teamColor}-idle.webm`} type="video/webm" />
          </video>
          <video
            ref={outroVideoRef}
            className="pick-row-video"
            muted
            playsInline
            style={{ display: showOutro ? "block" : "none" }}
            onEnded={() => {
              setShowOutro(false);
            }}>
            <source src={`/assets/animations/magic-action-${teamColor}-outro.webm`} type="video/webm" />
          </video>
        </>
      )}
      {team === 0 ? (
        <>
          <div className="pick-row-image">
            <img src={displayImageSrc} alt={displayImageAlt} decoding="async" />
          </div>
          <div>{renderContent()}</div>
        </>
      ) : (
        <>
          <div>{renderContent()}</div>
          <div className="pick-row-image">
            <img src={displayImageSrc} alt={displayImageAlt} decoding="async" />
          </div>
        </>
      )}
    </div>
  );
}
