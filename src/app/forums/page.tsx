import Link from "next/link";
import { getSectionCounts, getForumSections } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ForumsPage() {
  const [sections, counts] = await Promise.all([getForumSections(), getSectionCounts()]);

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <div className="listhead">
        <h2>forums</h2>
      </div>
      <div className="forum-sections">
        {sections.map((s) => (
          <Link href={`/forums/${s.slug}`} className="forum-section-row" key={s.id}>
            <div>
              <div className="forum-section-title">{s.label}</div>
              <div className="forum-section-desc">{s.description}</div>
            </div>
            <div className="forum-section-count">
              {counts[s.slug] ?? 0} {(counts[s.slug] ?? 0) === 1 ? "thread" : "threads"}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
