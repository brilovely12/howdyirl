import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Cookie-aware Supabase client for Server Components, Route Handlers, and
 * Server Actions. Carries the user's session (so RLS sees auth.uid()) and is
 * pinned to the `howdy` schema. Auth calls (supabase.auth.*) use the auth
 * schema regardless of this setting.
 */
export async function getServerClient() {
  const cookieStore = await cookies();
  return createServerClient(url, anon, {
    db: { schema: "howdy" },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component render — middleware refreshes the
          // session cookie, so this can be safely ignored.
        }
      },
    },
  });
}
