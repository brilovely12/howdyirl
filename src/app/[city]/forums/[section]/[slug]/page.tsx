import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getThread, getComments, getForumSections } from "@/lib/data";
import { getSessionUser } from "@/lib/auth";
import { stamp } from "@/lib/format";
import Comments from "@/components/Comments";
import AdminBar from "@/components/AdminBar";
import DeleteThreadButton from "@/components/DeleteThreadButton";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ city: string; section: string; slug: string }> }): Promise<Metadata> {
  const { city, section, slug } = await params;
  const thread = await getThread(slug);
  if (!thread) return {};
  return {
    title: thread.title,
    description: thread.body ? thread.body.slice(0, 160) : `Discussion on Howdy IRL forums`,
    alternates: { canonical: `/${city}/forums/${section}/${thread.slug}` },
  };
}

export default async function ThreadDetail({
  params,
}: {
  params: Promise<{ city: string; section: string; slug: string }>;
}) {
  const { city, section, slug } = await params;
  const sections = await getForumSections();
  const match = sections.find((s) => s.slug === section);
  if (!match) notFound();

  const session = await getSessionUser();
  const isAdmin = !!session?.member?.is_admin;
  const thread = await getThread(slug, isAdmin);
  if (!thread || thread.section !== section) notFound();

  const comments = await getComments("thread", thread.id);
  const loggedIn = !!session;
  const isCreator = session?.member?.id === thread.creator_id;

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <Link className="back" href={`/${city}/forums/${section}`}>
        ‹ {match.label}
      </Link>

      {isAdmin && <AdminBar type="thread" id={thread.id} status={thread.status} />}

      <div className="detail">
        <h1>{thread.title}</h1>
        <div className="meta" style={{ marginBottom: 16 }}>
          <span style={{ color: "var(--link)" }}>@{thread.creator_handle}</span>
          <span className="dot">·</span>
          {stamp(thread.created_at)}
          {(isCreator || isAdmin) && (
            <>
              <span className="dot">·</span>
              <DeleteThreadButton threadId={thread.id} section={section} city={city} />
            </>
          )}
        </div>

        {thread.body && <p style={{ whiteSpace: "pre-wrap" }}>{thread.body}</p>}

        <Comments
          comments={comments}
          loggedIn={loggedIn}
          targetType="thread"
          targetId={thread.id}
          sessionHandle={session?.member?.handle}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  );
}
