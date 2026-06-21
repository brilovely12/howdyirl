"use client";

import { useState } from "react";
import Link from "next/link";
import { getBrowserClient } from "@/lib/supabase/client";
import type { Tag } from "@/lib/types";

export default function GroupForm({ tags }: { tags: Tag[] }) {
  const supabase = getBrowserClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [externalLink, setExternalLink] = useState("");
  const [linkLabel, setLinkLabel] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (t: string) =>
    setSelected((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (name.trim().length < 3) return setError("Give your group a name (at least 3 characters).");
    if (!agreed) return setError("Please confirm your listing follows the Howdy IRL Rules.");

    setBusy(true);
    const { data, error } = await supabase.rpc("create_group", {
      p_name: name,
      p_description: description,
      p_tags: selected,
      p_external_link: externalLink,
      p_link_label: linkLabel,
    });
    setBusy(false);

    if (error) {
      if (error.message.includes("not_authenticated")) return window.location.assign("/login");
      if (error.message.includes("no_member")) return window.location.assign("/onboarding");
      return setError("Couldn't post your group. Please try again.");
    }
    window.location.assign(`/groups/${data}`);
  }

  return (
    <form className="form" onSubmit={submit}>
      <h2>post a group</h2>

      <label>group name</label>
      <input value={name} required minLength={3} placeholder="e.g. Madison County Beekeepers" onChange={(e) => setName(e.target.value)} />

      <label>description</label>
      <textarea value={description} placeholder="What is it, who's it for, when/where do you meet?" onChange={(e) => setDescription(e.target.value)} />

      <label>
        topics <span style={{ textTransform: "none", color: "var(--ink-faint)" }}>(pick any that fit)</span>
      </label>
      <div>
        {tags.map((t) => (
          <button
            type="button"
            key={t.id}
            className={`chip${selected.includes(t.name) ? " on" : ""}`}
            aria-pressed={selected.includes(t.name)}
            onClick={() => toggle(t.name)}
          >
            {t.name}
          </button>
        ))}
      </div>

      <label>external link (where to learn more)</label>
      <input value={externalLink} placeholder="https://..." onChange={(e) => setExternalLink(e.target.value)} />
      <div className="hint">optional · a website, social page, or signup the listing can point to</div>

      <label>
        link label <span style={{ textTransform: "none", color: "var(--ink-faint)" }}>(optional)</span>
      </label>
      <input value={linkLabel} placeholder="e.g. Join on Strava" onChange={(e) => setLinkLabel(e.target.value)} />

      <div className="hint" style={{ margin: "14px 0", color: "var(--amber)" }}>
        It goes live immediately, unclaimed. Are you the organizer? Claim it after to maintain it.
      </div>

      <label style={{ display: "flex", alignItems: "flex-start", gap: 8, textTransform: "none", letterSpacing: 0, fontSize: 12.5, color: "var(--ink)", cursor: "pointer" }}>
        <input type="checkbox" style={{ width: "auto", marginTop: 2 }} checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
        <span>
          I&apos;ve read the <Link href="/p/rules">Howdy IRL Rules</Link> and this listing follows them.
        </span>
      </label>

      {error && <div className="hint" style={{ color: "var(--red)", marginTop: 10 }}>{error}</div>}

      <button className="btn" type="submit" disabled={!agreed || busy} style={{ marginTop: 12, opacity: !agreed || busy ? 0.5 : 1 }}>
        {busy ? "posting…" : "post group"}
      </button>
    </form>
  );
}
