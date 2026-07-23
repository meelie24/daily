import { useState } from "react";
import {
  Accessibility,
  Briefcase,
  ChevronLeft,
  Clock3,
  MicOff,
} from "lucide-react";
import { entryCopy } from "./mf02FixtureConfig";
import type { MF02Engine } from "./mf02Engine";
import { OfficeScene } from "../scene/OfficeScene";
import { Sheet } from "../app/shared";
import { useSettings } from "../state/appState";
import { settingsCopy } from "../content/fixtureCopy";

const FACT_ICONS = [Clock3, Briefcase, MicOff];

function QuickToggle({
  id,
  label,
}: {
  id: "sound" | "haptics" | "controlledPace" | "reduceMotion";
  label: string;
}) {
  const { settings, update } = useSettings();
  const on = settings[id];
  return (
    <div className="toggle-row" style={{ padding: "10px 0", minHeight: 52 }}>
      <span className="toggle-copy" id={`mf02-toggle-${id}`}>
        <div className="toggle-label">{label}</div>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-labelledby={`mf02-toggle-${id}`}
        className="switch"
        onClick={() => update({ [id]: !on })}
      />
    </div>
  );
}

export function MF02Entry({
  engine,
  onBegin,
  onExit,
}: {
  engine: MF02Engine;
  onBegin: () => void;
  onExit: () => void;
}) {
  const [showAccess, setShowAccess] = useState(false);
  const t = settingsCopy.toggles;

  return (
    <div className="mf02-stage mf02-stage--scroll">
      <div className="mf02-scene-hero">
        <OfficeScene engine={engine} />
        <button
          type="button"
          className="icon-btn mf02-overlay-btn mf02-back"
          aria-label="Back"
          onClick={onExit}
        >
          <ChevronLeft size={22} />
        </button>
        <span className="mf02-context-chip">{entryCopy.context}</span>
      </div>

      <div className="mf02-entry-body">
        <div className="mf02-title-row">
          <h1 className="display">{entryCopy.title}</h1>
          <span className="eval-tag">{entryCopy.evalTag}</span>
        </div>
        <p className="mf02-setup">{entryCopy.setup}</p>
        <p className="body-text">{entryCopy.body}</p>

        <ul className="mf02-facts" aria-label="Practice details">
          {entryCopy.facts.map((fact, i) => {
            const Icon = FACT_ICONS[i] ?? Clock3;
            return (
              <li key={fact}>
                <Icon size={15} aria-hidden="true" />
                {fact}
              </li>
            );
          })}
        </ul>

        <p className="mf02-eval-note">{entryCopy.note}</p>

        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={onBegin}
        >
          {entryCopy.primary}
        </button>
        <button
          type="button"
          className="btn-quiet btn-block"
          style={{ marginTop: 6 }}
          onClick={() => setShowAccess(true)}
        >
          <Accessibility size={17} aria-hidden="true" style={{ marginRight: 6 }} />
          {entryCopy.accessibility}
        </button>
      </div>

      {showAccess && (
        <Sheet label={entryCopy.accessibility} onClose={() => setShowAccess(false)}>
          <h2 className="section-title" style={{ marginBottom: 4 }}>
            {entryCopy.accessibility}
          </h2>
          <p className="body-text" style={{ marginBottom: 8 }}>
            You can also play with the keyboard, switch control or button
            controls. Everything here works during play too.
          </p>
          <QuickToggle id="sound" label={t.sound.label} />
          <QuickToggle id="haptics" label={t.haptics.label} />
          <QuickToggle id="controlledPace" label={t.controlledPace.label} />
          <QuickToggle id="reduceMotion" label={t.reduceMotion.label} />
          <button
            type="button"
            className="btn btn-secondary btn-block"
            style={{ marginTop: 10 }}
            onClick={() => setShowAccess(false)}
          >
            Done
          </button>
        </Sheet>
      )}
    </div>
  );
}
