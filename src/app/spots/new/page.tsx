import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { listSpotTags } from "@/lib/data";
import SpotForm from "@/components/SpotForm";

export const dynamic = "force-dynamic";

export default async function NewSpotPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  if (!session.member) redirect("/onboarding");

  const tags = await listSpotTags();
  return (
    <div>
      <Link className="back" href="/spots">
        ‹ cancel
      </Link>
      <SpotForm tags={tags} />
    </div>
  );
}
