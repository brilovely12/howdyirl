import Link from "next/link";
import { notFound } from "next/navigation";
import { listThreads, SECTIONS, PAGE_SIZE } from "@/lib/data";
import type { Section } from "@/lib/data";
import { getSessionUser } from "@/lib/auth";
import { stamp } from "@/lib/format";
import Pager from "@/components/Pager";

export const dynamic = "force-dynamic";

const LABELS: Record<string, string> = {
  introductions: "Introductions",
  general: "General",
  random: "Random",
  feedback: "Feedback",
};

export default async function SectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { section } = await params;
  if (!SECTIONS.includes(section as Section)) notFound();
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const [{ rows, total }, session] = await Promise.all([
    listThreads(section as Section, page),
    getSessionUser(),
  ]);

  const postHref = session ? `/forums/${section}/new` : "/login";

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <Link className="back" href="/forums">‹ All forums</Link>

      <div className="listhead">
        <h2>{LABELS[section]}</h2>
        <a className="btn post" href={postHref} style={{ marginLeft: "auto", width: "auto" }}>+ New Thread</a>
      </div>

      {rows.length ? (
        rows.map((t) => (
          <Link href={`/forums/${section}/${t.id}`} className="row" key={t.id}>
            <div style={{ flex: 1 }}>
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

      <Pager basePath={`/forums/${section}`} page={page} total={total} pageSize={PAGE_SIZE} />
    </div>
  );
}
