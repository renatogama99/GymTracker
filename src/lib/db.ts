import { supabase } from "./supabase";
import type {
  WorkoutLog,
  LiftEntry,
  BenchmarkEntry,
  Alert,
  DayCompletion,
  Profile,
  Role,
  Box,
  ClassSession,
  ClassBooking,
} from "../types";

// ── Workout Logs ──────────────────────────────────────────────────────────

export async function fetchLogs(): Promise<WorkoutLog[]> {
  const { data, error } = await supabase
    .from("workout_logs")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id as string,
    date: r.date as string,
    workoutType: r.workout_type as WorkoutLog["workoutType"],
    score: r.score as string,
    notes: r.notes as string,
    description: (r.description as string | null) ?? undefined,
  }));
}

export async function insertLog(log: WorkoutLog): Promise<void> {
  const { error } = await supabase.from("workout_logs").insert({
    id: log.id,
    date: log.date,
    workout_type: log.workoutType,
    score: log.score,
    notes: log.notes,
    description: log.description ?? null,
  });
  if (error) throw error;
}

export async function removeLog(id: string): Promise<void> {
  const { error } = await supabase.from("workout_logs").delete().eq("id", id);
  if (error) throw error;
}

// ── Lift Entries ──────────────────────────────────────────────────────────

export async function fetchLifts(): Promise<LiftEntry[]> {
  const { data, error } = await supabase
    .from("lift_entries")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id as string,
    lift: r.lift as string,
    weight: Number(r.weight),
    date: r.date as string,
    notes: r.notes as string,
  }));
}

export async function insertLift(lift: LiftEntry): Promise<void> {
  const { error } = await supabase.from("lift_entries").insert({
    id: lift.id,
    lift: lift.lift,
    weight: lift.weight,
    date: lift.date,
    notes: lift.notes,
  });
  if (error) throw error;
}

export async function removeLift(id: string): Promise<void> {
  const { error } = await supabase.from("lift_entries").delete().eq("id", id);
  if (error) throw error;
}

// ── Benchmark Entries ─────────────────────────────────────────────────────

export async function fetchBenchmarks(): Promise<BenchmarkEntry[]> {
  const { data, error } = await supabase
    .from("benchmark_entries")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id as string,
    wod: r.wod as string,
    score: r.score as string,
    date: r.date as string,
    notes: r.notes as string,
  }));
}

export async function insertBenchmark(b: BenchmarkEntry): Promise<void> {
  const { error } = await supabase.from("benchmark_entries").insert({
    id: b.id,
    wod: b.wod,
    score: b.score,
    date: b.date,
    notes: b.notes,
  });
  if (error) throw error;
}

export async function removeBenchmark(id: string): Promise<void> {
  const { error } = await supabase
    .from("benchmark_entries")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ── Alerts ────────────────────────────────────────────────────────────────

export async function fetchAlerts(): Promise<Alert[]> {
  const { data, error } = await supabase
    .from("alerts")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id as string,
    message: r.message as string,
    sendTime: r.send_time as string,
    enabled: r.enabled as boolean,
  }));
}

export async function insertAlert(a: Alert): Promise<void> {
  const { error } = await supabase.from("alerts").insert({
    id: a.id,
    message: a.message,
    send_time: a.sendTime,
    enabled: a.enabled,
  });
  if (error) throw error;
}

export async function removeAlert(id: string): Promise<void> {
  const { error } = await supabase.from("alerts").delete().eq("id", id);
  if (error) throw error;
}

export async function updateAlertEnabled(
  id: string,
  enabled: boolean,
): Promise<void> {
  const { error } = await supabase
    .from("alerts")
    .update({ enabled })
    .eq("id", id);
  if (error) throw error;
}

// ── Day Completions ───────────────────────────────────────────────────────

export async function fetchCompletions(): Promise<DayCompletion[]> {
  const { data, error } = await supabase
    .from("day_completions")
    .select("*")
    .order("date", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id as string,
    date: r.date as string,
    completed: r.completed as boolean,
    alertId: (r.alert_id as string | null) ?? undefined,
    reminderName: (r.reminder_name as string | null) ?? undefined,
  }));
}

// ── Auth, Profiles & Boxes ───────────────────────────────────────────────

export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signUp(
  email: string,
  password: string,
  fullName: string,
): Promise<void> {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function fetchSessionUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

export async function fetchOrCreateDefaultBox(): Promise<Box> {
  const { data: existing, error: existingErr } = await supabase
    .from("boxes")
    .select("id, name")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (existingErr) throw existingErr;
  if (existing) {
    return {
      id: existing.id as string,
      name: existing.name as string,
    };
  }

  const { data: created, error } = await supabase
    .from("boxes")
    .insert({ name: "Meu Box" })
    .select("id, name")
    .single();
  if (error) throw error;
  return {
    id: created.id as string,
    name: created.name as string,
  };
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, box_id")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id as string,
    email: (data.email as string | null) ?? "",
    fullName: (data.full_name as string | null) ?? "",
    role: data.role as Role,
    boxId: data.box_id as string,
  };
}

export async function ensureProfileForUser(params: {
  userId: string;
  email: string;
  fullName: string;
}): Promise<Profile> {
  const existing = await fetchProfile(params.userId);
  if (existing) return existing;

  const box = await fetchOrCreateDefaultBox();

  const { error } = await supabase.from("profiles").insert({
    id: params.userId,
    email: params.email,
    full_name: params.fullName,
    role: "athlete",
    box_id: box.id,
  });
  if (error) throw error;

  const created = await fetchProfile(params.userId);
  if (!created) throw new Error("Failed to create profile");
  return created;
}

export async function fetchMembersByBox(boxId: string): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, box_id")
    .eq("box_id", boxId)
    .order("full_name", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id as string,
    email: (r.email as string | null) ?? "",
    fullName: (r.full_name as string | null) ?? "",
    role: r.role as Role,
    boxId: r.box_id as string,
  }));
}

export async function updateMemberRole(
  memberId: string,
  role: Role,
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", memberId);
  if (error) throw error;
}

// ── Classes & Bookings ───────────────────────────────────────────────────

function dayIsoRange(dateStr: string): { start: string; end: string } {
  return {
    start: `${dateStr}T00:00:00.000Z`,
    end: `${dateStr}T23:59:59.999Z`,
  };
}

export async function fetchClassesByDate(
  boxId: string,
  dateStr: string,
): Promise<ClassSession[]> {
  const { start, end } = dayIsoRange(dateStr);
  const { data, error } = await supabase
    .from("classes")
    .select("id, box_id, title, starts_at, coach_id, capacity")
    .eq("box_id", boxId)
    .gte("starts_at", start)
    .lte("starts_at", end)
    .order("starts_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id as string,
    boxId: r.box_id as string,
    title: r.title as string,
    startsAt: r.starts_at as string,
    coachId: r.coach_id as string,
    capacity: Number(r.capacity),
  }));
}

export async function createClassSession(input: {
  boxId: string;
  title: string;
  startsAt: string;
  coachId: string;
  capacity: number;
}): Promise<void> {
  const { error } = await supabase.from("classes").insert({
    box_id: input.boxId,
    title: input.title,
    starts_at: input.startsAt,
    coach_id: input.coachId,
    capacity: input.capacity,
  });
  if (error) throw error;
}

export async function fetchBookingsForClasses(
  classIds: string[],
): Promise<ClassBooking[]> {
  if (classIds.length === 0) return [];
  const { data, error } = await supabase
    .from("class_bookings")
    .select("id, class_id, athlete_id, booked_by, attended")
    .in("class_id", classIds);
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id as string,
    classId: r.class_id as string,
    athleteId: r.athlete_id as string,
    bookedBy: r.booked_by as string,
    attended: Boolean(r.attended),
  }));
}

export async function bookClass(input: {
  classId: string;
  athleteId: string;
  bookedBy: string;
}): Promise<void> {
  const { error } = await supabase.from("class_bookings").insert({
    class_id: input.classId,
    athlete_id: input.athleteId,
    booked_by: input.bookedBy,
    attended: false,
  });
  if (error) throw error;
}

export async function unbookClass(
  classId: string,
  athleteId: string,
): Promise<void> {
  const { error } = await supabase
    .from("class_bookings")
    .delete()
    .eq("class_id", classId)
    .eq("athlete_id", athleteId);
  if (error) throw error;
}

export async function setAttendance(
  classId: string,
  athleteId: string,
  attended: boolean,
): Promise<void> {
  const { error } = await supabase
    .from("class_bookings")
    .update({ attended })
    .eq("class_id", classId)
    .eq("athlete_id", athleteId);
  if (error) throw error;
}
