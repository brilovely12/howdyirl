"use client";

import { useTransition } from "react";
import { deleteComment } from "@/lib/actions";

export default function DeleteComment({ id }: { id: string }) {
  const [pending, start] = useTransition();

  return (
    <button
      className="btn ghost"
      style={{ width: "auto", fontSize: 11, padding: "4px 8px", color: "var(--red)", opacity: pending ? 0.5 : 1 }}
      disabled={pending}
      onClick={() => start(() => deleteComment(id))}
    >
      Delete
    </button>
  );
}
