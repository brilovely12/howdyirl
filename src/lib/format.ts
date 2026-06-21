// Deterministic helpers shared by list rows and detail pages.

const palette = [
  "#5ed3b3", "#8b5cf6", "#e0b34a", "#5b6ee8", "#e86b7a",
  "#7bc96f", "#c77dff", "#f59e42", "#4dd0e1", "#ec4899",
];

export function color(i: number) {
  return palette[((i % palette.length) + palette.length) % palette.length];
}

export function initials(s: string) {
  return s
    .split(" ")
    .filter((w) => w[0] && /[a-z]/i.test(w[0]))
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/** "updated 2h ago" style relative time from an ISO timestamp. */
export function relTime(iso: string) {
  const sec = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (sec < 3600) return Math.max(1, Math.round(sec / 60)) + "m ago";
  if (sec < 86400) return Math.round(sec / 3600) + "h ago";
  return Math.round(sec / 86400) + "d ago";
}

const CENTRAL = "America/Chicago";

/** "Sat Jun 28, 2026" */
export function eventDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: CENTRAL,
  });
}

/** "7:00 AM CDT" */
export function eventTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit", timeZoneName: "short", timeZone: CENTRAL,
  });
}

/** "Jun 21, 2026 · 6:02 AM CDT" — for updates and comments. */
export function stamp(iso: string) {
  const d = new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", timeZone: CENTRAL,
  });
  const t = new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit", timeZoneName: "short", timeZone: CENTRAL,
  });
  return `${d} · ${t}`;
}
