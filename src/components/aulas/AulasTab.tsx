import { useState, useEffect } from "react";
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
import { ChevronLeft, ChevronRight, X, CheckCircle2, UserX } from "lucide-react";
import type { ClassBooking, ClassSession, Profile } from "../../types";
import { useAuth } from "../../context/AuthContext";
import * as db from "../../lib/db";

const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function AulasTab() {
  const { profile } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [classes, setClasses] = useState<Map<string, ClassSession[]>>(new Map());
  const [bookings, setBookings] = useState<ClassBooking[]>([]);
  const [members, setMembers] = useState<Profile[]>([]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  async function refreshData() {
    if (!profile) return;
    try {
      const membersData = await db.fetchMembersByBox(profile.boxId);
      setMembers(membersData);

      const classMap = new Map<string, ClassSession[]>();
      const allBookings: ClassBooking[] = [];

      for (const day of days) {
        const dateStr = format(day, "yyyy-MM-dd");
        const classesForDay = await db.fetchClassesByDate(profile.boxId, dateStr);
        if (classesForDay.length > 0) {
          classMap.set(dateStr, classesForDay);
          const bookingsForDay = await db.fetchBookingsForClasses(
            classesForDay.map((c) => c.id),
          );
          allBookings.push(...bookingsForDay);
        }
      }

      setClasses(classMap);
      setBookings(allBookings);
    } finally {
      // cleanup
    }
  }

  useEffect(() => {
    void refreshData();
  }, [profile?.boxId, currentMonth]);

  if (!profile) return null;

  const getClassesForDay = (day: Date): ClassSession[] => {
    const dayStr = format(day, "yyyy-MM-dd");
    return classes.get(dayStr) ?? [];
  };

  const getBookingsForClasses = (classIds: string[]): ClassBooking[] => {
    return bookings.filter((b) => classIds.includes(b.classId));
  };

  const memberById = new Map(members.map((m) => [m.id, m]));

  const selectedDayClasses = selectedDay ? getClassesForDay(selectedDay) : [];
  const selectedDayBookings = getBookingsForClasses(
    selectedDayClasses.map((c) => c.id),
  );

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
            const dayClasses = getClassesForDay(day);
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
                {dayClasses.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center items-center">
                    <span className="text-[9px] leading-none">
                      📚{dayClasses.length}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day detail view (bottom sheet style) */}
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

          {selectedDayClasses.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-400">
              Nenhuma aula neste dia.
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {selectedDayClasses.map((session) => {
                const classBookings = selectedDayBookings.filter(
                  (b) => b.classId === session.id,
                );
                const coachName = memberById.get(session.coachId)?.fullName ?? "Coach";
                const hasCapacity = classBookings.length < session.capacity;
                const myBooking = classBookings.find(
                  (b) => b.athleteId === profile.id,
                );

                return (
                  <div key={session.id} className="p-4 space-y-3">
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {session.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {format(new Date(session.startsAt), "HH:mm", {
                          locale: ptBR,
                        })}{" "}
                        · Coach {coachName} ·{" "}
                        <span className="font-semibold">
                          {classBookings.length}/{session.capacity}
                        </span>
                      </p>
                    </div>

                    {/* Athlete booking button */}
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
                          await refreshData();
                        }}
                        disabled={!myBooking && !hasCapacity}
                        className={`w-full rounded-xl py-2 text-sm font-semibold transition-all
                          ${myBooking
                            ? "bg-red-50 text-red-600"
                            : hasCapacity
                              ? "bg-gray-900 text-white"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                      >
                        {myBooking ? "Desmarcar aula" : "Marcar aula"}
                      </button>
                    )}

                    {/* Coach/Admin enrollment and attendance */}
                    {(profile.role === "coach" || profile.role === "admin") && (
                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                          Inscritos ({classBookings.length}/{session.capacity})
                        </div>
                        {classBookings.length === 0 ? (
                          <div className="text-sm text-gray-400">
                            Sem atletas inscritos.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {classBookings.map((booking) => {
                              const athlete = memberById.get(booking.athleteId);
                              return (
                                <div
                                  key={booking.id}
                                  className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 px-2 py-1.5"
                                >
                                  <span className="text-xs text-gray-700">
                                    {athlete?.fullName ?? "Atleta"}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={async () => {
                                        await db.setAttendance(
                                          booking.classId,
                                          booking.athleteId,
                                          !booking.attended,
                                        );
                                        await refreshData();
                                      }}
                                      className={`px-2 py-1 rounded-lg text-xs font-semibold
                                        ${booking.attended
                                          ? "bg-green-50 text-green-600"
                                          : "bg-amber-50 text-amber-600"}`}
                                    >
                                      <CheckCircle2 size={12} className="inline mr-0.5" />
                                      {booking.attended ? "Presente" : "Confirmar"}
                                    </button>
                                    <button
                                      onClick={async () => {
                                        await db.unbookClass(
                                          booking.classId,
                                          booking.athleteId,
                                        );
                                        await refreshData();
                                      }}
                                      className="p-1 text-gray-300 hover:text-red-500"
                                    >
                                      <UserX size={12} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
