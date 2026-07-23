import {
  ambientLoop,
  consequenceCues,
  crowdedCueFor,
  evaluateResult,
  outcomeForRelease,
  overlapWindowMs,
  phases,
  strengthForHold,
  turnsPerPhase,
  type ScriptSegment,
} from "./mf02FixtureConfig";
import type {
  CharacterId,
  CharacterMood,
  Outcome,
  ResultKind,
  SceneEvent,
  SceneSnapshot,
  Strength,
  TurnTrace,
} from "../types/mf02";

export type PauseReason = "hidden" | "help" | "narration" | "pace";

type EngineMode = "ambient" | "game" | "done";

const USER_TURN_TRAVEL_MS = 550;
const CONSEQUENCE_BEAT_MS = 1500;
const JORDAN_ENTRY_MS = 2400;
const PACE_HOLD_GAP_MS = 900;

const CAST: CharacterId[] = ["avery", "sam", "riley", "jordan"];

/**
 * Deterministic simulation for the MF02 evaluation. The engine owns the
 * world clock, the authored phase scripts, the hold-and-release turn
 * mechanics and the trace. Rendering (3D or fallback) only reads
 * snapshots. Tests drive it directly through tick().
 */
export class MF02Engine {
  private mode: EngineMode = "ambient";
  private worldMs = 0;
  private phaseIndex = 0;
  private phaseElapsed = 0;

  private queue: ScriptSegment[] = [...ambientLoop];
  private loopSource: ScriptSegment[] = ambientLoop;
  private segIndex = 0;
  private segElapsed = 0;
  private msSinceLastSpeakEnd = 99999;

  private traces: TurnTrace[] = [];
  private turnsThisPhase = 0;

  private holdStartMs: number | null = null;
  private userTurn: {
    strength: Strength;
    startMs: number;
    outcome: Outcome;
  } | null = null;
  private beat: { outcome: Outcome; msLeft: number } | null = null;
  private interruptedChar: CharacterId | null = null;

  private pauseReasons = new Set<PauseReason>();
  private waitingForPace = false;
  private paceHoldDone = false;
  private controlledPace = false;

  private result: ResultKind | null = null;
  private jordanEntryStartMs: number | null = null;

  private listeners = new Set<() => void>();
  private eventListeners = new Set<(e: SceneEvent) => void>();
  private rafId: number | null = null;
  private lastFrame = 0;
  private disposed = false;

  /* ---- lifecycle ---- */

  startClock() {
    /* A disposed engine can be revived; StrictMode mounts effects twice. */
    this.disposed = false;
    if (this.rafId !== null) return;
    if (typeof requestAnimationFrame !== "function") return;
    this.lastFrame = performance.now();
    const step = (now: number) => {
      if (this.disposed) return;
      const dt = Math.min(64, now - this.lastFrame);
      this.lastFrame = now;
      this.tick(dt);
      this.rafId = requestAnimationFrame(step);
    };
    this.rafId = requestAnimationFrame(step);
  }

  dispose() {
    this.disposed = true;
    if (this.rafId !== null && typeof cancelAnimationFrame === "function") {
      cancelAnimationFrame(this.rafId);
    }
    this.rafId = null;
    this.listeners.clear();
    this.eventListeners.clear();
  }

  /* ---- wiring ---- */

  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  onEvent(fn: (e: SceneEvent) => void): () => void {
    this.eventListeners.add(fn);
    return () => this.eventListeners.delete(fn);
  }

  private notify() {
    for (const fn of this.listeners) fn();
  }

  private emit(e: SceneEvent) {
    for (const fn of this.eventListeners) fn(e);
  }

  /* ---- controls ---- */

  setControlledPace(on: boolean) {
    this.controlledPace = on;
    if (!on) this.releasePaceHold();
  }

  pause(reason: PauseReason) {
    this.pauseReasons.add(reason);
    this.notify();
  }

  resume(reason: PauseReason) {
    this.pauseReasons.delete(reason);
    this.notify();
  }

  releasePaceHold() {
    if (this.waitingForPace) {
      this.waitingForPace = false;
      this.pauseReasons.delete("pace");
      this.notify();
    }
  }

  startGame() {
    this.mode = "game";
    this.worldMs = 0;
    this.phaseIndex = 0;
    this.traces = [];
    this.result = null;
    this.enterPhase(0);
    this.notify();
  }

  reset() {
    this.mode = "ambient";
    this.worldMs = 0;
    this.phaseIndex = 0;
    this.phaseElapsed = 0;
    this.traces = [];
    this.turnsThisPhase = 0;
    this.holdStartMs = null;
    this.userTurn = null;
    this.beat = null;
    this.interruptedChar = null;
    this.result = null;
    this.jordanEntryStartMs = null;
    this.waitingForPace = false;
    this.paceHoldDone = false;
    this.pauseReasons.delete("pace");
    this.setScript([...ambientLoop], ambientLoop);
    this.msSinceLastSpeakEnd = 99999;
    this.notify();
  }

  getTraces(): TurnTrace[] {
    return [...this.traces];
  }

  getResult(): ResultKind | null {
    return this.result;
  }

  /* ---- the hold ---- */

  beginHold(): boolean {
    if (this.mode !== "game" || this.beat || this.holdStartMs !== null) {
      return false;
    }
    this.releasePaceHold();
    this.holdStartMs = this.worldMs;
    this.notify();
    return true;
  }

  cancelHold() {
    this.holdStartMs = null;
    this.notify();
  }

  endHold(): TurnTrace | null {
    if (this.mode !== "game" || this.holdStartMs === null) return null;
    const holdMs = Math.max(0, this.worldMs - this.holdStartMs);
    this.holdStartMs = null;
    return this.sendTurn(holdMs);
  }

  /**
   * Accessibility equivalent: an explicit strength plus "Send now".
   * Uses a representative hold duration for the chosen band so the
   * trace shape stays identical.
   */
  sendWithStrength(strength: Strength): TurnTrace | null {
    if (this.mode !== "game" || this.beat) return null;
    this.releasePaceHold();
    const holdMs =
      strength === "light" ? 300 : strength === "steady" ? 850 : 1500;
    return this.sendTurn(holdMs);
  }

  private sendTurn(holdMs: number): TurnTrace | null {
    if (this.beat) return null;
    const strength = strengthForHold(holdMs);
    const overlap = this.isOverlapNow();
    const overlappedWith = this.currentOrNearestSpeaker();
    const phaseId = phases[this.phaseIndex].id;
    const outcome = outcomeForRelease({ phaseId, strength, overlap });

    const trace: TurnTrace = {
      phaseId,
      elapsedInPhaseMs: Math.round(this.phaseElapsed),
      holdDurationMs: Math.round(holdMs),
      strength,
      overlap,
      outcome,
    };
    this.traces.push(trace);
    this.turnsThisPhase += 1;

    this.userTurn = { strength, startMs: this.worldMs, outcome };
    this.beat = { outcome, msLeft: CONSEQUENCE_BEAT_MS };

    if (outcome === "crowded") {
      const seg = this.queue[this.segIndex];
      if (seg && seg.kind === "speak") {
        this.interruptedChar = seg.who;
        this.segElapsed = seg.ms;
        this.msSinceLastSpeakEnd = 0;
      } else {
        this.interruptedChar = overlappedWith;
      }
    }

    const cue =
      outcome === "crowded"
        ? crowdedCueFor(this.interruptedChar ?? overlappedWith)
        : consequenceCues[outcome];
    this.emit({ kind: "consequence", outcome, text: cue });
    this.notify();
    return trace;
  }

  /* ---- overlap judgment ---- */

  private isOverlapNow(): boolean {
    const seg = this.queue[this.segIndex];
    if (seg && seg.kind === "speak") return true;
    if (this.msSinceLastSpeakEnd < overlapWindowMs) return true;
    if (this.msUntilNextSpeak() < overlapWindowMs) return true;
    return false;
  }

  private msUntilNextSpeak(): number {
    let ms = 0;
    let idx = this.segIndex;
    let elapsed = this.segElapsed;
    for (let hops = 0; hops < 24; hops++) {
      const seg = this.queue[idx] ?? this.loopSource[0];
      if (!seg) return 99999;
      if (seg.kind === "speak") {
        return hops === 0 ? 0 : ms;
      }
      ms += seg.ms - elapsed;
      elapsed = 0;
      idx += 1;
      if (idx >= this.queue.length) {
        this.queue.push(...this.loopSource);
      }
    }
    return ms;
  }

  private currentOrNearestSpeaker(): CharacterId | null {
    const seg = this.queue[this.segIndex];
    if (seg && seg.kind === "speak") return seg.who;
    let idx = this.segIndex;
    for (let hops = 0; hops < 24; hops++) {
      const s = this.queue[idx];
      if (!s) break;
      if (s.kind === "speak") return s.who;
      idx += 1;
      if (idx >= this.queue.length) this.queue.push(...this.loopSource);
    }
    return null;
  }

  /* ---- phases ---- */

  private setScript(queue: ScriptSegment[], loop: ScriptSegment[]) {
    this.queue = queue;
    this.loopSource = loop;
    this.segIndex = 0;
    this.segElapsed = 0;
    const first = queue[0];
    if (first?.kind === "speak" && first.caption) {
      this.emit({ kind: "cue", text: first.caption });
    }
  }

  private enterPhase(index: number) {
    const phase = phases[index];
    this.phaseIndex = index;
    this.phaseElapsed = 0;
    this.turnsThisPhase = 0;
    this.paceHoldDone = false;
    this.interruptedChar = null;
    this.msSinceLastSpeakEnd = index === 0 ? 99999 : this.msSinceLastSpeakEnd;
    if (phase.id === "room-change") {
      this.jordanEntryStartMs = this.worldMs;
    }
    this.emit({ kind: "phase", phase: phase.id });
    this.setScript([...phase.intro], phase.loop);
  }

  private finishGame() {
    this.result = evaluateResult(this.traces);
    this.mode = "done";
    this.emit({ kind: "finished", result: this.result });
    this.notify();
  }

  /* ---- clock ---- */

  isPaused(): boolean {
    return this.pauseReasons.size > 0;
  }

  tick(dt: number) {
    if (this.disposed || this.pauseReasons.size > 0) return;
    this.worldMs += dt;

    if (this.mode === "game") {
      this.phaseElapsed += dt;
    }

    if (this.beat) {
      this.beat.msLeft -= dt;
      const settledPause = this.beat.outcome === "settled";
      if (this.beat.msLeft <= 0) {
        const finishedPhase = this.turnsThisPhase >= turnsPerPhase;
        this.beat = null;
        this.interruptedChar = null;
        this.userTurn = null;
        if (this.mode === "game" && finishedPhase) {
          if (this.phaseIndex >= phases.length - 1) {
            this.finishGame();
          } else {
            this.enterPhase(this.phaseIndex + 1);
          }
        }
        this.notify();
      } else if (settledPause) {
        this.notify();
        return;
      }
    }

    if (this.userTurn && this.worldMs - this.userTurn.startMs > USER_TURN_TRAVEL_MS + 400) {
      this.userTurn = null;
    }

    this.advanceScript(dt);
    this.notify();
  }

  private advanceScript(dt: number) {
    if (this.mode === "done") return;
    let seg = this.queue[this.segIndex];
    if (!seg) {
      this.queue.push(...this.loopSource);
      seg = this.queue[this.segIndex];
      if (!seg) return;
    }

    if (seg.kind === "gap") {
      this.msSinceLastSpeakEnd += dt;
      this.maybePaceHold(seg);
    }

    this.segElapsed += dt;
    if (this.segElapsed >= seg.ms) {
      if (seg.kind === "speak") {
        this.msSinceLastSpeakEnd = 0;
      }
      this.segIndex += 1;
      this.segElapsed = 0;
      if (this.segIndex >= this.queue.length) {
        this.queue.push(...this.loopSource);
      }
      const next = this.queue[this.segIndex];
      if (next?.kind === "speak" && next.caption) {
        this.emit({ kind: "cue", text: next.caption });
      }
    }
  }

  /**
   * Controlled pace: hold the world in the breathing space after each
   * phase's authored intro so the cue can be read. The gap has already
   * run long enough that a release here is not judged as overlap.
   */
  private maybePaceHold(seg: ScriptSegment) {
    if (
      !this.controlledPace ||
      this.mode !== "game" ||
      this.paceHoldDone ||
      this.waitingForPace ||
      this.beat
    ) {
      return;
    }
    const introLen = phases[this.phaseIndex].intro.length;
    const inIntroFinalGap = this.segIndex === introLen - 1 && seg.kind === "gap";
    if (inIntroFinalGap && this.segElapsed >= Math.min(PACE_HOLD_GAP_MS, seg.ms / 2)) {
      this.waitingForPace = true;
      this.paceHoldDone = true;
      this.pauseReasons.add("pace");
      this.notify();
    }
  }

  /* ---- snapshot ---- */

  getSnapshot(): SceneSnapshot {
    const phase = phases[this.phaseIndex];
    const seg = this.queue[this.segIndex];
    const speaking = seg && seg.kind === "speak" ? seg.who : null;
    const jordanPresent =
      this.mode !== "ambient" && phase.id !== "handoff";

    let jordanEntry = 0;
    if (jordanPresent && this.jordanEntryStartMs !== null) {
      jordanEntry = Math.min(
        1,
        (this.worldMs - this.jordanEntryStartMs) / JORDAN_ENTRY_MS,
      );
    } else if (jordanPresent) {
      jordanEntry = 1;
    }

    const moods = {} as Record<CharacterId, CharacterMood>;
    for (const id of CAST) {
      if (id === "jordan" && !jordanPresent) {
        moods[id] = "idle";
        continue;
      }
      if (id === "jordan" && jordanEntry < 1) {
        moods[id] = "entering";
        continue;
      }
      if (this.beat) {
        if (this.beat.outcome === "settled") {
          moods[id] = "settled";
        } else if (this.beat.outcome === "crowded") {
          moods[id] = id === this.interruptedChar ? "interrupted" : "attention-shift";
        } else {
          moods[id] = "unresolved";
        }
        continue;
      }
      if (this.mode === "done") {
        moods[id] = this.result === "demonstrated" ? "settled" : "unresolved";
        continue;
      }
      if (speaking === id) {
        moods[id] = "speaking";
      } else if (speaking) {
        moods[id] = "listening";
      } else {
        moods[id] = "idle";
      }
    }

    if (
      !this.beat &&
      this.mode === "game" &&
      phase.id === "call-closer" &&
      !speaking
    ) {
      for (const id of CAST) {
        if (moods[id] === "idle") moods[id] = "attention-shift";
      }
    }

    const pulseProgress =
      seg && seg.kind === "speak" ? Math.min(1, this.segElapsed / seg.ms) : 0;

    let hold: SceneSnapshot["hold"] = null;
    if (this.holdStartMs !== null) {
      const held = this.worldMs - this.holdStartMs;
      hold = {
        strength: strengthForHold(held),
        progress: Math.min(1, held / 1600),
      };
    }

    let userTurn: SceneSnapshot["userTurn"] = null;
    if (this.userTurn) {
      userTurn = {
        strength: this.userTurn.strength,
        progress: Math.min(
          1,
          (this.worldMs - this.userTurn.startMs) / USER_TURN_TRAVEL_MS,
        ),
        outcome: this.userTurn.outcome,
      };
    }

    return {
      mode: this.mode,
      phase: phase.id,
      moods,
      activeSpeaker: speaking,
      pulseProgress,
      hold,
      userTurn,
      jordanEntry,
      jordanPresent,
      printerOn: this.mode !== "ambient" && phase.id === "call-closer",
      callSoon: this.mode !== "ambient" && phase.id === "call-closer",
      attentionSplit:
        this.mode === "game" &&
        (phase.id === "room-change" ? jordanEntry < 1 : phase.id === "call-closer"),
      paused: this.pauseReasons.size > 0,
      worldMs: this.worldMs,
    };
  }

  getPhaseIndex(): number {
    return this.phaseIndex;
  }

  getTurnsThisPhase(): number {
    return this.turnsThisPhase;
  }

  isWaitingForPace(): boolean {
    return this.waitingForPace;
  }

  isBeatActive(): boolean {
    return this.beat !== null;
  }

  isHolding(): boolean {
    return this.holdStartMs !== null;
  }
}
