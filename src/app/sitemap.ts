import type { MetadataRoute } from "next";
import { howdyDb } from "@/lib/supabase";

const SITE = "https://howdyirl.com";
const CITY = "huntsville";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = howdyDb();

  // Events are locked as "coming soon" — leave them out of the sitemap until launch.
  const [{ data: groups }, { data: spots }, { data: threads }, { data: pages }] =
    await Promise.all([
      db.from("groups").select("slug, updated_at").eq("status", "live").order("updated_at", { ascending: false }),
      db.from("spots").select("slug, updated_at").eq("status", "live").order("updated_at", { ascending: false }),
      db.from("threads").select("slug, section, updated_at").eq("status", "live").order("updated_at", { ascending: false }),
      db.from("pages").select("slug, updated_at").eq("status", "published"),
    ]);

  const entries: MetadataRoute.Sitemap = [
    { url: SITE, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${SITE}/${CITY}/groups`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE}/${CITY}/spots`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE}/${CITY}/forums`, changeFrequency: "daily", priority: 0.7 },
  ];

  for (const g of groups ?? []) {
    entries.push({ url: `${SITE}/${CITY}/groups/${g.slug}`, lastModified: g.updated_at, changeFrequency: "weekly", priority: 0.8 });
  }
  for (const s of spots ?? []) {
    entries.push({ url: `${SITE}/${CITY}/spots/${s.slug}`, lastModified: s.updated_at, changeFrequency: "weekly", priority: 0.8 });
  }
  for (const t of threads ?? []) {
    entries.push({ url: `${SITE}/${CITY}/forums/${t.section}/${t.slug}`, lastModified: t.updated_at, changeFrequency: "weekly", priority: 0.6 });
  }
  for (const p of pages ?? []) {
    entries.push({ url: `${SITE}/p/${p.slug}`, lastModified: p.updated_at, changeFrequency: "monthly", priority: 0.5 });
  }

  return entries;
}
