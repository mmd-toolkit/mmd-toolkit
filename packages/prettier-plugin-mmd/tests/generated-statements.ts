/**
 * Statements of every diagram type, of the kinds that formatting treats
 * differently, for the generated-input tests that put an ending or a
 * directive on each of them (`generated-line-endings.test.ts` and
 * `generated-directive-cuts.test.ts`).
 */

/** The statements of a diagram type, with those that open a block. */
export interface DiagramForms {
  readonly header: string
  readonly statements: readonly string[]
  /** The statements that open a block, and the line that closes it. */
  readonly blockOpenings: readonly string[]
  readonly blockClosing: string
}

/** Statements of each diagram type, with the statements that open a block. */
export const diagrams: readonly DiagramForms[] = [
  {
    header: "flowchart LR",
    statements: [
      "A",
      "A-->B",
      "A[x]",
      "A-->|t|B",
      "A[x:]",
      "style A fill:#f00",
      "classDef c fill:#f00",
      "class A c",
      "linkStyle 0 stroke:red",
      'click A href "u"',
      "A@{ shape: rect }",
      "accTitle: x",
      "accDescr: x",
      "direction LR",
      "A-->end",
    ],
    blockOpenings: [
      "subgraph S",
      'subgraph "S"',
      "subgraph S end",
      "subgraph S[T]",
    ],
    blockClosing: "\nend",
  },
  {
    header: "sequenceDiagram",
    statements: [
      "A->>B: x",
      "A->>B: x:",
      "participant A",
      "Note over A: x",
      "title: x",
      "autonumber 5",
      "activate A",
      "A->>B: x #c",
    ],
    blockOpenings: ["loop x", "alt x", "box G"],
    blockClosing: "\nend",
  },
  {
    header: "classDiagram",
    statements: [
      "A --> B",
      "A : x",
      "A : x:",
      "A :",
      "A --> B :",
      "A --> B : style:#x",
      "class A",
      "A --> B : x",
      "A : +int x",
      'click A href "u"',
      "direction LR",
    ],
    blockOpenings: [],
    blockClosing: "",
  },
  {
    header: "stateDiagram-v2",
    statements: [
      "A",
      "A --> B",
      "A : x",
      "A : x:",
      "A :",
      "state A",
      'state "d" as A',
      'state "d" as A : x',
      "note left of A : x",
      "classDef c fill:red",
      'click A href "u"',
      "direction LR",
      "accTitle: x",
    ],
    blockOpenings: [],
    blockClosing: "",
  },
]
