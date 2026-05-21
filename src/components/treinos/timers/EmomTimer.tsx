import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { formatTime } from "../../../utils/dateHelpers";
import { SaveForm } from "../SaveForm";

const TOTAL_MINUTES = 10;
const MINUTE_SECONDS = 60;

export function EmomTimer() {
  const [seconds, setSeconds] = useState(MINUTE_SECONDS);
  const [currentMinute, setCurrentMinute] = useState(1); // 1-based
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
          // Move to next minute
          setCurrentMinute((m) => {
            const next = m + 1;
            if (next > TOTAL_MINUTES) {
              setRunning(false);
              setFinished(true);
              setShowSave(true);
              return m;
            }
            return next;
          });
          return MINUTE_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  function handleReset() {
    setRunning(false);
    setFinished(false);
    setShowSave(false);
    setSeconds(MINUTE_SECONDS);
    setCurrentMinute(1);
  }

  const isOdd = currentMinute % 2 !== 0;
  const minuteType = isOdd ? "Ímpar" : "Par";
  const minuteLabel = isOdd
    ? "Pike Push-ups + Archer Push-ups"
    : "Jump Squats + Reverse Lunges";

  if (showSave) {
    return (
      <SaveForm
        workoutType="emom"
        defaultScore={`Completou ${TOTAL_MINUTES} minutos`}
        onSaved={handleReset}
      />
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      <div className="text-center">
        <div className="text-xs font-medium text-green-500 uppercase tracking-widest mb-1">
          EMOM · Minuto {currentMinute}/{TOTAL_MINUTES}
        </div>
        <div className="timer-font text-6xl font-bold text-gray-900 tabular-nums">
          {formatTime(seconds)}
        </div>
      </div>

      <div
        className={`rounded-xl p-3 text-center ${isOdd ? "bg-green-50" : "bg-emerald-50"}`}
      >
        <div className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-0.5">
          Minuto {minuteType}
        </div>
        <div className="text-sm font-medium text-gray-700">{minuteLabel}</div>
      </div>

      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setRunning((r) => !r)}
          disabled={finished}
          className="flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white rounded-xl font-semibold text-sm active:scale-95 transition-all disabled:opacity-40"
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

      {finished && !showSave && (
        <button
          onClick={() => setShowSave(true)}
          className="w-full py-3 bg-green-500 text-white rounded-xl font-semibold text-sm active:scale-95 transition-all"
        >
          Guardar resultado
        </button>
      )}
    </div>
  );
}
