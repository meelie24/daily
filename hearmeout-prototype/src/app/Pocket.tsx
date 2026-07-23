import { useMemo, useState } from "react";
import { Medal, Search, Settings as SettingsIcon } from "lucide-react";
import {
  badges,
  overallPercent,
  pocketCopy,
  savedItems,
  skills,
} from "../content/fixtureCopy";
import { useRouter } from "../state/appState";
import { LogoMark } from "./shared";

type PocketTab = "saved" | "tree" | "badges";

const LEAF_SPOTS: Array<{ x: number; y: number }> = [
  { x: 74, y: 196 },
  { x: 248, y: 188 },
  { x: 58, y: 142 },
  { x: 258, y: 130 },
  { x: 86, y: 92 },
  { x: 236, y: 82 },
  { x: 118, y: 52 },
  { x: 202, y: 46 },
  { x: 160, y: 24 },
];

function GrowthTree() {
  const C = 2 * Math.PI * 13;
  return (
    <div className="tree-wrap">
      <svg
        className="tree-figure"
        viewBox="0 0 320 270"
        role="img"
        aria-label={`Growth Tree. Overall ${overallPercent} percent. ${skills
          .map((s) => `${s.name} ${s.percent} percent`)
          .join(", ")}.`}
      >
        <path
          d="M160 256 C158 220 154 190 156 150 C157 110 159 70 160 34"
          stroke="#9C7A4F"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />
        {LEAF_SPOTS.map((spot, i) => (
          <path
            key={skills[i].id}
            d={`M158 ${Math.min(244, spot.y + 42)} Q ${(160 + spot.x) / 2} ${
              spot.y + 14
            } ${spot.x} ${spot.y + 4}`}
            stroke="#B08D5F"
            strokeWidth="3.4"
            strokeLinecap="round"
            fill="none"
          />
        ))}
        {LEAF_SPOTS.map((spot, i) => {
          const s = skills[i];
          return (
            <g key={s.id}>
              <circle cx={spot.x} cy={spot.y} r="17" fill={s.accentSoft} />
              <circle
                cx={spot.x}
                cy={spot.y}
                r="13"
                fill="none"
                stroke="rgba(23,33,38,0.1)"
                strokeWidth="4"
              />
              <circle
                cx={spot.x}
                cy={spot.y}
                r="13"
                fill="none"
                stroke={s.accent}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${(s.percent / 100) * C} ${C}`}
                transform={`rotate(-90 ${spot.x} ${spot.y})`}
              />
              <text
                x={spot.x}
                y={spot.y + 3.5}
                textAnchor="middle"
                fontSize="9.5"
                fontWeight="700"
                fill={s.accent}
              >
                {s.percent}
              </text>
            </g>
          );
        })}
        <circle cx="160" cy="252" r="17" fill="#F5F2EC" stroke="#9C7A4F" strokeWidth="2" />
        <text
          x="160"
          y="256"
          textAnchor="middle"
          fontSize="10.5"
          fontWeight="760"
          fill="#172126"
        >
          {overallPercent}%
        </text>
      </svg>
      <div className="tree-legend">
        {skills.map((s) => (
          <span key={s.id} className="tree-legend-item">
            <span className="dot" style={{ background: s.accent }} />
            <span className="nm">{s.name}</span>
            <span style={{ fontWeight: 650 }}>{s.percent}%</span>
          </span>
        ))}
      </div>
      <p className="clarity-note" style={{ padding: "10px 0 0" }}>
        {pocketCopy.growthBody}
      </p>
    </div>
  );
}

export function Pocket() {
  const { push } = useRouter();
  const [tab, setTab] = useState<PocketTab>("saved");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return savedItems;
    return savedItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.body.toLowerCase().includes(q) ||
        item.source.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div>
      <header className="topbar">
        <span className="logo-mark" aria-hidden="true">
          <LogoMark />
        </span>
        <span className="topbar-title">Pocket</span>
        <button
          type="button"
          className="icon-btn"
          aria-label="Settings"
          onClick={() => push({ id: "settings" })}
        >
          <SettingsIcon size={21} />
        </button>
      </header>

      <p
        className="small-label"
        style={{ padding: "0 20px 6px", display: "flex", alignItems: "center", gap: 6 }}
      >
        {pocketCopy.privateLabel}
      </p>

      <div className="segmented" role="tablist" aria-label="Pocket sections">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "saved"}
          onClick={() => setTab("saved")}
        >
          Saved
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "tree"}
          onClick={() => setTab("tree")}
        >
          Growth Tree
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "badges"}
          onClick={() => setTab("badges")}
        >
          Badges
        </button>
      </div>

      {tab === "saved" && (
        <div>
          <div className="search-field">
            <Search size={17} aria-hidden="true" color="#667478" />
            <input
              type="search"
              aria-label="Search saved items"
              placeholder={pocketCopy.searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          {filtered.length === 0 ? (
            <p className="body-text" style={{ padding: "18px 20px" }}>
              {pocketCopy.emptySearch}
            </p>
          ) : (
            filtered.map((item) => (
              <article key={item.id} className="saved-item">
                <span className="saved-source">{item.source}</span>
                <h2 className="saved-title">{item.title}</h2>
                <p className="saved-body">{item.body}</p>
                <p className="saved-date">Saved {item.savedOn}</p>
              </article>
            ))
          )}
        </div>
      )}

      {tab === "tree" && <GrowthTree />}

      {tab === "badges" && (
        <div>
          <p className="body-text" style={{ padding: "0 20px 14px" }}>
            {pocketCopy.badgesBody}
          </p>
          <div className="badge-grid">
            {badges.map((b) => (
              <article key={b.id} className="badge-card">
                <span className="badge-medal" aria-hidden="true">
                  <Medal size={20} />
                </span>
                <span>
                  <div className="badge-name">{b.name}</div>
                  <div className="badge-detail">{b.detail}</div>
                </span>
                <span className="badge-date">Earned {b.earnedOn}</span>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
