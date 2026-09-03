import Link from "next/link";
import PlayerSearch from "@/components/home/PlayerSearch";

export default function Home() {
  return <main className="min-h-screen overflow-hidden bg-[#080b12] text-slate-100">
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <div className="flex items-center gap-3 text-sm font-bold tracking-widest text-cyan-300">♜ CHESSLYSIS <span className="text-slate-600">/</span> PLAYER INTELLIGENCE</div>
      <div className="mt-16 max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[.25em] text-violet-400">Real games. Real patterns.</p>
        <h1 className="mt-5 text-5xl font-bold tracking-tight md:text-7xl">Understand the patterns behind your chess.</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">Enter any public Chess.com username. Chesslysis imports real games, stores them, and builds profile-level analytics from the actual game history.</p>
        <PlayerSearch />
        <p className="mt-3 text-sm text-slate-500">No demo fallback. If a profile cannot be loaded, you will see the real reason and can retry.</p>
      </div>
      <div className="mt-16 grid gap-4 md:grid-cols-4">
        {[["01","Import","Recent public Chess.com games"],["02","Analyze","Stockfish-backed game analysis"],["03","Understand","Openings, time, mistakes and DNA"],["04","Improve","Evidence-based training priorities"]].map(([n,a,b])=><div key={a} className="rounded-2xl border border-white/10 bg-white/[.025] p-5"><div className="font-mono text-cyan-300">{n}</div><h2 className="mt-4 font-bold">{a}</h2><p className="mt-2 text-sm text-slate-500">{b}</p></div>)}
      </div>
      <Link href="/" className="mt-8 inline-block text-sm text-cyan-300">Built for real player profiles →</Link>
    </div>
  </main>;
}
