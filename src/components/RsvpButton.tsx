"use client";

import { useState, useTransition } from "react";
import { rsvpEvent, cancelRsvp } from "@/lib/actions";

export default function RsvpButton({ eventId, rsvped }: { eventId: string; rsvped: boolean }) {
  const [going, setGoing] = useState(rsvped);
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      if (going) {
        await cancelRsvp(eventId);
        setGoing(false);
      } else {
        await rsvpEvent(eventId);
        setGoing(true);
      }
    });
  }

  return (
    <button className={`btn${going ? " ghost" : ""}`} onClick={toggle} disabled={pending} style={{ opacity: pending ? 0.6 : 1 }}>
      {pending ? "…" : going ? "Going ✓" : "RSVP"}
    </button>
  );
}
