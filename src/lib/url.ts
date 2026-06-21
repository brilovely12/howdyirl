/** Normalize a stored external link (e.g. "strava.com/x") to an absolute URL. */
export function externalHref(link: string | null | undefined): string | null {
  if (!link || link === "—" || !link.trim()) return null;
  return /^https?:\/\//i.test(link) ? link : `https://${link}`;
}
