import { cache } from "react";
import { howdyDb } from "./supabase";
import type { Group, EventRow, Update, Comment, Tag, Thread, Page, Notification, ForumSection, SearchResult } from "./types";

export const PAGE_SIZE = 10;

const DEFAULT_CITY = process.env.NEXT_PUBLIC_DEFAULT_CITY || "huntsville";

/** Resolve the active city to its id (single-city launch, multi-city ready). */
export const getCityId = cache(async (slug: string = DEFAULT_CITY): Promise<string | null> => {
  const db = howdyDb();
  const { data } = await db.from("cities").select("id").eq("slug", slug).maybeSingle();
  return data?.id ?? null;
});

/**
 * Tokenize a raw query per the spec: trim, lowercase, split on whitespace.
 * Each term must match (AND) as a case-insensitive substring. Wildcards in the
 * user's input are escaped so they match literally.
 */
export function queryTerms(raw: string | undefined | null): string[] {
  const q = (raw ?? "").trim().toLowerCase();
  if (!q) return [];
  return q.split(/\s+/).filter(Boolean);
}

function likePattern(term: string): string {
  const escaped = term.replace(/([\\%_])/g, "\\$1");
  return `%${escaped}%`;
}

export const listTags = cache(async (): Promise<Tag[]> => {
  const db = howdyDb();
  const { data } = await db.from("tags").select("id,name,sort").order("name");
  return data ?? [];
});

const GROUP_COLS =
  "id,creator_id,creator_handle,name,description,claimed,joins_count,external_link,link_label,image_url,images,tags,status,updated_at";
const EVENT_COLS =
  "id,creator_id,creator_handle,host_group_id,host_group_name,name,description,starts_at,recurrence,recurrence_end,external_link,image_url,images,tags,status";

export type ListParams = { q?: string; tags?: string[]; page?: number; when?: string };

/**
 * Groups list with server-side search. Combines (AND) the text query with the
 * active tag filter, keeps the existing "recently updated" sort, and paginates.
 */
export async function searchGroups({ q, tags, page = 1 }: ListParams): Promise<SearchResult<Group>> {
  const cityId = await getCityId();
  if (!cityId) return { rows: [], total: 0 };

  const db = howdyDb();
  let query = db
    .from("groups")
    .select(GROUP_COLS, { count: "exact" })
    .eq("city_id", cityId)
    .eq("status", "live");

  if (tags?.length) query = query.contains("tags", tags);
  for (const term of queryTerms(q)) query = query.ilike("search_text", likePattern(term));

  const from = (page - 1) * PAGE_SIZE;
  query = query.order("updated_at", { ascending: false }).range(from, from + PAGE_SIZE - 1);

  const { data, count } = await query;
  return { rows: (data ?? []) as Group[], total: count ?? 0 };
}

/**
 * Events list with server-side search. Same combine/sort/paginate rules; events
 * also match on host group name and sort by soonest upcoming date.
 */
function whenEnd(when: string | undefined): string | null {
  if (!when) return null;
  const now = new Date();
  const d = new Date(now);
  if (when === "week") {
    d.setDate(d.getDate() + (7 - d.getDay()));
    d.setHours(23, 59, 59, 999);
    return d.toISOString();
  }
  if (when === "weekend") {
    const day = d.getDay();
    const sat = day <= 6 ? 6 - day : 0;
    d.setDate(d.getDate() + sat + 1);
    d.setHours(23, 59, 59, 999);
    return d.toISOString();
  }
  if (when === "month") {
    d.setMonth(d.getMonth() + 1, 0);
    d.setHours(23, 59, 59, 999);
    return d.toISOString();
  }
  return null;
}

function nextOccurrence(startsAt: string, recurrence: string | null, recurrenceEnd: string | null): string | null {
  const now = new Date();
  const maxDate = new Date(now.getTime() + 2 * 365.25 * 24 * 60 * 60 * 1000);
  const start = new Date(startsAt);

  if (!recurrence) {
    return start >= now ? startsAt : null;
  }

  let next = new Date(start);
  while (next < now) {
    if (recurrence === "weekly") next.setDate(next.getDate() + 7);
    else if (recurrence === "monthly") next.setMonth(next.getMonth() + 1);
    else if (recurrence === "annually") next.setFullYear(next.getFullYear() + 1);
    else return null;
  }

  if (recurrenceEnd && next > new Date(recurrenceEnd)) return null;
  if (next > maxDate) return null;

  return next.toISOString();
}

export async function searchEvents({ q, tags, when, page = 1 }: ListParams): Promise<SearchResult<EventRow>> {
  const cityId = await getCityId();
  if (!cityId) return { rows: [], total: 0 };

  const db = howdyDb();
  let query = db
    .from("events")
    .select(EVENT_COLS)
    .eq("city_id", cityId)
    .eq("status", "live")
    .or(`starts_at.gte.${new Date().toISOString()},recurrence.not.is.null`);

  if (tags?.length) query = query.contains("tags", tags);
  for (const term of queryTerms(q)) query = query.ilike("search_text", likePattern(term));

  const { data } = await query;
  let events = ((data ?? []) as EventRow[])
    .map((e) => {
      const next = nextOccurrence(e.starts_at, e.recurrence, e.recurrence_end);
      return next ? { ...e, next_at: next } : null;
    })
    .filter(Boolean) as EventRow[];

  const end = whenEnd(when);
  if (end) events = events.filter((e) => e.next_at! <= end);

  events.sort((a, b) => new Date(a.next_at!).getTime() - new Date(b.next_at!).getTime());

  const total = events.length;
  const from = (page - 1) * PAGE_SIZE;
  const rows = events.slice(from, from + PAGE_SIZE);

  return { rows, total };
}

/** Live counts for the subnav tabs. */
export const listCounts = cache(async (): Promise<{ groups: number; events: number }> => {
  const cityId = await getCityId();
  if (!cityId) return { groups: 0, events: 0 };
  const db = howdyDb();
  const [g, e] = await Promise.all([
    db.from("groups").select("id", { count: "exact", head: true }).eq("city_id", cityId).eq("status", "live"),
    db
      .from("events")
      .select("id", { count: "exact", head: true })
      .eq("city_id", cityId)
      .eq("status", "live")
      .or(`starts_at.gte.${new Date().toISOString()},recurrence.not.is.null`),
  ]);
  return { groups: g.count ?? 0, events: e.count ?? 0 };
});

export async function getGroup(id: string, anyStatus = false): Promise<Group | null> {
  const db = howdyDb();
  let query = db.from("groups").select(GROUP_COLS).eq("id", id);
  if (!anyStatus) query = query.eq("status", "live");
  const { data } = await query.maybeSingle();
  return (data as Group) ?? null;
}

export async function getEvent(id: string, anyStatus = false): Promise<EventRow | null> {
  const db = howdyDb();
  let query = db.from("events").select(EVENT_COLS).eq("id", id);
  if (!anyStatus) query = query.eq("status", "live");
  const { data } = await query.maybeSingle();
  if (!data) return null;
  const event = data as EventRow;
  event.next_at = nextOccurrence(event.starts_at, event.recurrence, event.recurrence_end) ?? event.starts_at;
  return event;
}

export async function getGroupUpdates(groupId: string): Promise<Update[]> {
  const db = howdyDb();
  const { data } = await db
    .from("group_updates")
    .select("id,body,posted_at")
    .eq("group_id", groupId)
    .order("posted_at", { ascending: false });
  return data ?? [];
}

export async function getEventUpdates(eventId: string): Promise<Update[]> {
  const db = howdyDb();
  const { data } = await db
    .from("event_updates")
    .select("id,body,posted_at")
    .eq("event_id", eventId)
    .order("posted_at", { ascending: false });
  return data ?? [];
}

/** Upcoming events hosted by a given group (shown on the group detail page). */
export async function getGroupEvents(hostGroupId: string): Promise<EventRow[]> {
  const db = howdyDb();
  const { data } = await db
    .from("events")
    .select(EVENT_COLS)
    .eq("host_group_id", hostGroupId)
    .eq("status", "live")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true });
  return (data ?? []) as EventRow[];
}

/** Live groups created by a member — for the event "post on behalf of" picker. */
export async function getGroupsByCreator(memberId: string): Promise<{ id: string; name: string }[]> {
  const db = howdyDb();
  const { data } = await db
    .from("groups")
    .select("id,name")
    .eq("creator_id", memberId)
    .eq("status", "live")
    .order("name");
  return data ?? [];
}

export async function getComments(targetType: "group" | "event" | "thread", targetId: string): Promise<Comment[]> {
  const db = howdyDb();
  const { data } = await db
    .from("comments")
    .select("id,author_handle,body,edited,quote_handle,quote_text,created_at")
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .order("created_at", { ascending: true });
  return data ?? [];
}

const THREAD_COLS = "id,creator_id,creator_handle,section,title,body,status,reply_count,created_at,updated_at";

export async function getForumSections(): Promise<ForumSection[]> {
  const db = howdyDb();
  const { data } = await db
    .from("forum_sections")
    .select("id,slug,label,description,sort")
    .order("sort");
  return (data ?? []) as ForumSection[];
}

export async function listThreads(section: string, page = 1): Promise<SearchResult<Thread>> {
  const cityId = await getCityId();
  if (!cityId) return { rows: [], total: 0 };
  const db = howdyDb();
  const from = (page - 1) * PAGE_SIZE;
  const { data, count } = await db
    .from("threads")
    .select(THREAD_COLS, { count: "exact" })
    .eq("city_id", cityId)
    .eq("section", section)
    .eq("status", "live")
    .order("updated_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);
  return { rows: (data ?? []) as Thread[], total: count ?? 0 };
}

export async function getThread(id: string, anyStatus = false): Promise<Thread | null> {
  const db = howdyDb();
  let query = db.from("threads").select(THREAD_COLS).eq("id", id);
  if (!anyStatus) query = query.eq("status", "live");
  const { data } = await query.maybeSingle();
  return (data as Thread) ?? null;
}

export async function getSectionCounts(): Promise<Record<string, number>> {
  const cityId = await getCityId();
  if (!cityId) return {};
  const db = howdyDb();
  const sections = await getForumSections();
  const counts: Record<string, number> = {};
  for (const s of sections) {
    const { count } = await db
      .from("threads")
      .select("id", { count: "exact", head: true })
      .eq("city_id", cityId)
      .eq("section", s.slug)
      .eq("status", "live");
    counts[s.slug] = count ?? 0;
  }
  return counts;
}

export const getNavPages = cache(async (): Promise<Page[]> => {
  const db = howdyDb();
  const { data } = await db
    .from("pages")
    .select("id,title,slug,body,in_nav,is_rules")
    .eq("in_nav", true)
    .eq("status", "published");
  return data ?? [];
});

export async function getPage(slug: string): Promise<Page | null> {
  const db = howdyDb();
  const { data } = await db
    .from("pages")
    .select("id,title,slug,body,in_nav,is_rules")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return (data as Page) ?? null;
}

export async function isMemberOfGroup(memberId: string, groupId: string): Promise<boolean> {
  const db = howdyDb();
  const { data } = await db
    .from("memberships")
    .select("member_id")
    .eq("member_id", memberId)
    .eq("group_id", groupId)
    .maybeSingle();
  return !!data;
}

export async function hasRsvp(memberId: string, eventId: string): Promise<boolean> {
  const db = howdyDb();
  const { data } = await db
    .from("rsvps")
    .select("member_id")
    .eq("member_id", memberId)
    .eq("event_id", eventId)
    .maybeSingle();
  return !!data;
}

export async function getMyGroups(memberId: string): Promise<{ id: string; name: string }[]> {
  const db = howdyDb();
  const { data } = await db
    .from("memberships")
    .select("group_id, groups:group_id(id, name)")
    .eq("member_id", memberId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((r: any) => r.groups).filter(Boolean);
}

export async function getMyRsvps(memberId: string): Promise<{ id: string; name: string; starts_at: string }[]> {
  const db = howdyDb();
  const { data } = await db
    .from("rsvps")
    .select("event_id, events:event_id(id, name, starts_at)")
    .eq("member_id", memberId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((r: any) => r.events).filter(Boolean);
}

export async function getUnreadCount(memberId: string): Promise<number> {
  const db = howdyDb();
  const { count } = await db
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("member_id", memberId)
    .eq("read", false);
  return count ?? 0;
}

export async function getNotifications(memberId: string): Promise<Notification[]> {
  const db = howdyDb();
  const { data } = await db
    .from("notifications")
    .select("id,kind,body,link_type,link_id,read,created_at")
    .eq("member_id", memberId)
    .order("created_at", { ascending: false })
    .limit(50);
  return (data ?? []) as Notification[];
}
