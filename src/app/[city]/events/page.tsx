import type { Metadata } from "next";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city } = await params;
  return {
    title: "Events — coming soon",
    description: "In-person events in Huntsville, AL are coming soon to Howdy IRL.",
    alternates: { canonical: `/${city}/events` },
    robots: { index: false },
  };
}

export default async function EventsComingSoon({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  return (
    <div className="detail" style={{ maxWidth: 560, margin: "40px auto", textAlign: "center" }}>
      <h1 style={{ fontSize: 22, margin: "0 0 10px" }}>Events are coming soon</h1>
      <p style={{ color: "var(--ink-dim)", maxWidth: "42ch", margin: "0 auto 20px" }}>
        We&apos;re getting this section ready. In the meantime, find your people in{" "}
        <Link href={`/${city}/groups`}>groups</Link> or explore local{" "}
        <Link href={`/${city}/spots`}>spots</Link>.
      </p>
      <Link className="btn" href={`/${city}/groups`} style={{ width: "auto", display: "inline-block" }}>
        Browse groups
      </Link>
    </div>
  );
}
