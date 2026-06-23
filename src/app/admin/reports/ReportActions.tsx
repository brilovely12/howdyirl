"use client";

import { useTransition } from "react";
import { resolveReport, resolveReportAndHide } from "@/lib/actions";

export default function ReportActions({
  id,
  targetType,
  targetId,
  targetStatus,
}: {
  id: string;
  targetType: string;
  targetId: string;
  targetStatus: string;
}) {
  const [pending, start] = useTransition();
  const s = { width: "auto" as const, fontSize: 11, padding: "4px 8px", opacity: pending ? 0.5 : 1 };

  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
      {targetStatus === "live" && (
        <button
          className="btn"
          style={{ ...s, background: "var(--red)", borderColor: "var(--red)", color: "#fff" }}
          disabled={pending}
          onClick={() => start(() => resolveReportAndHide(id, targetType, targetId))}
        >
          Hide + resolve
        </button>
      )}
      <button className="btn" style={s} disabled={pending}
        onClick={() => start(() => resolveReport(id, "resolved"))}>
        Resolve
      </button>
      <button className="btn ghost" style={s} disabled={pending}
        onClick={() => start(() => resolveReport(id, "dismissed"))}>
        Dismiss
      </button>
    </div>
  );
}
