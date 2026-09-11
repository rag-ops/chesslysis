# Claude audit + fixes — 2026-09-11

Base: `chesslysis_4-main.zip`, exported from `github.com/rag-ops/chesslysis.4` at
commit `c9d5b32` (CI status: Success). This document is honest about what was
verified by reading/reasoning through code versus what could not be executed —
I have no network access in this sandbox, so `npm install`, `tsc`, `vitest`,
and `docker build` were not run here. Run `npm run verify` locally before
redeploying.

## Your four reported bugs: verified already fixed in this codebase

I traced each one to its root cause in the code rather than taking the repo's
own changelog at its word:

1. **ACPL blown up by raw mate scores (646,009.4-style numbers).** Fixed at
   the source: `lib/stockfish/uci.ts` now separates the UCI `mate` distance
   (kept as an integer, e.g. for showing "M1") from the `evaluation` used in
   any math, which is hard-capped at ±10 pawns (`MATE_EVALUATION`). Per-move
   loss is clamped to `[0, 10]` in `game-analyzer.ts`, and `lib/analysis/metrics.ts`
   adds a second layer of defense — `safeACPL`/`safeAccuracy`/`safeEvaluationLoss`
   reject any out-of-range value at *read* time too, so even old corrupted
   rows already sitting in your database render as empty rather than as
   garbage numbers. This is wired into dashboard, review, opening, time, DNA,
   insights, and recurring-mistakes — I checked call sites, not just imports.
2. **Board/eval-bar layout.** Already fixed in this codebase:
   `GameReviewBoard.tsx` puts the evaluation bar directly above the board, and
   the move list / board / analysis panel all use `lg:sticky` positioning so
   they stay in place while you scroll on desktop.
3. **Checkmate move (Rb8#) misclassified as a blunder, "best move" shown as Rbb8.**
   Root cause: comparing SAN strings is fragile because disambiguation
   (`Rb8` vs `Rbb8`) depends on the exact board state. Fixed by comparing UCI
   (unambiguous from/to squares) instead, and — as a second, independent
   safety net — any move where `chess.js` confirms the resulting position is
   checkmate is unconditionally classified `BEST` with zero loss, regardless
   of what the engine's own top line was. A move that ends the game in your
   favor cannot objectively be "improved on."
4. **Opening name showing a raw Chess.com URL.** `openingLabel()` in
   `lib/openings/player-opening-intelligence.ts` extracts and humanizes the
   URL slug, including the `Queen-s-Gambit-Declined` → `Queen's Gambit Declined`
   possessive-apostrophe edge case, and is wired into every place that
   displays an opening name.

All four have regression tests with hand-verified FEN positions
(`tests/analysis/game-analyzer.test.ts`, `tests/openings/opening-label.test.ts`).

## Found and fixed in this pass

- **Real regression**: `components/insights/PhasePerformance.tsx` and
  `components/insights/InsightTable.tsx` had reverted to raw `bg-white` /
  `bg-slate-50` / `text-slate-500` — outside what `globals.css`'s legacy-class
  compatibility bridge covers (it only maps `bg-white/[.NN]` opacity variants,
  not bare `bg-white`), so these two panels rendered with the old theme's
  near-invisible light-gray-on-white text. Migrated both to the same
  `var(--surface)` / `var(--line)` / `var(--ink)` / `var(--muted)` system used
  everywhere else in the editorial theme.
- **New Chesslysis piece set**, matching the brand sheet you provided
  (`components/chessboard/ChessPiece.tsx`, fully rewritten): original,
  hand-authored flat-vector SVGs — not a copy of any existing chess set's path
  data — sharing one base/collar system across all six pieces so they read as
  a matched family. Colors are exact: `#EDE7DB` white / `#1F1F1F` black, with
  outline strokes chosen for contrast against both this app's light-mode and
  dark-mode board square colors. I could not render/preview these — they're
  built from coordinate reasoning, not a visual tool — so if any piece (the
  knight is the riskiest one to get right by hand) looks off once you view it
  in a browser, tell me which one and I'll adjust the path data.
- **Homepage hero board used inconsistent Unicode glyphs** (`♞♟♗♔♜`, a random
  mix of "black" and "white" Unicode chess characters, not an actual reflected
  position) instead of your real piece set — the very first screen a visitor
  sees wasn't using the brand pieces at all. Now renders the same
  `ChessPiece` component as the real board, same decorative layout.

## Verified working, not just claimed (I checked the actual GitHub state)

- Repo `rag-ops/chesslysis.4` has real incremental commit history (16 CI runs
  from direct pushes, not one bulk upload) and the current `main` HEAD passes
  CI ("Status: Success", `c9d5b32`).
- `chesslysis.onrender.com` is live and serving the current build.
- Light/dark theme toggle is implemented correctly — inline `<script>` in
  `<head>` sets the class before hydration, avoiding a flash-of-wrong-theme.

## Still outstanding — needs your action, not something I can fix here

- **No `package-lock.json`.** My sandbox has no network access to hit the npm
  registry, and I won't fabricate integrity hashes. Run once, locally:
  ```
  npm install
  git add package-lock.json && git commit -m "Add lockfile"
  ```
  Then switch `Dockerfile` and CI from `npm install` to `npm ci`.
- `tests/smoke/worker-runtime.test.ts` still only asserts that certain
  strings exist in `worker.js`/`scripts-start.sh` — real coverage of worker
  behavior would need a live Postgres + spawned process, out of scope here.
- Tactical pattern detection (`lib/analysis/patterns.ts`) still only covers
  fork/pin/skewer/mate-in-1 from the piece that just moved. Hanging pieces
  and discovered attacks (not delivering check) are not implemented.
