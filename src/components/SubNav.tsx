"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Page } from "@/lib/types";

export default function SubNav({
  counts,
  navPages,
}: {
  counts: { groups: number; events: number; spots: number };
  navPages: Page[];
}) {
  const pathname = usePathname();
  const isGroups = pathname === "/groups" || pathname.startsWith("/groups/");
  const isEvents = pathname === "/events" || pathname.startsWith("/events/");
  const isSpots = pathname === "/spots" || pathname.startsWith("/spots/");
  const isForums = pathname === "/forums" || pathname.startsWith("/forums/");

  return (
    <div className="subnav">
      <div className="subnav-inner">
        <Link href="/groups" className={`tab${isGroups ? " active" : ""}`}>
          Groups <span className="ct">({counts.groups})</span>
        </Link>
        <Link href="/events" className={`tab${isEvents ? " active" : ""}`}>
          Events <span className="ct">({counts.events})</span>
        </Link>
        <Link href="/spots" className={`tab${isSpots ? " active" : ""}`}>
          Spots <span className="ct">({counts.spots})</span>
        </Link>
        <Link href="/forums" className={`tab${isForums ? " active" : ""}`}>
          Forums
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
