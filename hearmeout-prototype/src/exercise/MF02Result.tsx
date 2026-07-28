import { useEffect } from "react";
import type { MF02Engine } from "./mf02Engine";
import type { ResultKind } from "../types/mf02";
import { resultCopy } from "./mf02FixtureConfig";
import { guide } from "../content/fixtureCopy";
import { OfficeScene } from "../scene/OfficeScene";
import { GuidePortrait } from "../scene/GuidePortrait";
import { playCompletion } from "./audio";

export function MF02Result({
  engine,
  kind,
  onRetry,
  onLeave,
  onContinue,
}: {
  engine: MF02Engine;
  kind: ResultKind;
  onRetry: () => void;
  onLeave: () => void;
  onContinue: () => void;
}) {
  useEffect(() => {
    if (kind === "demonstrated") playCompletion();
  }, [kind]);

  if (kind === "demonstrated") {
    const c = resultCopy.demonstrated;
    return (
      <div className="mf02-stage mf02-stage--scroll">
        <div className="mf02-scene-hero mf02-scene-hero--short">
          <OfficeScene engine={engine} />
          <span className="mf02-scene-state">{c.sceneState}</span>
        </div>
        <div className="mf02-entry-body" role="status">
          <h1 className="display" style={{ marginBottom: 10 }}>
            {c.heading}
          </h1>
          <p className="body-text" style={{ marginBottom: 18 }}>
            {c.feedback}
          </p>

          <div className="mf02-progress-line">
            <span>{c.progress}</span>
            <span className="preview-tag">{c.previewLabel}</span>
          </div>
          <div className="progress-track" style={{ margin: "8px 0 14px" }}>
            <div
              className="progress-fill mf02-progress-grow"
              style={{ background: "#7357D5" }}
            />
          </div>
          <p className="body-text" style={{ marginBottom: 18 }}>
            {c.streakLine}
          </p>

          <div className="mf02-guide-note">
            <GuidePortrait size={52} />
            <p>{guide.resultLine}</p>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={onContinue}
          >
            {c.continueAction}
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-block"
            style={{ marginTop: 10 }}
            onClick={onRetry}
          >
            {c.againAction}
          </button>
        </div>
      </div>
    );
  }

  const c = kind === "crowded" ? resultCopy.crowded : resultCopy.incomplete;
  return (
    <div className="mf02-stage mf02-stage--scroll">
      <div className="mf02-scene-hero mf02-scene-hero--short">
        <OfficeScene engine={engine} />
        <span className="mf02-scene-state">{c.sceneState}</span>
      </div>
      <div className="mf02-entry-body" role="status">
        <h1 className="display" style={{ marginBottom: 10 }}>
          {c.heading}
        </h1>
        <p className="body-text" style={{ marginBottom: 20 }}>
          {c.feedback}
        </p>
        <button type="button" className="btn btn-primary btn-block" onClick={onRetry}>
          {c.retryAction}
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-block"
          style={{ marginTop: 10 }}
          onClick={onLeave}
        >
          {c.leaveAction}
        </button>
        <p className="mf02-eval-note" style={{ marginTop: 14 }}>
          {c.note}
        </p>
      </div>
    </div>
  );
}
