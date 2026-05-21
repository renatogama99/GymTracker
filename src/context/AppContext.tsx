import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type {
  WorkoutLog,
  Tab,
  LiftEntry,
  BenchmarkEntry,
  Alert,
  DayCompletion,
} from "../types";
import * as db from "../lib/db";

interface AppState {
  logs: WorkoutLog[];
  lifts: LiftEntry[];
  benchmarks: BenchmarkEntry[];
  alerts: Alert[];
  completions: DayCompletion[];
  activeTab: Tab;
  loading: boolean;
}

type Action =
  | {
      type: "INIT";
      payload: {
        logs: WorkoutLog[];
        lifts: LiftEntry[];
        benchmarks: BenchmarkEntry[];
        alerts: Alert[];
        completions: DayCompletion[];
      };
    }
  | { type: "ADD_LOG"; payload: WorkoutLog }
  | { type: "DELETE_LOG"; payload: string }
  | { type: "ADD_LIFT"; payload: LiftEntry }
  | { type: "DELETE_LIFT"; payload: string }
  | { type: "ADD_BENCHMARK"; payload: BenchmarkEntry }
  | { type: "DELETE_BENCHMARK"; payload: string }
  | { type: "ADD_ALERT"; payload: Alert }
  | { type: "DELETE_ALERT"; payload: string }
  | { type: "TOGGLE_ALERT"; payload: { id: string; enabled: boolean } }
  | { type: "SET_COMPLETIONS"; payload: DayCompletion[] }
  | { type: "SET_TAB"; payload: Tab };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "INIT":
      return { ...state, ...action.payload, loading: false };
    case "ADD_LOG":
      return { ...state, logs: [action.payload, ...state.logs] };
    case "DELETE_LOG":
      return {
        ...state,
        logs: state.logs.filter((l) => l.id !== action.payload),
      };
    case "ADD_LIFT":
      return { ...state, lifts: [action.payload, ...state.lifts] };
    case "DELETE_LIFT":
      return {
        ...state,
        lifts: state.lifts.filter((l) => l.id !== action.payload),
      };
    case "ADD_BENCHMARK":
      return { ...state, benchmarks: [action.payload, ...state.benchmarks] };
    case "DELETE_BENCHMARK":
      return {
        ...state,
        benchmarks: state.benchmarks.filter((b) => b.id !== action.payload),
      };
    case "ADD_ALERT":
      return { ...state, alerts: [...state.alerts, action.payload] };
    case "DELETE_ALERT":
      return {
        ...state,
        alerts: state.alerts.filter((a) => a.id !== action.payload),
      };
    case "TOGGLE_ALERT":
      return {
        ...state,
        alerts: state.alerts.map((a) =>
          a.id === action.payload.id
            ? { ...a, enabled: action.payload.enabled }
            : a,
        ),
      };
    case "SET_COMPLETIONS":
      return { ...state, completions: action.payload };
    case "SET_TAB":
      return { ...state, activeTab: action.payload };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: (action: Action) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, localDispatch] = useReducer(reducer, {
    logs: [],
    lifts: [],
    benchmarks: [],
    alerts: [],
    completions: [],
    activeTab: "treinos",
    loading: true,
  });

  // Load all data from Supabase on mount
  useEffect(() => {
    async function init() {
      try {
        const [logs, lifts, benchmarks, alerts, completions] =
          await Promise.all([
            db.fetchLogs(),
            db.fetchLifts(),
            db.fetchBenchmarks(),
            db.fetchAlerts(),
            db.fetchCompletions(),
          ]);
        localDispatch({
          type: "INIT",
          payload: { logs, lifts, benchmarks, alerts, completions },
        });
      } catch (err) {
        console.error("[GymTracker] Failed to load from Supabase:", err);
        localDispatch({
          type: "INIT",
          payload: {
            logs: [],
            lifts: [],
            benchmarks: [],
            alerts: [],
            completions: [],
          },
        });
      }
    }
    void init();
  }, []);

  // Poll completions every 30s — the bot may update them via Telegram
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const completions = await db.fetchCompletions();
        localDispatch({ type: "SET_COMPLETIONS", payload: completions });
      } catch {
        // silently ignore polling errors
      }
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  // Wrapped dispatch: optimistic local update + async Supabase persist
  const dispatch = useCallback((action: Action) => {
    localDispatch(action);
    switch (action.type) {
      case "ADD_LOG":
        db.insertLog(action.payload).catch(console.error);
        break;
      case "DELETE_LOG":
        db.removeLog(action.payload).catch(console.error);
        break;
      case "ADD_LIFT":
        db.insertLift(action.payload).catch(console.error);
        break;
      case "DELETE_LIFT":
        db.removeLift(action.payload).catch(console.error);
        break;
      case "ADD_BENCHMARK":
        db.insertBenchmark(action.payload).catch(console.error);
        break;
      case "DELETE_BENCHMARK":
        db.removeBenchmark(action.payload).catch(console.error);
        break;
      case "ADD_ALERT":
        db.insertAlert(action.payload).catch(console.error);
        break;
      case "DELETE_ALERT":
        db.removeAlert(action.payload).catch(console.error);
        break;
      case "TOGGLE_ALERT":
        db
          .updateAlertEnabled(action.payload.id, action.payload.enabled)
          .catch(console.error);
        break;
    }
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
