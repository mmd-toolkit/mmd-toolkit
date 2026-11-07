import type { JsonValue } from "@mmd-toolkit/tests"

/** A place in a Db: the names of the keys down to a value, without indices. */
export type DbPath = readonly string[]

/** Whether a JSON value is an object. */
function isObject(
  value: JsonValue,
): value is { readonly [key: string]: JsonValue } {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

/**
 * The Db of a formatted text `after` with each string replaced by
 * `restoreString(written, printed, path)`, where `written` is the string at the
 * same place of the Db of the written text `before`. A place that `before`
 * does not hold, and an array of another length, stay as `after` has them.
 */
export function restoreStrings(
  before: JsonValue,
  after: JsonValue,
  restoreString: (written: string, printed: string, path: DbPath) => string,
  path: DbPath = [],
): JsonValue {
  if (typeof before === "string" && typeof after === "string")
    return restoreString(before, after, path)
  if (Array.isArray(before) && Array.isArray(after)) {
    if (before.length !== after.length) return after
    return after.map((item, index) =>
      restoreStrings(before[index], item, restoreString, path),
    )
  }
  if (isObject(before) && isObject(after)) {
    return Object.fromEntries(
      Object.entries(after).map(([name, value]) => [
        name,
        name in before
          ? restoreStrings(before[name], value, restoreString, [...path, name])
          : value,
      ]),
    )
  }
  return after
}
