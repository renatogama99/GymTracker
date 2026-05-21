import { AppProvider, useApp } from "./context/AppContext";
import { BottomNav } from "./components/BottomNav";
import { TreinosTab } from "./components/treinos/TreinosTab";
import { CalendarioTab } from "./components/calendario/CalendarioTab";
import { RecordesTab } from "./components/recordes/RecordesTab";
import { AlertasTab } from "./components/alertas/AlertasTab";
import { NutricaoTab } from "./components/nutricao/NutricaoTab";

const TAB_TITLES: Record<string, string> = {
  treinos: "Treinos",
  calendario: "Calendário",
  recordes: "Recordes",
  alertas: "Alertas",
  nutricao: "Nutrição",
};

function AppContent() {
  const { state } = useApp();

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
          <span className="text-sm text-gray-400">A carregar dados…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-[480px] relative">
        <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
          <div className="flex items-center justify-between px-4 pt-12 pb-3">
            <h1 className="text-xl font-bold text-gray-900">
              {TAB_TITLES[state.activeTab]}
            </h1>
            <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
              CrossFit Tracker
            </span>
          </div>
        </header>

        <main className="px-4 pt-4 pb-28">
          {state.activeTab === "treinos" && <TreinosTab />}
          {state.activeTab === "calendario" && <CalendarioTab />}
          {state.activeTab === "recordes" && <RecordesTab />}
          {state.activeTab === "alertas" && <AlertasTab />}
          {state.activeTab === "nutricao" && <NutricaoTab />}
        </main>

        <BottomNav />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
