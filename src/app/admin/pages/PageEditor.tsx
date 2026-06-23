"use client";

import { useTransition, useRef } from "react";
import { savePage } from "@/lib/actions";

export default function PageEditor() {
  const [pending, start] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={(fd) => {
        const title = fd.get("title") as string;
        const slug = fd.get("slug") as string;
        const body = fd.get("body") as string;
        const inNav = fd.get("in_nav") === "on";
        if (!title.trim() || !slug.trim()) return;
        start(async () => {
          await savePage(null, title.trim(), slug.trim(), body, inNav);
          formRef.current?.reset();
        });
      }}
    >
      <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
        <input name="title" placeholder="Title" style={{ flex: 1 }} required />
        <input name="slug" placeholder="slug (url-safe)" style={{ width: 160 }} required />
      </div>
      <textarea name="body" rows={6} placeholder="Page body (plain text / HTML)" style={{ width: "100%", marginBottom: 6 }} />
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <label style={{ fontSize: 12 }}>
          <input type="checkbox" name="in_nav" /> Show in nav
        </label>
        <span style={{ flex: 1 }} />
        <button className="btn" type="submit" disabled={pending}
          style={{ width: "auto", fontSize: 11, padding: "4px 12px" }}>
          {pending ? "Creating..." : "Create page"}
        </button>
      </div>
    </form>
  );
}
