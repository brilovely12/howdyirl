import { getServerClient } from "./supabase/server";
import type { User } from "@supabase/supabase-js";

export type Member = {
  id: string;
  handle: string;
  email: string | null;
  is_admin: boolean;
  banned: boolean;
};

export type SessionUser = { user: User; member: Member | null };

/** Current authenticated user + their Howdy member profile (or null if guest). */
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: member } = await supabase
    .from("members")
    .select("id,handle,email,is_admin,banned")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  return { user, member: (member as Member) ?? null };
}

/**
 * Ensure a howdy.members row exists for the logged-in user. Idempotent; safe to
 * call on every login path. Returns the member or null on failure.
 */
export async function provisionMember(handle?: string): Promise<Member | null> {
  const supabase = await getServerClient();
  const { data, error } = await supabase.rpc("ensure_member", {
    p_handle: handle ?? null,
  });
  if (error) {
    console.error("ensure_member failed:", error.message);
    return null;
  }
  // PostgREST serializes a NULL composite as an all-null object, so check id.
  const m = data as Member | null;
  return m?.id ? m : null;
}
