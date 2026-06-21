"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Live, debounced search input. Typing updates the `q` URL param (~250ms
 * debounce) which re-runs the server-side query; it never fires a request per
 * keystroke. Clearing returns to the normal filtered/sorted list. The active
 * tag and other params are preserved; the page resets to 1 on a new query.
 */
export default function SearchBox({ placeholder }: { placeholder: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initial = searchParams.get("q") ?? "";
  const [value, setValue] = useState(initial);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep in sync if the URL changes externally (e.g. back/forward).
  useEffect(() => {
    setValue(searchParams.get("q") ?? "");
  }, [searchParams]);

  function pushQuery(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next.trim()) params.set("q", next);
    else params.delete("q");
    params.delete("page");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function onChange(next: string) {
    setValue(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => pushQuery(next), 250);
  }
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  function clear() {
    setValue("");
    if (timer.current) clearTimeout(timer.current);
    pushQuery("");
    inputRef.current?.focus();
  }

  return (
    <div className="searchbar">
      <input
        ref={inputRef}
        type="search"
        value={value}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button type="button" className="search-clear" aria-label="Clear search" onClick={clear}>
          ×
        </button>
      )}
    </div>
  );
}
