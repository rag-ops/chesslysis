import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { once } from 'node:events';

export type UciInfo = {
  depth?: number;
  scoreCp?: number;
  scoreMate?: number;
  pv?: string[];
};

export type StockfishAnalysisResult = {
  depth: number;
  evaluation: number;
  mate: number | null;
  bestMove: string | null;
  principalVariation: string[];
};

function parseInfo(line: string): UciInfo | null {
  if (!line.startsWith('info ')) return null;
  const tokens = line.trim().split(/\s+/);
  const info: UciInfo = {};
  const depthIndex = tokens.indexOf('depth');
  if (depthIndex >= 0) info.depth = Number(tokens[depthIndex + 1]);
  const scoreIndex = tokens.indexOf('score');
  if (scoreIndex >= 0) {
    const kind = tokens[scoreIndex + 1];
    const value = Number(tokens[scoreIndex + 2]);
    if (kind === 'cp' && Number.isFinite(value)) info.scoreCp = value;
    if (kind === 'mate' && Number.isFinite(value)) info.scoreMate = value;
  }
  const pvIndex = tokens.indexOf('pv');
  if (pvIndex >= 0) info.pv = tokens.slice(pvIndex + 1);
  return info;
}

export function parseUciBestMove(line: string): string | null {
  const match = /^bestmove\s+(\S+)/.exec(line.trim());
  return match?.[1] ?? null;
}

export function parseUciScore(info: UciInfo): { evaluation: number; mate: number | null } {
  if (typeof info.scoreMate === 'number') return { evaluation: info.scoreMate > 0 ? 100000 : -100000, mate: info.scoreMate };
  return { evaluation: (info.scoreCp ?? 0) / 100, mate: null };
}

export class StockfishUciEngine {
  private process: ChildProcessWithoutNullStreams | null = null;
  private buffer = '';
  private lines: string[] = [];

  constructor(private readonly executablePath: string) {}

  private async start(): Promise<void> {
    if (this.process) return;
    this.process = spawn(this.executablePath, [], { stdio: 'pipe' });
    this.process.stdout.setEncoding('utf8');
    this.process.stderr.setEncoding('utf8');
    this.process.stdout.on('data', (chunk: string) => {
      this.buffer += chunk;
      const parts = this.buffer.split(/\r?\n/);
      this.buffer = parts.pop() ?? '';
      this.lines.push(...parts);
    });
    this.process.on('error', () => undefined);
    this.send('uci');
    await this.waitFor('uciok');
    this.send('isready');
    await this.waitFor('readyok');
  }

  private send(command: string) {
    if (!this.process) throw new Error('Stockfish process is not running');
    this.process.stdin.write(`${command}\n`);
  }

  private async waitFor(expected: string, timeoutMs = 10000): Promise<string[]> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const index = this.lines.findIndex((line) => line.trim() === expected);
      if (index >= 0) return this.lines.splice(0, index + 1);
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    throw new Error(`Stockfish timeout waiting for ${expected}`);
  }

  async analyze(fen: string, depth = 18): Promise<StockfishAnalysisResult> {
    await this.start();
    this.lines = [];
    this.send(`position fen ${fen}`);
    this.send(`go depth ${depth}`);
    const lines = await this.waitForBestMove();

    let latest: UciInfo = {};
    for (const line of lines) {
      const parsed = parseInfo(line);
      if (parsed && typeof parsed.depth === 'number') latest = parsed;
    }

    const score = parseUciScore(latest);
    return {
      depth: latest.depth ?? depth,
      evaluation: score.evaluation,
      mate: score.mate ?? null,
      bestMove: lines.map(parseUciBestMove).find(Boolean) ?? null,
      principalVariation: latest.pv ?? [],
    };
  }

  private async waitForBestMove(timeoutMs = 120000): Promise<string[]> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const index = this.lines.findIndex((line) => line.startsWith('bestmove '));
      if (index >= 0) return this.lines.splice(0, index + 1);
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    throw new Error('Stockfish analysis timed out');
  }

  async close(): Promise<void> {
    if (!this.process) return;
    this.send('quit');
    await Promise.race([once(this.process, 'exit'), new Promise((resolve) => setTimeout(resolve, 1000))]);
    if (!this.process.killed) this.process.kill();
    this.process = null;
  }
}
