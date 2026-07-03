import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { getNotifications, resolveNotifSlugs } from "@/lib/data";
import { stamp } from "@/lib/format";
import MarkRead from "./MarkRead";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const session = await getSessionUser();
  if (!session?.member) redirect("/login");

  const notifications = await getNotifications(session.member.id);
  const slugMap = await resolveNotifSlugs(notifications);

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <h2>Notifications</h2>
      <MarkRead memberId={session.member.id} />
      {notifications.length === 0 ? (
        <div className="empty">No notifications yet.</div>
      ) : (
        <div className="list">
          {notifications.map((n) => {
            const href = n.link_type && n.link_id && slugMap[n.link_id]
              ? `/huntsville/${n.link_type}s/${slugMap[n.link_id]}`
              : null;
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
