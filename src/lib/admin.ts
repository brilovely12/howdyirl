import { howdyDb } from "./supabase";

export type Report = {
  id: string;
  target_type: string;
  target_id: string;
  reason: string | null;
  reported_by: string | null;
  status: string;
  created_at: string;
  target_name?: string;
};

export type ClaimRequest = {
  id: string;
  group_id: string;
  requested_by: string | null;
  contact_email: string | null;
  note: string | null;
  status: string;
  created_at: string;
  group_name?: string;
};

export async function getReports(): Promise<Report[]> {
  const db = howdyDb();
  const { data } = await db
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  const reports = (data ?? []) as Report[];
  for (const r of reports) {
    const table = r.target_type === "group" ? "groups" : "events";
    const { data: target } = await db.from(table).select("name").eq("id", r.target_id).maybeSingle();
    r.target_name = (target as any)?.name ?? "Unknown";
  }
  return reports;
}

export async function getClaims(): Promise<ClaimRequest[]> {
  const db = howdyDb();
  const { data } = await db
    .from("claim_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  const claims = (data ?? []) as ClaimRequest[];
  for (const c of claims) {
    const { data: group } = await db.from("groups").select("name").eq("id", c.group_id).maybeSingle();
    c.group_name = (group as any)?.name ?? "Unknown";
  }
  return claims;
}

export async function getAdminStats() {
  const db = howdyDb();
  const [members, groups, events, openReports, openClaims] = await Promise.all([
    db.from("members").select("id", { count: "exact", head: true }),
    db.from("groups").select("id", { count: "exact", head: true }).eq("status", "live"),
    db.from("events").select("id", { count: "exact", head: true }).eq("status", "live"),
    db.from("reports").select("id", { count: "exact", head: true }).eq("status", "open"),
    db.from("claim_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);
  return {
    members: members.count ?? 0,
    groups: groups.count ?? 0,
    events: events.count ?? 0,
    openReports: openReports.count ?? 0,
    openClaims: openClaims.count ?? 0,
  };
}
