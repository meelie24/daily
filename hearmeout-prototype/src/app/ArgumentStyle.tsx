import { useState } from "react";
import { Settings as SettingsIcon } from "lucide-react";
import { argumentStyle, type StyleTendency } from "../content/fixtureCopy";
import { useRouter } from "../state/appState";
import { LogoMark } from "./shared";

type Stage = "intro" | number | "result";

export function ArgumentStyle() {
  const { push } = useRouter();
  const [stage, setStage] = useState<Stage>("intro");
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const topbar = (
    <header className="topbar">
      <span className="logo-mark" aria-hidden="true">
        <LogoMark />
      </span>
      <span className="topbar-title">Argument Style</span>
      <button
        type="button"
        className="icon-btn"
        aria-label="Settings"
        onClick={() => push({ id: "settings" })}
      >
        <SettingsIcon size={21} />
      </button>
    </header>
  );

  if (stage === "intro") {
    return (
      <div>
        {topbar}
        <div className="quiz-wrap">
          <h1 className="display" style={{ margin: "10px 0 12px" }}>
            {argumentStyle.introHeading}
          </h1>
          <p className="body-text" style={{ maxWidth: "36ch", marginBottom: 22 }}>
            {argumentStyle.introBody}
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setStage(0)}
          >
            {argumentStyle.introAction}
          </button>
        </div>
      </div>
    );
  }

  if (stage === "result") {
    const tallies: Record<StyleTendency, number> = {
      push: 0,
      speed: 0,
      quiet: 0,
      watch: 0,
    };
    for (const q of argumentStyle.questions) {
      const opt = q.options.find((o) => o.id === answers[q.id]);
      if (opt) tallies[opt.tendency] += 1;
    }
    const top = (Object.keys(tallies) as StyleTendency[]).reduce((a, b) =>
      tallies[b] > tallies[a] ? b : a,
    );
    const result = argumentStyle.results[top];

    return (
      <div>
        {topbar}
        <div className="quiz-wrap">
          <span className="eyebrow">Today's reflection</span>
          <h1 className="display" style={{ margin: "8px 0 12px" }}>
            {result.heading}
          </h1>
          <p className="body-text" style={{ maxWidth: "38ch" }}>
            {result.body}
          </p>
          <p className="clarity-note">{argumentStyle.resultNote}</p>

          <div className="panel panel-aqua" style={{ marginTop: 18 }}>
            <h2 className="section-title" style={{ marginBottom: 4 }}>
              {argumentStyle.resultAction}
            </h2>
            <p className="body-text" style={{ marginBottom: 14 }}>
              {argumentStyle.resultActionDetail}
            </p>
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={() => push({ id: "mf02" })}
            >
              {argumentStyle.resultAction}
            </button>
          </div>

          <button
            type="button"
            className="btn-quiet"
            style={{ marginTop: 14 }}
            onClick={() => {
              setAnswers({});
              setStage("intro");
            }}
          >
            Start over
          </button>
        </div>
      </div>
    );
  }

  const q = argumentStyle.questions[stage];
  const selected = answers[q.id];

  return (
    <div>
      {topbar}
      <div className="quiz-wrap">
        <div className="quiz-progress" aria-hidden="true">
          {argumentStyle.questions.map((question, i) => (
            <span key={question.id} className={i <= stage ? "active" : ""} />
          ))}
        </div>
        <p className="small-label">
          Question {stage + 1} of {argumentStyle.questions.length}
        </p>
        <h1 className="section-title" style={{ margin: "6px 0 8px" }}>
          {q.text}
        </h1>
        <div role="group" aria-label={q.text}>
          {q.options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className="option-btn"
              aria-pressed={selected === opt.id}
              onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt.id }))}
            >
              {opt.text}
            </button>
          ))}
        </div>
        <div className="quiz-nav">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setStage(stage === 0 ? "intro" : stage - 1)}
          >
            Back
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!selected}
            style={{ opacity: selected ? 1 : 0.45 }}
            onClick={() => {
              if (!selected) return;
              if (stage === argumentStyle.questions.length - 1) setStage("result");
              else setStage(stage + 1);
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
