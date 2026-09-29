/**
 * Formats sequence messages of many forms, where formatting adds one space
 * before and after the arrow and one after the `:` (docs/sequence.md, Arrow
 * spacing and Colons): ids with whitespace, `-`, `/`, parentheses, `#`, or
 * the form of a number; every arrow; `()` before the arrow; `+`, `-`, or
 * `()` after it; whitespace on either side of the arrow or none; and texts
 * that start with `%%` or a wrap prefix. Ids spelled as a keyword or near
 * the form of a number are written as the source and as the target, since
 * a number and `title` take the whitespace after them (docs/sequence.md,
 * Arrow spacing); the spellings that mermaid.js rejects are checked for
 * being left unchanged.
 */
import { describe, expect, it } from "vitest"
import type { GeneratedInput } from "./generated.ts"
import { checkGeneratedInputs, describeReport } from "./generated.ts"

/** Ids of every form that an id run may have. */
const ids: readonly string[] = [
  "A",
  "Alice Smith",
  "A-B",
  "A/B",
  "A(B)",
  "a#b",
  "x",
  "1",
  "2.5",
  ".5",
  "10",
]

/** The keywords of the statement context (diagrams/sequence.md). */
const keywords: readonly string[] = [
  "participant",
  "actor",
  "note",
  "loop",
  "alt",
  "opt",
  "par",
  "par_over",
  "and",
  "else",
  "end",
  "rect",
  "box",
  "break",
  "critical",
  "option",
  "activate",
  "deactivate",
  "create",
  "destroy",
  "autonumber",
  "off",
  "link",
  "links",
  "properties",
  "details",
  "title",
  "accTitle",
  "accDescr",
  "as",
  "over",
  "left",
  "right",
  "of",
]

/** Spellings at the edges of the form of a number (rule 5). */
const nearNumbers: readonly string[] = [
  "1.",
  "1.234",
  "1e3",
  "05",
  "1a",
  ".5",
  "1.5",
]

/** Each keyword as written, in upper case, and with a capital first letter. */
const keywordIds: readonly string[] = keywords.flatMap((keyword) => [
  ...new Set([
    keyword,
    keyword.toUpperCase(),
    keyword.charAt(0).toUpperCase() + keyword.slice(1),
  ]),
])

/** Every arrow (diagrams/sequence.md, The statement context, rule 22). */
const arrows: readonly string[] = [
  "->>",
  "<<->>",
  "-->>",
  "<<-->>",
  "->",
  "-->",
  "-x",
  "--x",
  "-)",
  "--)",
  "--|\\",
  "--|/",
  "--\\\\",
  "--//",
  "/|--",
  "\\|--",
  "//--",
  "\\\\--",
  "-|\\",
  "-|/",
  "-\\\\",
  "-//",
  "/|-",
  "\\|-",
  "//-",
  "\\\\-",
]

/** What may stand before the arrow, and after it. */
const marksBefore: readonly string[] = ["", "()"]
const marksAfter: readonly string[] = ["", "+", "-", "()"]

/** The whitespace written on each side of the arrow. */
const spacings: readonly (readonly [string, string])[] = [
  ["", ""],
  [" ", " "],
  ["", " "],
  [" ", ""],
]

/** What follows the target. */
const texts: readonly string[] = [
  ": x",
  ":x",
  ":",
  ": %% c",
  ":%% c",
  ": wrap:x",
]

/** A message, with the activation that a `-` needs before it. */
function message(
  from: string,
  arrow: string,
  to: string,
  marks: readonly [string, string],
  spacing: readonly [string, string],
  text: string,
): GeneratedInput {
  const [before, after] = marks
  const [left, right] = spacing
  const activation = after === "-" ? `activate ${from}\n` : ""
  const line = `${from}${before}${left}${arrow}${right}${after}${to}${text}`
  return { text: `sequenceDiagram\n${activation}${line}\n`, options: {} }
}

/** The mark combinations that the grammar allows. */
const markPairs: readonly (readonly [string, string])[] = marksBefore.flatMap(
  (before) =>
    marksAfter
      .filter((after) => before === "" || (after !== "+" && after !== "-"))
      .map((after) => [before, after] as const),
)

/**
 * Every pair of ids with the first arrow, with every mark, no whitespace or
 * one space on both sides of the arrow, and two texts; and every arrow with
 * two plain ids, with every mark, spacing, and text; and every keyword
 * spelling and spelling near a number on either side of the first arrow,
 * with every mark and spacing.
 */
function* makeInputs(): Generator<GeneratedInput> {
  for (const from of ids) {
    for (const to of ids) {
      for (const marks of markPairs) {
        for (const spacing of spacings.slice(0, 2)) {
          for (const text of [texts[0], texts[4]]) {
            yield message(from, arrows[0], to, marks, spacing, text)
          }
        }
      }
    }
  }
  for (const arrow of arrows.slice(1)) {
    for (const marks of markPairs) {
      for (const spacing of spacings) {
        for (const text of texts) {
          yield message(ids[0], arrow, "B", marks, spacing, text)
        }
      }
    }
  }
  for (const id of [...keywordIds, ...nearNumbers]) {
    for (const marks of markPairs) {
      for (const spacing of spacings) {
        yield message(id, arrows[0], "B", marks, spacing, texts[0])
        yield message("A", arrows[0], id, marks, spacing, texts[0])
      }
    }
  }
}

describe("sequence messages", () => {
  it("are formatted without changing the diagram", async ({ annotate }) => {
    const report = await checkGeneratedInputs(makeInputs())
    await annotate(describeReport(report))
    expect(report.checked).toBeGreaterThan(0)
    expect(report.problems).toEqual([])
  }, 3_600_000)
})
