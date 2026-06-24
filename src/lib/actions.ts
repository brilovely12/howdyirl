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
  const { error } = await supabase.from("memberships").upsert(
    { member_id: member.id, group_id: groupId },
    { onConflict: "member_id,group_id" },
  );
  if (error) throw new Error(error.message);
  revalidatePath(`/groups/${groupId}`);
  revalidatePath("/me");
}

export async function leaveGroup(groupId: string) {
  const member = await requireMember();
  const supabase = await getServerClient();
  const { error } = await supabase
    .from("memberships")
    .delete()
    .eq("member_id", member.id)
    .eq("group_id", groupId);
  if (error) throw new Error(error.message);
  revalidatePath(`/groups/${groupId}`);
  revalidatePath("/me");
}

export async function rsvpEvent(eventId: string) {
  const member = await requireMember();
  const supabase = await getServerClient();
  const { error } = await supabase.from("rsvps").upsert(
    { member_id: member.id, event_id: eventId, status: "going" },
    { onConflict: "member_id,event_id" },
  );
  if (error) throw new Error(error.message);
  revalidatePath(`/events/${eventId}`);
  revalidatePath("/me");
}

export async function cancelRsvp(eventId: string) {
  const member = await requireMember();
  const supabase = await getServerClient();
  const { error } = await supabase
    .from("rsvps")
    .delete()
    .eq("member_id", member.id)
    .eq("event_id", eventId);
  if (error) throw new Error(error.message);
  revalidatePath(`/events/${eventId}`);
  revalidatePath("/me");
}

export async function updateGroup(
  groupId: string,
  fields: { name: string; description: string; tags: string[]; external_link: string; link_label: string; image_url?: string | null },
) {
  await requireMember();
  const supabase = await getServerClient();
  const row: Record<string, unknown> = {
    name: fields.name,
    description: fields.description,
    tags: fields.tags,
    external_link: fields.external_link || null,
    link_label: fields.link_label || null,
    updated_at: new Date().toISOString(),
  };
  if (fields.image_url !== undefined) row.image_url = fields.image_url;
  const { error } = await supabase.from("groups").update(row).eq("id", groupId);
  if (error) throw new Error(error.message);
  revalidatePath(`/groups/${groupId}`);
  revalidatePath("/groups");
}

export async function updateEvent(
  eventId: string,
  fields: { name: string; description: string; tags: string[]; starts_at: string; external_link: string },
) {
  await requireMember();
  const supabase = await getServerClient();
  const { error } = await supabase
    .from("events")
    .update({
      name: fields.name,
      description: fields.description,
      tags: fields.tags,
      starts_at: fields.starts_at,
      external_link: fields.external_link || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", eventId);
  if (error) throw new Error(error.message);
  revalidatePath(`/events/${eventId}`);
  revalidatePath("/events");
}

export async function postComment(targetType: "group" | "event", targetId: string, body: string) {
  const member = await requireMember();
  const trimmed = body.trim();
  if (!trimmed || trimmed.length > 2000) throw new Error("Invalid comment");
  const supabase = await getServerClient();
  const { error } = await supabase.from("comments").insert({
    target_type: targetType,
    target_id: targetId,
    author_id: member.id,
    author_handle: member.handle,
    body: trimmed,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/${targetType}s/${targetId}`);
}

export async function submitReport(targetType: "group" | "event", targetId: string, reason: string) {
  const member = await requireMember();
  const supabase = await getServerClient();
  const { error } = await supabase.from("reports").insert({
    target_type: targetType,
    target_id: targetId,
    reason: reason.trim() || null,
    reported_by: member.handle,
  });
  if (error) throw new Error(error.message);
}

export async function submitClaim(groupId: string, contactEmail: string, note: string) {
  const member = await requireMember();
  const supabase = await getServerClient();
  const { error } = await supabase.from("claim_requests").insert({
    group_id: groupId,
    requested_by: member.handle,
    contact_email: contactEmail.trim(),
    note: note.trim() || null,
  });
  if (error) throw new Error(error.message);
}

export async function resolveReport(reportId: string, status: "resolved" | "dismissed") {
  await requireAdmin();
  const supabase = await getServerClient();
  const { error } = await supabase.from("reports").update({ status }).eq("id", reportId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function resolveReportAndHide(reportId: string, targetType: string, targetId: string) {
  await requireAdmin();
  const supabase = await getServerClient();
  const { error: e1 } = await supabase.from("reports").update({ status: "resolved" }).eq("id", reportId);
  if (e1) throw new Error(e1.message);
  const table = targetType === "group" ? "groups" : "events";
  const { error: e2 } = await supabase.from(table).update({ status: "hidden" }).eq("id", targetId);
  if (e2) throw new Error(e2.message);
  revalidatePath("/admin");
  revalidatePath(`/${targetType}s/${targetId}`);
}

export async function decideClaim(claimId: string, groupId: string, approve: boolean) {
  await requireAdmin();
  const supabase = await getServerClient();
  const { error: e1 } = await supabase
    .from("claim_requests")
    .update({ status: approve ? "approved" : "rejected" })
    .eq("id", claimId);
  if (e1) throw new Error(e1.message);
  if (approve) {
    const { error: e2 } = await supabase.from("groups").update({ claimed: true }).eq("id", groupId);
    if (e2) throw new Error(e2.message);
  }
  revalidatePath("/admin");
  revalidatePath(`/groups/${groupId}`);
}

// --- Content moderation ---

export async function setContentStatus(type: "group" | "event", id: string, status: "live" | "hidden" | "removed") {
  await requireAdmin();
  const supabase = await getServerClient();
  const table = type === "group" ? "groups" : "events";
  const { error } = await supabase.from(table).update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  revalidatePath(`/${type}s/${id}`);
  revalidatePath(`/${type}s`);
}

export async function deleteComment(commentId: string, targetType?: string, targetId?: string) {
  const member = await requireMember();
  const supabase = await getServerClient();
  const { error } = await supabase.from("comments").delete().eq("id", commentId);
  if (error) throw new Error(error.message);
  if (targetType && targetId) revalidatePath(`/${targetType}s/${targetId}`);
  revalidatePath("/admin");
}

// --- Member management ---

export async function toggleBan(memberId: string, banned: boolean) {
  await requireAdmin();
  const supabase = await getServerClient();
  const { error } = await supabase.from("members").update({ banned }).eq("id", memberId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function toggleAdmin(memberId: string, isAdmin: boolean) {
  await requireAdmin();
  const supabase = await getServerClient();
  const { error } = await supabase.from("members").update({ is_admin: isAdmin }).eq("id", memberId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

// --- Pages CMS ---

export async function savePage(id: string | null, title: string, slug: string, body: string, inNav: boolean) {
  await requireAdmin();
  const supabase = await getServerClient();
  if (id) {
    const { error } = await supabase.from("pages").update({ title, slug, body, in_nav: inNav, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("pages").insert({ title, slug, body, in_nav: inNav });
    if (error) throw new Error(error.message);
  }
  revalidatePath("/admin");
  revalidatePath(`/p/${slug}`);
}

export async function deletePage(pageId: string) {
  await requireAdmin();
  const supabase = await getServerClient();
  const { error } = await supabase.from("pages").delete().eq("id", pageId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

// --- Tags ---

export async function saveTag(id: string | null, name: string, sort: number) {
  await requireAdmin();
  const supabase = await getServerClient();
  if (id) {
    const { error } = await supabase.from("tags").update({ name, sort }).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("tags").insert({ name, sort });
    if (error) throw new Error(error.message);
  }
  revalidatePath("/admin");
  revalidatePath("/groups");
  revalidatePath("/events");
}

export async function deleteTag(tagId: string) {
  await requireAdmin();
  const supabase = await getServerClient();
  const { error } = await supabase.from("tags").delete().eq("id", tagId);
  if (error) throw new Error(error.message);
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
  const { error } = await supabase.from("notifications").insert(rows);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}
