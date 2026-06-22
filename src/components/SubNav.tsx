"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Page } from "@/lib/types";

export default function SubNav({
  counts,
  navPages,
}: {
  counts: { groups: number; events: number };
  navPages: Page[];
}) {
  const pathname = usePathname();
  const isGroups = pathname === "/groups" || pathname.startsWith("/groups/");
  const isEvents = pathname === "/events" || pathname.startsWith("/events/");

  return (
    <div className="subnav">
      <div className="subnav-inner">
        <Link href="/groups" className={`tab${isGroups ? " active" : ""}`}>
          Groups <span className="ct">({counts.groups})</span>
        </Link>
        <Link href="/events" className={`tab${isEvents ? " active" : ""}`}>
          Events <span className="ct">({counts.events})</span>
        </Link>
        {navPages.map((p) => (
          <Link
            key={p.id}
            href={`/p/${p.slug}`}
            className={`tab${pathname === `/p/${p.slug}` ? " active" : ""}`}
          >
            {p.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
