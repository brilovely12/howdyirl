import Link from "next/link";
import { getSectionCounts, SECTIONS } from "@/lib/data";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const SECTION_META: Record<string, { label: string; description: string }> = {
  introductions: { label: "Introductions", description: "Say hello, share who you are" },
  general: { label: "General", description: "Anything and everything local" },
  random: { label: "Random", description: "Off-topic, fun stuff, whatever" },
  feedback: { label: "Feedback", description: "Ideas and feedback for Howdy IRL" },
};

export default async function ForumsPage() {
  const [counts, session] = await Promise.all([getSectionCounts(), getSessionUser()]);

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <div className="listhead">
        <h2>forums</h2>
      </div>
      <div className="forum-sections">
        {SECTIONS.map((s) => {
          const meta = SECTION_META[s];
          return (
            <Link href={`/forums/${s}`} className="forum-section-row" key={s}>
              <div>
                <div className="forum-section-title">{meta.label}</div>
                <div className="forum-section-desc">{meta.description}</div>
              </div>
              <div className="forum-section-count">
                {counts[s] ?? 0} {(counts[s] ?? 0) === 1 ? "thread" : "threads"}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
