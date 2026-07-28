import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSettings } from "../state/appState";
import type { ResultKind } from "../types/mf02";
import { MF02Engine } from "./mf02Engine";
import { MF02Entry } from "./MF02Entry";
import { MF02Instructions } from "./MF02Instructions";
import { MF02Game } from "./MF02Game";
import { MF02Result } from "./MF02Result";
import { stopPrinter, stopRoomTone } from "./audio";

type Stage = "entry" | "instructions" | "game" | "result";

export function MF02Flow() {
  const { back } = useRouter();
  const { settings, update } = useSettings();
  const engineRef = useRef<MF02Engine | null>(null);
  if (!engineRef.current) engineRef.current = new MF02Engine();
  const engine = engineRef.current;

  const [stage, setStage] = useState<Stage>("entry");
  const [result, setResult] = useState<ResultKind | null>(null);

  useEffect(() => {
    engine.startClock();
    return () => {
      engine.dispose();
      stopRoomTone();
      stopPrinter();
    };
  }, [engine]);

  /* Dev-only hook so the scripted browser walkthrough can time inputs. */
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const w = window as unknown as Record<string, unknown>;
    w.__mf02Engine = engine;
    return () => {
      delete w.__mf02Engine;
    };
  }, [engine]);

  useEffect(() => {
    engine.setControlledPace(settings.controlledPace);
  }, [engine, settings.controlledPace]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) engine.pause("hidden");
      else engine.resume("hidden");
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [engine]);

  useEffect(() => {
    return engine.onEvent((e) => {
      if (e.kind === "finished") {
        setResult(e.result);
        window.setTimeout(() => setStage("result"), 700);
      }
    });
  }, [engine]);

  const actions = useMemo(
    () => ({
      begin() {
        if (settings.seenMF02Instructions) {
          engine.reset();
          engine.startGame();
          setStage("game");
        } else {
          setStage("instructions");
        }
      },
      startPlay() {
        update({ seenMF02Instructions: true });
        engine.reset();
        engine.startGame();
        setStage("game");
      },
      retry() {
        setResult(null);
        engine.reset();
        engine.startGame();
        setStage("game");
      },
      toEntry() {
        setResult(null);
        engine.reset();
        setStage("entry");
      },
      exitFlow() {
        back();
      },
    }),
    [engine, settings.seenMF02Instructions, update, back],
  );

  if (stage === "entry") {
    return <MF02Entry engine={engine} onBegin={actions.begin} onExit={actions.exitFlow} />;
  }
  if (stage === "instructions") {
    return <MF02Instructions engine={engine} onStart={actions.startPlay} onBack={actions.toEntry} />;
  }
  if (stage === "game") {
    return <MF02Game engine={engine} onLeave={actions.toEntry} />;
  }
  return (
    <MF02Result
      engine={engine}
      kind={result ?? "incomplete"}
      onRetry={actions.retry}
      onLeave={actions.toEntry}
      onContinue={actions.toEntry}
    />
  );
}
