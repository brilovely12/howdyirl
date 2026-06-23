"use client";

import { useState, useTransition } from "react";
import { joinGroup, leaveGroup } from "@/lib/actions";

export default function JoinButton({ groupId, joined }: { groupId: string; joined: boolean }) {
  const [isMember, setIsMember] = useState(joined);
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      if (isMember) {
        await leaveGroup(groupId);
        setIsMember(false);
      } else {
        await joinGroup(groupId);
        setIsMember(true);
      }
    });
  }

  return (
    <button className={`btn${isMember ? " ghost" : ""}`} onClick={toggle} disabled={pending} style={{ opacity: pending ? 0.6 : 1 }}>
      {pending ? "…" : isMember ? "Joined ✓" : "Join this group"}
    </button>
  );
}
