import Link from "next/link";
import type { Tag } from "@/lib/types";

/**
 * Topic filter chips. Each chip is a link that toggles the `tag` param while
 * preserving the current search query; selecting a chip resets paging.
 */
export default function TagChips({
  basePath,
  tags,
  activeTag,
  q,
}: {
  basePath: string;
  tags: Tag[];
  activeTag?: string;
  q?: string;
}) {
  const href = (tag?: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (tag) params.set("tag", tag);
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <div>
      <Link href={href()} className={`chip${!activeTag ? " on" : ""}`}>
        all
      </Link>
      {tags.map((t) => (
        <Link
          key={t.id}
          href={href(activeTag === t.name ? undefined : t.name)}
          className={`chip${activeTag === t.name ? " on" : ""}`}
        >
          {t.name}
        </Link>
      ))}
    </div>
  );
}
