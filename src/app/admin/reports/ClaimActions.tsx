"use client";

import { useTransition } from "react";
import { decideClaim, decideSpotClaim } from "@/lib/actions";

export default function ClaimActions({
  id,
  targetType,
  targetId,
}: {
  id: string;
  targetType: "group" | "spot";
  targetId: string;
}) {
  const [pending, start] = useTransition();
  const s = { width: "auto" as const, fontSize: 11, padding: "4px 10px", opacity: pending ? 0.5 : 1 };
  const decide = targetType === "spot" ? decideSpotClaim : decideClaim;

  return (
    <div style={{ display: "flex", gap: 6 }}>
      <button className="btn" style={s} disabled={pending}
        onClick={() => start(() => decide(id, targetId, true))}>
        Approve
      </button>
      <button className="btn ghost" style={s} disabled={pending}
        onClick={() => start(() => decide(id, targetId, false))}>
        Reject
      </button>
    </div>
  );
}
