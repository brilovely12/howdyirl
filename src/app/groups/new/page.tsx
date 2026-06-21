import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { listTags } from "@/lib/data";
import GroupForm from "@/components/GroupForm";

export const dynamic = "force-dynamic";

export default async function NewGroupPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  if (!session.member) redirect("/onboarding");

  const tags = await listTags();
  return (
    <div>
      <Link className="back" href="/groups">
        ‹ cancel
      </Link>
      <GroupForm tags={tags} />
    </div>
  );
}
