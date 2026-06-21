import Link from "next/link";
import { notFound } from "next/navigation";
import { getGroup, getGroupUpdates, getGroupEvents, getComments } from "@/lib/data";
import { getSessionUser } from "@/lib/auth";
import { color, initials, eventDate, eventTime, stamp } from "@/lib/format";
import { externalHref } from "@/lib/url";
import CheckBadge from "@/components/CheckBadge";
import Comments from "@/components/Comments";

export const dynamic = "force-dynamic";

export default async function GroupDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const group = await getGroup(id);
  if (!group) notFound();

  const [updates, events, comments, session] = await Promise.all([
    getGroupUpdates(group.id),
    getGroupEvents(group.id),
    getComments("group", group.id),
    getSessionUser(),
  ]);
  const loggedIn = !!session;

  const link = externalHref(group.external_link);

  return (
    <div>
      <Link className="back" href="/groups">
        ‹ back to list
      </Link>
      <div className="detail">
        <div className="detail-top">
          <div className="hero" style={{ background: color(initials(group.name).length + group.name.length) }}>
            {initials(group.name)}
          </div>
          <div style={{ flex: 1, minWidth: 240 }}>
            <h1>
              {group.name}
              {group.claimed && <CheckBadge />}
            </h1>
            <div className="sub">
              huntsville, al
              {group.claimed && (
                <>
                  {" · "}
                  <span className="tag claimed">✓ claimed — maintained by organizer</span>
                </>
              )}
            </div>
            <p>{group.description}</p>
            <div className="meta">
              added by <a href="#">@{group.creator_handle}</a>
            </div>
            <div className="topics-row">
              {group.tags.map((t) => (
                <span className="topic" key={t}>
                  {t}
                </span>
              ))}
            </div>
            {!group.claimed && (
              <p style={{ color: "var(--ink-faint)", fontSize: 12 }}>
                ⚠ This listing was added by someone other than the organizer. Info may be out of
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

        <div className="gallery">
          <div>logo</div>
          <div>photo 1</div>
          <div>photo 2</div>
          <div>+ add</div>
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
            <div className="meta">none scheduled</div>
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
              no updates yet{group.claimed ? " — the organizer can post one." : "."}
            </div>
          )}
        </div>

        <div className="actions">
          {group.claimed ? (
            <a className="btn" href={loggedIn ? "#" : "/login"}>
              join this group
            </a>
          ) : (
            <a className="btn ghost" href={loggedIn ? "#" : "/login"}>
              I run this — claim it
            </a>
          )}
          <a className="report" href="#">
            report this listing
          </a>
        </div>

        <Comments comments={comments} loggedIn={loggedIn} />
      </div>
    </div>
  );
}
