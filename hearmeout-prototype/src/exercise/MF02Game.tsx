import { useCallback, useEffect, useRef, useState } from "react";
import { Ear, HelpCircle, X } from "lucide-react";
import type { MF02Engine } from "./mf02Engine";
import { gameCopy, instructionsCopy, phases } from "./mf02FixtureConfig";
import type { CharacterId, Strength } from "../types/mf02";
import { OfficeScene } from "../scene/OfficeScene";
import {
  playConsequence,
  playSend,
  playTurnCue,
  startPrinter,
  startRoomTone,
  stopPrinter,
} from "./audio";
import { hapticConsequence, hapticSend } from "./haptics";

const NAMES: Record<CharacterId, string> = {
  avery: "Avery",
  sam: "Sam",
  riley: "Riley",
  jordan: "Jordan",
};

const RING_R = 46;
const RING_C = 2 * Math.PI * RING_R;
const STRENGTH_RING = { light: "#74CDC9", steady: "#0B8FA8", strong: "#007A7E" };

type UiState = {
  phaseIdx: number;
  turns: number;
  waiting: boolean;
  paused: boolean;
  beat: boolean;
  holding: boolean;
};

export function MF02Game({
  engine,
  onLeave,
}: {
  engine: MF02Engine;
  onLeave: () => void;
}) {
  const [caption, setCaption] = useState(
    "Low office hum. The room is already mid-conversation.",
  );
  const [helpOpen, setHelpOpen] = useState(false);
  const [describeOpen, setDescribeOpen] = useState(false);
  const [altControls, setAltControls] = useState(false);
  const [altStrength, setAltStrength] = useState<Strength>("steady");
  const [ui, setUi] = useState<UiState>({
    phaseIdx: 0,
    turns: 0,
    waiting: false,
    paused: false,
    beat: false,
    holding: false,
  });

  const ringRef = useRef<SVGCircleElement>(null);
  const padRef = useRef<HTMLButtonElement>(null);
  const printerOnRef = useRef(false);
  const lastSpeakerRef = useRef<CharacterId | null>(null);

  /* sound bed */
  useEffect(() => {
    startRoomTone();
    return () => stopPrinter();
  }, []);

  /* engine events drive captions, announcements, sound and haptics */
  useEffect(() => {
    return engine.onEvent((e) => {
      if (e.kind === "cue") {
        setCaption(e.text);
      } else if (e.kind === "consequence") {
        setCaption(e.text);
        playConsequence(e.outcome);
        hapticConsequence(e.outcome);
      } else if (e.kind === "phase") {
        const phase = phases.find((p) => p.id === e.phase);
        if (phase) setCaption(phase.description);
      }
    });
  }, [engine]);

  /* visual loop: ring, pad, discrete UI state, ambient sound cues */
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const snap = engine.getSnapshot();

      const ring = ringRef.current;
      if (ring) {
        if (snap.hold) {
          ring.style.opacity = "1";
          ring.style.strokeDashoffset = String(RING_C * (1 - snap.hold.progress));
          ring.style.stroke = STRENGTH_RING[snap.hold.strength];
        } else {
          ring.style.opacity = "0";
          ring.style.strokeDashoffset = String(RING_C);
        }
      }
      const pad = padRef.current;
      if (pad) {
        pad.style.transform = snap.hold ? "scale(0.93)" : "scale(1)";
      }

      if (snap.activeSpeaker !== lastSpeakerRef.current) {
        if (snap.activeSpeaker) playTurnCue();
        lastSpeakerRef.current = snap.activeSpeaker;
      }
      if (snap.printerOn !== printerOnRef.current) {
        printerOnRef.current = snap.printerOn;
        if (snap.printerOn) startPrinter();
        else stopPrinter();
      }

      const next: UiState = {
        phaseIdx: engine.getPhaseIndex(),
        turns: engine.getTurnsThisPhase(),
        waiting: engine.isWaitingForPace(),
        paused: engine.isPaused(),
        beat: engine.isBeatActive(),
        holding: engine.isHolding(),
      };
      setUi((prev) =>
        prev.phaseIdx === next.phaseIdx &&
        prev.turns === next.turns &&
        prev.waiting === next.waiting &&
        prev.paused === next.paused &&
        prev.beat === next.beat &&
        prev.holding === next.holding
          ? prev
          : next,
      );
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [engine]);

  /* overlays pause the room */
  useEffect(() => {
    if (helpOpen) engine.pause("help");
    else engine.resume("help");
  }, [helpOpen, engine]);

  useEffect(() => {
    if (describeOpen) engine.pause("narration");
    else engine.resume("narration");
  }, [describeOpen, engine]);

  const handleSent = useCallback((strength: Strength | null) => {
    if (!strength) return;
    playSend(strength);
    hapticSend(strength);
  }, []);

  const release = useCallback(() => {
    const trace = engine.endHold();
    handleSent(trace?.strength ?? null);
  }, [engine, handleSent]);

  const phase = phases[Math.min(ui.phaseIdx, phases.length - 1)];

  const describeRoom = (): string => {
    const snap = engine.getSnapshot();
    const parts: string[] = [phase.description];
    parts.push(
      snap.jordanPresent
        ? "Four people are around the table."
        : "Three people are around the table.",
    );
    parts.push(
      snap.activeSpeaker
        ? `${NAMES[snap.activeSpeaker]} is talking right now.`
        : "No one is talking right now.",
    );
    if (snap.printerOn) parts.push("The printer is running.");
    if (snap.callSoon) parts.push("The 2:30 client call is close.");
    const left = 2 - ui.turns;
    parts.push(
      left === 1 ? "You have one turn left in this part." : `You have ${left} turns left in this part.`,
    );
    return parts.join(" ");
  };

  return (
    <div className="mf02-stage">
      <div className="mf02-scene-live">
        <OfficeScene engine={engine} />
        <button
          type="button"
          className="icon-btn mf02-overlay-btn mf02-back"
          aria-label={gameCopy.leave}
          onClick={onLeave}
        >
          <X size={20} />
        </button>
        <div className="mf02-overlay-right">
          <button
            type="button"
            className="icon-btn mf02-overlay-btn"
            aria-label={gameCopy.describeRoom}
            onClick={() => setDescribeOpen(true)}
          >
            <Ear size={19} />
          </button>
          <button
            type="button"
            className="icon-btn mf02-overlay-btn"
            aria-label={gameCopy.help}
            onClick={() => setHelpOpen(true)}
          >
            <HelpCircle size={19} />
          </button>
        </div>
        {ui.paused && !helpOpen && !describeOpen && !ui.waiting && (
          <span className="mf02-paused-chip">{gameCopy.pausedLabel}</span>
        )}
      </div>

      <div className="mf02-controls">
        <div className="mf02-phase-strip">
          <span className="small-label">
            Part {ui.phaseIdx + 1} of 3 · {phase.title}
          </span>
          <span className="mf02-turn-dots" aria-label={`${ui.turns} of 2 turns used`}>
            <i className={ui.turns >= 1 ? "on" : ""} />
            <i className={ui.turns >= 2 ? "on" : ""} />
          </span>
        </div>

        <p className="mf02-caption" role="status" aria-live="polite">
          {caption}
        </p>

        <div className="mf02-user-line">
          <span className="small-label">Your line</span>
          <p>“{phase.userLine}”</p>
        </div>

        <div className="mf02-pad-row">
          {altControls ? (
            <div className="mf02-alt" role="group" aria-label={gameCopy.altControls}>
              <p className="mf02-alt-hint">{gameCopy.altControlsHint}</p>
              <div className="mf02-alt-strengths">
                {(["light", "steady", "strong"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="mf02-alt-strength"
                    aria-pressed={altStrength === s}
                    onClick={() => setAltStrength(s)}
                  >
                    {gameCopy.strengthNames[s]}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={() => {
                  const trace = engine.sendWithStrength(altStrength);
                  handleSent(trace?.strength ?? null);
                }}
              >
                {gameCopy.sendNow}
              </button>
            </div>
          ) : (
            <div className="mf02-pad-center">
              <svg className="mf02-ring" viewBox="0 0 110 110" aria-hidden="true">
                <circle cx="55" cy="55" r={RING_R} className="mf02-ring-track" />
                <circle
                  ref={ringRef}
                  cx="55"
                  cy="55"
                  r={RING_R}
                  className="mf02-ring-fill"
                  strokeDasharray={RING_C}
                  strokeDashoffset={RING_C}
                />
              </svg>
              <button
                ref={padRef}
                type="button"
                className="mf02-pad"
                aria-label={gameCopy.padLabel}
                aria-disabled={ui.beat}
                onPointerDown={(e) => {
                  try {
                    e.currentTarget.setPointerCapture(e.pointerId);
                  } catch {
                    /* pointer capture unavailable */
                  }
                  engine.beginHold();
                }}
                onPointerUp={release}
                onPointerCancel={() => engine.cancelHold()}
                onKeyDown={(e) => {
                  if (e.repeat) return;
                  if (e.key === " ") {
                    e.preventDefault();
                    engine.beginHold();
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                    if (engine.isHolding()) release();
                    else engine.beginHold();
                  }
                }}
                onKeyUp={(e) => {
                  if (e.key === " ") {
                    e.preventDefault();
                    release();
                  }
                }}
              />
              <span className="mf02-pad-hint">{gameCopy.padHint}</span>
            </div>
          )}
        </div>

        <div className="mf02-foot">
          {ui.waiting && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => engine.releasePaceHold()}
            >
              {gameCopy.continuePace}
            </button>
          )}
          <button
            type="button"
            className="btn-quiet"
            aria-pressed={altControls}
            onClick={() => setAltControls((v) => !v)}
          >
            {altControls ? "Back to the pad" : gameCopy.altControls}
          </button>
        </div>
      </div>

      {helpOpen && (
        <div className="mf02-modal" role="dialog" aria-modal="true" aria-label={gameCopy.help}>
          <div className="mf02-modal-card">
            <h2 className="section-title" style={{ marginBottom: 8 }}>
              {instructionsCopy.heading}
            </h2>
            <p className="mf02-instruction">{instructionsCopy.instruction}</p>
            <p className="body-text" style={{ marginBottom: 8 }}>
              {instructionsCopy.supporting}
            </p>
            <p className="body-text" style={{ marginBottom: 14 }}>
              Keyboard: hold Space to build, let go to send. Enter presses and
              releases the pad in two taps. The room waits while this is open.
            </p>
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={() => setHelpOpen(false)}
            >
              Back to the room
            </button>
          </div>
        </div>
      )}

      {describeOpen && (
        <div
          className="mf02-modal"
          role="dialog"
          aria-modal="true"
          aria-label={gameCopy.describeRoom}
        >
          <div className="mf02-modal-card">
            <h2 className="section-title" style={{ marginBottom: 8 }}>
              {gameCopy.describeRoom}
            </h2>
            <p className="body-text" style={{ marginBottom: 14 }}>
              {describeRoom()}
            </p>
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={() => setDescribeOpen(false)}
            >
              Back to the room
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
