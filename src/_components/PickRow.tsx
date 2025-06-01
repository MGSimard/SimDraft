interface PickRowProps {
  team: 0 | 1;
  order: "B1" | "B2" | "B3" | "B4" | "B5" | "R1" | "R2" | "R3" | "R4" | "R5";
}

export function PickRow({ team, order }: PickRowProps) {
  // Picking... / Banning... / Champion Name

  // Dislike using row-reverse because it breaks DOM navigability vs visual fidelity
  return (
    <div className="pick-row">
      {team === 0 ? (
        <>
          <img alt="img" />
          <div>
            <span>Picking...</span>
            <span>{order}</span>
          </div>
        </>
      ) : (
        <>
          <div>
            <span>Picking...</span>
            <span>{order}</span>
          </div>
          <img alt="img" />
        </>
      )}
    </div>
  );
}
