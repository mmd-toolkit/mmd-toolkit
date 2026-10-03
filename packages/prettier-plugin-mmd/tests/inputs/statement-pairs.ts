/**
 * Formats two statements joined by a `;`, at the top level and inside a
 * block, for each diagram type that has a printer. Formatting puts them on
 * lines of their own, and after some words the lexer reads a line break
 * with the word where it does not read a `;`: in a flowchart, `accTitle ; :`
 * is two vertices, while `accTitle` and `:` on two lines is an
 * accessibility title. The printer then keeps the line as written (see
 * `findFlowchartKeptLines`).
 */
import type { GeneratedInput } from "../generated.ts"

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

/**
 * Every pair of each diagram type, at the top level or inside a block, the
 * separators taking turns from one pair to the next. What the printer does
 * at the `;` depends on the end of the first statement and the start of the
 * second, and on the text of the line that the two make (the line rule of
 * mermaid.js reads it whole), which the context of the line does not change;
 * the context decides only the indentation and the `end` that follows. So a
 * pair is tried in one context, taken by turns, and every statement stands
 * in both contexts as the first and as the second.
 */
export function makeInputs(): GeneratedInput[] {
  const inputs: GeneratedInput[] = []
  let turn = 0
  for (const { header, statements, inBlock } of diagrams) {
    for (const [firstIndex, first] of statements.entries()) {
      for (const [secondIndex, second] of statements.entries()) {
        const line = `${first}${separators[turn % separators.length]}${second}`
        turn++
        const text = (firstIndex + secondIndex) % 2 === 0 ? line : inBlock(line)
        inputs.push({ text: `${header}\n${text}\n`, options: {} })
      }
    }
  }
  return inputs
}
