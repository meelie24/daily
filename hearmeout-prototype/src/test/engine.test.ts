import { describe, expect, it } from "vitest";
import { MF02Engine } from "../exercise/mf02Engine";
import { evaluateResult, strengthForHold } from "../exercise/mf02FixtureConfig";
import type { TurnTrace } from "../types/mf02";

/** Advance the simulation in small, frame-sized steps. */
function advance(engine: MF02Engine, ms: number) {
  let left = ms;
  while (left > 0) {
    const step = Math.min(50, left);
    engine.tick(step);
    left -= step;
  }
}

function makeTrace(partial: Partial<TurnTrace>): TurnTrace {
  return {
    phaseId: "handoff",
    elapsedInPhaseMs: 4000,
    holdDurationMs: 800,
    strength: "steady",
    overlap: false,
    outcome: "settled",
    ...partial,
  };
}

describe("hold thresholds", () => {
  it("maps hold duration to strength using the fixture thresholds", () => {
    expect(strengthForHold(200)).toBe("light");
    expect(strengthForHold(519)).toBe("light");
    expect(strengthForHold(520)).toBe("steady");
    expect(strengthForHold(1180)).toBe("steady");
    expect(strengthForHold(1181)).toBe("strong");
  });
});

describe("MF02 engine", () => {
  it("creates a trace entry from a held input", () => {
    const engine = new MF02Engine();
    engine.startGame();
    // Phase 1 intro: Avery 2600, gap 900, Sam 2400, then a 2400 gap.
    // Release deep enough into the gap that neither edge is near.
    advance(engine, 5900 + 900);
    expect(engine.beginHold()).toBe(true);
    advance(engine, 600);
    const trace = engine.endHold();
    expect(trace).not.toBeNull();
    expect(trace!.phaseId).toBe("handoff");
    expect(trace!.strength).toBe("steady");
    expect(trace!.overlap).toBe(false);
    expect(trace!.outcome).toBe("settled");
    expect(engine.getTraces()).toHaveLength(1);
  });

  it("marks a release during another turn as overlap", () => {
    const engine = new MF02Engine();
    engine.startGame();
    // Release while Avery is still mid-turn.
    advance(engine, 1000);
    engine.beginHold();
    advance(engine, 300);
    const trace = engine.endHold();
    expect(trace!.overlap).toBe(true);
    expect(trace!.outcome).toBe("crowded");
  });

  it("advances the phase after two turns", () => {
    const engine = new MF02Engine();
    engine.startGame();
    advance(engine, 5900 + 1200);
    engine.beginHold();
    advance(engine, 700);
    engine.endHold();
    advance(engine, 1600); // consequence beat
    expect(engine.getPhaseIndex()).toBe(0);
    engine.beginHold();
    advance(engine, 700);
    engine.endHold();
    advance(engine, 1600);
    expect(engine.getPhaseIndex()).toBe(1);
    expect(engine.getTraces()).toHaveLength(2);
  });

  it("finishes after six turns and reports a result from the real trace", () => {
    const engine = new MF02Engine();
    engine.startGame();
    for (let i = 0; i < 6; i++) {
      // Send immediately each time: deliberately sloppy turns.
      engine.sendWithStrength("strong");
      advance(engine, 1700);
    }
    expect(engine.getResult()).not.toBeNull();
    expect(engine.getTraces()).toHaveLength(6);
  });

  it("clears the trace on reset", () => {
    const engine = new MF02Engine();
    engine.startGame();
    advance(engine, 7000);
    engine.beginHold();
    advance(engine, 600);
    engine.endHold();
    expect(engine.getTraces()).toHaveLength(1);
    engine.reset();
    expect(engine.getTraces()).toHaveLength(0);
    expect(engine.getResult()).toBeNull();
    expect(engine.getPhaseIndex()).toBe(0);
  });

  it("holds the room under controlled pace and resumes without losing judgment", () => {
    const engine = new MF02Engine();
    engine.setControlledPace(true);
    engine.startGame();
    advance(engine, 5900 + 1000);
    expect(engine.isWaitingForPace()).toBe(true);
    expect(engine.isPaused()).toBe(true);
    // The world is frozen; releasing the hold point resumes it.
    engine.releasePaceHold();
    expect(engine.isPaused()).toBe(false);
    // A turn sent in the held gap still judges cleanly (not overlap).
    engine.beginHold();
    advance(engine, 700);
    const trace = engine.endHold();
    expect(trace!.overlap).toBe(false);
  });

  it("pauses for help and visibility reasons", () => {
    const engine = new MF02Engine();
    engine.startGame();
    engine.pause("help");
    const before = engine.getSnapshot().worldMs;
    advance(engine, 1000);
    expect(engine.getSnapshot().worldMs).toBe(before);
    engine.resume("help");
    advance(engine, 500);
    expect(engine.getSnapshot().worldMs).toBeGreaterThan(before);
  });
});

describe("fixture result rules", () => {
  it("returns demonstrated for four settled turns across all phases with two strengths", () => {
    const traces: TurnTrace[] = [
      makeTrace({ phaseId: "handoff", strength: "steady" }),
      makeTrace({ phaseId: "handoff", strength: "light" }),
      makeTrace({ phaseId: "room-change", strength: "light" }),
      makeTrace({
        phaseId: "room-change",
        strength: "strong",
        overlap: true,
        outcome: "crowded",
      }),
      makeTrace({ phaseId: "call-closer", strength: "strong" }),
      makeTrace({
        phaseId: "call-closer",
        strength: "light",
        outcome: "faded",
      }),
    ];
    expect(evaluateResult(traces)).toBe("demonstrated");
  });

  it("returns crowded for three or more crowded turns", () => {
    const traces: TurnTrace[] = [
      makeTrace({ outcome: "crowded", overlap: true }),
      makeTrace({ outcome: "crowded", overlap: true, phaseId: "room-change" }),
      makeTrace({ outcome: "crowded", overlap: true, phaseId: "call-closer" }),
      makeTrace({ phaseId: "call-closer" }),
    ];
    expect(evaluateResult(traces)).toBe("crowded");
  });

  it("returns incomplete otherwise", () => {
    const traces: TurnTrace[] = [
      makeTrace({}),
      makeTrace({ outcome: "faded", strength: "light", phaseId: "call-closer" }),
    ];
    expect(evaluateResult(traces)).toBe("incomplete");
  });

  it("does not count settled turns in a single phase as demonstrated", () => {
    const traces: TurnTrace[] = [
      makeTrace({ strength: "light" }),
      makeTrace({ strength: "steady" }),
      makeTrace({ strength: "strong" }),
      makeTrace({ strength: "steady" }),
    ];
    expect(evaluateResult(traces)).toBe("incomplete");
  });
});
