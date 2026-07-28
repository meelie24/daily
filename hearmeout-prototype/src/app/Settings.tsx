import { ChevronRight, ShieldCheck, UserRound, LifeBuoy, RotateCcw } from "lucide-react";
import { settingsCopy } from "../content/fixtureCopy";
import { useRouter, useSettings } from "../state/appState";
import type { SettingsPanelId, SettingsState } from "../types/product";
import { ScreenHeader, useToast } from "./shared";

function ToggleRow({
  id,
  label,
  detail,
}: {
  id: keyof Pick<
    SettingsState,
    "sound" | "haptics" | "controlledPace" | "reduceMotion" | "dailyReminder"
  >;
  label: string;
  detail: string;
}) {
  const { settings, update } = useSettings();
  const on = settings[id];
  return (
    <div className="toggle-row">
      <span className="toggle-copy">
        <div className="toggle-label" id={`toggle-${id}`}>
          {label}
        </div>
        <div className="toggle-detail">{detail}</div>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-labelledby={`toggle-${id}`}
        className="switch"
        onClick={() => update({ [id]: !on })}
      />
    </div>
  );
}

export function Settings() {
  const { push } = useRouter();
  const { update } = useSettings();
  const toast = useToast();
  const t = settingsCopy.toggles;

  const panels: Array<{
    id: SettingsPanelId;
    title: string;
    icon: React.ReactNode;
  }> = [
    {
      id: "privacy",
      title: settingsCopy.panels.privacy.title,
      icon: <ShieldCheck size={20} color="#007A7E" aria-hidden="true" />,
    },
    {
      id: "identity",
      title: settingsCopy.panels.identity.title,
      icon: <UserRound size={20} color="#7357D5" aria-hidden="true" />,
    },
    {
      id: "safety",
      title: settingsCopy.panels.safety.title,
      icon: <LifeBuoy size={20} color="#B83A55" aria-hidden="true" />,
    },
  ];

  return (
    <div>
      <ScreenHeader title={settingsCopy.title} />
      <ToggleRow id="sound" label={t.sound.label} detail={t.sound.detail} />
      <ToggleRow id="haptics" label={t.haptics.label} detail={t.haptics.detail} />
      <ToggleRow
        id="controlledPace"
        label={t.controlledPace.label}
        detail={t.controlledPace.detail}
      />
      <ToggleRow
        id="reduceMotion"
        label={t.reduceMotion.label}
        detail={t.reduceMotion.detail}
      />
      <ToggleRow
        id="dailyReminder"
        label={t.dailyReminder.label}
        detail={t.dailyReminder.detail}
      />

      {panels.map((p) => (
        <button
          key={p.id}
          type="button"
          className="settings-link"
          onClick={() => push({ id: "settings-panel", panelId: p.id })}
        >
          {p.icon}
          <span style={{ flex: 1 }}>{p.title}</span>
          <ChevronRight size={19} className="row-chevron" aria-hidden="true" />
        </button>
      ))}

      <button
        type="button"
        className="settings-link"
        onClick={() => {
          update({ seenMF02Instructions: false });
          toast(settingsCopy.resetInstructions.done);
        }}
      >
        <RotateCcw size={20} color="#4C5A5E" aria-hidden="true" />
        <span style={{ flex: 1 }}>
          {settingsCopy.resetInstructions.label}
          <div className="toggle-detail" style={{ fontWeight: 400 }}>
            {settingsCopy.resetInstructions.detail}
          </div>
        </span>
      </button>

      <p className="settings-note">{settingsCopy.evaluationNote}</p>
    </div>
  );
}

function IdentityChips({
  label,
  options,
  value,
  onPick,
}: {
  label: string;
  options: string[];
  value: string;
  onPick: (v: string) => void;
}) {
  const skip = settingsCopy.panels.identity.skip;
  return (
    <div className="identity-group">
      <h3>{label}</h3>
      <div className="chip-row" role="group" aria-label={label}>
        {[...options, skip].map((opt) => {
          const isSkip = opt === skip;
          const selected = isSkip ? value === "" : value === opt;
          return (
            <button
              key={opt}
              type="button"
              className="chip"
              aria-pressed={selected}
              onClick={() => onPick(isSkip ? "" : opt)}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SettingsPanel({ panelId }: { panelId: SettingsPanelId }) {
  const { settings, updateIdentity } = useSettings();
  const p = settingsCopy.panels;

  if (panelId === "privacy") {
    return (
      <div>
        <ScreenHeader title={p.privacy.title} />
        <div className="panel-body">
          {p.privacy.body.map((line) => (
            <p key={line.slice(0, 24)}>{line}</p>
          ))}
        </div>
      </div>
    );
  }

  if (panelId === "safety") {
    /* Safety screen: no ambient motion, plain surfaces. */
    return (
      <div>
        <ScreenHeader title={p.safety.title} />
        <div className="panel-body">
          {p.safety.body.map((line) => (
            <p key={line.slice(0, 24)}>{line}</p>
          ))}
        </div>
      </div>
    );
  }

  const id = settings.identity;
  return (
    <div>
      <ScreenHeader title={p.identity.title} />
      <div className="panel-body">
        <p>{p.identity.body}</p>
        <IdentityChips
          label="Pronouns"
          options={p.identity.pronouns}
          value={id.pronouns}
          onPick={(v) => updateIdentity({ pronouns: v })}
        />
        <IdentityChips
          label="Gender identity"
          options={p.identity.genders}
          value={id.genderIdentity}
          onPick={(v) => updateIdentity({ genderIdentity: v })}
        />
        <IdentityChips
          label="Sexual orientation"
          options={p.identity.orientations}
          value={id.orientation}
          onPick={(v) => updateIdentity({ orientation: v })}
        />
        <IdentityChips
          label="Practice cast"
          options={p.identity.cast}
          value={id.castPreference}
          onPick={(v) => updateIdentity({ castPreference: v })}
        />
      </div>
    </div>
  );
}
