"use client";

import { useTransition, useRef } from "react";
import { broadcastNotification } from "@/lib/actions";

export default function BroadcastForm() {
  const [pending, start] = useTransition();
  const ref = useRef<HTMLTextAreaElement>(null);

  return (
    <form
      style={{ display: "flex", gap: 8, alignItems: "flex-end" }}
      action={(fd) => {
        const body = fd.get("body") as string;
        if (!body.trim()) return;
        start(async () => {
          await broadcastNotification(body);
          if (ref.current) ref.current.value = "";
        });
      }}
    >
      <textarea
        ref={ref}
        name="body"
        rows={2}
        placeholder="Send a notification to all members..."
        style={{ flex: 1, resize: "vertical" }}
      />
      <button className="btn" type="submit" disabled={pending} style={{ width: "auto", padding: "6px 16px" }}>
        {pending ? "Sending..." : "Broadcast"}
      </button>
    </form>
  );
}
