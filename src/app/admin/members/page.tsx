import { getMembers } from "@/lib/admin";
import { stamp } from "@/lib/format";
import MemberActions from "./MemberActions";
import MemberSearch from "./MemberSearch";

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const members = await getMembers(sp.q);

  return (
    <>
      <MemberSearch initial={sp.q ?? ""} />
      <div className="upcoming" style={{ marginTop: 12 }}>
        <h4>Members ({members.length})</h4>
        {members.map((m) => (
          <div key={m.id} className="row" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 600 }}>@{m.handle}</span>
              {m.email && <span style={{ fontSize: 12, color: "var(--ink-dim)" }}> · {m.email}</span>}
              {m.is_admin && (
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "1px 5px", borderRadius: 3, marginLeft: 6,
                  background: "var(--blue)", color: "#fff",
                }}>
                  admin
                </span>
              )}
              {m.banned && (
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "1px 5px", borderRadius: 3, marginLeft: 6,
                  background: "var(--red)", color: "#fff",
                }}>
                  banned
                </span>
              )}
              <div className="meta">joined {stamp(m.joined_at)}</div>
            </div>
            <MemberActions id={m.id} banned={m.banned} isAdmin={m.is_admin} />
          </div>
        ))}
      </div>
    </>
  );
}
