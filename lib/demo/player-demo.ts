export const demoUsername = "demo";

export const demoDashboard = {
  username: "Demo Player",
  stats: {
    gamesAnalyzed: 24,
    winRate: 58.3,
    averageAccuracy: 84.7,
    averageACPL: 31.8,
    blundersPerGame: 0.42,
  },
  resultSeries: [
    "win","loss","win","draw","win","win","loss","win","draw","win","loss","win",
    "win","draw","loss","win","win","loss","win","draw","win","win","loss","win",
  ].map((result, i) => ({
    result: result as "win" | "loss" | "draw",
    date: new Date(Date.UTC(2026, 6, i + 1)).toISOString(),
  })),
  accuracyTrend: [78,81,76,83,85,80,87,89,84,91,88,86].map((accuracy, i) => ({
    date: new Date(Date.UTC(2026, 6, i + 1)).toISOString(),
    accuracy,
  })),
  recentGames: [
    ["24","tacticalKnight","White","Win",91.2,"10+0"],
    ["23","quietbishop","Black","Draw",84.5,"10+0"],
    ["22","openFile","White","Win",88.7,"15+10"],
    ["21","endgamePro","Black","Loss",72.1,"10+0"],
    ["20","rookRunner","White","Win",93.0,"10+0"],
  ].map(([id, opponent, color, result, accuracy, timeControl]) => ({
    id: String(id),
    date: `2026-07-${String(Number(id)).padStart(2, "0")}`,
    opponent: String(opponent),
    color: color as "White" | "Black",
    result: result as "Win" | "Loss" | "Draw",
    accuracy: Number(accuracy),
    timeControl: String(timeControl),
  })),
};

export const demoInsights = {
  username: "Demo Player",
  gamesAnalyzed: 24,
  summary: {
    strongestColor: "White",
    weakestPhase: "endgame",
    overallAccuracy: 84.7,
  },
  colorPerformance: [
    { color: "White", games: 13, winRate: 69.2, accuracy: 87.9 },
    { color: "Black", games: 11, winRate: 45.5, accuracy: 80.9 },
  ],
  phasePerformance: [
    { phase: "opening", moves: 198, averageLoss: 0.16, accuracy: 90.1, mistakes: 3, blunders: 0 },
    { phase: "middlegame", moves: 302, averageLoss: 0.38, accuracy: 82.6, mistakes: 7, blunders: 3 },
    { phase: "endgame", moves: 126, averageLoss: 0.64, accuracy: 74.8, mistakes: 5, blunders: 4 },
  ],
  openings: [
    { opening: "Sicilian Defense", games: 6, winRate: 66.7, accuracy: 88.1 },
    { opening: "Italian Game", games: 5, winRate: 60.0, accuracy: 86.4 },
    { opening: "Queen's Gambit", games: 4, winRate: 50.0, accuracy: 83.2 },
  ],
  timeControls: [
    { timeControl: "10+0", games: 15, winRate: 60.0, accuracy: 85.6 },
    { timeControl: "15+10", games: 6, winRate: 50.0, accuracy: 82.8 },
    { timeControl: "5+0", games: 3, winRate: 66.7, accuracy: 79.4 },
  ],
  trend: [78,81,76,83,85,80,87,89,84,91,88,86].map((accuracy, i) => ({
    date: new Date(Date.UTC(2026, 6, i + 1)).toISOString(),
    accuracy,
  })),
};

export const demoMistakes = {
  username: "Demo Player",
  gamesAnalyzed: 24,
  summary: { primaryWeakness: "Endgame conversion", affectedGames: 12, totalCriticalErrors: 37 },
  patterns: [
    { theme: "Endgame conversion", occurrences: 14, gamesAffected: 12, averageLoss: 1.18, severity: 86, examples: [{ gameId: "24", san: "Kf4?", ply: 74, phase: "endgame", loss: 1.7 }, { gameId: "21", san: "b4?", ply: 68, phase: "endgame", loss: 1.4 }] },
    { theme: "Tactical oversight", occurrences: 10, gamesAffected: 8, averageLoss: 0.94, severity: 71, examples: [{ gameId: "23", san: "Bxh7+?", ply: 35, phase: "middlegame", loss: 1.2 }] },
    { theme: "Opening accuracy", occurrences: 7, gamesAffected: 6, averageLoss: 0.61, severity: 52, examples: [{ gameId: "20", san: "a6?!", ply: 12, phase: "opening", loss: 0.8 }] },
    { theme: "Calculation breakdown", occurrences: 6, gamesAffected: 5, averageLoss: 0.77, severity: 48, examples: [{ gameId: "22", san: "Re1?", ply: 42, phase: "middlegame", loss: 1.0 }] },
  ],
};
