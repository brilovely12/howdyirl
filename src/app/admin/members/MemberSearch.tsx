"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";

export default function MemberSearch({ initial }: { initial: string }) {
  const router = useRouter();
  const ref = useRef<HTMLInputElement>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const q = ref.current?.value.trim();
        router.push(q ? `/admin/members?q=${encodeURIComponent(q)}` : "/admin/members");
      }}
      style={{ display: "flex", gap: 8 }}
    >
      <input ref={ref} name="q" defaultValue={initial} placeholder="Search by handle or email..." style={{ flex: 1 }} />
      <button className="btn" type="submit" style={{ width: "auto", padding: "6px 16px" }}>Search</button>
    </form>
  );
}
