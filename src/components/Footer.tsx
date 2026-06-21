import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="sister">
          a sister site to{" "}
          <a href="https://www.boopem.com" target="_blank" rel="noopener">
            <span className="hw">boopem</span>
          </a>{" "}
          — meet people on howdy, keep in touch on boopem
        </div>
        <div className="footlinks">
          <Link href="/p/rules">rules</Link> · <a href="#">how it works</a> ·{" "}
          <a href="#">contact</a> · <Link href="/p/terms">terms</Link> ·{" "}
          <Link href="/p/privacy">privacy</Link> · <a href="#">request your city</a>
        </div>
        <div className="copyright">© 2026 Howdy IRL. All rights reserved.</div>
      </div>
    </footer>
  );
}
