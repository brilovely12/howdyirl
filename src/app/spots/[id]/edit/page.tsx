import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getSpot, listSpotTags } from "@/lib/data";
import SpotForm from "@/components/SpotForm";

export const dynamic = "force-dynamic";

export default async function EditSpotPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  const { id } = await params;
  const isAdmin = !!session.member?.is_admin;
  const spot = await getSpot(id, isAdmin);
  if (!spot) notFound();

  const isCreator = session.member?.id === spot.creator_id;
  if (!isCreator && !isAdmin) redirect(`/spots/${id}`);

  const tags = await listSpotTags();
  return (
    <div>
      <Link className="back" href={`/spots/${id}`}>
        ‹ cancel
      </Link>
      <SpotForm
        tags={tags}
        existing={{
          id: spot.id,
          name: spot.name,
          description: spot.description,
          address: spot.address,
          tags: spot.tags,
          external_link: spot.external_link,
          link_label: spot.link_label,
          image_url: spot.image_url,
          images: spot.images ?? [],
        }}
      />
    </div>
  );
}
