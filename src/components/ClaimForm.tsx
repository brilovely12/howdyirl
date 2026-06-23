"use client";

import { useState, useTransition } from "react";
import { submitClaim } from "@/lib/actions";

export default function ClaimForm({ groupId }: { groupId: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  if (done) {
    return <span style={{ color: "var(--teal)", fontSize: 13 }}>Claim submitted — we'll review it shortly.</span>;
  }

  if (!open) {
    return (
      <button className="btn ghost" onClick={() => setOpen(true)}>
        I run this — Claim it
      </button>
    );
  }

  return (
    <div style={{ border: "1px solid var(--rule)", borderRadius: 3, padding: 14, marginTop: 4 }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Claim this group</div>
      <label style={{ fontSize: 12, color: "var(--ink-dim)" }}>Your contact email</label>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        required
        placeholder="you@example.com"
        style={{
          width: "100%",
          background: "var(--panel-2)",
          color: "var(--ink)",
          border: "1px solid var(--rule)",
          borderRadius: 3,
          padding: 8,
          font: "inherit",
          marginBottom: 8,
        }}
      />
      <label style={{ fontSize: 12, color: "var(--ink-dim)" }}>How are you connected to this group? (optional)</label>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        placeholder="e.g. I'm the founder"
        style={{
          width: "100%",
          background: "var(--panel-2)",
          color: "var(--ink)",
          border: "1px solid var(--rule)",
          borderRadius: 3,
          padding: 8,
          font: "inherit",
          resize: "vertical",
        }}
      />
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button
          className="btn"
          style={{ width: "auto", opacity: pending ? 0.6 : 1 }}
          disabled={pending || !email.trim()}
          onClick={() => {
            startTransition(async () => {
              await submitClaim(groupId, email, note);
              setDone(true);
            });
          }}
        >
          {pending ? "…" : "Submit claim"}
        </button>
        <button className="btn ghost" style={{ width: "auto" }} onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </div>
  );
}
