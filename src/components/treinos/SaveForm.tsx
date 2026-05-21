import { useState } from "react";
import type { WorkoutType } from "../../types";
import { WORKOUT_LABELS, COLOR_CLASSES } from "../../types";
import { useApp } from "../../context/AppContext";
import { generateId } from "../../utils/uuid";
import { todayISO, scorePlaceholder } from "../../utils/dateHelpers";
import { Save } from "lucide-react";

interface SaveFormProps {
  workoutType: WorkoutType;
  defaultScore?: string;
  onSaved: () => void;
}

export function SaveForm({
  workoutType,
  defaultScore = "",
  onSaved,
}: SaveFormProps) {
  const { dispatch } = useApp();
  const [date, setDate] = useState(todayISO());
  const [score, setScore] = useState(defaultScore);
  const [notes, setNotes] = useState("");
  const colors = COLOR_CLASSES[workoutType];

  function handleSave() {
    if (!score.trim()) return;
    dispatch({
      type: "ADD_LOG",
      payload: {
        id: generateId(),
        date,
        workoutType,
        score: score.trim(),
        notes: notes.trim(),
      },
    });
    onSaved();
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
      <h3 className="font-semibold text-gray-800 text-base">
        Guardar resultado
      </h3>

      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-500">Data</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-500">Treino</label>
        <div
          className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${colors.bg} ${colors.text}`}
        >
          {WORKOUT_LABELS[workoutType]}
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-500">
          Resultado / Score *
        </label>
        <input
          type="text"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          placeholder={scorePlaceholder(workoutType)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-500">
          Notas (opcional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Como foi o treino? Alguma observação?"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={!score.trim()}
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all
          ${
            score.trim()
              ? `${colors.activePill} shadow-sm active:scale-95`
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
      >
        <Save size={16} />
        Guardar
      </button>
    </div>
  );
}
