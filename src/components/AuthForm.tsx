"use client";

import { useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";
import { normalizeHandle, handleError } from "@/lib/handle";

type Mode = "login" | "signup";

export default function AuthForm({ next = "/huntsville/groups" }: { next?: string }) {
  const supabase = getBrowserClient();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [handle, setHandle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Provision the member, then hard-navigate so the shared layout (Header)
  // re-renders server-side with the new session. Routes to /onboarding when no
  // handle is available yet (e.g. a chosen handle was taken).
  async function provisionThenGo(preferredHandle?: string) {
    const { data, error } = await supabase.rpc("ensure_member", {
      p_handle: preferredHandle ?? null,
    });
    if (error) {
      if (error.message.includes("handle_taken")) {
        window.location.assign("/onboarding?taken=1");
        return;
      }
      if (error.message.includes("handle_invalid")) {
        setError("Handle must be at least 3 letters, numbers, or underscores.");
        return;
      }
      setError(error.message);
      return;
    }
    // PostgREST serializes a NULL composite as an all-null object, so check id.
    if (!data?.id) {
      window.location.assign("/onboarding");
      return;
    }
    window.location.assign(next);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (mode === "signup") {
      const msg = handleError(handle);
      if (msg) {
        setError(msg);
        return;
      }
    }

    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await provisionThenGo();
      } else {
        const clean = normalizeHandle(handle);
        // Persist the handle to user metadata so it survives email confirmation
        // and is applied when the user first logs in.
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { handle: clean } },
        });
        if (error) throw error;
        if (data.session) {
          await provisionThenGo(clean);
        } else {
          setNotice("Check your email to confirm your account, then log in.");
          setMode("login");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function oauth(provider: "google" | "apple") {
    setError(null);
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } });
    if (error) setError(error.message);
  }

  return (
    <div className="form" style={{ maxWidth: 420 }}>
      <h2>{mode === "login" ? "Log In to Howdy" : "Join Howdy IRL"}</h2>

      <div
        style={{
          background: "var(--panel-2)",
          border: "1px solid var(--rule)",
          borderLeft: "3px solid var(--teal)",
          borderRadius: 3,
          padding: "9px 12px",
          margin: "0 0 14px",
          fontSize: 12.5,
          color: "var(--ink-dim)",
          lineHeight: 1.5,
        }}
      >
        One account for both sites. You log in to Howdy and{" "}
        <a href="https://www.boopem.com" target="_blank" rel="noopener">
          <span className="hw" style={{ fontSize: 13 }}>boopem</span>
        </a>{" "}
        the same way — use the email, Google, or Apple you already use on either.
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 6 }}>
        <button type="button" className={`btn ${mode === "login" ? "" : "ghost"}`} style={{ width: "auto" }} onClick={() => setMode("login")}>
          Log in
        </button>
        <button type="button" className={`btn ${mode === "signup" ? "" : "ghost"}`} style={{ width: "auto" }} onClick={() => setMode("signup")}>
          Sign up
        </button>
      </div>

      <form onSubmit={onSubmit}>
        <label>email</label>
        <input type="email" value={email} required autoComplete="email" onChange={(e) => setEmail(e.target.value)} />
        <label>password</label>
        <input
          type="password"
          value={password}
          required
          minLength={6}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          onChange={(e) => setPassword(e.target.value)}
        />
        {mode === "signup" && (
          <>
            <label>handle</label>
            <input
              value={handle}
              required
              minLength={3}
              maxLength={30}
              placeholder="e.g. brilovely"
              onChange={(e) => setHandle(e.target.value)}
            />
            <div className="hint">
              your public @name on Howdy{handle.trim() ? <> — will be <b>@{normalizeHandle(handle)}</b></> : ""}.
              letters, numbers, and underscores.
            </div>
          </>
        )}

        {error && <div className="hint" style={{ color: "var(--red)", marginTop: 10 }}>{error}</div>}
        {notice && <div className="hint" style={{ color: "var(--teal)", marginTop: 10 }}>{notice}</div>}

        <button className="btn" type="submit" disabled={busy} style={{ marginTop: 14, opacity: busy ? 0.6 : 1 }}>
          {busy ? "…" : mode === "login" ? "Log in" : "Create account"}
        </button>
      </form>

      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0", color: "var(--ink-faint)" }}>
        <div style={{ flex: 1, height: 1, background: "var(--rule)" }} />
        or
        <div style={{ flex: 1, height: 1, background: "var(--rule)" }} />
      </div>

      <button type="button" className="btn ghost" onClick={() => oauth("google")} style={{ marginBottom: 8 }}>
        Continue with Google
      </button>
      <button type="button" className="btn ghost" onClick={() => oauth("apple")}>
        Continue with Apple
      </button>

      <div className="hint" style={{ marginTop: 14 }}>
        By continuing you agree to the <a href="/p/terms">Terms</a> and{" "}
        <a href="/p/privacy">Privacy Policy</a>.
      </div>
    </div>
  );
}
