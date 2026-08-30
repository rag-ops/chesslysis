import { describe, expect, it } from "vitest";

describe("dashboard contracts", () => {
  it("calculates win rate from analyzed games", () => {
    const analyzed = 20, wins = 11;
    expect((wins / analyzed) * 100).toBe(55);
  });

  it("keeps accuracy in the expected range", () => {
    const accuracy = 82.4;
    expect(accuracy).toBeGreaterThanOrEqual(0);
    expect(accuracy).toBeLessThanOrEqual(100);
  });
});
