import { AppProvider, useApp } from "./context/AppContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { BottomNav } from "./components/BottomNav";
import { TreinosTab } from "./components/treinos/TreinosTab";
import { AulasTab } from "./components/aulas/AulasTab";
import { CalendarioTab } from "./components/calendario/CalendarioTab";
import { RecordesTab } from "./components/recordes/RecordesTab";
import { AlertasTab } from "./components/alertas/AlertasTab";
import { NutricaoTab } from "./components/nutricao/NutricaoTab";
import { AdminTab } from "./components/admin/AdminTab";
import { LoginScreen } from "./components/auth/LoginScreen";

const TAB_TITLES: Record<string, string> = {
  treinos: "Treinos",
  aulas: "Aulas",
  calendario: "Calendário",
  recordes: "Recordes",
  alertas: "Alertas",
  nutricao: "Nutrição",
  admin: "Admin",
};

function AppContent() {
  const { state } = useApp();
  const { user, profile, loading: authLoading, signOut } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
          <span className="text-sm text-gray-400">A autenticar...</span>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <LoginScreen />;
  }

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
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                {profile.role}
              </span>
              <button
                onClick={() => void signOut()}
                className="text-[10px] font-semibold text-gray-500 bg-gray-50 px-2 py-1 rounded-full"
              >
                sair
              </button>
            </div>
          </div>
        </header>

        <main className="px-4 pt-4 pb-28">
          {state.activeTab === "treinos" && <TreinosTab />}
          {state.activeTab === "aulas" && <AulasTab />}
          {state.activeTab === "calendario" && <CalendarioTab />}
          {state.activeTab === "recordes" && <RecordesTab />}
          {state.activeTab === "alertas" && <AlertasTab />}
          {state.activeTab === "nutricao" && <NutricaoTab />}
          {state.activeTab === "admin" && <AdminTab />}
        </main>

        <BottomNav />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}
