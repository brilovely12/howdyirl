import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <h1 style={{ fontSize: 48, marginBottom: 8 }}>404</h1>
      <p style={{ color: "var(--ink-dim)", marginBottom: 20 }}>
        This page doesn't exist or has been removed.
      </p>
      <Link className="btn" href="/huntsville/groups" style={{ width: "auto", display: "inline-block" }}>
        Back to groups
      </Link>
    </div>
  );
}
