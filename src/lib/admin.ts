import { getServerClient } from "./supabase/server";

export type Report = {
  id: string;
  target_type: string;
  target_id: string;
  reason: string | null;
  reported_by: string | null;
  status: string;
  created_at: string;
  target_name?: string;
  target_status?: string;
};

export type ClaimRequest = {
  id: string;
  group_id: string | null;
  spot_id: string | null;
  requested_by: string | null;
  contact_email: string | null;
  note: string | null;
  status: string;
  created_at: string;
  target_type: "group" | "spot";
  target_id: string;
  target_name?: string;
  target_slug?: string;
};

export type AdminMember = {
  id: string;
  handle: string;
  email: string | null;
  is_admin: boolean;
  banned: boolean;
  joined_at: string;
};

export type AdminComment = {
  id: string;
  target_type: string;
  target_id: string;
  author_handle: string;
  body: string;
  created_at: string;
  target_name?: string;
};

export type AdminPage = {
  id: string;
  title: string;
  slug: string;
  body: string;
  in_nav: boolean;
  is_rules: boolean;
  status: string;
  updated_at: string;
};

export type AdminTag = {
  id: string;
  name: string;
  sort: number;
};

export type AdminForumSection = {
  id: string;
  slug: string;
  label: string;
  description: string;
  sort: number;
};

export type AdminContent = {
  id: string;
  slug: string;
  type: "group" | "event" | "spot";
  name: string;
  status: string;
  creator_handle: string | null;
  created_at: string;
};

// --- Stats ---

export async function getAdminStats() {
  const db = await getServerClient();
  const [members, groups, events, spots, openReports, openClaims, comments] = await Promise.all([
    db.from("members").select("id", { count: "exact", head: true }),
    db.from("groups").select("id", { count: "exact", head: true }).eq("status", "live"),
    db.from("events").select("id", { count: "exact", head: true }).eq("status", "live"),
    db.from("spots").select("id", { count: "exact", head: true }).eq("status", "live"),
    db.from("reports").select("id", { count: "exact", head: true }).eq("status", "open"),
    db.from("claim_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
    db.from("comments").select("id", { count: "exact", head: true }),
  ]);
  return {
    members: members.count ?? 0,
    groups: groups.count ?? 0,
    events: events.count ?? 0,
    spots: spots.count ?? 0,
    openReports: openReports.count ?? 0,
    openClaims: openClaims.count ?? 0,
    comments: comments.count ?? 0,
  };
}

// --- Reports ---

export async function getReports(): Promise<Report[]> {
  const db = await getServerClient();
  const { data } = await db
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  const reports = (data ?? []) as Report[];
  for (const r of reports) {
    const table = r.target_type === "group" ? "groups" : "events";
    const { data: target } = await db.from(table).select("name, status").eq("id", r.target_id).maybeSingle();
    r.target_name = (target as any)?.name ?? "Unknown";
    r.target_status = (target as any)?.status ?? "unknown";
  }
  return reports;
}

// --- Claims ---

export async function getClaims(): Promise<ClaimRequest[]> {
  const db = await getServerClient();
  const { data } = await db
    .from("claim_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  const claims = (data ?? []) as ClaimRequest[];
  for (const c of claims) {
    c.target_type = c.spot_id ? "spot" : "group";
    c.target_id = (c.spot_id ?? c.group_id)!;
    const table = c.target_type === "spot" ? "spots" : "groups";
    const { data: target } = await db.from(table).select("name,slug").eq("id", c.target_id).maybeSingle();
    c.target_name = (target as any)?.name ?? "Unknown";
    c.target_slug = (target as any)?.slug ?? c.target_id;
  }
  return claims;
}

// --- Members ---

export async function getMembers(q?: string): Promise<AdminMember[]> {
  const db = await getServerClient();
  let query = db
    .from("members")
    .select("id, handle, email, is_admin, banned, joined_at")
    .order("joined_at", { ascending: false })
    .limit(200);
  if (q) {
    query = query.or(`handle.ilike.%${q}%,email.ilike.%${q}%`);
  }
  const { data } = await query;
  return (data ?? []) as AdminMember[];
}

// --- Comments ---

export async function getRecentComments(): Promise<AdminComment[]> {
  const db = await getServerClient();
  const { data } = await db
    .from("comments")
    .select("id, target_type, target_id, author_handle, body, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  const comments = (data ?? []) as AdminComment[];
  for (const c of comments) {
    const table = c.target_type === "group" ? "groups" : "events";
    const { data: target } = await db.from(table).select("name").eq("id", c.target_id).maybeSingle();
    c.target_name = (target as any)?.name ?? "Unknown";
  }
  return comments;
}

// --- Content (groups + events + spots) ---

export async function getAdminContent(): Promise<AdminContent[]> {
  const db = await getServerClient();
  const [{ data: groups }, { data: events }, { data: spots }] = await Promise.all([
    db.from("groups").select("id, slug, name, status, creator_handle, created_at").order("created_at", { ascending: false }).limit(50),
    db.from("events").select("id, slug, name, status, creator_handle, created_at").order("created_at", { ascending: false }).limit(50),
    db.from("spots").select("id, slug, name, status, creator_handle, created_at").order("created_at", { ascending: false }).limit(50),
  ]);
  const content: AdminContent[] = [
    ...((groups ?? []) as any[]).map((g: any) => ({ ...g, type: "group" as const })),
    ...((events ?? []) as any[]).map((e: any) => ({ ...e, type: "event" as const })),
    ...((spots ?? []) as any[]).map((s: any) => ({ ...s, type: "spot" as const })),
  ];
  content.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return content;
}

// --- Pages ---

export async function getAdminPages(): Promise<AdminPage[]> {
  const db = await getServerClient();
  const { data } = await db
    .from("pages")
    .select("id, title, slug, body, in_nav, is_rules, status, updated_at")
    .order("title");
  return (data ?? []) as AdminPage[];
}

// --- Tags ---

export async function getAdminTags(): Promise<AdminTag[]> {
  const db = await getServerClient();
  const { data } = await db
    .from("tags")
    .select("id, name, sort")
    .order("sort");
  return (data ?? []) as AdminTag[];
}

// --- Spot Tags ---

export async function getAdminSpotTags(): Promise<AdminTag[]> {
  const db = await getServerClient();
  const { data } = await db
    .from("spot_tags")
    .select("id, name, sort")
    .order("sort");
  return (data ?? []) as AdminTag[];
}

// --- Forum Sections ---

export async function getAdminForumSections(): Promise<AdminForumSection[]> {
  const db = await getServerClient();
  const { data } = await db
    .from("forum_sections")
    .select("id, slug, label, description, sort")
    .order("sort");
  return (data ?? []) as AdminForumSection[];
}

// --- Activity feed ---

export async function getRecentActivity() {
  const db = await getServerClient();
  const [{ data: newMembers }, { data: newGroups }, { data: newEvents }, { data: newComments }] = await Promise.all([
    db.from("members").select("handle, joined_at").order("joined_at", { ascending: false }).limit(10),
    db.from("groups").select("id, slug, name, created_at").order("created_at", { ascending: false }).limit(10),
    db.from("events").select("id, slug, name, created_at").order("created_at", { ascending: false }).limit(10),
    db.from("comments").select("author_handle, target_type, target_id, created_at").order("created_at", { ascending: false }).limit(10),
  ]);

  type Activity = { kind: string; label: string; href?: string; at: string };
  const feed: Activity[] = [];

  for (const m of (newMembers ?? []) as any[]) {
    feed.push({ kind: "signup", label: `@${m.handle} joined`, at: m.joined_at });
  }
  for (const g of (newGroups ?? []) as any[]) {
    feed.push({ kind: "group", label: `New group: ${g.name}`, href: `/huntsville/groups/${g.slug}`, at: g.created_at });
  }
  for (const e of (newEvents ?? []) as any[]) {
    feed.push({ kind: "event", label: `New event: ${e.name}`, href: `/huntsville/events/${e.slug}`, at: e.created_at });
  }
  for (const c of (newComments ?? []) as any[]) {
    feed.push({
      kind: "comment",
      label: `@${c.author_handle} commented`,
      href: `/huntsville/${c.target_type}s/${c.target_id}`,
      at: c.created_at,
    });
  }

  feed.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  return feed.slice(0, 30);
}
