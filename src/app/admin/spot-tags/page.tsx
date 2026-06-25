import { getAdminSpotTags } from "@/lib/admin";
import SpotTagRow from "./SpotTagRow";
import SpotTagEditor from "./SpotTagEditor";

export default async function SpotTagsPage() {
  const tags = await getAdminSpotTags();

  return (
    <>
      <div className="upcoming">
        <h4>Spot tags ({tags.length})</h4>
        {tags.map((t) => (
          <SpotTagRow key={t.id} tag={t} />
        ))}
      </div>
      <div className="upcoming" style={{ marginTop: 20 }}>
        <h4>Add spot tag</h4>
        <SpotTagEditor nextSort={tags.length ? Math.max(...tags.map((t) => t.sort)) + 1 : 0} />
      </div>
    </>
  );
}
