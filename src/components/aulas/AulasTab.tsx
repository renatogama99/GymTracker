import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarClock, CheckCircle2, UserX } from "lucide-react";
import type { ClassBooking, ClassSession, Profile } from "../../types";
import { useAuth } from "../../context/AuthContext";
import * as db from "../../lib/db";

export function AulasTab() {
  const { profile } = useAuth();
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [members, setMembers] = useState<Profile[]>([]);
  const [bookings, setBookings] = useState<ClassBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAthleteByClass, setSelectedAthleteByClass] = useState<
    Record<string, string>
  >({});

  async function refresh() {
    if (!profile) return;
    setLoading(true);
    try {
      const [membersData, classesData] = await Promise.all([
        db.fetchMembersByBox(profile.boxId),
        db.fetchClassesByDate(profile.boxId, date),
      ]);
      const bookingsData = await db.fetchBookingsForClasses(
        classesData.map((c) => c.id),
      );
      setMembers(membersData);
      setClasses(classesData);
      setBookings(bookingsData);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, [profile?.boxId, date]);

  const athletes = useMemo(
    () => members.filter((m) => m.role === "athlete"),
    [members],
  );
  const memberById = useMemo(
    () => Object.fromEntries(members.map((m) => [m.id, m])),
    [members],
  );

  if (!profile) return null;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-1.5">
          Dia
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
        />
      </div>

      {loading ? (
        <div className="text-sm text-gray-400">A carregar aulas...</div>
      ) : classes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-10 text-center text-sm text-gray-400">
          Não há aulas para este dia.
        </div>
      ) : (
        classes.map((session) => {
          const classBookings = bookings.filter((b) => b.classId === session.id);
          const coachName = memberById[session.coachId]?.fullName ?? "Coach";
          const hasCapacity = classBookings.length < session.capacity;
          const myBooking = classBookings.find((b) => b.athleteId === profile.id);

          return (
            <div
              key={session.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-gray-50 bg-gray-50">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-gray-800">{session.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {format(new Date(session.startsAt), "HH:mm", {
                        locale: ptBR,
                      })} · Coach {coachName}
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-900 text-white">
                    {classBookings.length}/{session.capacity}
                  </span>
                </div>
              </div>

              <div className="px-4 py-3 space-y-3">
                {profile.role === "athlete" && (
                  <button
                    onClick={async () => {
                      if (myBooking) {
                        await db.unbookClass(session.id, profile.id);
                      } else if (hasCapacity) {
                        await db.bookClass({
                          classId: session.id,
                          athleteId: profile.id,
                          bookedBy: profile.id,
                        });
                      }
                      await refresh();
                    }}
                    disabled={!myBooking && !hasCapacity}
                    className={`w-full rounded-xl py-2.5 text-sm font-semibold transition-all
                      ${myBooking
                        ? "bg-red-50 text-red-600"
                        : hasCapacity
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                  >
                    {myBooking ? "Desmarcar aula" : "Marcar aula"}
                  </button>
                )}

                {(profile.role === "coach" || profile.role === "admin") && (
                  <div className="flex gap-2">
                    <select
                      value={selectedAthleteByClass[session.id] ?? ""}
                      onChange={(e) =>
                        setSelectedAthleteByClass((prev) => ({
                          ...prev,
                          [session.id]: e.target.value,
                        }))
                      }
                      className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm"
                    >
                      <option value="">Escolher atleta...</option>
                      {athletes.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.fullName}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={async () => {
                        const athleteId = selectedAthleteByClass[session.id];
                        if (!athleteId) return;
                        const exists = classBookings.some(
                          (b) => b.athleteId === athleteId,
                        );
                        if (exists) {
                          await db.unbookClass(session.id, athleteId);
                        } else {
                          await db.bookClass({
                            classId: session.id,
                            athleteId,
                            bookedBy: profile.id,
                          });
                        }
                        await refresh();
                      }}
                      className="rounded-xl bg-gray-900 text-white px-3 py-2 text-sm font-semibold"
                    >
                      Alternar
                    </button>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                    Inscritos
                  </div>
                  {classBookings.length === 0 ? (
                    <div className="text-sm text-gray-400">Sem atletas inscritos.</div>
                  ) : (
                    classBookings.map((booking) => {
                      const athlete = memberById[booking.athleteId];
                      return (
                        <div
                          key={booking.id}
                          className="flex items-center justify-between gap-2 rounded-xl border border-gray-100 px-3 py-2"
                        >
                          <span className="text-sm text-gray-700">
                            {athlete?.fullName ?? "Atleta"}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {(profile.role === "coach" || profile.role === "admin") && (
                              <button
                                onClick={async () => {
                                  await db.setAttendance(
                                    booking.classId,
                                    booking.athleteId,
                                    !booking.attended,
                                  );
                                  await refresh();
                                }}
                                className={`px-2 py-1 rounded-lg text-xs font-semibold
                                  ${booking.attended
                                    ? "bg-green-50 text-green-600"
                                    : "bg-amber-50 text-amber-600"}`}
                              >
                                <CheckCircle2 size={14} className="inline mr-1" />
                                {booking.attended ? "Presente" : "Confirmar"}
                              </button>
                            )}
                            {(profile.role === "coach" || profile.role === "admin") && (
                              <button
                                onClick={async () => {
                                  await db.unbookClass(booking.classId, booking.athleteId);
                                  await refresh();
                                }}
                                className="p-1.5 text-gray-300 hover:text-red-500"
                              >
                                <UserX size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
                  <CalendarClock size={13} />
                  {format(new Date(session.startsAt), "d 'de' MMMM 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
