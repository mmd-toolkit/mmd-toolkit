import type { C4NamedAttribute } from "../../ast/c4.ts"

/** The converted identity of a C4 target; named attributes keep object identity. */
export type TargetIdentity = string | number | C4NamedAttribute | undefined

/** The source order of an entry's first declaration, unchanged by assignments. */
interface Declaration {
  readonly order: number
}

/** An alias uses the first key only; a relationship uses both ordered endpoints. */
type TargetKeys = readonly [TargetIdentity, TargetIdentity]

/**
 * Current C4 targets, indexed by identity. Each bucket is a heap in original
 * declaration order, so alias/endpoint assignments can merge buckets without
 * rescanning every declaration. Stale entries are discarded when reached;
 * each assignment adds at most one heap entry.
 */
export class DeclarationIndex<Entry extends Declaration> {
  private readonly buckets = new Map<
    TargetIdentity,
    Map<TargetIdentity, Entry[]>
  >()

  private readonly keysOf: (entry: Entry) => TargetKeys

  public constructor(keysOf: (entry: Entry) => TargetKeys) {
    this.keysOf = keysOf
  }

  /** Keep a newly declared entry under its current keys. */
  public add(entry: Entry): void {
    const [first, second] = this.keysOf(entry)
    if (Number.isNaN(first) || Number.isNaN(second)) return
    let bySecond = this.buckets.get(first)
    if (bySecond === undefined) {
      bySecond = new Map()
      this.buckets.set(first, bySecond)
    }
    let bucket = bySecond.get(second)
    if (bucket === undefined) {
      bucket = []
      bySecond.set(second, bucket)
    }
    let index = bucket.length
    bucket.push(entry)
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2)
      if (bucket[parent].order <= entry.order) break
      bucket[index] = bucket[parent]
      index = parent
    }
    bucket[index] = entry
  }

  /** The first declaration whose current keys strictly equal the requested keys. */
  public first(
    first: TargetIdentity,
    second?: TargetIdentity,
  ): Entry | undefined {
    const bucket = this.buckets.get(first)?.get(second)
    if (bucket === undefined) return undefined
    while (bucket.length > 0) {
      const entry = bucket[0]
      const current = this.keysOf(entry)
      if (current[0] === first && current[1] === second) return entry
      this.removeFirst(bucket)
    }
    return undefined
  }

  /** Apply assignments and retain the entry under its new keys when they changed. */
  public update(entry: Entry, assign: () => void): void {
    const before = this.keysOf(entry)
    assign()
    const after = this.keysOf(entry)
    if (before[0] !== after[0] || before[1] !== after[1]) this.add(entry)
  }

  /** Remove the heap's first entry and restore declaration order. */
  private removeFirst(bucket: Entry[]): void {
    const last = bucket.pop()!
    if (bucket.length === 0) return
    let index = 0
    while (index * 2 + 1 < bucket.length) {
      const left = index * 2 + 1
      const right = left + 1
      const child =
        right < bucket.length && bucket[right].order < bucket[left].order
          ? right
          : left
      if (last.order <= bucket[child].order) break
      bucket[index] = bucket[child]
      index = child
    }
    bucket[index] = last
  }
}
