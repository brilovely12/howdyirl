import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { SECTIONS } from "@/lib/data";
import type { Section } from "@/lib/data";
import ThreadForm from "@/components/ThreadForm";

export const dynamic = "force-dynamic";

const LABELS: Record<string, string> = {
  introductions: "Introductions",
  general: "General",
  random: "Random",
  feedback: "Feedback",
};

export default async function NewThreadPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!SECTIONS.includes(section as Section)) notFound();

  const session = await getSessionUser();
  if (!session) redirect("/login");

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <Link className="back" href={`/forums/${section}`}>
        ‹ {LABELS[section]}
      </Link>
      <ThreadForm section={section} />
    </div>
  );
}
