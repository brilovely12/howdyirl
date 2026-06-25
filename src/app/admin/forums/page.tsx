import { getAdminForumSections } from "@/lib/admin";
import ForumSectionRow from "./ForumSectionRow";
import ForumSectionEditor from "./ForumSectionEditor";

export default async function AdminForumsPage() {
  const sections = await getAdminForumSections();

  return (
    <>
      <div className="upcoming">
        <h4>Forum sections ({sections.length})</h4>
        {sections.map((s) => (
          <ForumSectionRow key={s.id} section={s} />
        ))}
        {sections.length === 0 && (
          <div className="empty">No forum sections yet.</div>
        )}
      </div>
      <div className="upcoming" style={{ marginTop: 20 }}>
        <h4>Add section</h4>
        <ForumSectionEditor nextSort={sections.length ? Math.max(...sections.map((s) => s.sort)) + 1 : 0} />
      </div>
    </>
  );
}
