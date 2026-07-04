import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { listThreads, getForumSections, PAGE_SIZE } from "@/lib/data";
import { getSessionUser } from "@/lib/auth";
import { stamp } from "@/lib/format";
import Pager from "@/components/Pager";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ city: string; section: string }> }): Promise<Metadata> {
  const { city, section } = await params;
  const sections = await getForumSections();
  const match = sections.find((s) => s.slug === section);
  if (!match) return {};
  return {
    title: `${match.label} — Forums`,
    description: match.description || `${match.label} forum on Howdy IRL`,
    alternates: { canonical: `/${city}/forums/${match.slug}` },
  };
}

export default async function SectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ city: string; section: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { city, section } = await params;
  const sections = await getForumSections();
  const match = sections.find((s) => s.slug === section);
  if (!match) notFound();

  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const [{ rows, total }, session] = await Promise.all([
    listThreads(section, page),
    getSessionUser(),
  ]);

  const postHref = session ? `/${city}/forums/${section}/new` : "/login";

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <Link className="back" href={`/${city}/forums`}>‹ All forums</Link>

      <div className="listhead">
        <h2>{match.label}</h2>
        <a className="btn post" href={postHref} style={{ marginLeft: "auto", width: "auto" }}>+ New Thread</a>
      </div>

      {rows.length ? (
        rows.map((t) => (
          <Link href={`/${city}/forums/${section}/${t.slug}`} className="row thread" key={t.id}>
            <div>
              <div className="ttl">{t.title}</div>
              <div className="meta">
                @{t.creator_handle}
                <span className="dot">·</span>
                {stamp(t.created_at)}
                {t.reply_count > 0 && (
                  <>
                    <span className="dot">·</span>
                    {t.reply_count} {t.reply_count === 1 ? "reply" : "replies"}
                  </>
                )}
              </div>
            </div>
          </Link>
        ))
      ) : (
        <div className="empty">No threads yet. Be the first to post!</div>
      )}

      <Pager basePath={`/${city}/forums/${section}`} page={page} total={total} pageSize={PAGE_SIZE} />
    </div>
  );
}
