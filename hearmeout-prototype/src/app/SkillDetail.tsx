import { useState } from "react";
import { ChevronRight, Lock, Settings as SettingsIcon } from "lucide-react";
import { categoryShell, communication, skills } from "../content/fixtureCopy";
import { useRouter } from "../state/appState";
import { ScreenHeader, Sheet, SkillProgress } from "./shared";

export function SkillDetail({ skillId }: { skillId: string }) {
  const { push, back } = useRouter();
  const skill = skills.find((s) => s.id === skillId) ?? skills[0];
  const [sheetFor, setSheetFor] = useState<string | null>(null);

  const settingsBtn = (
    <button
      type="button"
      className="icon-btn"
      aria-label="Settings"
      onClick={() => push({ id: "settings" })}
    >
      <SettingsIcon size={21} />
    </button>
  );

  if (skill.id !== "communication") {
    return (
      <div>
        <ScreenHeader title={skill.name} right={settingsBtn} />
        <div className="skill-head">
          <h1 className="display">{skill.name}</h1>
          <SkillProgress
            percent={skill.percent}
            accent={skill.accent}
            name={skill.name}
          />
        </div>
        <div style={{ padding: "0 20px" }}>
          <div className="panel">
            <h2 className="section-title" style={{ marginBottom: 8 }}>
              {categoryShell.heading}
            </h2>
            <p className="body-text" style={{ marginBottom: 14 }}>
              {categoryShell.body}
            </p>
            <button
              type="button"
              className="btn btn-secondary btn-block"
              onClick={() => {
                back();
                push({ id: "skill", skillId: "communication" });
              }}
            >
              {categoryShell.action}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ScreenHeader title={communication.title} right={settingsBtn} />
      <div className="skill-head">
        <h1 className="display">{communication.title}</h1>
        <SkillProgress
          percent={communication.percent}
          accent={skill.accent}
          name={communication.title}
        />
        <p className="body-text">{communication.body}</p>
      </div>

      <div aria-label="Communication practice areas">
        {communication.subcategories.map((sub) => (
          <button
            key={sub.id}
            type="button"
            className="sub-row"
            onClick={() => {
              if (sub.playable) push({ id: "mf02" });
              else setSheetFor(sub.name);
            }}
          >
            <span className="sub-name">{sub.name}</span>
            {sub.playable ? (
              <span className="mechanic-tag">{communication.mechanicTag}</span>
            ) : (
              <Lock size={15} className="row-chevron" aria-hidden="true" />
            )}
            <ChevronRight size={19} className="row-chevron" aria-hidden="true" />
          </button>
        ))}
      </div>

      {sheetFor && (
        <Sheet label={sheetFor} onClose={() => setSheetFor(null)}>
          <h2 className="section-title" style={{ marginBottom: 8 }}>
            {sheetFor}
          </h2>
          <p className="body-text" style={{ marginBottom: 16 }}>
            {communication.notConnected}
          </p>
          <button
            type="button"
            className="btn btn-secondary btn-block"
            onClick={() => setSheetFor(null)}
          >
            Got it
          </button>
        </Sheet>
      )}
    </div>
  );
}
