import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getForumSections } from "@/lib/data";
import ThreadForm from "@/components/ThreadForm";

export const dynamic = "force-dynamic";

export default async function NewThreadPage({
  params,
}: {
  params: Promise<{ city: string; section: string }>;
}) {
  const { city, section } = await params;
  const sections = await getForumSections();
  const match = sections.find((s) => s.slug === section);
  if (!match) notFound();

  const session = await getSessionUser();
  if (!session) redirect("/login");

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <Link className="back" href={`/${city}/forums/${section}`}>
        ‹ {match.label}
      </Link>
      <ThreadForm section={section} city={city} />
    </div>
  );
}
