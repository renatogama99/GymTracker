import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { formatTime } from "../../../utils/dateHelpers";
import { SaveForm } from "../SaveForm";

const EXERCISES = [
  "Squat Jumps",
  "Explosive Push-ups",
  "High Knees",
  "Burpees sem salto",
];
const TOTAL_ROUNDS = 8;
const WORK_SECONDS = 20;
const REST_SECONDS = 10;

type Phase = "work" | "rest";

export function TabataTimer() {
  const [exerciseIdx, setExerciseIdx] = useState(0);
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState<Phase>("work");
  const [seconds, setSeconds] = useState(WORK_SECONDS);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          // Advance state
          if (phase === "work") {
            setPhase("rest");
            return REST_SECONDS;
          } else {
            // End of rest – next round or next exercise
            const nextRound = round + 1;
            if (nextRound > TOTAL_ROUNDS) {
              // Next exercise
              const nextEx = exerciseIdx + 1;
              if (nextEx >= EXERCISES.length) {
                // Done!
                setRunning(false);
                setFinished(true);
                setShowSave(true);
                return 0;
              }
              setExerciseIdx(nextEx);
              setRound(1);
            } else {
              setRound(nextRound);
            }
            setPhase("work");
            return WORK_SECONDS;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, phase, round, exerciseIdx]);

  function handleReset() {
    setRunning(false);
    setFinished(false);
    setShowSave(false);
    setExerciseIdx(0);
    setRound(1);
    setPhase("work");
    setSeconds(WORK_SECONDS);
  }

  if (showSave) {
    return (
      <SaveForm
        workoutType="tabata"
        defaultScore={`${EXERCISES.length} exercícios × ${TOTAL_ROUNDS} rondas`}
        onSaved={handleReset}
      />
    );
  }

  const isWork = phase === "work";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      <div className="text-center">
        <div className="text-xs font-medium text-red-500 uppercase tracking-widest mb-1">
          Tabata
        </div>
        <div
          className={`timer-font text-6xl font-bold tabular-nums ${isWork ? "text-red-600" : "text-gray-400"}`}
        >
          {formatTime(seconds)}
        </div>
        <div
          className={`text-sm font-bold mt-1 ${isWork ? "text-red-500" : "text-gray-400"}`}
        >
          {isWork ? "▶ TRABALHO" : "⏸ DESCANSO"}
        </div>
      </div>

      <div className="bg-red-50 rounded-xl p-3 text-center">
        <div className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-0.5">
          {EXERCISES[exerciseIdx]} · Ronda {round}/{TOTAL_ROUNDS}
        </div>
        <div className="text-xs text-gray-400">
          Exercício {exerciseIdx + 1}/{EXERCISES.length}
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-1.5">
        {EXERCISES.map((ex, i) => (
          <div
            key={ex}
            title={ex}
            className={`h-2 rounded-full transition-all ${i < exerciseIdx ? "w-6 bg-red-500" : i === exerciseIdx ? "w-6 bg-red-400" : "w-2 bg-gray-200"}`}
          />
        ))}
      </div>

      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setRunning((r) => !r)}
          disabled={finished}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-xl font-semibold text-sm active:scale-95 transition-all disabled:opacity-40"
        >
          {running ? <Pause size={16} /> : <Play size={16} />}
          {running ? "Pausar" : "Iniciar"}
        </button>
        <button
          onClick={handleReset}
          className="p-2.5 border border-gray-200 rounded-xl text-gray-500 active:scale-95 transition-all"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  );
}
