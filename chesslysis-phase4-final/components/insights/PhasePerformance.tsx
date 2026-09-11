type Row = { phase: string; moves: number; averageLoss: number; accuracy: number; mistakes: number; blunders: number };
export default function PhasePerformance({ rows }: { rows: Row[] }) {
  return <section className="ch-panel rounded-xl p-5">
    <h2 className="font-semibold text-[var(--ink)]">Performance by game phase</h2>
    <div className="mt-4 grid gap-3 md:grid-cols-3">
      {rows.map((row) => <div key={row.phase} className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
        <div className="capitalize font-medium text-[var(--ink)]">{row.phase}</div>
        <div className="mt-2 text-2xl font-bold text-[var(--ink)]">{row.accuracy.toFixed(1)}%</div>
        <div className="text-xs text-[var(--muted)]">Chesslysis accuracy</div>
        <div className="mt-3 text-sm">Moves: {row.moves}</div>
        <div className="text-sm">Mistakes: {row.mistakes} · Blunders: {row.blunders}</div>
      </div>)}
    </div>
  </section>;
}
