import { createClient } from "@supabase/supabase-js";

// Server-seitiger Client (service role — nur in Server Components / API Routes)
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
