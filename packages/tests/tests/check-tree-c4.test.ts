import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import { C4_CHILD_TYPES, C4_FIELD_WORDS } from "../src/check-tree/c4.ts"
import { KEYWORD_TEXTS } from "../src/check-tree/keywords.ts"
import { nodesOf } from "../src/check-tree/walk.ts"
import type { CheckedNode } from "../src/check-tree/types.ts"
import { childOf } from "../src/check-tree/statement-checks.ts"
import type { Built, Kit, BrokenCase } from "./check-tree-built.ts"
import {
  buildTree,
  itFailsEach,
  nodeWith,
  retype,
  tokenWith,
} from "./check-tree-built.ts"
import type { MutationCase } from "./check-tree-recorded.ts"
import {
  firstNode,
  problemsOf as problemsOfMutation,
  retypeIn,
  says,
  setEnd,
  setField,
} from "./check-tree-recorded.ts"
import {
  readFieldTables,
  readFieldMeanings,
  readTreeDocuments,
} from "./spec-field-tables.ts"

/** A fixed source and explicitly supplied C4 body, without a parser. */
function build(
  source: string,
  body: (kit: Kit) => CheckedNode[],
  beforeBody: (kit: Kit) => CheckedNode[] = () => [],
): Built {
  let before: CheckedNode[] = []
  return buildTree(
    {
      header: "C4Context",
      diagramType: "c4",
      bodyType: "C4Diagram",
      bodyFields: (nodes) => ({
        kind: "context",
        beforeBody: before,
        body: nodes,
      }),
    },
    source,
    (kit) => {
      before = beforeBody(kit)
      return body(kit)
    },
  )
}

/** A written literal with its RawText token. */
function literal(kit: Kit, value: string): CheckedNode {
  const token = kit.token("RawText", value)
  return kit.node("C4Literal", token.range, { value })
}

/** A closed shared StringLiteral, preserving every interior character. */
function string(kit: Kit, raw: string): CheckedNode {
  const token = kit.token("String", raw)
  return kit.node("StringLiteral", token.range, {
    raw,
    value: raw.slice(1, -1),
    closed: true,
  })
}

/** A named attribute, with a nullable trimmed key. */
function named(kit: Kit, key: string | null, raw: string): CheckedNode {
  const first = kit.token("Punctuator", "$")
  const keyNode = key === null ? null : literal(kit, key)
  kit.token("Punctuator", "=")
  const value = string(kit, raw)
  return kit.node("C4NamedAttribute", [first.range[0], value.range[1]], {
    key: keyNode,
    value,
  })
}

/** A closed description block, including the empty blocks held before a body. */
function block(kit: Kit, value: string | null): CheckedNode {
  const first = kit.token("Keyword", "accDescr")
  kit.token("Punctuator", "{")
  const text = value === null ? null : literal(kit, value)
  const last = kit.token("Punctuator", "}")
  return kit.node("C4AccDescrBlockStatement", [first.range[0], last.range[1]], {
    value: text,
  })
}

/** One title or accessibility line with an explicit nullable value. */
function line(
  kit: Kit,
  keyword: string,
  value: string | null,
  type: string,
  colon = false,
): CheckedNode {
  const first = kit.token("Keyword", keyword)
  const mark = colon ? kit.token("Punctuator", ":") : first
  const text = value === null ? null : literal(kit, value)
  return kit.node(type, [first.range[0], text?.range[1] ?? mark.range[1]], {
    value: text,
  })
}

/** One call with explicitly supplied argument nodes and optional braced children. */
function call(
  kit: Kit,
  type: string,
  keyword: string,
  args: readonly (() => CheckedNode)[],
  body?: () => CheckedNode[],
  before?: () => CheckedNode[],
): CheckedNode {
  const first = kit.token("Keyword", keyword)
  kit.token("Punctuator", "(")
  const arguments_ = args.map((argument, index) => {
    if (index > 0) kit.token("Punctuator", ",")
    return argument()
  })
  const close = kit.token("Punctuator", ")")
  const beforeBody = before?.() ?? []
  if (body === undefined)
    return kit.node(type, [first.range[0], close.range[1]], {
      keyword,
      arguments: arguments_,
    })
  kit.token("Punctuator", "{")
  const children = body()
  const last = kit.token("Punctuator", "}")
  return kit.node(type, [first.range[0], last.range[1]], {
    keyword,
    arguments: arguments_,
    beforeBody,
    body: children,
  })
}

/** The ordinary two-argument Person statement. */
function person(kit: Kit): CheckedNode {
  return call(kit, "C4ElementStatement", "Person", [
    () => literal(kit, "a"),
    () => string(kit, '"A"'),
  ])
}

/** Every C4 node type, child field, nullable context and significant statement family. */
function everyKind(): Built {
  return build(
    'C4Context accDescr {}\ntitle  T \naccDescription  D \naccTitle: Title\naccDescr: Description\naccDescr { Block }\nBoundary(b,"B")accDescr {} {\nPerson(a,"A",$tags=" tag ")\nRel(a,b,"")\nUpdateLayoutConfig("3")\n}\n',
    (kit) => [
      line(kit, "title", " T ", "C4TitleStatement"),
      line(kit, "accDescription", " D ", "C4AccDescriptionStatement"),
      line(kit, "accTitle", "Title", "C4AccTitleStatement", true),
      line(kit, "accDescr", "Description", "C4AccDescrStatement", true),
      block(kit, "Block"),
      call(
        kit,
        "C4BoundaryStatement",
        "Boundary",
        [() => literal(kit, "b"), () => string(kit, '"B"')],
        () => [
          call(kit, "C4ElementStatement", "Person", [
            () => literal(kit, "a"),
            () => string(kit, '"A"'),
            () => named(kit, "tags", '" tag "'),
          ]),
          call(kit, "C4RelationshipStatement", "Rel", [
            () => literal(kit, "a"),
            () => literal(kit, "b"),
            () => string(kit, '""'),
          ]),
          call(kit, "C4UpdateStatement", "UpdateLayoutConfig", [
            () => string(kit, '"3"'),
          ]),
        ],
        () => [block(kit, null)],
      ),
    ],
    (kit) => [block(kit, null)],
  )
}

/** One fixed nullable argument list; punctuation units are supplied explicitly. */
function holes(split: "open" | "double" | null = null): Built {
  return build('C4Context\nPerson(,,,"A",)\n', (kit) => {
    const first = kit.token("Keyword", "Person")
    kit.token("Punctuator", split === "open" ? "(" : "(,")
    if (split === "open") kit.token("Punctuator", ",")
    kit.token("Punctuator", split === "double" ? "," : ",,")
    if (split === "double") kit.token("Punctuator", ",")
    const value = string(kit, '"A"')
    kit.token("Punctuator", ",")
    const last = kit.token("Punctuator", ")")
    return [
      kit.node("C4ElementStatement", [first.range[0], last.range[1]], {
        keyword: "Person",
        arguments: [null, null, value],
      }),
    ]
  })
}

/** Change one field while preserving the fixed source. */
function field(
  type: string,
  key: string,
  value: unknown,
): BrokenCase["mutate"] {
  return (tree) => setField(nodeWith(tree, type), key, value)
}

const BROKEN: readonly BrokenCase[] = [
  {
    name: "arguments outside written order",
    built: everyKind,
    mutate: (tree) => {
      const callNode = nodeWith(tree, "C4ElementStatement")
      setField(
        callNode,
        "arguments",
        [...(callNode.arguments as CheckedNode[])].reverse(),
      )
    },
    expected: "the argument entries, including comma and whitespace holes",
  },
  {
    name: "a literal range beyond its written token hull",
    built: everyKind,
    mutate: (tree) => {
      const value = nodeWith(tree, "C4Literal")
      setField(value, "range", [value.range[0] - 1, value.range[1]])
    },
    expected: "the range, which runs",
  },
  {
    name: "a null entry in the diagram body",
    built: everyKind,
    mutate: field("C4Diagram", "body", [null]),
    expected: "is no node",
  },
  {
    name: "an argument list made null",
    built: everyKind,
    mutate: field("C4ElementStatement", "arguments", null),
    expected: "the field arguments is null, not a list",
  },
  {
    name: "a description block without its closing brace",
    built: everyKind,
    mutate: (tree) => setField(tokenWith(tree, "}"), "value", "{"),
    expected: "the tokens that the node writes itself and its child nodes",
  },
  {
    name: "a boundary without its closing brace",
    built: everyKind,
    mutate: (tree) => {
      const last = tree.tokens.at(-1)
      if (last === undefined) throw new Error("no closing brace")
      setField(last, "value", "{")
    },
    expected: "the tokens that the node writes itself and its child nodes",
  },
  {
    name: "a literal given a Numeric token",
    built: everyKind,
    mutate: retype("Block", "Numeric"),
    expected: "a C4Literal",
  },
  {
    name: "a key containing its equals delimiter",
    built: everyKind,
    mutate: (tree) => {
      const key = childOf(nodeWith(tree, "C4NamedAttribute"), "key")
      if (key === null) throw new Error("no key")
      setField(key, "value", "ta=gs")
    },
    expected: "the named key holds its equals delimiter",
  },
  {
    name: "a bare argument containing a comma",
    built: everyKind,
    mutate: (tree) => {
      const arg = (
        nodeWith(tree, "C4ElementStatement").arguments as CheckedNode[]
      )[0]
      if (arg === undefined) throw new Error("no argument")
      setField(arg, "value", "a,b")
    },
    expected: "the bare argument holds its comma delimiter",
  },
  {
    name: "a block value containing its closing brace",
    built: everyKind,
    mutate: (tree) => {
      const node = nodesOf(tree).find(
        (candidate) =>
          candidate.type === "C4AccDescrBlockStatement" &&
          candidate.value !== null,
      )
      if (node === undefined) throw new Error("no nonempty block")
      const value = childOf(node, "value")
      if (value === null) throw new Error("no value")
      setField(value, "value", "B}lock")
    },
    expected: "the description value holds its closing brace",
  },
  {
    name: "an unknown diagram kind",
    built: everyKind,
    mutate: field("C4Diagram", "kind", "other"),
    expected: "the field kind is",
  },
  {
    name: "a known kind that disagrees with the header",
    built: everyKind,
    mutate: field("C4Diagram", "kind", "dynamic"),
    expected: "the tokens that the node writes itself",
  },
  {
    name: "the wrong diagram id",
    built: everyKind,
    mutate: field("Root", "diagramType", "block"),
    expected: "is not one of those of a C4Diagram",
  },
  {
    name: "a nonempty block before the header newline",
    built: everyKind,
    mutate: (tree) =>
      setField(
        nodeWith(tree, "C4AccDescrBlockStatement"),
        "value",
        nodeWith(tree, "C4Literal"),
      ),
    expected: "beforeBody holds a nonempty",
  },
  {
    name: "a nonempty block before a boundary brace",
    built: everyKind,
    mutate: (tree) => {
      const node = nodeWith(tree, "C4BoundaryStatement")
      const before = (node.beforeBody as CheckedNode[])[0]
      if (before === undefined) throw new Error("no block")
      setField(before, "value", nodeWith(tree, "C4Literal"))
    },
    expected: "beforeBody holds a nonempty",
  },
  {
    name: "an empty diagram body",
    built: everyKind,
    mutate: field("C4Diagram", "body", []),
    expected: "the body has no significant",
  },
  {
    name: "an empty boundary body",
    built: everyKind,
    mutate: field("C4BoundaryStatement", "body", []),
    expected: "the boundary body does not begin",
  },
  {
    name: "a boundary beginning with a title",
    built: everyKind,
    mutate: (tree) =>
      setField(nodeWith(tree, "C4BoundaryStatement"), "body", [
        nodeWith(tree, "C4TitleStatement"),
      ]),
    expected: "the boundary body does not begin",
  },
  {
    name: "a title value made null",
    built: everyKind,
    mutate: field("C4TitleStatement", "value", null),
    expected: "the field value is null",
  },
  {
    name: "an accDescription value made null",
    built: everyKind,
    mutate: field("C4AccDescriptionStatement", "value", null),
    expected: "the field value is null",
  },
  {
    name: "a named value made null",
    built: everyKind,
    mutate: field("C4NamedAttribute", "value", null),
    expected: "the field value is null",
  },
  {
    name: "a named key made null despite written text",
    built: everyKind,
    mutate: field("C4NamedAttribute", "key", null),
    expected: "the null key has non-whitespace",
  },
  {
    name: "a colon value made null despite written text",
    built: everyKind,
    mutate: field("C4AccTitleStatement", "value", null),
    expected: "the null accessibility value has non-whitespace",
  },
  {
    name: "a description value made null despite written text",
    built: everyKind,
    mutate: field("C4AccDescrStatement", "value", null),
    expected: "the null accessibility value has non-whitespace",
  },
  {
    name: "a block value made null despite written text",
    built: everyKind,
    mutate: (tree) => {
      const blockNode = (tree.body.body as CheckedNode[]).find(
        (node) => node.type === "C4AccDescrBlockStatement",
      )
      if (blockNode === undefined) throw new Error("no block")
      setField(blockNode, "value", null)
    },
    expected: "the value is null, but the braces hold",
  },
  {
    name: "a string value changed",
    built: everyKind,
    mutate: field("StringLiteral", "value", "wrong"),
    expected: "value is not its written text",
  },
  {
    name: "a string raw changed",
    built: everyKind,
    mutate: field("StringLiteral", "raw", '"wrong"'),
    expected: "raw",
  },
  {
    name: "an unclosed string",
    built: everyKind,
    mutate: field("StringLiteral", "closed", false),
    expected: "the string is not closed",
  },
  {
    name: "a written literal changed",
    built: everyKind,
    mutate: field("C4Literal", "value", "wrong"),
    expected: "value is not its written text",
  },
  {
    name: "an empty literal",
    built: everyKind,
    mutate: field("C4Literal", "value", ""),
    expected: "the C4Literal is empty",
  },
  {
    name: "exterior whitespace in a key",
    built: everyKind,
    mutate: (tree) => {
      const key = childOf(nodeWith(tree, "C4NamedAttribute"), "key")
      if (key === null) throw new Error("no key")
      setField(key, "value", " tags ")
    },
    expected: "the C4Literal starts or ends with whitespace",
  },
  {
    name: "a missing comma hole",
    built: holes,
    mutate: (tree) => {
      const node = nodeWith(tree, "C4ElementStatement")
      setField(node, "arguments", (node.arguments as unknown[]).slice(1))
    },
    expected: "the argument entries, including",
  },
  {
    name: "a null argument over written text",
    built: everyKind,
    mutate: field("C4ElementStatement", "arguments", [null]),
    expected: "lies in no value node",
  },
  {
    name: "the header token given another kind",
    built: everyKind,
    mutate: retype("C4Context", "Punctuator"),
    expected: "the kind of a token that the node writes itself",
  },
  {
    name: "a call delimiter given another kind",
    built: everyKind,
    mutate: retype("(", "Keyword"),
    expected: "the kind of a token that the node writes itself",
  },
  {
    name: "a call with the wrong known keyword",
    built: everyKind,
    mutate: field("C4ElementStatement", "keyword", "System"),
    expected: "the call does not have its keyword",
  },
  {
    name: "a call without its closing parenthesis",
    built: everyKind,
    mutate: (tree) => setField(tokenWith(tree, ")"), "value", "("),
    expected: "the call does not have its keyword",
  },
  {
    name: "a statement range outside its hull",
    built: everyKind,
    mutate: (tree) => {
      const node = nodeWith(tree, "C4TitleStatement")
      setField(node, "range", [node.range[0], node.range[1] + 1])
    },
    expected: "the range, which runs",
  },
]

const BAD_LAYOUTS: readonly {
  readonly name: string
  readonly built: () => Built
  readonly expected: string
}[] = [
  {
    name: "quoted text recorded as a bare argument",
    built: () =>
      build('C4Context\nPerson("A")\n', (kit) => [
        call(kit, "C4ElementStatement", "Person", [() => literal(kit, '"A"')]),
      ]),
    expected: "the bare argument starts a quoted or named unit",
  },
  {
    name: "a string argument after a tab",
    built: () =>
      build('C4Context\nPerson(\t"A")\n', (kit) => [
        call(kit, "C4ElementStatement", "Person", [() => string(kit, '"A"')]),
      ]),
    expected: "a string or named argument has non-ASCII whitespace before it",
  },
  {
    name: "unrecorded bare whitespace before a closing parenthesis",
    built: () =>
      build('C4Context\nPerson("A" )\n', (kit) => [
        call(kit, "C4ElementStatement", "Person", [() => string(kit, '"A"')]),
      ]),
    expected:
      "the closing parenthesis is preceded by an unrecorded bare argument",
  },
  {
    name: "trailing text outside statements",
    built: () =>
      build('C4Context\nPerson(a,"A")oops\n', (kit) => [person(kit)]),
    expected: "the body has trailing text outside its statements",
  },
  {
    name: "an empty block leaving an extra trailing newline unit",
    built: () =>
      build('C4Context\nPerson(a,"A")\naccDescr {}\n', (kit) => [
        person(kit),
        block(kit, null),
      ]),
    expected: "extra trailing newline units",
  },
  {
    name: "an opening empty-entry token split in two",
    built: () => holes("open"),
    expected: "the opening empty-entry form is not one",
  },
  {
    name: "a doubled-comma token split in two",
    built: () => holes("double"),
    expected: "the doubled comma is not one",
  },
  {
    name: "an empty block splitting header whitespace into two newline units",
    built: () =>
      build('C4Context\naccDescr {}\nPerson(a,"A")\n', (kit) => [
        block(kit, null),
        person(kit),
      ]),
    expected: "extra newline units",
  },
  {
    name: "a final bare argument without its comma",
    built: () =>
      build("C4Context\nPerson(a)\n", (kit) => [
        call(kit, "C4ElementStatement", "Person", [() => literal(kit, "a")]),
      ]),
    expected: "a bare argument ends before its comma",
  },
  {
    name: "a statement on the header line",
    built: () => build('C4Context Person(a,"A")\n', (kit) => [person(kit)]),
    expected: "a required newline",
  },
  {
    name: "two calls on one line",
    built: () =>
      build('C4Context\nPerson(a,"A")Person(a,"A")\n', (kit) => [
        person(kit),
        person(kit),
      ]),
    expected: "a required newline",
  },
  {
    name: "a spaced call opener",
    built: () => build('C4Context\nPerson (a,"A")\n', (kit) => [person(kit)]),
    expected: "does not touch its opening",
  },
  {
    name: "a same-line boundary brace and first child",
    built: () =>
      build('C4Context\nBoundary(b,"B"){Person(a,"A")}\n', (kit) => [
        call(
          kit,
          "C4BoundaryStatement",
          "Boundary",
          [() => literal(kit, "b"), () => string(kit, '"B"')],
          () => [person(kit)],
        ),
      ]),
    expected: "no newline before or after",
  },
  {
    name: "a body consisting only of empty blocks",
    built: () => build("C4Context\naccDescr {}\n", (kit) => [block(kit, null)]),
    expected: "no significant statement",
  },
  {
    name: "a nonempty named string required",
    built: () =>
      build('C4Context\nPerson($tags="")\n', (kit) => [
        call(kit, "C4ElementStatement", "Person", [
          () => named(kit, "tags", '""'),
        ]),
      ]),
    expected: "the named value is empty",
  },
  {
    name: "a tab before a named quote",
    built: () =>
      build('C4Context\nPerson($tags=\t"T")\n', (kit) => [
        call(kit, "C4ElementStatement", "Person", [
          () => named(kit, "tags", '"T"'),
        ]),
      ]),
    expected: "separator other than ASCII spaces",
  },
  {
    name: "a title losing trailing spaces",
    built: () =>
      build("C4Context\ntitle T  \n", (kit) => [
        line(kit, "title", "T", "C4TitleStatement"),
      ]),
    expected: "does not end the text",
  },
  {
    name: "a title losing additional leading spaces",
    built: () =>
      build("C4Context\ntitle   T\n", (kit) => [
        line(kit, "title", "T", "C4TitleStatement"),
      ]),
    expected: "not one whitespace character",
  },
  {
    name: "a title holding LF",
    built: () =>
      build("C4Context\ntitle A\nB\n", (kit) => [
        line(kit, "title", "A\nB", "C4TitleStatement"),
      ]),
    expected: "character that ends its unit",
  },
  {
    name: "two adjacent nonempty description blocks",
    built: () =>
      build("C4Context\naccDescr { A }accDescr { B }\n", (kit) => [
        block(kit, "A"),
        block(kit, "B"),
      ]),
    expected: "a required newline",
  },
  {
    name: "a beforeBody block after the header newline",
    built: () =>
      build(
        'C4Context\naccDescr {}Person(a,"A")\n',
        (kit) => [person(kit)],
        (kit) => [block(kit, null)],
      ),
    expected: "beforeBody follows the header newline",
  },
  {
    name: "a direction lookahead in a title",
    built: () =>
      build("C4Context\ntitle direction TB\n", (kit) => [
        line(kit, "title", "direction TB", "C4TitleStatement"),
      ]),
    expected: "matches the direction rejection",
  },
]

describe("checkTree of C4 trees made by hand", () => {
  it("accepts a title after the first boundary call", () => {
    const { source, tree } = build(
      'C4Context\nBoundary(b,"B") {\nPerson(a,"A")\ntitle T\n}\n',
      (kit) => [
        call(
          kit,
          "C4BoundaryStatement",
          "Boundary",
          [() => literal(kit, "b"), () => string(kit, '"B"')],
          () => [person(kit), line(kit, "title", "T", "C4TitleStatement")],
        ),
      ],
    )
    expect(checkTree(source, tree)).toEqual([])
  })
  it("accepts ASCII spaces inside the opening empty-entry token", () => {
    const { source, tree } = build('C4Context\nPerson(  ,"A")\n', (kit) => {
      const first = kit.token("Keyword", "Person")
      kit.token("Punctuator", "(  ,")
      const value = string(kit, '"A"')
      const last = kit.token("Punctuator", ")")
      return [
        kit.node("C4ElementStatement", [first.range[0], last.range[1]], {
          keyword: "Person",
          arguments: [null, value],
        }),
      ]
    })
    expect(checkTree(source, tree)).toEqual([])
  })
  it("accepts trimmed exterior whitespace of a bare argument", () => {
    const { source, tree } = build('C4Context\nPerson( a  ,"A")\n', (kit) => [
      person(kit),
    ])
    expect(checkTree(source, tree)).toEqual([])
  })
  it("accepts a multiline bare unit including its apparent closing parenthesis", () => {
    const { source, tree } = build(
      'C4Context\nPerson(a)\nnext,"A")\n',
      (kit) => [
        call(kit, "C4ElementStatement", "Person", [
          () => literal(kit, "a)\nnext"),
          () => string(kit, '"A"'),
        ]),
      ],
    )
    expect(checkTree(source, tree)).toEqual([])
  })
  it("accepts a directive-cut string and rejects an unfragmented token", () => {
    const { source, tree } = build(
      'C4Context\nPerson("a%%{init: {}}%%b")\n',
      (kit) => [
        call(kit, "C4ElementStatement", "Person", [
          () => {
            const first = kit.token("StringFragment", '"a')
            kit.directive("%%{init: {}}%%")
            const last = kit.token("StringFragment", 'b"')
            return kit.node("StringLiteral", [first.range[0], last.range[1]], {
              raw: '"a%%{init: {}}%%b"',
              value: "ab",
              closed: true,
            })
          },
        ]),
      ],
    )
    expect(checkTree(source, tree)).toEqual([])
    setField(tokenWith(tree, '"a'), "type", "String")
    expect(
      checkTree(source, tree).some((problem) =>
        problem.message.includes("tokens of the string"),
      ),
    ).toBe(true)
  })
  for (const testCase of BAD_LAYOUTS)
    it(`rejects ${testCase.name}`, () => {
      const { source, tree } = testCase.built()
      const problems = checkTree(source, tree)
      expect(
        problems.some((problem) => problem.message.includes(testCase.expected)),
        JSON.stringify(problems),
      ).toBe(true)
    })
  it("accepts a next-line boundary brace and inline child", () => {
    const { source, tree } = build(
      'C4Context\nBoundary(b,"B")\n{Person(a,"A")}\n',
      (kit) => [
        call(
          kit,
          "C4BoundaryStatement",
          "Boundary",
          [() => literal(kit, "b"), () => string(kit, '"B"')],
          () => [person(kit)],
        ),
      ],
    )
    expect(checkTree(source, tree)).toEqual([])
  })
  it("accepts comments between statements and before a next-line brace", () => {
    const { source, tree } = build(
      'C4Context\nBoundary(b,"B")%% gap\n{Person(a,"A")}\nPerson(a,"A")%% end\nPerson(a,"A")\n',
      (kit) => {
        const boundary = call(
          kit,
          "C4BoundaryStatement",
          "Boundary",
          [() => literal(kit, "b"), () => string(kit, '"B"')],
          () => [person(kit)],
          () => {
            kit.comment("%%", "%% gap")
            return []
          },
        )
        const first = person(kit)
        kit.comment("%%", "%% end")
        return [boundary, first, person(kit)]
      },
    )
    expect(checkTree(source, tree)).toEqual([])
  })
  it("accepts an entity in a title's converted text", () => {
    const { source, tree } = build("C4Context\ntitle a#35;b\n", (kit) => [
      line(kit, "title", "a#35;b", "C4TitleStatement"),
    ])
    expect(checkTree(source, tree)).toEqual([])
  })
  it("accepts every node kind and both beforeBody lists", () => {
    const { source, tree } = everyKind()
    expect(checkTree(source, tree)).toEqual([])
  })
  it("accepts comma holes, an empty string and a trailing comma", () => {
    const { source, tree } = holes()
    expect(checkTree(source, tree)).toEqual([])
  })
  it("accepts a null named key and a whitespace-only named value", () => {
    const { source, tree } = build('C4Context\nPerson($=" ")\n', (kit) => [
      call(kit, "C4ElementStatement", "Person", [
        () => named(kit, null, '" "'),
      ]),
    ])
    expect(checkTree(source, tree)).toEqual([])
  })
  it("accepts an empty description block before a call and a comment after it", () => {
    const { source, tree } = build(
      'C4Context\naccDescr {}Person(a,"A")%% inline\n',
      (kit) => {
        const nodes = [block(kit, null), person(kit)]
        kit.comment("%%", "%% inline")
        return nodes
      },
    )
    expect(checkTree(source, tree)).toEqual([])
    const comment = tree.comments[0]
    if (comment === undefined) throw new Error("no comment")
    setField(comment, "mark", "%")
    expect(
      checkTree(source, tree).some((problem) =>
        problem.message.includes("no mark of the comments of a C4Diagram"),
      ),
    ).toBe(true)
  })
  itFailsEach(BROKEN)
  for (const [type, fields] of Object.entries(C4_CHILD_TYPES))
    for (const fieldName of Object.keys(fields)) {
      it(`rejects the wrong child type in ${type}.${fieldName}`, () => {
        const { source, tree } = everyKind()
        const node = nodesOf(tree).find(
          (candidate) =>
            candidate.type === type && candidate[fieldName] !== null,
        )
        if (node === undefined) throw new Error("no node with the child")
        const child = Array.isArray(node[fieldName])
          ? (node[fieldName] as CheckedNode[])[0]
          : childOf(node, fieldName)
        if (child === undefined || child === null) throw new Error("no child")
        const wrong = {
          type: "Identifier",
          range: child.range,
          loc: child.loc,
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
  for (const type of [
    "C4ElementStatement",
    "C4BoundaryStatement",
    "C4RelationshipStatement",
    "C4UpdateStatement",
  ]) {
    it(`rejects an empty argument list of ${type}`, () => {
      const { source, tree } = everyKind()
      setField(nodeWith(tree, type), "arguments", [])
      expect(
        checkTree(source, tree).some(
          (problem) =>
            problem.message.includes("arguments") &&
            problem.message.includes("empty"),
        ),
      ).toBe(true)
    })
    it(`rejects an unknown keyword of ${type}`, () => {
      const { source, tree } = everyKind()
      setField(nodeWith(tree, type), "keyword", "Other")
      expect(
        checkTree(source, tree).some((problem) =>
          problem.message.startsWith("the field keyword is"),
        ),
      ).toBe(true)
    })
  }
  it("holds child types and keyword families to the specification", () => {
    const tables = readFieldTables()
    const document = readTreeDocuments().find((text) =>
      text.startsWith("# C4 nodes"),
    )
    if (document === undefined) throw new Error("no C4 tree document")
    const aliases: Record<string, string[]> = {}
    for (const name of ["C4Statement", "C4Argument"]) {
      const sentence = new RegExp(`${name} is ([\\s\\S]*?)\\.`, "u").exec(
        document,
      )?.[1]
      if (sentence === undefined) throw new Error(`no definition of ${name}`)
      aliases[name] = [
        ...sentence.matchAll(/\b(?:C4[A-Za-z]+|StringLiteral)\b/gu),
      ].map((match) => match[0])
    }
    const expected: Record<string, Record<string, string[]>> = {}
    for (const [type, fields] of tables) {
      if (!type.startsWith("C4")) continue
      for (const [fieldName, cell] of fields) {
        const names = [
          ...cell.matchAll(/\b(?:C4[A-Za-z]+|StringLiteral)\b/gu),
        ].map((match) => match[0])
        if (names.length === 0) continue
        expected[type] ??= {}
        expected[type][fieldName] = names.flatMap(
          (name) => aliases[name] ?? [name],
        )
      }
    }
    expect(C4_CHILD_TYPES).toEqual(expected)
    for (const [type, fields] of Object.entries(C4_FIELD_WORDS)) {
      if (type === "C4Diagram") continue
      const section = document.split(`### ${type}\n`)[1]?.split("### ")[0]
      const sentence =
        /`keyword` is ([\s\S]*?)\./u.exec(section ?? "")?.[1] ?? ""
      expect(fields.keyword).toEqual(
        [...sentence.matchAll(/`([^`]+)`/gu)].map((match) => match[1]),
      )
    }
    const text = readFieldMeanings().get("C4Diagram")?.get("kind") ?? ""
    expect(C4_FIELD_WORDS.C4Diagram?.kind).toEqual(
      [...text.matchAll(/`([^`]+)`/gu)].map((match) => match[1]),
    )
    const words = [
      "c4context",
      "c4container",
      "c4component",
      "c4dynamic",
      "c4deployment",
      "title",
      "accdescription",
      "acctitle",
      "accdescr",
      ...Object.entries(C4_FIELD_WORDS)
        .filter(([type]) => type !== "C4Diagram")
        .flatMap(([, fields]) => fields.keyword ?? [])
        .map((word) => word.toLowerCase()),
    ]
    expect(new Set(KEYWORD_TEXTS.C4Diagram)).toEqual(new Set(words))
  })
})

const RECORDED_STRING_KINDS =
  "the tokens of the string are not one String token or StringFragment tokens"

const RECORDED_CASES: readonly MutationCase[] = [
  {
    name: "the header as a RawText token",
    fixture: "header-context-minimal",
    mutate: retypeIn("C4Diagram", "Keyword", "C4Context", "RawText"),
    expected: "the kind of a token that the node writes itself",
  },
  {
    name: "an element keyword as a RawText token",
    fixture: "header-context-minimal",
    mutate: retypeIn("C4ElementStatement", "Keyword", "Person", "RawText"),
    expected: "the kind of a token that the node writes itself",
  },
  {
    name: "a boundary brace as a Keyword token",
    fixture: "db-keyword-boundary",
    mutate: retypeIn("C4BoundaryStatement", "Punctuator", "{", "Keyword"),
    expected: "the kind of a token that the node writes itself",
  },
  {
    name: "a relationship keyword as a RawText token",
    fixture: "db-keyword-rel",
    mutate: retypeIn("C4RelationshipStatement", "Keyword", "Rel", "RawText"),
    expected: "the kind of a token that the node writes itself",
  },
  {
    name: "an update keyword as a RawText token",
    fixture: "db-keyword-updatelayoutconfig",
    mutate: retypeIn(
      "C4UpdateStatement",
      "Keyword",
      "UpdateLayoutConfig",
      "RawText",
    ),
    expected: "the kind of a token that the node writes itself",
  },
  {
    name: "an opening empty entry as a Keyword token",
    fixture: "lex-empty-comma",
    mutate: retypeIn("C4ElementStatement", "Punctuator", "(,", "Keyword"),
    expected: "the kind of a token that the node writes itself",
  },
  {
    name: "a doubled comma as a Keyword token",
    fixture: "lex-double-comma",
    mutate: retypeIn("C4ElementStatement", "Punctuator", ",,", "Keyword"),
    expected: "the kind of a token that the node writes itself",
  },
  {
    name: "a named attribute marker as a Keyword token",
    fixture: "db-named-text-fields",
    mutate: retypeIn("C4NamedAttribute", "Punctuator", "$", "Keyword"),
    expected: "the kind of a token that the node writes itself",
  },
  {
    name: "a bare argument as an Identifier token",
    fixture: "header-context-minimal",
    mutate: retypeIn("C4Literal", "RawText", "a", "Identifier"),
    expected: "a C4Literal",
  },
  {
    name: "a quoted argument as a RawText token",
    fixture: "header-context-minimal",
    mutate: retypeIn("StringLiteral", "String", null, "RawText"),
    expected: RECORDED_STRING_KINDS,
  },
  {
    name: "a directive-cut string fragment as a whole String token",
    fixture: "lex-directive-quoted",
    mutate: retypeIn("C4ElementStatement", "StringFragment", null, "String"),
    expected: RECORDED_STRING_KINDS,
  },
  {
    name: "a comment-cut named value fragment as a whole String token",
    fixture: "lex-named-value-comment-line",
    mutate: retypeIn("C4NamedAttribute", "StringFragment", null, "String"),
    expected: RECORDED_STRING_KINDS,
  },
  {
    name: "a missing opening-comma argument entry",
    fixture: "lex-empty-comma",
    mutate: (root) =>
      setField(firstNode(root, "C4ElementStatement"), "arguments", [
        firstNode(root, "StringLiteral"),
      ]),
    expected: "the argument entries, including comma and whitespace holes",
  },
  {
    name: "a nonempty block in beforeBody",
    fixture: "gram-empty-block-header-gap",
    mutate: (root) =>
      setField(
        firstNode(root, "C4AccDescrBlockStatement"),
        "value",
        firstNode(root, "C4Literal"),
      ),
    expected: "beforeBody holds a nonempty description block",
  },
  {
    name: "a boundary body beginning with a title",
    fixture: "gram-title-inside-boundary",
    mutate: (root) =>
      setField(firstNode(root, "C4BoundaryStatement"), "body", [
        firstNode(root, "C4TitleStatement"),
      ]),
    expected: "the boundary body does not begin with a diagram statement",
  },
  {
    name: "a boundary range ending before its closing brace",
    fixture: "db-keyword-boundary",
    mutate: setEnd(
      "C4BoundaryStatement",
      (root) => firstNode(root, "C4BoundaryStatement").range[1] - 1,
    ),
    expected:
      "the range, which runs from the first of its tokens and child nodes to the last",
  },
]

describe("checkTree of the recorded C4 trees", () => {
  for (const mutation of RECORDED_CASES)
    it(`passes ${mutation.fixture} and reports ${mutation.name}`, () => {
      const { base, mutated } = problemsOfMutation("c4", mutation)
      expect(base).toEqual([])
      expect(
        says(mutated, mutation.expected),
        JSON.stringify(mutated, null, 1),
      ).toBe(true)
    })
})
