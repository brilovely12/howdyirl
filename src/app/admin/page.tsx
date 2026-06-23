import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { getAdminStats, getReports, getClaims } from "@/lib/admin";
import { stamp } from "@/lib/format";
import AdminActions from "./AdminActions";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getSessionUser();
  if (!session?.member?.is_admin) redirect("/groups");

  const [stats, reports, claims] = await Promise.all([
    getAdminStats(),
    getReports(),
    getClaims(),
  ]);

  const openReports = reports.filter((r) => r.status === "open");
  const closedReports = reports.filter((r) => r.status !== "open");
  const pendingClaims = claims.filter((c) => c.status === "pending");
  const decidedClaims = claims.filter((c) => c.status !== "pending");

  return (
    <div style={{ maxWidth: 700 }}>
      <h1 style={{ fontSize: 22, marginBottom: 16 }}>Admin</h1>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
        {[
          { label: "Members", n: stats.members },
          { label: "Groups", n: stats.groups },
          { label: "Events", n: stats.events },
          { label: "Open reports", n: stats.openReports, warn: true },
          { label: "Pending claims", n: stats.openClaims, warn: true },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "var(--panel-2)",
              border: "1px solid var(--rule)",
              borderRadius: 3,
              padding: "10px 16px",
              minWidth: 110,
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 700, color: s.warn && s.n > 0 ? "var(--amber)" : "var(--ink)" }}>
              {s.n}
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-dim)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="upcoming">
        <h4>Open reports ({openReports.length})</h4>
        {openReports.length ? (
          openReports.map((r) => (
            <div key={r.id} className="row" style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <Link href={`/${r.target_type}s/${r.target_id}`}>{r.target_name}</Link>
                <span style={{ color: "var(--ink-faint)", fontSize: 12 }}> ({r.target_type})</span>
                {r.reason && <div style={{ fontSize: 12, color: "var(--ink-dim)" }}>{r.reason}</div>}
                <div className="meta">
                  by @{r.reported_by} · {stamp(r.created_at)}
                </div>
              </div>
              <AdminActions type="report" id={r.id} />
            </div>
          ))
        ) : (
          <div className="meta">No open reports</div>
        )}
      </div>

      <div className="upcoming">
        <h4>Pending claims ({pendingClaims.length})</h4>
        {pendingClaims.length ? (
          pendingClaims.map((c) => (
            <div key={c.id} className="row" style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <Link href={`/groups/${c.group_id}`}>{c.group_name}</Link>
                {c.note && <div style={{ fontSize: 12, color: "var(--ink-dim)" }}>{c.note}</div>}
                <div className="meta">
                  by @{c.requested_by} · {c.contact_email} · {stamp(c.created_at)}
                </div>
              </div>
              <AdminActions type="claim" id={c.id} groupId={c.group_id} />
            </div>
          ))
        ) : (
          <div className="meta">No pending claims</div>
        )}
      </div>

      {closedReports.length > 0 && (
        <details style={{ marginTop: 16 }}>
          <summary style={{ cursor: "pointer", color: "var(--ink-dim)", fontSize: 13 }}>
            Resolved reports ({closedReports.length})
          </summary>
          {closedReports.map((r) => (
            <div key={r.id} className="meta" style={{ padding: "3px 0" }}>
              {r.target_name} — {r.status} · {stamp(r.created_at)}
            </div>
          ))}
        </details>
      )}

      {decidedClaims.length > 0 && (
        <details style={{ marginTop: 12 }}>
          <summary style={{ cursor: "pointer", color: "var(--ink-dim)", fontSize: 13 }}>
            Decided claims ({decidedClaims.length})
          </summary>
          {decidedClaims.map((c) => (
            <div key={c.id} className="meta" style={{ padding: "3px 0" }}>
              {c.group_name} — {c.status} by @{c.requested_by} · {stamp(c.created_at)}
            </div>
          ))}
        </details>
      )}
    </div>
  );
}
