"use client";

import { useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";
import { normalizeHandle, handleError } from "@/lib/handle";

export default function OnboardingForm({ taken }: { taken?: boolean }) {
  const supabase = getBrowserClient();
  const [handle, setHandle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(
    taken ? "That handle is taken — pick another." : null,
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const msg = handleError(handle);
    if (msg) {
      setError(msg);
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.rpc("ensure_member", {
      p_handle: normalizeHandle(handle),
    });
    setBusy(false);
    if (error) {
      if (error.message.includes("handle_taken")) setError("That handle is taken — pick another.");
      else if (error.message.includes("handle_invalid"))
        setError("Handle must be at least 3 letters, numbers, or underscores.");
      else setError(error.message);
      return;
    }
    // PostgREST serializes a NULL composite as an all-null object, so check id.
    if (data?.id) window.location.assign("/huntsville/groups");
    else setError("Couldn't create your profile. Please try again.");
  }

  return (
    <div className="form" style={{ maxWidth: 420 }}>
      <h2>Pick your handle</h2>
      <div className="hint" style={{ marginBottom: 6 }}>
        One last step — choose the public @name you&apos;ll go by on Howdy.
      </div>
      <form onSubmit={submit}>
        <label>handle</label>
        <input
          value={handle}
          required
          minLength={3}
          maxLength={30}
          autoFocus
          placeholder="e.g. brilovely"
          onChange={(e) => setHandle(e.target.value)}
        />
        <div className="hint">
          {handle.trim() ? (
            <>
              will be <b>@{normalizeHandle(handle)}</b>
            </>
          ) : (
            "letters, numbers, and underscores"
          )}
        </div>
        {error && (
          <div className="hint" style={{ color: "var(--red)", marginTop: 10 }}>
            {error}
          </div>
        )}
        <button className="btn" type="submit" disabled={busy} style={{ marginTop: 14, opacity: busy ? 0.6 : 1 }}>
          {busy ? "…" : "Continue"}
        </button>
      </form>
    </div>
  );
}
