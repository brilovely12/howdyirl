"use client";

import { useTransition, useRef } from "react";
import { saveForumSection } from "@/lib/actions";

export default function ForumSectionEditor({ nextSort }: { nextSort: number }) {
  const [pending, start] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      style={{ display: "flex", flexDirection: "column", gap: 8 }}
      action={(fd) => {
        const slug = (fd.get("slug") as string).trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
        const label = (fd.get("label") as string).trim();
        const description = (fd.get("description") as string).trim();
        const sort = Number(fd.get("sort"));
        if (!slug || !label) return;
        start(async () => {
          await saveForumSection(null, slug, label, description, sort);
          formRef.current?.reset();
        });
      }}
    >
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input name="slug" placeholder="slug" style={{ width: 120 }} required />
        <input name="label" placeholder="Label" style={{ flex: 1 }} required />
        <input name="sort" type="number" defaultValue={nextSort} style={{ width: 60 }} required />
      </div>
      <input name="description" placeholder="Short description" />
      <button className="btn" type="submit" disabled={pending}
        style={{ width: "auto", fontSize: 11, padding: "4px 12px", alignSelf: "flex-start" }}>
        {pending ? "Adding..." : "Add section"}
      </button>
    </form>
  );
}
