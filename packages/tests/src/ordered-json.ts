/**
 * A `JSON.stringify` replacer that writes the keys of every object in
 * alphabetical order, so that two values that differ only in the order of their
 * keys have the same text. Arrays keep the order of their items. Keys that are
 * array indices come first, in numeric order, as JavaScript orders the
 * properties of an object.
 */
export function orderJsonKeys(_key: string, value: unknown): unknown {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? Object.fromEntries(
        Object.entries(value).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
      )
    : value
}
