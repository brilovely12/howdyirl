import { createBrowserClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Browser Supabase client for client components (login form, OAuth start). */
export function getBrowserClient() {
  return createBrowserClient(url, anon, { db: { schema: "howdy" } });
}
