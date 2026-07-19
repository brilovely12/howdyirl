import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getSpot, getSpotUpdates, getSpotEvents, getComments, hasPendingClaim } from "@/lib/data";
import { getSessionUser } from "@/lib/auth";
import { color, initials, eventDate, eventTime, stamp } from "@/lib/format";
import { externalHref } from "@/lib/url";
import CheckBadge from "@/components/CheckBadge";
import Comments from "@/components/Comments";
import SpotClaimForm from "@/components/SpotClaimForm";
import ReportButton from "@/components/ReportButton";
import AdminBar from "@/components/AdminBar";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ city: string; slug: string }> }): Promise<Metadata> {
  const { city, slug } = await params;
  const spot = await getSpot(slug);
  if (!spot) return {};
  const desc = spot.description?.slice(0, 160) || `${spot.name} — a local spot on Howdy IRL`;
  return {
    title: spot.name,
    description: desc,
    alternates: { canonical: `/${city}/spots/${spot.slug}` },
    openGraph: {
      title: spot.name,
      description: desc,
      type: "website",
      url: `/${city}/spots/${spot.slug}`,
      ...(spot.image_url && { images: [{ url: spot.image_url, alt: spot.name }] }),
    },
    twitter: {
      card: spot.image_url ? "summary_large_image" : "summary",
      title: spot.name,
      description: desc,
      ...(spot.image_url && { images: [spot.image_url] }),
    },
  };
}

export default async function SpotDetail({ params }: { params: Promise<{ city: string; slug: string }> }) {
  const { city, slug } = await params;
  const session = await getSessionUser();
  const isAdmin = !!session?.member?.is_admin;
  const spot = await getSpot(slug, isAdmin);
  if (!spot) notFound();

  const [updates, events, comments] = await Promise.all([
    getSpotUpdates(spot.id),
    getSpotEvents(spot.id),
    getComments("spot", spot.id),
  ]);
  const loggedIn = !!session;
  const canEdit = isAdmin || (session?.member?.id === spot.creator_id);
  const claimPending =
    !spot.claimed && session?.member ? await hasPendingClaim({ spotId: spot.id }) : false;

  const link = externalHref(spot.external_link);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: spot.name,
    description: spot.description,
    url: `https://howdyirl.com/${city}/spots/${spot.slug}`,
    ...(spot.image_url && { image: spot.image_url }),
    ...(spot.address && {
      address: { "@type": "PostalAddress", streetAddress: spot.address, addressLocality: "Huntsville", addressRegion: "AL" },
    }),
    ...(spot.external_link && { sameAs: spot.external_link }),
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link className="back" href={`/${city}/spots`}>
        ‹ Back to list
      </Link>

      {isAdmin && <AdminBar type="spot" id={spot.id} status={spot.status} />}

      <div className="detail">
        <div className="detail-top">
          {spot.image_url ? (
            <Image className="hero" src={spot.image_url} alt={spot.name} width={120} height={120} style={{ objectFit: "cover" }} />
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
                  href={`/${city}/spots/${spot.slug}/edit`}
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
                This listing was added by the community. Info may be out of
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
              <Image key={i} src={src} alt={`${spot.name} photo ${i + 1}`} width={120} height={90} style={{ objectFit: "cover", borderRadius: 3, border: "1px solid var(--rule)" }} />
            ))}
          </div>
        )}

        {events.length > 0 && (
          <div className="upcoming">
            <h4>upcoming events at this spot</h4>
            {events.map((e) => (
              <div className="meta" style={{ padding: "3px 0" }} key={e.id}>
                ▸ <Link href={`/${city}/events/${e.slug}`}>{e.name}</Link> — {eventDate(e.starts_at)} ·{" "}
                {eventTime(e.starts_at)}
              </div>
            ))}
          </div>
        )}

        {updates.length > 0 && (
          <div className="upcoming">
            <h4>announcements</h4>
            {updates.map((u) => (
              <div className="update" key={u.id}>
                <div className="update-when">{stamp(u.posted_at)}</div>
                <div className="update-text">{u.body}</div>
              </div>
            ))}
          </div>
        )}

        <div className="actions">
          {/* Membership is hidden while Howdy runs as a pure listing site. */}
          {spot.claimed ? null : (
            loggedIn ? (
              claimPending ? (
                <span style={{ color: "var(--teal)", fontSize: 13, alignSelf: "center" }}>
                  Claim submitted — pending review.
                </span>
              ) : (
                <SpotClaimForm spotId={spot.id} />
              )
            ) : (
              <Link className="btn ghost" href={`/login?next=/${city}/spots/${spot.slug}`}>I run this — Claim it</Link>
            )
          )}
          {loggedIn ? (
            <ReportButton targetType="spot" targetId={spot.id} />
          ) : (
            <Link className="report" href={`/login?next=/${city}/spots/${spot.slug}`}>Report this listing</Link>
          )}
        </div>

        <Comments comments={comments} loggedIn={loggedIn} targetType="spot" targetId={spot.id} sessionHandle={session?.member?.handle} isAdmin={isAdmin} />
      </div>
    </div>
  );
}
