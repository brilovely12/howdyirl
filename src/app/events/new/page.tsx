import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { listTags, getGroupsByCreator } from "@/lib/data";
import EventForm from "@/components/EventForm";

export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  if (!session.member) redirect("/onboarding");

  const [tags, myGroups] = await Promise.all([
    listTags(),
    getGroupsByCreator(session.member.id),
  ]);

  return (
    <div>
      <Link className="back" href="/events">
        ‹ cancel
      </Link>
      <EventForm tags={tags} myGroups={myGroups} myHandle={session.member.handle} />
    </div>
  );
}
