export function matchesMenuSearch(
  item: { name: string; description: string },
  query: string,
): boolean {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return true;

  const haystack = `${item.name} ${item.description}`.toLowerCase();
  const terms = trimmed.split(/\s+/).filter(Boolean);
  return terms.every((term) => haystack.includes(term));
}
