"use client";

import { useTransition } from "react";
import { deleteComment } from "@/lib/actions";

export default function DeleteComment({
  commentId,
  targetType,
  targetId,
}: {
  commentId: string;
  targetType: "group" | "event" | "thread";
  targetId: string;
}) {
  const [pending, start] = useTransition();

  return (
    <button
      className="cmt-delete"
      disabled={pending}
      onClick={() => {
        if (!confirm("Delete this comment?")) return;
        start(() => deleteComment(commentId, targetType, targetId));
      }}
    >
      {pending ? "…" : "delete"}
    </button>
  );
}
