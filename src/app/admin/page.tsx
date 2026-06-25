import Link from "next/link";
import { getAdminStats, getRecentActivity } from "@/lib/admin";
import { stamp } from "@/lib/format";
import BroadcastForm from "./BroadcastForm";

export default async function AdminDashboard() {
  const [stats, activity] = await Promise.all([getAdminStats(), getRecentActivity()]);

  return (
    <>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
        {[
          { label: "Members", n: stats.members, href: "/admin/members" },
          { label: "Groups", n: stats.groups, href: "/admin/content" },
          { label: "Events", n: stats.events, href: "/admin/content" },
          { label: "Spots", n: stats.spots, href: "/admin/content" },
          { label: "Comments", n: stats.comments, href: "/admin/comments" },
          { label: "Open reports", n: stats.openReports, href: "/admin/reports", warn: true },
          { label: "Pending claims", n: stats.openClaims, href: "/admin/reports", warn: true },
        ].map((s) => (
          <Link
            key={s.label}
            href={s.href}
            style={{
              background: "var(--panel-2)",
              border: "1px solid var(--rule)",
              borderRadius: 3,
              padding: "10px 16px",
              minWidth: 100,
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div style={{
              fontSize: 22, fontWeight: 700,
              color: (s as any).warn && s.n > 0 ? "var(--amber)" : "var(--ink)",
            }}>
              {s.n}
            </div>
            <div style={{ fontSize: 11, color: "var(--ink-dim)" }}>{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="upcoming" style={{ marginBottom: 24 }}>
        <h4>Broadcast notification</h4>
        <BroadcastForm />
      </div>

      <div className="upcoming">
        <h4>Recent activity</h4>
        {activity.length ? (
          activity.map((a, i) => (
            <div key={i} className="row" style={{ display: "flex", gap: 8, fontSize: 13 }}>
              <span style={{
                width: 60, flexShrink: 0, fontSize: 10, fontWeight: 700,
                color: a.kind === "signup" ? "var(--green)" : a.kind === "comment" ? "var(--blue)" : "var(--ink-dim)",
                textTransform: "uppercase",
              }}>
                {a.kind}
              </span>
              <span style={{ flex: 1 }}>
                {a.href ? <Link href={a.href}>{a.label}</Link> : a.label}
              </span>
              <span className="meta" style={{ flexShrink: 0 }}>{stamp(a.at)}</span>
            </div>
          ))
        ) : (
          <div className="meta">No recent activity</div>
        )}
      </div>
    </>
  );
}
