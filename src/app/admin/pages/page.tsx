import { getAdminPages } from "@/lib/admin";
import { stamp } from "@/lib/format";
import PageEditor from "./PageEditor";
import PageRow from "./PageRow";

export default async function PagesPage() {
  const pages = await getAdminPages();

  return (
    <>
      <div className="upcoming">
        <h4>Pages ({pages.length})</h4>
        {pages.map((p) => (
          <PageRow key={p.id} page={p} />
        ))}
      </div>
      <div className="upcoming" style={{ marginTop: 20 }}>
        <h4>New page</h4>
        <PageEditor />
      </div>
    </>
  );
}
