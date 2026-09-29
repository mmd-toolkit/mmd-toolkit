/**
 * Formats two statements joined by a `;`, at the top level and inside a
 * block, for each diagram type that has a printer. Formatting puts them on
 * lines of their own, and after some words the lexer reads a line break
 * with the word where it does not read a `;`: in a flowchart, `accTitle ; :`
 * is two vertices, while `accTitle` and `:` on two lines is an
 * accessibility title. The printer then keeps the line as written (see
 * `findFlowchartKeptLines`).
 */
import { describe, expect, it } from "vitest"
import type { GeneratedInput } from "./generated.ts"
import { checkGeneratedInputs, describeReport } from "./generated.ts"

/**
 * Flowchart statements of each kind, and words that start statements used
 * as ids.
 */
const flowchartStatements: readonly string[] = [
  "A",
  "A-->B",
  "A[x]",
  "A-- t -->B",
  "style A fill:red",
  "classDef c fill:red",
  "class A c",
  "click A cb",
  'click A href "u"',
  "linkStyle 0 stroke:red",
  "linkStyle default stroke:red",
  "accTitle: t",
  "accDescr: d",
  "accDescr { d }",
  "direction TB",
  "accTitle",
  "accDescr",
  "direction",
  "click",
  "call",
  "href",
  "callback",
  "default",
  "style",
  "classDef",
  "class",
  "linkStyle",
  "interpolate",
  "TB",
  ":",
]

/**
 * Sequence statements of each kind, and words that start statements used as
 * ids.
 */
const sequenceStatements: readonly string[] = [
  "A->>B: x",
  "A->>B:",
  "participant A",
  "actor A as Alice",
  'participant A@{ "type": "queue" }',
  "autonumber",
  "autonumber 5",
  "autonumber off",
  "activate A",
  "note over A: n",
  "note left of A: n",
  'links A: {"a": "b"}',
  "link A: L @ https://x",
  "properties A: {}",
  "details A: d",
  "title t",
  "title: t",
  "accTitle: t",
  "accDescr: d",
  "accDescr { d }",
  "accDescr {}",
  ")",
  "A->>title: x",
  "A->>accTitle: x",
  "A->>autonumber: x",
  "title->>B: x",
]

/** The diagram types, each with its statements and a block to put them in. */
const diagrams: readonly {
  readonly header: string
  readonly statements: readonly string[]
  readonly inBlock: (line: string) => string
}[] = [
  {
    header: "flowchart LR",
    statements: flowchartStatements,
    inBlock: (line) => `subgraph S\n${line}\nend`,
  },
  {
    header: "sequenceDiagram",
    statements: sequenceStatements,
    inBlock: (line) => `loop x\n${line}\nend`,
  },
]

/** What joins the two statements. */
const separators: readonly string[] = [";", " ; ", " ; %%{init:\n{}}%% "]

/** Every pair of each diagram type, at the top level and inside a block. */
function* makeInputs(): Generator<GeneratedInput> {
  for (const { header, statements, inBlock } of diagrams) {
    for (const first of statements) {
      for (const second of statements) {
        for (const separator of separators) {
          const line = `${first}${separator}${second}`
          yield { text: `${header}\n${line}\n`, options: {} }
          yield { text: `${header}\n${inBlock(line)}\n`, options: {} }
        }
      }
    }
  }
}

describe("two statements joined by a `;`", () => {
  it("are formatted without changing the diagram", async ({ annotate }) => {
    const report = await checkGeneratedInputs(makeInputs())
    await annotate(describeReport(report))
    expect(report.checked).toBeGreaterThan(0)
    expect(report.problems).toEqual([])
  }, 1_800_000)
})
