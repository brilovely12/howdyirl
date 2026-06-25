"use client";

import { useTransition } from "react";
import { setContentStatus } from "@/lib/actions";

export default function AdminBar({
  type,
  id,
  status,
}: {
  type: "group" | "event" | "thread";
  id: string;
  status: string;
}) {
  const [pending, start] = useTransition();
  const s = { width: "auto" as const, fontSize: 11, padding: "4px 10px", opacity: pending ? 0.5 : 1 };

  return (
    <div style={{
      display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap",
      padding: "8px 12px", marginBottom: 12,
      background: "var(--panel-2)", border: "1px solid var(--rule)", borderRadius: 3,
      fontSize: 12,
    }}>
      <span style={{ fontWeight: 700, color: "var(--red)", marginRight: 4 }}>Admin</span>
      <span style={{ color: "var(--ink-dim)" }}>
        Status: <b style={{ color: status === "live" ? "var(--green)" : "var(--amber)" }}>{status}</b>
      </span>
      <span style={{ flex: 1 }} />
      {status !== "live" && (
        <button className="btn" style={s} disabled={pending}
          onClick={() => start(() => setContentStatus(type, id, "live"))}>
          Restore to live
        </button>
      )}
      {status === "live" && (
        <button className="btn ghost" style={{ ...s, color: "var(--amber)" }} disabled={pending}
          onClick={() => start(() => setContentStatus(type, id, "hidden"))}>
          Hide
        </button>
      )}
      {status !== "removed" && (
        <button className="btn ghost" style={{ ...s, color: "var(--red)" }} disabled={pending}
          onClick={() => start(() => setContentStatus(type, id, "removed"))}>
          Remove
        </button>
      )}
    </div>
  );
}
