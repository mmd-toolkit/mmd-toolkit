/**
 * Classifies how a regenerated `expected.json` differs from the recorded one,
 * so that a change of the pinned mermaid.js can be sorted by what it concerns.
 * The generator prints one line per changed fixture with this classification.
 */
import type { Expectation } from "./index.ts"
import type { JsonValue } from "./types.ts"

/**
 * How the expectation of a fixture changed. When several things changed, the
 * first kind in this order is reported: acceptance, detection, summary fields,
 * Db values.
 */
export type ExpectedChange =
  /** mermaid.js accepted the input and now rejects it, or the reverse. */
  | {
      readonly kind: "acceptance"
      readonly previous: Expectation
      readonly next: Expectation
    }
  /** Both accepted, and the diagram id detected differs. */
  | {
      readonly kind: "detection"
      readonly previous: string
      readonly next: string
    }
  /**
   * Both accepted, and the summary has keys that the other lacks. The keys
   * include those an author writes (the contents of a data block, props), so
   * a change of input-written keys shows here too.
   */
  | {
      readonly kind: "summary-fields"
      readonly added: readonly string[]
      readonly removed: readonly string[]
    }
  /** Both accepted with the same keys, and some value differs. */
  | { readonly kind: "db-values" }
  /** Both rejected, and the name of the error differs. */
  | {
      readonly kind: "error-name"
      readonly previous: string
      readonly next: string
    }
  /** Both rejected with the same name, and only the message differs. */
  | { readonly kind: "error-message" }
  /** The expectation is the same; only the text of the file differs. */
  | { readonly kind: "format" }

/**
 * Returns how `next` differs from `previous`. Call it only for a fixture whose
 * file would change.
 */
export function classifyExpectedChange(
  previous: Expectation,
  next: Expectation,
): ExpectedChange {
  if (previous.accepted !== next.accepted) {
    return { kind: "acceptance", previous, next }
  }
  if (previous.accepted && next.accepted) {
    if (previous.diagramType !== next.diagramType) {
      return {
        kind: "detection",
        previous: previous.diagramType,
        next: next.diagramType,
      }
    }
    const previousPaths = keyPaths(previous.db)
    const nextPaths = keyPaths(next.db)
    const added = [...nextPaths].filter((key) => !previousPaths.has(key))
    const removed = [...previousPaths].filter((key) => !nextPaths.has(key))
    if (added.length || removed.length) {
      return { kind: "summary-fields", added, removed }
    }
    if (JSON.stringify(previous.db) !== JSON.stringify(next.db)) {
      return { kind: "db-values" }
    }
    return { kind: "format" }
  }
  if (!previous.accepted && !next.accepted) {
    if (previous.error.name !== next.error.name) {
      return {
        kind: "error-name",
        previous: previous.error.name,
        next: next.error.name,
      }
    }
    if (previous.error.message !== next.error.message) {
      return { kind: "error-message" }
    }
  }
  return { kind: "format" }
}

/**
 * Formats a change on one line, as the generator prints it.
 */
export function describeExpectedChange(change: ExpectedChange): string {
  switch (change.kind) {
    case "acceptance":
      return `acceptance: ${describeOutcome(change.previous)} -> ${describeOutcome(change.next)}`
    case "detection":
      return `detection: ${change.previous} -> ${change.next}`
    case "summary-fields":
      return [
        "summary fields:",
        ...change.added.map((key) => `+${key}`),
        ...change.removed.map((key) => `-${key}`),
      ].join(" ")
    case "db-values":
      return "Db values"
    case "error-name":
      return `error name: ${change.previous} -> ${change.next}`
    case "error-message":
      return "error message only"
    case "format":
      return "file format only"
    default:
      throw new Error(
        `unknown change: ${JSON.stringify(change satisfies never)}`,
      )
  }
}

/**
 * Formats an expectation as `accepted (<diagram id>)` or
 * `rejected (<error name>)`.
 */
function describeOutcome(expectation: Expectation): string {
  return expectation.accepted
    ? `accepted (${expectation.diagramType})`
    : `rejected (${expectation.error.name})`
}

/**
 * Returns the path of every key in a summary, with `[]` for an array item:
 * `vertices[].styles` for the styles of any vertex. A summary that is `null`
 * has none.
 */
function keyPaths(value: JsonValue, prefix = ""): Set<string> {
  const paths = new Set<string>()
  if (Array.isArray(value)) {
    for (const item of value) {
      for (const key of keyPaths(item, `${prefix}[]`)) paths.add(key)
    }
  } else if (value !== null && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      const path = prefix ? `${prefix}.${key}` : key
      paths.add(path)
      for (const inner of keyPaths(item, path)) paths.add(inner)
    }
  }
  return paths
}
