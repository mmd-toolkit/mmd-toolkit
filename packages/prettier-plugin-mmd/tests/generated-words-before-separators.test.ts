/**
 * Formats statements that end with a word that the lexer reads the whitespace
 * after, line feeds included, followed by a `;` and another statement. A `;`
 * and a line feed both separate statements, but after such a word a line feed
 * is read with the word: in a subgraph name, `end` takes it; after
 * `accTitle`, `direction`, and `click`, it changes the statement that follows
 * (docs/flowchart.md, Semicolons). Formatting keeps the `;` where a line
 * feed in its place would be read differently.
 */
import { describe, expect, it } from "vitest"
import type { GeneratedInput } from "./generated.ts"
import { checkGeneratedInputs, describeReport } from "./generated.ts"

/** The words of flowchart and sequence diagrams that start a statement. */
const words: readonly string[] = [
  "end",
  "End",
  "subgraph",
  "direction",
  "click",
  "call",
  "href",
  "accTitle",
  "accDescr",
  "style",
  "classDef",
  "class",
  "linkStyle",
  "default",
  "interpolate",
  "graph",
  "flowchart",
  "LR",
  "TD",
  "participant",
  "actor",
  "loop",
  "note",
  "title",
  "autonumber",
  "else",
  "and",
  "links",
  "link",
]

/** Where the word can stand at the end of a statement, by diagram type. */
const prefixesByHeader: readonly (readonly [string, readonly string[]])[] = [
  [
    "flowchart LR",
    [
      "A-->",
      "A & ",
      "subgraph ",
      "subgraph S ",
      'subgraph "S" ',
      "subgraph S[T] ",
      "class A ",
      "style A fill:",
      "style A ",
      "click A ",
      'click A href "u" ',
      "linkStyle 0 ",
      "classDef c ",
      "A:::",
      "A@{ shape: rect } ",
      "accTitle: ",
      "",
    ],
  ],
  [
    "sequenceDiagram",
    [
      "participant ",
      "participant A as ",
      "A->>",
      "A->>B: ",
      "Note over A: ",
      "Note over ",
      "loop ",
      "title ",
      "title: ",
      "activate ",
      "create participant ",
      "box ",
      "",
    ],
  ],
]

/** What can stand between the word and the next statement. */
const separators: readonly string[] = [
  ";",
  " ;",
  "; ",
  " ; ",
  ";;",
  ";\n",
  "%%{init: {}}%%;",
  " %%{init: {}}%% ;",
]

/** Every word at every place with every separator, and a next statement. */
function* makeInputs(): Generator<GeneratedInput> {
  for (const [header, prefixes] of prefixesByHeader) {
    for (const prefix of prefixes) {
      for (const word of words) {
        for (const separator of separators) {
          yield {
            text: `${header}\n${prefix}${word}${separator}B\n`,
            options: {},
          }
          yield {
            text: `${header}\n${prefix}${word}${separator}\nB\n`,
            options: {},
          }
        }
      }
    }
  }
}

describe("a statement that ends with a word, then a `;`", () => {
  it("is formatted without changing the diagram", async ({ annotate }) => {
    const report = await checkGeneratedInputs(makeInputs())
    await annotate(describeReport(report))
    expect(report.checked).toBeGreaterThan(0)
    expect(report.problems).toEqual([])
  }, 1_800_000)
})
