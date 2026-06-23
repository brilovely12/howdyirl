"use client";

import { useTransition } from "react";
import { decideClaim } from "@/lib/actions";

export default function ClaimActions({ id, groupId }: { id: string; groupId: string }) {
  const [pending, start] = useTransition();
  const s = { width: "auto" as const, fontSize: 11, padding: "4px 10px", opacity: pending ? 0.5 : 1 };

  return (
    <div style={{ display: "flex", gap: 6 }}>
      <button className="btn" style={s} disabled={pending}
        onClick={() => start(() => decideClaim(id, groupId, true))}>
        Approve
      </button>
      <button className="btn ghost" style={s} disabled={pending}
        onClick={() => start(() => decideClaim(id, groupId, false))}>
        Reject
      </button>
    </div>
  );
}
