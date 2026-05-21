import { useState } from "react";
import { Save, CheckCircle } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { generateId } from "../../utils/uuid";
import { todayISO } from "../../utils/dateHelpers";

export function WodLivrePanel() {
  const { dispatch } = useApp();
  const [date, setDate] = useState(todayISO());
  const [description, setDescription] = useState("");
  const [score, setScore] = useState("");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    if (!description.trim() && !score.trim()) return;
    dispatch({
      type: "ADD_LOG",
      payload: {
        id: generateId(),
        date,
        workoutType: "wod",
        description: description.trim(),
        score: score.trim() || "—",
        notes: notes.trim(),
      },
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setDescription("");
      setScore("");
      setNotes("");
      setDate(todayISO());
    }, 2000);
  }

  const canSave = description.trim().length > 0;

  return (
    <div className="space-y-3">
      {/* Explanation card */}
      <div className="bg-violet-50 rounded-2xl border border-violet-100 px-4 py-3">
        <div className="text-xs font-semibold text-violet-600 uppercase tracking-widest mb-0.5">
          WOD Livre
        </div>
        <div className="text-xs text-gray-500 leading-relaxed">
          Regista qualquer treino feito no CrossFit box ou em casa. Fica
          guardado no calendário.
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500">Data</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500">
            Descrição do WOD *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder={"Ex:\n21-15-9\nThrusters @43kg\nPull-ups\n\nFor time"}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500">
            Resultado / Score
          </label>
          <input
            type="text"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            placeholder="ex: 8:42 · 5 rondas + 12 reps · Rx"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500">
            Notas (opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Como correu? Alguma observação?"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none"
          />
        </div>

        {saved ? (
          <div className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-50 text-green-600 rounded-xl font-semibold text-sm">
            <CheckCircle size={16} />
            Guardado no calendário!
          </div>
        ) : (
          <button
            onClick={handleSave}
            disabled={!canSave}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all
              ${
                canSave
                  ? "bg-violet-500 text-white shadow-sm active:scale-95"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
          >
            <Save size={16} />
            Guardar treino
          </button>
        )}
      </div>
    </div>
  );
}
