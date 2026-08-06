/**
 * Pick a ZIP folder name that does not collide with names already claimed
 * in the current archive. First use keeps the base name; later collisions
 * get a numeric suffix (`report`, `report-2`, ...).
 */
export function uniqueZipFolderName(baseName: string, usedNames: Set<string>) {
  const normalized = baseName.trim() || "document";
  if (!usedNames.has(normalized)) {
    usedNames.add(normalized);
    return normalized;
  }

  let suffix = 2;
  let candidate = `${normalized}-${suffix}`;
  while (usedNames.has(candidate)) {
    suffix += 1;
    candidate = `${normalized}-${suffix}`;
  }

  usedNames.add(candidate);
  return candidate;
}
