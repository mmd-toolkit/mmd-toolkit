import type { CheckedRoot } from "../src/check-tree/types.ts"
import { isWhitespaceAt } from "../src/db-from-tree/characters.ts"
import { positionOf } from "./check-tree-trees.ts"

// The edit of a recorded tree that the tests of the whitespace at the ends of
// tokens make: a token loses the whitespace at one of its ends. The token
// keeps the text of the source at its range, so that only the value that it
// belongs to, and the tokens around it, can tell.

/** The side of a token that loses its whitespace. */
export type TokenSide = "start" | "end"

/**
 * The tree `json` with the token `index` without the whitespace at its
 * `side`, or null when that side of the token holds none or the token is all
 * whitespace.
 */
export function withoutTokenWhitespace(
  text: string,
  json: string,
  index: number,
  side: TokenSide,
): CheckedRoot | null {
  const tree = JSON.parse(json) as CheckedRoot
  const changed = tree.tokens[index] as unknown as
    { range: [number, number]; value: string; loc: unknown } | undefined
  if (changed === undefined) return null
  let [start, end] = changed.range
  if (side === "start") {
    while (start < end - 1 && isWhitespaceAt(text, start)) start++
  } else {
    while (end > start + 1 && isWhitespaceAt(text, end - 1)) end--
  }
  if (start === changed.range[0] && end === changed.range[1]) return null
  changed.range = [start, end]
  changed.value = text.slice(start, end)
  changed.loc = { start: positionOf(text, start), end: positionOf(text, end) }
  return tree
}
