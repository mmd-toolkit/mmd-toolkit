import type { JsonObject, JsonValue } from "../types.ts"

/**
 * Converts Db data to plain JSON.
 *
 * - `Map` and `Set` become arrays of their values, in insertion order. (Map
 *   keys are dropped: Db maps are keyed by a field the values carry, and
 *   turning them into object keys would reorder integer-like ids.)
 * - `undefined` properties and functions are dropped.
 * - Other objects keep their own enumerable properties in insertion order,
 *   whatever their names: a property named `__proto__` stays a property.
 *
 * Throws on values JSON cannot represent faithfully, so a change in mermaid
 * surfaces as an error instead of a silent `null`.
 */
export function toJson(value: unknown): JsonValue {
  const converted = convert(value, [])
  if (converted === undefined) {
    throw new TypeError("toJson: the value itself is undefined or a function")
  }
  return converted
}

/**
 * {@link toJson} for a value that must be an object.
 */
export function toJsonObject(value: unknown): JsonObject {
  const converted = toJson(value)
  if (
    typeof converted !== "object" ||
    converted === null ||
    Array.isArray(converted)
  ) {
    throw new TypeError("toJsonObject: the value is not an object")
  }
  return converted as JsonObject
}

/**
 * Returns a copy of `object` without the given keys. Every other own
 * enumerable property is kept, whatever its name (see {@link ownProperties}).
 */
export function omit(object: JsonObject, keys: readonly string[]): JsonObject {
  return ownProperties(
    Object.entries(object).filter(([key]) => !keys.includes(key)),
  )
}

/**
 * Builds an object from key and value pairs, in order, as own properties.
 * Assigning `result[key] = value` would not do for the key `__proto__`: it
 * sets the prototype instead of creating a property, and the data is lost.
 * `Object.fromEntries()` defines each pair as an own property.
 */
export function ownProperties(
  entries: Iterable<readonly [string, JsonValue]>,
): JsonObject {
  return Object.fromEntries(entries)
}

/**
 * Converts one value; `undefined` means "drop it".
 */
function convert(value: unknown, path: string[]): JsonValue | undefined {
  switch (typeof value) {
    case "undefined":
    case "function":
      return undefined
    case "string":
    case "boolean":
      return value
    case "number":
      if (!Number.isFinite(value)) {
        throw new TypeError(`toJson: non-finite number at ${where(path)}`)
      }
      return value
    case "bigint":
    case "symbol":
      throw new TypeError(`toJson: ${typeof value} at ${where(path)}`)
    case "object":
    default:
      break
  }
  return value === null ? null : convertObject(value as object, path)
}

/**
 * Converts a non-null object: a collection to an array, a plain object to an
 * object.
 */
function convertObject(value: object, path: string[]): JsonValue {
  if (value instanceof Map) {
    return convertList([...value.values()], path)
  }
  if (value instanceof Set || Array.isArray(value)) {
    return convertList([...(value as Iterable<unknown>)], path)
  }
  const proto: unknown = Object.getPrototypeOf(value)
  if (proto !== Object.prototype && proto !== null) {
    throw new TypeError(
      `toJson: instance of ${value.constructor.name} at ${where(path)}`,
    )
  }
  const entries: [string, JsonValue][] = []
  for (const [key, child] of Object.entries(value)) {
    const converted = convert(child, [...path, key])
    if (converted !== undefined) entries.push([key, converted])
  }
  return ownProperties(entries)
}

/**
 * Converts array items, keeping positions (dropped items become null).
 */
function convertList(items: unknown[], path: string[]): JsonValue[] {
  return items.map((item, index) => {
    const converted = convert(item, [...path, String(index)])
    // Keep positions stable, as JSON.stringify does for arrays.
    return converted === undefined ? null : converted
  })
}

/**
 * Formats a property path for error messages.
 */
function where(path: string[]): string {
  return path.length ? path.join(".") : "(root)"
}
