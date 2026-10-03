/**
 * Formats statements that go on over a line break, such as `note "x" as`
 * followed by its id on the next line, with an empty description block, a
 * statement, or text with a `{` on the lines that follow, after statements of
 * every kind. A line break in the middle of a statement is whitespace to the
 * lexer after some words, so formatting puts the statement on one line, and
 * what a line holds, a `{` or a block, can change what the lines before it
 * read (docs/state.md, Composite states).
 */
import type { GeneratedInput } from "../generated.ts"
import { pairwiseIndexes } from "../pairwise.ts"

/** A diagram type with the statements that can precede and break off. */
interface DiagramForms {
  readonly header: string
  /** Statements that come first, and read the lines after them. */
  readonly preceding: readonly string[]
  /** The beginning of a statement that goes on over the next line. */
  readonly dangling: readonly string[]
}

const diagrams: readonly DiagramForms[] = [
  {
    header: "flowchart LR",
    preceding: ["", "A", "A-->B", "subgraph S\nA\nend", "style A fill:#f00"],
    dangling: [
      "subgraph",
      "accTitle:",
      "accDescr:",
      "classDef",
      "class A",
      "style",
      "linkStyle",
      "click A",
      "direction",
      "A-->",
      "A-->|",
    ],
  },
  {
    header: "sequenceDiagram",
    preceding: ["", "participant A", "A->>B: x", "loop x\nA->>B: y\nend"],
    dangling: [
      "participant",
      "participant A as",
      "actor A as",
      "Note over A:",
      "Note over",
      "loop",
      "title:",
      "A->>",
      "A->>B:",
      "autonumber",
      "activate",
      "create participant",
      "link A:",
      "rect",
      "box",
    ],
  },
  {
    header: "classDiagram",
    preceding: ["", "class A", "A --> B", "class A {\n+int x\n}"],
    dangling: [
      "class",
      "A -->",
      "A :",
      "namespace",
      "note for A",
      "click A",
      "cssClass",
      "direction",
    ],
  },
  {
    header: "stateDiagram-v2",
    preceding: [
      "",
      "A",
      "state foo",
      "state a b",
      'state "d" as A',
      "A --> B",
      "state P {\nA\n}",
    ],
    dangling: [
      'state "d" as',
      "note",
      'note "x" as',
      "note left of",
      "note left of A :",
      "state",
      "classDef",
      "class",
      "style",
      "direction",
      "scale",
      "accTitle:",
      "accDescr:",
      "click",
      "A -->",
      "A :",
    ],
  },
]

/** What follows the line break: a block, a statement, and a body. */
const tails: readonly string[] = [
  "\naccDescr {}\n N1",
  "\naccDescr {}\nN1",
  "\naccDescr {}",
  "\n accDescr {} N1",
  "\nN1",
  "\nN1\n{\nX\n}",
  "\n{\nX\n}",
  "\nB\n%%{}\nX\n}",
  "\n  accDescr {}  accDescr {}\t{\n}",
]

/**
 * Every preceding statement with every dangling form and every tail, the
 * axes together in pairs, in three passes (see `pairwise.ts`).
 */
export function makeInputs(): GeneratedInput[] {
  return diagrams.flatMap(({ header, preceding, dangling }) =>
    pairwiseIndexes([preceding.length, dangling.length, tails.length], 3).map(
      ([first, beginning, tail]) => {
        const lead = preceding[first] === "" ? "" : `${preceding[first]}\n`
        return {
          text: `${header}\n${lead}${dangling[beginning]}${tails[tail]}\n`,
          options: {},
        }
      },
    ),
  )
}
