import { createContext, useContext, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "../state/appState";
import type { Skill } from "../types/product";

export function LogoMark({ size = 26 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 22c0-7 4.5-12 11-12s11 5 11 12"
        stroke="#007A7E"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <circle cx="5" cy="24.5" r="2.6" fill="#0B8FA8" />
      <circle cx="27" cy="24.5" r="2.6" fill="#7357D5" />
    </svg>
  );
}

export function ScreenHeader({
  title,
  right,
  onBack,
}: {
  title: string;
  right?: ReactNode;
  onBack?: () => void;
}) {
  const { back } = useRouter();
  return (
    <header className="screen-header">
      <button
        type="button"
        className="icon-btn"
        aria-label="Back"
        onClick={onBack ?? back}
      >
        <ChevronLeft size={22} />
      </button>
      <h1 className="screen-header-title">{title}</h1>
      {right ?? <span style={{ width: 44 }} />}
    </header>
  );
}

export function Sheet({
  onClose,
  label,
  children,
}: {
  onClose: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <div
      className="sheet-backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div role="dialog" aria-modal="true" aria-label={label} className="sheet">
        {children}
      </div>
    </div>
  );
}

export function SkillProgress({
  percent,
  accent,
  name,
}: {
  percent: number;
  accent: string;
  name: string;
}) {
  return (
    <div className="skill-progress">
      <div
        className="progress-track"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${name} progress`}
      >
        <div
          className="progress-fill"
          style={{ width: `${percent}%`, background: accent }}
        />
      </div>
      <span className="skill-pct">{percent}%</span>
    </div>
  );
}

export function SkillRow({
  skill,
  onOpen,
}: {
  skill: Skill;
  onOpen: () => void;
}) {
  return (
    <button type="button" className="skill-row" onClick={onOpen}>
      <span
        className="skill-dot"
        style={{ background: skill.accentSoft, color: skill.accent }}
        aria-hidden="true"
      >
        {skill.name.slice(0, 1)}
      </span>
      <span className="skill-info">
        <span className="skill-name">{skill.name}</span>
        <SkillProgress
          percent={skill.percent}
          accent={skill.accent}
          name={skill.name}
        />
      </span>
      <ChevronRight className="row-chevron" size={19} aria-hidden="true" />
    </button>
  );
}

/* ---- toast ---- */

export const ToastContext = createContext<(msg: string) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}
