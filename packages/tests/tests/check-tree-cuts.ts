import type { CheckedRoot } from "../src/check-tree/types.ts"
import { positionOf } from "./check-tree-trees.ts"

// The edit of a recorded tree that the tests of the cut tokens make: a
// directive, or a `;` that the line rule ignores, is written inside a token,
// and the tree is changed as a parser would record the new text: the token is
// split into two with the cut between them, and every range after the cut is
// moved. The kinds of the two halves are given by the test.

/** What is written inside a token. */
export type Cut = "directive" | "ignored-semicolon"

const CUT_TEXTS: Readonly<Record<Cut, string>> = {
  directive: "%%{init: {}}%%",
  "ignored-semicolon": ";",
}

/** An object of the tree with a range. */
interface Ranged {
  range: [number, number]
  loc?: unknown
  raw?: unknown
  value?: unknown
}

/** Whether `value` is an object of the tree with a range. */
function isRanged(value: unknown): value is Ranged {
  if (typeof value !== "object" || value === null) return false
  const { range } = value as { range?: unknown }
  return (
    Array.isArray(range) &&
    range.length === 2 &&
    typeof range[0] === "number" &&
    typeof range[1] === "number"
  )
}

/** Calls `visit` on every object of `value` that has a range, `value` included. */
function forEachRanged(value: unknown, visit: (ranged: Ranged) => void): void {
  if (Array.isArray(value)) {
    for (const entry of value) forEachRanged(entry, visit)
    return
  }
  if (typeof value !== "object" || value === null) return
  if (isRanged(value)) visit(value)
  for (const entry of Object.values(value)) forEachRanged(entry, visit)
}

/** The text and the tree after a cut is written inside a token. */
export interface Cutted {
  readonly text: string
  readonly tree: CheckedRoot
}

/**
 * The source `text` of the recorded tree `json` with `cut` written at
 * `offset`, which lies inside the token `index`, and the tree for it: that
 * token is two tokens of the types `before` and `after`, with the `Directive`
 * or `IgnoredSemicolon` token between them.
 */
export function cutToken(
  text: string,
  json: string,
  index: number,
  offset: number,
  cut: Cut,
  types: { readonly before: string; readonly after: string },
): Cutted {
  const tree = JSON.parse(json) as CheckedRoot
  const written = CUT_TEXTS[cut]
  const length = written.length
  const newText = text.slice(0, offset) + written + text.slice(offset)
  // Move every range, before the split tokens are added.
  forEachRanged(tree, (ranged) => {
    const [start, end] = ranged.range
    ranged.range = [
      start >= offset ? start + length : start,
      end > offset ? end + length : end,
    ]
  })
  const token = tree.tokens[index] as unknown as Ranged
  const [start, end] = token.range

  /** A half of the split token: of the type `type`, over `range`. */
  function piece(type: string, range: [number, number]): Ranged {
    return { ...({ type } as object), range, value: newText.slice(...range) }
  }

  // The token's range grew by the cut: its halves are what lies around it.
  const tokens = tree.tokens as unknown as unknown[]
  tokens.splice(
    index,
    1,
    piece(types.before, [start, offset]),
    {
      type: cut === "directive" ? "Directive" : "IgnoredSemicolon",
      range: [offset, offset + length],
      value: written,
    },
    piece(types.after, [offset + length, end]),
  )
  if (cut === "directive") {
    const directives = tree.directives as unknown as unknown[]
    directives.push({
      type: "Directive",
      name: "init",
      value: "init: {}",
      closed: true,
      range: [offset, offset + length],
    })
    directives.sort((a, b) => (a as Ranged).range[0] - (b as Ranged).range[0])
  }
  forEachRanged(tree, (ranged) => {
    ranged.loc = {
      start: positionOf(newText, ranged.range[0]),
      end: positionOf(newText, ranged.range[1]),
    }
    if (typeof ranged.raw === "string") {
      ranged.raw = newText.slice(...ranged.range)
    }
  })
  return { text: newText, tree }
}
