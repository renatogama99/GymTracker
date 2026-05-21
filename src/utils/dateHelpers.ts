import { format } from "date-fns";
import type { WorkoutType } from "../types";

export function todayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function scorePlaceholder(type: WorkoutType): string {
  switch (type) {
    case "amrap":
      return "ex: 4 rondas + 12 reps";
    case "emom":
      return "ex: Completou 10 minutos";
    case "tabata":
      return "ex: 8 rondas × 4 exercícios";
    case "chipper":
      return "ex: 8:42";
    case "wod":
      return "ex: 8:42 · Rx · 5 rondas";
  }
}
