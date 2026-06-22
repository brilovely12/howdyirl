import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="sister">
          A sister site to{" "}
          <a href="https://www.boopem.com" target="_blank" rel="noopener">
            <span className="hw">boopem</span>
          </a>{" "}
          — Meet people on Howdy, keep in touch on Boopem
        </div>
        <div className="footlinks">
          <Link href="/p/rules">Rules</Link> · <a href="#">How it works</a> ·{" "}
          <a href="#">Contact</a> · <Link href="/p/terms">Terms</Link> ·{" "}
          <Link href="/p/privacy">Privacy</Link> · <a href="#">Request your city</a>
        </div>
        <div className="copyright">© 2026 Howdy IRL. All rights reserved.</div>
      </div>
    </footer>
  );
}
