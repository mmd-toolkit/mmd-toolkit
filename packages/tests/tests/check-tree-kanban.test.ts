import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import {
  KANBAN_CHILD_TYPES,
  KANBAN_FIELD_WORDS,
} from "../src/check-tree/kanban.ts"
import { fieldSpecOf } from "../src/check-tree/field-spec.ts"
import { childOf } from "../src/check-tree/statement-checks.ts"
import type { CheckedNode } from "../src/check-tree/types.ts"
import type { Built, Kit, BrokenCase } from "./check-tree-built.ts"
import { buildTree, itFailsEach, nodeWith, retype } from "./check-tree-built.ts"
import type { MutationCase } from "./check-tree-recorded.ts"
import {
  firstNode,
  problemsOf as problemsOfMutation,
  retypeIn,
  says,
  setEnd,
  setField,
} from "./check-tree-recorded.ts"
import { readFieldTables, readFieldMeanings } from "./spec-field-tables.ts"

/** A hand-specified source; no parser or recorded kanban tree is used. */
function build(body: string, rows: (kit: Kit) => CheckedNode[]): Built {
  return buildTree(
    { header: "kanban", diagramType: "kanban", bodyType: "KanbanDiagram" },
    `kanban\n${body}\n`,
    rows,
  )
}

/** One written text unit, with its RawText token. */
function literal(kit: Kit, value: string): CheckedNode {
  const token = kit.token("RawText", value)
  return kit.node("KanbanLiteral", token.range, { value })
}

/** One closed opaque data block, including an empty interior. */
function data(kit: Kit, value: string): CheckedNode {
  const first = kit.token("Punctuator", "@{")
  if (value !== "") kit.token("RawText", value)
  const last = kit.token("Punctuator", "}")
  return kit.node("KanbanDataBlock", [first.range[0], last.range[1]], { value })
}

/** An icon or class line whose text keeps all its whitespace. */
function decoration(kit: Kit, icon: boolean, value: string): CheckedNode {
  const first = kit.token(
    icon ? "Keyword" : "Punctuator",
    icon ? "::icon(" : ":::",
  )
  const text = literal(kit, value)
  const last = icon ? kit.token("Punctuator", ")") : text
  return kit.node(
    icon ? "KanbanIconStatement" : "KanbanClassStatement",
    [first.range[0], last.range[1]],
    { [icon ? "icon" : "cssClass"]: text },
  )
}

/** A row with explicit indentation, id, shape, data blocks, and decorations. */
function row(
  kit: Kit,
  indent: number,
  idText: string | null,
  shapeParts:
    | readonly [string, string, "text" | "string" | "markdown", string]
    | null = null,
  blocks: readonly string[] = [],
  decorate: (() => CheckedNode[]) | null = null,
): CheckedNode {
  const id = idText === null ? null : literal(kit, idText)
  let shape: CheckedNode | null = null
  if (shapeParts !== null) {
    const [opener, raw, kind, closer] = shapeParts
    const first = kit.token("Punctuator", opener)
    const token = kit.token(kind === "text" ? "RawText" : "String", raw)
    const width = kind === "text" ? 0 : kind === "string" ? 1 : 2
    const label = kit.node("KanbanLabel", token.range, {
      kind,
      value: width === 0 ? raw : raw.slice(width, -width),
    })
    const last = kit.token("Punctuator", closer)
    shape = kit.node("KanbanShape", [first.range[0], last.range[1]], {
      opener,
      closer,
      label,
    })
  }
  const suffix = blocks.map((value) => data(kit, value))
  const decorations = decorate?.() ?? []
  const first = id ?? shape
  if (first === null) throw new Error("no text or shape")
  const last = decorations.at(-1) ?? suffix.at(-1) ?? shape ?? first
  return kit.node("KanbanNode", [first.range[0], last.range[1]], {
    indent,
    id,
    shape,
    data: suffix,
    decorations,
  })
}

/** Every node type, every child field, and a mismatched delimiter pair. */
function everyKind(): Built {
  return build(
    ' S["`Todo`")@{ticket: X,}@{assigned: Ada}\n ::icon( star )\n ::: hot \n   A[Work]',
    (kit) => [
      row(
        kit,
        1,
        "S",
        ["[", '"`Todo`"', "markdown", ")"],
        ["ticket: X,", "assigned: Ada"],
        () => [
          decoration(kit, true, " star "),
          decoration(kit, false, " hot "),
        ],
      ),
      row(kit, 3, "A", ["[", "Work", "text", "]"]),
    ],
  )
}

/** A fixed quoted label with two explicit fragments and an optional common cut. */
function cutLabel(
  body: string,
  kind: "string" | "markdown",
  head: string,
  tail: string,
  value: string,
  cut?: (kit: Kit) => void,
): Built {
  return build(body, (kit) => {
    const first = kit.token("Punctuator", "[")
    const start = kit.token("StringFragment", head)
    cut?.(kit)
    const end = kit.token("StringFragment", tail)
    const label = kit.node("KanbanLabel", [start.range[0], end.range[1]], {
      kind,
      value,
    })
    const last = kit.token("Punctuator", "]")
    const shape = kit.node("KanbanShape", [first.range[0], last.range[1]], {
      opener: "[",
      closer: "]",
      label,
    })
    return [
      kit.node("KanbanNode", shape.range, {
        indent: 1,
        id: null,
        shape,
        data: [],
        decorations: [],
      }),
    ]
  })
}

/** A string cut by a directive, keeping both quote fragments. */
function directiveLabel(): Built {
  return cutLabel(' ["a%%{init: {}}%%b"]', "string", '"a', 'b"', "ab", (kit) =>
    kit.directive("%%{init: {}}%%"),
  )
}

/** A quoted data interior stays RawText on both sides of a directive. */
function cutData(): Built {
  return build(' S@{label: "a%%{init: {}}%%b"}', (kit) => {
    const id = literal(kit, "S")
    const first = kit.token("Punctuator", "@{")
    kit.token("RawText", 'label: "a')
    kit.directive("%%{init: {}}%%")
    kit.token("RawText", 'b"')
    const last = kit.token("Punctuator", "}")
    const block = kit.node("KanbanDataBlock", [first.range[0], last.range[1]], {
      value: 'label: "ab"',
    })
    return [
      kit.node("KanbanNode", [id.range[0], block.range[1]], {
        indent: 1,
        id,
        shape: null,
        data: [block],
        decorations: [],
      }),
    ]
  })
}

/** Change one value field of the all-kinds tree. */
function field(
  type: string,
  key: string,
  value: unknown,
): BrokenCase["mutate"] {
  return (tree) => setField(nodeWith(tree, type), key, value)
}

const BROKEN: readonly BrokenCase[] = [
  {
    name: "a data range without its opening marker",
    built: everyKind,
    mutate: (tree) => {
      const block = nodeWith(tree, "KanbanDataBlock")
      setField(block, "range", [block.range[0] + 1, block.range[1]])
    },
    expected: "the data block is not delimited",
  },
  {
    name: "a data range without its closing brace",
    built: everyKind,
    mutate: (tree) => {
      const block = nodeWith(tree, "KanbanDataBlock")
      setField(block, "range", [block.range[0], block.range[1] - 1])
    },
    expected: "the data block is not delimited",
  },
  {
    name: "a non-string data value",
    built: everyKind,
    mutate: field("KanbanDataBlock", "value", 1),
    expected: "the field value is number, not string",
  },
  {
    name: "an empty icon value",
    built: everyKind,
    mutate: (tree) =>
      setField(nodeWith(tree, "KanbanLiteral", "value", " star "), "value", ""),
    expected: "the literal is empty",
  },
  {
    name: "an empty class value",
    built: everyKind,
    mutate: (tree) =>
      setField(nodeWith(tree, "KanbanLiteral", "value", " hot "), "value", ""),
    expected: "the literal is empty",
  },
  {
    name: "a missing id where text is written",
    built: everyKind,
    mutate: field("KanbanNode", "id", null),
    expected: "lies in no value node",
  },
  {
    name: "a missing shape where delimiters are written",
    built: everyKind,
    mutate: field("KanbanNode", "shape", null),
    expected: "the tokens of the node outside its child nodes",
  },
  {
    name: "a range extending past the last token",
    built: everyKind,
    mutate: (tree) => {
      const diagram = nodeWith(tree, "KanbanDiagram")
      setField(diagram, "range", [0, diagram.range[1] + 1])
    },
    expected: "the range, which runs from the first",
  },

  {
    name: "both id and shape null",
    built: everyKind,
    mutate: (tree) => {
      field("KanbanNode", "id", null)(tree, "")
      field("KanbanNode", "shape", null)(tree, "")
    },
    expected: "has neither a node text nor a shape",
  },
  {
    name: "a negative indent",
    built: everyKind,
    mutate: field("KanbanNode", "indent", -1),
    expected: "the indent is no integer",
  },
  {
    name: "a fractional indent",
    built: everyKind,
    mutate: field("KanbanNode", "indent", 1.5),
    expected: "the indent is no integer",
  },
  {
    name: "the wrong written indent",
    built: everyKind,
    mutate: field("KanbanNode", "indent", 2),
    expected: "the indent, which is the number",
  },
  {
    name: "an unknown opener",
    built: everyKind,
    mutate: field("KanbanShape", "opener", "<"),
    expected: "the field opener is",
  },
  {
    name: "an unknown closer",
    built: everyKind,
    mutate: field("KanbanShape", "closer", ">"),
    expected: "the field closer is",
  },
  {
    name: "an opener unequal to the written one",
    built: everyKind,
    mutate: field("KanbanShape", "opener", "("),
    expected: "the written opener",
  },
  {
    name: "a closer unequal to the written one",
    built: everyKind,
    mutate: field("KanbanShape", "closer", "]"),
    expected: "the written closer",
  },
  {
    name: "an unknown label kind",
    built: everyKind,
    mutate: field("KanbanLabel", "kind", "html"),
    expected: "the field kind is",
  },
  {
    name: "an empty label",
    built: everyKind,
    mutate: field("KanbanLabel", "value", ""),
    expected: "the label is empty",
  },
  {
    name: "the wrong label delimiters",
    built: everyKind,
    mutate: field("KanbanLabel", "kind", "text"),
    expected: "the label does not have the delimiters",
  },
  {
    name: "a changed literal",
    built: everyKind,
    mutate: field("KanbanLiteral", "value", "wrong"),
    expected: "value is not its written text",
  },
  {
    name: "a changed label",
    built: everyKind,
    mutate: field("KanbanLabel", "value", "wrong"),
    expected: "value is not its written text",
  },
  {
    name: "a changed data interior",
    built: everyKind,
    mutate: field("KanbanDataBlock", "value", "wrong"),
    expected: "value is not its written text",
  },
  {
    name: "an empty literal",
    built: everyKind,
    mutate: field("KanbanLiteral", "value", ""),
    expected: "the literal is empty",
  },
  {
    name: "a removed data block",
    built: everyKind,
    mutate: field("KanbanNode", "data", []),
    expected: "the tokens of the node outside its child nodes",
  },
  {
    name: "decorations in reverse order",
    built: everyKind,
    mutate: (tree) => {
      const node = nodeWith(tree, "KanbanNode")
      setField(
        node,
        "decorations",
        [...(node.decorations as CheckedNode[])].reverse(),
      )
    },
    expected: "comes before the child node",
  },
  {
    name: "a null data list",
    built: everyKind,
    mutate: field("KanbanNode", "data", null),
    expected: "the field data is null, not a list",
  },
  {
    name: "a header of the wrong kind",
    built: everyKind,
    mutate: retype("kanban", "Punctuator"),
    expected: "the kind of a token that the node writes itself",
  },
  {
    name: "a delimiter of the wrong kind",
    built: everyKind,
    mutate: retype("[", "Keyword"),
    expected: "the kind of a token that the node writes itself",
  },
  {
    name: "an icon marker of the wrong kind",
    built: everyKind,
    mutate: retype("::icon(", "Punctuator"),
    expected: "the kind of a token that the node writes itself",
  },
  {
    name: "a class marker of the wrong kind",
    built: everyKind,
    mutate: retype(":::", "Keyword"),
    expected: "the kind of a token that the node writes itself",
  },
  {
    name: "node text as Identifier",
    built: everyKind,
    mutate: retype("S", "Identifier"),
    expected: "the token kinds of the text unit",
  },
  {
    name: "a bare label as Numeric",
    built: everyKind,
    mutate: retype("Work", "Numeric"),
    expected: "the token kinds of the text unit",
  },
  {
    name: "icon text as Identifier",
    built: everyKind,
    mutate: retype(" star ", "Identifier"),
    expected: "the token kinds of the text unit",
  },
  {
    name: "class text as String",
    built: everyKind,
    mutate: retype(" hot ", "String"),
    expected: "the token kinds of the text unit",
  },
  {
    name: "a data opener of the wrong kind",
    built: everyKind,
    mutate: retype("@{", "RawText"),
    expected: "the data delimiters are not separate Punctuator tokens",
  },
  {
    name: "a data closer of the wrong kind",
    built: everyKind,
    mutate: retype("}", "RawText"),
    expected: "the data delimiters are not separate Punctuator tokens",
  },
  {
    name: "a data interior as String",
    built: everyKind,
    mutate: retype("ticket: X,", "String"),
    expected: "the token kinds of the text unit",
  },
  {
    name: "an uncut markdown label as StringFragment",
    built: everyKind,
    mutate: retype('"`Todo`"', "StringFragment"),
    expected: "the token kinds of the text unit",
  },
  {
    name: "an uncut string label as RawText",
    built: () =>
      build(' ["x"]', (kit) => [
        row(kit, 1, null, ["[", '"x"', "string", "]"]),
      ]),
    mutate: retype('"x"', "RawText"),
    expected: "the token kinds of the text unit",
  },
  {
    name: "a cut string fragment as String",
    built: directiveLabel,
    mutate: retype('"a', "String"),
    expected: "the token kinds of the text unit",
  },
  {
    name: "quoted data fragments as StringFragment",
    built: cutData,
    mutate: retype('label: "a', "StringFragment"),
    expected: "the token kinds of the text unit",
  },
  {
    name: "the wrong diagram id",
    built: everyKind,
    mutate: field("Root", "diagramType", "mindmap"),
    expected: "is not one of those of a KanbanDiagram",
  },
]

const BAD_LAYOUTS: readonly {
  name: string
  built: () => Built
  expected: string
}[] = [
  {
    name: "a text stealing the dash from a shape opener",
    built: () =>
      build(" S-)Todo(-", (kit) => [
        row(kit, 1, "S", ["-)", "Todo", "text", "(-"]),
      ]),
    expected: "the node text does not run to the shape",
  },
  {
    name: "a bare id that loses trailing whitespace",
    built: () => build(" S  ", (kit) => [row(kit, 1, "S")]),
    expected: "the node text ends before the end of its unit",
  },
  {
    name: "a label that loses leading whitespace",
    built: () =>
      build(" S[ x]", (kit) => [row(kit, 1, "S", ["[", "x", "text", "]"])]),
    expected: "the written opener",
  },
  {
    name: "whitespace after a quoted label",
    built: () =>
      build(' S["x" ]', (kit) => [
        row(kit, 1, "S", ["[", '"x"', "string", "]"]),
      ]),
    expected: "the written closer",
  },
  {
    name: "a node after a shallower item",
    built: () =>
      build("    S\n  A\n    B", (kit) => [
        row(kit, 4, "S"),
        row(kit, 2, "A"),
        row(kit, 4, "B"),
      ]),
    expected: "a shallower item is followed",
  },
  {
    name: "a header followed by a word without a boundary",
    built: () =>
      buildTree(
        { header: "kanban", diagramType: "kanban", bodyType: "KanbanDiagram" },
        "kanbanS\n",
        (kit) => [row(kit, 0, "S")],
      ),
    expected: "the header is followed by a word",
  },
  {
    name: "a header with no source line end",
    built: () =>
      buildTree(
        { header: "kanban", diagramType: "kanban", bodyType: "KanbanDiagram" },
        "kanban",
        () => [],
      ),
    expected: "the header has neither a body",
  },

  {
    name: "a gap after a shape before data",
    built: () =>
      build(" S[x] @{a: b}", (kit) => [
        row(kit, 1, "S", ["[", "x", "text", "]"], ["a: b"]),
      ]),
    expected: "the data blocks do not touch",
  },
  {
    name: "a gap between data blocks",
    built: () =>
      build(" S@{} @{}", (kit) => [row(kit, 1, "S", null, ["", ""])]),
    expected: "the data blocks do not touch",
  },
  {
    name: "an inline decoration",
    built: () =>
      build(" S[x] ::icon(a)", (kit) => [
        row(kit, 1, "S", ["[", "x", "text", "]"], [], () => [
          decoration(kit, true, "a"),
        ]),
      ]),
    expected: "the statements are not separated",
  },
  {
    name: "two nodes on one line",
    built: () =>
      build(" S[x] A", (kit) => [
        row(kit, 1, "S", ["[", "x", "text", "]"]),
        row(kit, 1, "A"),
      ]),
    expected: "the statements are not separated",
  },
  {
    name: "an excluded id character",
    built: () => build(" A@B", (kit) => [row(kit, 1, "A@B")]),
    expected: "the node text starts or holds",
  },
  {
    name: "a bare label with a closing character",
    built: () =>
      build(" S[a)b]", (kit) => [row(kit, 1, "S", ["[", "a)b", "text", "]"])]),
    expected: "the label holds a character",
  },
  {
    name: "a bare label that loses a dash",
    built: () =>
      build(" S[x-)", (kit) => [row(kit, 1, "S", ["[", "x", "text", "-)"])]),
    expected: "a bare label reads the dash",
  },
  {
    name: "an unquoted data caret",
    built: () => build(" S@{a:^}", (kit) => [row(kit, 1, "S", null, ["a:^"])]),
    expected: "the data interior has an unquoted",
  },
  {
    name: "an unclosed data quote",
    built: () =>
      build(' S@{a:"x}', (kit) => [row(kit, 1, "S", null, ['a:"x'])]),
    expected: "the data interior has an unquoted",
  },
  {
    name: "an icon with its closing character inside",
    built: () =>
      build(" S\n ::icon(a)b)", (kit) => [
        row(kit, 1, "S", null, [], () => [decoration(kit, true, "a)b")]),
      ]),
    expected: "the icon holds its closing",
  },
  {
    name: "a class that loses trailing whitespace",
    built: () =>
      build(" S\n :::hot ", (kit) => [
        row(kit, 1, "S", null, [], () => [decoration(kit, false, "hot")]),
      ]),
    expected: "the class does not run to the end",
  },
  {
    name: "a string split into fragments without a cut",
    built: () => cutLabel(' ["ab"]', "string", '"a', 'b"', "ab"),
    expected: "the token kinds of the text unit",
  },
  {
    name: "node text split into RawText tokens without a cut",
    built: () =>
      build(" ST", (kit) => {
        const first = kit.token("RawText", "S")
        const last = kit.token("RawText", "T")
        const range = [first.range[0], last.range[1]] as const
        const id = kit.node("KanbanLiteral", range, { value: "ST" })
        return [
          kit.node("KanbanNode", range, {
            indent: 1,
            id,
            shape: null,
            data: [],
            decorations: [],
          }),
        ]
      }),
    expected: "the token kinds of the text unit",
  },
]

describe("checkTree of kanban trees made by hand", () => {
  it("accepts every kind and independent shape delimiters", () => {
    const { source, tree } = everyKind()
    expect(checkTree(source, tree)).toEqual([])
  })
  it("accepts an empty board", () => {
    const { source, tree } = build("", () => [])
    expect(checkTree(source, tree)).toEqual([])
  })
  it("accepts bare text, a shape alone, empty data, and whitespace-only values", () => {
    const { source, tree } = build(
      ' S\n   [" "]@{}\n ::icon( )\n ::: ',
      (kit) => [
        row(kit, 1, "S"),
        row(kit, 3, null, ["[", '" "', "string", "]"], [""], () => [
          decoration(kit, true, " "),
          decoration(kit, false, " "),
        ]),
      ],
    )
    expect(checkTree(source, tree)).toEqual([])
  })
  it("accepts opaque duplicate keys and quoted braces and carets", () => {
    const { source, tree } = build(' S@{a: x,a: "}^"}', (kit) => [
      row(kit, 1, "S", null, ['a: x,a: "}^"']),
    ])
    expect(checkTree(source, tree)).toEqual([])
  })
  it("accepts a whitespace-only data token and separate adjacent empty data", () => {
    const { source, tree } = build(" S@{ }@{}", (kit) => [
      row(kit, 1, "S", null, [" ", ""]),
    ])
    expect(checkTree(source, tree)).toEqual([])
  })
  it("accepts RawText data fragments, including their quotes", () => {
    const { source, tree } = cutData()
    expect(checkTree(source, tree)).toEqual([])
  })
  it("accepts string fragments cut by a directive", () => {
    const { source, tree } = directiveLabel()
    expect(checkTree(source, tree)).toEqual([])
  })
  it("accepts markdown fragments cut by a directive", () => {
    const { source, tree } = cutLabel(
      ' ["`a%%{init: {}}%%b`"]',
      "markdown",
      '"`a',
      'b`"',
      "ab",
      (kit) => kit.directive("%%{init: {}}%%"),
    )
    expect(checkTree(source, tree)).toEqual([])
  })
  it("accepts string fragments cut by a comment region", () => {
    const { source, tree } = cutLabel(
      ' ["a\n%% c\nb"]',
      "string",
      '"a\n',
      'b"',
      "a\nb",
      (kit) => kit.comment("%%", "%% c"),
    )
    expect(checkTree(source, tree)).toEqual([])
  })
  it("accepts string fragments cut by an ignored semicolon", () => {
    const { source, tree } = cutLabel(
      ' ["astyle:#x;yb"]',
      "string",
      '"astyle:#x',
      'yb"',
      "astyle:#xyb",
      (kit) => {
        kit.token("IgnoredSemicolon", ";")
      },
    )
    expect(checkTree(source, tree)).toEqual([])
  })
  it("accepts %% comments ending at a line separator and reports another mark", () => {
    const { source, tree } = build(" S[x]%%\u2028  A", (kit) => {
      const first = row(kit, 1, "S", ["[", "x", "text", "]"])
      kit.comment("%%", "%%")
      return [first, row(kit, 3, "A")]
    })
    expect(checkTree(source, tree)).toEqual([])
    const comment = tree.comments[0]
    if (comment === undefined) throw new Error("no comment")
    setField(comment, "mark", "%")
    expect(
      checkTree(source, tree).some((problem) =>
        problem.message.includes("mark"),
      ),
    ).toBe(true)
  })
  itFailsEach(BROKEN)
  for (const testCase of BAD_LAYOUTS)
    it(`rejects ${testCase.name}`, () => {
      const { source, tree } = testCase.built()
      expect(
        checkTree(source, tree).some((problem) =>
          problem.message.includes(testCase.expected),
        ),
      ).toBe(true)
    })
  for (const [type, fields] of Object.entries(KANBAN_CHILD_TYPES)) {
    for (const fieldName of Object.keys(fields))
      it(`rejects the wrong child type in ${type}.${fieldName}`, () => {
        const { source, tree } = everyKind()
        const node = nodeWith(tree, type)
        const old = Array.isArray(node[fieldName])
          ? (node[fieldName] as CheckedNode[])[0]
          : childOf(node, fieldName)
        if (old === undefined || old === null) throw new Error("no child")
        const wrong = {
          type: "Identifier",
          range: old.range,
          loc: old.loc,
          name: "wrong",
        }
        setField(
          node,
          fieldName,
          Array.isArray(node[fieldName]) ? [wrong] : wrong,
        )
        expect(
          checkTree(source, tree).some(
            (problem) =>
              problem.where.startsWith(`${type} at `) &&
              problem.message.startsWith(`the field ${fieldName} holds a `),
          ),
        ).toBe(true)
      })
  }
  it("holds the child table to the Type column", () => {
    const expected: Record<string, Record<string, string[]>> = {}
    for (const [type, fields] of readFieldTables()) {
      if (!type.startsWith("Kanban")) continue
      for (const [fieldName, cell] of fields) {
        if (fieldSpecOf(cell).shape === "value") continue
        expected[type] ??= {}
        expected[type][fieldName] = [
          ...cell.matchAll(/\bKanban[A-Za-z]+\b/gu),
        ].map((match) => match[0])
      }
    }
    expect(KANBAN_CHILD_TYPES).toEqual(expected)
  })
  it("holds the field words to the Meaning column", () => {
    const meanings = readFieldMeanings()
    for (const [type, fields] of Object.entries(KANBAN_FIELD_WORDS))
      for (const [fieldName, words] of Object.entries(fields)) {
        expect(words).toEqual(
          [
            ...(meanings.get(type)?.get(fieldName) ?? "").matchAll(
              /`([^`]+)`/gu,
            ),
          ].map((match) => match[1]),
        )
      }
  })
})

// The same conditions on copies of the named fixtures' recorded trees.
const OWN_KIND = "the kind of a token that the node writes itself"
const TEXT_KINDS = "the token kinds of the text unit"
const DATA_DELIMITERS = "the data delimiters are not separate Punctuator tokens"

const RECORDED_CASES: readonly MutationCase[] = [
  {
    name: "the header as a RawText token",
    fixture: "db-shape-square",
    mutate: retypeIn("KanbanDiagram", "Keyword", "kanban", "RawText"),
    expected: OWN_KIND,
  },
  {
    name: "a shape opener as a Keyword token",
    fixture: "db-shape-square",
    mutate: retypeIn("KanbanShape", "Punctuator", "[", "Keyword"),
    expected: OWN_KIND,
  },
  {
    name: "a shape closer as a Keyword token",
    fixture: "db-shape-square",
    mutate: retypeIn("KanbanShape", "Punctuator", "]", "Keyword"),
    expected: OWN_KIND,
  },
  {
    name: "node text as an Identifier token",
    fixture: "db-shape-square",
    mutate: retypeIn("KanbanLiteral", "RawText", "S", "Identifier"),
    expected: TEXT_KINDS,
  },
  {
    name: "a bare label as a String token",
    fixture: "db-shape-square",
    mutate: retypeIn("KanbanLabel", "RawText", "Todo", "String"),
    expected: TEXT_KINDS,
  },
  {
    name: "a string label as a RawText token",
    fixture: "db-spaces-label",
    mutate: retypeIn("KanbanLabel", "String", null, "RawText"),
    expected: TEXT_KINDS,
  },
  {
    name: "an uncut markdown label as a StringFragment token",
    fixture: "db-markdown-label",
    mutate: retypeIn("KanbanLabel", "String", null, "StringFragment"),
    expected: TEXT_KINDS,
  },
  {
    name: "a directive-cut markdown fragment as a String token",
    fixture: "db-grid-directive-item-label-markdown",
    mutate: retypeIn("KanbanLabel", "StringFragment", null, "String"),
    expected: TEXT_KINDS,
  },
  {
    name: "a comment-cut string fragment as a RawText token",
    fixture: "lex-comment-quoted-line",
    mutate: retypeIn("KanbanLabel", "StringFragment", null, "RawText"),
    expected: TEXT_KINDS,
  },
  {
    name: "an ignored-semicolon-cut string fragment as a String token",
    fixture: "lex-label-style-rule",
    mutate: retypeIn("KanbanLabel", "StringFragment", null, "String"),
    expected: TEXT_KINDS,
  },
  {
    name: "an icon marker as a Punctuator token",
    fixture: "db-decoration-icon-item",
    mutate: retypeIn("KanbanIconStatement", "Keyword", "::icon(", "Punctuator"),
    expected: OWN_KIND,
  },
  {
    name: "an icon closer as a Keyword token",
    fixture: "db-decoration-icon-item",
    mutate: retypeIn("KanbanIconStatement", "Punctuator", ")", "Keyword"),
    expected: OWN_KIND,
  },
  {
    name: "icon text as an Identifier token",
    fixture: "db-decoration-icon-item",
    mutate: retypeIn("KanbanIconStatement", "RawText", "star", "Identifier"),
    expected: TEXT_KINDS,
  },
  {
    name: "a class marker as a Keyword token",
    fixture: "db-decoration-class-item",
    mutate: retypeIn("KanbanClassStatement", "Punctuator", ":::", "Keyword"),
    expected: OWN_KIND,
  },
  {
    name: "class text as an Identifier token",
    fixture: "db-decoration-class-item",
    mutate: retypeIn(
      "KanbanClassStatement",
      "RawText",
      "hot cold",
      "Identifier",
    ),
    expected: TEXT_KINDS,
  },
  {
    name: "a data opener as a RawText token",
    fixture: "db-metadata-empty",
    mutate: retypeIn("KanbanDataBlock", "Punctuator", "@{", "RawText"),
    expected: DATA_DELIMITERS,
  },
  {
    name: "a data closer as a RawText token",
    fixture: "db-metadata-empty",
    mutate: retypeIn("KanbanDataBlock", "Punctuator", "}", "RawText"),
    expected: DATA_DELIMITERS,
  },
  {
    name: "a quoted data interior as a String token",
    fixture: "db-metadata-quotes-empty",
    mutate: retypeIn("KanbanDataBlock", "RawText", null, "String"),
    expected: TEXT_KINDS,
  },
  {
    name: "a directive-cut data fragment as a StringFragment token",
    fixture: "db-metadata-directive",
    mutate: retypeIn("KanbanDataBlock", "RawText", null, "StringFragment"),
    expected: TEXT_KINDS,
  },
  {
    name: "a negative indent",
    fixture: "db-shape-square",
    mutate: (root) => setField(firstNode(root, "KanbanNode"), "indent", -1),
    expected: "the indent is no integer of 0 or more",
  },
  {
    name: "an indent different from the written whitespace",
    fixture: "db-shape-square",
    mutate: (root) => setField(firstNode(root, "KanbanNode"), "indent", 2),
    expected: "the indent, which is the number of whitespace characters",
  },
  {
    name: "a node with neither text nor shape",
    fixture: "db-indent-deeper",
    mutate: (root) => setField(firstNode(root, "KanbanNode"), "id", null),
    expected: "has neither a node text nor a shape",
  },
  {
    name: "a closer different from the one written",
    fixture: "db-shape-mismatched",
    mutate: (root) => setField(firstNode(root, "KanbanShape"), "closer", "]"),
    expected: "the written closer",
  },
  {
    name: "a label of an unknown kind",
    fixture: "db-shape-square",
    mutate: (root) => setField(firstNode(root, "KanbanLabel"), "kind", "html"),
    expected: "the field kind is",
  },
  {
    name: "node text without its written trailing whitespace",
    fixture: "db-name-trailing-space",
    mutate: (root) => setField(firstNode(root, "KanbanLiteral"), "value", "S"),
    expected: "value is not its written text",
  },
  {
    name: "a data value without its written whitespace",
    fixture: "db-metadata-spaces",
    mutate: (root) => setField(firstNode(root, "KanbanDataBlock"), "value", ""),
    expected: "value is not its written text",
  },
  {
    name: "adjacent data blocks in reverse order",
    fixture: "db-metadata-two-items",
    mutate: (root) => {
      const item = (root.body.body as CheckedNode[])[1]
      if (item === undefined) throw new Error("no item with data")
      setField(item, "data", [...(item.data as CheckedNode[])].reverse())
    },
    expected: "comes before the child node",
  },
  {
    name: "a node range that stops before its shape closer",
    fixture: "db-shape-square",
    mutate: setEnd(
      "KanbanNode",
      (root) => firstNode(root, "KanbanNode").range[1] - 1,
    ),
    expected:
      "the range, which runs from the first of its tokens and child nodes to the last",
  },
]

describe("checkTree of the recorded kanban trees", () => {
  for (const mutation of RECORDED_CASES)
    it(`passes ${mutation.fixture} and reports ${mutation.name}`, () => {
      const { base, mutated } = problemsOfMutation("kanban", mutation)
      expect(base).toEqual([])
      expect(
        says(mutated, mutation.expected),
        JSON.stringify(mutated, null, 1),
      ).toBe(true)
    })
})
