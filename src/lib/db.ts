import { supabase } from "./supabase";
import type {
  WorkoutLog,
  LiftEntry,
  BenchmarkEntry,
  Alert,
  DayCompletion,
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
