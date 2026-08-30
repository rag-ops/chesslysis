type Game = { result: "win" | "loss" | "draw"; date: string };

export default function ResultsChart({ games }: { games: Game[] }) {
  const counts = {
    wins: games.filter(g => g.result === "win").length,
    draws: games.filter(g => g.result === "draw").length,
    losses: games.filter(g => g.result === "loss").length,
  };
  const max = Math.max(1, counts.wins, counts.draws, counts.losses);

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <h2 className="font-semibold">Results</h2>
      <div className="mt-5 space-y-3">
        {[
          ["Wins", counts.wins],
          ["Draws", counts.draws],
          ["Losses", counts.losses],
        ].map(([label, value]) => (
          <div key={label as string}>
            <div className="mb-1 flex justify-between text-sm">
              <span>{label}</span><span>{value}</span>
            </div>
            <div className="h-2 rounded bg-slate-100">
              <div className="h-2 rounded bg-slate-800" style={{ width: `${(Number(value) / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
