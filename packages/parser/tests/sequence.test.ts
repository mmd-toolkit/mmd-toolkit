import { describe, expect, it } from "vitest"
import type { Range, Root, SequenceStatement } from "../src/index.ts"
import { ParseError, parse } from "../src/index.ts"
import { checkTree } from "./helpers/check-tree.ts"

// Expectations come from diagrams/sequence.md (the lexer, the grammar, and
// the rejections outside the grammar) and ast/sequence.md (the nodes and
// the tokens). Every input here was run through mermaid.js first.

/** The header line that the statements of these tests stand after. */
const HEADER = "sequenceDiagram\n"

/** The tree of `statements` after the header line, checked against the invariants of ast.md. */
function parseStatements(statements: string): Root {
  const text = HEADER + statements
  const root = parse(text)
  checkTree(text, root)
  return root
}

/** The kinds and source texts of the tokens of `statements`, without that of the header line. */
function tokensOf(statements: string): [string, string][] {
  return parseStatements(statements)
    .tokens.slice(1)
    .map((token) => [token.type, token.value])
}

/** The statements of the sequence diagram `root`. */
function bodyOf(root: Root): unknown {
  if (root.body.type !== "SequenceDiagram") throw new Error("unexpected tree")
  return root.body.body
}

/** The `ParseError` that `statements` after the header line make. */
function errorOf(statements: string): ParseError {
  try {
    parse(HEADER + statements)
  } catch (error) {
    if (error instanceof ParseError) return error
    throw error
  }
  throw new Error(`no ParseError for ${JSON.stringify(statements)}`)
}

/** The kinds of the `;` tokens of `statements` after the header line. */
function semicolonKindsOf(statements: string): string[] {
  return tokensOf(statements)
    .filter(([, value]) => value === ";")
    .map(([kind]) => kind)
}

describe("the sequence tree", () => {
  it("makes the ids, the arrow, the activation, the `:`, and the text of a message tokens", () => {
    expect(tokensOf("Alice->>+Bob: Hi")).toEqual([
      ["Identifier", "Alice"],
      ["Punctuator", "->>"],
      ["Punctuator", "+"],
      ["Identifier", "Bob"],
      ["Punctuator", ":"],
      ["RawText", "Hi"],
    ])
    expect(bodyOf(parseStatements("Alice->>+Bob: Hi"))).toMatchObject([
      {
        type: "SequenceMessageStatement",
        from: { name: "Alice" },
        arrow: {
          type: "SequenceArrow",
          value: "->>",
          startMarker: "none",
          line: "solid",
          endMarker: "arrow",
          range: [21, 24],
        },
        activation: "+",
        to: { name: "Bob" },
        text: { wrap: null, value: { value: "Hi" } },
      },
    ])
  })

  it("gives each of the 26 arrows its own markers and line", () => {
    const arrows = [
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
    const fields = arrows.map((written) => {
      const [statement] = bodyOf(
        parseStatements(`A${written}B: x`),
      ) as SequenceStatement[]
      if (statement.type !== "SequenceMessageStatement") {
        throw new Error(`no message for ${written}`)
      }
      const { value, startMarker, line, endMarker } = statement.arrow
      expect(value).toBe(written)
      return `${startMarker} ${line} ${endMarker}`
    })
    expect(new Set(fields).size).toBe(arrows.length)
    expect(fields.slice(0, 7)).toEqual([
      "none solid arrow",
      "arrow solid arrow",
      "none dotted arrow",
      "arrow dotted arrow",
      "none solid none",
      "none dotted none",
      "none solid cross",
    ])
    expect(fields[18]).toBe("none solid half-arrow-top")
    expect(fields[22]).toBe("half-arrow-top solid none")
    expect(fields[21]).toBe("none solid half-stick-bottom")
    expect(fields[24]).toBe("half-stick-top solid none")
  })

  it("reads keywords case-insensitively and keeps their fixed words in lower case", () => {
    expect(
      bodyOf(parseStatements("PARTICIPANT A\nNote LEFT OF A: x")),
    ).toMatchObject([
      { type: "SequenceParticipantStatement", kind: "participant" },
      { type: "SequenceNoteStatement", placement: "left of" },
    ])
  })

  it("makes a wrap prefix the first token of its text", () => {
    expect(tokensOf("A->>B: :nowrap: x").slice(-2)).toEqual([
      ["Keyword", ":nowrap:"],
      ["RawText", "x"],
    ])
    expect(bodyOf(parseStatements("A->>B: :nowrap: x"))).toMatchObject([
      { text: { wrap: "nowrap", value: { value: "x" } } },
    ])
  })

  it("reads a number with a fraction, and the step after it", () => {
    expect(bodyOf(parseStatements("autonumber 1.5 2\nA->>B: x"))).toMatchObject(
      [
        {
          type: "SequenceAutonumberStatement",
          start: { value: 1.5, raw: "1.5" },
          step: { value: 2 },
          off: false,
        },
        {},
      ],
    )
  })

  it("makes an empty description block where a statement starts a statement of its own", () => {
    expect(bodyOf(parseStatements("accDescr {} A->>B: x"))).toMatchObject([
      { type: "SequenceAccDescrBlockStatement", value: null, closed: true },
      { type: "SequenceMessageStatement" },
    ])
    expect(bodyOf(parseStatements("accDescr {};A->>B: x"))).toMatchObject([
      { type: "SequenceAccDescrBlockStatement", value: null, closed: true },
      { type: "SequenceMessageStatement" },
    ])
  })

  it("makes an empty description block in a box a statement of the box, and rejects one with text", () => {
    expect(
      bodyOf(parseStatements("box G\naccDescr {} participant B\nend")),
    ).toMatchObject([
      {
        type: "SequenceBoxStatement",
        body: [
          { type: "SequenceAccDescrBlockStatement", value: null, closed: true },
          { type: "SequenceParticipantStatement", id: { name: "B" } },
        ],
      },
    ])
    expect(errorOf("box G\naccDescr {x}\nparticipant B\nend").range).toEqual([
      HEADER.length + 16,
      HEADER.length + 17,
    ])
  })

  it("makes a line of an `invalid` unit an ignored statement", () => {
    expect(bodyOf(parseStatements(")"))).toMatchObject([
      { type: "SequenceIgnoredStatement", value: ")" },
    ])
  })

  it("lets a statement follow the `end` of a block on the same line", () => {
    expect(
      bodyOf(parseStatements("loop x\nA->>B: y\nend A->>B: z")),
    ).toMatchObject([
      {
        type: "SequenceLoopStatement",
        text: { value: { value: "x" } },
        body: [{ type: "SequenceMessageStatement" }],
      },
      { type: "SequenceMessageStatement", text: { value: { value: "z" } } },
    ])
  })

  it("makes a section of each text and its statements in a block of sections", () => {
    expect(
      bodyOf(parseStatements("alt a\nA->>B: x\nelse b\nB->>A: y\nend")),
    ).toMatchObject([
      {
        type: "SequenceAltStatement",
        sections: [
          { text: { value: { value: "a" } }, body: [{}] },
          { text: { value: { value: "b" } }, body: [{}] },
        ],
      },
    ])
  })

  it("keeps the content of a data block as written, and the text after `as`", () => {
    expect(
      bodyOf(parseStatements('participant A@{ "type": "queue" } as Q')),
    ).toMatchObject([
      {
        type: "SequenceParticipantStatement",
        id: { name: "A" },
        data: { value: ' "type": "queue" ' },
        alias: { value: { value: "Q" } },
      },
    ])
  })

  it("gives a title the value without the whitespace around it", () => {
    expect(bodyOf(parseStatements("title  x  "))).toMatchObject([
      { type: "SequenceTitleStatement", value: { value: "x" } },
    ])
  })

  it("gives a diagram comment the value after its mark, `#`, `%%`, or `%`", () => {
    for (const [statements, value] of [
      ["autonumber # c\nA->>B: x", " c"],
      ["autonumber %% c\nA->>B: x", " c"],
      ["autonumber % c\nA->>B: x", " c"],
      ["autonumber %%% c\nA->>B: x", "% c"],
      // As in the `%%` of a comment line, a directive may lie between the
      // two `%` of the mark; the value is the source text after the mark.
      ["autonumber %%%{a}%%%\nA->>B: x", ""],
      ["autonumber %%%{a}%% c\nA->>B: x", "%%{a}%% c"],
    ]) {
      expect(parseStatements(statements).comments).toMatchObject([{ value }])
    }
  })

  it("makes the colour candidate and the rest of a box text tokens of their own", () => {
    expect(tokensOf("box red-team\nparticipant A\nend").slice(1, 3)).toEqual([
      ["RawText", "red"],
      ["RawText", "-team"],
    ])
    expect(
      bodyOf(parseStatements("box RGB(0, 0, 255) Team\nparticipant A\nend")),
    ).toMatchObject([
      {
        type: "SequenceBoxStatement",
        text: {
          value: "RGB(0, 0, 255) Team",
          colorCandidate: { value: "RGB" },
          remainder: { value: "(0, 0, 255) Team" },
        },
      },
    ])
    expect(
      bodyOf(parseStatements("box rgb(34, 56, 0) Group1\nparticipant A\nend")),
    ).toMatchObject([
      {
        text: {
          colorCandidate: { value: "rgb(34, 56, 0)" },
          remainder: { value: "Group1" },
        },
      },
    ])
    expect(bodyOf(parseStatements("box -x\nparticipant A\nend"))).toMatchObject(
      [
        {
          text: {
            value: "-x",
            colorCandidate: null,
            remainder: { value: "-x" },
          },
        },
      ],
    )
  })

  it("gives a `;` that the line rule ignores the kind that the context at its place reads", () => {
    expect(semicolonKindsOf("accTitle: style:#x;\nA->>B: y")).toEqual([
      "RawText",
    ])
    expect(semicolonKindsOf("accDescr {\nstyle:#x;\n}\nA->>B: y")).toEqual([
      "RawText",
    ])
    expect(semicolonKindsOf("participant A@{ style:#x; }\nA->>B: y")).toEqual([
      "RawText",
    ])
    expect(
      semicolonKindsOf('participant A@{ "style": "x:#y" };\nA->>B: y'),
    ).toEqual(["Punctuator"])
    expect(semicolonKindsOf("loop style:#x;\nA->>B: y\nend")).toEqual([
      "Punctuator",
    ])
  })

  it("ends a statement at a line break between an id and `as`, and reads the next line as a statement of its own", () => {
    expect(bodyOf(parseStatements("participant A\nas ->> B: x"))).toMatchObject(
      [
        {
          type: "SequenceParticipantStatement",
          id: { name: "A" },
          alias: null,
        },
        { type: "SequenceMessageStatement", from: { name: "as" } },
      ],
    )
    expect(bodyOf(parseStatements("activate as\nas ->> -B: x"))).toMatchObject([
      { type: "SequenceActivateStatement", id: { name: "as" } },
      { type: "SequenceMessageStatement", from: { name: "as" } },
    ])
    expect(errorOf("participant A\nas B\n")).toMatchObject({
      message: "Unexpected token",
    })
  })

  it("keeps `create` before `destroy` in the destroy statement", () => {
    expect(bodyOf(parseStatements("create destroy A\nB->>A: x"))).toMatchObject(
      [
        { type: "SequenceDestroyStatement", created: true, id: { name: "A" } },
        {},
      ],
    )
  })
})

describe("the rejections of the sequence diagram outside the grammar", () => {
  it.each<[string, string, string, Range]>([
    [
      "deactivating an inactive participant",
      "A->>B: x\ndeactivate A",
      "A participant that is not active cannot be deactivated",
      [36, 37],
    ],
    [
      "deactivating the inactive source of a message",
      "A->>-B: x",
      "A participant that is not active cannot be deactivated",
      [16, 17],
    ],
    [
      "creating an existing participant",
      "A->>B: x\ncreate participant B",
      "A participant that exists already cannot be created",
      [44, 45],
    ],
    [
      "a message after create that does not go to the created participant",
      "create participant C\nA->>B: x",
      "The message after create must go to the created participant",
      [37, 45],
    ],
    [
      "a message after destroy that does not come from or go to the destroyed participant",
      "A->>B: x\ndestroy B\nA->>C: y",
      "The message after destroy must come from or go to the destroyed participant",
      [35, 43],
    ],
    [
      "a participant in two boxes",
      "box a\nparticipant A\nend\nbox b\nparticipant A\nend",
      "A participant cannot be in two boxes",
      [58, 59],
    ],
  ])("rejects %s", (_what, statements, message, range) => {
    expect(errorOf(statements)).toMatchObject({ message, range })
  })
})
