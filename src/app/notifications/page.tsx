import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { getNotifications } from "@/lib/data";
import { stamp } from "@/lib/format";
import MarkRead from "./MarkRead";

export const dynamic = "force-dynamic";

function notifLink(n: { link_type: string | null; link_id: string | null }): string | null {
  if (!n.link_type || !n.link_id) return null;
  if (n.link_type === "group") return `/groups/${n.link_id}`;
  if (n.link_type === "event") return `/events/${n.link_id}`;
  return null;
}

export default async function NotificationsPage() {
  const session = await getSessionUser();
  if (!session?.member) redirect("/login");

  const notifications = await getNotifications(session.member.id);

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <h2>Notifications</h2>
      <MarkRead memberId={session.member.id} />
      {notifications.length === 0 ? (
        <div className="empty">No notifications yet.</div>
      ) : (
        <div className="list">
          {notifications.map((n) => {
            const href = notifLink(n);
            return (
              <div key={n.id} className={`row notif${n.read ? "" : " unread"}`}>
                <div style={{ flex: 1 }}>
                  {href ? <Link href={href}>{n.body}</Link> : n.body}
                </div>
                <div className="meta" style={{ whiteSpace: "nowrap" }}>{stamp(n.created_at)}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
