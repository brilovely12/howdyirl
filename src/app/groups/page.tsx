import { searchGroups, listTags, PAGE_SIZE } from "@/lib/data";
import { getSessionUser } from "@/lib/auth";
import SearchBox from "@/components/SearchBox";
import TagChips from "@/components/TagChips";
import FilterToggle from "@/components/FilterToggle";
import GroupRow from "@/components/GroupRow";
import Pager from "@/components/Pager";

export const dynamic = "force-dynamic";

type SP = { q?: string; tag?: string; page?: string };

export default async function GroupsPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() || undefined;
  const activeTags = sp.tag ? sp.tag.split(",").filter(Boolean) : [];
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const [{ rows, total }, tags, session] = await Promise.all([
    searchGroups({ q, tags: activeTags.length ? activeTags : undefined, page }),
    listTags(),
    getSessionUser(),
  ]);
  const postHref = session ? "/groups/new" : "/login";

  const emptyMsg = q
    ? `No groups match "${q}".`
    : "No groups with that topic yet.";

  return (
    <div className="layout">
      <aside className="side">
        <h4>tags</h4>
        <TagChips basePath="/groups" tags={tags} activeTags={activeTags} q={q} />
        <a className="btn post" href={postHref}>
          + Post a Group
        </a>
      </aside>

      <section>
        <SearchBox placeholder="Search groups…" />
        <div className="listhead">
          <h2>local groups</h2>
          <FilterToggle activeCount={activeTags.length}>
            <TagChips basePath="/groups" tags={tags} activeTags={activeTags} q={q} />
          </FilterToggle>
          <span className="sort">
            <svg className="sort-icon" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 3v10M4 13l-2.5-3M4 13l2.5-3M12 13V3M12 3l-2.5 3M12 3l2.5 3" /></svg>
            <span className="sort-label">Sort: Recently updated ▾</span>
          </span>
        </div>

        {rows.length ? (
          rows.map((g, i) => <GroupRow key={g.id} group={g} index={(page - 1) * PAGE_SIZE + i} />)
        ) : (
          <div className="empty">{emptyMsg}</div>
        )}

        <Pager basePath="/groups" page={page} total={total} pageSize={PAGE_SIZE} q={q} tag={sp.tag} />
      </section>
    </div>
  );
}
