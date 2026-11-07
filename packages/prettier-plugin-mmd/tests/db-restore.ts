import type { JsonValue } from "@mmd-toolkit/tests"
import { objectOf } from "./db-values.ts"

/** A place in a Db: the names of the keys down to a value, without indices. */
export type DbPath = readonly string[]

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
  const written = objectOf(before)
  const printed = objectOf(after)
  if (written !== undefined && printed !== undefined) {
    return Object.fromEntries(
      Object.entries(printed).map(([name, value]) => [
        name,
        name in written
          ? restoreStrings(written[name], value, restoreString, [...path, name])
          : value,
      ]),
    )
  }
  return after
}
