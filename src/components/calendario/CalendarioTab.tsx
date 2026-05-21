import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, X, Trash2 } from "lucide-react";
import { useApp } from "../../context/AppContext";
import type { WorkoutLog, WorkoutType, DayCompletion } from "../../types";
import { WORKOUT_LABELS, COLOR_CLASSES } from "../../types";

const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function CalendarioTab() {
  const { state, dispatch } = useApp();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  function getLogsForDay(day: Date): WorkoutLog[] {
    const dayStr = format(day, "yyyy-MM-dd");
    return state.logs.filter((l) => l.date === dayStr);
  }

  function getTypesForDay(day: Date): WorkoutType[] {
    return [...new Set(getLogsForDay(day).map((l) => l.workoutType))];
  }

  function getCompletionForDay(day: Date): DayCompletion | undefined {
    const dayStr = format(day, "yyyy-MM-dd");
    return state.completions.find((c) => c.date === dayStr);
  }

  const selectedDayLogs = selectedDay ? getLogsForDay(selectedDay) : [];
  const selectedDayCompletion = selectedDay
    ? getCompletionForDay(selectedDay)
    : undefined;

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3">
        <button
          onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 active:scale-95 transition-all"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="font-semibold text-gray-800 capitalize">
          {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
        </span>
        <button
          onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 active:scale-95 transition-all"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-gray-50">
          {WEEK_DAYS.map((d) => (
            <div
              key={d}
              className="text-center text-xs font-semibold text-gray-400 py-2"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const types = getTypesForDay(day);
            const completion = getCompletionForDay(day);
            const inMonth = isSameMonth(day, currentMonth);
            const today = isToday(day);
            const selected = selectedDay && isSameDay(day, selectedDay);

            return (
              <button
                key={day.toISOString()}
                onClick={() =>
                  setSelectedDay((prev) =>
                    prev && isSameDay(prev, day) ? null : day,
                  )
                }
                className={`relative flex flex-col items-center pt-2 pb-1.5 border-b border-r border-gray-50 min-h-[52px] transition-all
                  ${!inMonth ? "opacity-30" : ""}
                  ${selected ? "bg-gray-50" : "hover:bg-gray-50"}
                `}
              >
                <span
                  className={`text-sm w-7 h-7 flex items-center justify-center rounded-full font-medium transition-all
                  ${today ? "bg-gray-900 text-white font-bold" : "text-gray-700"}`}
                >
                  {format(day, "d")}
                </span>
                <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center items-center">
                  {types.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className={`w-1.5 h-1.5 rounded-full ${COLOR_CLASSES[t].dot}`}
                    />
                  ))}
                  {completion !== undefined && (
                    <span className="text-[9px] leading-none">
                      {completion.completed ? "✅" : "❌"}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-3 flex-wrap">
        {(["amrap", "emom", "tabata", "chipper", "wod"] as WorkoutType[]).map(
          (t) => (
            <div key={t} className="flex items-center gap-1.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${COLOR_CLASSES[t].dot}`}
              />
              <span className="text-xs text-gray-500">{WORKOUT_LABELS[t]}</span>
            </div>
          ),
        )}
      </div>

      {/* Day detail modal (bottom sheet style) */}
      {selectedDay && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <h3 className="font-semibold text-gray-800 capitalize">
              {format(selectedDay, "d 'de' MMMM", { locale: ptBR })}
            </h3>
            <button
              onClick={() => setSelectedDay(null)}
              className="p-1.5 text-gray-400 rounded-lg hover:text-gray-700"
            >
              <X size={16} />
            </button>
          </div>

          {/* Telegram completion status */}
          {selectedDayCompletion !== undefined && (
            <div
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b border-gray-50
                ${selectedDayCompletion.completed ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}
            >
              <span>{selectedDayCompletion.completed ? "✅" : "❌"}</span>
              <span>
                {selectedDayCompletion.completed
                  ? "Treino cumprido via Telegram"
                  : "Treino falhado (assinalado via Telegram)"}
              </span>
            </div>
          )}

          {selectedDayLogs.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-400">
              Nenhum treino registado neste dia.
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {selectedDayLogs.map((log) => {
                const c = COLOR_CLASSES[log.workoutType];
                return (
                  <div
                    key={log.id}
                    className="px-4 py-3 flex items-start gap-3"
                  >
                    <span
                      className={`mt-0.5 w-2.5 h-2.5 rounded-full shrink-0 ${c.dot}`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}
                        >
                          {WORKOUT_LABELS[log.workoutType]}
                        </span>
                      </div>
                      {log.description && (
                        <div className="text-xs text-gray-500 mt-1 font-mono bg-gray-50 rounded-lg px-2 py-1.5 whitespace-pre-wrap">
                          {log.description}
                        </div>
                      )}
                      <div className="text-sm font-medium text-gray-800 mt-1">
                        {log.score !== "—" ? log.score : ""}
                      </div>
                      {log.notes && (
                        <div className="text-xs text-gray-400 mt-0.5">
                          {log.notes}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() =>
                        dispatch({ type: "DELETE_LOG", payload: log.id })
                      }
                      className="p-1.5 text-gray-300 hover:text-red-400 rounded-lg transition-colors shrink-0"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Monthly summary */}
      {state.logs.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
            Total registado
          </div>
          <div className="flex gap-3 flex-wrap">
            {(
              ["amrap", "emom", "tabata", "chipper", "wod"] as WorkoutType[]
            ).map((t) => {
              const count = state.logs.filter(
                (l) => l.workoutType === t,
              ).length;
              if (!count) return null;
              const c = COLOR_CLASSES[t];
              return (
                <div
                  key={t}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${c.bg}`}
                >
                  <span className={`text-xs font-semibold ${c.text}`}>
                    {count}×
                  </span>
                  <span className={`text-xs ${c.text}`}>
                    {WORKOUT_LABELS[t]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
