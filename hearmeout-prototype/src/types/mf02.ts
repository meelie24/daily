export type PhaseId = "handoff" | "room-change" | "call-closer";

export type Strength = "light" | "steady" | "strong";

export type Outcome = "settled" | "crowded" | "faded";

export type TurnTrace = {
  phaseId: PhaseId;
  elapsedInPhaseMs: number;
  holdDurationMs: number;
  strength: Strength;
  overlap: boolean;
  outcome: Outcome;
};

export type ResultKind = "demonstrated" | "crowded" | "incomplete";

export type CharacterId = "avery" | "sam" | "riley" | "jordan";

export type CharacterMood =
  | "idle"
  | "speaking"
  | "listening"
  | "entering"
  | "attention-shift"
  | "interrupted"
  | "settled"
  | "unresolved";

/** Snapshot the scene renderers read every frame. */
export type SceneSnapshot = {
  mode: "ambient" | "game" | "done";
  phase: PhaseId;
  moods: Record<CharacterId, CharacterMood>;
  activeSpeaker: CharacterId | null;
  /** 0..1 travel of the current speaker's turn toward the shared focus. */
  pulseProgress: number;
  /** Live hold on the pad, if any. */
  hold: { strength: Strength; progress: number } | null;
  /** A released user turn traveling into the exchange. */
  userTurn: { strength: Strength; progress: number; outcome: Outcome } | null;
  /** 0..1, Jordan walking in during the phase change. */
  jordanEntry: number;
  jordanPresent: boolean;
  printerOn: boolean;
  callSoon: boolean;
  attentionSplit: boolean;
  paused: boolean;
  /** Millisecond clock the scene can use for authored motion. */
  worldMs: number;
};

export type SceneEvent =
  | { kind: "cue"; text: string; description?: string }
  | { kind: "consequence"; outcome: Outcome; text: string }
  | { kind: "phase"; phase: PhaseId }
  | { kind: "finished"; result: ResultKind };
