import type { Metadata } from "next";
import { searchSpots, listSpotTags, PAGE_SIZE } from "@/lib/data";
import { getSessionUser } from "@/lib/auth";
import SearchBox from "@/components/SearchBox";

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city } = await params;
  return {
    title: "Spots",
    description: "Explore local spots and businesses in Huntsville, AL. Coffee, food, outdoors, and more on Howdy IRL.",
    alternates: { canonical: `/${city}/spots` },
  };
}
import TagChips from "@/components/TagChips";
import FilterToggle from "@/components/FilterToggle";
import SpotRow from "@/components/SpotRow";
import Pager from "@/components/Pager";
import SortSelect from "@/components/SortSelect";

export const dynamic = "force-dynamic";

type SP = { q?: string; tag?: string; page?: string; sort?: string };

export default async function SpotsPage({
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
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const sort = sp.sort === "new" ? ("new" as const) : ("updated" as const);

  const [{ rows, total }, tags, session] = await Promise.all([
    searchSpots({ q, tags: activeTags.length ? activeTags : undefined, page, sort }),
    listSpotTags(),
    getSessionUser(),
  ]);
  const postHref = session ? `/${city}/spots/new` : "/login";

  const emptyMsg = q
    ? `No spots match "${q}".`
    : activeTags.length
      ? "No spots with that tag yet."
      : "No spots yet — be the first to add one.";

  return (
    <div className="layout">
      <aside className="side">
        <a className="btn post" href={postHref} style={{ marginBottom: 18 }}>
          + Add a Spot
        </a>
        <h4>tags</h4>
        <TagChips basePath={`/${city}/spots`} tags={tags} activeTags={activeTags} q={q} />
      </aside>

      <section>
        <div className="searchrow">
          <SearchBox placeholder="Search spots…" />
          <a className="btn post" href={postHref}>+ Add a Spot</a>
        </div>
        <div className="listhead">
          <h1>local spots</h1>
          <FilterToggle activeCount={activeTags.length}>
            <TagChips basePath={`/${city}/spots`} tags={tags} activeTags={activeTags} q={q} />
          </FilterToggle>
          <SortSelect />
        </div>

        {rows.length ? (
          rows.map((s, i) => <SpotRow key={s.id} spot={s} index={(page - 1) * PAGE_SIZE + i} city={city} />)
        ) : (
          <div className="empty">{emptyMsg}</div>
        )}

        <Pager basePath={`/${city}/spots`} page={page} total={total} pageSize={PAGE_SIZE} q={q} tag={sp.tag} />
      </section>
    </div>
  );
}
