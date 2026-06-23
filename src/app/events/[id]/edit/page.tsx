import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getEvent, listTags, getGroupsByCreator } from "@/lib/data";
import EventForm from "@/components/EventForm";

export const dynamic = "force-dynamic";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  const { id } = await params;
  const event = await getEvent(id);
  if (!event) notFound();

  const isCreator = session.member?.id === event.creator_id;
  const isAdmin = session.member?.is_admin;
  if (!isCreator && !isAdmin) redirect(`/events/${id}`);

  const [tags, myGroups] = await Promise.all([
    listTags(),
    getGroupsByCreator(session.member!.id),
  ]);

  return (
    <div>
      <Link className="back" href={`/events/${id}`}>
        ‹ cancel
      </Link>
      <EventForm
        tags={tags}
        myGroups={myGroups}
        myHandle={session.member!.handle}
        existing={{
          id: event.id,
          name: event.name,
          description: event.description,
          tags: event.tags,
          starts_at: event.starts_at,
          external_link: event.external_link,
          host_group_id: event.host_group_id,
        }}
      />
    </div>
  );
}
