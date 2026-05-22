import {
  Dumbbell,
  Calendar,
  Salad,
  Trophy,
  Bell,
  CalendarClock,
  Shield,
} from "lucide-react";
import type { Tab } from "../types";
import type { ComponentType } from "react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";

const TABS: {
  id: Tab;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  roles?: Array<"admin" | "coach" | "athlete">;
}[] = [
  { id: "treinos", label: "Treinos", icon: Dumbbell },
  { id: "aulas", label: "Aulas", icon: CalendarClock },
  { id: "calendario", label: "Calendário", icon: Calendar },
  { id: "recordes", label: "Recordes", icon: Trophy },
  { id: "alertas", label: "Alertas", icon: Bell },
  { id: "nutricao", label: "Nutrição", icon: Salad },
  { id: "admin", label: "Admin", icon: Shield, roles: ["admin"] },
];

export function BottomNav() {
  const { state, dispatch } = useApp();
  const { profile } = useAuth();

  const visibleTabs = TABS.filter(
    (t) => !t.roles || (profile && t.roles.includes(profile.role)),
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
      <div className="w-full max-w-[480px] bg-white border-t border-gray-100 flex overflow-x-auto">
        {visibleTabs.map((tab) => {
          const active = state.activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => dispatch({ type: "SET_TAB", payload: tab.id })}
              className={`min-w-[72px] flex-1 flex flex-col items-center gap-0.5 py-3 transition-colors
                ${active ? "text-gray-900" : "text-gray-400"}`}
            >
              <Icon
                size={22}
                className={active ? "text-gray-900" : "text-gray-300"}
              />
              <span
                className={`text-[10px] font-semibold tracking-wide ${active ? "text-gray-900" : "text-gray-400"}`}
              >
                {tab.label}
              </span>
              {active && (
                <span className="absolute bottom-0 w-10 h-0.5 bg-gray-900 rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
