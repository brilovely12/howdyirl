import { searchEvents, listTags, PAGE_SIZE } from "@/lib/data";
import { getSessionUser } from "@/lib/auth";
import SearchBox from "@/components/SearchBox";
import TagChips from "@/components/TagChips";
import EventRow from "@/components/EventRow";
import Pager from "@/components/Pager";

export const dynamic = "force-dynamic";

type SP = { q?: string; tag?: string; page?: string };

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() || undefined;
  const tag = sp.tag || undefined;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const [{ rows, total }, tags, session] = await Promise.all([
    searchEvents({ q, tag, page }),
    listTags(),
    getSessionUser(),
  ]);
  const postHref = session ? "/events/new" : "/login";

  const emptyMsg = q
    ? `no events match “${q}”.`
    : "no events with that topic yet.";

  return (
    <div className="layout">
      <aside className="side">
        <h4>when</h4>
        <ul>
          <li><a href="#" className="on">all upcoming</a></li>
          <li><a href="#">this week</a></li>
          <li><a href="#">this weekend</a></li>
          <li><a href="#">this month</a></li>
        </ul>
        <h4>topics</h4>
        <TagChips basePath="/events" tags={tags} activeTag={tag} q={q} />
        <a className="btn" href={postHref}>
          + post an event
        </a>
      </aside>

      <section>
        <SearchBox placeholder="Search events…" />
        <div className="listhead">
          <h2>upcoming events</h2>
          <span className="sort">sort: soonest ▾</span>
        </div>

        {rows.length ? (
          rows.map((e, i) => <EventRow key={e.id} event={e} index={(page - 1) * PAGE_SIZE + i} />)
        ) : (
          <div className="empty">{emptyMsg}</div>
        )}

        <Pager basePath="/events" page={page} total={total} pageSize={PAGE_SIZE} q={q} tag={tag} />
      </section>
    </div>
  );
}
