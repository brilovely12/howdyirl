import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { getUnreadCount } from "@/lib/data";

export default async function Header() {
  const session = await getSessionUser();
  const handle = session?.member?.handle ?? session?.user.email?.split("@")[0];
  const isAdmin = session?.member?.is_admin;
  const unread = session?.member ? await getUnreadCount(session.member.id) : 0;

  return (
    <header>
      <div className="topbar">
        <Link href="/groups" className="brand" aria-label="Howdy IRL home">
          <span className="hw">howdy</span>
          <span className="irl">IRL</span>
          <span className="beta">BETA</span>
        </Link>
        <div className="city-pick">
          City:{" "}
          <select defaultValue="Huntsville, AL" aria-label="Choose city">
            <option>Huntsville, AL</option>
            <option disabled>More coming soon</option>
          </select>
        </div>
        <div className="auth">
          {session ? (
            <>
              {isAdmin && (
                <>
                  <Link href="/admin" style={{ color: "var(--red)", fontWeight: 700, textDecoration: "none" }}>admin</Link>
                  &nbsp;·&nbsp;
                </>
              )}
              <Link href="/notifications" className="bell" aria-label="Notifications">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                {unread > 0 && <span className="badge">{unread}</span>}
              </Link>
              &nbsp;·&nbsp;
              <Link href="/me">@{handle}</Link>
              &nbsp;·&nbsp;
              <form action="/auth/signout" method="post" style={{ display: "inline" }}>
                <button
                  type="submit"
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--link)",
                    cursor: "pointer",
                    font: "inherit",
                    padding: 0,
                  }}
                >
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              Browsing as guest &nbsp;·&nbsp; <Link href="/login">Log in</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
