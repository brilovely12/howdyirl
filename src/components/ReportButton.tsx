"use client";

import { useState, useTransition } from "react";
import { submitReport } from "@/lib/actions";

export default function ReportButton({
  targetType,
  targetId,
}: {
  targetType: "group" | "event";
  targetId: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  if (done) return <span className="report" style={{ color: "var(--ink-faint)" }}>Reported — thanks</span>;

  if (!open) {
    return (
      <button className="report" onClick={() => setOpen(true)} style={{ background: "none", border: "none", font: "inherit", cursor: "pointer", padding: 0 }}>
        Report this {targetType === "group" ? "listing" : "event"}
      </button>
    );
  }

  return (
    <div style={{ marginTop: 8 }}>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="What's wrong? (optional)"
        rows={2}
        style={{
          width: "100%",
          maxWidth: 360,
          background: "var(--panel-2)",
          color: "var(--ink)",
          border: "1px solid var(--rule)",
          borderRadius: 3,
          padding: 8,
          font: "inherit",
          fontSize: 12,
          resize: "vertical",
        }}
      />
      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
        <button
          className="btn"
          style={{ width: "auto", fontSize: 12, padding: "6px 12px", opacity: pending ? 0.6 : 1 }}
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              await submitReport(targetType, targetId, reason);
              setDone(true);
            });
          }}
        >
          {pending ? "…" : "Submit report"}
        </button>
        <button
          className="btn ghost"
          style={{ width: "auto", fontSize: 12, padding: "6px 12px" }}
          onClick={() => setOpen(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
