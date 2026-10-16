import { describe, expect, it } from "vitest"
import { BLOCK_CHILD_TYPES } from "../src/check-tree/block.ts"
import { fieldSpecOf } from "../src/check-tree/field-spec.ts"
import { checkTree } from "../src/check-tree/index.ts"
import { childOf } from "../src/check-tree/statement-checks.ts"
import type { CheckedNode } from "../src/check-tree/types.ts"
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
  firstTokenIn,
  problemsOf as problemsOfMutation,
  recordedTree,
  retypeIn,
  says,
  setEnd,
  setField,
} from "./check-tree-recorded.ts"
import { readFieldTables, readTreeDocuments } from "./spec-field-tables.ts"

// Hand-made trees: each case breaks one rule of the check. The recorded trees
// of the block fixtures are checked by the tests of the recorded trees
// (`check-tree-corpus.test.ts`, `check-tree-fields.test.ts`, and the others),
// and the token kinds follow parser/docs/tokens/block.md.

/** A fixed block source and the explicitly supplied statements. */
function build(body: string, statements: (kit: Kit) => CheckedNode[]): Built {
  return buildTree(
    { header: "block-beta", diagramType: "block", bodyType: "BlockDiagram" },
    `block-beta\n${body}\n`,
    statements,
  )
}

/** An Identifier of the next written text. */
function id(kit: Kit, name: string): CheckedNode {
  const token = kit.token("Identifier", name)
  return kit.node("Identifier", token.range, { name })
}

/** A NumericLiteral with its raw digits. */
function number(kit: Kit, raw: string): CheckedNode {
  const token = kit.token("Numeric", raw)
  return kit.node("NumericLiteral", token.range, { raw, value: Number(raw) })
}

/** A whole StringLiteral. */
function string(kit: Kit, raw: string): CheckedNode {
  const token = kit.token("String", raw)
  return kit.node("StringLiteral", token.range, {
    raw,
    value: raw.slice(1, -1),
    closed: true,
  })
}

/** A BlockLiteral with its written whitespace. */
function literal(kit: Kit, value: string): CheckedNode {
  const token = kit.token("RawText", value)
  return kit.node("BlockLiteral", token.range, { value })
}

/** A node with an optional ordinary shape. Mixed delimiters are intentional. */
function blockNode(
  kit: Kit,
  name: string,
  open?: string,
  raw = '"x"',
  close = "]",
): CheckedNode {
  const identifier = id(kit, name)
  let shape: CheckedNode | null = null
  if (open !== undefined) {
    const first = kit.token("Punctuator", open)
    const label = string(kit, raw)
    const last = kit.token("Punctuator", close)
    shape = kit.node("BlockShape", [first.range[0], last.range[1]], {
      open,
      close,
      label,
    })
  }
  return kit.node(
    "BlockNode",
    [identifier.range[0], (shape ?? identifier).range[1]],
    { id: identifier, shape },
  )
}

/** A node statement with its optional width and its already specified links. */
function statement(
  kit: Kit,
  makeNode: (k: Kit) => CheckedNode,
  width: string | null = null,
  makeLinks: ((k: Kit) => CheckedNode[]) | null = null,
): CheckedNode {
  const node = makeNode(kit)
  if (width !== null) kit.token("Punctuator", ":")
  const widthNode = width === null ? null : number(kit, width)
  const links = makeLinks === null ? [] : makeLinks(kit)
  return kit.node(
    "BlockNodeStatement",
    [node.range[0], (links.at(-1) ?? widthNode ?? node).range[1]],
    { node, width: widthNode, links },
  )
}

/** A closing arrow, whose fields are given explicitly by each fixed case. */
function arrow(
  kit: Kit,
  value: string,
  line: string,
  length: number,
  startMarker = "none",
  endMarker = "arrow",
): CheckedNode {
  const token = kit.token("Punctuator", value)
  return kit.node("BlockArrow", token.range, {
    value,
    line,
    length,
    startMarker,
    endMarker,
  })
}

/** A labelled link with deliberately different lines. */
function labelledLink(kit: Kit): CheckedNode {
  const token = kit.token("Punctuator", "<--")
  const opening = kit.node("BlockOpeningArrow", token.range, {
    value: "<--",
    startMarker: "arrow",
    line: "solid",
  })
  const label = string(kit, '"t"')
  const closing = arrow(kit, "==>", "thick", 2)
  const target = blockNode(kit, "B")
  return kit.node("BlockLink", [token.range[0], target.range[1]], {
    opening,
    label,
    arrow: closing,
    target,
  })
}

/** A direction: a BlockLiteral of its word and the whitespace written with it, the `Keyword` token of the word between the `RawText` tokens of the whitespace. */
function direction(kit: Kit, written: string): CheckedNode {
  const word = written.trim()
  const start = written.indexOf(word)
  const leading = written.slice(0, start)
  const trailing = written.slice(start + word.length)
  const first = leading === "" ? null : kit.token("RawText", leading)
  const keyword = kit.token("Keyword", word)
  const last = trailing === "" ? keyword : kit.token("RawText", trailing)
  return kit.node(
    "BlockLiteral",
    [(first ?? keyword).range[0], last.range[1]],
    { value: written },
  )
}

/** A node with a block arrow whose parentheses hold `items`: a `,` is a comma, and any other item is the written text of a direction. */
function blockArrowOf(
  kit: Kit,
  items: readonly string[],
  written = '"a"',
): CheckedNode {
  const identifier = id(kit, "C")
  const first = kit.token("Punctuator", "<[")
  const label = string(kit, written)
  kit.token("Punctuator", "]>")
  kit.token("Punctuator", "(")
  const directions = items.flatMap((item) =>
    item === "," ? (kit.token("Punctuator", ","), []) : [direction(kit, item)],
  )
  const last = kit.token("Punctuator", ")")
  const shape = kit.node("BlockArrowShape", [first.range[0], last.range[1]], {
    label,
    directions,
  })
  return kit.node("BlockNode", [identifier.range[0], last.range[1]], {
    id: identifier,
    shape,
  })
}

/** A block arrow whose directions are `right `, `down`, and `x`, with commas before them. */
function blockArrow(kit: Kit): CheckedNode {
  return blockArrowOf(kit, [",", "right ", "down", ",", "x"], '"arrow"')
}

/** A columns or space statement, with null for auto or plain space. */
function setting(
  kit: Kit,
  kind: "columns" | "space",
  digits: string | null,
): CheckedNode {
  const first = kit.token(
    "Keyword",
    kind === "space" && digits !== null ? "space:" : kind,
  )
  const value = digits === null ? null : number(kit, digits)
  const last =
    kind === "columns" && value === null
      ? kit.token("Keyword", "auto")
      : (value ?? first)
  return kit.node(
    kind === "columns" ? "BlockColumnsStatement" : "BlockSpaceStatement",
    [first.range[0], last.range[1]],
    { [kind === "columns" ? "count" : "width"]: value },
  )
}

/** A style or class definition, with null slots before or after commas. */
function styleStatement(
  kit: Kit,
  kind: "style" | "classDef",
  name: string,
  values: readonly (string | null)[],
): CheckedNode {
  const first = kit.token("Keyword", kind)
  const identifier = id(kit, name)
  let end = identifier.range[1]
  const styles = values.map((value, index) => {
    if (index > 0) end = kit.token("Punctuator", ",").range[1]
    if (value === null) return null
    const style = literal(kit, value)
    end = style.range[1]
    return style
  })
  return kit.node(
    kind === "style" ? "BlockStyleStatement" : "BlockClassDefStatement",
    [first.range[0], end],
    { [kind === "style" ? "id" : "name"]: identifier, styles },
  )
}

/** An id of `class`: a BlockLiteral of the whitespace after a comma, a RawText token, and the word, an Identifier token. */
function classId(kit: Kit, name: string): CheckedNode {
  const word = name.trimStart()
  const whitespace = name.slice(0, name.length - word.length)
  const start =
    whitespace === ""
      ? kit.token("Identifier", word)
      : kit.token("RawText", whitespace)
  const end = whitespace === "" ? start : kit.token("Identifier", word)
  return kit.node("BlockLiteral", [start.range[0], end.range[1]], {
    value: name,
  })
}

/** A class application whose ids are BlockLiterals. */
function css(
  kit: Kit,
  names: readonly string[],
  value: string | null,
): CheckedNode {
  const first = kit.token("Keyword", "class")
  const ids = names.map((name, index) => {
    if (index > 0) kit.token("Punctuator", ",")
    return classId(kit, name)
  })
  const cssClass = value === null ? null : literal(kit, value)
  return kit.node(
    "BlockClassStatement",
    [first.range[0], (cssClass ?? ids.at(-1) ?? first).range[1]],
    { ids, cssClass },
  )
}

/** A composite with its head made explicitly, and its one node statement. */
function composite(kit: Kit, head: boolean): CheckedNode {
  const first = kit.token("Keyword", head ? "block:" : "block")
  const headNode = head ? statement(kit, (k) => blockNode(k, "G"), "2") : null
  const body = [statement(kit, (k) => blockNode(k, "D"))]
  const last = kit.token("Keyword", "end")
  return kit.node("BlockCompositeStatement", [first.range[0], last.range[1]], {
    head: headNode,
    body,
  })
}

/** Every block node type and every child field, with null styles and mixed shapes. */
function everyKind(): Built {
  return build(
    'columns 0\nA["x"):2 <-- "t" ==> B\nC<["arrow"]>(,right down,x)\nspace:3\nblock:G:2 D end\nclassDef c fill:red,, color:blue\nclass A, B c d\nstyle A fill:red , color:blue\naccDescr {}',
    (kit) => {
      const body = [
        setting(kit, "columns", "0"),
        statement(
          kit,
          (k) => blockNode(k, "A", "[", '"x"', ")"),
          "2",
          (k) => [labelledLink(k)],
        ),
        statement(kit, blockArrow),
        setting(kit, "space", "3"),
        composite(kit, true),
        styleStatement(kit, "classDef", "c", ["fill:red", null, " color:blue"]),
        css(kit, ["A", " B"], "c d"),
        styleStatement(kit, "style", "A", ["fill:red ", " color:blue"]),
      ]
      const first = kit.token("Keyword", "accDescr")
      kit.token("Punctuator", "{")
      const last = kit.token("Punctuator", "}")
      body.push(
        kit.node(
          "BlockAccDescrBlockStatement",
          [first.range[0], last.range[1]],
          {},
        ),
      )
      return body
    },
  )
}

/** The null alternatives of the fields that may be null. */
function alternatives(): Built {
  return build(
    "columns auto space block D end\nclass A\nstyle A ,\nA --> B",
    (kit) => [
      setting(kit, "columns", null),
      setting(kit, "space", null),
      composite(kit, false),
      css(kit, ["A"], null),
      styleStatement(kit, "style", "A", [null, null]),
      statement(
        kit,
        (k) => blockNode(k, "A"),
        null,
        (k) => {
          const closing = arrow(k, "-->", "solid", 2)
          const target = blockNode(k, "B")
          return [
            k.node("BlockLink", [closing.range[0], target.range[1]], {
              opening: null,
              label: null,
              arrow: closing,
              target,
            }),
          ]
        },
      ),
    ],
  )
}

/** Set one field on a node of the fixed all-kinds tree. */
function setNodeField(
  type: string,
  name: string,
  value: unknown,
): BrokenCase["mutate"] {
  return (tree) => setField(nodeWith(tree, type), name, value)
}

const BROKEN: readonly BrokenCase[] = [
  {
    name: "an empty diagram body",
    built: everyKind,
    mutate: setNodeField("BlockDiagram", "body", []),
    expected: "the list body is empty",
  },
  {
    name: "an empty composite body",
    built: everyKind,
    mutate: setNodeField("BlockCompositeStatement", "body", []),
    expected: "the list body is empty",
  },
  {
    name: "a classDef without style slots",
    built: everyKind,
    mutate: setNodeField("BlockClassDefStatement", "styles", []),
    expected: "the list styles is empty",
  },
  {
    name: "a style without slots",
    built: everyKind,
    mutate: setNodeField("BlockStyleStatement", "styles", []),
    expected: "the list styles is empty",
  },
  {
    name: "class without ids",
    built: everyKind,
    mutate: setNodeField("BlockClassStatement", "ids", []),
    expected: "the list ids is empty",
  },
  {
    name: "an unknown shape opening",
    built: everyKind,
    mutate: setNodeField("BlockShape", "open", "[[["),
    expected: "the shape opening",
  },
  {
    name: "an unknown shape closing",
    built: everyKind,
    mutate: setNodeField("BlockShape", "close", "|]"),
    expected: "the shape closing",
  },
  {
    name: "a shape opening that disagrees with its token",
    built: everyKind,
    mutate: setNodeField("BlockShape", "open", "("),
    expected: "the tokens that the node writes itself",
  },
  {
    name: "a shape closing that disagrees with its token",
    built: everyKind,
    mutate: setNodeField("BlockShape", "close", "]"),
    expected: "the tokens that the node writes itself",
  },
  {
    name: "no block-arrow directions",
    built: everyKind,
    mutate: setNodeField("BlockArrowShape", "directions", []),
    expected: "the list directions is empty",
  },
  {
    name: "an unknown direction",
    built: everyKind,
    mutate: (tree) => setField(tokenWith(tree, "right"), "value", "north"),
    expected: "the directions include an unknown direction",
  },
  {
    name: "directions out of source order",
    built: everyKind,
    mutate: (tree) => {
      const shape = nodeWith(tree, "BlockArrowShape")
      setField(
        shape,
        "directions",
        [...(shape.directions as unknown[])].reverse(),
      )
    },
    expected: "comes before the child node",
  },
  {
    name: "a direction that lost the whitespace written after it",
    built: everyKind,
    mutate: (tree) =>
      setField(
        nodeWith(tree, "BlockLiteral", "value", "right "),
        "value",
        "right",
      ),
    expected: "value is not its written text",
  },
  {
    name: "a direction that is no node",
    built: everyKind,
    mutate: setNodeField("BlockArrowShape", "directions", [1]),
    expected: "is no node",
  },
  {
    name: "the word of a direction as a RawText token",
    built: everyKind,
    mutate: (tree) => setField(tokenWith(tree, "right"), "type", "RawText"),
    expected: "the tokens of a direction are the Keyword token of its word",
  },
  {
    name: "a missing opening arrow",
    built: everyKind,
    mutate: setNodeField("BlockLink", "opening", null),
    expected: "opening and label must both be present or both be null",
  },
  {
    name: "a missing link label",
    built: everyKind,
    mutate: setNodeField("BlockLink", "label", null),
    expected: "opening and label must both be present or both be null",
  },
  {
    name: "a missing shape",
    built: everyKind,
    mutate: setNodeField("BlockNode", "shape", null),
    expected: "the tokens that the node writes itself",
  },
  {
    name: "a missing node width",
    built: everyKind,
    mutate: setNodeField("BlockNodeStatement", "width", null),
    expected: "the tokens that the node writes itself",
  },
  {
    name: "a missing space width",
    built: everyKind,
    mutate: setNodeField("BlockSpaceStatement", "width", null),
    expected: "the tokens that the node writes itself",
  },
  {
    name: "a missing columns count",
    built: everyKind,
    mutate: setNodeField("BlockColumnsStatement", "count", null),
    expected: "the tokens that the node writes itself",
  },
  {
    name: "a missing composite head",
    built: everyKind,
    mutate: setNodeField("BlockCompositeStatement", "head", null),
    expected: "the header does not agree with the head",
  },
  {
    name: "a missing class name",
    built: everyKind,
    mutate: setNodeField("BlockClassStatement", "cssClass", null),
    expected: "the tokens that the node writes itself",
  },
  {
    name: "a false arrow start marker",
    built: everyKind,
    mutate: setNodeField("BlockArrow", "startMarker", "circle"),
    expected: "the startMarker of the arrow",
  },
  {
    name: "a false arrow end marker",
    built: everyKind,
    mutate: setNodeField("BlockArrow", "endMarker", "none"),
    expected: "the endMarker of the arrow",
  },
  {
    name: "a false arrow line",
    built: everyKind,
    mutate: setNodeField("BlockArrow", "line", "solid"),
    expected: "the line of the arrow",
  },
  {
    name: "a false arrow length",
    built: everyKind,
    mutate: setNodeField("BlockArrow", "length", 3),
    expected: "the length of the arrow",
  },
  {
    name: "a false opening-arrow marker",
    built: everyKind,
    mutate: setNodeField("BlockOpeningArrow", "startMarker", "none"),
    expected: "the startMarker of the arrow",
  },
  {
    name: "a false opening-arrow line",
    built: everyKind,
    mutate: setNodeField("BlockOpeningArrow", "line", "thick"),
    expected: "the line of the arrow",
  },
  {
    name: "an arrow value unlike its written text",
    built: everyKind,
    mutate: setNodeField("BlockArrow", "value", "--x"),
    expected: "value is not its written text",
  },
  {
    name: "an opening-arrow value unlike its written text",
    built: everyKind,
    mutate: setNodeField("BlockOpeningArrow", "value", "=="),
    expected: "value is not its written text",
  },
  {
    name: "a BlockLiteral value unlike its written text",
    built: everyKind,
    mutate: setNodeField("BlockLiteral", "value", "wrong"),
    expected: "value is not its written text",
  },
  {
    name: "an Identifier value unlike its token",
    built: everyKind,
    mutate: setNodeField("Identifier", "name", "wrong"),
    expected: "name is not the texts of its tokens joined",
  },
  {
    name: "a numeric value unlike its digits",
    built: everyKind,
    mutate: setNodeField("NumericLiteral", "value", 4),
    expected: "value is not the number that its written text writes",
  },
  {
    name: "a string value unlike its content",
    built: everyKind,
    mutate: setNodeField("StringLiteral", "value", "wrong"),
    expected: "value is not its written text",
  },
  {
    name: "an unclosed label",
    built: everyKind,
    mutate: setNodeField("StringLiteral", "closed", false),
    expected: "the label is not a closed nonempty string",
  },
  {
    name: "a header of the wrong kind",
    built: everyKind,
    mutate: retype("block-beta", "Punctuator"),
    expected: "the kind of a token that the node writes itself",
  },
  {
    name: "a delimiter of the wrong kind",
    built: everyKind,
    mutate: retype("[", "Keyword"),
    expected: "the kind of a token that the node writes itself",
  },
  {
    name: "an arrow of the wrong token kind",
    built: everyKind,
    mutate: retype("==>", "RawText"),
    expected: "the tokens of the arrow",
  },
  {
    name: "a literal of the wrong token kind",
    built: everyKind,
    mutate: retype("fill:red", "Identifier"),
    expected: "the tokens of the value are not RawText",
  },
  {
    name: "a number of the wrong token kind",
    built: everyKind,
    mutate: retype("0", "RawText"),
    expected: "the tokens of the value are not Numeric",
  },
  {
    name: "a string of the wrong token kind",
    built: everyKind,
    mutate: retype('"x"', "RawText"),
    expected: "the tokens of the string are not one String token",
  },
  {
    name: "a diagram range beyond its hull",
    built: everyKind,
    mutate: (tree, source) => setField(tree.body, "range", [0, source.length]),
    expected: "the range, which runs from the first of its tokens",
  },
  {
    name: "a value range before its first token",
    built: everyKind,
    mutate: (tree) => {
      const value = nodeWith(tree, "BlockLiteral", "value", "c d")
      setField(value, "range", [value.range[0] - 1, value.range[1]])
    },
    expected: "the range of the value from its first token to its last",
  },
  {
    name: "an incompatible root diagram id",
    built: everyKind,
    mutate: setNodeField("Root", "diagramType", "quadrantChart"),
    expected: "is not one of those of a BlockDiagram",
  },
  {
    name: "a required node set to null",
    built: everyKind,
    mutate: setNodeField("BlockNodeStatement", "node", null),
    expected: "the field node is null, not a node",
  },
  {
    name: "a required label set to null",
    built: everyKind,
    mutate: setNodeField("BlockShape", "label", null),
    expected: "the field label is null, not a node",
  },
  {
    name: "a null style slot where text is written",
    built: everyKind,
    mutate: (tree) => {
      const node = nodeWith(tree, "BlockClassDefStatement")
      const styles = [...(node.styles as unknown[])]
      styles[0] = null
      setField(node, "styles", styles)
    },
    expected: "the style 0 is null but its part has text",
  },
  {
    name: "a field on an empty description block",
    built: everyKind,
    mutate: setNodeField("BlockAccDescrBlockStatement", "value", null),
    expected: "has the field value, which its type does not have",
  },
]

/** Fixed malformed trees for the whitespace and lexical boundaries of the syntax. */
const BROKEN_TEXTS: readonly {
  readonly name: string
  readonly built: () => Built
  readonly expected: string
}[] = [
  {
    name: "whitespace after a shape opening",
    built: () =>
      build('A[ "x"]', (kit) => [
        statement(kit, (k) => blockNode(k, "A", "[")),
      ]),
    expected: "the shape has whitespace inside its delimiters",
  },
  {
    name: "whitespace before a shape closing",
    built: () =>
      build('A["x" ]', (kit) => [
        statement(kit, (k) => blockNode(k, "A", "[")),
      ]),
    expected: "the shape has whitespace inside its delimiters",
  },
  {
    name: "an empty label",
    built: () =>
      build('A[""]', (kit) => [
        statement(kit, (k) => blockNode(k, "A", "[", '""')),
      ]),
    expected: "the label is not a closed nonempty string",
  },
  {
    name: "a markdown label",
    built: () =>
      build('A["`x`"]', (kit) => [
        statement(kit, (k) => blockNode(k, "A", "[", '"`x`"')),
      ]),
    expected: "the label is not a closed nonempty string",
  },
  {
    name: "an inner label quote",
    built: () =>
      build('A["a"b"]', (kit) => [
        statement(kit, (k) => blockNode(k, "A", "[", '"a"b"')),
      ]),
    expected: "the label is not a closed nonempty string",
  },
  {
    name: "a signed count",
    built: () => build("columns -1", (kit) => [setting(kit, "columns", "-1")]),
    expected: "the width or count is not decimal digits",
  },
  {
    name: "whitespace inside a node width",
    built: () =>
      build("A: 2", (kit) => [statement(kit, (k) => blockNode(k, "A"), "2")]),
    expected: "the width does not touch its colon",
  },
  {
    name: "whitespace inside a space width",
    built: () => build("space: 2", (kit) => [setting(kit, "space", "2")]),
    expected: "the space width does not touch space:",
  },
  {
    name: "no whitespace after columns",
    built: () => build("columns2", (kit) => [setting(kit, "columns", "2")]),
    expected: "not nonempty whitespace",
  },
  {
    name: "no whitespace after class",
    built: () => build("classA c", (kit) => [css(kit, ["A"], "c")]),
    expected: "not nonempty whitespace",
  },
  {
    name: "whitespace before a class-id comma",
    built: () => build("class A ,B c", (kit) => [css(kit, ["A", "B"], "c")]),
    expected: "a class-id comma does not touch the id before it",
  },
  {
    name: "a class name spanning lines",
    built: () => build("class A c\nd", (kit) => [css(kit, ["A"], "c\nd")]),
    expected:
      "the class name is empty, has whitespace at its ends, or spans lines",
  },
  {
    name: "a class name padded with whitespace",
    built: () => build("class A  c ", (kit) => [css(kit, ["A"], " c ")]),
    expected:
      "the class name is empty, has whitespace at its ends, or spans lines",
  },
  {
    name: "a class name on the following line",
    built: () => build("class A\nc", (kit) => [css(kit, ["A"], "c")]),
    expected: "not same-line whitespace",
  },
  {
    name: "a non-word class id",
    built: () => build("class A-B c", (kit) => [css(kit, ["A-B"], "c")]),
    expected: "the class id is not a word",
  },
  {
    name: "an id of class with whitespace and no comma before it",
    built: () => build("class  A c", (kit) => [css(kit, [" A"], "c")]),
    expected: "or has whitespace before it where no comma stands before",
  },
  {
    name: "an id of class with no word after the whitespace of its comma",
    built: () =>
      build("class A, c", (kit) => {
        const first = kit.token("Keyword", "class")
        const one = classId(kit, "A")
        kit.token("Punctuator", ",")
        const space = kit.token("RawText", " ")
        const two = kit.node("BlockLiteral", space.range, { value: " " })
        const cssClass = literal(kit, "c")
        return [
          kit.node("BlockClassStatement", [first.range[0], cssClass.range[1]], {
            ids: [one, two],
            cssClass,
          }),
        ]
      }),
    expected: "the class id is not a word",
  },
  {
    name: "a non-word classDef name",
    built: () =>
      build("classDef c-d x", (kit) => [
        styleStatement(kit, "classDef", "c-d", ["x"]),
      ]),
    expected: "the style id or the class name is not made of word characters",
  },
  {
    name: "a non-word style id",
    built: () =>
      build("style A-B x", (kit) => [
        styleStatement(kit, "style", "A-B", ["x"]),
      ]),
    expected: "the style id or the class name is not made of word characters",
  },
  {
    name: "an empty word between style-id commas",
    built: () =>
      build("style A,,B x", (kit) => [
        styleStatement(kit, "style", "A,,B", ["x"]),
      ]),
    expected: "the style id or the class name is not made of word characters",
  },
  {
    name: "the reserved uppercase classDef name",
    built: () =>
      build("classDef DEFAULT x", (kit) => [
        styleStatement(kit, "classDef", "DEFAULT", ["x"]),
      ]),
    expected: "DEFAULT is not a classDef name",
  },
  {
    name: "a first style that includes leading whitespace",
    built: () =>
      build("style A  x", (kit) => [styleStatement(kit, "style", "A", [" x"])]),
    expected: "the first style starts with whitespace",
  },
  {
    name: "a style ending in whitespace",
    built: () =>
      build("style A x ", (kit) => [styleStatement(kit, "style", "A", ["x "])]),
    expected: "the last ends with whitespace",
  },
  {
    name: "a style spanning lines",
    built: () =>
      build("style A x\ny", (kit) => [
        styleStatement(kit, "style", "A", ["x\ny"]),
      ]),
    expected: "the style spans lines",
  },
  {
    name: "a style on the following line",
    built: () =>
      build("style A\nx", (kit) => [styleStatement(kit, "style", "A", ["x"])]),
    expected: "not same-line whitespace",
  },
  {
    name: "a later classDef style on another line",
    built: () =>
      build("classDef c x\n,y", (kit) => [
        styleStatement(kit, "classDef", "c", ["x", "y"]),
      ]),
    expected: "or does not end at the comma after it",
  },
  {
    name: "an omitted leading space after a comma",
    built: () =>
      build("style A x, y", (kit) => [
        styleStatement(kit, "style", "A", ["x", "y"]),
      ]),
    expected: "the style does not start after the whitespace or the comma",
  },
  {
    name: "a whitespace-only style represented as a literal",
    built: () =>
      build("style A  ,x", (kit) => [
        styleStatement(kit, "style", "A", [" ", "x"]),
      ]),
    expected: "or one of them is blank",
  },
  {
    name: "a node id containing an excluded character",
    built: () =>
      build("A-B", (kit) => [statement(kit, (k) => blockNode(k, "A-B"))]),
    expected: "the node id is empty or holds a character that ends an id",
  },
  {
    name: "an invalid closing arrow",
    built: () =>
      build("A -> B", (kit) => [
        statement(
          kit,
          (k) => blockNode(k, "A"),
          null,
          (k) => {
            const closing = arrow(k, "->", "solid", 1)
            const target = blockNode(k, "B")
            return [
              k.node("BlockLink", [closing.range[0], target.range[1]], {
                opening: null,
                label: null,
                arrow: closing,
                target,
              }),
            ]
          },
        ),
      ]),
    expected: "is not an arrow",
  },
  {
    name: "an invalid opening arrow",
    built: () =>
      build('A - "t" ==> B', (kit) => [
        statement(
          kit,
          (k) => blockNode(k, "A"),
          null,
          (k) => {
            const first = k.token("Punctuator", "-")
            const opening = k.node("BlockOpeningArrow", first.range, {
              value: "-",
              startMarker: "none",
              line: "solid",
            })
            const label = string(k, '"t"')
            const closing = arrow(k, "==>", "thick", 2)
            const target = blockNode(k, "B")
            return [
              k.node("BlockLink", [first.range[0], target.range[1]], {
                opening,
                label,
                arrow: closing,
                target,
              }),
            ]
          },
        ),
      ]),
    expected: "is not an opening arrow",
  },
  {
    name: "a final direction comma",
    built: () =>
      build('C<["a"]>(right,)', (kit) => [
        statement(kit, (k) => blockArrowOf(k, ["right", ","])),
      ]),
    expected: "a direction list has no final comma or consecutive commas",
  },
  {
    name: "consecutive direction commas",
    built: () =>
      build('C<["a"]>(right,,down)', (kit) => [
        statement(kit, (k) => blockArrowOf(k, ["right", ",", ",", "down"])),
      ]),
    expected: "a direction list has no final comma or consecutive commas",
  },
  {
    name: "whitespace before the word of a direction after a comma",
    built: () =>
      build('C<["a"]>(x, down)', (kit) => [
        statement(kit, (k) => blockArrowOf(k, ["x", ",", " down"])),
      ]),
    expected: "has whitespace before its word",
  },
  {
    name: "whitespace inside block-arrow brackets",
    built: () =>
      build('C<[ "arrow"]>(,right down,x)', (kit) => [
        statement(kit, blockArrow),
      ]),
    expected: "the block arrow has whitespace inside its brackets",
  },
  {
    name: "a missing statement token",
    built: () =>
      build("A ! B", (kit) => [
        statement(kit, (k) => blockNode(k, "A")),
        statement(kit, (k) => blockNode(k, "B")),
      ]),
    expected: "not whitespace only",
  },
  {
    name: "a diagram made only of an empty description block",
    built: () =>
      build("accDescr {}", (kit) => {
        const first = kit.token("Keyword", "accDescr")
        kit.token("Punctuator", "{")
        const last = kit.token("Punctuator", "}")
        return [
          kit.node(
            "BlockAccDescrBlockStatement",
            [first.range[0], last.range[1]],
            {},
          ),
        ]
      }),
    expected: "the body has no statement other than empty description blocks",
  },
]

describe("checkTree of block trees made by hand", () => {
  it("accepts every node type, mismatched shape pairs, and arrows with different lines", () => {
    const { source, tree } = everyKind()
    expect(checkTree(source, tree)).toEqual([])
  })
  it("accepts null alternatives, anonymous composites, and empty styles", () => {
    const { source, tree } = alternatives()
    expect(checkTree(source, tree)).toEqual([])
  })
  it("accepts the styles of whitespace-only and empty parts", () => {
    const { source, tree } = build(
      "style A fill:red,  ,stroke:#333\nstyle A  , fill:#f00\nstyle A fill:#f00,  ",
      (kit) => [
        styleStatement(kit, "style", "A", ["fill:red", "  ", "stroke:#333"]),
        styleStatement(kit, "style", "A", [null, " fill:#f00"]),
        styleStatement(kit, "style", "A", ["fill:#f00", null]),
      ],
    )
    expect(checkTree(source, tree)).toEqual([])
  })
  it("accepts the whitespace of a direction on both sides", () => {
    const { source, tree } = build('C<["a"]>( right , down )', (kit) => [
      statement(kit, (k) => blockArrowOf(k, [" right ", ",", "down "])),
    ])
    expect(checkTree(source, tree)).toEqual([])
  })
  it("accepts the commas of one style id", () => {
    const { source, tree } = build("a,b\nstyle a,b fill:red", (kit) => [
      statement(kit, (k) => blockNode(k, "a,b")),
      styleStatement(kit, "style", "a,b", ["fill:red"]),
    ])
    expect(checkTree(source, tree)).toEqual([])
  })
  it("accepts comment lines with %% and reports another marker", () => {
    const { source, tree } = build("%% comment\nA", (kit) => {
      kit.comment("%%", "%% comment")
      return [statement(kit, (k) => blockNode(k, "A"))]
    })
    expect(checkTree(source, tree)).toEqual([])
    const comment = tree.comments[0]
    if (comment === undefined) throw new Error("no comment")
    setField(comment, "mark", "%")
    expect(
      checkTree(source, tree).some(
        (problem) => problem.message === "the mark of a comment line is not %%",
      ),
    ).toBe(true)
  })
  it("accepts converted attribute quotes and a directive that cuts a class name", () => {
    const { source, tree } = build(
      'A["<a b="c">x</a>"]\nclass A c%%{init: {}}%%d',
      (kit) => {
        const first = statement(kit, (k) =>
          blockNode(k, "A", "[", '"<a b="c">x</a>"'),
        )
        const keyword = kit.token("Keyword", "class")
        const identifier = classId(kit, "A")
        const start = kit.token("RawText", "c")
        kit.directive("%%{init: {}}%%")
        const end = kit.token("RawText", "d")
        const cssClass = kit.node(
          "BlockLiteral",
          [start.range[0], end.range[1]],
          { value: "cd" },
        )
        return [
          first,
          kit.node("BlockClassStatement", [keyword.range[0], end.range[1]], {
            ids: [identifier],
            cssClass,
          }),
        ]
      },
    )
    expect(checkTree(source, tree)).toEqual([])
  })
  it("rejects RawText fragments with no cut between them", () => {
    const { source, tree } = build("class A cd", (kit) => {
      const keyword = kit.token("Keyword", "class")
      const identifier = classId(kit, "A")
      const start = kit.token("RawText", "c")
      const end = kit.token("RawText", "d")
      const cssClass = kit.node(
        "BlockLiteral",
        [start.range[0], end.range[1]],
        { value: "cd" },
      )
      return [
        kit.node("BlockClassStatement", [keyword.range[0], end.range[1]], {
          ids: [identifier],
          cssClass,
        }),
      ]
    })
    expect(
      checkTree(source, tree).some(
        (problem) =>
          problem.message === "RawText tokens without a cut are one token",
      ),
    ).toBe(true)
  })
  itFailsEach(BROKEN)
  for (const testCase of BROKEN_TEXTS) {
    it(`rejects ${testCase.name}`, () => {
      const { source, tree } = testCase.built()
      expect(
        checkTree(source, tree).some((problem) =>
          problem.message.includes(testCase.expected),
        ),
      ).toBe(true)
    })
  }

  for (const [type, fields] of Object.entries(BLOCK_CHILD_TYPES)) {
    for (const [field, allowed] of Object.entries(fields)) {
      it(`rejects a wrong child type in ${type}.${field}`, () => {
        const { source, tree } = everyKind()
        const owner = nodeWith(tree, type)
        const old = Array.isArray(owner[field])
          ? (owner[field] as CheckedNode[])[0]
          : childOf(owner, field)
        if (old === null || old === undefined)
          throw new Error(`no child in ${type}.${field}`)
        const replacement = {
          type: "BlockAccDescrBlockStatement",
          range: old.range,
          loc: old.loc,
        }
        // The body accepts empty description blocks, so use a value leaf there.
        const wrong = allowed.includes(replacement.type)
          ? { ...replacement, type: "BlockLiteral", value: "wrong" }
          : replacement
        setField(owner, field, Array.isArray(owner[field]) ? [wrong] : wrong)
        expect(
          checkTree(source, tree).some(
            (problem) =>
              problem.where.startsWith(`${type} at `) &&
              problem.message.startsWith(`the field ${field} holds a `),
          ),
        ).toBe(true)
      })
    }
  }

  it("holds the child table to the Type column of ast/block.md", () => {
    const documented = readFieldTables()
    const document = readTreeDocuments().find((text) =>
      text.includes("**BlockStatement** is a"),
    )
    if (document === undefined) throw new Error("no BlockStatement definition")
    const start = document.indexOf("**BlockStatement** is a")
    const sentence = document.slice(start, document.indexOf(".\n", start))
    const statements = [
      ...sentence.matchAll(/\bBlock[A-Za-z]+Statement\b/gu),
    ].map((match) => match[0])
    const expected: Record<string, Record<string, string[]>> = {}
    for (const [type, fields] of documented) {
      if (!type.startsWith("Block")) continue
      for (const [field, cell] of fields) {
        if (fieldSpecOf(cell).shape === "value") continue
        const types = [...cell.matchAll(/\b[A-Z][A-Za-z]+\b/gu)].flatMap(
          (match) => (match[0] === "BlockStatement" ? statements : [match[0]]),
        )
        expected[type] ??= {}
        expected[type][field] = types
      }
    }
    expect(BLOCK_CHILD_TYPES).toEqual(expected)
  })
})

// The same sentences against the recorded trees of the corpus: each case
// changes one thing of the tree of a named fixture.

/** Sets the field `fieldName` of the first node of the type `type` to `value`. */
function setIn(
  type: string,
  fieldName: string,
  value: unknown,
): MutationCase["mutate"] {
  return (root) => {
    setField(firstNode(root, type), fieldName, value)
  }
}

/** Sets the value of the direction `index` of the first block arrow to `value`. */
function setDirectionValue(
  index: number,
  value: string,
): MutationCase["mutate"] {
  return (root) => {
    const target = (
      firstNode(root, "BlockArrowShape").directions as CheckedNode[]
    )[index]
    if (target === undefined) throw new Error("no such direction")
    setField(target, "value", value)
  }
}

/** Sets the kind of the first token inside the first node of the type `type` that has the text `value` to `to`. */
function retypeTextIn(
  type: string,
  value: string,
  to: string,
): MutationCase["mutate"] {
  return retypeIn(type, null, value, to)
}

const OWN_KIND = "the kind of a token that the node writes itself"
const HULL =
  "the range, which runs from the first of its tokens and child nodes to the last"
const LAYOUT =
  "the tokens that the node writes itself and its child nodes, in source order"

const RECORDED_CASES: readonly MutationCase[] = [
  {
    name: "the header as a RawText token",
    fixture: "db-columns-plain",
    mutate: retypeIn("BlockDiagram", "Keyword", "block-beta", "RawText"),
    expected: `${OWN_KIND}: "RawText", not "Keyword"`,
  },
  {
    name: "an arrow as a Keyword token",
    fixture: "db-edge-arrow",
    mutate: retypeIn("BlockArrow", null, "-->", "Keyword"),
    expected: "the tokens of the arrow",
  },
  {
    name: "the opening of a shape as a Keyword token",
    fixture: "db-shape-lean-left",
    mutate: retypeIn("BlockShape", "Punctuator", null, "Keyword"),
    expected: `${OWN_KIND}: "Keyword", not "Punctuator"`,
  },
  {
    name: "the number of a width as a RawText token",
    fixture: "db-width-plain",
    mutate: retypeIn("NumericLiteral", null, null, "RawText"),
    expected: "the tokens of the value are not Numeric",
  },
  {
    name: "a direction as a Punctuator token",
    fixture: "db-arrow-two",
    mutate: retypeIn("BlockArrowShape", "Keyword", "right", "Punctuator"),
    expected: "the tokens of a direction are the Keyword token of its word",
  },
  {
    name: "the id of a class statement as a RawText token",
    fixture: "db-class-apply-list",
    mutate: (root) => {
      const classStatement = firstNode(root, "BlockClassStatement")
      setField(
        firstTokenIn(
          root,
          classStatement,
          (token) => token.type === "Identifier",
        ),
        "type",
        "RawText",
      )
    },
    expected:
      "the tokens of the id are not RawText tokens and the Identifier token of its word",
  },
  {
    name: "the whitespace after the comma of a class id as an Identifier token",
    fixture: "db-class-apply-list-spaces",
    mutate: retypeIn("BlockClassStatement", "RawText", " ", "Identifier"),
    expected:
      "the tokens of the id are not RawText tokens and the Identifier token of its word",
  },
  {
    name: "the Identifier token of a class id that holds the whitespace before the word",
    fixture: "db-class-apply-list-spaces",
    mutate: (root) => {
      const space = root.tokens.findIndex(
        (token) => token.type === "RawText" && token.value === " ",
      )
      const word = root.tokens[space + 1]
      if (word === undefined) throw new Error("no word after the whitespace")
      setField(word, "value", ` ${word.value}`)
      setField(word, "range", [word.range[0] - 1, word.range[1]])
      setField(
        root,
        "tokens",
        root.tokens.filter((_token, index) => index !== space),
      )
    },
    expected:
      "the whitespace and the word of an id of class, in its RawText tokens and its Identifier token",
  },
  {
    name: "a direction that lost the whitespace written after it",
    fixture: "db-arrow-spaces",
    mutate: setDirectionValue(0, "right"),
    expected: "value is not its written text",
  },
  {
    name: "the RawText token of the whitespace of a direction removed",
    fixture: "db-arrow-spaces",
    mutate: (root) => {
      setField(
        root,
        "tokens",
        root.tokens.filter(
          (token) => !(token.type === "RawText" && token.value === "  "),
        ),
      )
    },
    expected: "the texts of its tokens joined are not its written text",
  },
  {
    name: "a first direction that lost the whitespace written before it",
    fixture: "db-arrow-spaces-around-first",
    mutate: setDirectionValue(0, "right "),
    expected: "value is not its written text",
  },
  {
    name: "a style that lost the whitespace written before its comma",
    fixture: "db-style-spaces",
    mutate: setIn("BlockLiteral", "value", "fill:#f00"),
    expected: "value is not its written text",
  },
  {
    name: "a whitespace-only style set to null",
    fixture: "db-style-whitespace-only-between-commas",
    mutate: (root) => {
      const styleHolder = firstNode(root, "BlockStyleStatement")
      const styles = [...(styleHolder.styles as unknown[])]
      styles[1] = null
      setField(styleHolder, "styles", styles)
    },
    expected: "the style 1 is null but its part has text",
  },
  {
    name: "a string cut by a directive as RawText tokens",
    fixture: "db-edge-label-directive",
    mutate: retypeIn("StringLiteral", "StringFragment", null, "RawText"),
    expected:
      "the tokens of the string are not one String token or StringFragment tokens",
  },
  {
    name: "a style cut by a directive as a Keyword token",
    fixture: "db-grid-directive-style-text",
    mutate: retypeIn("BlockLiteral", "RawText", null, "Keyword"),
    expected: "the tokens of the value are not RawText",
  },
  {
    name: "the directions in another order than they are written",
    fixture: "db-arrow-two",
    mutate: (root) => {
      const shape = firstNode(root, "BlockArrowShape")
      setField(
        shape,
        "directions",
        [...(shape.directions as unknown[])].reverse(),
      )
    },
    expected: "comes before the child node",
  },
  {
    name: "a style statement whose range stops before its text",
    fixture: "db-style-plain",
    mutate: setEnd(
      "BlockStyleStatement",
      (root) => firstNode(root, "BlockStyleStatement").range[1] - 1,
    ),
    expected: HULL,
  },
  {
    name: "a class statement without the comma between its ids",
    fixture: "db-class-apply-list",
    mutate: (root) => {
      const comma = root.tokens.findIndex((token) => token.value === ",")
      setField(
        root,
        "tokens",
        root.tokens.filter((_token, index) => index !== comma),
      )
    },
    expected: LAYOUT,
  },
  {
    name: "a width without its colon",
    fixture: "db-width-plain",
    mutate: (root) => {
      const colon = root.tokens.findIndex((token) => token.value === ":")
      setField(
        root,
        "tokens",
        root.tokens.filter((_token, index) => index !== colon),
      )
    },
    expected: LAYOUT,
  },
  {
    name: "the closing of a shape as a Keyword token",
    fixture: "db-shape-lean-left",
    mutate: retypeTextIn("BlockShape", "\\]", "Keyword"),
    expected: `${OWN_KIND}: "Keyword", not "Punctuator"`,
  },
]

describe("the check of a block diagram tree against the recorded trees", () => {
  for (const mutation of RECORDED_CASES) {
    it(`passes the recorded tree of ${mutation.fixture} and fails ${mutation.name}`, () => {
      const { base, mutated } = problemsOfMutation("block", mutation)
      expect(base).toEqual([])
      expect(
        says(mutated, mutation.expected),
        JSON.stringify(mutated, null, 1),
      ).toBe(true)
    })
  }

  // diagrams/block.md, Directives inside units: a directive between two units
  // leaves them touching, so that a delimiter that touches its string, a colon
  // that touches its number, and a block arrow that touches its label are
  // still so.
  for (const fixture of [
    "db-directive-inside-shape",
    "db-directive-after-shape-label",
    "db-directive-before-block-arrow-label",
    "db-directive-after-block-arrow-label",
    "db-directive-between-colon-and-width",
    "db-directive-between-space-colon-and-width",
  ]) {
    it(`passes the recorded tree of ${fixture}, where a directive lies between two units`, () => {
      const { input, tree } = recordedTree("block", fixture)
      expect(checkTree(input, tree)).toEqual([])
    })
  }
})
