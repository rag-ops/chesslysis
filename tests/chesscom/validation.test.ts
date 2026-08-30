import { describe, expect, it } from "vitest";

describe("Chess.com importer contract", () => {
  it("accepts normal Chess.com username characters", () => {
    expect(/^[A-Za-z0-9_-]{3,25}$/.test("hikaru")).toBe(true);
    expect(/^[A-Za-z0-9_-]{3,25}$/.test("player_123")).toBe(true);
  });

  it("rejects malformed usernames", () => {
    expect(/^[A-Za-z0-9_-]{3,25}$/.test("ab")).toBe(false);
    expect(/^[A-Za-z0-9_-]{3,25}$/.test("bad name")).toBe(false);
  });
});
