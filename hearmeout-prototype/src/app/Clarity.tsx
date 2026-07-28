import { useState } from "react";
import { Settings as SettingsIcon } from "lucide-react";
import { clarity } from "../content/fixtureCopy";
import { useRouter } from "../state/appState";
import { LogoMark, useToast } from "./shared";

export function Clarity() {
  const { push } = useRouter();
  const toast = useToast();
  const [context, setContext] = useState<string | null>("Coworker");
  const [text, setText] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [usedExample, setUsedExample] = useState(false);

  const canAnalyze = text.trim().length > 0;

  return (
    <div>
      <header className="topbar">
        <span className="logo-mark" aria-hidden="true">
          <LogoMark />
        </span>
        <span className="topbar-title">Clarity</span>
        <button
          type="button"
          className="icon-btn"
          aria-label="Settings"
          onClick={() => push({ id: "settings" })}
        >
          <SettingsIcon size={21} />
        </button>
      </header>

      <div style={{ padding: "8px 20px 20px" }}>
        <h1 className="display" style={{ marginBottom: 8 }}>
          {clarity.heading}
        </h1>
        <p className="body-text" style={{ maxWidth: "36ch", marginBottom: 10 }}>
          {clarity.body}
        </p>

        <p className="small-label" style={{ marginBottom: 4 }}>
          Who is this about?
        </p>
        <div className="chip-row" role="group" aria-label="Relationship context">
          {clarity.contexts.map((c) => (
            <button
              key={c}
              type="button"
              className="chip"
              aria-pressed={context === c}
              onClick={() => setContext(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <label className="small-label" htmlFor="clarity-text">
          The message or moment
        </label>
        <textarea
          id="clarity-text"
          className="clarity-input"
          placeholder={clarity.placeholder}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setShowResult(false);
          }}
          style={{ marginTop: 6 }}
        />
        <p className="clarity-note" style={{ paddingTop: 6 }}>
          {clarity.privacyNote}
        </p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setText(clarity.exampleText);
              setUsedExample(true);
              setShowResult(false);
            }}
          >
            {clarity.useExample}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!canAnalyze}
            style={{ opacity: canAnalyze ? 1 : 0.45, flex: 1 }}
            onClick={() => {
              setUsedExample(text.trim() === clarity.exampleText);
              setShowResult(true);
            }}
          >
            {clarity.analyzeAction}
          </button>
        </div>

        {showResult && (
          <section aria-label="Clarity reading" style={{ marginTop: 22 }}>
            {!usedExample && (
              <p className="clarity-note" style={{ paddingTop: 0 }}>
                {clarity.result.customNote}
              </p>
            )}
            {(
              [
                clarity.result.says,
                clarity.result.reading,
                clarity.result.concern,
                clarity.result.unclear,
              ] as const
            ).map((part) => (
              <div key={part.label} className="clarity-result-section">
                <div className="clarity-label">{part.label}</div>
                <p className="body-text">{part.text}</p>
              </div>
            ))}
            <p className="clarity-note">{clarity.result.note}</p>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => toast(clarity.savedConfirm)}
              >
                {clarity.saveAction}
              </button>
            </div>

            <div className="panel panel-aqua" style={{ marginTop: 20 }}>
              <span className="small-label">{clarity.practiceRoute.label}</span>
              <h2 className="section-title" style={{ margin: "4px 0 12px" }}>
                {clarity.practiceRoute.heading}
              </h2>
              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={() => push({ id: "mf02" })}
              >
                {clarity.practiceRoute.action}
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
