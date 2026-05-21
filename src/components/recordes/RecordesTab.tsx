import { useState } from "react";
import { Trophy, Plus, ChevronDown, ChevronUp, Trash2, X } from "lucide-react";
import { useApp } from "../../context/AppContext";
import type { LiftEntry, BenchmarkEntry } from "../../types";
import { LIFTS, BENCHMARK_WODS } from "../../types";
import { generateId } from "../../utils/uuid";
import { todayISO } from "../../utils/dateHelpers";

// ── Lifts section ──────────────────────────────────────────────────────────

function bestLift(entries: LiftEntry[], liftKey: string): LiftEntry | null {
  const filtered = entries.filter((e) => e.lift === liftKey);
  if (!filtered.length) return null;
  return filtered.reduce((best, e) => (e.weight > best.weight ? e : best));
}

function AddLiftForm({
  liftKey,
  onClose,
}: {
  liftKey: string;
  onClose: () => void;
}) {
  const { dispatch } = useApp();
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState(todayISO());
  const [notes, setNotes] = useState("");

  function save() {
    const w = parseFloat(weight);
    if (!w || w <= 0) return;
    dispatch({
      type: "ADD_LIFT",
      payload: {
        id: generateId(),
        lift: liftKey,
        weight: w,
        date,
        notes: notes.trim(),
      },
    });
    onClose();
  }

  return (
    <div className="mt-2 p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
      <div className="flex gap-2">
        <div className="flex-1 space-y-1">
          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
            Peso (kg)
          </label>
          <input
            type="number"
            min="1"
            step="0.5"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="ex: 80"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
          />
        </div>
        <div className="flex-1 space-y-1">
          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
            Data
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
          />
        </div>
      </div>
      <input
        type="text"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notas (opcional)"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
      />
      <div className="flex gap-2">
        <button
          onClick={save}
          disabled={!weight || parseFloat(weight) <= 0}
          className="flex-1 py-2 bg-violet-500 text-white rounded-lg text-sm font-semibold disabled:opacity-40 active:scale-95 transition-all"
        >
          Guardar PR
        </button>
        <button
          onClick={onClose}
          className="px-3 py-2 border border-gray-200 rounded-lg text-gray-500 active:scale-95"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

function LiftCard({ liftKey }: { liftKey: string }) {
  const { state, dispatch } = useApp();
  const [expanded, setExpanded] = useState(false);
  const [addingNew, setAddingNew] = useState(false);

  const def = LIFTS.find((l) => l.key === liftKey)!;
  const entries = state.lifts
    .filter((e) => e.lift === liftKey)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const best = bestLift(state.lifts, liftKey);

  return (
    <div className="border-b border-gray-50 last:border-0">
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-800">
              {def.name}
            </span>
            <span className="text-[10px] text-gray-400 font-medium">
              {def.nameEn}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          {best ? (
            <>
              <div className="text-base font-bold text-violet-600">
                {best.weight} kg
              </div>
              <div className="text-[10px] text-gray-400">{best.date}</div>
            </>
          ) : (
            <span className="text-sm text-gray-300 font-medium">—</span>
          )}
        </div>
        {expanded ? (
          <ChevronUp size={16} className="text-gray-300 shrink-0" />
        ) : (
          <ChevronDown size={16} className="text-gray-300 shrink-0" />
        )}
      </div>

      {expanded && (
        <div className="px-4 pb-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setAddingNew(true);
            }}
            className="flex items-center gap-1.5 text-xs text-violet-600 font-semibold mb-2"
          >
            <Plus size={13} /> Registar novo peso
          </button>

          {addingNew && (
            <AddLiftForm
              liftKey={liftKey}
              onClose={() => setAddingNew(false)}
            />
          )}

          {entries.length > 0 && (
            <div className="space-y-1 mt-2">
              {entries.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2"
                >
                  <span className="font-bold text-violet-600 w-14">
                    {e.weight} kg
                  </span>
                  <span className="text-gray-400 w-20">{e.date}</span>
                  <span className="flex-1 text-gray-400 truncate">
                    {e.notes}
                  </span>
                  <button
                    onClick={() =>
                      dispatch({ type: "DELETE_LIFT", payload: e.id })
                    }
                    className="text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {!entries.length && !addingNew && (
            <p className="text-xs text-gray-400 italic">Sem registos ainda.</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Benchmarks section ─────────────────────────────────────────────────────

function AddBenchmarkForm({
  wodKey,
  scoreType,
  onClose,
}: {
  wodKey: string;
  scoreType: "time" | "reps";
  onClose: () => void;
}) {
  const { dispatch } = useApp();
  const [score, setScore] = useState("");
  const [date, setDate] = useState(todayISO());
  const [notes, setNotes] = useState("");

  function save() {
    if (!score.trim()) return;
    dispatch({
      type: "ADD_BENCHMARK",
      payload: {
        id: generateId(),
        wod: wodKey,
        score: score.trim(),
        date,
        notes: notes.trim(),
      },
    });
    onClose();
  }

  return (
    <div className="mt-2 p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
      <div className="flex gap-2">
        <div className="flex-1 space-y-1">
          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
            {scoreType === "time" ? "Tempo" : "Rondas / Reps"}
          </label>
          <input
            type="text"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            placeholder={scoreType === "time" ? "ex: 3:42" : "ex: 18 rondas"}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>
        <div className="flex-1 space-y-1">
          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
            Data
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>
      </div>
      <input
        type="text"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notas (opcional)"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
      />
      <div className="flex gap-2">
        <button
          onClick={save}
          disabled={!score.trim()}
          className="flex-1 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold disabled:opacity-40 active:scale-95 transition-all"
        >
          Guardar resultado
        </button>
        <button
          onClick={onClose}
          className="px-3 py-2 border border-gray-200 rounded-lg text-gray-500 active:scale-95"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

function BenchmarkCard({ wodKey }: { wodKey: string }) {
  const { state, dispatch } = useApp();
  const [expanded, setExpanded] = useState(false);
  const [addingNew, setAddingNew] = useState(false);

  const def = BENCHMARK_WODS.find((w) => w.key === wodKey)!;
  const entries = (state.benchmarks as BenchmarkEntry[])
    .filter((e) => e.wod === wodKey)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const best = entries[0] ?? null;

  return (
    <div className="border-b border-gray-50 last:border-0">
      <div
        className="flex items-start gap-3 px-4 py-3 cursor-pointer select-none"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-gray-800">{def.name}</div>
          <div className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
            {def.description}
          </div>
        </div>
        <div className="text-right shrink-0">
          {best ? (
            <>
              <div className="text-sm font-bold text-orange-500">
                {best.score}
              </div>
              <div className="text-[10px] text-gray-400">{best.date}</div>
            </>
          ) : (
            <span className="text-sm text-gray-300">—</span>
          )}
        </div>
        {expanded ? (
          <ChevronUp size={16} className="text-gray-300 shrink-0 mt-0.5" />
        ) : (
          <ChevronDown size={16} className="text-gray-300 shrink-0 mt-0.5" />
        )}
      </div>

      {expanded && (
        <div className="px-4 pb-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setAddingNew(true);
            }}
            className="flex items-center gap-1.5 text-xs text-orange-500 font-semibold mb-2"
          >
            <Plus size={13} /> Registar resultado
          </button>

          {addingNew && (
            <AddBenchmarkForm
              wodKey={wodKey}
              scoreType={def.scoreType}
              onClose={() => setAddingNew(false)}
            />
          )}

          {entries.length > 0 && (
            <div className="space-y-1 mt-2">
              {entries.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2"
                >
                  <span className="font-bold text-orange-500 w-20">
                    {e.score}
                  </span>
                  <span className="text-gray-400 w-20">{e.date}</span>
                  <span className="flex-1 text-gray-400 truncate">
                    {e.notes}
                  </span>
                  <button
                    onClick={() =>
                      dispatch({ type: "DELETE_BENCHMARK", payload: e.id })
                    }
                    className="text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {!entries.length && !addingNew && (
            <p className="text-xs text-gray-400 italic">Sem registos ainda.</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main tab ───────────────────────────────────────────────────────────────

export function RecordesTab() {
  const { state } = useApp();
  const totalPRs = state.lifts.length;
  const totalBenchmarks = state.benchmarks.length;

  const olimpicos = LIFTS.filter((l) => l.category === "olimpico");
  const forca = LIFTS.filter((l) => l.category === "forca");

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-violet-50 rounded-2xl border border-violet-100 px-4 py-3">
          <div className="text-2xl font-bold text-violet-600">{totalPRs}</div>
          <div className="text-xs text-gray-500 font-medium">
            registos de levantamento
          </div>
        </div>
        <div className="bg-orange-50 rounded-2xl border border-orange-100 px-4 py-3">
          <div className="text-2xl font-bold text-orange-500">
            {totalBenchmarks}
          </div>
          <div className="text-xs text-gray-500 font-medium">
            resultados de benchmark
          </div>
        </div>
      </div>

      {/* Lifts — Olympic */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
          <Trophy size={15} className="text-violet-500" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
            Levantamentos Olímpicos
          </span>
        </div>
        {olimpicos.map((l) => (
          <LiftCard key={l.key} liftKey={l.key} />
        ))}
      </div>

      {/* Lifts — Strength */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
          <Trophy size={15} className="text-violet-400" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
            Levantamentos de Força
          </span>
        </div>
        {forca.map((l) => (
          <LiftCard key={l.key} liftKey={l.key} />
        ))}
      </div>

      {/* Benchmarks */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
          <Trophy size={15} className="text-orange-400" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
            WODs de Referência
          </span>
        </div>
        {BENCHMARK_WODS.map((w) => (
          <BenchmarkCard key={w.key} wodKey={w.key} />
        ))}
      </div>

      <div className="h-2" />
    </div>
  );
}
