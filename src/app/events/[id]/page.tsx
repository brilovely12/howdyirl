import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEvent, getEventUpdates, getComments, hasRsvp } from "@/lib/data";
import { getSessionUser } from "@/lib/auth";
import { color, initials, eventDate, eventTime, stamp } from "@/lib/format";
import { externalHref } from "@/lib/url";
import Comments from "@/components/Comments";
import RsvpButton from "@/components/RsvpButton";
import ReportButton from "@/components/ReportButton";
import AdminBar from "@/components/AdminBar";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const event = await getEvent((await params).id);
  if (!event) return {};
  return {
    title: `${event.name} — Howdy IRL`,
    description: event.description,
    openGraph: { title: event.name, description: event.description },
  };
}

export default async function EventDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSessionUser();
  const isAdmin = !!session?.member?.is_admin;
  const event = await getEvent(id, isAdmin);
  if (!event) notFound();

  const [updates, comments] = await Promise.all([
    getEventUpdates(event.id),
    getComments("event", event.id),
  ]);
  const loggedIn = !!session;
  const rsvped = session?.member ? await hasRsvp(session.member.id, event.id) : false;
  const canEdit = isAdmin || (session?.member?.id === event.creator_id);

  const link = externalHref(event.external_link);

  return (
    <div>
      <Link className="back" href="/events">
        ‹ Back to list
      </Link>

      {isAdmin && <AdminBar type="event" id={event.id} status={event.status} />}

      <div className="detail">
        <div className="detail-top">
          {event.image_url ? (
            <img className="hero" src={event.image_url} alt="" style={{ objectFit: "cover" }} />
          ) : (
            <div className="hero" style={{ background: color(initials(event.name).length + event.name.length + 3) }}>
              {initials(event.name)}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 240 }}>
            <h1>
              {event.name}
              {canEdit && (
                <Link
                  href={`/events/${event.id}/edit`}
                  style={{ fontSize: 12, fontWeight: 400, marginLeft: 10, color: "var(--link)" }}
                >
                  edit
                </Link>
              )}
            </h1>
            <div className="sub">
              <span className="tag evt">event</span> ·{" "}
              <b style={{ color: "var(--amber)", fontFamily: "var(--mono)" }}>
                {eventDate(event.starts_at)} · {eventTime(event.starts_at)}
              </b>{" "}
              · Huntsville, AL
            </div>
            <p>{event.description}</p>
            <div className="meta">
              {event.host_group_name ? (
                <>
                  Hosted by{" "}
                  {event.host_group_id ? (
                    <Link href={`/groups/${event.host_group_id}`}>{event.host_group_name}</Link>
                  ) : (
                    event.host_group_name
                  )}
                </>
              ) : (
                <>
                  Posted by @{event.creator_handle}
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

        {event.images?.length > 0 && (
          <div className="gallery">
            {event.images.map((src, i) => (
              <img key={i} src={src} alt="" style={{ width: 120, height: 90, objectFit: "cover", borderRadius: 3, border: "1px solid var(--rule)" }} />
            ))}
          </div>
        )}

        <div className="actions">
          {loggedIn ? (
            <RsvpButton eventId={event.id} rsvped={rsvped} />
          ) : (
            <Link className="btn" href={`/login?next=/events/${event.id}`}>RSVP</Link>
          )}
          {loggedIn ? (
            <ReportButton targetType="event" targetId={event.id} />
          ) : (
            <Link className="report" href={`/login?next=/events/${event.id}`}>Report this event</Link>
          )}
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

        <Comments comments={comments} loggedIn={loggedIn} targetType="event" targetId={event.id} sessionHandle={session?.member?.handle} isAdmin={isAdmin} />
      </div>
    </div>
  );
}
