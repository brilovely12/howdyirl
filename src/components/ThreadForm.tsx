"use client";

import { useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";

export default function ThreadForm({ section }: { section: string }) {
  const supabase = getBrowserClient();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (title.trim().length < 3) return setError("Give your thread a title (at least 3 characters).");

    setBusy(true);
    const { data, error: rpcErr } = await supabase.rpc("create_thread", {
      p_section: section,
      p_title: title,
      p_body: body,
    });
    if (rpcErr) {
      setBusy(false);
      if (rpcErr.message.includes("not_authenticated")) return window.location.assign("/login");
      if (rpcErr.message.includes("no_member")) return window.location.assign("/onboarding");
      return setError("Couldn't post your thread. Please try again.");
    }
    window.location.assign(`/forums/${section}/${data}`);
  }

  return (
    <form className="form" onSubmit={submit}>
      <h2>New thread</h2>

      <label>title</label>
      <input value={title} required minLength={3} placeholder="What's on your mind?" onChange={(e) => setTitle(e.target.value)} />

      <label>body <span style={{ textTransform: "none", color: "var(--ink-faint)" }}>(optional)</span></label>
      <textarea value={body} placeholder="Share more details…" rows={6} onChange={(e) => setBody(e.target.value)} />

      {error && <div className="hint" style={{ color: "var(--red)", marginTop: 10 }}>{error}</div>}

      <button className="btn" type="submit" disabled={busy} style={{ marginTop: 12, opacity: busy ? 0.5 : 1 }}>
        {busy ? "posting…" : "post thread"}
      </button>
    </form>
  );
}
