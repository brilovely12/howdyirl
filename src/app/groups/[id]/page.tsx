import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGroup, getGroupUpdates, getGroupEvents, getComments, isMemberOfGroup } from "@/lib/data";
import { getSessionUser } from "@/lib/auth";
import { color, initials, eventDate, eventTime, stamp } from "@/lib/format";
import { externalHref } from "@/lib/url";
import CheckBadge from "@/components/CheckBadge";
import Comments from "@/components/Comments";
import JoinButton from "@/components/JoinButton";
import ClaimForm from "@/components/ClaimForm";
import ReportButton from "@/components/ReportButton";
import AdminBar from "@/components/AdminBar";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const group = await getGroup((await params).id);
  if (!group) return {};
  return {
    title: `${group.name} — Howdy IRL`,
    description: group.description,
    openGraph: { title: group.name, description: group.description },
  };
}

export default async function GroupDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSessionUser();
  const isAdmin = !!session?.member?.is_admin;
  const group = await getGroup(id, isAdmin);
  if (!group) notFound();

  const [updates, events, comments] = await Promise.all([
    getGroupUpdates(group.id),
    getGroupEvents(group.id),
    getComments("group", group.id),
  ]);
  const loggedIn = !!session;
  const joined = session?.member ? await isMemberOfGroup(session.member.id, group.id) : false;
  const canEdit = isAdmin || (session?.member?.id === group.creator_id);

  const link = externalHref(group.external_link);

  return (
    <div>
      <Link className="back" href="/groups">
        ‹ Back to list
      </Link>

      {isAdmin && <AdminBar type="group" id={group.id} status={group.status} />}

      <div className="detail">
        <div className="detail-top">
          <div className="hero" style={{ background: color(initials(group.name).length + group.name.length) }}>
            {initials(group.name)}
          </div>
          <div style={{ flex: 1, minWidth: 240 }}>
            <h1>
              {group.name}
              {group.claimed && <CheckBadge />}
              {canEdit && (
                <Link
                  href={`/groups/${group.id}/edit`}
                  style={{ fontSize: 12, fontWeight: 400, marginLeft: 10, color: "var(--link)" }}
                >
                  edit
                </Link>
              )}
            </h1>
            <div className="sub">
              Huntsville, AL
              {group.claimed && (
                <>
                  {" · "}
                  <span className="tag claimed">✓ claimed — maintained by organizer</span>
                </>
              )}
            </div>
            <p>{group.description}</p>
            <div className="topics-row">
              {group.tags.map((t) => (
                <span className="topic" key={t}>
                  {t}
                </span>
              ))}
            </div>
            {!group.claimed && (
              <p style={{ color: "var(--ink-faint)", fontSize: 12 }}>
                This listing was added by someone other than the organizer. Info may be out of
                date. Are you the organizer? You can claim it.
              </p>
            )}
            {link && (
              <div className="info-link">
                External link:{" "}
                <a href={link} target="_blank" rel="noopener">
                  {group.external_link}
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="upcoming">
          <h4>upcoming events from this group</h4>
          {events.length ? (
            events.map((e) => (
              <div className="meta" style={{ padding: "3px 0" }} key={e.id}>
                ▸ <Link href={`/events/${e.id}`}>{e.name}</Link> — {eventDate(e.starts_at)} ·{" "}
                {eventTime(e.starts_at)}
              </div>
            ))
          ) : (
            <div className="meta">None scheduled</div>
          )}
        </div>

        <div className="upcoming">
          <h4>updates &amp; announcements</h4>
          {updates.length ? (
            updates.map((u) => (
              <div className="update" key={u.id}>
                <div className="update-when">{stamp(u.posted_at)}</div>
                <div className="update-text">{u.body}</div>
              </div>
            ))
          ) : (
            <div className="meta">
              No updates yet{group.claimed ? " — the organizer can post one." : "."}
            </div>
          )}
        </div>

        <div className="actions">
          {group.claimed ? (
            loggedIn ? (
              <JoinButton groupId={group.id} joined={joined} />
            ) : (
              <Link className="btn" href={`/login?next=/groups/${group.id}`}>Join this group</Link>
            )
          ) : (
            loggedIn ? (
              <ClaimForm groupId={group.id} />
            ) : (
              <Link className="btn ghost" href={`/login?next=/groups/${group.id}`}>I run this — Claim it</Link>
            )
          )}
          {loggedIn ? (
            <ReportButton targetType="group" targetId={group.id} />
          ) : (
            <Link className="report" href={`/login?next=/groups/${group.id}`}>Report this listing</Link>
          )}
        </div>

        <Comments comments={comments} loggedIn={loggedIn} targetType="group" targetId={group.id} />
      </div>
    </div>
  );
}
