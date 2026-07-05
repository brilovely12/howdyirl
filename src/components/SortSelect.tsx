"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

/** Functional sort control for list pages: recently updated (default) or recently added. */
export default function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const value = searchParams.get("sort") === "new" ? "new" : "updated";

  function onChange(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "new") params.set("sort", "new");
    else params.delete("sort");
    params.delete("page");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <span className="sort">
      <svg className="sort-icon" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><path d="M4 3v10M4 13l-2.5-3M4 13l2.5-3M12 13V3M12 3l-2.5 3M12 3l2.5 3" /></svg>
      <select aria-label="Sort" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="updated">Recently updated</option>
        <option value="new">Recently added</option>
      </select>
    </span>
  );
}
