"use client";

import { useEffect } from "react";
import { getBrowserClient } from "@/lib/supabase/client";

export default function MarkRead({ memberId }: { memberId: string }) {
  useEffect(() => {
    getBrowserClient()
      .from("notifications")
      .update({ read: true })
      .eq("member_id", memberId)
      .eq("read", false)
      .then();
  }, [memberId]);

  return null;
}
