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

export async function resolveReportAndHide(reportId: string, targetType: string, targetId: string) {
  await requireAdmin();
  const supabase = await getServerClient();
  await supabase.from("reports").update({ status: "resolved" }).eq("id", reportId);
  const table = targetType === "group" ? "groups" : "events";
  await supabase.from(table).update({ status: "hidden" }).eq("id", targetId);
  revalidatePath("/admin");
  revalidatePath(`/${targetType}s/${targetId}`);
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

// --- Content moderation ---

export async function setContentStatus(type: "group" | "event", id: string, status: "live" | "hidden" | "removed") {
  await requireAdmin();
  const supabase = await getServerClient();
  const table = type === "group" ? "groups" : "events";
  await supabase.from(table).update({ status }).eq("id", id);
  revalidatePath("/admin");
  revalidatePath(`/${type}s/${id}`);
  revalidatePath(`/${type}s`);
}

export async function deleteComment(commentId: string) {
  await requireAdmin();
  const supabase = await getServerClient();
  await supabase.from("comments").delete().eq("id", commentId);
  revalidatePath("/admin");
}

// --- Member management ---

export async function toggleBan(memberId: string, banned: boolean) {
  await requireAdmin();
  const supabase = await getServerClient();
  await supabase.from("members").update({ banned }).eq("id", memberId);
  revalidatePath("/admin");
}

export async function toggleAdmin(memberId: string, isAdmin: boolean) {
  await requireAdmin();
  const supabase = await getServerClient();
  await supabase.from("members").update({ is_admin: isAdmin }).eq("id", memberId);
  revalidatePath("/admin");
}

// --- Pages CMS ---

export async function savePage(id: string | null, title: string, slug: string, body: string, inNav: boolean) {
  await requireAdmin();
  const supabase = await getServerClient();
  if (id) {
    await supabase.from("pages").update({ title, slug, body, in_nav: inNav, updated_at: new Date().toISOString() }).eq("id", id);
  } else {
    await supabase.from("pages").insert({ title, slug, body, in_nav: inNav });
  }
  revalidatePath("/admin");
  revalidatePath(`/p/${slug}`);
}

export async function deletePage(pageId: string) {
  await requireAdmin();
  const supabase = await getServerClient();
  await supabase.from("pages").delete().eq("id", pageId);
  revalidatePath("/admin");
}

// --- Tags ---

export async function saveTag(id: string | null, name: string, sort: number) {
  await requireAdmin();
  const supabase = await getServerClient();
  if (id) {
    await supabase.from("tags").update({ name, sort }).eq("id", id);
  } else {
    await supabase.from("tags").insert({ name, sort });
  }
  revalidatePath("/admin");
  revalidatePath("/groups");
  revalidatePath("/events");
}

export async function deleteTag(tagId: string) {
  await requireAdmin();
  const supabase = await getServerClient();
  await supabase.from("tags").delete().eq("id", tagId);
  revalidatePath("/admin");
  revalidatePath("/groups");
  revalidatePath("/events");
}

// --- Broadcast notification ---

export async function broadcastNotification(body: string) {
  await requireAdmin();
  const supabase = await getServerClient();
  const { data: members } = await supabase.from("members").select("id");
  if (!members?.length) return;
  const rows = members.map((m: any) => ({
    member_id: m.id,
    kind: "broadcast",
    body: body.trim(),
  }));
  await supabase.from("notifications").insert(rows);
  revalidatePath("/admin");
}
