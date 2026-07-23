import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Route, SettingsState, TabId } from "../types/product";
import { setAudioMuted } from "../exercise/audio";
import { setHapticsEnabled } from "../exercise/haptics";

const STORAGE_KEY = "hearmeout-eval.settings.v1";

const defaultSettings: SettingsState = {
  sound: true,
  haptics: true,
  controlledPace: false,
  reduceMotion: false,
  dailyReminder: false,
  seenMF02Instructions: false,
  identity: {
    pronouns: "",
    genderIdentity: "",
    orientation: "",
    castPreference: "",
  },
};

function loadSettings(): SettingsState {
  if (typeof localStorage === "undefined") return defaultSettings;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw) as Partial<SettingsState>;
    return {
      ...defaultSettings,
      ...parsed,
      identity: { ...defaultSettings.identity, ...parsed.identity },
    };
  } catch {
    return defaultSettings;
  }
}

type SettingsContextValue = {
  settings: SettingsState;
  update: (patch: Partial<SettingsState>) => void;
  updateIdentity: (patch: Partial<SettingsState["identity"]>) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SettingsState>(loadSettings);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* private mode */
    }
  }, [settings]);

  useEffect(() => {
    setAudioMuted(!settings.sound);
  }, [settings.sound]);

  useEffect(() => {
    setHapticsEnabled(settings.haptics);
  }, [settings.haptics]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("motion-reduced", settings.reduceMotion);
    root.classList.toggle("motion-auto", !settings.reduceMotion);
  }, [settings.reduceMotion]);

  const update = useCallback((patch: Partial<SettingsState>) => {
    setSettings((s) => ({ ...s, ...patch }));
  }, []);

  const updateIdentity = useCallback(
    (patch: Partial<SettingsState["identity"]>) => {
      setSettings((s) => ({ ...s, identity: { ...s.identity, ...patch } }));
    },
    [],
  );

  const value = useMemo(
    () => ({ settings, update, updateIdentity }),
    [settings, update, updateIdentity],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const v = useContext(SettingsContext);
  if (!v) throw new Error("useSettings outside provider");
  return v;
}

/* ---- router ---- */

type RouterContextValue = {
  route: Route;
  tab: TabId;
  push: (route: Route) => void;
  back: () => void;
  setTab: (tab: TabId) => void;
  canGoBack: boolean;
};

const RouterContext = createContext<RouterContextValue | null>(null);

export function RouterProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<Route[]>([{ id: "bridge" }]);
  const [tab, setTabState] = useState<TabId>("bridge");

  const push = useCallback((route: Route) => {
    setStack((s) => [...s, route]);
  }, []);

  const back = useCallback(() => {
    setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  }, []);

  const setTab = useCallback((next: TabId) => {
    setTabState(next);
    setStack([{ id: next }]);
  }, []);

  const route = stack[stack.length - 1];

  useEffect(() => {
    const scroller = document.querySelector(".screen");
    if (scroller) scroller.scrollTop = 0;
  }, [route]);

  const value = useMemo(
    () => ({ route, tab, push, back, setTab, canGoBack: stack.length > 1 }),
    [route, tab, push, back, setTab, stack.length],
  );

  return (
    <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
  );
}

export function useRouter(): RouterContextValue {
  const v = useContext(RouterContext);
  if (!v) throw new Error("useRouter outside provider");
  return v;
}
