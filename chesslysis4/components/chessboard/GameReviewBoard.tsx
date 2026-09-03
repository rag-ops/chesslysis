 "use client";

import { useMemo, useState } from "react";
import { Chess } from "chess.js";

type Move = {
  ply: number; moveNumber: number; color: "w" | "b";
  san: string; fenAfter: string;
};

type Analysis = {
  evaluationAfter: number | null;
  bestMove: string | null;
  principalVariation: string[];
  evaluationLoss: number;
  classification: string;
};

export default function GameReviewBoard({
  moves, analyses = {}
}: { moves: Move[]; analyses?: Record<number, Analysis> }) {
  const [index, setIndex] = useState(-1);
  const fen = index < 0 ? new Chess().fen() : (moves[index]?.fenAfter ?? new Chess().fen());
  const chess = useMemo(() => {
    const c = new Chess();
    try { c.load(fen); } catch {}
    return c;
  }, [fen]);
  const current = index >= 0 ? moves[index] : undefined;
  const analysis = current ? analyses[current.ply] : undefined;
  const board = chess.board();
  const files = ["a","b","c","d","e","f","g","h"];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(320px,640px)_1fr]">
      <section>
        <div className="aspect-square overflow-hidden rounded-xl border border-white/10 bg-[#0d1320] shadow-2xl shadow-black/20">
          <div className="grid h-full grid-cols-8">
            {board.flatMap((row, r) => row.map((piece, c) => (
              <div key={`${r}-${c}`}
                className={`flex items-center justify-center text-[clamp(1.6rem,5vw,3.3rem)] ${((r+c)%2) ? "bg-slate-600" : "bg-slate-200"}`}
                aria-label={`${files[c]}${8-r}`}>
                {piece ? pieceUnicode(piece.color, piece.type) : ""}
              </div>
            )))}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button className="rounded border border-white/10 bg-white/[.03] px-3 py-2 text-slate-200 hover:bg-white/[.07]" onClick={() => setIndex(-1)}>Start</button>
          <button className="rounded border border-white/10 bg-white/[.03] px-3 py-2 text-slate-200 hover:bg-white/[.07]" onClick={() => setIndex(Math.max(-1, index-1))}>←</button>
          <button className="rounded border border-white/10 bg-white/[.03] px-3 py-2 text-slate-200 hover:bg-white/[.07]" onClick={() => setIndex(Math.min(moves.length-1, index+1))}>→</button>
          <span className="ml-auto text-sm text-slate-400">
            {current ? `${current.moveNumber}${current.color === "b" ? "..." : "."} ${current.san}` : "Starting position"}
          </span>
        </div>
      </section>

      <section className="space-y-4">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex justify-between">
            <h2 className="font-semibold">Move analysis</h2>
            <span className="font-mono">
              {analysis?.evaluationAfter == null ? "—" : formatEval(analysis.evaluationAfter)}
            </span>
          </div>
          {analysis && (
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Stat label="Classification" value={analysis.classification} />
              <Stat label="Evaluation loss" value={analysis.evaluationLoss.toFixed(2)} />
              <Stat label="Best move" value={analysis.bestMove ?? "—"} />
              <Stat label="Principal variation" value={analysis.principalVariation.slice(0,5).join(" ") || "—"} />
            </div>
          )}
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="mb-3 font-semibold">Moves</h2>
          <div className="max-h-80 overflow-y-auto grid grid-cols-2 gap-1">
            {moves.map((m, i) => (
              <button key={m.ply} onClick={() => setIndex(i)}
                className={`rounded px-2 py-1 text-left text-sm ${i === index ? "bg-cyan-400 text-slate-950" : "hover:bg-white/[.06]"}`}>
                {m.moveNumber}{m.color === "w" ? "." : "..."} {m.san}
                <span className="float-right text-xs opacity-60">{analyses[m.ply]?.classification ?? ""}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({label, value}: {label:string; value:string}) {
  return <div className="rounded-lg bg-white/[.04] p-3"><div className="text-xs text-slate-500">{label}</div><div className="mt-1 truncate font-medium">{value}</div></div>;
}
function formatEval(v:number) { return `${v >= 0 ? "+" : ""}${v.toFixed(2)}`; }
function pieceUnicode(color:"w"|"b", type:string) {
  const m = color === "w"
    ? {k:"♔",q:"♕",r:"♖",b:"♗",n:"♘",p:"♙"}
    : {k:"♚",q:"♛",r:"♜",b:"♝",n:"♞",p:"♟"};
  return m[type as keyof typeof m] ?? "";
}
