import { useState } from "react";
import { Bell, Trash2, Plus, Clock, ToggleLeft, ToggleRight } from "lucide-react";
import { useApp } from "../../context/AppContext";
import type { Alert } from "../../types";
import { generateId } from "../../utils/uuid";

export function AlertasTab() {
  const { state, dispatch } = useApp();

  const [message, setMessage] = useState("");
  const [sendTime, setSendTime] = useState("07:00");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleAdd() {
    if (!message.trim()) return;
    setSaving(true);

    const alert: Alert = {
      id: generateId(),
      message: message.trim(),
      sendTime,
      enabled: true,
    };

    dispatch({ type: "ADD_ALERT", payload: alert });
    setMessage("");
    setSendTime("07:00");
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-4">
      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 flex gap-3 items-start">
        <Bell size={16} className="text-blue-500 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-600 leading-relaxed">
          Os alertas são enviados pelo bot do Telegram à hora configurada.
          Podes responder com ✅ ou ❌ para registar o cumprimento no calendário.
        </p>
      </div>

      {/* New alert form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
            Novo Alerta
          </span>
        </div>

        <div className="px-4 py-4 space-y-3">
          {/* Message */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-1.5">
              Mensagem
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="ex: Hora de treinar! 🏋️ Não te esqueças do wod de hoje."
              rows={3}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
            />
          </div>

          {/* Time */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-1.5">
              Hora de envio
            </label>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-gray-400" />
              <input
                type="time"
                value={sendTime}
                onChange={(e) => setSendTime(e.target.value)}
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={handleAdd}
            disabled={!message.trim() || saving}
            className={`w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2
              ${saved
                ? "bg-green-500 text-white"
                : message.trim()
                  ? "bg-gray-900 text-white active:scale-[0.98]"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
          >
            {saved ? (
              "✓ Alerta guardado!"
            ) : (
              <>
                <Plus size={16} />
                Adicionar Alerta
              </>
            )}
          </button>
        </div>
      </div>

      {/* Alert list */}
      {state.alerts.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              Alertas Configurados ({state.alerts.length})
            </span>
          </div>

          <div className="divide-y divide-gray-50">
            {state.alerts.map((alert) => (
              <AlertRow
                key={alert.id}
                alert={alert}
                onToggle={(enabled) =>
                  dispatch({
                    type: "TOGGLE_ALERT",
                    payload: { id: alert.id, enabled },
                  })
                }
                onDelete={() =>
                  dispatch({ type: "DELETE_ALERT", payload: alert.id })
                }
              />
            ))}
          </div>
        </div>
      )}

      {state.alerts.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Bell size={32} className="mx-auto mb-3 text-gray-200" />
          <p className="text-sm">Nenhum alerta configurado ainda.</p>
          <p className="text-xs mt-1">Adiciona o teu primeiro lembrete acima.</p>
        </div>
      )}
    </div>
  );
}

function AlertRow({
  alert,
  onToggle,
  onDelete,
}: {
  alert: Alert;
  onToggle: (enabled: boolean) => void;
  onDelete: () => void;
}) {
  return (
    <div className={`px-4 py-3 flex items-start gap-3 ${!alert.enabled ? "opacity-50" : ""}`}>
      {/* Time badge */}
      <div className="shrink-0 flex flex-col items-center justify-center bg-gray-50 rounded-xl px-2.5 py-1.5 min-w-[52px]">
        <Clock size={11} className="text-gray-400 mb-0.5" />
        <span className="text-xs font-bold text-gray-700 tabular-nums">
          {alert.sendTime}
        </span>
      </div>

      {/* Message */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 leading-snug break-words">
          {alert.message}
        </p>
        <span
          className={`mt-1 inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full
            ${alert.enabled ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}
        >
          {alert.enabled ? "Ativo" : "Inativo"}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onToggle(!alert.enabled)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 transition-colors"
          title={alert.enabled ? "Desativar" : "Ativar"}
        >
          {alert.enabled ? (
            <ToggleRight size={20} className="text-green-500" />
          ) : (
            <ToggleLeft size={20} />
          )}
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 transition-colors"
          title="Eliminar"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
