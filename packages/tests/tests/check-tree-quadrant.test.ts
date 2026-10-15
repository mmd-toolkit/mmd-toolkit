import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import {
  QUADRANT_AXES,
  QUADRANT_CHILD_TYPES,
  QUADRANT_LABEL_KINDS,
  QUADRANT_STYLE_NAMES,
  isCoordinate,
} from "../src/check-tree/quadrant.ts"
import type { CheckedNode, CheckedRoot } from "../src/check-tree/types.ts"
import { nodesOf } from "../src/check-tree/walk.ts"
import type { Built, Kit } from "./check-tree-built.ts"
import { buildTree } from "./check-tree-built.ts"
import type { MutationCase } from "./check-tree-recorded.ts"
import {
  copyOf,
  firstNode,
  problemsOf as problemsOfMutation,
  retypeIn,
  says,
  setField,
} from "./check-tree-recorded.ts"
import {
  readFieldMeanings,
  readFieldTables,
  readTreeDocuments,
} from "./spec-field-tables.ts"

// The trees of a quadrant chart made by hand: they are the smallest trees that
// hold the case they are about (see `check-tree-built.ts`). Their tokens are of
// the kinds and in the layout of parser/docs/tokens/quadrant.md: the header and
// the keywords are `Keyword` tokens, the arrow, the colons, the brackets, the
// commas, and the `;` are `Punctuator` tokens, the words of a text, the text of
// a title, a coordinate, and a style are `RawText` tokens, a string is a
// `String` token with its quotes, and the name of a class is an `Identifier`
// token. The end of the file runs the same sentences against the recorded trees
// of the corpus.

/** A tree of `source`, whose first line is the header. */
function build(
  source: string,
  makeStatements: (kit: Kit) => CheckedNode[],
): Built {
  return buildTree(
    {
      header: "quadrantChart",
      diagramType: "quadrantChart",
      bodyType: "QuadrantDiagram",
    },
    source,
    makeStatements,
  )
}

/** A QuadrantLiteral over the written text `written`, whose value is `value`. */
function literal(
  kit: Kit,
  written: string,
  value: string = written,
): CheckedNode {
  const token = kit.token("RawText", written)
  return kit.node("QuadrantLiteral", token.range, { value })
}

/** A QuadrantLabel of the kind `kind` over the written text `written`, whose value is `value`. */
function labelOf(
  kit: Kit,
  kind: string,
  written: string,
  value: string,
): CheckedNode {
  if (kind === "text") {
    const token = kit.token("RawText", written)
    return kit.node("QuadrantLabel", token.range, { kind, value })
  }
  // A string or a markdown string is one `String` token with its quotes, and
  // the words after it are a `RawText` token.
  const closing = kind === "string" ? '"' : '`"'
  const end =
    written.indexOf(closing, kind === "string" ? 1 : 2) + closing.length
  const string = kit.token("String", written.slice(0, end))
  const rest = written.slice(end).trim()
  const last = rest === "" ? string : kit.token("RawText", rest)
  return kit.node("QuadrantLabel", [string.range[0], last.range[1]], {
    kind,
    value,
  })
}

/** A label of words without quotes. */
function words(kit: Kit, written: string): CheckedNode {
  return labelOf(kit, "text", written, written)
}

/** `title T`: the text as written, and the value of its literal, which is the written text if it is not given. */
function title(
  kit: Kit,
  written: string | null,
  value: string | null = written,
): CheckedNode {
  const first = kit.token("Keyword", "title")
  const text = written === null ? null : literal(kit, written, value ?? written)
  return kit.node(
    "QuadrantTitleStatement",
    [first.range[0], (text ?? first).range[1]],
    { value: text },
  )
}

/** An `accTitle:` or `accDescr:` line with the text `written`. */
function accessibilityLine(
  kit: Kit,
  keyword: "accTitle" | "accDescr",
  written: string,
): CheckedNode {
  const first = kit.token("Keyword", keyword)
  kit.token("Punctuator", ":")
  const value = literal(kit, written)
  return kit.node(
    keyword === "accTitle"
      ? "QuadrantAccTitleStatement"
      : "QuadrantAccDescrStatement",
    [first.range[0], value.range[1]],
    { value },
  )
}

/** An `accDescr {` block with the text `written`, or none, closed by the `}`. */
function accessibilityBlock(kit: Kit, written: string | null): CheckedNode {
  const first = kit.token("Keyword", "accDescr")
  kit.token("Punctuator", "{")
  const value = written === null ? null : literal(kit, written)
  const close = kit.token("Punctuator", "}")
  return kit.node(
    "QuadrantAccDescrBlockStatement",
    [first.range[0], close.range[1]],
    { value },
  )
}

/** An axis statement: the keyword as written, the axis, the first text, the arrow as written (or none), and the second text. */
function axisStatement(
  kit: Kit,
  keyword: string,
  axis: string,
  start: (kit: Kit) => CheckedNode,
  arrow: string | null,
  end: ((kit: Kit) => CheckedNode) | null,
): CheckedNode {
  const first = kit.token("Keyword", keyword)
  const startNode = start(kit)
  const arrowToken = arrow === null ? null : kit.token("Punctuator", arrow)
  const endNode = end === null ? null : end(kit)
  return kit.node(
    "QuadrantAxisStatement",
    [first.range[0], (endNode ?? arrowToken ?? startNode).range[1]],
    { axis, start: startNode, arrow: arrow !== null, end: endNode },
  )
}

/** A quadrant statement: the keyword as written, the number, and the text made by `makeText`. */
function quadrantStatement(
  kit: Kit,
  keyword: string,
  quadrant: number,
  makeText: (kit: Kit) => CheckedNode,
): CheckedNode {
  const first = kit.token("Keyword", keyword)
  const text = makeText(kit)
  return kit.node(
    "QuadrantQuadrantStatement",
    [first.range[0], text.range[1]],
    { quadrant, text },
  )
}

/** A point: the name, the class name after `:::` (or none), the coordinates, and the styles. */
function pointStatement(
  kit: Kit,
  makeName: (kit: Kit) => CheckedNode,
  className: string | null,
  x: string,
  y: string,
  styles: readonly string[],
): CheckedNode {
  const name = makeName(kit)
  let classNode: CheckedNode | null = null
  if (className !== null) {
    kit.token("Punctuator", ":::")
    const token = kit.token("Identifier", className)
    classNode = kit.node("Identifier", token.range, { name: className })
  }
  kit.token("Punctuator", ":")
  kit.token("Punctuator", "[")
  const xNode = literal(kit, x)
  kit.token("Punctuator", ",")
  const yNode = literal(kit, y)
  const close = kit.token("Punctuator", "]")
  const styleNodes = styles.map((style, index) => {
    if (index > 0) kit.token("Punctuator", ",")
    return literal(kit, style)
  })
  return kit.node(
    "QuadrantPointStatement",
    [name.range[0], (styleNodes.at(-1) ?? { range: close.range }).range[1]],
    { name, className: classNode, x: xNode, y: yNode, styles: styleNodes },
  )
}

/** A `classDef` line: the name, and the styles. */
function classDefStatement(
  kit: Kit,
  name: string,
  styles: readonly string[],
): CheckedNode {
  const first = kit.token("Keyword", "classDef")
  const token = kit.token("Identifier", name)
  const nameNode = kit.node("QuadrantIdentifier", token.range, { name })
  const styleNodes = styles.map((style, index) => {
    if (index > 0) kit.token("Punctuator", ",")
    return literal(kit, style)
  })
  return kit.node(
    "QuadrantClassDefStatement",
    [first.range[0], (styleNodes.at(-1) ?? nameNode).range[1]],
    { name: nameNode, styles: styleNodes },
  )
}

/** Every kind of statement, each in the form of the grammar. */
function everyKind(): Built {
  const source = [
    "quadrantChart",
    "title Two  words",
    "accTitle: a b",
    "accDescr: c d",
    "accDescr {",
    "e",
    " f",
    "}",
    'x-axis Low --> "High" rest',
    "y-axis B -->",
    "Quadrant-1 A",
    'quadrant-2 "B" c',
    'quadrant-3 "`C`" d',
    "quadrant-4 D-E",
    "A: [0.3, 0.6]",
    "B b:::c1: [0x5, 0 3] radius: 10, color: #f00",
    "classDef c1 stroke-width: 2px, stroke-color : #fff : x",
    "",
  ].join("\n")
  return build(source, (kit) => [
    title(kit, "Two  words"),
    accessibilityLine(kit, "accTitle", "a b"),
    accessibilityLine(kit, "accDescr", "c d"),
    accessibilityBlock(kit, "e\n f"),
    axisStatement(
      kit,
      "x-axis",
      "x",
      (k) => words(k, "Low"),
      "-->",
      (k) => labelOf(k, "string", '"High" rest', "High rest"),
    ),
    axisStatement(kit, "y-axis", "y", (k) => words(k, "B"), "-->", null),
    quadrantStatement(kit, "Quadrant-1", 1, (k) => words(k, "A")),
    quadrantStatement(kit, "quadrant-2", 2, (k) =>
      labelOf(k, "string", '"B" c', "B c"),
    ),
    quadrantStatement(kit, "quadrant-3", 3, (k) =>
      labelOf(k, "markdown", '"`C`" d', "C d"),
    ),
    quadrantStatement(kit, "quadrant-4", 4, (k) => words(k, "D-E")),
    pointStatement(kit, (k) => words(k, "A"), null, "0.3", "0.6", []),
    pointStatement(kit, (k) => words(k, "B b"), "c1", "0x5", "0 3", [
      "radius: 10",
      "color: #f00",
    ]),
    classDefStatement(kit, "c1", [
      "stroke-width: 2px",
      "stroke-color : #fff : x",
    ]),
  ])
}

/** The problems that `checkQuadrantTree()` reports for `tree` of `source`, as `where: message`. */
function problemsOf(source: string, tree: CheckedRoot): string[] {
  return checkTree(source, tree).map(
    (problem) => `${problem.where}: ${problem.message}`,
  )
}

/** The first node of `tree` of the type `type`, or of the type `type` with `field` equal to `value`. */
function firstOf(
  tree: CheckedRoot,
  type: string,
  field?: string,
  value?: unknown,
): CheckedNode {
  const found = nodesOf(tree).find(
    (node) =>
      node.type === type && (field === undefined || node[field] === value),
  )
  if (found === undefined) throw new Error(`no ${type}`)
  return found
}

/** A case: a tree, one change of it, and the problem that the check must report. */
interface Case {
  readonly name: string
  readonly built: () => Built
  readonly mutate?: (tree: CheckedRoot) => void
  /** A part of `where: message` of a problem. */
  readonly expected: string
}

/** A body of statements over the source `lines`, made by `statements`. */
function oneStatement(
  lines: string,
  statements: (kit: Kit) => CheckedNode[],
): () => Built {
  return () => build(`quadrantChart\n${lines}\n`, statements)
}

const CASES: readonly Case[] = [
  {
    name: "a label of a kind that is none of the three",
    built: everyKind,
    mutate: (tree) => {
      setField(firstOf(tree, "QuadrantLabel", "kind", "text"), "kind", "word")
    },
    expected: 'the kind is "word", none of text, string, markdown',
  },
  {
    name: "a text whose value is not its written text",
    built: everyKind,
    mutate: (tree) => {
      setField(firstOf(tree, "QuadrantLabel", "kind", "text"), "value", "X")
    },
    expected:
      "the value is not what the kind of the label makes of its written text",
  },
  {
    name: "a string whose value is the content only",
    built: everyKind,
    mutate: (tree) => {
      setField(
        firstOf(tree, "QuadrantLabel", "kind", "string"),
        "value",
        "High",
      )
    },
    expected:
      "the value is not what the kind of the label makes of its written text",
  },
  {
    name: "a markdown string whose kind is string",
    built: everyKind,
    mutate: (tree) => {
      setField(
        firstOf(tree, "QuadrantLabel", "kind", "markdown"),
        "kind",
        "string",
      )
    },
    expected:
      "the value is not what the kind of the label makes of its written text",
  },
  {
    name: "a text of the kind string that is written without quotes",
    built: everyKind,
    mutate: (tree) => {
      setField(firstOf(tree, "QuadrantLabel", "kind", "text"), "kind", "string")
    },
    expected: "is not that of a label of the kind string",
  },
  {
    name: "an empty string with words after it",
    built: oneStatement('x-axis "" a', (kit) => [
      axisStatement(
        kit,
        "x-axis",
        "x",
        (k) => labelOf(k, "string", '"" a', " a"),
        null,
        null,
      ),
    ]),
    expected: "the string string is empty",
  },
  {
    name: "an empty markdown string",
    built: oneStatement('x-axis "``"', (kit) => [
      axisStatement(
        kit,
        "x-axis",
        "x",
        (k) => labelOf(k, "markdown", '"``"', ""),
        null,
        null,
      ),
    ]),
    expected: "the markdown string is empty",
  },
  {
    name: "a string followed by a string",
    built: oneStatement('x-axis "a" "b"', (kit) => [
      axisStatement(
        kit,
        "x-axis",
        "x",
        (k) => labelOf(k, "string", '"a" "b"', 'a "b"'),
        null,
        null,
      ),
    ]),
    expected:
      "after the string string holds a character that the rest of a text does not hold",
  },
  {
    name: "a text that starts with a dash",
    built: oneStatement("x-axis -L", (kit) => [
      axisStatement(kit, "x-axis", "x", (k) => words(k, "-L"), null, null),
    ]),
    expected: "is empty or starts with a character that does not start a word",
  },
  {
    name: "a text with a colon",
    built: oneStatement("x-axis L: M", (kit) => [
      axisStatement(kit, "x-axis", "x", (k) => words(k, "L: M"), null, null),
    ]),
    expected: "holds a character that a text without quotes does not hold",
  },
  {
    name: "a text with a bracket",
    built: oneStatement("x-axis L[M]", (kit) => [
      axisStatement(kit, "x-axis", "x", (k) => words(k, "L[M]"), null, null),
    ]),
    expected: "holds a character that a text without quotes does not hold",
  },
  {
    name: "a string and the words after it as one String token",
    built: oneStatement('quadrant-1 "a" b', (kit) => [
      quadrantStatement(kit, "quadrant-1", 1, (k) => {
        const token = k.token("String", '"a" b')
        return k.node("QuadrantLabel", token.range, {
          kind: "string",
          value: "a b",
        })
      }),
    ]),
    expected: "the kinds of the tokens of the node",
  },
  {
    name: "a string that nothing cuts as a StringFragment token",
    built: oneStatement('quadrant-1 "a" b', (kit) => [
      quadrantStatement(kit, "quadrant-1", 1, (k) => {
        const first = k.token("StringFragment", '"a"')
        const rest = k.token("RawText", "b")
        return k.node("QuadrantLabel", [first.range[0], rest.range[1]], {
          kind: "string",
          value: "a b",
        })
      }),
    ]),
    expected: "the kinds of the tokens of the node",
  },
  {
    name: "the words after a string as a String token",
    built: oneStatement('quadrant-1 "a" b', (kit) => [
      quadrantStatement(kit, "quadrant-1", 1, (k) => {
        const first = k.token("String", '"a"')
        const rest = k.token("String", "b")
        return k.node("QuadrantLabel", [first.range[0], rest.range[1]], {
          kind: "string",
          value: "a b",
        })
      }),
    ]),
    expected: "the kinds of the tokens of the node",
  },
  {
    name: "a string cut by a directive whose rest is a StringFragment token",
    built: oneStatement('quadrant-1 "a%%{x}%%b" c', (kit) => [
      quadrantStatement(kit, "quadrant-1", 1, (k) => {
        const first = k.token("StringFragment", '"a')
        k.directive("%%{x}%%")
        k.token("StringFragment", 'b"')
        const rest = k.token("StringFragment", "c")
        return k.node("QuadrantLabel", [first.range[0], rest.range[1]], {
          kind: "string",
          value: "ab c",
        })
      }),
    ]),
    expected: "the kinds of the tokens of the node",
  },
  {
    name: "a title that is empty",
    built: oneStatement("title T", (kit) => [title(kit, "T")]),
    mutate: (tree) => {
      setField(firstOf(tree, "QuadrantLiteral"), "value", "")
    },
    expected:
      'the title "" is empty, has whitespace at its ends, or holds a line terminator',
  },
  {
    name: "a title with whitespace of Notation at its ends",
    built: oneStatement("title \u00A0T", (kit) => [
      title(kit, "\u00A0T", "\u00A0T"),
    ]),
    expected: "has whitespace at its ends",
  },
  {
    name: "a title with a line feed",
    built: oneStatement("title T", (kit) => [title(kit, "T")]),
    mutate: (tree) => {
      setField(firstOf(tree, "QuadrantLiteral"), "value", "T\nU")
    },
    expected: "or holds a line terminator",
  },
  {
    name: "a text of an accessibility line with a line terminator",
    built: everyKind,
    mutate: (tree) => {
      setField(
        firstOf(tree, "QuadrantAccTitleStatement").value as object,
        "value",
        "a\nb",
      )
    },
    expected: "of a line holds a line terminator",
  },
  {
    name: "a text of an accessibility line with whitespace at its end",
    built: everyKind,
    mutate: (tree) => {
      setField(
        firstOf(tree, "QuadrantAccDescrStatement").value as object,
        "value",
        "c d ",
      )
    },
    expected: "the text is empty or has whitespace at its ends",
  },
  {
    name: "a text of a block with a closing brace",
    built: everyKind,
    mutate: (tree) => {
      setField(
        firstOf(tree, "QuadrantAccDescrBlockStatement").value as object,
        "value",
        "e}",
      )
    },
    expected: "of a block holds a `}`",
  },
  {
    name: "an axis that is neither x nor y",
    built: everyKind,
    mutate: (tree) => {
      setField(firstOf(tree, "QuadrantAxisStatement"), "axis", "z")
    },
    expected: `the axis is "z", none of ${QUADRANT_AXES.join(", ")}`,
  },
  {
    name: "an axis that is not the letter of its keyword",
    built: everyKind,
    mutate: (tree) => {
      setField(firstOf(tree, "QuadrantAxisStatement", "axis", "x"), "axis", "y")
    },
    expected: 'the keyword the statement starts with: "x-axis", not "y-axis"',
  },
  {
    name: "a second text without the arrow",
    built: everyKind,
    mutate: (tree) => {
      setField(
        firstOf(tree, "QuadrantAxisStatement", "axis", "x"),
        "arrow",
        false,
      )
    },
    expected: "the statement has a second text and no arrow",
  },
  {
    name: "an arrow that is not written",
    built: oneStatement("y-axis B", (kit) => [
      axisStatement(kit, "y-axis", "y", (k) => words(k, "B"), null, null),
    ]),
    mutate: (tree) => {
      setField(firstOf(tree, "QuadrantAxisStatement"), "arrow", true)
    },
    expected: "after the first text is not the arrow",
  },
  {
    name: "an arrow that the statement does not have, though one is written",
    built: oneStatement("y-axis B -->", (kit) => [
      axisStatement(kit, "y-axis", "y", (k) => words(k, "B"), "-->", null),
    ]),
    mutate: (tree) => {
      setField(firstOf(tree, "QuadrantAxisStatement"), "arrow", false)
    },
    expected: "the statement has no arrow and",
  },
  {
    name: "a quadrant that is none of 1 to 4",
    built: everyKind,
    mutate: (tree) => {
      setField(firstOf(tree, "QuadrantQuadrantStatement"), "quadrant", 5)
    },
    expected: "the quadrant is 5, none of 1, 2, 3, 4",
  },
  {
    name: "a quadrant that is not the digit of its keyword",
    built: everyKind,
    mutate: (tree) => {
      setField(
        firstOf(tree, "QuadrantQuadrantStatement", "quadrant", 2),
        "quadrant",
        3,
      )
    },
    expected:
      'the keyword the statement starts with: "quadrant-2", not "quadrant-3"',
  },
  {
    name: "a class name with a dash",
    built: everyKind,
    mutate: (tree) => {
      setField(firstOf(tree, "Identifier"), "name", "c-1")
    },
    expected: "is none of ASCII letters, digits, and `_`",
  },
  {
    name: "a coordinate over one",
    built: everyKind,
    mutate: (tree) => {
      setField(
        firstOf(tree, "QuadrantPointStatement").x as object,
        "value",
        "1.5",
      )
    },
    expected: 'the coordinate "1.5" is none that the lexer reads',
  },
  {
    name: "a coordinate with a line feed in place of the point",
    built: everyKind,
    mutate: (tree) => {
      setField(
        firstOf(tree, "QuadrantPointStatement").y as object,
        "value",
        "0\n3",
      )
    },
    expected: "is none that the lexer reads",
  },
  {
    name: "a style that is not one the Db takes",
    built: everyKind,
    mutate: (tree) => {
      const [style] = firstOf(tree, "QuadrantClassDefStatement")
        .styles as CheckedNode[]
      setField(style, "value", "fill: #f00")
    },
    expected: 'the style "fill: #f00" is none that the Db takes',
  },
  {
    name: "a radius with a unit",
    built: oneStatement("A: [0.3, 0.6] radius: 10px", (kit) => [
      pointStatement(kit, (k) => words(k, "A"), null, "0.3", "0.6", [
        "radius: 10px",
      ]),
    ]),
    expected: 'the style "radius: 10px" is none that the Db takes',
  },
  {
    name: "a colour that is not a hex code",
    built: oneStatement("A: [0.3, 0.6] color: red", (kit) => [
      pointStatement(kit, (k) => words(k, "A"), null, "0.3", "0.6", [
        "color: red",
      ]),
    ]),
    expected: 'the style "color: red" is none that the Db takes',
  },
  {
    name: "a stroke width without the unit",
    built: oneStatement("A: [0.3, 0.6] stroke-width: 3", (kit) => [
      pointStatement(kit, (k) => words(k, "A"), null, "0.3", "0.6", [
        "stroke-width: 3",
      ]),
    ]),
    expected: 'the style "stroke-width: 3" is none that the Db takes',
  },
  {
    name: "a name of a style in upper case",
    built: oneStatement("A: [0.3, 0.6] RADIUS: 10", (kit) => [
      pointStatement(kit, (k) => words(k, "A"), null, "0.3", "0.6", [
        "RADIUS: 10",
      ]),
    ]),
    expected: 'the style "RADIUS: 10" is none that the Db takes',
  },
  {
    name: "a style without a colon",
    built: oneStatement("A: [0.3, 0.6] radius", (kit) => [
      pointStatement(kit, (k) => words(k, "A"), null, "0.3", "0.6", ["radius"]),
    ]),
    expected: 'the style "radius" is none that the Db takes',
  },
  {
    name: "a style with a dot",
    built: oneStatement("A: [0.3, 0.6] radius: 1.5", (kit) => [
      pointStatement(kit, (k) => words(k, "A"), null, "0.3", "0.6", [
        "radius: 1.5",
      ]),
    ]),
    expected: "holds a character that a style does not hold",
  },
  {
    name: "a style with whitespace at its end",
    built: oneStatement("A: [0.3, 0.6] radius: 10 ", (kit) => [
      pointStatement(kit, (k) => words(k, "A"), null, "0.3", "0.6", [
        "radius: 10 ",
      ]),
    ]),
    expected: "has whitespace at its ends",
  },
  {
    name: "the name of a class with an underscore",
    built: oneStatement("classDef c_1 color: #f00", (kit) => [
      classDefStatement(kit, "c_1", ["color: #f00"]),
    ]),
    expected:
      'the name "c_1" is empty or holds a character that the name of a class does not hold',
  },
  {
    name: "the name of a class with a space",
    built: oneStatement("classDef c 1 color: #f00", (kit) => [
      classDefStatement(kit, "c 1", ["color: #f00"]),
    ]),
    expected: "holds a character that the name of a class does not hold",
  },
  {
    name: "a classDef without styles",
    built: oneStatement("classDef c1", (kit) => [
      classDefStatement(kit, "c1", []),
    ]),
    expected: "the list styles is empty",
  },
  {
    name: "a literal where a label is",
    built: everyKind,
    mutate: (tree) => {
      const axis = firstOf(tree, "QuadrantAxisStatement")
      const { kind: _kind, ...start } = axis.start as Record<string, unknown>
      setField(axis, "start", { ...start, type: "QuadrantLiteral" })
    },
    expected: "the field start holds a QuadrantLiteral, not a QuadrantLabel",
  },
  {
    name: "two statements on a line with no semicolon",
    built: oneStatement("quadrant-1 A x-axis L", (kit) => [
      quadrantStatement(kit, "quadrant-1", 1, (k) => words(k, "A")),
      axisStatement(kit, "x-axis", "x", (k) => words(k, "L"), null, null),
    ]),
    expected: "follows the statement on its line with no `;` between them",
  },
  {
    name: "a block with text followed by a space and a statement",
    built: oneStatement("accDescr {x} title T", (kit) => [
      accessibilityBlock(kit, "x"),
      title(kit, "T"),
    ]),
    expected: "before the end of its line",
  },
  {
    name: "a block with text followed by a space at the end of its line",
    built: () =>
      build("quadrantChart\naccDescr {x} \n", (kit) => [
        accessibilityBlock(kit, "x"),
      ]),
    expected: "the block is followed by",
  },
  {
    name: "a block with text followed by an empty block, a space after",
    built: oneStatement("accDescr {x}accDescr {} ", (kit) => [
      accessibilityBlock(kit, "x"),
      accessibilityBlock(kit, null),
    ]),
    expected: "the block is followed by",
  },
]

/** Registers a test for each case: the tree after the change reports the problem the case expects. */
function itFailsEach(cases: readonly Case[]): void {
  for (const testCase of cases) {
    it(`fails ${testCase.name}`, () => {
      const { source, tree } = testCase.built()
      const broken = copyOf(tree)
      if (testCase.mutate === undefined) {
        // The tree is broken as it is built; the same tree changed in nothing
        // reports the problem.
      } else {
        expect(problemsOf(source, tree)).toEqual([])
        testCase.mutate(broken)
      }
      const problems = problemsOf(source, broken)
      expect(
        problems.some((problem) => problem.includes(testCase.expected)),
        JSON.stringify(problems),
      ).toBe(true)
    })
  }
}

describe("the check of a quadrant chart tree made by hand", () => {
  it("passes a tree of every kind of statement", () => {
    const { source, tree } = everyKind()
    expect(problemsOf(source, tree)).toEqual([])
  })

  it("passes the examples that the grammar allows on one line", () => {
    for (const [lines, statements] of [
      [
        "accDescr {x}accDescr {}accDescr {};title T",
        (kit: Kit) => {
          const blocks = [
            accessibilityBlock(kit, "x"),
            accessibilityBlock(kit, null),
            accessibilityBlock(kit, null),
          ]
          kit.token("Punctuator", ";")
          return [...blocks, title(kit, "T")]
        },
      ],
      ["title \u00A0T\u3000", (kit: Kit) => [title(kit, "\u00A0T\u3000", "T")]],
      [
        "accDescr {x}%% c\ntitle T",
        (kit: Kit) => {
          const block = accessibilityBlock(kit, "x")
          kit.comment("%%", "%% c")
          return [block, title(kit, "T")]
        },
      ],
      [
        "quadrant-1 a#35;b",
        (kit: Kit) => [
          quadrantStatement(kit, "quadrant-1", 1, (k) => words(k, "a#35;b")),
        ],
      ],
      [
        'quadrant-1 "a%%{x}%%b" c',
        (kit: Kit) => [
          quadrantStatement(kit, "quadrant-1", 1, (k) => {
            const first = k.token("StringFragment", '"a')
            k.directive("%%{x}%%")
            k.token("StringFragment", 'b"')
            const rest = k.token("RawText", "c")
            return k.node("QuadrantLabel", [first.range[0], rest.range[1]], {
              kind: "string",
              value: "ab c",
            })
          }),
        ],
      ],
      [
        "accDescr {} x-axis L",
        (kit: Kit) => [
          accessibilityBlock(kit, null),
          axisStatement(kit, "x-axis", "x", (k) => words(k, "L"), null, null),
        ],
      ],
      [
        "quadrant-1 A accDescr {}",
        (kit: Kit) => [
          quadrantStatement(kit, "quadrant-1", 1, (k) => words(k, "A")),
          accessibilityBlock(kit, null),
        ],
      ],
    ] as const) {
      const { source, tree } = oneStatement(lines, statements)()
      expect(problemsOf(source, tree), lines).toEqual([])
    }
  })

  itFailsEach(CASES)
})

describe("the coordinates that the lexer reads", () => {
  it("are 0, 1, and 0 with one character and digits", () => {
    for (const written of [
      "0",
      "1",
      "0.3",
      "0.30",
      "0x5",
      "0 3",
      "0,3",
      "0;3",
      "0#3",
      '0"3',
      "0é3",
    ]) {
      expect(isCoordinate(written), written).toBe(true)
    }
    for (const written of [
      "",
      "2",
      "10",
      "00",
      "01",
      ".3",
      "-0.3",
      "+0.3",
      "0.",
      "0..5",
      "0.6e1",
      "0\n3",
      `0${String.fromCharCode(0x2028)}3`,
      "1.5",
      "a",
    ]) {
      expect(isCoordinate(written), written).toBe(false)
    }
  })
})

/** The words of `text` that are names of node types: a capital letter and a lower case letter, in a run of letters. */
function typeNamesIn(text: string): string[] {
  return [...text.matchAll(/[A-Z][A-Za-z]*[a-z][A-Za-z]*/gu)].map(
    (match) => match[0],
  )
}

/** The type names that the sentence `**QuadrantStatement** is a …` of ast/quadrant.md lists. */
function statementTypesOfDocument(): string[] {
  const document = readTreeDocuments().find((text) =>
    text.includes("**QuadrantStatement** is a"),
  )
  if (document === undefined) throw new Error("no QuadrantStatement")
  const start = document.indexOf("**QuadrantStatement** is a")
  const sentence = document.slice(start, document.indexOf(".\n", start))
  return typeNamesIn(sentence.slice("**QuadrantStatement**".length))
}

/** The node types that the Type column cell `cell` names, with `QuadrantStatement` as the statements it stands for. */
function typesOfCell(cell: string, statements: readonly string[]): string[] {
  return typeNamesIn(cell).flatMap((type) =>
    type === "QuadrantStatement" ? statements : [type],
  )
}

describe("the tables of the check of a quadrant chart tree", () => {
  const statements = statementTypesOfDocument()

  it("give the child types that the Type column of ast/quadrant.md gives", () => {
    const documented = readFieldTables()
    const differing: string[] = []
    for (const [type, fields] of Object.entries(QUADRANT_CHILD_TYPES)) {
      for (const [fieldName, allowed] of Object.entries(fields)) {
        const cell = documented.get(type)?.get(fieldName) ?? ""
        if (
          JSON.stringify(typesOfCell(cell, statements).sort()) !==
          JSON.stringify([...allowed].sort())
        ) {
          differing.push(`${type}.${fieldName}: ${cell}`)
        }
      }
    }
    expect(differing).toEqual([])
  })

  it("give a child type for every field of the quadrant types that holds a node", () => {
    const missing: string[] = []
    for (const [type, fields] of readFieldTables()) {
      if (!type.startsWith("Quadrant")) continue
      for (const [fieldName, cell] of fields) {
        if (
          typesOfCell(cell, statements).length > 0 &&
          QUADRANT_CHILD_TYPES[type]?.[fieldName] === undefined
        ) {
          missing.push(`${type}.${fieldName}: ${cell}`)
        }
      }
    }
    expect(missing).toEqual([])
  })

  it("give the words that the Meaning column of ast/quadrant.md gives for the axis and the kind of a label", () => {
    const meanings = readFieldMeanings()

    /** The words in backticks of the Meaning of a field. */
    function wordsOf(type: string, fieldName: string): string[] {
      return [
        ...(meanings.get(type)?.get(fieldName) ?? "").matchAll(/`([^`]+)`/gu),
      ].map((match) => match[1] ?? "")
    }

    expect(wordsOf("QuadrantAxisStatement", "axis")).toEqual([...QUADRANT_AXES])
    expect(wordsOf("QuadrantLabel", "kind")).toEqual([...QUADRANT_LABEL_KINDS])
  })

  it("list the names of the styles that diagrams/quadrant.md gives", () => {
    const document = readFileSync(
      path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        "../../spec/docs/diagrams/quadrant.md",
      ),
      "utf8",
    )
    for (const name of QUADRANT_STYLE_NAMES) {
      expect(document, name).toContain(`\`${name}\``)
    }
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

const OWN_KIND = "the kind of a token that the node writes itself"
const HULL =
  "the range, which runs from the first of its tokens and child nodes to the last"
const LAYOUT =
  "the tokens that the node writes itself and its child nodes, in source order"
const KINDS = "the kinds of the tokens of the node"

const RECORDED_CASES: readonly MutationCase[] = [
  {
    name: "the header as a RawText token",
    fixture: "db-point-plain",
    mutate: retypeIn("QuadrantDiagram", "Keyword", "quadrantChart", "RawText"),
    expected: `${OWN_KIND}: "RawText", not "Keyword"`,
  },
  {
    name: "an arrow as a RawText token",
    fixture: "db-x-axis-both",
    mutate: retypeIn("QuadrantAxisStatement", "Punctuator", "-->", "RawText"),
    expected: `${OWN_KIND}: "RawText", not "Punctuator"`,
  },
  {
    name: "the colon of a point as a Keyword token",
    fixture: "db-point-plain",
    mutate: retypeIn("QuadrantPointStatement", "Punctuator", ":", "Keyword"),
    expected: `${OWN_KIND}: "Keyword", not "Punctuator"`,
  },
  {
    name: "a `;` as a Keyword token",
    fixture: "db-acc-descr-block-empty-block-then-semicolon",
    mutate: retypeIn("QuadrantDiagram", "Punctuator", ";", "Keyword"),
    expected: `${OWN_KIND}: "Keyword", not "Punctuator"`,
  },
  {
    name: "the number of a quadrant that is not the digit of its keyword",
    fixture: "db-quadrant-all-four",
    mutate: setIn("QuadrantQuadrantStatement", "quadrant", 2),
    expected:
      'the keyword the statement starts with: "quadrant-1", not "quadrant-2"',
  },
  {
    name: "the axis of an x-axis statement as y",
    fixture: "db-x-axis-both",
    mutate: setIn("QuadrantAxisStatement", "axis", "y"),
    expected: 'the keyword the statement starts with: "x-axis", not "y-axis"',
  },
  {
    name: "an arrow that is written, set to false",
    fixture: "db-x-axis-both",
    mutate: setIn("QuadrantAxisStatement", "arrow", false),
    expected: "the statement has a second text and no arrow",
  },
  {
    name: "a text without quotes whose kind is string",
    fixture: "db-quadrant-all-four",
    mutate: setIn("QuadrantLabel", "kind", "string"),
    expected: "is not that of a label of the kind string",
  },
  {
    name: "a title whose value keeps a no-break space at its start",
    fixture: "db-title-nbsp-before-text",
    mutate: setIn("QuadrantLiteral", "value", "\u00A0T"),
    expected: "has whitespace at its ends",
  },
  {
    name: "a string cut by a directive as RawText tokens",
    fixture: "db-directive-in-quotes",
    mutate: retypeIn("QuadrantLabel", "StringFragment", null, "RawText"),
    expected: KINDS,
  },
  {
    name: "the name of a class as a RawText token",
    fixture: "db-classdef-color",
    mutate: retypeIn("QuadrantIdentifier", "Identifier", null, "RawText"),
    expected: KINDS,
  },
  {
    name: "a statement whose range stops before its text",
    fixture: "db-title-twice",
    mutate: (root) => {
      const statement = firstNode(root, "QuadrantTitleStatement")
      setField(statement, "range", [statement.range[0], statement.range[1] - 1])
    },
    expected: HULL,
  },
  {
    name: "an accessibility statement without its colon",
    fixture: "db-acc-title-plain",
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
    name: "a point without the comma between its coordinates",
    fixture: "db-point-plain",
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
]

describe("the check of a quadrant chart tree against the recorded trees", () => {
  for (const mutation of RECORDED_CASES) {
    it(`passes the recorded tree of ${mutation.fixture} and fails ${mutation.name}`, () => {
      const { base, mutated } = problemsOfMutation("quadrant", mutation)
      expect(base).toEqual([])
      expect(
        says(mutated, mutation.expected),
        JSON.stringify(mutated, null, 1),
      ).toBe(true)
    })
  }
})
