import Link from "next/link";
import type { Comment } from "@/lib/types";
import { stamp } from "@/lib/format";

const ADMIN_HANDLES = ["brilovely"];

export default function Comments({ comments, loggedIn }: { comments: Comment[]; loggedIn: boolean }) {
  return (
    <div className="upcoming">
      <h4>comments</h4>
      {comments.length ? (
        comments.map((c) => (
          <div className="cmt" key={c.id}>
            <div className="cmt-head">
              <a href="#">@{c.author_handle}</a>
              {ADMIN_HANDLES.includes(c.author_handle) && <span className="adminflag">admin</span>}
              <span className="cmt-when">
                {stamp(c.created_at)}
                {c.edited ? " · edited" : ""}
              </span>
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
        <div className="meta">no comments yet</div>
      )}
      <div className="meta" style={{ marginTop: 10 }}>
        {loggedIn ? (
          "Commenting is coming soon."
        ) : (
          <>
            <Link href="/login">Log in</Link> to comment.
          </>
        )}
      </div>
    </div>
  );
}
