import { Settings as SettingsIcon } from "lucide-react";
import { skills } from "../content/fixtureCopy";
import { useRouter } from "../state/appState";
import { ScreenHeader, SkillRow } from "./shared";

export function Categories() {
  const { push } = useRouter();
  return (
    <div>
      <ScreenHeader
        title="All skills"
        right={
          <button
            type="button"
            className="icon-btn"
            aria-label="Settings"
            onClick={() => push({ id: "settings" })}
          >
            <SettingsIcon size={21} />
          </button>
        }
      />
      <p className="body-text" style={{ padding: "0 20px 14px" }}>
        Nine areas you can work on. Progress is private to you.
      </p>
      <div>
        {skills.map((skill) => (
          <SkillRow
            key={skill.id}
            skill={skill}
            onOpen={() => push({ id: "skill", skillId: skill.id })}
          />
        ))}
      </div>
    </div>
  );
}
