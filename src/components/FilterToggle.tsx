"use client";

import { useState } from "react";
import type { ReactNode } from "react";

export function FilterButton({
  activeCount,
  open,
  onClick,
}: {
  activeCount: number;
  open: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="filter-toggle"
      onClick={onClick}
      aria-expanded={open}
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M1 3h14M3 8h10M5.5 13h5" />
      </svg>
      {activeCount > 0 && <span className="filter-badge">{activeCount}</span>}
    </button>
  );
}

export default function FilterToggle({
  children,
  activeCount,
}: {
  children: ReactNode;
  activeCount: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <FilterButton activeCount={activeCount} open={open} onClick={() => setOpen((o) => !o)} />
      {open && <div className="filter-drawer">{children}</div>}
    </>
  );
}
