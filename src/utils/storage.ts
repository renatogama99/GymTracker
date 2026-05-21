import type { WorkoutLog, LiftEntry, BenchmarkEntry } from "../types";

const LOGS_KEY = "crossfit_logs";
const LIFTS_KEY = "crossfit_lifts";
const BENCHMARKS_KEY = "crossfit_benchmarks";

function getItem<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

function setItem<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export const getLogs = (): WorkoutLog[] => getItem<WorkoutLog>(LOGS_KEY);
export const saveLogs = (v: WorkoutLog[]): void => setItem(LOGS_KEY, v);

export const getLiftEntries = (): LiftEntry[] => getItem<LiftEntry>(LIFTS_KEY);
export const saveLiftEntries = (v: LiftEntry[]): void => setItem(LIFTS_KEY, v);

export const getBenchmarkEntries = (): BenchmarkEntry[] =>
  getItem<BenchmarkEntry>(BENCHMARKS_KEY);
export const saveBenchmarkEntries = (v: BenchmarkEntry[]): void =>
  setItem(BENCHMARKS_KEY, v);
