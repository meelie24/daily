import { useEffect, useState } from "react";
import type { MF02Engine } from "../exercise/mf02Engine";
import type { CharacterId, SceneSnapshot } from "../types/mf02";

/**
 * Animated, stateful fixed-view scene for browsers without WebGL.
 * Same people, events, cues and consequences as the 3D room, drawn as
 * a flat stylized illustration that reads the same engine snapshots.
 * Portrait composition so nothing important crops on phone canvases.
 */

const FIGURES: Record<
  CharacterId,
  {
    x: number;
    y: number;
    skin: string;
    hair: string;
    top: string;
    accent: string;
    style: "bun" | "short" | "bob" | "crop";
  }
> = {
  avery: {
    x: 108,
    y: 296,
    skin: "#C08A5E",
    hair: "#2E2A26",
    top: "#C96F5A",
    accent: "#B05A46",
    style: "bun",
  },
  sam: {
    x: 200,
    y: 288,
    skin: "#E8BC93",
    hair: "#6B5636",
    top: "#77805A",
    accent: "#F2EFE6",
    style: "short",
  },
  riley: {
    x: 292,
    y: 296,
    skin: "#F2CDA8",
    hair: "#26211D",
    top: "#51609E",
    accent: "#F2EFE6",
    style: "bob",
  },
  jordan: {
    x: 346,
    y: 268,
    skin: "#8A5A3B",
    hair: "#191715",
    top: "#C9A24B",
    accent: "#3A3F45",
    style: "crop",
  },
};

const FOCUS = { x: 200, y: 252 };

const STRENGTH_FILL = { light: "#74CDC9", steady: "#0B8FA8", strong: "#007A7E" };

function Figure({ id, snap }: { id: CharacterId; snap: SceneSnapshot }) {
  const f = FIGURES[id];
  const mood = snap.moods[id];
  if (id === "jordan" && !snap.jordanPresent) return null;
  const entering = id === "jordan" && snap.jordanEntry < 1;
  const x = entering ? f.x + (1 - snap.jordanEntry) * 46 : f.x;
  const speaking = mood === "speaking";
  const interrupted = mood === "interrupted";

  return (
    <g className={`fb-figure fb-${mood}`} transform={`translate(${x} ${f.y})`}>
      {speaking && <circle className="fb-halo" r="30" fill="#FFE9B8" opacity="0.55" />}
      {/* shoulders with a collar detail */}
      <path d="M-24 44 C-24 20 -12 12 0 12 C12 12 24 20 24 44 Z" fill={f.top} />
      <path d="M-7 12 L0 20 L7 12 Z" fill={f.accent} />
      {/* head */}
      <circle cx="0" cy="-6" r="17" fill={f.skin} />
      {/* hair: distinct per person, always clear of the eyes */}
      {f.style === "bun" && (
        <>
          <path d="M-17 -6 C-17 -24 17 -24 17 -6 C17 -14 -17 -14 -17 -6 Z" fill={f.hair} />
          <circle cx="0" cy="-24" r="6.5" fill={f.hair} />
        </>
      )}
      {f.style === "short" && (
        <path
          d="M-16.5 -9 C-16 -23.5 16 -23.5 16.5 -9 C16 -15 10 -17.5 2 -17.5 C-8 -17.5 -15 -14.5 -16.5 -9 Z"
          fill={f.hair}
        />
      )}
      {f.style === "bob" && (
        <>
          <path d="M-18 -4 C-18 -25 18 -25 18 -4 C18 -13 -18 -13 -18 -4 Z" fill={f.hair} />
          <rect x="-19" y="-8" width="5" height="16" rx="2.4" fill={f.hair} />
          <rect x="14" y="-8" width="5" height="16" rx="2.4" fill={f.hair} />
        </>
      )}
      {f.style === "crop" && (
        <path
          d="M-16 -10 C-15 -22.5 15 -22.5 16 -10 C14 -15.5 -14 -15.5 -16 -10 Z"
          fill={f.hair}
        />
      )}
      {/* brows */}
      <rect x="-11" y={interrupted ? -15 : -13} width="8" height="2" rx="1" fill={f.hair} />
      <rect x="3" y={interrupted ? -15 : -13} width="8" height="2" rx="1" fill={f.hair} />
      {/* eyes with catchlights */}
      <circle cx="-7" cy="-8" r="2.3" fill="#232C33" />
      <circle cx="7" cy="-8" r="2.3" fill="#232C33" />
      <circle cx="-6.2" cy="-8.8" r="0.7" fill="#FFFFFF" />
      <circle cx="7.8" cy="-8.8" r="0.7" fill="#FFFFFF" />
      {/* mouth: opens while speaking */}
      {speaking ? (
        <ellipse className="fb-mouth-talk" cx="0" cy="2" rx="4" ry="2.6" fill="#8A4A3C" />
      ) : (
        <rect x="-4.5" y="1" width="9" height="2" rx="1" fill="#8A4A3C" />
      )}
    </g>
  );
}

export function SceneFallback({ engine }: { engine: MF02Engine }) {
  const [snap, setSnap] = useState<SceneSnapshot>(() => engine.getSnapshot());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSnap(engine.getSnapshot());
    }, 100);
    return () => window.clearInterval(timer);
  }, [engine]);

  const speaker = snap.activeSpeaker;
  const from = speaker ? FIGURES[speaker] : null;

  return (
    <div className="scene-canvas scene-fallback" aria-hidden="true">
      <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice">
        {/* room */}
        <rect width="400" height="500" fill="#EFE8DA" />
        <rect y="352" width="400" height="148" fill="#C7AB86" />
        {/* window */}
        <rect x="36" y="56" width="148" height="118" rx="6" fill="#F6F4EF" />
        <rect x="43" y="63" width="134" height="104" rx="3" fill="#D9EAF0" />
        <ellipse cx="80" cy="96" rx="16" ry="7" fill="#FFFFFF" opacity="0.8" />
        <ellipse cx="126" cy="122" rx="19" ry="8" fill="#FFFFFF" opacity="0.7" />
        <rect x="108" y="63" width="4" height="104" fill="#F6F4EF" />
        {/* calendar with call status */}
        <rect x="238" y="84" width="70" height="52" rx="4" fill="#FFFFFF" />
        <rect x="238" y="84" width="70" height="14" rx="4" fill="#E8E2D6" />
        <text x="244" y="95" fontSize="9" fill="#4C5A5E" fontWeight="600">
          Today
        </text>
        <text x="244" y="118" fontSize="15" fill="#172126" fontWeight="700">
          2:30
        </text>
        <text x="244" y="131" fontSize="8" fill="#667478">
          Client call
        </text>
        <circle
          cx="298"
          cy="118"
          r="4.5"
          fill={snap.callSoon ? "#C57800" : "#B9C0C3"}
          className={snap.callSoon ? "fb-call-on" : ""}
        />
        {/* door on the right */}
        <rect x="352" y="120" width="44" height="234" fill="#DFD8C8" />
        <rect
          x="356"
          y="126"
          width="36"
          height="222"
          fill="#CAB08A"
          className={snap.jordanPresent && snap.jordanEntry < 1 ? "fb-door-open" : ""}
        />
        <circle cx="362" cy="240" r="2.8" fill="#7A5C40" />
        {/* plant between window and calendar */}
        <rect x="196" y="160" width="18" height="16" rx="3" fill="#B0714F" />
        <circle cx="205" cy="148" r="12" fill="#4D7A52" />
        <circle cx="197" cy="139" r="8" fill="#568159" />
        <circle cx="213" cy="140" r="7" fill="#456F4B" />
        {/* printer on a sideboard, left */}
        <rect x="10" y="262" width="74" height="34" rx="5" fill="#E8E6E0" />
        <rect x="16" y="296" width="62" height="52" fill="#D8C9AD" />
        <rect
          x="24"
          y="258"
          width="38"
          height="6"
          rx="2"
          fill="#FFFFFF"
          className={snap.printerOn ? "fb-paper-on" : ""}
          opacity={snap.printerOn ? 1 : 0}
        />
        <circle
          cx="76"
          cy="270"
          r="3.4"
          fill={snap.printerOn ? "#2FA66A" : "#9AA2A6"}
          className={snap.printerOn ? "fb-printer-blink" : ""}
        />

        {/* people behind the table */}
        <Figure id="avery" snap={snap} />
        <Figure id="sam" snap={snap} />
        <Figure id="riley" snap={snap} />
        <Figure id="jordan" snap={snap} />

        {/* conversation pulse toward the shared focus */}
        {speaker && from && !snap.paused && (
          <circle
            key={speaker}
            className="fb-pulse"
            style={
              {
                "--from-x": `${from.x - FOCUS.x}px`,
                "--from-y": `${from.y - 24 - FOCUS.y}px`,
              } as React.CSSProperties
            }
            cx={FOCUS.x}
            cy={FOCUS.y}
            r="7"
            fill="#FFE9B8"
          />
        )}

        {/* the user's released turn */}
        {snap.userTurn && (
          <circle
            className={`fb-user-turn${snap.userTurn.outcome === "faded" ? " fb-user-faded" : ""}`}
            cx={FOCUS.x}
            cy={FOCUS.y}
            r={
              snap.userTurn.strength === "light"
                ? 6
                : snap.userTurn.strength === "steady"
                  ? 9
                  : 12
            }
            fill={STRENGTH_FILL[snap.userTurn.strength]}
          />
        )}

        {/* live hold glow at the user's edge */}
        {snap.hold && (
          <circle
            cx="200"
            cy="452"
            r={10 + snap.hold.progress * 14}
            fill={STRENGTH_FILL[snap.hold.strength]}
            opacity="0.5"
          />
        )}

        {/* meeting table front edge */}
        <rect x="34" y="344" width="332" height="20" rx="9" fill="#A9805A" />
        <rect x="42" y="364" width="316" height="26" fill="#8F6A47" />
        <rect x="52" y="390" width="13" height="72" fill="#7A5C40" />
        <rect x="335" y="390" width="13" height="72" fill="#7A5C40" />
        {/* laptop + notebook + mug on the table */}
        <rect x="228" y="322" width="42" height="18" rx="2" fill="#30373B" />
        <rect x="231" y="325" width="36" height="12" rx="1" fill="#DFE8EA" />
        <rect x="96" y="330" width="32" height="10" rx="2" fill="#F6F4EF" />
        <circle cx="318" cy="334" r="7" fill="#BF6A4F" />
      </svg>
    </div>
  );
}
