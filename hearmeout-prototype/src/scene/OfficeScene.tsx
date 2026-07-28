import { useEffect, useRef, useState } from "react";
import type { MF02Engine } from "../exercise/mf02Engine";
import { useSettings } from "../state/appState";
import { createOfficeScene, webglAvailable } from "./officeScene3d";
import { SceneFallback } from "./SceneFallback";

/**
 * Hosts the living office scene: real 3D where WebGL is available, an
 * animated stateful fallback everywhere else. One renderer per canvas,
 * disposed on unmount.
 */
export function OfficeScene({ engine }: { engine: MF02Engine }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { settings } = useSettings();
  const reducedRef = useRef(settings.reduceMotion);
  reducedRef.current = settings.reduceMotion;
  const [use3d] = useState(() => webglAvailable());
  const [fell, setFell] = useState(false);

  useEffect(() => {
    if (!use3d || !containerRef.current) return;
    const handle = createOfficeScene(containerRef.current, {
      getSnapshot: () => engine.getSnapshot(),
      isReducedMotion: () => reducedRef.current,
    });
    if (!handle) {
      setFell(true);
      return;
    }
    return () => handle.dispose();
  }, [engine, use3d]);

  if (!use3d || fell) {
    return <SceneFallback engine={engine} />;
  }
  return <div ref={containerRef} className="scene-canvas" aria-hidden="true" />;
}
