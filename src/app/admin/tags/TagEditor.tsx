"use client";

import { useTransition, useRef } from "react";
import { saveTag } from "@/lib/actions";

export default function TagEditor({ nextSort }: { nextSort: number }) {
  const [pending, start] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      style={{ display: "flex", gap: 8, alignItems: "center" }}
      action={(fd) => {
        const name = fd.get("name") as string;
        const sort = Number(fd.get("sort"));
        if (!name.trim()) return;
        start(async () => {
          await saveTag(null, name.trim(), sort);
          formRef.current?.reset();
        });
      }}
    >
      <input name="name" placeholder="Tag name" style={{ flex: 1 }} required />
      <input name="sort" type="number" defaultValue={nextSort} style={{ width: 60 }} required />
      <button className="btn" type="submit" disabled={pending}
        style={{ width: "auto", fontSize: 11, padding: "4px 12px" }}>
        {pending ? "Adding..." : "Add tag"}
      </button>
    </form>
  );
}
