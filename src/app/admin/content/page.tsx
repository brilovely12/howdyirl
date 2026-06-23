import Link from "next/link";
import { getAdminContent } from "@/lib/admin";
import { stamp } from "@/lib/format";
import ContentActions from "./ContentActions";

export default async function ContentPage() {
  const content = await getAdminContent();

  return (
    <div className="upcoming">
      <h4>All groups and events ({content.length})</h4>
      {content.map((c) => (
        <div key={`${c.type}-${c.id}`} className="row" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <Link href={`/${c.type}s/${c.id}`}>{c.name}</Link>
            <span style={{ fontSize: 11, color: "var(--ink-faint)" }}> {c.type}</span>
            {c.status !== "live" && (
              <span style={{
                fontSize: 10, fontWeight: 700, padding: "1px 5px", borderRadius: 3, marginLeft: 6,
                background: c.status === "hidden" ? "var(--amber)" : "var(--red)",
                color: "#fff",
              }}>
                {c.status}
              </span>
            )}
            <div className="meta">
              {c.creator_handle ? `@${c.creator_handle}` : "seeded"} · {stamp(c.created_at)}
            </div>
          </div>
          <ContentActions type={c.type} id={c.id} currentStatus={c.status} />
        </div>
      ))}
    </div>
  );
}
