import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Read-only Supabase client scoped to the `howdy` schema.
 *
 * Howdy IRL shares a project with its sister site (boopem); all of Howdy's
 * tables live in the `howdy` Postgres schema, exposed to PostgREST. Used from
 * Server Components for the public, logged-out experience. Auth-aware clients
 * (cookies via @supabase/ssr) come with the auth build.
 */
export function howdyDb() {
  return createClient(url, anon, {
    db: { schema: "howdy" },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
