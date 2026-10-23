import { describe, expect, it } from "vitest"
import { loadFixtures } from "../src/index.ts"
import { checkTree } from "../src/check-tree/index.ts"
import { VENN_CHILD_TYPES, VENN_FIELD_WORDS } from "../src/check-tree/venn.ts"
import type { CheckedNode } from "../src/check-tree/types.ts"
import { childOf } from "../src/check-tree/statement-checks.ts"
import { nodesOf } from "../src/check-tree/walk.ts"
import {
  buildTree,
  itFailsEach,
  nodeWith,
  retype,
  tokenWith,
} from "./check-tree-built.ts"
import type { Built, Kit, BrokenCase } from "./check-tree-built.ts"
import {
  firstNode,
  problemsOf as problemsOfMutation,
  retypeIn,
  says,
  setEnd,
  setField,
} from "./check-tree-recorded.ts"
import type { MutationCase } from "./check-tree-recorded.ts"
import { locationOf } from "./check-tree-trees.ts"
import {
  readFieldTables,
  readFieldMeanings,
  readTreeDocuments,
} from "./spec-field-tables.ts"

/** The existing shared builder, with explicitly supplied Venn statements. */
function build(source: string, body: (kit: Kit) => CheckedNode[]): Built {
  return buildTree(
    { header: "venn-beta", diagramType: "venn", bodyType: "VennDiagram" },
    source,
    body,
  )
}

/** A hand-supplied name or numeric id, with its documented token kind. */
function name(kit: Kit, raw: string, numeric = false): CheckedNode {
  const string = raw.startsWith('"')
  const token = kit.token(
    string ? "String" : numeric ? "Numeric" : "Identifier",
    raw,
  )
  return kit.node(
    string ? "StringLiteral" : numeric ? "NumericLiteral" : "Identifier",
    token.range,
    string
      ? { raw, value: raw.slice(1, -1), closed: true }
      : numeric
        ? { raw, value: Number(raw) }
        : { name: raw },
  )
}

/** A bracket label's delimiters belong to the leaf range. */
function bracket(
  kit: Kit,
  raw: string,
  cut?: { value: string; write: (kit: Kit) => void },
): CheckedNode {
  const start = kit.token("Punctuator", "[")
  const string = raw.startsWith('["')
  const interior = raw.slice(1, -1)
  if (cut !== undefined) cut.write(kit)
  else if (interior !== "") kit.token(string ? "String" : "RawText", interior)
  const end = kit.token("Punctuator", "]")
  return kit.node("VennLabel", [start.range[0], end.range[1]], {
    kind: string ? "string" : "text",
    value: cut?.value ?? (string ? interior.slice(1, -1) : interior),
  })
}

/** A written name list with exactly the supplied comma positions. */
function names(kit: Kit, values: readonly string[]): CheckedNode[] {
  return values.map((value, index) => {
    if (index > 0) kit.token("Punctuator", ",")
    return name(kit, value)
  })
}

/** One set or union, preserving its label and number nodes. */
function subset(
  kit: Kit,
  kind = "set",
  values: readonly string[] = ["A"],
  label: string | ((kit: Kit) => CheckedNode) | null = null,
  size: string | null = null,
): CheckedNode {
  const first = kit.token("Keyword", kind)
  const sets = names(kit, values)
  const labelNode =
    typeof label === "function"
      ? label(kit)
      : label === null
        ? null
        : bracket(kit, label)
  if (size !== null) kit.token("Punctuator", ":")
  const number = size === null ? null : name(kit, size, true)
  const last = number ?? labelNode ?? sets.at(-1) ?? first
  return kit.node("VennSubsetStatement", [first.range[0], last.range[1]], {
    kind: kind.toLowerCase(),
    sets,
    label: labelNode,
    size: number,
  })
}

/** The null target form is explicitly chosen by each case, never inferred here. */
function text(
  kit: Kit,
  targets: readonly string[] | null,
  id: string,
  label: string | null = null,
  numeric = false,
): CheckedNode {
  const first = kit.token("Keyword", "text")
  const targetNodes = targets === null ? null : names(kit, targets)
  const idNode = name(kit, id, numeric)
  const labelNode = label === null ? null : bracket(kit, label)
  return kit.node(
    "VennTextStatement",
    [first.range[0], (labelNode ?? idNode).range[1]],
    { targets: targetNodes, id: idNode, label: labelNode },
  )
}

/** Explicit atoms keep their token kinds; the range includes their gaps. */
function literal(kit: Kit, value: string): CheckedNode {
  if (value === "title foo") {
    const first = kit.token("Identifier", "title")
    const last = kit.token("Identifier", "foo")
    return kit.node("VennLiteral", [first.range[0], last.range[1]], { value })
  }
  if (value === "1set-x") {
    const first = kit.token("Numeric", "1")
    const last = kit.token("Identifier", "set-x")
    return kit.node("VennLiteral", [first.range[0], last.range[1]], { value })
  }
  if (value === "1red#abc") {
    const first = kit.token("Numeric", "1")
    kit.token("Identifier", "red")
    const last = kit.token("RawText", "#abc")
    return kit.node("VennLiteral", [first.range[0], last.range[1]], { value })
  }
  if (value === "one  2 #abc") {
    const first = kit.token("Identifier", "one")
    kit.token("Numeric", "2")
    const last = kit.token("RawText", "#abc")
    return kit.node("VennLiteral", [first.range[0], last.range[1]], { value })
  }
  const token = kit.token(
    ["red", "C4Container", "set-x", "union-x", "venn-beta-x"].includes(value)
      ? "Identifier"
      : "RawText",
    value,
  )
  return kit.node("VennLiteral", token.range, { value })
}

/** A style list that retains repeated property occurrences. */
function style(
  kit: Kit,
  targets: readonly string[],
  properties: readonly (readonly [string, string])[],
): CheckedNode {
  const first = kit.token("Keyword", "style")
  const targetNodes = names(kit, targets)
  const nodes = properties.map(([key, value], index) => {
    if (index > 0) kit.token("Punctuator", ",")
    const keyNode = name(kit, key)
    kit.token("Punctuator", ":")
    const valueNode = value.startsWith('"')
      ? name(kit, value)
      : literal(kit, value)
    return kit.node(
      "VennStyleProperty",
      [keyNode.range[0], valueNode.range[1]],
      { key: keyNode, value: valueNode },
    )
  })
  return kit.node(
    "VennStyleStatement",
    [first.range[0], nodes.at(-1)?.range[1] ?? first.range[1]],
    { targets: targetNodes, properties: nodes },
  )
}

/** A title's first separator remains outside its literal. */
function title(kit: Kit, value: string): CheckedNode {
  const first = kit.token("Keyword", "title")
  const content = literal(kit, value)
  return kit.node("VennTitleStatement", [first.range[0], content.range[1]], {
    value: content,
  })
}

/** Every new node, child field and nullable alternative in one fixed source. */
function everyKind(): Built {
  return build(
    'venn-beta\nset A["  "]:-0\nset ""\nunion A,"",A[bare]:2\n text ""[""]\ntext A,A 007\nstyle A,"" x:1red#abc,x:"",__proto__:red\ntitle  T \nq%% c\n',
    (kit) => {
      const body = [
        subset(kit, "set", ["A"], '["  "]', "-0"),
        subset(kit, "set", ['""']),
        subset(kit, "union", ["A", '""', "A"], "[bare]", "2"),
        text(kit, null, '""', '[""]'),
        text(kit, ["A", "A"], "007", null, true),
        style(
          kit,
          ["A", '""'],
          [
            ["x", "1red#abc"],
            ["x", '""'],
            ["__proto__", "red"],
          ],
        ),
        title(kit, " T "),
      ]
      const token = kit.token("RawText", "q")
      body.push(kit.node("VennIgnoredText", token.range, { value: "q" }))
      kit.comment("%%", "%% c")
      return body
    },
  )
}

/** A single enabled indented text marker. */
function implicit(): Built {
  return build("venn-beta\nset A\n text item\n", (kit) => [
    subset(kit),
    text(kit, null, "item"),
  ])
}

/** Bare bracket labels keep padding at both ends of their value. */
function paddedLabel(): Built {
  return build("venn-beta\nset A[  Alpha  ]\n", (kit) => [
    subset(kit, "set", ["A"], "[  Alpha  ]"),
  ])
}

/** An empty line before the unindented empty-brace comment ends the mode. */
function commentEnded(): Built {
  return build("venn-beta\nset A\n\n%%{ }%%\n text A x\n", (kit) => {
    const first = subset(kit)
    kit.comment("%%", "%%{ }%%")
    return [first, text(kit, ["A"], "x")]
  })
}

/** An ordinary next-line style ends implicit mode. */
function ended(): Built {
  return build("venn-beta\nset A\nstyle A x:red\n text A item\n", (kit) => [
    subset(kit),
    style(kit, ["A"], [["x", "red"]]),
    text(kit, ["A"], "item"),
  ])
}

/** Change one field of the first node of a named type. */
function field(
  type: string,
  key: string,
  value: unknown,
): BrokenCase["mutate"] {
  return (tree) => setField(nodeWith(tree, type), key, value)
}

const BROKEN: readonly BrokenCase[] = [
  {
    name: "an uncut title split into two RawText tokens",
    built: everyKind,
    mutate: (tree, source) => {
      const token = tokenWith(tree, " T ")
      const split = token.range[0] + 1
      const secondRange: readonly [number, number] = [split, token.range[1]]
      const second = {
        ...token,
        range: secondRange,
        loc: locationOf(source, secondRange),
        value: source.slice(...secondRange),
      }
      const firstRange: readonly [number, number] = [token.range[0], split]
      setField(token, "range", firstRange)
      setField(token, "loc", locationOf(source, firstRange))
      setField(token, "value", source.slice(...firstRange))
      setField(
        tree,
        "tokens",
        tree.tokens.flatMap((candidate) =>
          candidate === token ? [token, second] : [candidate],
        ),
      )
    },
    expected: "the title token count, split only at common trivia cuts",
  },

  {
    name: "the wrong header text",
    built: everyKind,
    mutate: (tree) => setField(tokenWith(tree, "venn-beta"), "value", "venn"),
    expected: "the tokens of the node outside its child nodes, joined",
  },
  {
    name: "a missing statement in an interior gap",
    built: everyKind,
    mutate: (tree) => {
      const body = tree.body.body as CheckedNode[]
      setField(tree.body, "body", body.slice(1))
    },
    expected: "the statement gap is not Venn whitespace",
  },
  {
    name: "unrepresented trailing text",
    built: everyKind,
    mutate: (tree) => {
      const body = tree.body.body as CheckedNode[]
      setField(tree.body, "body", body.slice(0, -1))
    },
    expected: "the body has trailing text outside its statements",
  },
  {
    name: "the wrong delimiters for a quoted label",
    built: everyKind,
    mutate: (tree) =>
      setField(nodeWith(tree, "VennLabel", "kind", "text"), "kind", "string"),
    expected: "the label does not have the delimiters of its kind",
  },
  {
    name: "quotes inside a bare label",
    built: everyKind,
    mutate: field("VennLabel", "kind", "text"),
    expected: "the label is empty or holds a character that ends its kind",
  },
  {
    name: "ignored text without its following comment",
    built: everyKind,
    mutate: (tree) => setField(tree, "comments", []),
    expected: "one non-whitespace code unit swallowed before %%",
  },
  {
    name: "the first title separator included in its value range",
    built: everyKind,
    mutate: (tree) => {
      const value = childOf(nodeWith(tree, "VennTitleStatement"), "value")
      if (value === null) throw new Error("no title value")
      setField(value, "range", [value.range[0] - 1, value.range[1]])
    },
    expected: "not one whitespace character",
  },
  {
    name: "a title token as a numeric token",
    built: everyKind,
    mutate: retype(" T ", "Numeric"),
    expected: "the tokens of a Venn title",
  },

  {
    name: "a label's interior token kind",
    built: everyKind,
    mutate: retype('"  "', "RawText"),
    expected: "the label content token kinds",
  },
  {
    name: "an empty literal value",
    built: everyKind,
    mutate: field("VennLiteral", "value", ""),
    expected: "the literal is empty",
  },
  {
    name: "a whitespace ignored fragment",
    built: everyKind,
    mutate: field("VennIgnoredText", "value", " "),
    expected: "one non-whitespace code unit swallowed before %%",
  },
  {
    name: "a closing-brace ignored fragment",
    built: everyKind,
    mutate: field("VennIgnoredText", "value", "}"),
    expected: "one non-whitespace code unit swallowed before %%",
  },

  {
    name: "a union preceding its set declarations",
    built: everyKind,
    mutate: (tree) => {
      const body = tree.body.body as CheckedNode[]
      const union = body.find(
        (node) => node.type === "VennSubsetStatement" && node.kind === "union",
      )
      if (union === undefined) throw new Error("no union")
      setField(tree.body, "body", [
        union,
        ...body.filter((node) => node !== union),
      ])
    },
    expected: "a union member has no earlier set declaration",
  },
  {
    name: "implicit targets without indentation",
    built: () =>
      build("venn-beta\nset A\ntext A item\n", (kit) => [
        subset(kit),
        text(kit, ["A"], "item"),
      ]),
    mutate: field("VennTextStatement", "targets", null),
    expected: "targets is null exactly",
  },
  {
    name: "implicit targets on the subset line",
    built: () =>
      build("venn-beta set A text A item\n", (kit) => [
        subset(kit),
        text(kit, ["A"], "item"),
      ]),
    mutate: field("VennTextStatement", "targets", null),
    expected: "targets is null exactly",
  },

  {
    name: "a null diagram body item",
    built: everyKind,
    mutate: field("VennDiagram", "body", [null]),
    expected: "body[0]: is no node",
  },
  {
    name: "an unknown subset kind",
    built: everyKind,
    mutate: field("VennSubsetStatement", "kind", "intersection"),
    expected: "the field kind is",
  },
  {
    name: "an unknown label kind",
    built: everyKind,
    mutate: field("VennLabel", "kind", "markdown"),
    expected: "the field kind is",
  },
  {
    name: "an empty subset list",
    built: everyKind,
    mutate: field("VennSubsetStatement", "sets", []),
    expected: "the list sets is empty",
  },
  {
    name: "a union with one name",
    built: everyKind,
    mutate: (tree) => {
      const node = nodeWith(tree, "VennSubsetStatement", "kind", "union")
      setField(node, "sets", (node.sets as CheckedNode[]).slice(0, 1))
    },
    expected: "wrong number of names",
  },
  {
    name: "a set with two names",
    built: everyKind,
    mutate: (tree) =>
      setField(
        nodeWith(tree, "VennSubsetStatement"),
        "sets",
        (
          nodeWith(tree, "VennSubsetStatement", "kind", "union")
            .sets as CheckedNode[]
        ).slice(0, 2),
      ),
    expected: "wrong number of names",
  },
  {
    name: "an empty explicit target list",
    built: ended,
    mutate: field("VennTextStatement", "targets", []),
    expected: "the explicit target list is empty",
  },
  {
    name: "an empty style target list",
    built: everyKind,
    mutate: field("VennStyleStatement", "targets", []),
    expected: "the list targets is empty",
  },
  {
    name: "an empty property list",
    built: everyKind,
    mutate: field("VennStyleStatement", "properties", []),
    expected: "the list properties is empty",
  },
  {
    name: "a null required property value",
    built: everyKind,
    mutate: field("VennStyleProperty", "value", null),
    expected: "the field value is null, not a node",
  },
  {
    name: "a null required text id",
    built: everyKind,
    mutate: field("VennTextStatement", "id", null),
    expected: "the field id is null, not a node",
  },
  {
    name: "a null required title value",
    built: everyKind,
    mutate: field("VennTitleStatement", "value", null),
    expected: "the field value is null, not a node",
  },
  {
    name: "a missing written subset label",
    built: everyKind,
    mutate: field("VennSubsetStatement", "label", null),
    expected: "tokens that the node writes itself and its child nodes",
  },
  {
    name: "a missing written subset size",
    built: everyKind,
    mutate: field("VennSubsetStatement", "size", null),
    expected: "tokens that the node writes itself and its child nodes",
  },
  {
    name: "a missing written text label",
    built: everyKind,
    mutate: field("VennTextStatement", "label", null),
    expected: "tokens that the node writes itself and its child nodes",
  },
  {
    name: "a numeric text id with a label",
    built: everyKind,
    mutate: (tree) => {
      const node = nodesOf(tree).find(
        (candidate) =>
          candidate.type === "VennTextStatement" &&
          childOf(candidate, "id")?.type === "NumericLiteral",
      )
      if (node === undefined) throw new Error("no numeric text")
      setField(node, "label", nodeWith(tree, "VennLabel"))
    },
    expected: "a numeric text id has a label",
  },
  {
    name: "an implicit marker made explicit",
    built: implicit,
    mutate: (tree) =>
      setField(
        nodeWith(tree, "VennTextStatement"),
        "targets",
        nodeWith(tree, "VennSubsetStatement").sets,
      ),
    expected: "targets is null exactly",
  },
  {
    name: "implicit targets after mode has ended",
    built: ended,
    mutate: field("VennTextStatement", "targets", null),
    expected: "targets is null exactly",
  },
  {
    name: "implicit targets after an empty line and an empty-brace comment",
    built: commentEnded,
    mutate: field("VennTextStatement", "targets", null),
    expected: "targets is null exactly",
  },
  {
    name: "trimmed bare label padding",
    built: paddedLabel,
    mutate: field("VennLabel", "value", "Alpha"),
    expected: "the label value is not its written interior",
  },
  {
    name: "implicit targets without a subset",
    built: () =>
      build("venn-beta\ntext A item\n", (kit) => [text(kit, ["A"], "item")]),
    mutate: field("VennTextStatement", "targets", null),
    expected: "targets is null exactly",
  },
  {
    name: "a changed written label",
    built: everyKind,
    mutate: field("VennLabel", "value", "changed"),
    expected: "the label value is not its written interior",
  },
  {
    name: "a changed written literal",
    built: everyKind,
    mutate: field("VennLiteral", "value", "changed"),
    expected: "value is not its written text",
  },
  {
    name: "a changed ignored fragment",
    built: everyKind,
    mutate: field("VennIgnoredText", "value", "xx"),
    expected: "one non-whitespace code unit swallowed before %%",
  },
  {
    name: "an unclosed string",
    built: everyKind,
    mutate: field("StringLiteral", "closed", false),
    expected: "closed double-quoted Venn string",
  },
  {
    name: "a reserved identifier",
    built: everyKind,
    mutate: field("Identifier", "name", "set"),
    expected: "not a nonreserved Venn name",
  },
  {
    name: "a numeric exponent spelling",
    built: everyKind,
    mutate: field("NumericLiteral", "raw", "1e2"),
    expected: "not one decimal Venn unit",
  },
  {
    name: "the header's token kind",
    built: everyKind,
    mutate: retype("venn-beta", "RawText"),
    expected: "the kind of a token that the node writes itself",
  },
  {
    name: "a colon's token kind",
    built: everyKind,
    mutate: retype(":", "Keyword"),
    expected: "the kind of a token that the node writes itself",
  },
  {
    name: "a literal's token kind",
    built: everyKind,
    mutate: retype("#abc", "Identifier"),
    expected: "the bare style atom token kinds or boundaries",
  },
  {
    name: "a label bracket's token kind",
    built: everyKind,
    mutate: retype("[", "Keyword"),
    expected: "the label brackets are not separate Punctuator tokens",
  },
  {
    name: "a diagram comment marker",
    built: everyKind,
    mutate: (tree) => setField(tree.comments[0], "mark", "#"),
    expected: "mark",
  },
  {
    name: "a statement range beyond its hull",
    built: everyKind,
    mutate: (tree) => {
      const node = nodeWith(tree, "VennStyleProperty")
      setField(node, "range", [node.range[0] - 1, node.range[1]])
    },
    expected: "the range, which runs",
  },
  {
    name: "reversed union names",
    built: everyKind,
    mutate: (tree) => {
      const node = nodeWith(tree, "VennSubsetStatement", "kind", "union")
      setField(node, "sets", [...(node.sets as CheckedNode[])].reverse())
    },
    expected: "comes before the child node",
  },
]

describe("first-stage Venn tree invariants", () => {
  it("keeps the padding of lex-label-bare-padding", () => {
    const built = paddedLabel()
    expect(checkTree(built.source, built.tree)).toEqual([])
  })
  it("accepts every node and the empty diagram", () => {
    for (const built of [everyKind(), build("venn-beta", () => [])])
      expect(checkTree(built.source, built.tree)).toEqual([])
  })
  itFailsEach(BROKEN)
  for (const [type, fields] of Object.entries(VENN_CHILD_TYPES))
    for (const key of Object.keys(fields))
      it(`rejects a wrong child type in ${type}.${key}`, () => {
        const { source, tree } = everyKind()
        const node = nodesOf(tree).find(
          (candidate) => candidate.type === type && candidate[key] !== null,
        )
        if (node === undefined) throw new Error("no nonnull child field")
        const value = node[key]
        const child = (Array.isArray(value) ? value[0] : value) as CheckedNode
        if (child === null) throw new Error("no child")
        const wrong = {
          type: "ErrorDiagram",
          range: child.range,
          loc: child.loc,
        }
        setField(node, key, Array.isArray(value) ? [wrong] : wrong)
        expect(
          checkTree(source, tree).some(
            (problem) =>
              problem.where.startsWith(`${type} at `) &&
              problem.message.startsWith(`the field ${key} holds a`),
          ),
        ).toBe(true)
      })
  it("copies child type and kind tables from the specification", () => {
    const document = readTreeDocuments().find((documentText) =>
      documentText.startsWith("# Venn nodes"),
    )
    if (document === undefined) throw new Error("no Venn document")
    const statement = /VennStatement is ([\s\S]*?)\./u.exec(document)?.[1] ?? ""
    const alternatives = [...statement.matchAll(/\bVenn[A-Za-z]+\b/gu)].map(
      (match) => match[0],
    )
    const expected: Record<string, Record<string, string[]>> = {}
    for (const [type, fields] of readFieldTables()) {
      if (!type.startsWith("Venn")) continue
      for (const [key, cell] of fields) {
        const typeNames = [
          ...cell.matchAll(
            /\b(?:Venn[A-Za-z]+|Identifier|StringLiteral|NumericLiteral)\b/gu,
          ),
        ].map((match) => match[0])
        if (typeNames.length === 0) continue
        expected[type] ??= {}
        expected[type][key] = typeNames.flatMap((typeName) =>
          typeName === "VennStatement" ? alternatives : [typeName],
        )
      }
    }
    expect(VENN_CHILD_TYPES).toEqual(expected)
    for (const [type, fields] of Object.entries(VENN_FIELD_WORDS)) {
      for (const [fieldName, words] of Object.entries(fields)) {
        const meaning = readFieldMeanings().get(type)?.get(fieldName) ?? ""
        expect(words).toEqual(
          [...meaning.matchAll(/`([^`]+)`/gu)].map((match) => match[1]),
        )
      }
    }
  })
  it("preserves mode through blank, comment and directive lines and same-line statements", () => {
    const built = build(
      "venn-beta\nset A style A x:red\n\n%% c\n%%{init: {}}%%\n\ttext item\n",
      (kit) => {
        const body = [subset(kit), style(kit, ["A"], [["x", "red"]])]
        kit.comment("%%", "%% c")
        kit.directive("%%{init: {}}%%")
        body.push(text(kit, null, "item"))
        return body
      },
    )
    expect(checkTree(built.source, built.tree)).toEqual([])
  })
  it("reports a changed kind or delimiter rather than silently accepting it", () => {
    const { source, tree } = everyKind()
    setField(tokenWith(tree, "]"), "value", ")")
    expect(
      checkTree(source, tree).some((problem) =>
        problem.message.includes("label brackets"),
      ),
    ).toBe(true)
  })
})

/** Explicit statement prefixes shared by the fixed implicit-mode fixtures. */
function unionPrefix(kit: Kit): CheckedNode[] {
  return [
    subset(kit),
    subset(kit, "set", ["B"]),
    subset(kit, "union", ["A", "B"]),
  ]
}

/** The comment rule swallows Q before the line-start rule can end the mode. */
function ignoredPrefix(kit: Kit): CheckedNode[] {
  const first = subset(kit)
  const token = kit.token("RawText", "Q")
  return [first, kit.node("VennIgnoredText", token.range, { value: "Q" })]
}

const MODE_CASES: readonly {
  fixture: string
  valid: boolean
  prefix?: (kit: Kit) => CheckedNode[]
  comments: readonly string[]
  targets?: readonly string[]
  id?: string
}[] = [
  ...[
    "gram-indent-two-spaces-empty-braces-explicit",
    "gram-indent-two-spaces-empty-braces-after-blank-explicit",
    "gram-indent-space-tab-empty-braces-explicit",
    "gram-indent-space-tab-empty-braces-after-blank-explicit",
  ].map((fixture) => ({
    fixture,
    valid: true,
    comments: ["%%{ }%%"],
    targets: ["A"],
    id: "x",
  })),
  ...[
    "gram-indent-two-spaces-empty-braces-missing-id",
    "gram-indent-two-spaces-empty-braces-after-blank-missing-id",
    "gram-indent-space-tab-empty-braces-missing-id",
    "gram-indent-space-tab-empty-braces-after-blank-missing-id",
  ].map((fixture) => ({ fixture, valid: false, comments: ["%%{ }%%"] })),
  {
    fixture: "lex-indent-ignored-prefix-empty-braces-after-blank",
    valid: true,
    prefix: ignoredPrefix,
    comments: ["%%{ }%%"],
  },
  {
    fixture: "gram-indent-ignored-prefix-empty-braces-after-blank-extra-id",
    valid: false,
    prefix: ignoredPrefix,
    comments: ["%%{ }%%"],
    targets: ["A"],
    id: "x",
  },
  {
    fixture: "lex-empty-braces-percent-between-set-and-text",
    valid: true,
    comments: ["%%{ }%%"],
  },
  {
    fixture: "lex-indent-spaces-before-empty-braces",
    valid: true,
    comments: ["%%{ }%%"],
  },
  {
    fixture: "gram-indent-spaces-before-empty-braces-extra-id",
    valid: false,
    comments: ["%%{ }%%"],
    targets: ["A"],
    id: "x",
  },
  {
    fixture: "lex-indent-tab-line-before-empty-braces",
    valid: true,
    comments: ["%%{ }%%"],
  },
  {
    fixture: "gram-indent-tab-line-before-empty-braces-extra-id",
    valid: false,
    comments: ["%%{ }%%"],
    targets: ["A"],
    id: "x",
  },
  {
    fixture: "lex-indent-empty-braces-without-empty-line-crlf",
    valid: true,
    comments: ["%%{ }%%"],
  },
  {
    fixture: "lex-indent-tab-prefixed-empty-braces-after-blank",
    valid: true,
    comments: ["%%{ }%%"],
  },
  {
    fixture: "lex-indent-union-empty-braces",
    valid: true,
    prefix: unionPrefix,
    comments: ["%%{ }%%"],
  },
  {
    fixture: "lex-indent-set-empty-braces-blank",
    valid: true,
    comments: ["%%{ }%%"],
  },
  {
    fixture: "lex-indent-union-empty-braces-blank",
    valid: true,
    prefix: unionPrefix,
    comments: ["%%{ }%%"],
  },
  {
    fixture: "lex-indent-set-two-empty-braces",
    valid: true,
    comments: ["%%{ }%%", "%%{ }%%"],
  },
  {
    fixture: "lex-indent-union-two-empty-braces",
    valid: true,
    prefix: unionPrefix,
    comments: ["%%{ }%%", "%%{ }%%"],
  },
  {
    fixture: "lex-indent-set-blank-empty-braces-ls-without-empty-lines",
    valid: true,
    comments: ["%%{ }%%\u2028"],
  },
  {
    fixture: "lex-indent-set-blank-empty-braces-ps-without-empty-lines",
    valid: true,
    comments: ["%%{ }%%\u2029"],
  },
  {
    fixture: "lex-indent-bare-percent-after-blank",
    valid: true,
    comments: ["%%"],
  },
  {
    fixture: "lex-indent-indented-empty-braces-after-blank",
    valid: true,
    comments: ["%%{ }%%"],
  },
  {
    fixture: "lex-indent-union-blank-bare-comment",
    valid: true,
    prefix: unionPrefix,
    comments: ["%%"],
  },
  {
    fixture: "gram-indent-after-empty-braces-explicit-id",
    valid: true,
    comments: ["%%{ }%%"],
    targets: ["A"],
    id: "x",
  },
  {
    fixture: "gram-indent-after-empty-braces-explicit-string",
    valid: true,
    comments: ["%%{ }%%"],
    targets: ['"A"'],
    id: '"x"',
  },
  {
    fixture: "gram-indent-after-empty-braces-explicit-target-list",
    valid: true,
    comments: ["%%{ }%%"],
    targets: ["A", "B"],
    id: "x",
  },
  {
    fixture: "gram-indent-empty-braces-after-blank",
    valid: false,
    comments: ["%%{ }%%"],
  },
  {
    fixture: "gram-indent-set-blank-empty-braces-crlf",
    valid: false,
    comments: ["%%{ }%%"],
  },
  {
    fixture: "gram-indent-set-blank-empty-braces-ls",
    valid: false,
    comments: ["%%{ }%%\u2028"],
  },
  {
    fixture: "gram-indent-set-blank-empty-braces-ps",
    valid: false,
    comments: ["%%{ }%%\u2029"],
  },
  {
    fixture: "gram-indent-set-blank-two-empty-braces",
    valid: false,
    comments: ["%%{ }%%", "%%{ }%%"],
  },
  {
    fixture: "gram-indent-set-empty-braces-blank-empty-braces",
    valid: false,
    comments: ["%%{ }%%", "%%{ }%%"],
  },
  {
    fixture: "gram-indent-union-blank-empty-braces",
    valid: false,
    prefix: unionPrefix,
    comments: ["%%{ }%%"],
  },
  {
    fixture: "gram-indent-union-empty-braces-blank-empty-braces",
    valid: false,
    prefix: unionPrefix,
    comments: ["%%{ }%%", "%%{ }%%"],
  },
  {
    fixture: "gram-indent-set-same-line-explicit-text-blank-comment",
    valid: false,
    prefix: (kit) => [subset(kit), text(kit, ["A"], "explicit")],
    comments: ["%%{ }%%"],
  },
  {
    fixture: "gram-indent-set-same-line-style-blank-comment",
    valid: false,
    prefix: (kit) => [subset(kit), style(kit, ["A"], [["fill", "red"]])],
    comments: ["%%{ }%%"],
  },
  {
    fixture: "gram-indent-union-same-line-explicit-text-blank-comment",
    valid: false,
    prefix: (kit) => [...unionPrefix(kit), text(kit, ["A", "B"], "explicit")],
    comments: ["%%{ }%%"],
  },
  {
    fixture: "gram-indent-union-same-line-style-blank-comment",
    valid: false,
    prefix: (kit) => [
      ...unionPrefix(kit),
      style(kit, ["A", "B"], [["fill", "red"]]),
    ],
    comments: ["%%{ }%%"],
  },
  {
    fixture: "gram-indent-set-mixed-lines",
    valid: false,
    prefix: (kit) => {
      const first = subset(kit)
      kit.comment("%%", "%% c")
      kit.directive("%%{init: {}}%%")
      return [first]
    },
    comments: ["%%", "%%{ }%%"],
  },
]

describe("Venn comment lines and implicit-text mode", async () => {
  const fixtures = await loadFixtures("venn")
  for (const testCase of MODE_CASES)
    it(`checks the mode of ${testCase.fixture}`, () => {
      const fixture = fixtures.find(
        (candidate) => candidate.name === testCase.fixture,
      )
      if (fixture === undefined) throw new Error("no mode fixture")
      expect(fixture.expected.accepted).toBe(testCase.valid)
      const built = build(fixture.input, (kit) => {
        const prefix = testCase.prefix?.(kit) ?? [subset(kit)]
        for (const comment of testCase.comments) kit.comment("%%", comment)
        return [
          ...prefix,
          text(kit, testCase.targets ?? null, testCase.id ?? "item"),
        ]
      })
      const problems = checkTree(built.source, built.tree)
      if (testCase.valid) expect(problems).toEqual([])
      else
        expect(
          problems.some((problem) =>
            problem.message.includes("targets is null exactly"),
          ),
        ).toBe(true)
    })
})

/** Rejected corpus inputs make the lexical invariants independently observable. */
const REJECTED: readonly {
  fixture: string
  body: (kit: Kit) => CheckedNode[]
  expected: string
}[] = [
  ...[
    "gram-comment-prefix-line-separator-directive",
    "gram-comment-prefix-line-separator-u2029-directive",
  ].map((fixture) => ({
    fixture,
    body: (kit: Kit) => {
      kit.directive("%%{init: {}}%%")
      return [subset(kit)]
    },
    expected: "the statement gap is not Venn whitespace",
  })),
  ...[
    "gram-comment-prefix-line-separator-between-statements-extra-id",
    "gram-comment-prefix-line-separator-between-statements-u2029-extra-id",
  ].map((fixture) => ({
    fixture,
    body: (kit: Kit) => {
      const first = subset(kit)
      kit.comment("%%", "%%{ }%%")
      return [first, text(kit, ["A"], "x")]
    },
    expected: "targets is null exactly",
  })),
  ...(
    [
      ["gram-style-value-reserved-dash-prefix", "set-x"],
      ["gram-style-value-union-dash-prefix", "union-x"],
      ["gram-style-value-header-dash-prefix", "venn-beta-x"],
      ["gram-style-value-title-line-priority", "title foo"],
      ["gram-style-value-number-reserved-dash-prefix", "1set-x"],
    ] as const
  ).map(([fixture, value]) => ({
    fixture,
    body: (kit: Kit) => [style(kit, ["A"], [["x", value]])],
    expected: "the bare style value is not a nonempty sequence of Venn atoms",
  })),
  {
    fixture: "gram-name-list-comma-comment-gap",
    body: (kit) => {
      const first = kit.token("Keyword", "text")
      const a = name(kit, "A")
      kit.token("Punctuator", ",")
      kit.comment("%%", "%% c")
      const b = name(kit, "B")
      const id = name(kit, "item")
      return [
        kit.node("VennTextStatement", [first.range[0], id.range[1]], {
          targets: [a, b],
          id,
          label: null,
        }),
      ]
    },
    expected: "the argument gap is not ASCII space or tab",
  },
  ...[
    "gram-name-list-comma-blank-gap",
    "gram-name-list-comma-crlf-gap",
    "gram-name-list-comma-line-separator",
  ].map((fixture) => ({
    fixture,
    body: (kit: Kit) => [text(kit, ["A", "B"], "item")],
    expected: "the argument gap is not ASCII space or tab",
  })),
  ...(
    [
      ["gram-style-rgb-channel-internal-space", "rgb(1 2,3,4)"],
      ["gram-style-rgb-too-few-channels", "rgb(1,2)"],
      ["gram-style-rgb-too-many-channels", "rgb(1,2,3,4)"],
      ["gram-style-rgba-too-few-channels", "rgba(1,2,3)"],
      ["gram-style-rgba-too-many-channels", "rgba(1,2,3,4,5)"],
    ] as const
  ).map(([fixture, value]) => ({
    fixture,
    body: (kit: Kit) => [style(kit, ["A"], [["x", value]])],
    expected: "the bare style value is not a nonempty sequence of Venn atoms",
  })),
  {
    fixture: "gram-after-text-id-colon-space",
    body: (kit) => {
      const node = text(kit, ["A"], "item")
      kit.token("Punctuator", ":")
      return [node]
    },
    expected: "the body has trailing text outside its statements",
  },
  {
    fixture: "gram-label-bare-directive-only",
    body: (kit) => [
      subset(kit, "set", ["A"], (labelKit) =>
        bracket(labelKit, "[%%{init: {}}%%]", {
          value: "",
          write: (contentKit) => contentKit.directive("%%{init: {}}%%"),
        }),
      ),
    ],
    expected: "the label is empty or holds a character",
  },
  {
    fixture: "gram-label-bare-ignored-semicolon-only",
    body: (kit) => [
      subset(kit, "set", ["X"], "[style:#abc]"),
      subset(kit, "set", ["A"], (labelKit) =>
        bracket(labelKit, "[;]", {
          value: "",
          write: (contentKit) => {
            contentKit.token("IgnoredSemicolon", ";")
          },
        }),
      ),
    ],
    expected: "the label is empty or holds a character",
  },
  {
    fixture: "lex-inline-comment-eats-id",
    body: (kit) => {
      const first = subset(kit)
      kit.comment("%%", "%% c")
      return [first, subset(kit, "set", ["B"])]
    },
    expected:
      "the Venn unit ends early or is swallowed by the comment-prefix rule",
  },
  {
    fixture: "lex-after-set-size-comment-glued",
    body: (kit) => {
      const node = subset(kit, "set", ["A"], null, "2")
      kit.comment("%%", "%% c")
      return [node]
    },
    expected:
      "the Venn unit ends early or is swallowed by the comment-prefix rule",
  },

  {
    fixture: "gram-label-bare-empty",
    body: (kit) => [subset(kit, "set", ["A"], "[]")],
    expected: "the label is empty or holds a character",
  },
  {
    fixture: "lex-gap-set-lf",
    body: (kit) => [subset(kit), subset(kit)],
    expected: "the argument gap is not ASCII space or tab",
  },
  {
    fixture: "gram-size-exponent",
    body: (kit) => [subset(kit, "set", ["A"], null, "1e2")],
    expected: "the number is not one decimal Venn unit",
  },
  {
    fixture: "gram-style-rgb-negative-component",
    body: (kit) => [style(kit, ["A"], [["fill", "rgb(-1,2,3)"]])],
    expected: "the bare style value is not a nonempty sequence of Venn atoms",
  },
  {
    fixture: "gram-union-unknown",
    body: (kit) => [subset(kit), subset(kit, "union", ["A", "B"])],
    expected: "a union member has no earlier set declaration",
  },
]

describe("broken Venn trees over rejected corpus inputs", async () => {
  const fixtures = await loadFixtures("venn")
  for (const testCase of REJECTED)
    it(`reports ${testCase.fixture}`, () => {
      const fixture = fixtures.find(
        (candidate) => candidate.name === testCase.fixture,
      )
      if (fixture === undefined || fixture.expected.accepted)
        throw new Error("no rejected fixture")
      const built = build(fixture.input, testCase.body)
      expect(
        checkTree(built.source, built.tree).some((problem) =>
          problem.message.includes(testCase.expected),
        ),
      ).toBe(true)
    })
})

/** The source pieces of the fixed R4 diagram comments, supplied independently of the parser. */
const CUT_COMMENT_CASES: readonly {
  fixture: string
  comments: readonly (readonly [string | null, string])[]
  following?: boolean
  withoutLabel?: boolean
}[] = [
  {
    fixture: "lex-diagram-comment-cut-ls-tree-gap",
    comments: [
      ["%%", "%% c;"],
      ["%%", "%% d"],
      [null, "set B"],
    ],
  },
  {
    fixture: "lex-diagram-comment-cut-ps-tree-gap",
    comments: [
      ["%%", "%% c;"],
      ["%%", "%% d"],
      [null, "set B"],
    ],
  },
  {
    fixture: "lex-diagram-comment-cut-ls-spaces-tree-gap",
    comments: [
      ["%%", "%% c;"],
      ["%%", "%% d  "],
      [null, "set B"],
    ],
  },
  {
    fixture: "lex-diagram-comment-cut-ps-spaces-tree-gap",
    comments: [
      ["%%", "%% c;"],
      ["%%", "%% d  "],
      [null, "set B"],
    ],
  },
  {
    fixture: "lex-diagram-comment-cut-ls-tab-tree-gap",
    comments: [
      ["%%", "%% c;"],
      ["%%", "%% d\t"],
      [null, "set B"],
    ],
  },
  {
    fixture: "lex-diagram-comment-cut-ps-tab-tree-gap",
    comments: [
      ["%%", "%% c;"],
      ["%%", "%% d\t"],
      [null, "set B"],
    ],
  },
  {
    fixture: "lex-diagram-comment-cut-ls-eof-tree-gap",
    comments: [
      ["%%", "%% c;"],
      ["%%", "%% d"],
    ],
  },
  {
    fixture: "lex-diagram-comment-cut-ps-eof-tree-gap",
    comments: [
      ["%%", "%% c;"],
      ["%%", "%% d"],
    ],
  },
  {
    fixture: "lex-diagram-comment-cut-ls-following-real-statement",
    comments: [
      ["%%", "%% c;"],
      ["%%", "%% d"],
      [null, "set B"],
    ],
    following: true,
  },
  {
    fixture: "lex-diagram-comment-cut-ps-following-real-statement",
    comments: [
      ["%%", "%% c;"],
      ["%%", "%% d"],
      [null, "set B"],
    ],
    following: true,
  },
  {
    fixture: "lex-diagram-comment-cut-ls-joined-unit",
    comments: [
      ["%%", "%% c"],
      ["%%", "%% d"],
      [null, "set B"],
    ],
    following: true,
    withoutLabel: true,
  },
]

const WRITTEN_CASES: readonly {
  fixture: string
  body: (kit: Kit) => CheckedNode[]
}[] = [
  ...(
    [
      ["gram-comment-prefix-line-separator-bare-percent", "%%"],
      ["gram-comment-prefix-line-separator-u2029-bare-percent", "%%"],
      ["gram-comment-prefix-line-separator-brace-comment", "%%{ }%%"],
      ["gram-comment-prefix-line-separator-u2029-brace-comment", "%%{ }%%"],
    ] as const
  ).map(([fixture, comment]) => ({
    fixture,
    body: (kit: Kit) => {
      kit.comment("%%", comment)
      return [subset(kit)]
    },
  })),
  ...(
    [
      [
        "gram-comment-prefix-line-separator-between-statements-bare-percent",
        "%%",
      ],
      [
        "gram-comment-prefix-line-separator-between-statements-u2029-bare-percent",
        "%%",
      ],
      [
        "gram-comment-prefix-line-separator-between-statements-brace-comment",
        "%%{ }%%",
      ],
      [
        "gram-comment-prefix-line-separator-between-statements-u2029-brace-comment",
        "%%{ }%%",
      ],
    ] as const
  ).map(([fixture, comment]) => ({
    fixture,
    body: (kit: Kit) => {
      const first = subset(kit)
      kit.comment("%%", comment)
      return [first]
    },
  })),
  ...[
    "gram-comment-prefix-line-separator-between-statements-implicit-text",
    "gram-comment-prefix-line-separator-between-statements-u2029-implicit-text",
  ].map((fixture) => ({
    fixture,
    body: (kit: Kit) => {
      const first = subset(kit)
      kit.comment("%%", "%%{ }%%")
      return [first, text(kit, null, "x")]
    },
  })),
  ...CUT_COMMENT_CASES.map((testCase) => ({
    fixture: testCase.fixture,
    body: (kit: Kit) => {
      const first = subset(
        kit,
        "set",
        ["A"],
        testCase.withoutLabel ? null : "[style:#x;y]",
      )
      for (const [mark, raw] of testCase.comments) kit.comment(mark, raw)
      return testCase.following ? [first, subset(kit, "set", ["C"])] : [first]
    },
  })),
  ...[
    "lex-swallowed-nbsp-gap",
    "lex-swallowed-vt-gap",
    "lex-swallowed-ff-gap",
    "lex-swallowed-bom-gap",
    "lex-swallowed-ideographic-gap",
  ].map((fixture) => ({
    fixture,
    body: (kit: Kit) => {
      const first = [subset(kit), text(kit, null, "item")]
      kit.comment("%%", "%% c")
      return [...first, text(kit, null, "other")]
    },
  })),
  {
    fixture: "lex-swallowed-nel-gap",
    body: (kit) => {
      const first = [subset(kit), text(kit, null, "item")]
      const token = kit.token("RawText", "\u0085")
      const ignored = kit.node("VennIgnoredText", token.range, {
        value: "\u0085",
      })
      kit.comment("%%", "%% c")
      return [...first, ignored, text(kit, null, "other")]
    },
  },
  {
    fixture: "lex-swallowed-nbsp-header",
    body: (kit) => {
      kit.comment("%%", "%% c")
      return [subset(kit)]
    },
  },
  {
    fixture: "lex-swallowed-nbsp-eof",
    body: (kit) => {
      const first = subset(kit)
      kit.comment("%%", "%% c")
      return [first]
    },
  },
  {
    fixture: "lex-swallowed-nbsp-between-subsets",
    body: (kit) => {
      const first = subset(kit)
      kit.comment("%%", "%% c")
      return [first, subset(kit, "set", ["B"])]
    },
  },
  {
    fixture: "db-html-tag-from-title-name",
    body: (kit) => [title(kit, "<a"), subset(kit, "set", ['"b="c">d"'])],
  },
  {
    fixture: "db-html-tag-from-title-label",
    body: (kit) => [title(kit, "<a"), subset(kit, "set", ["A"], '["b="c">d"]')],
  },
  {
    fixture: "db-html-tag-from-title-style",
    body: (kit) => [title(kit, "<a"), style(kit, ["A"], [["x", '"b="c">d"']])],
  },
  {
    fixture: "db-html-tag-from-comment-name",
    body: (kit) => {
      kit.comment("%%", "%% <a")
      return [subset(kit, "set", ['"b="c">d"'])]
    },
  },
  {
    fixture: "db-html-tag-across-names",
    body: (kit) => [
      subset(kit, "set", ['"<a"']),
      subset(kit, "set", ['"b="c">d"']),
    ],
  },
  {
    fixture: "lex-comment-swallowed-nbsp",
    body: (kit) => {
      kit.comment("%%", "%% c")
      return []
    },
  },
  {
    fixture: "lex-comment-swallowed-nbsp-between-statements",
    body: (kit) => {
      const first = subset(kit)
      kit.comment("%%", "%% c")
      return [first, subset(kit, "set", ["B"])]
    },
  },
  {
    fixture: "lex-label-bare-whitespace-line",
    body: (kit) => [subset(kit, "set", ["A"], "[\n]")],
  },
  {
    fixture: "lex-label-quoted-directive-only",
    body: (kit) => [
      subset(kit, "set", ["A"], (labelKit) =>
        bracket(labelKit, '["%%{init: {}}%%"]', {
          value: "",
          write: (contentKit) => {
            contentKit.token("StringFragment", '"')
            contentKit.directive("%%{init: {}}%%")
            contentKit.token("StringFragment", '"')
          },
        }),
      ),
    ],
  },
  {
    fixture: "lex-label-quoted-ignored-semicolon-only",
    body: (kit) => [
      subset(kit, "set", ["X"], "[style:#abc]"),
      subset(kit, "set", ["A"], (labelKit) =>
        bracket(labelKit, '[";"]', {
          value: "",
          write: (contentKit) => {
            contentKit.token("StringFragment", '"')
            contentKit.token("IgnoredSemicolon", ";")
            contentKit.token("StringFragment", '"')
          },
        }),
      ),
    ],
  },
  {
    fixture: "lex-label-bare-comment-only",
    body: (kit) => [
      subset(kit, "set", ["A"], (labelKit) =>
        bracket(labelKit, "[\n%% c\n]", {
          value: "\n",
          write: (contentKit) => {
            contentKit.token("RawText", "\n")
            contentKit.comment("%%", "%% c")
          },
        }),
      ),
    ],
  },
  {
    fixture: "lex-label-quoted-comment-only",
    body: (kit) => [
      subset(kit, "set", ["A"], (labelKit) =>
        bracket(labelKit, '["\n%% c\n"]', {
          value: "\n",
          write: (contentKit) => {
            contentKit.token("StringFragment", '"\n')
            contentKit.comment("%%", "%% c")
            contentKit.token("StringFragment", '"')
          },
        }),
      ),
    ],
  },
  {
    fixture: "lex-name-list-comma-directive",
    body: (kit) => {
      const first = kit.token("Keyword", "text")
      const a = name(kit, "A")
      kit.directive("%%{x}%%")
      kit.token("Punctuator", ",")
      kit.directive("%%{x}%%")
      const b = name(kit, "B")
      const id = name(kit, "item")
      return [
        kit.node("VennTextStatement", [first.range[0], id.range[1]], {
          targets: [a, b],
          id,
          label: null,
        }),
      ]
    },
  },
  {
    fixture: "div-c4-bare-style-value",
    body: (kit) => [style(kit, ["A"], [["x", "C4Container"]])],
  },
]

describe("Venn written values and unit boundaries", async () => {
  const fixtures = await loadFixtures("venn")
  const characters = fixtures
    .filter(
      (fixture) =>
        fixture.name.startsWith("lex-comment-swallowed-") &&
        !WRITTEN_CASES.some((testCase) => testCase.fixture === fixture.name),
    )
    .map((fixture) => ({
      fixture: fixture.name,
      body: (kit: Kit): CheckedNode[] => {
        kit.comment("%%", "%% c")
        return []
      },
    }))
  for (const testCase of [...WRITTEN_CASES, ...characters])
    it(`keeps the written values of ${testCase.fixture}`, () => {
      const fixture = fixtures.find(
        (candidate) => candidate.name === testCase.fixture,
      )
      if (fixture === undefined) throw new Error("no written-value fixture")
      expect((fixture.specified ?? fixture.expected).accepted).toBe(true)
      const built = build(fixture.input, testCase.body)
      expect(checkTree(built.source, built.tree)).toEqual([])
    })
})

/** The two fragment forms use the common builder, with no generated inputs. */
function cutLabel(): Built {
  return build('venn-beta\nset A["x%%{init: {}}%%y"]\n', (kit) => {
    const first = kit.token("Keyword", "set")
    const id = name(kit, "A")
    const open = kit.token("Punctuator", "[")
    kit.token("StringFragment", '"x')
    kit.directive("%%{init: {}}%%")
    kit.token("StringFragment", 'y"')
    const close = kit.token("Punctuator", "]")
    const label = kit.node("VennLabel", [open.range[0], close.range[1]], {
      kind: "string",
      value: "xy",
    })
    return [
      kit.node("VennSubsetStatement", [first.range[0], close.range[1]], {
        kind: "set",
        sets: [id],
        label,
        size: null,
      }),
    ]
  })
}

type ColorCut =
  "directive" | "none" | "hex-semicolon" | "rgb-semicolon" | "number-semicolon"

const COLOR_CUT_CASES: Readonly<
  Record<
    ColorCut,
    {
      source: string
      tokens: readonly (readonly [string, string])[]
      value: string
    }
  >
> = {
  directive: {
    source: "venn-beta\nstyle A x:rgb(1,%%{init: {}}%%2,3)\n",
    tokens: [
      ["RawText", "rgb(1,"],
      ["Directive", "%%{init: {}}%%"],
      ["RawText", "2,3)"],
    ],
    value: "rgb(1,2,3)",
  },
  none: {
    source: "venn-beta\nstyle A x:rgb(1,2,3)\n",
    tokens: [
      ["RawText", "rgb(1,"],
      ["RawText", "2,3)"],
    ],
    value: "rgb(1,2,3)",
  },
  "hex-semicolon": {
    source: "venn-beta\nstyle A x:#ab;c\n",
    tokens: [
      ["RawText", "#ab"],
      ["IgnoredSemicolon", ";"],
      ["RawText", "c"],
    ],
    value: "#abc",
  },
  "rgb-semicolon": {
    source: "venn-beta\nstyle A x:#abc rgb(1;2,3,4)\n",
    tokens: [
      ["RawText", "#abc"],
      ["RawText", "rgb(1"],
      ["IgnoredSemicolon", ";"],
      ["RawText", "2,3,4)"],
    ],
    value: "#abc rgb(12,3,4)",
  },
  "number-semicolon": {
    source: "venn-beta\nstyle A x:#abc 1;2\n",
    tokens: [
      ["RawText", "#abc"],
      ["Numeric", "1"],
      ["IgnoredSemicolon", ";"],
      ["Numeric", "2"],
    ],
    value: "#abc 12",
  },
}

/** Fixed whole-color and numeric units on both sides of a common trivia cut. */
function cutColor(cut: ColorCut = "directive"): Built {
  const testCase = COLOR_CUT_CASES[cut]
  return build(testCase.source, (kit) => {
    const first = kit.token("Keyword", "style")
    const target = name(kit, "A")
    const key = name(kit, "x")
    kit.token("Punctuator", ":")
    let range: readonly [number, number] | undefined
    for (const [kind, raw] of testCase.tokens) {
      if (kind === "Directive") {
        kit.directive(raw)
        continue
      }
      const token = kit.token(kind, raw)
      if (kind !== "IgnoredSemicolon")
        range = [range?.[0] ?? token.range[0], token.range[1]]
    }
    if (range === undefined) throw new Error("no style value tokens")
    const value = kit.node("VennLiteral", range, { value: testCase.value })
    const property = kit.node("VennStyleProperty", [key.range[0], range[1]], {
      key,
      value,
    })
    return [
      kit.node("VennStyleStatement", [first.range[0], range[1]], {
        targets: [target],
        properties: [property],
      }),
    ]
  })
}

describe("Venn text and color token units", () => {
  it("reports an uncut color split into two RawText tokens", () => {
    const built = cutColor("none")
    expect(
      checkTree(built.source, built.tree).some((problem) =>
        problem.message.includes(
          "the bare style atom token kinds or boundaries",
        ),
      ),
    ).toBe(true)
  })
  it("keeps atom gaps and split whole colors and labels", () => {
    const spaced = build("venn-beta\nstyle A custom:one  2 #abc\n", (kit) => [
      style(kit, ["A"], [["custom", "one  2 #abc"]]),
    ])
    for (const built of [
      spaced,
      cutLabel(),
      cutColor(),
      cutColor("hex-semicolon"),
      cutColor("rgb-semicolon"),
    ])
      expect(checkTree(built.source, built.tree)).toEqual([])
  })
  it("rejects a selected semicolon inside a numeric style atom", () => {
    const built = cutColor("number-semicolon")
    expect(
      checkTree(built.source, built.tree).some((problem) =>
        problem.message.includes("a Numeric token is cut"),
      ),
    ).toBe(true)
  })
  itFailsEach([
    {
      name: "a cut label fragment as a whole string",
      built: cutLabel,
      mutate: retype('"x', "String"),
      expected: "the label content token kinds",
    },
    {
      name: "a cut whole-color fragment as a numeric token",
      built: cutColor,
      mutate: retype("2,3)", "Numeric"),
      expected: "the bare style atom token kinds or boundaries",
    },
  ])
})

/** A directive between bracket and quote cuts neither string token. */
function labelDelimiterGap(): Built {
  return build('venn-beta\nset A[%%{init: {}}%%"x"]\n', (kit) => {
    const first = kit.token("Keyword", "set")
    const id = name(kit, "A")
    const open = kit.token("Punctuator", "[")
    kit.directive("%%{init: {}}%%")
    kit.token("String", '"x"')
    const close = kit.token("Punctuator", "]")
    const label = kit.node("VennLabel", [open.range[0], close.range[1]], {
      kind: "string",
      value: "x",
    })
    return [
      kit.node("VennSubsetStatement", [first.range[0], close.range[1]], {
        kind: "set",
        sets: [id],
        label,
        size: null,
      }),
    ]
  })
}

describe("Venn label delimiter boundaries", () => {
  itFailsEach([
    {
      name: "a whole label string after an opening directive as a fragment",
      built: labelDelimiterGap,
      mutate: retype('"x"', "StringFragment"),
      expected: "the label content token kinds",
    },
  ])
})

/** Required fields and scalar types are checked even before recorded Venn trees exist. */
const REQUIRED_FIELDS: readonly (readonly [string, string])[] = [
  ["VennDiagram", "body"],
  ["VennSubsetStatement", "sets"],
  ["VennStyleStatement", "targets"],
  ["VennStyleStatement", "properties"],
  ["VennStyleProperty", "key"],
]
const STRING_FIELDS: readonly (readonly [string, string])[] = [
  ["VennSubsetStatement", "kind"],
  ["VennLabel", "kind"],
  ["VennLabel", "value"],
  ["VennLiteral", "value"],
  ["VennIgnoredText", "value"],
]

describe("Venn required fields and value types", () => {
  for (const [type, key] of REQUIRED_FIELDS)
    it(`rejects null in ${type}.${key}`, () => {
      const { source, tree } = everyKind()
      setField(nodeWith(tree, type), key, null)
      expect(
        checkTree(source, tree).some(
          (problem) =>
            problem.where.startsWith(`${type} at `) &&
            problem.message.startsWith(`the field ${key} is null, not `),
        ),
      ).toBe(true)
    })
  for (const [type, key] of STRING_FIELDS)
    it(`rejects a number in ${type}.${key}`, () => {
      const { source, tree } = everyKind()
      setField(nodeWith(tree, type), key, 42)
      expect(
        checkTree(source, tree).some(
          (problem) =>
            problem.where.startsWith(`${type} at `) &&
            problem.message.startsWith(`the field ${key} is number, not `),
        ),
      ).toBe(true)
    })
  it("reports a split keyword, a shortened identifier, a padded style atom and a title hash", () => {
    const cases = [
      {
        built: build("venn-beta\nsetAB\n", (kit) => [
          subset(kit, "set", ["AB"]),
        ]),
        expected: "the keyword is followed by a word character",
      },
      {
        built: build("venn-beta\nset AB\n", (kit) => [subset(kit)]),
        expected:
          "the Venn unit ends early or is swallowed by the comment-prefix rule",
      },
      {
        built: build("venn-beta\nstyle A x:red \n", (kit) => [
          style(kit, ["A"], [["x", "red "]]),
        ]),
        expected:
          "the bare style value is not a nonempty sequence of Venn atoms",
      },
      {
        built: build("venn-beta\ntitle a#b\n", (kit) => [title(kit, "a#b")]),
        expected: "the title holds a character that ends its unit",
      },
    ]
    for (const testCase of cases)
      expect(
        checkTree(testCase.built.source, testCase.built.tree).some((problem) =>
          problem.message.includes(testCase.expected),
        ),
      ).toBe(true)
  })
})

const RECORDED_CASES: readonly MutationCase[] = [
  {
    name: "the header as a RawText token",
    fixture: "header-only",
    mutate: retypeIn("VennDiagram", "Keyword", "venn-beta", "RawText"),
    expected: "the kind of a token that the node writes itself",
  },
  {
    name: "a label bracket as a Keyword token",
    fixture: "lex-label-bare-padding",
    mutate: retypeIn("VennLabel", "Punctuator", "[", "Keyword"),
    expected: "the label brackets are not separate Punctuator tokens",
  },
  {
    name: "a directive-cut label fragment as a whole String token",
    fixture: "lex-label-directive-middle",
    mutate: retypeIn("VennLabel", "StringFragment", null, "String"),
    expected: "the label content token kinds",
  },
  {
    name: "a whole color as a Numeric token",
    fixture: "db-form-style-rgb",
    mutate: retypeIn("VennLiteral", "RawText", null, "Numeric"),
    expected: "the bare style atom token kinds or boundaries",
  },
  {
    name: "trimmed bare label padding",
    fixture: "lex-label-bare-padding",
    mutate: (root) => setField(firstNode(root, "VennLabel"), "value", "Alpha"),
    expected: "the label value is not its written interior",
  },
  {
    name: "a subset range ending before its size",
    fixture: "db-form-set-label-size",
    mutate: setEnd(
      "VennSubsetStatement",
      (root) => firstNode(root, "VennSubsetStatement").range[1] - 1,
    ),
    expected:
      "the range, which runs from the first of its tokens and child nodes to the last",
  },
  ...[
    "gram-indent-after-empty-braces-explicit-id",
    "gram-indent-after-empty-braces-explicit-string",
    "gram-indent-after-empty-braces-explicit-target-list",
  ].map((fixture): MutationCase => ({
    name: "implicit targets after an empty line and an unindented empty-brace comment",
    fixture,
    mutate: (root) =>
      setField(firstNode(root, "VennTextStatement"), "targets", null),
    expected: "targets is null exactly",
  })),
]

describe("checkTree of the recorded Venn trees", () => {
  for (const mutation of RECORDED_CASES)
    it(`passes ${mutation.fixture} and reports ${mutation.name}`, () => {
      const { base, mutated } = problemsOfMutation("venn", mutation)
      expect(base).toEqual([])
      expect(
        says(mutated, mutation.expected),
        JSON.stringify(mutated, null, 1),
      ).toBe(true)
    })
})

/** Fixed inputs of the review's Notation-whitespace boundary table. */
const SWALLOWED_WHITESPACE: readonly {
  name: string
  source: string
  valid: boolean
  comment: boolean
}[] = [
  { name: "TAB", source: "venn-beta\t%% c\n", valid: true, comment: true },
  { name: "LF", source: "venn-beta\n%% c\n", valid: true, comment: true },
  { name: "VT", source: "venn-beta\u000b%% c\n", valid: true, comment: true },
  { name: "FF", source: "venn-beta\f%% c\n", valid: true, comment: true },
  { name: "CR", source: "venn-beta\r%% c\n", valid: true, comment: true },
  { name: "SPACE", source: "venn-beta %% c\n", valid: true, comment: true },
  { name: "NBSP", source: "venn-beta\u00a0%% c\n", valid: true, comment: true },
  {
    name: "OGHAM SPACE",
    source: "venn-beta\u1680%% c\n",
    valid: true,
    comment: true,
  },
  {
    name: "EN QUAD",
    source: "venn-beta\u2000%% c\n",
    valid: true,
    comment: true,
  },
  {
    name: "EM QUAD",
    source: "venn-beta\u2001%% c\n",
    valid: true,
    comment: true,
  },
  {
    name: "EN SPACE",
    source: "venn-beta\u2002%% c\n",
    valid: true,
    comment: true,
  },
  {
    name: "EM SPACE",
    source: "venn-beta\u2003%% c\n",
    valid: true,
    comment: true,
  },
  {
    name: "THREE-PER-EM SPACE",
    source: "venn-beta\u2004%% c\n",
    valid: true,
    comment: true,
  },
  {
    name: "FOUR-PER-EM SPACE",
    source: "venn-beta\u2005%% c\n",
    valid: true,
    comment: true,
  },
  {
    name: "SIX-PER-EM SPACE",
    source: "venn-beta\u2006%% c\n",
    valid: true,
    comment: true,
  },
  {
    name: "FIGURE SPACE",
    source: "venn-beta\u2007%% c\n",
    valid: true,
    comment: true,
  },
  {
    name: "PUNCTUATION SPACE",
    source: "venn-beta\u2008%% c\n",
    valid: true,
    comment: true,
  },
  {
    name: "THIN SPACE",
    source: "venn-beta\u2009%% c\n",
    valid: true,
    comment: true,
  },
  {
    name: "HAIR SPACE",
    source: "venn-beta\u200a%% c\n",
    valid: true,
    comment: true,
  },
  { name: "LS", source: "venn-beta\u2028%% c\n", valid: false, comment: true },
  { name: "PS", source: "venn-beta\u2029%% c\n", valid: false, comment: true },
  {
    name: "NNBSP",
    source: "venn-beta\u202f%% c\n",
    valid: true,
    comment: true,
  },
  {
    name: "MEDIUM MATH SPACE",
    source: "venn-beta\u205f%% c\n",
    valid: true,
    comment: true,
  },
  {
    name: "IDEOGRAPHIC SPACE",
    source: "venn-beta\u3000%% c\n",
    valid: true,
    comment: true,
  },
  { name: "BOM", source: "venn-beta\ufeff%% c\n", valid: true, comment: true },
  {
    name: "NBSP without comment rejected control",
    source: "venn-beta\u00a0x\n",
    valid: false,
    comment: false,
  },
]

describe("Venn whitespace swallowed before a diagram comment", () => {
  for (const testCase of SWALLOWED_WHITESPACE)
    it(`checks ${testCase.name}`, () => {
      const built = build(testCase.source, (kit) => {
        if (testCase.comment) kit.comment("%%", "%% c")
        return []
      })
      const problems = checkTree(built.source, built.tree)
      if (testCase.valid) expect(problems).toEqual([])
      else
        expect(
          problems.some((problem) =>
            problem.message.includes(
              "the body has trailing text outside its statements",
            ),
          ),
        ).toBe(true)
    })
})

/** Separators outside comments and I17's ordinary gaps remain invalid. */
const OUTSIDE_COMMENT_CASES: readonly {
  name: string
  source: string
  body: (kit: Kit) => CheckedNode[]
  expected: string
}[] = [
  ...(
    [
      ["LS between statements", "venn-beta\nset A\u2028set B"],
      ["PS between statements", "venn-beta\nset A\u2029set B"],
    ] as const
  ).map(([caseName, source]) => ({
    name: caseName,
    source,
    body: (kit: Kit) => [subset(kit), subset(kit, "set", ["B"])],
    expected: "the statement gap is not Venn whitespace",
  })),
  ...(
    [
      ["LS after a comment-ending LF", "venn-beta\nset A %% c\n\u2028"],
      ["PS after a comment-ending LF", "venn-beta\nset A %% c\n\u2029"],
    ] as const
  ).map(([caseName, source]) => ({
    name: caseName,
    source,
    body: (kit: Kit) => {
      const first = subset(kit)
      kit.comment("%%", "%% c")
      return [first]
    },
    expected: "the body has trailing text outside its statements",
  })),
  ...(
    [
      ["NBSP", "venn-beta\nset\u00a0A"],
      ["VT", "venn-beta\nset\u000bA"],
      ["FF", "venn-beta\nset\fA"],
      ["BOM", "venn-beta\nset\ufeffA"],
      ["U+3000", "venn-beta\nset\u3000A"],
    ] as const
  ).map(([caseName, source]) => ({
    name: caseName,
    source,
    body: (kit: Kit) => [subset(kit)],
    expected: "the argument gap is not ASCII space or tab",
  })),
]

describe("Venn separators outside diagram comments", () => {
  for (const testCase of OUTSIDE_COMMENT_CASES)
    it(`reports ${testCase.name}`, () => {
      const built = build(testCase.source, testCase.body)
      expect(
        checkTree(built.source, built.tree).some((problem) =>
          problem.message.includes(testCase.expected),
        ),
      ).toBe(true)
    })
})
