import { Check, Clock3, Settings as SettingsIcon, Waypoints } from "lucide-react";
import {
  bridgeHero,
  dailyRep,
  guide,
  insightRoute,
  skills,
  streak,
  weekSummary,
} from "../content/fixtureCopy";
import { useRouter } from "../state/appState";
import { GuidePortrait } from "../scene/GuidePortrait";
import { LogoMark, SkillRow } from "./shared";

export function BridgeHome() {
  const { push } = useRouter();
  const openPractice = () => push({ id: "mf02" });
  const preview = skills.slice(0, 3);

  return (
    <div>
      <header className="topbar">
        <span className="logo-mark" aria-hidden="true">
          <LogoMark />
        </span>
        <span className="topbar-title">HearMeOut</span>
        <button
          type="button"
          className="icon-btn"
          aria-label="Settings"
          onClick={() => push({ id: "settings" })}
        >
          <SettingsIcon size={21} />
        </button>
      </header>

      <section className="bridge-hero">
        <span className="eyebrow">{bridgeHero.eyebrow}</span>
        <h1 className="display">{bridgeHero.heading}</h1>
        <p className="body-text">{bridgeHero.body}</p>
        <button type="button" className="btn btn-primary" onClick={openPractice}>
          {bridgeHero.primary}
        </button>
      </section>

      <div className="bridge-guide">
        <GuidePortrait size={56} />
        <p className="bridge-guide-text">{guide.bridgeLine}</p>
      </div>

      <section className="insight-route" aria-label="From your Clarity result">
        <span className="small-label">{insightRoute.label}</span>
        <h2 className="section-title">{insightRoute.heading}</h2>
        <p className="body-text">{insightRoute.body}</p>
        <button type="button" className="btn-quiet" onClick={openPractice}>
          {insightRoute.action} →
        </button>
      </section>

      <section className="section-block" aria-label="Daily Rep">
        <div className="panel panel-lavender daily-rep">
          <span className="daily-rep-icon" aria-hidden="true">
            <Waypoints size={22} />
          </span>
          <span className="daily-rep-copy">
            <span className="small-label">{dailyRep.title}</span>
            <div className="daily-rep-name">{dailyRep.name}</div>
            <div className="daily-rep-meta">
              <Clock3
                size={12}
                style={{ verticalAlign: "-1.5px", marginRight: 4 }}
                aria-hidden="true"
              />
              {dailyRep.time}
            </div>
          </span>
          <button
            type="button"
            className="btn btn-primary"
            style={{ minHeight: 44, padding: "10px 18px" }}
            onClick={openPractice}
          >
            {dailyRep.action}
          </button>
        </div>
      </section>

      <section className="section-block" aria-label="Skill categories">
        <div className="section-row">
          <h2 className="section-title">Skills</h2>
          <button
            type="button"
            className="btn-quiet"
            onClick={() => push({ id: "categories" })}
          >
            See all
          </button>
        </div>
      </section>
      <div>
        {preview.map((skill) => (
          <SkillRow
            key={skill.id}
            skill={skill}
            onOpen={() => push({ id: "skill", skillId: skill.id })}
          />
        ))}
      </div>

      <hr className="hairline" style={{ margin: "8px 20px 0" }} />

      <section className="streak-strip" aria-label="Practice streak">
        <div className="streak-days" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className={`streak-day${i < streak.days ? " done" : ""}`}>
              {i < streak.days ? <Check size={14} /> : null}
            </span>
          ))}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>
            {streak.label}
          </div>
          <div className="muted" style={{ fontSize: "0.84rem" }}>
            {streak.detail}
          </div>
        </div>
      </section>

      <p className="week-summary">
        {weekSummary.line} <span className="preview-tag">{weekSummary.label}</span>
      </p>
    </div>
  );
}
