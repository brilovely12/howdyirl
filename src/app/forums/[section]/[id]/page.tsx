import Link from "next/link";
import { notFound } from "next/navigation";
import { getThread, getComments, SECTIONS } from "@/lib/data";
import type { Section } from "@/lib/data";
import { getSessionUser } from "@/lib/auth";
import { stamp } from "@/lib/format";
import Comments from "@/components/Comments";
import AdminBar from "@/components/AdminBar";
import DeleteThreadButton from "@/components/DeleteThreadButton";

export const dynamic = "force-dynamic";

const LABELS: Record<string, string> = {
  introductions: "Introductions",
  general: "General",
  random: "Random",
  feedback: "Feedback",
};

export default async function ThreadDetail({
  params,
}: {
  params: Promise<{ section: string; id: string }>;
}) {
  const { section, id } = await params;
  if (!SECTIONS.includes(section as Section)) notFound();

  const session = await getSessionUser();
  const isAdmin = !!session?.member?.is_admin;
  const thread = await getThread(id, isAdmin);
  if (!thread || thread.section !== section) notFound();

  const comments = await getComments("thread", thread.id);
  const loggedIn = !!session;
  const isCreator = session?.member?.id === thread.creator_id;

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <Link className="back" href={`/forums/${section}`}>
        ‹ {LABELS[section]}
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
              <DeleteThreadButton threadId={thread.id} section={section} />
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
