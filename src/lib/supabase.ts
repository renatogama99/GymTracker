import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !key) {
  console.warn(
    "[GymTracker] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set. " +
      "Add them to .env.local for data to persist.",
  );
}

export const supabase = createClient(url ?? "", key ?? "");
