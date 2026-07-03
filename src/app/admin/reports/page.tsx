import Link from "next/link";
import { getReports, getClaims } from "@/lib/admin";
import { stamp } from "@/lib/format";
import ReportActions from "./ReportActions";
import ClaimActions from "./ClaimActions";

export default async function ReportsPage() {
  const [reports, claims] = await Promise.all([getReports(), getClaims()]);

  const openReports = reports.filter((r) => r.status === "open");
  const closedReports = reports.filter((r) => r.status !== "open");
  const pendingClaims = claims.filter((c) => c.status === "pending");
  const decidedClaims = claims.filter((c) => c.status !== "pending");

  return (
    <>
      <div className="upcoming">
        <h4>Open reports ({openReports.length})</h4>
        {openReports.length ? (
          openReports.map((r) => (
            <div key={r.id} className="row" style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <Link href={`/huntsville/${r.target_type}s/${r.target_id}`}>{r.target_name}</Link>
                <span style={{ color: "var(--ink-faint)", fontSize: 12 }}>
                  {" "}({r.target_type} · {r.target_status})
                </span>
                {r.reason && <div style={{ fontSize: 12, color: "var(--ink-dim)" }}>{r.reason}</div>}
                <div className="meta">by @{r.reported_by} · {stamp(r.created_at)}</div>
              </div>
              <ReportActions
                id={r.id}
                targetType={r.target_type}
                targetId={r.target_id}
                targetStatus={r.target_status ?? "live"}
              />
            </div>
          ))
        ) : (
          <div className="meta">No open reports</div>
        )}
      </div>

      <div className="upcoming" style={{ marginTop: 20 }}>
        <h4>Pending claims ({pendingClaims.length})</h4>
        {pendingClaims.length ? (
          pendingClaims.map((c) => (
            <div key={c.id} className="row" style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <Link href={`/huntsville/groups/${c.group_slug}`}>{c.group_name}</Link>
                {c.note && <div style={{ fontSize: 12, color: "var(--ink-dim)" }}>{c.note}</div>}
                <div className="meta">by @{c.requested_by} · {c.contact_email} · {stamp(c.created_at)}</div>
              </div>
              <ClaimActions id={c.id} groupId={c.group_id} />
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
    </>
  );
}
