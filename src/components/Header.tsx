import Link from "next/link";
import { getSessionUser } from "@/lib/auth";

export default async function Header() {
  const session = await getSessionUser();
  const handle = session?.member?.handle ?? session?.user.email?.split("@")[0];
  const isAdmin = session?.member?.is_admin;

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
                  <b style={{ color: "var(--red)" }}>admin</b>
                  &nbsp;·&nbsp;
                </>
              )}
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
