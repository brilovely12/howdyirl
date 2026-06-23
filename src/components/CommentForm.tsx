"use client";

import { useState, useTransition } from "react";
import { postComment } from "@/lib/actions";

export default function CommentForm({
  targetType,
  targetId,
}: {
  targetType: "group" | "event";
  targetId: string;
}) {
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    startTransition(async () => {
      await postComment(targetType, targetId, body);
      setBody("");
    });
  }

  return (
    <form onSubmit={submit} style={{ marginTop: 12 }}>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write a comment…"
        rows={3}
        maxLength={2000}
        style={{
          width: "100%",
          background: "var(--panel-2)",
          color: "var(--ink)",
          border: "1px solid var(--rule)",
          borderRadius: 3,
          padding: 10,
          font: "inherit",
          resize: "vertical",
        }}
      />
      <button
        className="btn"
        type="submit"
        disabled={pending || !body.trim()}
        style={{ marginTop: 8, width: "auto", opacity: pending ? 0.6 : 1 }}
      >
        {pending ? "Posting…" : "Post comment"}
      </button>
    </form>
  );
}
