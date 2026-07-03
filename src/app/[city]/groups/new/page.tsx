import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { listTags } from "@/lib/data";
import GroupForm from "@/components/GroupForm";

export const dynamic = "force-dynamic";

export default async function NewGroupPage({ params }: { params: Promise<{ city: string }> }) {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  if (!session.member) redirect("/onboarding");

  const { city } = await params;
  const tags = await listTags();
  return (
    <div>
      <Link className="back" href={`/${city}/groups`}>
        ‹ cancel
      </Link>
      <GroupForm tags={tags} city={city} />
    </div>
  );
}
