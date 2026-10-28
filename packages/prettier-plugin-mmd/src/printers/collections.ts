// Arrays that grow with the input can exceed V8's argument limit when spread
// into a function call. Keep these collection operations in loops.

/**
 * Append the items in order to the existing array, as `target.push(...items)`
 * does.
 */
export function appendItems<T>(target: T[], items: readonly T[]): void {
  // The length is read once, so an array appended to itself is appended once.
  const count = items.length
  for (let index = 0; index < count; index++) target.push(items[index])
}

/** The smallest value, or Infinity when the collection is empty. */
export function minOf(values: readonly number[]): number {
  let minimum = Infinity
  for (const value of values) minimum = Math.min(minimum, value)
  return minimum
}

/** The largest value, or -Infinity when the collection is empty. */
export function maxOf(values: readonly number[]): number {
  let maximum = -Infinity
  for (const value of values) maximum = Math.max(maximum, value)
  return maximum
}
