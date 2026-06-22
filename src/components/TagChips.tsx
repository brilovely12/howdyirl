import Link from "next/link";
import type { Tag } from "@/lib/types";

export default function TagChips({
  basePath,
  tags,
  activeTags,
  q,
}: {
  basePath: string;
  tags: Tag[];
  activeTags: string[];
  q?: string;
}) {
  const href = (toggle: string) => {
    const next = activeTags.includes(toggle)
      ? activeTags.filter((t) => t !== toggle)
      : [...activeTags, toggle];
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (next.length) params.set("tag", next.join(","));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const clearHref = () => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <div>
      <Link href={clearHref()} className={`chip${!activeTags.length ? " on" : ""}`}>
        All
      </Link>
      {tags.map((t) => (
        <Link
          key={t.id}
          href={href(t.name)}
          className={`chip${activeTags.includes(t.name) ? " on" : ""}`}
        >
          {t.name}
        </Link>
      ))}
    </div>
  );
}
