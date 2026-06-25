"use client";

import { useTransition } from "react";
import { deleteThread } from "@/lib/actions";

export default function DeleteThreadButton({ threadId, section }: { threadId: string; section: string }) {
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      style={{ background: "none", border: "none", color: "var(--red)", cursor: "pointer", fontSize: 12, padding: 0, opacity: pending ? 0.5 : 1 }}
      onClick={() => {
        if (!confirm("Delete this thread and all its replies?")) return;
        start(async () => {
          await deleteThread(threadId);
          window.location.assign(`/forums/${section}`);
        });
      }}
    >
      delete
    </button>
  );
}
