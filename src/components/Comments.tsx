import Link from "next/link";
import type { Comment } from "@/lib/types";
import { stamp } from "@/lib/format";
import CommentForm from "./CommentForm";
import DeleteComment from "./DeleteComment";

const ADMIN_HANDLES = ["brilovely"];

export default function Comments({
  comments,
  loggedIn,
  targetType,
  targetId,
  sessionHandle,
  isAdmin,
}: {
  comments: Comment[];
  loggedIn: boolean;
  targetType: "group" | "event" | "thread" | "spot";
  targetId: string;
  sessionHandle?: string | null;
  isAdmin?: boolean;
}) {
  return (
    <div className="upcoming">
      <h4>comments</h4>
      {comments.length ? (
        comments.map((c) => (
          <div className="cmt" key={c.id}>
            <div className="cmt-head">
              <span style={{ color: "var(--link)" }}>@{c.author_handle}</span>
              {ADMIN_HANDLES.includes(c.author_handle) && <span className="adminflag">admin</span>}
              <span className="cmt-when">
                {stamp(c.created_at)}
                {c.edited ? " · edited" : ""}
              </span>
              {(isAdmin || sessionHandle === c.author_handle) && (
                <DeleteComment commentId={c.id} targetType={targetType} targetId={targetId} />
              )}
            </div>
            {c.quote_handle && (
              <div className="cmt-quote">
                <span className="cmt-quote-who">@{c.quote_handle} wrote:</span> {c.quote_text}
              </div>
            )}
            <div className="cmt-body">{c.body}</div>
          </div>
        ))
      ) : (
        <div className="meta">No comments yet</div>
      )}
      {loggedIn ? (
        <CommentForm targetType={targetType} targetId={targetId} />
      ) : (
        <div className="meta" style={{ marginTop: 10 }}>
          <Link href="/login">Log in</Link> to comment.
        </div>
      )}
    </div>
  );
}
