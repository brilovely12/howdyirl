import { cache } from "react";
import { howdyDb } from "./supabase";
import type { Group, EventRow, Update, Comment, Tag, Page, SearchResult } from "./types";

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
  const { data } = await db.from("tags").select("id,name,sort").order("sort");
  return data ?? [];
});

const GROUP_COLS =
  "id,creator_handle,name,description,claimed,joins_count,external_link,link_label,tags,status,updated_at";
const EVENT_COLS =
  "id,creator_handle,host_group_id,host_group_name,name,description,starts_at,external_link,tags,status";

export type ListParams = { q?: string; tags?: string[]; page?: number };

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
export async function searchEvents({ q, tags, page = 1 }: ListParams): Promise<SearchResult<EventRow>> {
  const cityId = await getCityId();
  if (!cityId) return { rows: [], total: 0 };

  const db = howdyDb();
  let query = db
    .from("events")
    .select(EVENT_COLS, { count: "exact" })
    .eq("city_id", cityId)
    .eq("status", "live")
    .gte("starts_at", new Date().toISOString());

  if (tags?.length) query = query.contains("tags", tags);
  for (const term of queryTerms(q)) query = query.ilike("search_text", likePattern(term));

  const from = (page - 1) * PAGE_SIZE;
  query = query.order("starts_at", { ascending: true }).range(from, from + PAGE_SIZE - 1);

  const { data, count } = await query;
  return { rows: (data ?? []) as EventRow[], total: count ?? 0 };
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
      .gte("starts_at", new Date().toISOString()),
  ]);
  return { groups: g.count ?? 0, events: e.count ?? 0 };
});

export async function getGroup(id: string): Promise<Group | null> {
  const db = howdyDb();
  const { data } = await db.from("groups").select(GROUP_COLS).eq("id", id).eq("status", "live").maybeSingle();
  return (data as Group) ?? null;
}

export async function getEvent(id: string): Promise<EventRow | null> {
  const db = howdyDb();
  const { data } = await db.from("events").select(EVENT_COLS).eq("id", id).eq("status", "live").maybeSingle();
  return (data as EventRow) ?? null;
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

export async function getComments(targetType: "group" | "event", targetId: string): Promise<Comment[]> {
  const db = howdyDb();
  const { data } = await db
    .from("comments")
    .select("id,author_handle,body,edited,quote_handle,quote_text,created_at")
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .order("created_at", { ascending: true });
  return data ?? [];
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
