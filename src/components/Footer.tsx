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
          <Link href="/p/rules">Rules</Link> · <Link href="/p/how-it-works">How it works</Link> ·{" "}
          <Link href="/p/contact">Contact</Link> · <Link href="/p/terms">Terms</Link> ·{" "}
          <Link href="/p/privacy">Privacy</Link> ·{" "}
          <a href="mailto:hello@howdyirl.com?subject=Request%20a%20new%20city">Request your city</a>
        </div>
        <div className="copyright">© 2026 Howdy IRL. All rights reserved.</div>
      </div>
    </footer>
  );
}
