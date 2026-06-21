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
          city:{" "}
          <select defaultValue="huntsville, al" aria-label="Choose city">
            <option>huntsville, al</option>
            <option disabled>— nearby (soon) —</option>
            <option disabled>birmingham, al</option>
            <option disabled>nashville, tn</option>
            <option disabled>atlanta, ga</option>
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
                  log out
                </button>
              </form>
            </>
          ) : (
            <>
              browsing as guest &nbsp;·&nbsp; <Link href="/login">log in</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
