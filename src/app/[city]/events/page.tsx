import type { Metadata } from "next";
import Link from "next/link";
import { searchEvents, listTags, PAGE_SIZE } from "@/lib/data";
import { getSessionUser } from "@/lib/auth";
import SearchBox from "@/components/SearchBox";

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city } = await params;
  return {
    title: "Events",
    description: "Find upcoming in-person events in Huntsville, AL. Meetups, classes, socials, and more on Howdy IRL.",
    alternates: { canonical: `/${city}/events` },
  };
}
import TagChips from "@/components/TagChips";
import FilterToggle from "@/components/FilterToggle";
import EventRow from "@/components/EventRow";
import Pager from "@/components/Pager";

export const dynamic = "force-dynamic";

type SP = { q?: string; tag?: string; page?: string; when?: string };

const WHEN_OPTIONS = [
  { value: "", label: "All upcoming" },
  { value: "week", label: "This week" },
  { value: "weekend", label: "This weekend" },
  { value: "month", label: "This month" },
] as const;

export default async function EventsPage({
  params,
  searchParams,
}: {
  params: Promise<{ city: string }>;
  searchParams: Promise<SP>;
}) {
  const { city } = await params;
  const sp = await searchParams;
  const q = sp.q?.trim() || undefined;
  const activeTags = sp.tag ? sp.tag.split(",").filter(Boolean) : [];
  const when = sp.when || undefined;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const [{ rows, total }, tags, session] = await Promise.all([
    searchEvents({ q, tags: activeTags.length ? activeTags : undefined, when, page }),
    listTags(),
    getSessionUser(),
  ]);
  const postHref = session ? `/${city}/events/new` : "/login";

  const emptyMsg = q
    ? `No events match "${q}".`
    : activeTags.length || when
      ? "No events match those filters yet."
      : "No upcoming events yet — be the first to post one.";

  const whenHref = (w: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (sp.tag) params.set("tag", sp.tag);
    if (w) params.set("when", w);
    const qs = params.toString();
    return qs ? `/${city}/events?${qs}` : `/${city}/events`;
  };

  return (
    <div className="layout">
      <aside className="side">
        <h4>when</h4>
        <ul>
          {WHEN_OPTIONS.map((o) => (
            <li key={o.value}>
              <Link href={whenHref(o.value)} className={(when ?? "") === o.value ? "on" : ""}>
                {o.label}
              </Link>
            </li>
          ))}
        </ul>
        <h4>tags</h4>
        <TagChips basePath={`/${city}/events`} tags={tags} activeTags={activeTags} q={q} />
        <a className="btn post" href={postHref}>
          + Post an Event
        </a>
      </aside>

      <section>
        <SearchBox placeholder="Search events…" />
        <div className="listhead">
          <h1>upcoming events</h1>
          <FilterToggle activeCount={activeTags.length}>
            <TagChips basePath={`/${city}/events`} tags={tags} activeTags={activeTags} q={q} />
          </FilterToggle>
          <span className="sort">
            <svg className="sort-icon" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 3v10M4 13l-2.5-3M4 13l2.5-3M12 13V3M12 3l-2.5 3M12 3l2.5 3" /></svg>
            <span className="sort-label">Sort: Soonest ▾</span>
          </span>
        </div>

        {rows.length ? (
          rows.map((e, i) => <EventRow key={e.id} event={e} index={(page - 1) * PAGE_SIZE + i} city={city} />)
        ) : (
          <div className="empty">{emptyMsg}</div>
        )}

        <Pager basePath={`/${city}/events`} page={page} total={total} pageSize={PAGE_SIZE} q={q} tag={sp.tag} />
      </section>
    </div>
  );
}
