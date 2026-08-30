# Chesslysis ♟️

Advanced chess analytics powered by Stockfish.

## Phase 1 — Foundation + Chess.com Import

Chesslysis imports a player's publicly available Chess.com games by username, stores the raw games and generated positions, and prepares them for Stockfish analysis.

### Current milestone: P1.2

- Username-based Chess.com game discovery
- Monthly archive discovery through the official Chess.com PubAPI
- Serial archive fetching to reduce rate-limit risk
- Date-range filtering
- Time-control filtering
- Maximum-game limit
- Duplicate protection using Chess.com UUID/game URL
- PGN validation and position generation
- PostgreSQL persistence through Prisma
- Import API: `POST /api/players/import`

Chess.com documents the PubAPI as a read-only API for public player/game data. It also notes that responses may be cached for up to 12 hours and that parallel requests can trigger rate limiting, so the importer deliberately processes archives serially. citeturn0search0

## Development

```bash
npm install
cp .env.example .env
npm run db:generate
npm run db:push
npm run dev
```

Set a descriptive `CHESSCOM_USER_AGENT` in `.env` with a way to contact you, as recommended by Chess.com's PubAPI guidance.

## Import request

```json
{
  "username": "your_username",
  "maxGames": 100,
  "timeClasses": ["rapid", "blitz"],
  "from": "2026-01-01",
  "to": "2026-08-26"
}
```

## Architecture

```text
Chess.com PubAPI
      ↓
Archive discovery
      ↓
Monthly game JSON
      ↓
Filter + deduplicate
      ↓
PGN parser / position generator
      ↓
PostgreSQL
      ↓
Analysis queue
      ↓
Stockfish
      ↓
Move classifications
      ↓
Player analytics
```

## Next

P1.3 will harden PGN/position parsing and add tests. P1.4 will connect the Stockfish worker and persist engine evaluations.

## P1.3 — PGN & Position Reliability

The parser now treats PGN as an input boundary and produces one normalized position record per main-line ply. Each record includes SAN, UCI, FEN before/after, capture/check/castling/promotion flags, and move number/ply.

The test suite covers:
- standard opening moves and FEN transitions
- castling
- captures and promotions
- checks/checkmate
- comments and variations
- malformed and move-less PGNs

Run locally with:

```bash
npm install
npm test
```


## Phase 1.4 — Stockfish

Chesslysis now includes a UCI Stockfish adapter. Set `STOCKFISH_PATH` to a local Stockfish executable. The adapter speaks the standard UCI protocol and returns depth, evaluation, mate score, best move, and principal variation.

The Stockfish executable itself is intentionally not committed to the repository because it is platform-specific. For production, the same adapter can run in a dedicated analysis worker.


## P1.5 — Move analysis

`POST /api/games/:gameId/analyze` runs Stockfish sequentially for each stored position, compares the played move's resulting evaluation with the best evaluation, classifies the move, and stores game-level statistics.

`GET /api/games/:gameId/analysis` returns the persisted move analysis and statistics.

Set `STOCKFISH_PATH` to a local Stockfish binary. Set `STOCKFISH_VERSION` optionally for display metadata.

The v1 accuracy metric is a Chesslysis-specific transparent metric and is not intended to reproduce Chess.com's proprietary accuracy formula.

## P1.6 — Game Review UI

Added the first interactive review surface:
- `/games/[gameId]`
- interactive board driven by stored FEN positions
- move navigation and move list
- selected-move engine details
- evaluation graph
- review API contract
- UI contract tests

The UI is intentionally separated from the Prisma repository layer so presentation can be tested independently. The page currently uses a development-safe placeholder loader until the persisted review payload is wired in.

## P1.7 — Player Dashboard

Added:
- `/dashboard/[username]`
- games analyzed, win rate, average accuracy, average ACPL and blunders/game cards
- results distribution
- accuracy trend visualization
- recent games table
- dashboard API contract
- dashboard unit/contract tests

The dashboard currently uses a safe development loader. The next data-integration step will replace it with Prisma aggregations over persisted game statistics.

## P1.8 — Data Integration + Performance

Added:
- Prisma-backed player dashboard aggregation
- completed-game filtering
- player-perspective accuracy, ACPL and blunder aggregation
- recent-game transformation
- 30-second dashboard cache
- dashboard API backed by persisted data
- data-integration tests

The cache is intentionally simple for the MVP and can later be replaced by a shared cache when analysis workers are distributed.

## P1.9 — Testing & Hardening

Added a reliability layer covering:
- Zod API validation contracts
- Stockfish/analysis timeout utility
- PGN edge-case tests for castling, promotion and checkmate
- move-classification tests
- dashboard statistic tests
- import batch/deduplication contracts
- architecture smoke test

Run the suite locally with:

```bash
npm install
npm test
```

The test suite is designed to catch regressions before deployment. Environment-dependent integration tests should be run with a configured PostgreSQL database and Stockfish binary.

## P1.10 — Production Stabilization

The deployment setup was audited and corrected for the build failures found during Docker testing:

- pinned compatible Node/Next/React/Prisma versions instead of using `latest`
- added missing Tailwind/PostCSS dependencies
- added explicit `prisma generate` before `next build`
- enabled Next standalone output for Docker
- removed build-time copying of `.env.local`
- added `.dockerignore`
- fixed Prisma client export mismatch and dashboard queries
- fixed nullable date/time-control handling
- connected the game review and dashboard pages to real database repositories
- added health endpoint and CI verification steps

### Production commands

```bash
cp .env.example .env.local
npm install
npx prisma generate
npm run typecheck
npm test
npm run build
```

Docker:

```bash
docker compose up --build
```

For a first local database setup:

```bash
docker compose exec app npx prisma db push
```

## Phase 2 — Advanced Insights (P2.1 started)

The first profile-wide insights layer adds:

- performance by color
- performance by opening
- performance by time control
- opening/middlegame/endgame loss patterns
- weakest-phase detection
- profile-level accuracy trend data
- `/api/players/[username]/insights`
- `/insights/[username]`

The current phase boundaries use a transparent ply-based heuristic. A later P2 milestone will replace this with board-state/material-aware phase detection and deeper recurring-mistake clustering.


## Phase 2.2 — Frontend & Backend Integration

This phase separates the presentation layer from the database layer:

`Client UI → Next.js API Route → Service Layer → Prisma → PostgreSQL`

### Added
- client-side dashboard API integration
- client-side advanced insights API integration
- loading, error and empty states
- retry handling for transient API failures
- safe API error responses instead of raw server exception pages
- built-in `/dashboard/demo` and `/insights/demo` fixtures that work without a database
- username search/navigation from the landing page
- cross-navigation between dashboard and advanced insights

The demo user is intentionally API-backed, so the frontend integration path is the same as for real users.
