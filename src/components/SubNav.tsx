"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Page } from "@/lib/types";
import { VALID_CITIES, DEFAULT_CITY } from "@/lib/cities";

export default function SubNav({
  counts,
  navPages,
}: {
  counts: { groups: number; events: number; spots: number };
  navPages: Page[];
}) {
  const pathname = usePathname();
  const segments = pathname.split("/");
  // Outside a city route (/login, /me, /p/*, …) fall back to the default city.
  const onCityRoute = VALID_CITIES.includes(segments[1]);
  const city = onCityRoute ? segments[1] : DEFAULT_CITY;
  const section = onCityRoute ? segments[2] || "" : "";

  const isGroups = section === "groups";
  const isEvents = section === "events";
  const isSpots = section === "spots";
  const isForums = section === "forums";

  return (
    <nav className="subnav" aria-label="Main sections">
      <div className="subnav-inner">
        <Link href={`/${city}/groups`} className={`tab${isGroups ? " active" : ""}`}>
          Groups <span className="ct">({counts.groups})</span>
        </Link>
        <Link href={`/${city}/events`} className={`tab${isEvents ? " active" : ""}`}>
          Events <span className="ct">({counts.events})</span>
        </Link>
        <Link href={`/${city}/spots`} className={`tab${isSpots ? " active" : ""}`}>
          Spots <span className="ct">({counts.spots})</span>
        </Link>
        <Link href={`/${city}/forums`} className={`tab${isForums ? " active" : ""}`}>
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
    </nav>
  );
}
