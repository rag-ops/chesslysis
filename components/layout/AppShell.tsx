"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";

const nav = [
  ["Overview", "▦", "dashboard"],
  ["Openings & Tactics", "♞", "insights"],
  ["Recurring Mistakes", "◉", "mistakes"],
  ["Game Inspector", "⌁", "games"],
  ["Player DNA", "✦", "dna"],
  ["Time Management", "◷", "time"],
];

export default function AppShell({ username, children }: { username: string; children: ReactNode }) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const links: Record<string, string> = {
    dashboard: `/dashboard/${encodeURIComponent(username)}`,
    insights: `/insights/${encodeURIComponent(username)}`,
    mistakes: `/mistakes/${encodeURIComponent(username)}`,
    games: `/inspector/${encodeURIComponent(username)}`,
    dna: `/dna/${encodeURIComponent(username)}`,
    time: `/insights/${encodeURIComponent(username)}#time`,
  };
  return (
    <div className="min-h-screen bg-[#080b12] text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-white/10 bg-[#0b0f18] p-4 lg:flex lg:flex-col">
        <Link href="/" className="mb-10 flex items-center gap-3 px-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-cyan-400/10 text-lg text-cyan-300">♜</span>
          <span className="font-bold tracking-tight">CHESSLYSIS</span>
        </Link>
        <nav className="space-y-1">
          {nav.map(([label, icon, key]) => {
            const href = links[key];
            const active = (key === "dashboard" && pathname.startsWith("/dashboard")) || (key === "insights" && pathname.startsWith("/insights")) || (key === "mistakes" && pathname.startsWith("/mistakes"));
            return <Link key={key} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${active ? "bg-white/10 text-white shadow-[0_0_20px_rgba(6,182,212,.12)]" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
              <span className={active ? "text-cyan-300" : "text-slate-500"}>{icon}</span>{label}
            </Link>;
          })}
        </nav>
        <div className="mt-auto border-t border-white/10 pt-4 text-xs text-slate-500">Chess intelligence, not just statistics.</div>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-[#080b12]/90 px-4 py-3 backdrop-blur lg:px-8">
          <div className="mx-auto flex max-w-[1600px] items-center gap-3">
            <Link href="/" className="mr-2 text-lg font-bold lg:hidden">♜</Link>
            <div className="hidden min-w-0 flex-1 items-center gap-2 rounded-lg border border-white/10 bg-white/[.03] px-3 py-2 md:flex">
              <span className="text-slate-500">⌕</span>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search openings, opponents, PGNs..." className="w-full bg-transparent text-sm outline-none placeholder:text-slate-600" />
              <kbd className="rounded border border-white/10 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">⌘ K</kbd>
            </div>
            <span className="hidden text-xs text-slate-500 sm:block">All · Last 30 Days</span>
            <Link href={`/insights/${encodeURIComponent(username)}`} className="rounded-lg bg-emerald-400 px-3 py-2 text-xs font-bold text-[#052016]">Analyze Profile</Link>
            <div className="grid h-8 w-8 place-items-center rounded-full bg-violet-500/20 text-xs font-bold text-violet-300">{username.slice(0,2).toUpperCase()}</div>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
