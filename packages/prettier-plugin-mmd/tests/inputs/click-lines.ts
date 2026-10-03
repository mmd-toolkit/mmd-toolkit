/**
 * Formats click statements written over several lines: a line break in the
 * place of each space, alone and in every place at once, with or without
 * indentation, and with whitespace before the line break. mermaid.js accepts
 * a line break inside a click statement, but not always whitespace after it,
 * so formatting keeps the lines of such a statement as written
 * (docs/flowchart.md, Multi-line statements).
 */
import type { GeneratedInput } from "../generated.ts"

/** The click statements of each diagram type that has them. */
const clickStatementsByHeader: readonly (readonly [
  string,
  readonly string[],
])[] = [
  [
    "flowchart LR",
    [
      'click A href "u"',
      'click A "u"',
      'click A href "u" "tip"',
      'click A href "u" "tip" _blank',
      'click A "u" "tip" _self',
      "click A call cb",
      "click A call cb()",
      "click A call cb(x, y)",
      'click A call cb(x) "tip"',
      "click A cb",
      'click A cb "tip"',
      'click A href "u" _blank',
    ],
  ],
  [
    "classDiagram",
    [
      'click A href "u"',
      'click A href "u" "tip"',
      'click A href "u" "tip" _blank',
      "click A call cb()",
      'click A call cb(x) "tip"',
      "click A cb",
    ],
  ],
  [
    "stateDiagram-v2",
    ['click A href "u"', 'click A "u" "t"', 'click A href "u" "t"'],
  ],
]

/** What stands in the place of a space. */
const breaks: readonly string[] = ["\n", "\n  ", "\n\t", " \n", " \n  ", "\r\n"]

/** What follows the statement. */
const tails: readonly string[] = ["", "\nB", ";B", " accDescr {}", ";\nB"]

/** The statement with its `index`-th space replaced, or every one. */
function withBreak(statement: string, index: number, text: string): string {
  const parts = statement.split(" ")
  return parts.reduce(
    (joined, part, position) =>
      position === 0
        ? part
        : `${joined}${index === -1 || position - 1 === index ? text : " "}${part}`,
    "",
  )
}

/** Every statement with a line break in each place, and in all places. */
export function* makeInputs(): Generator<GeneratedInput> {
  for (const [header, statements] of clickStatementsByHeader) {
    for (const statement of statements) {
      const spaces = statement.split(" ").length - 1
      for (const [breakIndex, text] of breaks.entries()) {
        for (let index = -1; index < spaces; index++) {
          // The tail takes turns from one break and place to the next.
          const tail = tails[(breakIndex + index + 1) % tails.length]
          yield {
            text: `${header}\n${withBreak(statement, index, text)}${tail}\n`,
            options: {},
          }
        }
      }
    }
  }
}
