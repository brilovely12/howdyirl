"use client";

import { useState, useTransition } from "react";
import { deletePage, savePage } from "@/lib/actions";
import type { AdminPage } from "@/lib/admin";

export default function PageRow({ page }: { page: AdminPage }) {
  const [editing, setEditing] = useState(false);
  const [pending, start] = useTransition();

  if (editing) {
    return (
      <form
        className="row"
        style={{ padding: 10 }}
        action={(fd) => {
          const title = fd.get("title") as string;
          const slug = fd.get("slug") as string;
          const body = fd.get("body") as string;
          const inNav = fd.get("in_nav") === "on";
          start(async () => {
            await savePage(page.id, title, slug, body, inNav);
            setEditing(false);
          });
        }}
      >
        <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
          <input name="title" defaultValue={page.title} placeholder="Title" style={{ flex: 1 }} required />
          <input name="slug" defaultValue={page.slug} placeholder="slug" style={{ width: 140 }} required />
        </div>
        <textarea name="body" defaultValue={page.body} rows={6} style={{ width: "100%", marginBottom: 6 }} />
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <label style={{ fontSize: 12 }}>
            <input type="checkbox" name="in_nav" defaultChecked={page.in_nav} /> Show in nav
          </label>
          <span style={{ flex: 1 }} />
          <button className="btn ghost" type="button" style={{ width: "auto", fontSize: 11, padding: "4px 10px" }}
            onClick={() => setEditing(false)}>
            Cancel
          </button>
          <button className="btn" type="submit" disabled={pending}
            style={{ width: "auto", fontSize: 11, padding: "4px 10px" }}>
            {pending ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="row" style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ flex: 1 }}>
        <span style={{ fontWeight: 600 }}>{page.title}</span>
        <span style={{ fontSize: 12, color: "var(--ink-dim)" }}> /p/{page.slug}</span>
        {page.in_nav && <span style={{ fontSize: 10, color: "var(--blue)", marginLeft: 6 }}>nav</span>}
        {page.is_rules && <span style={{ fontSize: 10, color: "var(--amber)", marginLeft: 6 }}>rules</span>}
      </div>
      <button className="btn ghost" style={{ width: "auto", fontSize: 11, padding: "4px 8px" }}
        onClick={() => setEditing(true)}>
        Edit
      </button>
      <button
        className="btn ghost"
        style={{ width: "auto", fontSize: 11, padding: "4px 8px", color: "var(--red)", opacity: pending ? 0.5 : 1 }}
        disabled={pending}
        onClick={() => {
          if (confirm("Delete this page?")) start(() => deletePage(page.id));
        }}
      >
        Delete
      </button>
    </div>
  );
}
