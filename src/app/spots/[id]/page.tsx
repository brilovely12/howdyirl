import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSpot, getSpotUpdates, getSpotEvents, getComments, isMemberOfSpot } from "@/lib/data";
import { getSessionUser } from "@/lib/auth";
import { color, initials, eventDate, eventTime, stamp } from "@/lib/format";
import { externalHref } from "@/lib/url";
import CheckBadge from "@/components/CheckBadge";
import Comments from "@/components/Comments";
import SaveSpotButton from "@/components/SaveSpotButton";
import SpotClaimForm from "@/components/SpotClaimForm";
import ReportButton from "@/components/ReportButton";
import AdminBar from "@/components/AdminBar";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const spot = await getSpot((await params).id);
  if (!spot) return {};
  return {
    title: `${spot.name} — Howdy IRL`,
    description: spot.description,
    openGraph: { title: spot.name, description: spot.description },
  };
}

export default async function SpotDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSessionUser();
  const isAdmin = !!session?.member?.is_admin;
  const spot = await getSpot(id, isAdmin);
  if (!spot) notFound();

  const [updates, events, comments] = await Promise.all([
    getSpotUpdates(spot.id),
    getSpotEvents(spot.id),
    getComments("spot", spot.id),
  ]);
  const loggedIn = !!session;
  const saved = session?.member ? await isMemberOfSpot(session.member.id, spot.id) : false;
  const canEdit = isAdmin || (session?.member?.id === spot.creator_id);

  const link = externalHref(spot.external_link);

  return (
    <div>
      <Link className="back" href="/spots">
        ‹ Back to list
      </Link>

      {isAdmin && <AdminBar type="spot" id={spot.id} status={spot.status} />}

      <div className="detail">
        <div className="detail-top">
          {spot.image_url ? (
            <img className="hero" src={spot.image_url} alt="" style={{ objectFit: "cover" }} />
          ) : (
            <div className="hero" style={{ background: color(initials(spot.name).length + spot.name.length) }}>
              {initials(spot.name)}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 240 }}>
            <h1>
              {spot.name}
              {spot.claimed && <CheckBadge />}
              {canEdit && (
                <Link
                  href={`/spots/${spot.id}/edit`}
                  style={{ fontSize: 12, fontWeight: 400, marginLeft: 10, color: "var(--link)" }}
                >
                  edit
                </Link>
              )}
            </h1>
            <div className="sub">
              {spot.address || "Huntsville, AL"}
              {spot.claimed && (
                <>
                  {" · "}
                  <span className="tag claimed">✓ claimed — maintained by owner</span>
                </>
              )}
            </div>
            <p>{spot.description}</p>
            <div className="topics-row">
              {spot.tags.map((t) => (
                <span className="topic" key={t}>
                  {t}
                </span>
              ))}
            </div>
            {!spot.claimed && (
              <p style={{ color: "var(--ink-faint)", fontSize: 12 }}>
                This listing was added by a community member. Info may be out of
                date. Are you the owner? You can claim it.
              </p>
            )}
            {spot.address && (
              <div className="info-link">
                <a href={`https://maps.google.com/?q=${encodeURIComponent(spot.address)}`} target="_blank" rel="noopener">
                  Open in Google Maps
                </a>
              </div>
            )}
            {link && (
              <div className="info-link">
                External link:{" "}
                <a href={link} target="_blank" rel="noopener">
                  {spot.external_link}
                </a>
              </div>
            )}
          </div>
        </div>

        {spot.images?.length > 0 && (
          <div className="gallery">
            {spot.images.map((src, i) => (
              <img key={i} src={src} alt="" style={{ width: 120, height: 90, objectFit: "cover", borderRadius: 3, border: "1px solid var(--rule)" }} />
            ))}
          </div>
        )}

        <div className="upcoming">
          <h4>upcoming events at this spot</h4>
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
          <h4>announcements</h4>
          {updates.length ? (
            updates.map((u) => (
              <div className="update" key={u.id}>
                <div className="update-when">{stamp(u.posted_at)}</div>
                <div className="update-text">{u.body}</div>
              </div>
            ))
          ) : (
            <div className="meta">
              No announcements yet{spot.claimed ? " — the owner can post one." : "."}
            </div>
          )}
        </div>

        <div className="actions">
          {spot.claimed ? (
            loggedIn ? (
              <SaveSpotButton spotId={spot.id} saved={saved} />
            ) : (
              <Link className="btn" href={`/login?next=/spots/${spot.id}`}>Save this spot</Link>
            )
          ) : (
            loggedIn ? (
              <SpotClaimForm spotId={spot.id} />
            ) : (
              <Link className="btn ghost" href={`/login?next=/spots/${spot.id}`}>I run this — Claim it</Link>
            )
          )}
          {loggedIn ? (
            <ReportButton targetType="spot" targetId={spot.id} />
          ) : (
            <Link className="report" href={`/login?next=/spots/${spot.id}`}>Report this listing</Link>
          )}
        </div>

        <Comments comments={comments} loggedIn={loggedIn} targetType="spot" targetId={spot.id} sessionHandle={session?.member?.handle} isAdmin={isAdmin} />
      </div>
    </div>
  );
}
