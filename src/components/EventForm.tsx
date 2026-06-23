"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { getBrowserClient } from "@/lib/supabase/client";
import { updateEvent } from "@/lib/actions";
import type { Tag } from "@/lib/types";

type Existing = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  starts_at: string;
  external_link: string | null;
  host_group_id: string | null;
};

export default function EventForm({
  tags,
  myGroups,
  myHandle,
  existing,
}: {
  tags: Tag[];
  myGroups: { id: string; name: string }[];
  myHandle: string;
  existing?: Existing;
}) {
  const supabase = getBrowserClient();
  const editing = !!existing;

  const initDate = existing ? existing.starts_at.slice(0, 10) : "";
  const initTime = existing ? existing.starts_at.slice(11, 16) : "";

  const [name, setName] = useState(existing?.name ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [date, setDate] = useState(initDate);
  const [time, setTime] = useState(initTime);
  const [externalLink, setExternalLink] = useState(existing?.external_link ?? "");
  const [hostGroupId, setHostGroupId] = useState(existing?.host_group_id ?? "");
  const [selected, setSelected] = useState<string[]>(existing?.tags ?? []);
  const [agreed, setAgreed] = useState(editing);
  const [busy, setBusy] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const toggle = (t: string) =>
    setSelected((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (name.trim().length < 3) return setError("Give your event a name (at least 3 characters).");
    if (!date || !time) return setError("Pick a date and time for your event.");
    if (!externalLink.trim()) return setError("Add a link where people can learn more or sign up.");
    if (!editing && !agreed) return setError("Please confirm your event follows the Howdy IRL Rules.");

    if (editing) {
      startTransition(async () => {
        await updateEvent(existing!.id, {
          name, description, tags: selected,
          starts_at: `${date}T${time}`,
          external_link: externalLink,
        });
        window.location.assign(`/events/${existing!.id}`);
      });
      return;
    }

    setBusy(true);
    const { data, error } = await supabase.rpc("create_event", {
      p_name: name,
      p_description: description,
      p_tags: selected,
      p_starts_local: `${date}T${time}`,
      p_external_link: externalLink,
      p_host_group_id: hostGroupId || null,
    });
    setBusy(false);

    if (error) {
      if (error.message.includes("not_authenticated")) return window.location.assign("/login");
      if (error.message.includes("no_member")) return window.location.assign("/onboarding");
      if (error.message.includes("not_your_group"))
        return setError("You can only post on behalf of a group you run.");
      return setError("Couldn't post your event. Please try again.");
    }
    window.location.assign(`/events/${data}`);
  }

  const loading = busy || pending;

  return (
    <form className="form" onSubmit={submit}>
      <h2>{editing ? "Edit event" : "Post an Event"}</h2>

      <label>event name</label>
      <input value={name} required minLength={3} placeholder="e.g. Saturday Farmers Market Meetup" onChange={(e) => setName(e.target.value)} />

      <div className="row-2">
        <div>
          <label>date</label>
          <input type="date" value={date} required onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <label>time</label>
          <input type="time" value={time} required onChange={(e) => setTime(e.target.value)} />
        </div>
      </div>

      {!editing && (
        <>
          <label>
            post on behalf of a group <span style={{ textTransform: "none", color: "var(--ink-faint)" }}>(optional)</span>
          </label>
          <select value={hostGroupId} onChange={(e) => setHostGroupId(e.target.value)}>
            <option value="">— just me (@{myHandle}) —</option>
            {myGroups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          <div className="hint">
            Pick a group you run and the event shows as hosted by that group; otherwise your handle @{myHandle} is shown.
          </div>
        </>
      )}

      <label>description</label>
      <textarea value={description} placeholder="What's happening, what to bring, where exactly?" onChange={(e) => setDescription(e.target.value)} />

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
      <input value={externalLink} required placeholder="https://..." onChange={(e) => setExternalLink(e.target.value)} />
      <div className="hint">required — somewhere people can learn more or sign up</div>

      {!editing && (
        <>
          <div className="hint" style={{ margin: "14px 0", color: "var(--amber)" }}>
            In-person events only.
          </div>

          <label style={{ display: "flex", alignItems: "flex-start", gap: 8, textTransform: "none", letterSpacing: 0, fontSize: 12.5, color: "var(--ink)", cursor: "pointer" }}>
            <input type="checkbox" style={{ width: "auto", marginTop: 2 }} checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
            <span>
              I&apos;ve read the <Link href="/p/rules">Howdy IRL Rules</Link> and this event follows them.
            </span>
          </label>
        </>
      )}

      {error && <div className="hint" style={{ color: "var(--red)", marginTop: 10 }}>{error}</div>}

      <button className="btn" type="submit" disabled={(!editing && !agreed) || loading} style={{ marginTop: 12, opacity: (!editing && !agreed) || loading ? 0.5 : 1 }}>
        {loading ? (editing ? "saving…" : "posting…") : (editing ? "save changes" : "post event")}
      </button>
    </form>
  );
}
