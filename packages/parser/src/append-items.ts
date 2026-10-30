/**
 * Append `items` to `target` in order, as `target.push(...items)` does.
 * Input-sized arrays must not be spread into a call: V8 limits the number of
 * function arguments.
 */
export function appendItems<T>(target: T[], items: readonly T[]): void {
  // The length is read once, so an array appended to itself is appended once.
  const count = items.length
  for (let index = 0; index < count; index++) target.push(items[index])
}
