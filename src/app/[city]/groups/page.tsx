import type { Metadata } from "next";
import { searchGroups, listTags, PAGE_SIZE } from "@/lib/data";
import { getSessionUser } from "@/lib/auth";
import SearchBox from "@/components/SearchBox";
import TagChips from "@/components/TagChips";
import FilterToggle from "@/components/FilterToggle";
import GroupRow from "@/components/GroupRow";
import Pager from "@/components/Pager";
import SortSelect from "@/components/SortSelect";

export const dynamic = "force-dynamic";

type SP = { q?: string; tag?: string; page?: string; sort?: string };

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city } = await params;
  return {
    title: "Groups",
    description: "Discover local groups and communities in Huntsville, AL. Find your people on Howdy IRL.",
    alternates: { canonical: `/${city}/groups` },
  };
}

export default async function GroupsPage({
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
    searchGroups({ q, tags: activeTags.length ? activeTags : undefined, page, sort }),
    listTags(),
    getSessionUser(),
  ]);
  const postHref = session ? `/${city}/groups/new` : "/login";

  const emptyMsg = q
    ? `No groups match "${q}".`
    : activeTags.length
      ? "No groups with that tag yet."
      : "No groups yet — be the first to post one.";

  return (
    <div className="layout">
      <aside className="side">
        <h4>tags</h4>
        <TagChips basePath={`/${city}/groups`} tags={tags} activeTags={activeTags} q={q} />
        <a className="btn post" href={postHref}>
          + Post a Group
        </a>
      </aside>

      <section>
        <div className="searchrow">
          <SearchBox placeholder="Search groups…" />
          <a className="btn post" href={postHref}>+ Post a Group</a>
        </div>
        <div className="listhead">
          <h1>local groups</h1>
          <FilterToggle activeCount={activeTags.length}>
            <TagChips basePath={`/${city}/groups`} tags={tags} activeTags={activeTags} q={q} />
          </FilterToggle>
          <SortSelect />
        </div>

        {rows.length ? (
          rows.map((g, i) => <GroupRow key={g.id} group={g} index={(page - 1) * PAGE_SIZE + i} city={city} />)
        ) : (
          <div className="empty">{emptyMsg}</div>
        )}

        <Pager basePath={`/${city}/groups`} page={page} total={total} pageSize={PAGE_SIZE} q={q} tag={sp.tag} />
      </section>
    </div>
  );
}
