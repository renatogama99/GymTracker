export type WorkoutType = "amrap" | "emom" | "tabata" | "chipper" | "wod";

export type Tab =
  | "treinos"
  | "calendario"
  | "recordes"
  | "alertas"
  | "nutricao";

export interface WorkoutLog {
  id: string;
  date: string; // YYYY-MM-DD
  workoutType: WorkoutType;
  score: string;
  notes: string;
  description?: string; // WOD Livre: texto do treino
}

export interface Alert {
  id: string;
  message: string;
  sendTime: string; // HH:MM
  enabled: boolean;
}

export interface DayCompletion {
  id: string;
  date: string; // YYYY-MM-DD
  completed: boolean; // true = ✅ cumpriu, false = ❌ falhou
  alertId?: string;
  reminderName?: string;
}

// ── Records ────────────────────────────────────────────────────────────────

export interface LiftEntry {
  id: string;
  lift: string; // key from LIFTS
  weight: number; // kg
  date: string;
  notes: string;
}

export interface BenchmarkEntry {
  id: string;
  wod: string; // key from BENCHMARK_WODS
  score: string; // time or reps
  date: string;
  notes: string;
}

export interface LiftDef {
  key: string;
  name: string;
  nameEn: string;
  category: "olimpico" | "forca";
}

export interface BenchmarkDef {
  key: string;
  name: string;
  description: string;
  scoreType: "time" | "reps";
}

export const LIFTS: LiftDef[] = [
  { key: "snatch", name: "Arranque", nameEn: "Snatch", category: "olimpico" },
  {
    key: "clean_jerk",
    name: "Arranco & Arremesso",
    nameEn: "Clean & Jerk",
    category: "olimpico",
  },
  { key: "clean", name: "Arranco", nameEn: "Clean", category: "olimpico" },
  { key: "jerk", name: "Arremesso", nameEn: "Jerk", category: "olimpico" },
  {
    key: "back_squat",
    name: "Agachamento",
    nameEn: "Back Squat",
    category: "forca",
  },
  {
    key: "front_squat",
    name: "Front Squat",
    nameEn: "Front Squat",
    category: "forca",
  },
  {
    key: "overhead_squat",
    name: "Overhead Squat",
    nameEn: "OHS",
    category: "forca",
  },
  { key: "deadlift", name: "Terra", nameEn: "Deadlift", category: "forca" },
  {
    key: "press",
    name: "Desenvolvimento",
    nameEn: "Strict Press",
    category: "forca",
  },
  {
    key: "push_press",
    name: "Push Press",
    nameEn: "Push Press",
    category: "forca",
  },
  { key: "thruster", name: "Thruster", nameEn: "Thruster", category: "forca" },
];

export const BENCHMARK_WODS: BenchmarkDef[] = [
  {
    key: "cindy",
    name: "Cindy",
    description: "20min AMRAP: 5 Pull-ups · 10 Push-ups · 15 Air Squats",
    scoreType: "reps",
  },
  {
    key: "murph",
    name: "Murph",
    description: "1mi run · 100 Pull-ups · 200 Push-ups · 300 Squats · 1mi run",
    scoreType: "time",
  },
  {
    key: "fran",
    name: "Fran",
    description: "21-15-9: Thrusters @43/29kg + Pull-ups",
    scoreType: "time",
  },
  {
    key: "grace",
    name: "Grace",
    description: "30 Clean & Jerks @60/42kg",
    scoreType: "time",
  },
  {
    key: "helen",
    name: "Helen",
    description: "3 rounds: 400m run · 21 KB Swings @24kg · 12 Pull-ups",
    scoreType: "time",
  },
  {
    key: "annie",
    name: "Annie",
    description: "50-40-30-20-10: Double-unders + Sit-ups",
    scoreType: "time",
  },
  {
    key: "karen",
    name: "Karen",
    description: "150 Wall Balls @9/6kg",
    scoreType: "time",
  },
  {
    key: "isabel",
    name: "Isabel",
    description: "30 Snatches @60/42kg",
    scoreType: "time",
  },
  {
    key: "dt",
    name: "DT",
    description:
      "5 rounds: 12 Deadlifts · 9 Hang Power Cleans · 6 Push Jerks @70/47kg",
    scoreType: "time",
  },
  {
    key: "barbara",
    name: "Barbara",
    description:
      "5 rounds: 20 Pull-ups · 30 Push-ups · 40 Sit-ups · 50 Squats (3min rest)",
    scoreType: "time",
  },
];

// ── Labels & Colors ────────────────────────────────────────────────────────

export const WORKOUT_LABELS: Record<WorkoutType, string> = {
  amrap: "AMRAP 10min",
  emom: "EMOM 10min",
  tabata: "Tabata",
  chipper: "Chipper",
  wod: "WOD Livre",
};

export const WORKOUT_COLORS: Record<WorkoutType, string> = {
  amrap: "blue",
  emom: "green",
  tabata: "red",
  chipper: "amber",
  wod: "violet",
};

export const COLOR_CLASSES: Record<
  WorkoutType,
  {
    bg: string;
    text: string;
    border: string;
    dot: string;
    pill: string;
    activePill: string;
  }
> = {
  amrap: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
    dot: "bg-blue-500",
    pill: "text-blue-600 bg-blue-50 border border-blue-200",
    activePill: "bg-blue-500 text-white",
  },
  emom: {
    bg: "bg-green-50",
    text: "text-green-600",
    border: "border-green-200",
    dot: "bg-green-500",
    pill: "text-green-600 bg-green-50 border border-green-200",
    activePill: "bg-green-500 text-white",
  },
  tabata: {
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
    dot: "bg-red-500",
    pill: "text-red-600 bg-red-50 border border-red-200",
    activePill: "bg-red-500 text-white",
  },
  chipper: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-200",
    dot: "bg-amber-500",
    pill: "text-amber-600 bg-amber-50 border border-amber-200",
    activePill: "bg-amber-500 text-white",
  },
  wod: {
    bg: "bg-violet-50",
    text: "text-violet-600",
    border: "border-violet-200",
    dot: "bg-violet-500",
    pill: "text-violet-600 bg-violet-50 border border-violet-200",
    activePill: "bg-violet-500 text-white",
  },
};
