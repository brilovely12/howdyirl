"use client";

import { useTransition } from "react";
import { setContentStatus } from "@/lib/actions";

export default function ContentActions({
  type,
  id,
  currentStatus,
}: {
  type: "group" | "event" | "spot";
  id: string;
  currentStatus: string;
}) {
  const [pending, start] = useTransition();
  const s = { width: "auto" as const, fontSize: 11, padding: "4px 8px", opacity: pending ? 0.5 : 1 };

  return (
    <div style={{ display: "flex", gap: 4 }}>
      {currentStatus !== "live" && (
        <button className="btn" style={s} disabled={pending}
          onClick={() => start(() => setContentStatus(type, id, "live"))}>
          Restore
        </button>
      )}
      {currentStatus === "live" && (
        <button className="btn ghost" style={{ ...s, color: "var(--amber)" }} disabled={pending}
          onClick={() => start(() => setContentStatus(type, id, "hidden"))}>
          Hide
        </button>
      )}
      {currentStatus !== "removed" && (
        <button className="btn ghost" style={{ ...s, color: "var(--red)" }} disabled={pending}
          onClick={() => start(() => setContentStatus(type, id, "removed"))}>
          Remove
        </button>
      )}
    </div>
  );
}
