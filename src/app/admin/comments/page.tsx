import Link from "next/link";
import { getRecentComments } from "@/lib/admin";
import { stamp } from "@/lib/format";
import DeleteComment from "./DeleteComment";

export default async function CommentsPage() {
  const comments = await getRecentComments();

  return (
    <div className="upcoming">
      <h4>Recent comments ({comments.length})</h4>
      {comments.length ? (
        comments.map((c) => (
          <div key={c.id} className="row" style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 600, fontSize: 13 }}>@{c.author_handle}</span>
              <span style={{ fontSize: 12, color: "var(--ink-dim)" }}>
                {" "}on <Link href={`/${c.target_type}s/${c.target_id}`}>{c.target_name}</Link>
              </span>
              <div style={{ fontSize: 13, marginTop: 2 }}>{c.body.length > 200 ? c.body.slice(0, 200) + "..." : c.body}</div>
              <div className="meta">{stamp(c.created_at)}</div>
            </div>
            <DeleteComment id={c.id} />
          </div>
        ))
      ) : (
        <div className="meta">No comments yet</div>
      )}
    </div>
  );
}
