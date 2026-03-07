export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function problemPath(title: string, id: number): string {
  void id;
  return `/problems/${slugify(title)}`;
}

export function extractProblemId(value: string): number | null {
  const direct = Number(value);
  if (Number.isInteger(direct)) return direct;

  const match = value.match(/-(\d+)$/);
  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isInteger(parsed) ? parsed : null;
}
