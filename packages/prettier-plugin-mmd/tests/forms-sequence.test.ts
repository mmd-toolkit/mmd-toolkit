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
 *
 * The axes of a form are combined so that every pair of values of two axes
 * stands together somewhere (see `pairwise.ts`).
 */
import type { GeneratedInput } from "./generated.ts"
import { defineCheckedGroups } from "./checked-groups.ts"
import { pairwiseIndexes } from "./pairwise.ts"

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

/** The messages: a source, a target, an arrow, marks, a spacing, and a text. */
function makeMessages(): GeneratedInput[] {
  return pairwiseIndexes([
    ids.length,
    ids.length,
    arrows.length,
    markPairs.length,
    spacings.length,
    texts.length,
  ]).map(([from, to, arrow, marks, spacing, text]) =>
    message(
      ids[from],
      arrows[arrow],
      ids[to],
      markPairs[marks],
      spacings[spacing],
      texts[text],
    ),
  )
}

/** The ids spelled as a keyword or near a number, as the source and as the target. */
function makeSpecialIds(): GeneratedInput[] {
  const special = [...keywordIds, ...nearNumbers]
  return pairwiseIndexes([
    special.length,
    2,
    markPairs.length,
    spacings.length,
  ]).map(([id, side, marks, spacing]) =>
    side === 0
      ? message(
          special[id],
          arrows[0],
          "B",
          markPairs[marks],
          spacings[spacing],
          texts[0],
        )
      : message(
          "A",
          arrows[0],
          special[id],
          markPairs[marks],
          spacings[spacing],
          texts[0],
        ),
  )
}

defineCheckedGroups("sequence messages", [
  ["messages", makeMessages()],
  ["ids spelled as a keyword or near a number", makeSpecialIds()],
])
