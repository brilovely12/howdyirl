"use client";

import { useState, useTransition } from "react";
import { saveForumSection, deleteForumSection } from "@/lib/actions";
import type { AdminForumSection } from "@/lib/admin";

export default function ForumSectionRow({ section }: { section: AdminForumSection }) {
  const [editing, setEditing] = useState(false);
  const [pending, start] = useTransition();
  const s = { width: "auto" as const, fontSize: 11, padding: "4px 8px" };

  if (editing) {
    return (
      <form
        className="row"
        style={{ display: "flex", flexDirection: "column", gap: 8 }}
        action={(fd) => {
          const slug = (fd.get("slug") as string).trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
          const label = (fd.get("label") as string).trim();
          const description = (fd.get("description") as string).trim();
          const sort = Number(fd.get("sort"));
          if (!slug || !label) return;
          start(async () => {
            await saveForumSection(section.id, slug, label, description, sort);
            setEditing(false);
          });
        }}
      >
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input name="slug" defaultValue={section.slug} placeholder="slug" style={{ width: 120 }} required />
          <input name="label" defaultValue={section.label} placeholder="Label" style={{ flex: 1 }} required />
          <input name="sort" type="number" defaultValue={section.sort} style={{ width: 60 }} required />
        </div>
        <input name="description" defaultValue={section.description} placeholder="Short description" style={{ width: "100%" }} />
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" type="submit" disabled={pending} style={s}>Save</button>
          <button className="btn ghost" type="button" style={s} onClick={() => setEditing(false)}>Cancel</button>
        </div>
      </form>
    );
  }

  return (
    <div className="row" style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ flex: 1 }}>
        <span style={{ fontWeight: 600 }}>{section.label}</span>
        <span style={{ fontSize: 12, color: "var(--ink-dim)" }}> /{section.slug}</span>
        <span style={{ fontSize: 12, color: "var(--ink-faint)" }}> (sort: {section.sort})</span>
        {section.description && (
          <div style={{ fontSize: 12, color: "var(--ink-dim)" }}>{section.description}</div>
        )}
      </div>
      <button className="btn ghost" style={s} onClick={() => setEditing(true)}>Edit</button>
      <button
        className="btn ghost"
        style={{ ...s, color: "var(--red)", opacity: pending ? 0.5 : 1 }}
        disabled={pending}
        onClick={() => {
          if (confirm(`Delete "${section.label}"? Threads in this section will be orphaned.`))
            start(() => deleteForumSection(section.id));
        }}
      >
        Delete
      </button>
    </div>
  );
}
