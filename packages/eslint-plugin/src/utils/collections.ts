// Arrays that grow with the input can exceed V8's argument limit when spread
// into a function call. Append their items one at a time.

/**
 * Append the items in order to the existing array, as `target.push(...items)`
 * does.
 */
export function appendItems<T>(target: T[], items: readonly T[]): void {
  // The length is read once, so an array appended to itself is appended once.
  const count = items.length
  for (let index = 0; index < count; index++) target.push(items[index])
}
