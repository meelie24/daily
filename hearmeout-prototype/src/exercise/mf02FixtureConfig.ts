import type {
  CharacterId,
  Outcome,
  PhaseId,
  ResultKind,
  Strength,
  TurnTrace,
} from "../types/mf02";

/**
 * MF02 EVALUATION FIXTURES
 *
 * Every threshold, timing window and result rule for the tap-hold-release
 * mechanic lives here. These values are prototype fixtures for one
 * evaluation. They are not validated evidence rules and they are expected
 * to be replaced or deleted after the evaluation.
 */

export const holdThresholds = {
  /** Below this hold duration (ms), the turn sends light. */
  lightMaxMs: 520,
  /** At or above lightMaxMs and at or below this, the turn sends steady. */
  steadyMaxMs: 1180,
  /** Above steadyMaxMs, the turn sends strong. */
} as const;

export function strengthForHold(holdMs: number): Strength {
  if (holdMs < holdThresholds.lightMaxMs) return "light";
  if (holdMs <= holdThresholds.steadyMaxMs) return "steady";
  return "strong";
}

/**
 * A release within this many ms before or after another participant's
 * active turn counts as overlap. Never shown to the user.
 */
export const overlapWindowMs = 720;

/** Each phase accepts this many user turns before the world changes. */
export const turnsPerPhase = 2;

/**
 * Result rules for this evaluation only.
 * They read the real trace. Nothing is random.
 */
export function evaluateResult(traces: TurnTrace[]): ResultKind {
  const settled = traces.filter((t) => t.outcome === "settled").length;
  const crowded = traces.filter((t) => t.outcome === "crowded").length;
  const phasesCovered = new Set(traces.map((t) => t.phaseId)).size;
  const strengthsUsed = new Set(traces.map((t) => t.strength)).size;

  if (settled >= 4 && phasesCovered === 3 && strengthsUsed >= 2) {
    return "demonstrated";
  }
  if (crowded >= 3) {
    return "crowded";
  }
  return "incomplete";
}

/**
 * Authored consequence for a single release. Reads the live room state,
 * never a random number.
 */
export function outcomeForRelease(args: {
  phaseId: PhaseId;
  strength: Strength;
  overlap: boolean;
}): Outcome {
  if (args.overlap) return "crowded";
  if (args.phaseId === "call-closer" && args.strength === "light") {
    return "faded";
  }
  return "settled";
}

/* Authored phase scripts. The room is active before the player acts. */

export type ScriptSegment =
  | {
      kind: "speak";
      who: CharacterId;
      ms: number;
      /** Optional visible caption while this segment plays. */
      caption?: string;
    }
  | { kind: "gap"; ms: number };

export type PhaseFixture = {
  id: PhaseId;
  title: string;
  userLine: string;
  cue: string;
  description: string;
  /** Played once when the phase begins. */
  intro: ScriptSegment[];
  /** Loops until the phase collects its user turns. */
  loop: ScriptSegment[];
};

export const phases: PhaseFixture[] = [
  {
    id: "handoff",
    title: "The handoff",
    userLine: "I can take the follow-up.",
    cue: "Sam: “The follow-up still needs an owner.”",
    description:
      "Avery has just finished. Sam names the open task and leaves a gap in the conversation.",
    intro: [
      { kind: "speak", who: "avery", ms: 2600 },
      { kind: "gap", ms: 900 },
      {
        kind: "speak",
        who: "sam",
        ms: 2400,
        caption: "Sam: “The follow-up still needs an owner.”",
      },
      { kind: "gap", ms: 2400 },
    ],
    loop: [
      { kind: "speak", who: "riley", ms: 2100 },
      { kind: "gap", ms: 2200 },
      { kind: "speak", who: "avery", ms: 1900 },
      { kind: "gap", ms: 2600 },
      { kind: "speak", who: "sam", ms: 1700 },
      { kind: "gap", ms: 2300 },
    ],
  },
  {
    id: "room-change",
    title: "The room changes",
    userLine: "I can handle the client note.",
    cue: "Jordan joins. Avery starts bringing them up to speed.",
    description:
      "A fourth person enters. Two people begin speaking to get them caught up.",
    intro: [
      { kind: "gap", ms: 1200 },
      {
        kind: "speak",
        who: "avery",
        ms: 2800,
        caption: "Jordan joins. Avery starts bringing them up to speed.",
      },
      { kind: "speak", who: "jordan", ms: 1600 },
      { kind: "gap", ms: 1500 },
    ],
    loop: [
      { kind: "speak", who: "avery", ms: 2400 },
      { kind: "gap", ms: 1300 },
      { kind: "speak", who: "jordan", ms: 2200 },
      { kind: "gap", ms: 1700 },
      { kind: "speak", who: "sam", ms: 1800 },
      { kind: "gap", ms: 1100 },
      { kind: "speak", who: "riley", ms: 1500 },
      { kind: "gap", ms: 1600 },
    ],
  },
  {
    id: "call-closer",
    title: "The call gets closer",
    userLine: "I’ll send the handoff after this.",
    cue: "The printer starts. The 2:30 client call is next.",
    description:
      "The task becomes more urgent, but the room is still crowded.",
    intro: [
      { kind: "gap", ms: 1000 },
      {
        kind: "speak",
        who: "sam",
        ms: 2200,
        caption: "The printer starts. The 2:30 client call is next.",
      },
      { kind: "gap", ms: 1600 },
    ],
    loop: [
      { kind: "speak", who: "jordan", ms: 1900 },
      { kind: "gap", ms: 1400 },
      { kind: "speak", who: "avery", ms: 1700 },
      { kind: "gap", ms: 1800 },
      { kind: "speak", who: "riley", ms: 1400 },
      { kind: "gap", ms: 1200 },
      { kind: "speak", who: "sam", ms: 1600 },
      { kind: "gap", ms: 1500 },
    ],
  },
];

/** Ambient script for the entry screen, before play begins. */
export const ambientLoop: ScriptSegment[] = [
  { kind: "speak", who: "avery", ms: 2400 },
  { kind: "gap", ms: 1800 },
  { kind: "speak", who: "sam", ms: 2000 },
  { kind: "gap", ms: 2600 },
  { kind: "speak", who: "riley", ms: 1800 },
  { kind: "gap", ms: 2100 },
];

export const consequenceCues: Record<Outcome, string> = {
  settled: "Your turn lands in the opening. The group stays with it.",
  crowded: "Your turn lands while someone is still talking.",
  faded: "Your turn reaches the table, but the room keeps moving.",
};

/** Phase-aware crowded cue, used when the overlapped speaker is known. */
export function crowdedCueFor(who: CharacterId | null): string {
  if (who === "jordan") return "Your turn lands while Jordan is still talking.";
  if (who === "avery") return "Your turn lands while Avery is still talking.";
  if (who === "sam") return "Your turn lands while Sam is still talking.";
  if (who === "riley") return "Your turn lands while Riley is still talking.";
  return consequenceCues.crowded;
}

export const entryCopy = {
  title: "Responsive delivery",
  evalTag: "Mechanic evaluation",
  context: "Work · team check-in",
  setup: "The handoff needs an owner before the next call.",
  body: "Practice changing your timing, pace and intensity when the people around you change.",
  facts: ["About 3 minutes", "Work setting", "No score or voice input"],
  note: "This is an unapproved mechanic test. It does not save progress or change the build plan.",
  accessibility: "Accessibility and sound",
  primary: "See how it works",
};

export const instructionsCopy = {
  label: "First time",
  heading: "Join the exchange without crowding it.",
  instruction: "Hold the pad to build your turn. Release it to send.",
  supporting:
    "Watch for space. A longer hold sends a stronger turn. The room keeps moving while you decide.",
  button: "Start",
};

export const resultCopy = {
  demonstrated: {
    sceneState: "The group knows who owns the handoff.",
    heading: "The group heard you and kept moving.",
    feedback:
      "You made room while the discussion was busy, then came in more firmly when the handoff needed an owner. The group knew what was happening next.",
    progress: "Communication 34% → 35%",
    previewLabel: "Preview data · nothing is saved",
    streakLine: "Your 4-day Practice streak would continue.",
    continueAction: "Continue",
    againAction: "Play again",
  },
  crowded: {
    sceneState: "No one has taken the handoff yet.",
    heading: "People started talking over each other.",
    feedback:
      "You tried to get your point in while the room was already full. The handoff stayed unclear, and the meeting moved on.",
    retryAction: "Try again",
    leaveAction: "Leave for now",
    note: "No progress is saved in this evaluation build.",
  },
  incomplete: {
    sceneState: "No one has taken the handoff yet.",
    heading: "The handoff stayed unclear.",
    feedback:
      "Some of your turns got through, but others were lost as the room changed. By the end, nobody had taken the handoff.",
    retryAction: "Try again",
    leaveAction: "Leave for now",
    note: "No progress is saved in this evaluation build.",
  },
};

export const gameCopy = {
  padLabel: "Hold to build your turn, release to send",
  padHint: "Hold, then release",
  describeRoom: "Describe the room",
  help: "Help",
  leave: "Leave",
  altControls: "Button controls",
  altControlsHint:
    "Pick a strength, watch the room, then send when you choose. Same judgment, different hands.",
  sendNow: "Send now",
  strengthNames: {
    light: "Light",
    steady: "Steady",
    strong: "Strong",
  },
  continuePace: "Let the room continue",
  pausedLabel: "Paused",
};
