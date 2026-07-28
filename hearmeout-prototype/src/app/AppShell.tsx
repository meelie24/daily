import { useCallback, useEffect, useRef, useState } from "react";
import { RouterProvider, SettingsProvider, useRouter } from "../state/appState";
import { BridgeHome } from "./BridgeHome";
import { Categories } from "./Categories";
import { SkillDetail } from "./SkillDetail";
import { ArgumentStyle } from "./ArgumentStyle";
import { Clarity } from "./Clarity";
import { Pocket } from "./Pocket";
import { Settings, SettingsPanel } from "./Settings";
import { Navigation } from "./Navigation";
import { MF02Flow } from "../exercise/MF02Flow";
import { ToastContext } from "./shared";
import { unlockAudio } from "../exercise/audio";

function CurrentScreen() {
  const { route } = useRouter();
  switch (route.id) {
    case "bridge":
      return <BridgeHome />;
    case "style":
      return <ArgumentStyle />;
    case "clarity":
      return <Clarity />;
    case "pocket":
      return <Pocket />;
    case "categories":
      return <Categories />;
    case "skill":
      return <SkillDetail skillId={route.skillId} />;
    case "settings":
      return <Settings />;
    case "settings-panel":
      return <SettingsPanel panelId={route.panelId} />;
    case "mf02":
      return <MF02Flow />;
  }
}

function Frame() {
  const { route } = useRouter();
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastMsg(null), 3600);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  const immersive = route.id === "mf02";

  return (
    <ToastContext.Provider value={toast}>
      <div className="app-viewport" onPointerDownCapture={unlockAudio}>
        <div className="phone">
          <main className={`screen${immersive ? " screen--bare" : ""}`}>
            <CurrentScreen />
          </main>
          {!immersive && <Navigation />}
          {toastMsg && (
            <div className="toast" role="status">
              {toastMsg}
            </div>
          )}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function AppShell() {
  return (
    <SettingsProvider>
      <RouterProvider>
        <Frame />
      </RouterProvider>
    </SettingsProvider>
  );
}
