import type { Metadata } from "next";
import Link from "next/link";
import { getSectionCounts, getForumSections } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city } = await params;
  return {
    title: "Forums",
    description: "Join the conversation on the Howdy IRL community forums. Introductions, general chat, and more.",
    alternates: { canonical: `/${city}/forums` },
  };
}

export default async function ForumsPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const [sections, counts] = await Promise.all([getForumSections(), getSectionCounts()]);

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <div className="listhead">
        <h1>forums</h1>
      </div>
      <div className="forum-sections">
        {sections.map((s) => (
          <Link href={`/${city}/forums/${s.slug}`} className="forum-section-row" key={s.id}>
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
