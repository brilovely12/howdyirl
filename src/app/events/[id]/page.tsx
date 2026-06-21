import Link from "next/link";
import { notFound } from "next/navigation";
import { getEvent, getEventUpdates, getComments } from "@/lib/data";
import { getSessionUser } from "@/lib/auth";
import { color, initials, eventDate, eventTime, stamp } from "@/lib/format";
import { externalHref } from "@/lib/url";
import Comments from "@/components/Comments";

export const dynamic = "force-dynamic";

export default async function EventDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) notFound();

  const [updates, comments, session] = await Promise.all([
    getEventUpdates(event.id),
    getComments("event", event.id),
    getSessionUser(),
  ]);
  const loggedIn = !!session;

  const link = externalHref(event.external_link);

  return (
    <div>
      <Link className="back" href="/events">
        ‹ back to list
      </Link>
      <div className="detail">
        <div className="detail-top">
          <div className="hero" style={{ background: color(initials(event.name).length + event.name.length + 3) }}>
            {initials(event.name)}
          </div>
          <div style={{ flex: 1, minWidth: 240 }}>
            <h1>{event.name}</h1>
            <div className="sub">
              <span className="tag evt">event</span> ·{" "}
              <b style={{ color: "var(--amber)", fontFamily: "var(--mono)" }}>
                {eventDate(event.starts_at)} · {eventTime(event.starts_at)}
              </b>{" "}
              · huntsville, al
            </div>
            <p>{event.description}</p>
            <div className="meta">
              {event.host_group_name ? (
                <>
                  hosted by{" "}
                  {event.host_group_id ? (
                    <Link href={`/groups/${event.host_group_id}`}>{event.host_group_name}</Link>
                  ) : (
                    event.host_group_name
                  )}
                </>
              ) : (
                <>
                  posted by <a href="#">@{event.creator_handle}</a>
                </>
              )}
            </div>
            <div className="topics-row">
              {event.tags.map((t) => (
                <span className="topic" key={t}>
                  {t}
                </span>
              ))}
            </div>
            {link && (
              <div className="info-link">
                External link:{" "}
                <a href={link} target="_blank" rel="noopener">
                  {event.external_link}
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="actions">
          <a className="btn" href={loggedIn ? "#" : "/login"}>
            RSVP
          </a>
          <a className="report" href="#">
            report this event
          </a>
        </div>

        {updates.length > 0 && (
          <div className="upcoming">
            <h4>updates &amp; announcements</h4>
            {updates.map((u) => (
              <div className="update" key={u.id}>
                <div className="update-when">{stamp(u.posted_at)}</div>
                <div className="update-text">{u.body}</div>
              </div>
            ))}
          </div>
        )}

        <Comments comments={comments} loggedIn={loggedIn} />
      </div>
    </div>
  );
}
