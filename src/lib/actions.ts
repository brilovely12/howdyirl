"use server";

import { revalidatePath } from "next/cache";
import { getServerClient } from "./supabase/server";
import { getSessionUser } from "./auth";

async function requireMember() {
  const session = await getSessionUser();
  if (!session?.member) throw new Error("Not logged in");
  return session.member;
}

async function requireAdmin() {
  const member = await requireMember();
  if (!member.is_admin) throw new Error("Not authorized");
  return member;
}

export async function joinGroup(groupId: string) {
  const member = await requireMember();
  const supabase = await getServerClient();
  await supabase.from("memberships").upsert(
    { member_id: member.id, group_id: groupId },
    { onConflict: "member_id,group_id" },
  );
  revalidatePath(`/groups/${groupId}`);
  revalidatePath("/me");
}

export async function leaveGroup(groupId: string) {
  const member = await requireMember();
  const supabase = await getServerClient();
  await supabase
    .from("memberships")
    .delete()
    .eq("member_id", member.id)
    .eq("group_id", groupId);
  revalidatePath(`/groups/${groupId}`);
  revalidatePath("/me");
}

export async function rsvpEvent(eventId: string) {
  const member = await requireMember();
  const supabase = await getServerClient();
  await supabase.from("rsvps").upsert(
    { member_id: member.id, event_id: eventId, status: "going" },
    { onConflict: "member_id,event_id" },
  );
  revalidatePath(`/events/${eventId}`);
  revalidatePath("/me");
}

export async function cancelRsvp(eventId: string) {
  const member = await requireMember();
  const supabase = await getServerClient();
  await supabase
    .from("rsvps")
    .delete()
    .eq("member_id", member.id)
    .eq("event_id", eventId);
  revalidatePath(`/events/${eventId}`);
  revalidatePath("/me");
}

export async function postComment(targetType: "group" | "event", targetId: string, body: string) {
  const member = await requireMember();
  const trimmed = body.trim();
  if (!trimmed || trimmed.length > 2000) throw new Error("Invalid comment");
  const supabase = await getServerClient();
  await supabase.from("comments").insert({
    target_type: targetType,
    target_id: targetId,
    author_id: member.id,
    author_handle: member.handle,
    body: trimmed,
  });
  revalidatePath(`/${targetType}s/${targetId}`);
}

export async function submitReport(targetType: "group" | "event", targetId: string, reason: string) {
  const member = await requireMember();
  const supabase = await getServerClient();
  await supabase.from("reports").insert({
    target_type: targetType,
    target_id: targetId,
    reason: reason.trim() || null,
    reported_by: member.handle,
  });
}

export async function submitClaim(groupId: string, contactEmail: string, note: string) {
  const member = await requireMember();
  const supabase = await getServerClient();
  await supabase.from("claim_requests").insert({
    group_id: groupId,
    requested_by: member.handle,
    contact_email: contactEmail.trim(),
    note: note.trim() || null,
  });
}

export async function resolveReport(reportId: string, status: "resolved" | "dismissed") {
  await requireAdmin();
  const supabase = await getServerClient();
  await supabase.from("reports").update({ status }).eq("id", reportId);
  revalidatePath("/admin");
}

export async function decideClaim(claimId: string, groupId: string, approve: boolean) {
  await requireAdmin();
  const supabase = await getServerClient();
  await supabase
    .from("claim_requests")
    .update({ status: approve ? "approved" : "rejected" })
    .eq("id", claimId);
  if (approve) {
    await supabase.from("groups").update({ claimed: true }).eq("id", groupId);
  }
  revalidatePath("/admin");
  revalidatePath(`/groups/${groupId}`);
}
