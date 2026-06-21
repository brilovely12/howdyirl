import Link from "next/link";

/** prev / next paging (no infinite scroll), preserving query + tag. */
export default function Pager({
  basePath,
  page,
  total,
  pageSize,
  q,
  tag,
}: {
  basePath: string;
  page: number;
  total: number;
  pageSize: number;
  q?: string;
  tag?: string;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const href = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (tag) params.set("tag", tag);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <div className="pager">
      {page > 1 ? <Link href={href(page - 1)}>‹ prev</Link> : <span className="cur">‹ prev</span>}
      <span className="cur">
        page {page} of {pages}
      </span>
      {page < pages ? <Link href={href(page + 1)}>next ›</Link> : <span className="cur">next ›</span>}
    </div>
  );
}
