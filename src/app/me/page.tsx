import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function MePage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  const { user, member } = session;

  return (
    <div className="detail" style={{ maxWidth: 560 }}>
      <h1 style={{ fontSize: 24, margin: "0 0 6px" }}>My Stuff</h1>
      <div className="meta" style={{ marginBottom: 16 }}>
        signed in as <b>@{member?.handle ?? user.email}</b>
        {member?.is_admin ? " · admin" : ""}
      </div>
      <p style={{ color: "var(--ink-dim)" }}>
        Your groups, events, RSVPs, and notifications will live here. Posting, joining, and RSVPing
        are coming next.
      </p>
      <div className="meta" style={{ marginTop: 14 }}>
        account email: {user.email}
      </div>
    </div>
  );
}
