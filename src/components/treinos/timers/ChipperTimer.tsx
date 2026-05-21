import { useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { useTimer } from "../../../hooks/useTimer";
import { formatTime } from "../../../utils/dateHelpers";
import { SaveForm } from "../SaveForm";

export function ChipperTimer() {
  const [showSave, setShowSave] = useState(false);
  const { seconds, running, toggle, reset } = useTimer({
    initialSeconds: 0,
    countDown: false,
  });

  function handleReset() {
    reset();
    setShowSave(false);
  }

  if (showSave) {
    return (
      <SaveForm
        workoutType="chipper"
        defaultScore={formatTime(seconds)}
        onSaved={handleReset}
      />
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      <div className="text-center">
        <div className="text-xs font-medium text-amber-500 uppercase tracking-widest mb-1">
          Chipper · Cronómetro
        </div>
        <div className="timer-font text-6xl font-bold text-gray-900 tabular-nums">
          {formatTime(seconds)}
        </div>
      </div>

      <div className="flex gap-2 justify-center">
        <button
          onClick={toggle}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-xl font-semibold text-sm active:scale-95 transition-all"
        >
          {running ? <Pause size={16} /> : <Play size={16} />}
          {running ? "Pausar" : seconds === 0 ? "Iniciar" : "Continuar"}
        </button>
        <button
          onClick={handleReset}
          className="p-2.5 border border-gray-200 rounded-xl text-gray-500 active:scale-95 transition-all"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {seconds > 0 && !running && (
        <button
          onClick={() => setShowSave(true)}
          className="w-full py-3 bg-amber-500 text-white rounded-xl font-semibold text-sm active:scale-95 transition-all"
        >
          Guardar resultado
        </button>
      )}
    </div>
  );
}
