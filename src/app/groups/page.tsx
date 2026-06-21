import { searchGroups, listTags, PAGE_SIZE } from "@/lib/data";
import { getSessionUser } from "@/lib/auth";
import SearchBox from "@/components/SearchBox";
import TagChips from "@/components/TagChips";
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
  const tag = sp.tag || undefined;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const [{ rows, total }, tags, session] = await Promise.all([
    searchGroups({ q, tag, page }),
    listTags(),
    getSessionUser(),
  ]);
  const postHref = session ? "/groups/new" : "/login";
  const claimHref = session ? "#" : "/login";

  const emptyMsg = q
    ? `no groups match “${q}”.`
    : "no groups with that topic yet.";

  return (
    <div className="layout">
      <aside className="side">
        <h4>topics</h4>
        <TagChips basePath="/groups" tags={tags} activeTag={tag} q={q} />
        <a className="btn" href={postHref}>
          + post a group
        </a>
        <div style={{ height: 8 }} />
        <a className="btn ghost" href={claimHref}>
          claim a group
        </a>
      </aside>

      <section>
        <SearchBox placeholder="Search groups…" />
        <div className="listhead">
          <h2>local groups</h2>
          <span className="sort">sort: recently updated ▾</span>
        </div>

        {rows.length ? (
          rows.map((g, i) => <GroupRow key={g.id} group={g} index={(page - 1) * PAGE_SIZE + i} />)
        ) : (
          <div className="empty">{emptyMsg}</div>
        )}

        <Pager basePath="/groups" page={page} total={total} pageSize={PAGE_SIZE} q={q} tag={tag} />
      </section>
    </div>
  );
}
