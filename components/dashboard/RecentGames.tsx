type Game = {
  id: string; date: string; opponent: string; color: "White" | "Black";
  result: "Win" | "Loss" | "Draw"; accuracy?: number | null; timeControl: string;
};

function formatDate(value: string) {
  if (value === "Unknown") return value;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

export default function RecentGames({ games }: { games: Game[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="border-b p-4"><h2 className="font-semibold">Recent games</h2></div>
      {games.length === 0 ? (
        <div className="p-6 text-sm text-slate-500">No recent analyzed games available.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr><th className="px-4 py-3">Date</th><th>Opponent</th><th>Color</th><th>Result</th><th>Time control</th><th>Accuracy</th></tr>
            </thead>
            <tbody>
              {games.map(g => (
                <tr key={g.id} className="border-t">
                  <td className="px-4 py-3">{formatDate(g.date)}</td><td>{g.opponent}</td><td>{g.color}</td>
                  <td>{g.result}</td><td>{g.timeControl}</td><td>{g.accuracy == null ? "—" : `${g.accuracy.toFixed(1)}%`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
