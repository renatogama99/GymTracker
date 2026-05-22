import { useEffect, useMemo, useState } from "react";
import { Shield, Plus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import * as db from "../../lib/db";
import type { Role, Profile } from "../../types";

export function AdminTab() {
  const { profile, refreshProfile } = useAuth();

  const [members, setMembers] = useState<Profile[]>([]);
  const [title, setTitle] = useState("CrossFit WOD");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState("18:00");
  const [capacity, setCapacity] = useState(12);
  const [coachId, setCoachId] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadMembers() {
    if (!profile) return;
    const rows = await db.fetchMembersByBox(profile.boxId);
    setMembers(rows);
    if (!coachId) {
      const firstCoach = rows.find((r) => r.role === "coach");
      if (firstCoach) setCoachId(firstCoach.id);
    }
  }

  useEffect(() => {
    void loadMembers();
  }, [profile?.boxId]);

  const coaches = useMemo(
    () => members.filter((m) => m.role === "coach" || m.role === "admin"),
    [members],
  );

  if (!profile || profile.role !== "admin") {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-8 text-center text-sm text-gray-500">
        Apenas admins têm acesso a esta área.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-widest">
          Criar Aula
        </div>

        <div className="px-4 py-4 space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nome da aula"
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
          />

          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select
              value={coachId}
              onChange={(e) => setCoachId(e.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
            >
              <option value="">Selecionar coach...</option>
              {coaches.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName}
                </option>
              ))}
            </select>

            <input
              type="number"
              min={1}
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value || 1))}
              className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
            />
          </div>

          <button
            disabled={!title || !date || !time || !coachId || saving}
            onClick={async () => {
              if (!profile) return;
              setSaving(true);
              try {
                const startsAt = `${date}T${time}:00.000Z`;
                await db.createClassSession({
                  boxId: profile.boxId,
                  title,
                  startsAt,
                  coachId,
                  capacity,
                });
                setTitle("CrossFit WOD");
              } finally {
                setSaving(false);
              }
            }}
            className="w-full rounded-xl bg-gray-900 text-white py-2.5 text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            Criar aula
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-widest">
          Gestão de Roles
        </div>
        <div className="divide-y divide-gray-50">
          {members.map((member) => (
            <div key={member.id} className="px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800">
                  {member.fullName}
                </div>
                <div className="text-xs text-gray-400">{member.email}</div>
              </div>

              <div className="flex items-center gap-2">
                <Shield size={14} className="text-gray-300" />
                <select
                  value={member.role}
                  onChange={async (e) => {
                    await db.updateMemberRole(member.id, e.target.value as Role);
                    await loadMembers();
                    if (member.id === profile.id) {
                      await refreshProfile();
                    }
                  }}
                  className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs"
                >
                  <option value="admin">Admin</option>
                  <option value="coach">Coach</option>
                  <option value="athlete">Athlete</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
