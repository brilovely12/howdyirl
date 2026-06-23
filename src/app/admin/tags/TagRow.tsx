"use client";

import { useState, useTransition } from "react";
import { saveTag, deleteTag } from "@/lib/actions";
import type { AdminTag } from "@/lib/admin";

export default function TagRow({ tag }: { tag: AdminTag }) {
  const [editing, setEditing] = useState(false);
  const [pending, start] = useTransition();
  const s = { width: "auto" as const, fontSize: 11, padding: "4px 8px" };

  if (editing) {
    return (
      <form
        className="row"
        style={{ display: "flex", gap: 8, alignItems: "center" }}
        action={(fd) => {
          const name = fd.get("name") as string;
          const sort = Number(fd.get("sort"));
          start(async () => {
            await saveTag(tag.id, name.trim(), sort);
            setEditing(false);
          });
        }}
      >
        <input name="name" defaultValue={tag.name} style={{ flex: 1 }} required />
        <input name="sort" type="number" defaultValue={tag.sort} style={{ width: 60 }} required />
        <button className="btn" type="submit" disabled={pending} style={s}>Save</button>
        <button className="btn ghost" type="button" style={s} onClick={() => setEditing(false)}>Cancel</button>
      </form>
    );
  }

  return (
    <div className="row" style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ flex: 1 }}>
        <span style={{ fontWeight: 600 }}>{tag.name}</span>
        <span style={{ fontSize: 12, color: "var(--ink-dim)" }}> (sort: {tag.sort})</span>
      </div>
      <button className="btn ghost" style={s} onClick={() => setEditing(true)}>Edit</button>
      <button
        className="btn ghost"
        style={{ ...s, color: "var(--red)", opacity: pending ? 0.5 : 1 }}
        disabled={pending}
        onClick={() => {
          if (confirm(`Delete "${tag.name}"?`)) start(() => deleteTag(tag.id));
        }}
      >
        Delete
      </button>
    </div>
  );
}
