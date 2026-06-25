"use client";

import { useState, useTransition } from "react";
import { joinSpot, leaveSpot } from "@/lib/actions";

export default function SaveSpotButton({ spotId, saved }: { spotId: string; saved: boolean }) {
  const [isSaved, setIsSaved] = useState(saved);
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      if (isSaved) {
        await leaveSpot(spotId);
        setIsSaved(false);
      } else {
        await joinSpot(spotId);
        setIsSaved(true);
      }
    });
  }

  return (
    <button className={`btn${isSaved ? " ghost" : ""}`} onClick={toggle} disabled={pending} style={{ opacity: pending ? 0.6 : 1 }}>
      {pending ? "…" : isSaved ? "Saved ✓" : "Save this spot"}
    </button>
  );
}
