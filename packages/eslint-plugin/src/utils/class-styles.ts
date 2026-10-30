/** A whole replacement loses a style only when an earlier property is dropped or changed. */
export function dropsOrChangesStyles(
  previous: ReadonlyMap<string, string | number>,
  next: ReadonlyMap<string, string | number>,
): boolean {
  return [...previous].some(([name, value]) => next.get(name) !== value)
}
