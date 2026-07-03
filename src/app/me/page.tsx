import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getMyGroups, getMyRsvps, getGroupsByCreator } from "@/lib/data";
import { eventDate, eventTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function MePage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  const { user, member } = session;
  if (!member) redirect("/onboarding");

  const [myGroups, myRsvps, created] = await Promise.all([
    getMyGroups(member.id),
    getMyRsvps(member.id),
    getGroupsByCreator(member.id),
  ]);

  return (
    <div className="detail" style={{ maxWidth: 560 }}>
      <h1 style={{ fontSize: 24, margin: "0 0 6px" }}>@{member.handle}</h1>
      <div className="meta" style={{ marginBottom: 20 }}>
        {user.email}
        {member.is_admin && " · admin"}
      </div>

      <div className="upcoming">
        <h4>Groups you've joined</h4>
        {myGroups.length ? (
          myGroups.map((g) => (
            <div className="meta" style={{ padding: "3px 0" }} key={g.id}>
              ▸ <Link href={`/huntsville/groups/${g.slug}`}>{g.name}</Link>
            </div>
          ))
        ) : (
          <div className="meta">None yet — browse <Link href="/huntsville/groups">groups</Link> and join one.</div>
        )}
      </div>

      <div className="upcoming">
        <h4>Your RSVPs</h4>
        {myRsvps.length ? (
          myRsvps.map((e) => (
            <div className="meta" style={{ padding: "3px 0" }} key={e.id}>
              ▸ <Link href={`/huntsville/events/${e.slug}`}>{e.name}</Link> — {eventDate(e.starts_at)} · {eventTime(e.starts_at)}
            </div>
          ))
        ) : (
          <div className="meta">No RSVPs — check out <Link href="/huntsville/events">upcoming events</Link>.</div>
        )}
      </div>

      {created.length > 0 && (
        <div className="upcoming">
          <h4>Groups you posted</h4>
          {created.map((g) => (
            <div className="meta" style={{ padding: "3px 0" }} key={g.id}>
              ▸ <Link href={`/huntsville/groups/${g.slug}`}>{g.name}</Link>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <Link href="/notifications">View notifications</Link>
      </div>
    </div>
  );
}
