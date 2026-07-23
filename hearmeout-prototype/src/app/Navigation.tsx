import { Eye, MessagesSquare, Pocket as PocketIcon, Waypoints } from "lucide-react";
import { useRouter } from "../state/appState";
import type { TabId } from "../types/product";

const TABS: Array<{ id: TabId; label: string; icon: typeof Waypoints }> = [
  { id: "bridge", label: "Bridge", icon: Waypoints },
  { id: "style", label: "Style", icon: MessagesSquare },
  { id: "clarity", label: "Clarity", icon: Eye },
  { id: "pocket", label: "Pocket", icon: PocketIcon },
];

export function Navigation() {
  const { tab, setTab } = useRouter();
  return (
    <nav className="tabbar" aria-label="Primary">
      {TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          className="tab"
          aria-current={tab === id ? "page" : undefined}
          onClick={() => setTab(id)}
        >
          <Icon size={21} aria-hidden="true" />
          {label}
        </button>
      ))}
    </nav>
  );
}
