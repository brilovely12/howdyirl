"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { getBrowserClient } from "@/lib/supabase/client";
import { updateGroup } from "@/lib/actions";
import type { Tag } from "@/lib/types";
import ImagePicker from "./ImagePicker";

type Existing = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  external_link: string | null;
  link_label: string | null;
  image_url: string | null;
  images: string[];
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
  const [images, setImages] = useState<string[]>(existing?.images ?? []);
  const [agreed, setAgreed] = useState(editing);
  const [busy, setBusy] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const toggle = (t: string) =>
    setSelected((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (name.trim().length < 3) return setError("Give your group a name (at least 3 characters).");
    if (!editing && !agreed) return setError("Please confirm your listing follows the Howdy IRL Rules.");

    if (editing) {
      startTransition(async () => {
        await updateGroup(existing!.id, {
          name, description, tags: selected, external_link: externalLink, link_label: linkLabel,
          image_url: imageUrl, images,
        });
        window.location.assign(`/groups/${existing!.id}`);
      });
      return;
    }

    setBusy(true);
    const { data, error: rpcErr } = await supabase.rpc("create_group", {
      p_name: name,
      p_description: description,
      p_tags: selected,
      p_external_link: externalLink,
      p_link_label: linkLabel,
    });
    if (rpcErr) {
      setBusy(false);
      if (rpcErr.message.includes("not_authenticated")) return window.location.assign("/login");
      if (rpcErr.message.includes("no_member")) return window.location.assign("/onboarding");
      return setError("Couldn't post your group. Please try again.");
    }
    if (imageUrl || images.length) {
      await updateGroup(data, {
        name, description, tags: selected, external_link: externalLink, link_label: linkLabel,
        image_url: imageUrl, images,
      });
    }
    setBusy(false);
    window.location.assign(`/groups/${data}`);
  }

  const loading = busy || pending;

  return (
    <form className="form" onSubmit={submit}>
      <h2>{editing ? "Edit group" : "Post a Group"}</h2>

      <ImagePicker
        mainImage={imageUrl}
        onMainChange={setImageUrl}
        gallery={images}
        onGalleryChange={setImages}
        folder="groups"
      />

      <label>group name</label>
      <input value={name} required minLength={3} placeholder="e.g. Madison County Beekeepers" onChange={(e) => setName(e.target.value)} />

      <label>description</label>
      <textarea value={description} placeholder="What is it, who's it for, when/where do you meet?" onChange={(e) => setDescription(e.target.value)} />

      <label>
        tags <span style={{ textTransform: "none", color: "var(--ink-faint)" }}>(pick any that fit)</span>
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

      <label>external link</label>
      <input value={externalLink} placeholder="Official website, Facebook group, etc" onChange={(e) => setExternalLink(e.target.value)} />
      <div className="hint">optional · where people can learn more about this group</div>

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
