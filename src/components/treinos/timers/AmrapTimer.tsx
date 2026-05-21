import { useState } from "react";
import { Play, Pause, RotateCcw, Flag } from "lucide-react";
import { useTimer } from "../../../hooks/useTimer";
import { formatTime } from "../../../utils/dateHelpers";
import { SaveForm } from "../SaveForm";

const AMRAP_SECONDS = 10 * 60;

export function AmrapTimer() {
  const [rounds, setRounds] = useState(0);
  const [showSave, setShowSave] = useState(false);

  const { seconds, running, finished, toggle, reset } = useTimer({
    initialSeconds: AMRAP_SECONDS,
    countDown: true,
    onFinish: () => setShowSave(true),
  });

  function handleReset() {
    reset();
    setRounds(0);
    setShowSave(false);
  }

  if (showSave) {
    return (
      <SaveForm
        workoutType="amrap"
        defaultScore={`${rounds} ronda${rounds !== 1 ? "s" : ""}`}
        onSaved={handleReset}
      />
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      <div className="text-center">
        <div className="text-xs font-medium text-blue-500 uppercase tracking-widest mb-1">
          AMRAP · 10 minutos
        </div>
        <div className="timer-font text-6xl font-bold text-gray-900 tabular-nums">
          {formatTime(seconds)}
        </div>
        <div className="text-sm text-gray-400 mt-1">
          Rondas completas:{" "}
          <span className="font-bold text-gray-700">{rounds}</span>
        </div>
      </div>

      <div className="flex gap-2 justify-center">
        <button
          onClick={toggle}
          disabled={finished}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-xl font-semibold text-sm active:scale-95 transition-all disabled:opacity-40"
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

      {(running || seconds < AMRAP_SECONDS) && !finished && (
        <button
          onClick={() => setRounds((r) => r + 1)}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-blue-200 text-blue-600 rounded-xl font-semibold text-sm active:scale-95 transition-all"
        >
          <Flag size={16} />
          Marcar Ronda
        </button>
      )}

      {finished && !showSave && (
        <button
          onClick={() => setShowSave(true)}
          className="w-full py-3 bg-blue-500 text-white rounded-xl font-semibold text-sm active:scale-95 transition-all"
        >
          Guardar resultado
        </button>
      )}
    </div>
  );
}
