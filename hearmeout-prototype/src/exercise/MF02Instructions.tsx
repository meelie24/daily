import { ChevronLeft } from "lucide-react";
import { instructionsCopy } from "./mf02FixtureConfig";
import type { MF02Engine } from "./mf02Engine";
import { OfficeScene } from "../scene/OfficeScene";

/**
 * One short looped demonstration: a participant's turn moves into the
 * exchange, an opening appears, the demo presses the pad, a user turn
 * enters, the group continues.
 */
function Demo() {
  return (
    <div className="mf02-demo" aria-hidden="true">
      <svg viewBox="0 0 280 74">
        {/* shared exchange track */}
        <rect x="16" y="30" width="248" height="14" rx="7" fill="#F5F2EC" />
        {/* another participant's turn */}
        <circle className="demo-their-turn" cy="37" r="6" fill="#E0B25C" />
        {/* the opening */}
        <rect
          className="demo-opening"
          x="150"
          y="30"
          width="52"
          height="14"
          rx="7"
          fill="#E4F7F6"
        />
        {/* demo pad press */}
        <circle className="demo-pad" cx="176" cy="62" r="9" fill="#007A7E" />
        {/* user turn entering */}
        <circle className="demo-user-turn" cx="176" r="6" fill="#0B8FA8" />
        {/* group continues */}
        <circle className="demo-continue" cy="37" r="6" fill="#E0B25C" />
      </svg>
    </div>
  );
}

export function MF02Instructions({
  engine,
  onStart,
  onBack,
}: {
  engine: MF02Engine;
  onStart: () => void;
  onBack: () => void;
}) {
  return (
    <div className="mf02-stage mf02-stage--scroll">
      <div className="mf02-scene-hero mf02-scene-hero--short">
        <OfficeScene engine={engine} />
        <button
          type="button"
          className="icon-btn mf02-overlay-btn mf02-back"
          aria-label="Back"
          onClick={onBack}
        >
          <ChevronLeft size={22} />
        </button>
      </div>

      <div className="mf02-entry-body">
        <span className="small-label">{instructionsCopy.label}</span>
        <h1 className="section-title" style={{ margin: "6px 0 10px" }}>
          {instructionsCopy.heading}
        </h1>
        <p className="mf02-instruction">{instructionsCopy.instruction}</p>
        <p className="body-text" style={{ marginBottom: 10 }}>
          {instructionsCopy.supporting}
        </p>
        <Demo />
        <button
          type="button"
          className="btn btn-primary btn-block"
          style={{ marginTop: 14 }}
          onClick={onStart}
        >
          {instructionsCopy.button}
        </button>
      </div>
    </div>
  );
}
