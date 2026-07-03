import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getEvent, listTags, getGroupsByCreator } from "@/lib/data";
import EventForm from "@/components/EventForm";

export const dynamic = "force-dynamic";

export default async function EditEventPage({ params }: { params: Promise<{ city: string; slug: string }> }) {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  const { city, slug } = await params;
  const isAdmin = !!session.member?.is_admin;
  const event = await getEvent(slug, isAdmin);
  if (!event) notFound();

  const isCreator = session.member?.id === event.creator_id;
  if (!isCreator && !isAdmin) redirect(`/${city}/events/${slug}`);

  const [tags, myGroups] = await Promise.all([
    listTags(),
    getGroupsByCreator(session.member!.id),
  ]);

  return (
    <div>
      <Link className="back" href={`/${city}/events/${slug}`}>
        ‹ cancel
      </Link>
      <EventForm
        tags={tags}
        myGroups={myGroups}
        myHandle={session.member!.handle}
        city={city}
        existing={{
          id: event.id,
          slug: event.slug,
          name: event.name,
          description: event.description,
          tags: event.tags,
          starts_at: event.starts_at,
          recurrence: event.recurrence,
          recurrence_end: event.recurrence_end,
          external_link: event.external_link,
          host_group_id: event.host_group_id,
          image_url: event.image_url,
          images: event.images ?? [],
        }}
      />
    </div>
  );
}
