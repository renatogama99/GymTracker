import { useState } from "react";
import type React from "react";
import type { WorkoutType } from "../../types";
import { WORKOUT_LABELS, COLOR_CLASSES } from "../../types";
import { AmrapTimer } from "./timers/AmrapTimer";
import { EmomTimer } from "./timers/EmomTimer";
import { TabataTimer } from "./timers/TabataTimer";
import { ChipperTimer } from "./timers/ChipperTimer";
import { WodLivrePanel } from "./WodLivrePanel";

interface Exercise {
  name: string;
  detail: string;
}

interface WorkoutInfo {
  type: WorkoutType;
  subtitle: string;
  exercises: Exercise[];
}

const WORKOUTS: WorkoutInfo[] = [
  {
    type: "amrap",
    subtitle: "Full Body · 10 minutos",
    exercises: [
      { name: "Burpees", detail: "× 10 reps" },
      { name: "Air Squats", detail: "× 15 reps" },
      { name: "Push-ups", detail: "× 10 reps" },
      { name: "Mountain Climbers", detail: "× 20 reps" },
      { name: "V-ups", detail: "× 10 reps" },
    ],
  },
  {
    type: "emom",
    subtitle: "Força · 10 minutos",
    exercises: [
      { name: "Minutos Ímpares", detail: "Pike Push-ups + Archer Push-ups" },
      { name: "Minutos Pares", detail: "Jump Squats + Reverse Lunges" },
    ],
  },
  {
    type: "tabata",
    subtitle: "Cardio · 4 ex × 8 rondas (20s/10s)",
    exercises: [
      { name: "Squat Jumps", detail: "8 × 20s" },
      { name: "Explosive Push-ups", detail: "8 × 20s" },
      { name: "High Knees", detail: "8 × 20s" },
      { name: "Burpees sem salto", detail: "8 × 20s" },
    ],
  },
  {
    type: "chipper",
    subtitle: "Core · Sequência única",
    exercises: [
      { name: "Hollow Body Hold", detail: "3 × 20s" },
      { name: "Sit-ups", detail: "× 30 reps" },
      { name: "Superman Hold", detail: "3 × 15s" },
      { name: "Russian Twists", detail: "× 40 reps" },
      { name: "Plank", detail: "60s" },
      { name: "Glute Bridges", detail: "× 20 reps" },
    ],
  },
];

// Pill tabs: structured workouts + WOD Livre
type ActiveTab = WorkoutType | "wod";

const TIMER_COMPONENTS: Record<WorkoutType, React.ComponentType> = {
  amrap: AmrapTimer,
  emom: EmomTimer,
  tabata: TabataTimer,
  chipper: ChipperTimer,
  wod: () => null, // handled separately
};

const STRUCTURED_TABS: WorkoutType[] = ["amrap", "emom", "tabata", "chipper"];

export function TreinosTab() {
  const [selected, setSelected] = useState<ActiveTab>("amrap");

  const isWodLivre = selected === "wod";
  const workout = !isWodLivre
    ? WORKOUTS.find((w) => w.type === selected)!
    : null;
  const Timer = !isWodLivre ? TIMER_COMPONENTS[selected as WorkoutType] : null;

  const allTabs: ActiveTab[] = [...STRUCTURED_TABS, "wod"];

  return (
    <div className="space-y-4">
      {/* Pill tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {allTabs.map((tab) => {
          const active = tab === selected;
          const c = COLOR_CLASSES[tab as WorkoutType];
          return (
            <button
              key={tab}
              onClick={() => setSelected(tab)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap
                ${active ? c.activePill : "bg-white border border-gray-200 text-gray-500"}`}
            >
              {WORKOUT_LABELS[tab as WorkoutType]}
            </button>
          );
        })}
      </div>

      {isWodLivre ? (
        <WodLivrePanel />
      ) : (
        <>
          {/* Exercise list */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div
              className={`px-4 py-3 ${COLOR_CLASSES[selected as WorkoutType].bg}`}
            >
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                {workout!.subtitle}
              </div>
            </div>
            <div className="divide-y divide-gray-50">
              {workout!.exercises.map((ex, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <span className="text-sm font-medium text-gray-800">
                    {ex.name}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${COLOR_CLASSES[selected as WorkoutType].bg} ${COLOR_CLASSES[selected as WorkoutType].text}`}
                  >
                    {ex.detail}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Timer */}
          {Timer && <Timer />}
        </>
      )}
    </div>
  );
}
