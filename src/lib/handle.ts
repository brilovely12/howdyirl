/** Shared handle normalization + validation for signup and onboarding. */
export function normalizeHandle(raw: string): string {
  return raw.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
}

/** Returns an error message if the handle is invalid, else null. */
export function handleError(raw: string): string | null {
  const h = normalizeHandle(raw);
  if (h.length < 3) return "Handle must be at least 3 characters (letters, numbers, underscores).";
  if (h.length > 30) return "Handle must be 30 characters or fewer.";
  return null;
}
