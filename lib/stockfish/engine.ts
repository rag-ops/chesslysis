import type { StockfishAnalysisResult } from './uci';
import { StockfishUciEngine } from './uci';

export type EngineAnalysisResult = StockfishAnalysisResult;

export interface ChessEngine {
  analyze(fen: string, depth?: number): Promise<EngineAnalysisResult>;
}

/** Creates a real Stockfish UCI engine from STOCKFISH_PATH. */
export function createStockfishEngine(): ChessEngine {
  const path = process.env.STOCKFISH_PATH;
  if (!path) throw new Error('STOCKFISH_PATH is not configured');
  return new StockfishUciEngine(path);
}
