"use client";

import { useState, useTransition, useRef } from "react";
import Link from "next/link";
import { getBrowserClient } from "@/lib/supabase/client";
import { updateGroup } from "@/lib/actions";
import type { Tag } from "@/lib/types";

type Existing = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  external_link: string | null;
  link_label: string | null;
  image_url: string | null;
};

export default function GroupForm({ tags, existing }: { tags: Tag[]; existing?: Existing }) {
  const supabase = getBrowserClient();
  const editing = !!existing;
  const [name, setName] = useState(existing?.name ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [externalLink, setExternalLink] = useState(existing?.external_link ?? "");
  const [linkLabel, setLinkLabel] = useState(existing?.link_label ?? "");
  const [selected, setSelected] = useState<string[]>(existing?.tags ?? []);
  const [imageUrl, setImageUrl] = useState<string | null>(existing?.image_url ?? null);
  const [uploading, setUploading] = useState(false);
  const [agreed, setAgreed] = useState(editing);
  const [busy, setBusy] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const toggle = (t: string) =>
    setSelected((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]));

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return setError("Image must be under 2 MB.");
    if (!file.type.startsWith("image/")) return setError("File must be an image.");

    setUploading(true);
    setError(null);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `groups/${existing?.id ?? crypto.randomUUID()}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("howdy").upload(path, file, { upsert: true });
    setUploading(false);

    if (upErr) return setError("Upload failed: " + upErr.message);
    const { data } = supabase.storage.from("howdy").getPublicUrl(path);
    setImageUrl(data.publicUrl);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (name.trim().length < 3) return setError("Give your group a name (at least 3 characters).");
    if (!editing && !agreed) return setError("Please confirm your listing follows the Howdy IRL Rules.");

    if (editing) {
      startTransition(async () => {
        await updateGroup(existing!.id, {
          name, description, tags: selected, external_link: externalLink, link_label: linkLabel, image_url: imageUrl,
        });
        window.location.assign(`/groups/${existing!.id}`);
      });
      return;
    }

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

  const loading = busy || pending || uploading;

  return (
    <form className="form" onSubmit={submit}>
      <h2>{editing ? "Edit group" : "Post a Group"}</h2>

      {editing && (
        <>
          <label>group photo</label>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt=""
                style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 4, border: "1px solid var(--rule)" }}
              />
            ) : (
              <div style={{ width: 80, height: 80, borderRadius: 4, background: "var(--panel-2)", border: "1px solid var(--rule)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "var(--ink-faint)" }}>
                No photo
              </div>
            )}
            <div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display: "none" }} />
              <button type="button" className="btn ghost" style={{ width: "auto", fontSize: 11, padding: "5px 12px" }} onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? "Uploading…" : imageUrl ? "Change photo" : "Upload photo"}
              </button>
              {imageUrl && (
                <button type="button" style={{ background: "none", border: "none", fontSize: 11, color: "var(--ink-faint)", cursor: "pointer", marginLeft: 8 }} onClick={() => setImageUrl(null)}>
                  Remove
                </button>
              )}
              <div className="hint" style={{ marginTop: 4 }}>Max 2 MB. Square or landscape works best.</div>
            </div>
          </div>
        </>
      )}

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

      {!editing && (
        <>
          <div className="hint" style={{ margin: "14px 0", color: "var(--amber)" }}>
            It goes live immediately, unclaimed. Are you the organizer? Claim it after to maintain it.
          </div>

          <label style={{ display: "flex", alignItems: "flex-start", gap: 8, textTransform: "none", letterSpacing: 0, fontSize: 12.5, color: "var(--ink)", cursor: "pointer" }}>
            <input type="checkbox" style={{ width: "auto", marginTop: 2 }} checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
            <span>
              I&apos;ve read the <Link href="/p/rules">Howdy IRL Rules</Link> and this listing follows them.
            </span>
          </label>
        </>
      )}

      {error && <div className="hint" style={{ color: "var(--red)", marginTop: 10 }}>{error}</div>}

      <button className="btn" type="submit" disabled={(!editing && !agreed) || loading} style={{ marginTop: 12, opacity: (!editing && !agreed) || loading ? 0.5 : 1 }}>
        {loading ? (editing ? "saving…" : "posting…") : (editing ? "save changes" : "post group")}
      </button>
    </form>
  );
}
