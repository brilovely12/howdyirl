"use client";

import { useTransition } from "react";
import { toggleBan, toggleAdmin } from "@/lib/actions";

export default function MemberActions({
  id,
  banned,
  isAdmin,
}: {
  id: string;
  banned: boolean;
  isAdmin: boolean;
}) {
  const [pending, start] = useTransition();
  const s = { width: "auto" as const, fontSize: 11, padding: "4px 8px", opacity: pending ? 0.5 : 1 };

  return (
    <div style={{ display: "flex", gap: 4 }}>
      <button className="btn ghost" style={s} disabled={pending}
        onClick={() => start(() => toggleAdmin(id, !isAdmin))}>
        {isAdmin ? "Revoke admin" : "Make admin"}
      </button>
      <button
        className="btn ghost"
        style={{ ...s, color: banned ? "var(--green)" : "var(--red)" }}
        disabled={pending}
        onClick={() => start(() => toggleBan(id, !banned))}
      >
        {banned ? "Unban" : "Ban"}
      </button>
    </div>
  );
}
