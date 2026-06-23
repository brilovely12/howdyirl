import { getAdminTags } from "@/lib/admin";
import TagRow from "./TagRow";
import TagEditor from "./TagEditor";

export default async function TagsPage() {
  const tags = await getAdminTags();

  return (
    <>
      <div className="upcoming">
        <h4>Tags ({tags.length})</h4>
        {tags.map((t) => (
          <TagRow key={t.id} tag={t} />
        ))}
      </div>
      <div className="upcoming" style={{ marginTop: 20 }}>
        <h4>Add tag</h4>
        <TagEditor nextSort={tags.length ? Math.max(...tags.map((t) => t.sort)) + 1 : 0} />
      </div>
    </>
  );
}
