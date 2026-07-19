import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getGroupsByCreator } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function MePage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  const { user, member } = session;
  if (!member) redirect("/onboarding");

  // Membership features (joined groups, RSVPs) are hidden while Howdy runs as
  // a pure listing site — this page is just listing management for now.
  const created = await getGroupsByCreator(member.id);

  return (
    <div className="detail" style={{ maxWidth: 560 }}>
      <h1 style={{ fontSize: 24, margin: "0 0 6px" }}>@{member.handle}</h1>
      <div className="meta" style={{ marginBottom: 20 }}>
        {user.email}
        {member.is_admin && " · admin"}
      </div>

      <div className="upcoming">
        <h4>Groups you posted</h4>
        {created.length ? (
          created.map((g) => (
            <div className="meta" style={{ padding: "3px 0" }} key={g.id}>
              ▸ <Link href={`/huntsville/groups/${g.slug}`}>{g.name}</Link>
            </div>
          ))
        ) : (
          <div className="meta">
            None yet — <Link href="/huntsville/groups/new">post a group</Link> or{" "}
            <Link href="/huntsville/spots/new">add a spot</Link>.
          </div>
        )}
      </div>

      <div style={{ marginTop: 24 }}>
        <Link href="/notifications">View notifications</Link>
      </div>
    </div>
  );
}
