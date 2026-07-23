export type TabId = "bridge" | "style" | "clarity" | "pocket";

export type Route =
  | { id: "bridge" }
  | { id: "style" }
  | { id: "clarity" }
  | { id: "pocket" }
  | { id: "categories" }
  | { id: "skill"; skillId: string }
  | { id: "settings" }
  | { id: "settings-panel"; panelId: SettingsPanelId }
  | { id: "mf02" };

export type SettingsPanelId = "privacy" | "identity" | "safety";

export type Skill = {
  id: string;
  name: string;
  accent: string;
  accentSoft: string;
  percent: number;
};

export type Subcategory = {
  id: string;
  name: string;
  playable: boolean;
};

export type SavedItem = {
  id: string;
  source: "Clarity" | "Argument Style" | "Bridge";
  title: string;
  body: string;
  savedOn: string;
};

export type Badge = {
  id: string;
  name: string;
  detail: string;
  earnedOn: string;
};

export type IdentityPrefs = {
  pronouns: string;
  genderIdentity: string;
  orientation: string;
  castPreference: string;
};

export type SettingsState = {
  sound: boolean;
  haptics: boolean;
  controlledPace: boolean;
  reduceMotion: boolean;
  dailyReminder: boolean;
  seenMF02Instructions: boolean;
  identity: IdentityPrefs;
};
