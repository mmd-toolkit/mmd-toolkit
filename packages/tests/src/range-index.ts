import type { TreeRange } from "./db-from-tree/tree.ts"

/** The first index whose offset is at least `offset`, or the length. */
export function indexAtOrAfter(
  offsets: readonly number[],
  offset: number,
): number {
  let from = 0
  let to = offsets.length
  while (from < to) {
    const middle = Math.floor((from + to) / 2)
    if ((offsets[middle] ?? Infinity) < offset) from = middle + 1
    else to = middle
  }
  return from
}

/** Source ranges indexed once for repeated local reads. */
export class RangeIndex<T extends { readonly range: TreeRange }> {
  private readonly items: readonly T[]

  private readonly starts: readonly number[]

  private readonly furthestEnds: readonly number[]

  private readonly ordered: boolean

  public constructor(items: readonly T[]) {
    this.items = items
    // Valid source lists allow bounded reads; broken lists retain their original
    // search order so that checking a malformed tree reports the same problems.
    this.ordered = items.every(
      (item, index) =>
        index === 0 || item.range[0] >= (items[index - 1]?.range[0] ?? 0),
    )
    const byStart = this.ordered
      ? items
      : items.toSorted((a, b) => a.range[0] - b.range[0])
    this.starts = byStart.map((item) => item.range[0])
    let furthest = -Infinity
    this.furthestEnds = byStart.map((item) => {
      furthest = Math.max(furthest, item.range[1])
      return furthest
    })
  }

  /** Entries starting at or after `offset`, in their original order. */
  public *from(offset: number): IterableIterator<T> {
    const first = this.ordered ? indexAtOrAfter(this.starts, offset) : 0
    for (let at = first; at < this.items.length; at++) {
      const item = this.items[at]
      if (item !== undefined && item.range[0] >= offset) yield item
    }
  }

  /** The first entry starting at or after `offset` that satisfies `accept`. */
  public firstFrom(
    offset: number,
    accept: (item: T) => boolean = () => true,
  ): T | undefined {
    for (const item of this.from(offset)) if (accept(item)) return item
    return undefined
  }

  /** Entries wholly inside `range`, including empty ranges at either end. */
  public in(range: TreeRange): T[] {
    /** Whether the whole entry lies in the requested range. */
    function inside(item: T): boolean {
      return range[0] <= item.range[0] && item.range[1] <= range[1]
    }

    if (!this.ordered) return this.items.filter(inside)
    const result: T[] = []
    for (
      let at = indexAtOrAfter(this.starts, range[0]);
      at < this.items.length;
      at++
    ) {
      const item = this.items[at]
      if (item === undefined || item.range[0] > range[1]) break
      if (inside(item)) result.push(item)
    }
    return result
  }

  /**
   * Entries that start before `range` ends and end after it starts, in their
   * original order. Entries and ranges that share a character qualify; so does
   * an empty entry or an empty range that lies strictly inside the other, not
   * at an end of it.
   */
  public overlapping(range: TreeRange): T[] {
    /** Whether the entry overlaps the requested range. */
    function overlaps(item: T): boolean {
      return item.range[0] < range[1] && range[0] < item.range[1]
    }

    if (!this.ordered) return this.items.filter(overlaps)
    const result: T[] = []
    for (
      let at = indexAtOrAfter(this.furthestEnds, range[0] + 1);
      at < this.items.length;
      at++
    ) {
      const item = this.items[at]
      if (item === undefined || item.range[0] >= range[1]) break
      if (overlaps(item)) result.push(item)
    }
    return result
  }

  /** Whether one entry contains all of `range`; adjacent entries are not joined. */
  public hasContaining(range: TreeRange): boolean {
    const last = indexAtOrAfter(this.starts, range[0] + 1) - 1
    return last >= 0 && (this.furthestEnds[last] ?? -Infinity) >= range[1]
  }
}
