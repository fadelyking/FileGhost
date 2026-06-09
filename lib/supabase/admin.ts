import { createClient } from "@supabase/supabase-js";
import { hasSupabaseAdminEnv } from "@/lib/env";

export function createAdminClient() {
  if (!hasSupabaseAdminEnv()) {
    throw new Error("Supabase admin is not configured. Add SUPABASE_SERVICE_ROLE_KEY.");
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}
