/**
 * The first index of `items` at which `holds` is true; the number of the
 * items when it holds for none. `holds` must be false for the items before
 * some index and true from that index on, as a question about the position
 * of the items of a list in source order is. The part of the list looked at
 * is halved at each step, so the number of items read grows only with the
 * logarithm of their number.
 */
export function firstIndexWhere<Item>(
  items: readonly Item[],
  holds: (item: Item) => boolean,
): number {
  let low = 0
  let high = items.length
  while (low < high) {
    const middle = Math.floor((low + high) / 2)
    if (holds(items[middle])) {
      high = middle
    } else {
      low = middle + 1
    }
  }
  return low
}
