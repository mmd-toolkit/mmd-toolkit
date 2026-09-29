/**
 * Checks which ids the sequence printer takes for ids that a following
 * space would make another unit: a number of rule 5 and `title` of rule 13
 * of the statement context (diagrams/sequence.md), next to which no space is
 * put around an arrow (docs/sequence.md, Arrow spacing).
 */
import { describe, expect, it } from "vitest"
import { isReadOtherwiseBeforeWhitespace } from "../src/printers/sequence-layout.ts"

describe("ids read otherwise before whitespace", () => {
  it.each(["1", "05", "10", "1.5", "1.25", ".5", ".25"])(
    "include the number %s",
    (id) => {
      expect(isReadOtherwiseBeforeWhitespace(id)).toBe(true)
    },
  )

  it.each(["1.", "1.234", ".", ".125", "1e3", "1a", "a1", "1..5", "-1", ""])(
    "leave out %j, which is no number",
    (id) => {
      expect(isReadOtherwiseBeforeWhitespace(id)).toBe(false)
    },
  )

  it.each(["title", "TITLE", "Title", "tItLe"])("include %s", (id) => {
    expect(isReadOtherwiseBeforeWhitespace(id)).toBe(true)
  })

  it.each(["titles", "title:", "ti tle", "accTitle", "loop", "as", "left"])(
    "leave out %s",
    (id) => {
      expect(isReadOtherwiseBeforeWhitespace(id)).toBe(false)
    },
  )
})
