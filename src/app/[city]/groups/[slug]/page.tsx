import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getGroup, getGroupUpdates, getGroupEvents, getComments, hasPendingClaim } from "@/lib/data";
import { getSessionUser } from "@/lib/auth";
import { color, initials, eventDate, eventTime, stamp } from "@/lib/format";
import { externalHref } from "@/lib/url";
import CheckBadge from "@/components/CheckBadge";
import Comments from "@/components/Comments";
import ClaimForm from "@/components/ClaimForm";
import ReportButton from "@/components/ReportButton";
import AdminBar from "@/components/AdminBar";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ city: string; slug: string }> }): Promise<Metadata> {
  const { city, slug } = await params;
  const group = await getGroup(slug);
  if (!group) return {};
  const desc = group.description?.slice(0, 160) || `${group.name} — a local group on Howdy IRL`;
  return {
    title: group.name,
    description: desc,
    alternates: { canonical: `/${city}/groups/${group.slug}` },
    openGraph: {
      title: group.name,
      description: desc,
      type: "website",
      url: `/${city}/groups/${group.slug}`,
      ...(group.image_url && { images: [{ url: group.image_url, alt: group.name }] }),
    },
    twitter: {
      card: group.image_url ? "summary_large_image" : "summary",
      title: group.name,
      description: desc,
      ...(group.image_url && { images: [group.image_url] }),
    },
  };
}

export default async function GroupDetail({ params }: { params: Promise<{ city: string; slug: string }> }) {
  const { city, slug } = await params;
  const session = await getSessionUser();
  const isAdmin = !!session?.member?.is_admin;
  const group = await getGroup(slug, isAdmin);
  if (!group) notFound();

  const [updates, events, comments] = await Promise.all([
    getGroupUpdates(group.id),
    getGroupEvents(group.id),
    getComments("group", group.id),
  ]);
  const loggedIn = !!session;
  const canEdit = isAdmin || (session?.member?.id === group.creator_id);
  const claimPending =
    !group.claimed && session?.member ? await hasPendingClaim({ groupId: group.id }) : false;

  const link = externalHref(group.external_link);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: group.name,
    description: group.description,
    url: `https://howdyirl.com/${city}/groups/${group.slug}`,
    ...(group.image_url && { image: group.image_url }),
    address: { "@type": "PostalAddress", addressLocality: "Huntsville", addressRegion: "AL" },
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link className="back" href={`/${city}/groups`}>
        ‹ Back to list
      </Link>

      {isAdmin && <AdminBar type="group" id={group.id} status={group.status} />}

      <div className="detail">
        <div className="detail-top">
          {group.image_url ? (
            <Image className="hero" src={group.image_url} alt={group.name} width={120} height={120} style={{ objectFit: "cover" }} />
          ) : (
            <div className="hero" style={{ background: color(initials(group.name).length + group.name.length) }}>
              {initials(group.name)}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 240 }}>
            <h1>
              {group.name}
              {group.claimed && <CheckBadge />}
              {canEdit && (
                <Link
                  href={`/${city}/groups/${group.slug}/edit`}
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

        {group.images?.length > 0 && (
          <div className="gallery">
            {group.images.map((src, i) => (
              <Image key={i} src={src} alt={`${group.name} photo ${i + 1}`} width={120} height={90} style={{ objectFit: "cover", borderRadius: 3, border: "1px solid var(--rule)" }} />
            ))}
          </div>
        )}

        {events.length > 0 && (
          <div className="upcoming">
            <h4>upcoming events from this group</h4>
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
            <h4>updates &amp; announcements</h4>
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
          {group.claimed ? null : (
            loggedIn ? (
              claimPending ? (
                <span style={{ color: "var(--teal)", fontSize: 13, alignSelf: "center" }}>
                  Claim submitted — pending review.
                </span>
              ) : (
                <ClaimForm groupId={group.id} />
              )
            ) : (
              <Link className="btn ghost" href={`/login?next=/${city}/groups/${group.slug}`}>I run this — Claim it</Link>
            )
          )}
          {loggedIn ? (
            <ReportButton targetType="group" targetId={group.id} />
          ) : (
            <Link className="report" href={`/login?next=/${city}/groups/${group.slug}`}>Report this listing</Link>
          )}
        </div>

        <Comments comments={comments} loggedIn={loggedIn} targetType="group" targetId={group.id} sessionHandle={session?.member?.handle} isAdmin={isAdmin} />
      </div>
    </div>
  );
}
