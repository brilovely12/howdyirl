import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getGroup, listTags } from "@/lib/data";
import GroupForm from "@/components/GroupForm";

export const dynamic = "force-dynamic";

export default async function EditGroupPage({ params }: { params: Promise<{ city: string; slug: string }> }) {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  const { city, slug } = await params;
  const isAdmin = !!session.member?.is_admin;
  const group = await getGroup(slug, isAdmin);
  if (!group) notFound();

  const isCreator = session.member?.id === group.creator_id;
  if (!isCreator && !isAdmin) redirect(`/${city}/groups/${slug}`);

  const tags = await listTags();
  return (
    <div>
      <Link className="back" href={`/${city}/groups/${slug}`}>
        ‹ cancel
      </Link>
      <GroupForm
        tags={tags}
        city={city}
        existing={{
          id: group.id,
          slug: group.slug,
          name: group.name,
          description: group.description,
          tags: group.tags,
          external_link: group.external_link,
          link_label: group.link_label,
          image_url: group.image_url,
          images: group.images ?? [],
        }}
      />
    </div>
  );
}
