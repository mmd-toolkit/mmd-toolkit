import type { DataBlockEffect, JsonObject, JsonValue } from "../types.ts"

/**
 * The effects of the `@{ ... }` data blocks of each Db, in the order mermaid
 * applied them. A Db patch (see `DbPatch`) records them while mermaid parses;
 * `runMermaid()` reads them once the Db is built.
 */
const effects: WeakMap<object, DataBlockEffect[]> = new WeakMap()

/**
 * The first problem found while recording the effects of a Db.
 */
const problems: WeakMap<object, string> = new WeakMap()

/**
 * Records the effect of the next data block of `db`.
 */
export function recordDataBlockEffect(
  db: object,
  effect: DataBlockEffect,
): void {
  const list = effects.get(db) ?? []
  list.push(effect)
  effects.set(db, list)
}

/**
 * Records that the effects of `db` cannot be told apart, for example because
 * a block changed two elements. The patch records the problem instead of
 * throwing, since `mermaid.parse()` would report an error thrown while parsing
 * as a rejection of the input; {@link dataBlockEffectsOf} throws it.
 */
export function recordDataBlockProblem(db: object, problem: string): void {
  if (!problems.has(db)) problems.set(db, problem)
}

/**
 * Returns the recorded effects of the data blocks of `db`, in the order mermaid
 * applied them: empty when the text has no data blocks, or when the Db patch of
 * its diagram type does not record them.
 */
export function dataBlockEffectsOf(db: object): readonly DataBlockEffect[] {
  const problem = problems.get(db)
  if (problem) throw new Error(`cannot record data block effects: ${problem}`)
  return effects.get(db) ?? []
}

/**
 * The fields one data block changed, from the element summaries before and
 * after it, or a description of why the change is not one block's effect on
 * one element. The summaries are keyed by element (`vertex A`, `actor B`);
 * a Db patch makes them with the diagram type's normalizer.
 */
export function blockEffect(
  before: ReadonlyMap<string, JsonObject>,
  after: ReadonlyMap<string, JsonObject>,
): JsonObject | string {
  for (const key of before.keys()) {
    if (!after.has(key)) return `it removed ${key}`
  }
  const changed: { key: string; set: JsonObject }[] = []
  for (const [key, element] of after) {
    const previous = before.get(key)
    if (!previous) return `it created ${key}`
    const set: Record<string, JsonValue> = {}
    for (const field of new Set([
      ...Object.keys(previous),
      ...Object.keys(element),
    ])) {
      const value = element[field]
      if (JSON.stringify(previous[field]) === JSON.stringify(value)) continue
      if (value === undefined) return `it removed ${key}.${field}`
      set[field] = value
    }
    if (Object.keys(set).length) changed.push({ key, set })
  }
  if (changed.length > 1) {
    return `it changed ${changed.map((item) => item.key).join(", ")}`
  }
  return changed[0]?.set ?? {}
}
