"use client";

import { useTransition } from "react";
import { resolveReport, decideClaim } from "@/lib/actions";

export default function AdminActions({
  type,
  id,
  groupId,
}: {
  type: "report" | "claim";
  id: string;
  groupId?: string;
}) {
  const [pending, startTransition] = useTransition();

  if (type === "report") {
    return (
      <div style={{ display: "flex", gap: 6 }}>
        <button
          className="btn"
          style={{ width: "auto", fontSize: 11, padding: "4px 10px", opacity: pending ? 0.5 : 1 }}
          disabled={pending}
          onClick={() => startTransition(() => resolveReport(id, "resolved"))}
        >
          Resolve
        </button>
        <button
          className="btn ghost"
          style={{ width: "auto", fontSize: 11, padding: "4px 10px", opacity: pending ? 0.5 : 1 }}
          disabled={pending}
          onClick={() => startTransition(() => resolveReport(id, "dismissed"))}
        >
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 6 }}>
      <button
        className="btn"
        style={{ width: "auto", fontSize: 11, padding: "4px 10px", opacity: pending ? 0.5 : 1 }}
        disabled={pending}
        onClick={() => startTransition(() => decideClaim(id, groupId!, true))}
      >
        Approve
      </button>
      <button
        className="btn ghost"
        style={{ width: "auto", fontSize: 11, padding: "4px 10px", opacity: pending ? 0.5 : 1 }}
        disabled={pending}
        onClick={() => startTransition(() => decideClaim(id, groupId!, false))}
      >
        Reject
      </button>
    </div>
  );
}
