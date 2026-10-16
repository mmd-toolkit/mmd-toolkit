import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import { nodesOf } from "../src/check-tree/walk.ts"
import {
  MINDMAP_CHILD_TYPES,
  MINDMAP_FIELD_WORDS,
} from "../src/check-tree/mindmap.ts"
import type { CheckedNode, CheckedRoot } from "../src/check-tree/types.ts"
import type { BrokenCase, Built, Kit } from "./check-tree-built.ts"
import {
  buildTree,
  itFailsEach,
  nodeWith,
  tokenWith,
} from "./check-tree-built.ts"
import type { MutationCase } from "./check-tree-recorded.ts"
import {
  firstNode,
  problemsOf,
  retypeIn,
  says,
  setEnd,
  setField,
} from "./check-tree-recorded.ts"
import { readFieldMeanings, readFieldTables } from "./spec-field-tables.ts"

// The trees of a mindmap diagram made by hand: they are the smallest trees
// that hold the case they are about (see `check-tree-built.ts`). The tokens of
// the header and of `::icon(` are `Keyword` tokens, those of the openers, the
// closers, `)`, and `:::` are `Punctuator` tokens, those of a text are `RawText`
// tokens, and those of a string are `String` tokens
// (parser/docs/tokens/mindmap.md).

const LINE_SEPARATOR = "\u2028"
const PARAGRAPH_SEPARATOR = "\u2029"
const IDEOGRAPHIC_SPACE = "\u3000"

/** The label of a shape: its kind, its source (the delimiters of a string included), and its value. */
interface LabelSpec {
  readonly kind: "text" | "string" | "markdown"
  readonly source: string
  readonly value: string
}

/** A shape: the text of its opener, its label, and the text of its closer. */
interface ShapeSpec {
  readonly opener: string
  readonly label: LabelSpec
  readonly closer: string
}

/** An icon line or a class line; the icon line has the keyword `::icon(` in the case it is written in. */
type DecorationSpec =
  | { readonly icon: string; readonly keyword?: string }
  | { readonly cssClass: string }

/** A node line: its indentation, its node text, its shape, the icon and class lines after it, and the lines below it. */
interface LineSpec {
  readonly indent: number
  readonly id?: string
  readonly shape?: ShapeSpec
  readonly decorations?: readonly DecorationSpec[]
  readonly children?: readonly LineSpec[]
}

/** A text label: its `RawText` token is `text`. */
function textLabel(text: string): LabelSpec {
  return { kind: "text", source: text, value: text }
}

/** A string label with the content `content`. */
function stringLabel(content: string): LabelSpec {
  return { kind: "string", source: `"${content}"`, value: content }
}

/** A markdown string label with the content `content`. */
function markdownLabel(content: string): LabelSpec {
  return { kind: "markdown", source: `"\`${content}\`"`, value: content }
}

/** A mindmap tree: the header `mindmap` and the root that the test builds, or none. */
function build(source: string, makeNodes: (kit: Kit) => CheckedNode[]): Built {
  return buildTree(
    {
      header: "mindmap",
      diagramType: "mindmap",
      bodyType: "MindmapDiagram",
      bodyFields: (nodes) => ({ root: nodes[0] ?? null }),
    },
    source,
    makeNodes,
  )
}

/** A text without quotes: its `RawText` token, and the `MindmapLiteral` that holds it. */
function literal(kit: Kit, text: string, value = text): CheckedNode {
  const token = kit.token("RawText", text)
  return kit.node("MindmapLiteral", token.range, { value })
}

/** The label of a shape: its token, and the `MindmapLabel` that holds it. */
function labelOf(kit: Kit, spec: LabelSpec): CheckedNode {
  const token = kit.token(
    spec.kind === "text" ? "RawText" : "String",
    spec.source,
  )
  return kit.node("MindmapLabel", token.range, {
    kind: spec.kind,
    value: spec.value,
  })
}

/** A shape: the tokens of its opener and closer, and the label between them. */
function shapeOf(kit: Kit, spec: ShapeSpec): CheckedNode {
  const opener = kit.token("Punctuator", spec.opener)
  const textLabelNode = labelOf(kit, spec.label)
  const closer = kit.token("Punctuator", spec.closer)
  return kit.node("MindmapShape", [opener.range[0], closer.range[1]], {
    opener: spec.opener,
    closer: spec.closer,
    label: textLabelNode,
  })
}

/** An icon line or a class line. */
function decorationOf(kit: Kit, spec: DecorationSpec): CheckedNode {
  if ("icon" in spec) {
    const open = kit.token("Keyword", spec.keyword ?? "::icon(")
    const icon = literal(kit, spec.icon)
    const close = kit.token("Punctuator", ")")
    return kit.node("MindmapIconStatement", [open.range[0], close.range[1]], {
      icon,
    })
  }
  const mark = kit.token("Punctuator", ":::")
  const cssClass = literal(kit, spec.cssClass)
  return kit.node("MindmapClassStatement", [mark.range[0], cssClass.range[1]], {
    cssClass,
  })
}

/** A node that runs from its first part to the last of its parts, the lines below it included. */
function nodeFrom(
  kit: Kit,
  indent: number,
  parts: {
    readonly id: CheckedNode | null
    readonly shape: CheckedNode | null
    readonly decorations: CheckedNode[]
    readonly children: CheckedNode[]
  },
): CheckedNode {
  const all = [
    parts.id,
    parts.shape,
    ...parts.decorations,
    ...parts.children,
  ].filter((part): part is CheckedNode => part !== null)
  const first = all[0]
  const last = all.at(-1)
  if (first === undefined || last === undefined) throw new Error("no part")
  return kit.node("MindmapNode", [first.range[0], last.range[1]], {
    indent,
    ...parts,
  })
}

/** The node of `spec` and the lines below it, made in source order. */
function nodeOf(kit: Kit, spec: LineSpec): CheckedNode {
  const id = spec.id === undefined ? null : literal(kit, spec.id)
  const shape = spec.shape === undefined ? null : shapeOf(kit, spec.shape)
  const decorations = (spec.decorations ?? []).map((decoration) =>
    decorationOf(kit, decoration),
  )
  const children = (spec.children ?? []).map((child) => nodeOf(kit, child))
  return nodeFrom(kit, spec.indent, { id, shape, decorations, children })
}

/** The tree of `source` whose lines are `root`. */
function mindmap(source: string, root: LineSpec): Built {
  return build(source, (kit) => [nodeOf(kit, root)])
}

/** Every kind of line: a node text and a shape with trailing whitespace in the text, an icon and a class, three levels, a sibling after a deeper line, a shape alone with a string label and the closer `-)`. */
function everyKindOfLine(): Built {
  return mindmap(
    'mindmap\n  root((r))\n    a (b)\n    ::icon(fa book)\n    :::big red\n      c\n    d\n    -)"s"-)',
    {
      indent: 2,
      id: "root",
      shape: { opener: "((", label: textLabel("r"), closer: "))" },
      children: [
        {
          indent: 4,
          id: "a ",
          shape: { opener: "(", label: textLabel("b"), closer: ")" },
          decorations: [{ icon: "fa book" }, { cssClass: "big red" }],
          children: [{ indent: 6, id: "c" }],
        },
        { indent: 4, id: "d" },
        {
          indent: 4,
          shape: { opener: "-)", label: stringLabel("s"), closer: "-)" },
        },
      ],
    },
  )
}

/** The header and a line feed after it: no root. */
function headerOnly(): Built {
  return build("mindmap\n", () => [])
}

/** The root on the line of the header, after two spaces; its child is indented by four. */
function rootOnTheHeaderLine(): Built {
  return mindmap("mindmap  root\n    a", {
    indent: 2,
    id: "root",
    children: [{ indent: 4, id: "a" }],
  })
}

/** The root right after the header, with a shape. */
function rootRightAfterTheHeader(): Built {
  return mindmap("mindmap(x)\n  a", {
    indent: 0,
    shape: { opener: "(", label: textLabel("x"), closer: ")" },
    children: [{ indent: 2, id: "a" }],
  })
}

/** The example of diagrams/mindmap.md, Indentation and parents: `a` and `b` are children of the root, `c` a child of `b`. */
function indentationExample(): Built {
  return mindmap("mindmap\nroot\n    a\n  b\n    c", {
    indent: 0,
    id: "root",
    children: [
      { indent: 4, id: "a" },
      { indent: 2, id: "b", children: [{ indent: 4, id: "c" }] },
    ],
  })
}

/** A tab counts as one character: `  b` after `\ta` is a child of `a`. */
function tabIsOneCharacter(): Built {
  return mindmap("mindmap\nr\n\ta\n  b", {
    indent: 0,
    id: "r",
    children: [{ indent: 1, id: "a", children: [{ indent: 2, id: "b" }] }],
  })
}

/** Every other whitespace character counts as one: a U+3000 for the root and for its child. */
function ideographicSpaceIsOneCharacter(): Built {
  return mindmap(
    `mindmap\n${IDEOGRAPHIC_SPACE}r\n${IDEOGRAPHIC_SPACE}${IDEOGRAPHIC_SPACE}a`,
    {
      indent: 1,
      id: "r",
      children: [{ indent: 2, id: "a" }],
    },
  )
}

/** The kinds of labels: whitespace kept, a text over lines, a string, a markdown string, and the closers that do not match the openers. */
function labelsAndShapes(): Built {
  return mindmap(
    'mindmap\n  r\n    a[ x ]\n    b[x\ny]\n    c["q"]\n    d["`m`"]\n    e[t)\n    f((u)\n    g(v))\n    h(w]\n    i(-z-)\n    j{{k}}\n    l))n((',
    {
      indent: 2,
      id: "r",
      children: [
        {
          indent: 4,
          id: "a",
          shape: { opener: "[", label: textLabel(" x "), closer: "]" },
        },
        {
          indent: 4,
          id: "b",
          shape: { opener: "[", label: textLabel("x\ny"), closer: "]" },
        },
        {
          indent: 4,
          id: "c",
          shape: { opener: "[", label: stringLabel("q"), closer: "]" },
        },
        {
          indent: 4,
          id: "d",
          shape: { opener: "[", label: markdownLabel("m"), closer: "]" },
        },
        {
          indent: 4,
          id: "e",
          shape: { opener: "[", label: textLabel("t"), closer: ")" },
        },
        {
          indent: 4,
          id: "f",
          shape: { opener: "((", label: textLabel("u"), closer: ")" },
        },
        {
          indent: 4,
          id: "g",
          shape: { opener: "(", label: textLabel("v"), closer: "))" },
        },
        {
          indent: 4,
          id: "h",
          shape: { opener: "(", label: textLabel("w"), closer: "]" },
        },
        {
          indent: 4,
          id: "i",
          shape: { opener: "(-", label: textLabel("z-"), closer: ")" },
        },
        {
          indent: 4,
          id: "j",
          shape: { opener: "{{", label: textLabel("k"), closer: "}}" },
        },
        {
          indent: 4,
          id: "l",
          shape: { opener: "))", label: textLabel("n"), closer: "((" },
        },
      ],
    },
  )
}

/** Shapes alone, each with a label of one kind; the opener `-)` and the closers `(-` and `-)`. */
function shapesAlone(): Built {
  return mindmap(
    'mindmap\n  r\n    [text]\n    ((circle))\n    -)x(-\n    ["s"-)\n    (-m(-',
    {
      indent: 2,
      id: "r",
      children: [
        {
          indent: 4,
          shape: { opener: "[", label: textLabel("text"), closer: "]" },
        },
        {
          indent: 4,
          shape: { opener: "((", label: textLabel("circle"), closer: "))" },
        },
        {
          indent: 4,
          shape: { opener: "-)", label: textLabel("x"), closer: "(-" },
        },
        {
          indent: 4,
          shape: { opener: "[", label: stringLabel("s"), closer: "-)" },
        },
        {
          indent: 4,
          shape: { opener: "(-", label: textLabel("m"), closer: "(-" },
        },
      ],
    },
  )
}

/** Node texts that look like something else: a keyword with a suffix, a keyword inside, other characters. */
function nodeTextsThatLookLikeOtherUnits(): Built {
  return mindmap(
    'mindmap\n  r\n    mindmapx\n    a mindmap\n    mindmap_1\n    ::x\n    -x\n    %x\n    a: b # c\n    a"b\n    a:::b\n    a]b',
    {
      indent: 2,
      id: "r",
      children: [
        { indent: 4, id: "mindmapx" },
        { indent: 4, id: "a mindmap" },
        { indent: 4, id: "mindmap_1" },
        { indent: 4, id: "::x" },
        { indent: 4, id: "-x" },
        { indent: 4, id: "%x" },
        { indent: 4, id: "a: b # c" },
        { indent: 4, id: 'a"b' },
        { indent: 4, id: "a:::b" },
        { indent: 4, id: "a]b" },
      ],
    },
  )
}

/** Whitespace at the end of a node text, kept: at the end of a line, and at the end of the text. */
function trailingWhitespace(): Built {
  return mindmap("mindmap\n  root   \n    b  ", {
    indent: 2,
    id: "root   ",
    children: [{ indent: 4, id: "b  " }],
  })
}

/** Icon and class lines: the keyword in upper case, whitespace at both ends, a line feed in an icon, three decorations of one node. */
function decorationsOfOneNode(): Built {
  return mindmap(
    "mindmap\n  r\n    ::ICON( x )\n    :::  big \n    ::icon(i\nj)",
    {
      indent: 2,
      id: "r",
      decorations: [
        { icon: " x ", keyword: "::ICON(" },
        { cssClass: "  big " },
        { icon: "i\nj" },
      ],
    },
  )
}

/** An icon line before the line of a child decorates the node before it, and a class line after a child, with the indentation of the root, decorates the child. */
function decorationsAmongLines(): Built {
  return mindmap("mindmap\nr\n  ::icon(x)\n    a\n:::c", {
    indent: 0,
    id: "r",
    decorations: [{ icon: "x" }],
    children: [{ indent: 4, id: "a", decorations: [{ cssClass: "c" }] }],
  })
}

/** A class that ends at a U+2028 before the line feed. */
function classEndsAtLineSeparator(): Built {
  return mindmap(`mindmap\nroot\n  :::a${LINE_SEPARATOR}\n  b`, {
    indent: 0,
    id: "root",
    decorations: [{ cssClass: "a" }],
    children: [{ indent: 2, id: "b" }],
  })
}

/** A class that ends at a U+2029 at the end of the text. */
function classEndsAtParagraphSeparator(): Built {
  return mindmap(`mindmap\nroot\n  :::a${PARAGRAPH_SEPARATOR}`, {
    indent: 0,
    id: "root",
    decorations: [{ cssClass: "a" }],
  })
}

/** A directive in the indentation of a node: the indentation is counted without it. */
function directiveInIndentation(): Built {
  return build("mindmap\nroot\n %%{init: {}}%% a", (kit) => {
    const id = literal(kit, "root")
    kit.directive("%%{init: {}}%%")
    const child = literal(kit, "a")
    return [
      nodeFrom(kit, 0, {
        id,
        shape: null,
        decorations: [],
        children: [
          nodeFrom(kit, 2, {
            id: child,
            shape: null,
            decorations: [],
            children: [],
          }),
        ],
      }),
    ]
  })
}

/** A directive inside a node text: the node text is the text without it, in two `RawText` tokens. */
function directiveInNodeText(): Built {
  return build("mindmap\n  a%%{x}%%b", (kit) => {
    const before = kit.token("RawText", "a")
    kit.directive("%%{x}%%")
    const after = kit.token("RawText", "b")
    const id = kit.node("MindmapLiteral", [before.range[0], after.range[1]], {
      value: "ab",
    })
    return [
      nodeFrom(kit, 2, { id, shape: null, decorations: [], children: [] }),
    ]
  })
}

/** A directive inside a text label, and one inside a string label, which it cuts into `StringFragment` tokens. */
function directiveInLabels(): Built {
  return build('mindmap\n  r\n    a[x%%{x}%%y]\n    b["x%%{x}%%y"]', (kit) => {
    const root = literal(kit, "r")
    const textId = literal(kit, "a")
    const textOpener = kit.token("Punctuator", "[")
    const textBefore = kit.token("RawText", "x")
    kit.directive("%%{x}%%")
    const textAfter = kit.token("RawText", "y")
    const textCloser = kit.token("Punctuator", "]")
    const textShape = kit.node(
      "MindmapShape",
      [textOpener.range[0], textCloser.range[1]],
      {
        opener: "[",
        closer: "]",
        label: kit.node(
          "MindmapLabel",
          [textBefore.range[0], textAfter.range[1]],
          { kind: "text", value: "xy" },
        ),
      },
    )
    const textLine = nodeFrom(kit, 4, {
      id: textId,
      shape: textShape,
      decorations: [],
      children: [],
    })
    const stringId = literal(kit, "b")
    const stringOpener = kit.token("Punctuator", "[")
    const stringBefore = kit.token("StringFragment", '"x')
    kit.directive("%%{x}%%")
    const stringAfter = kit.token("StringFragment", 'y"')
    const stringCloser = kit.token("Punctuator", "]")
    const stringShape = kit.node(
      "MindmapShape",
      [stringOpener.range[0], stringCloser.range[1]],
      {
        opener: "[",
        closer: "]",
        label: kit.node(
          "MindmapLabel",
          [stringBefore.range[0], stringAfter.range[1]],
          { kind: "string", value: "xy" },
        ),
      },
    )
    const stringLine = nodeFrom(kit, 4, {
      id: stringId,
      shape: stringShape,
      decorations: [],
      children: [],
    })
    return [
      nodeFrom(kit, 2, {
        id: root,
        shape: null,
        decorations: [],
        children: [textLine, stringLine],
      }),
    ]
  })
}

/** Comment lines and diagram comments: after the header, after a node text (which keeps `%%`), alone on a line, after a shape. */
function commentsAmongLines(): Built {
  return build("mindmap\n%% one\nr %% not\n%%\n  a[x] %% two\n    b", (kit) => {
    kit.comment("%%", "%% one")
    const root = literal(kit, "r %% not")
    kit.comment("%%", "%%")
    const a = literal(kit, "a")
    const shape = shapeOf(kit, {
      opener: "[",
      label: textLabel("x"),
      closer: "]",
    })
    kit.comment("%%", "%% two")
    const b = literal(kit, "b")
    return [
      nodeFrom(kit, 0, {
        id: root,
        shape: null,
        decorations: [],
        children: [
          nodeFrom(kit, 2, {
            id: a,
            shape,
            decorations: [],
            children: [
              nodeFrom(kit, 4, {
                id: b,
                shape: null,
                decorations: [],
                children: [],
              }),
            ],
          }),
        ],
      }),
    ]
  })
}

/** A comment line that is indented: the indentation of the node after it is that of its own line. */
function indentedCommentLine(): Built {
  return build("mindmap\nr\n   %% c\n  a", (kit) => {
    const root = literal(kit, "r")
    kit.comment("%%", "%% c")
    const a = literal(kit, "a")
    return [
      nodeFrom(kit, 0, {
        id: root,
        shape: null,
        decorations: [],
        children: [
          nodeFrom(kit, 2, {
            id: a,
            shape: null,
            decorations: [],
            children: [],
          }),
        ],
      }),
    ]
  })
}

/** A line that returns to a middle level: `d` is a sibling of `b`, below `a`, after the lines below `b`. */
function returnsToAMiddleLevel(): Built {
  return mindmap("mindmap\nr\n  a\n    b\n      c\n    d", {
    indent: 0,
    id: "r",
    children: [
      {
        indent: 2,
        id: "a",
        children: [
          { indent: 4, id: "b", children: [{ indent: 6, id: "c" }] },
          { indent: 4, id: "d" },
        ],
      },
    ],
  })
}

/** Directives around the text of a node, an icon, and a class: at the end of a node text, and before and after the text of an icon and of a class, which they are no part of. */
function directivesAroundTexts(): Built {
  return build(
    "mindmap\n  r%%{x}%%\n    ::icon(%%{x}%%a%%{x}%%)\n    :::%%{x}%%c%%{x}%%",
    (kit) => {
      const id = literal(kit, "r")
      kit.directive("%%{x}%%")
      const icon = kit.token("Keyword", "::icon(")
      kit.directive("%%{x}%%")
      const iconText = literal(kit, "a")
      kit.directive("%%{x}%%")
      const iconClose = kit.token("Punctuator", ")")
      const mark = kit.token("Punctuator", ":::")
      kit.directive("%%{x}%%")
      const classText = literal(kit, "c")
      kit.directive("%%{x}%%")
      return [
        nodeFrom(kit, 2, {
          id,
          shape: null,
          decorations: [
            kit.node(
              "MindmapIconStatement",
              [icon.range[0], iconClose.range[1]],
              { icon: iconText },
            ),
            kit.node(
              "MindmapClassStatement",
              [mark.range[0], classText.range[1]],
              { cssClass: classText },
            ),
          ],
          children: [],
        }),
      ]
    },
  )
}

/** A U+2028 and a vertical tab are whitespace characters of the indentation, one each. */
function otherWhitespaceCharacters(): Built {
  return mindmap(`mindmap\nroot\n${LINE_SEPARATOR}a\n\v b`, {
    indent: 0,
    id: "root",
    children: [{ indent: 1, id: "a", children: [{ indent: 2, id: "b" }] }],
  })
}

/** A U+2028 inside a node text is a character of it. */
function lineSeparatorInNodeText(): Built {
  return mindmap(`mindmap\nroot\n  a${LINE_SEPARATOR}b`, {
    indent: 0,
    id: "root",
    children: [{ indent: 2, id: `a${LINE_SEPARATOR}b` }],
  })
}

/** Lines that end with a CRLF: the line terminator ends the node text and the indentation. */
function lineTerminatorsAreCrlf(): Built {
  return mindmap("mindmap\r\nr\r\n  a (b)\r\n  c", {
    indent: 0,
    id: "r",
    children: [
      {
        indent: 2,
        id: "a ",
        shape: { opener: "(", label: textLabel("b"), closer: ")" },
      },
      { indent: 2, id: "c" },
    ],
  })
}

/** A markdown string label that a directive cuts into two `StringFragment` tokens: `before` is the source before the directive, `after` the source after it; the value is `x`, between the delimiters. */
function markdownStringCutByDirective(
  source: string,
  before: string,
  after: string,
): Built {
  return build(source, (kit) => {
    const id = literal(kit, "a")
    const opener = kit.token("Punctuator", "[")
    const first = kit.token("StringFragment", before)
    kit.directive("%%{init: {}}%%")
    const second = kit.token("StringFragment", after)
    const closer = kit.token("Punctuator", "]")
    const shape = kit.node("MindmapShape", [opener.range[0], closer.range[1]], {
      opener: "[",
      closer: "]",
      label: kit.node("MindmapLabel", [first.range[0], second.range[1]], {
        kind: "markdown",
        value: "x",
      }),
    })
    return [nodeFrom(kit, 2, { id, shape, decorations: [], children: [] })]
  })
}

/** A directive between the closing backquote and the closing quote of a markdown string: the quote is the second character of the closing delimiter. */
function directiveBetweenBackquoteAndQuote(): Built {
  return markdownStringCutByDirective(
    'mindmap\n  a["`x`%%{init: {}}%%"]\n',
    '"`x`',
    '"',
  )
}

/** A directive between the opening quote and the backquote of a markdown string: the backquote is the second character of the opening delimiter. */
function directiveBetweenQuoteAndBackquote(): Built {
  return markdownStringCutByDirective(
    'mindmap\n  a["%%{init: {}}%%`x`"]\n',
    '"',
    '`x`"',
  )
}

/** A diagram comment that a U+2028 or a U+2029 ends, after a shape: the comment ends before it, and the node after it starts a line whose indentation is that character. */
function commentEndedByASeparator(separator: string): () => Built {
  return () =>
    build(`mindmap\nroot\n  a[x] %% c${separator}y\n`, (kit) => {
      const root = literal(kit, "root")
      const a = literal(kit, "a")
      const shape = shapeOf(kit, {
        opener: "[",
        label: textLabel("x"),
        closer: "]",
      })
      kit.comment("%%", "%% c")
      const y = literal(kit, "y")
      return [
        nodeFrom(kit, 0, {
          id: root,
          shape: null,
          decorations: [],
          children: [
            nodeFrom(kit, 2, { id: a, shape, decorations: [], children: [] }),
            nodeFrom(kit, 1, {
              id: y,
              shape: null,
              decorations: [],
              children: [],
            }),
          ],
        }),
      ]
    })
}

/** A diagram comment after the header, ended by a U+2028, and the root after it. */
function commentAfterTheHeaderEndedByASeparator(): Built {
  return build(`mindmap %% c${LINE_SEPARATOR}root\n`, (kit) => {
    kit.comment("%%", "%% c")
    const root = literal(kit, "root")
    return [
      nodeFrom(kit, 1, {
        id: root,
        shape: null,
        decorations: [],
        children: [],
      }),
    ]
  })
}

describe("checkTree: a mindmap tree made by hand", () => {
  const VALID: Readonly<Record<string, () => Built>> = {
    "every kind of line": everyKindOfLine,
    "the header alone": headerOnly,
    "a root on the line of the header": rootOnTheHeaderLine,
    "a root right after the header": rootRightAfterTheHeader,
    "the example of the indentation": indentationExample,
    "a tab as one character": tabIsOneCharacter,
    "a U+3000 as one character": ideographicSpaceIsOneCharacter,
    "the kinds of labels and the closers": labelsAndShapes,
    "shapes alone": shapesAlone,
    "node texts that look like other units": nodeTextsThatLookLikeOtherUnits,
    "whitespace at the end of a node text": trailingWhitespace,
    "the decorations of one node": decorationsOfOneNode,
    "decorations among the lines": decorationsAmongLines,
    "a class that ends at a U+2028": classEndsAtLineSeparator,
    "a class that ends at a U+2029": classEndsAtParagraphSeparator,
    "a directive in the indentation": directiveInIndentation,
    "a directive in a node text": directiveInNodeText,
    "a directive in a text label and in a string label": directiveInLabels,
    "a directive between the backquote and the quote of a markdown string":
      directiveBetweenBackquoteAndQuote,
    "a directive between the quote and the backquote of a markdown string":
      directiveBetweenQuoteAndBackquote,
    "a comment that a U+2028 ends": commentEndedByASeparator(LINE_SEPARATOR),
    "a comment that a U+2029 ends":
      commentEndedByASeparator(PARAGRAPH_SEPARATOR),
    "a comment after the header that a U+2028 ends":
      commentAfterTheHeaderEndedByASeparator,
    "comments among the lines": commentsAmongLines,
    "an indented comment line": indentedCommentLine,
    "a line that returns to a middle level": returnsToAMiddleLevel,
    "directives around the text of a node, an icon, and a class":
      directivesAroundTexts,
    "a U+2028 and a vertical tab in the indentation": otherWhitespaceCharacters,
    "a U+2028 in a node text": lineSeparatorInNodeText,
    "line terminators that are CRLF": lineTerminatorsAreCrlf,
  }
  for (const [title, make] of Object.entries(VALID)) {
    it(`accepts ${title}`, () => {
      const { source, tree } = make()
      expect(checkTree(source, tree)).toEqual([])
    })
  }
})

/** Makes the token whose text is `from` and the literal whose value is `from` cover only the first (`start`) or the last (`end`) `length` characters of the text, with the text that they cover. */
function shrink(
  tree: CheckedRoot,
  from: string,
  side: "start" | "end",
  length: number,
): void {
  const token = tokenWith(tree, from)
  const range: [number, number] =
    side === "start"
      ? [token.range[0], token.range[0] + length]
      : [token.range[1] - length, token.range[1]]
  const text = side === "start" ? from.slice(0, length) : from.slice(-length)
  const node = nodeWith(tree, "MindmapLiteral", "value", from)
  for (const target of [token, node]) setField(target, "range", range)
  setField(token, "value", text)
  setField(node, "value", text)
}

/** Sets the value of the literal whose value is `from` to `to`. */
function literalBecomes(from: string, to: string): BrokenCase["mutate"] {
  return (tree) => {
    setField(nodeWith(tree, "MindmapLiteral", "value", from), "value", to)
  }
}

/** Sets the value of the label whose value is `from` to `to`. */
function labelBecomes(from: string, to: string): BrokenCase["mutate"] {
  return (tree) => {
    setField(nodeWith(tree, "MindmapLabel", "value", from), "value", to)
  }
}

/** Sets the field `field` of the node of the type `type` whose field `by` is `is` to `value`. */
function setOf(
  type: string,
  by: string,
  is: unknown,
  field: string,
  value: unknown,
): BrokenCase["mutate"] {
  return (tree) => {
    setField(nodeWith(tree, type, by, is), field, value)
  }
}

/** The nodes of the list `field` of `node`. */
function listOf(node: CheckedNode, field: string): CheckedNode[] {
  return node[field] as CheckedNode[]
}

/** The part of the message of the problem that the node of the type `owner` reports: `where: message`. */
function at(owner: string, message: string): string {
  return `${owner} at #: ${message}`
}

/** The message of the problem for an `indent` that is not the whitespace before the node. */
function indentWas(got: number, wanted: number): string {
  return `the indent, which is the number of whitespace characters before the node on its line: ${got}, not ${wanted}`
}

/** The message of the problem for the children of a node that are not those that the indentation gives. */
const CHILDREN =
  "the ranges of the children, which are the nodes whose nearest earlier node with a smaller indent is this one"

/** The message of the problem for a value that is not the written text of its range. */
const NOT_WRITTEN_TEXT = "value is not its written text"

// ast/mindmap.md, the Type column: the child nodes of a field are of the
// types that its table gives. Each case puts a node of another type into a
// field.
const WRONG_CHILD_TYPES: readonly BrokenCase[] = [
  {
    name: "a literal as the root of the diagram",
    built: everyKindOfLine,
    mutate: (tree) => {
      setField(
        tree.body,
        "root",
        nodeWith(tree, "MindmapLiteral", "value", "d"),
      )
    },
    expected: at(
      "MindmapDiagram",
      "the field root holds a MindmapLiteral, not a MindmapNode",
    ),
  },
  {
    name: "a label as the node text of a node",
    built: everyKindOfLine,
    mutate: (tree) => {
      setField(
        nodeWith(tree, "MindmapNode", "indent", 6),
        "id",
        nodeWith(tree, "MindmapLabel", "value", "r"),
      )
    },
    expected: at(
      "MindmapNode",
      "the field id holds a MindmapLabel, not a MindmapLiteral",
    ),
  },
  {
    name: "a literal as the shape of a node",
    built: everyKindOfLine,
    mutate: (tree) => {
      setField(
        nodeWith(tree, "MindmapNode", "indent", 6),
        "shape",
        nodeWith(tree, "MindmapLiteral", "value", "d"),
      )
    },
    expected: at(
      "MindmapNode",
      "the field shape holds a MindmapLiteral, not a MindmapShape",
    ),
  },
  {
    name: "a literal among the decorations of a node",
    built: everyKindOfLine,
    mutate: (tree) => {
      listOf(nodeWith(tree, "MindmapNode", "indent", 6), "decorations").push(
        nodeWith(tree, "MindmapLiteral", "value", "d"),
      )
    },
    expected: at(
      "MindmapNode",
      "the field decorations holds a MindmapLiteral, not a MindmapIconStatement or MindmapClassStatement",
    ),
  },
  {
    name: "a shape among the children of a node",
    built: everyKindOfLine,
    mutate: (tree) => {
      listOf(nodeWith(tree, "MindmapNode", "indent", 6), "children").push(
        nodeWith(tree, "MindmapShape", "opener", "(("),
      )
    },
    expected: at(
      "MindmapNode",
      "the field children holds a MindmapShape, not a MindmapNode",
    ),
  },
  {
    name: "a literal as the label of a shape",
    built: everyKindOfLine,
    mutate: (tree) => {
      setField(
        nodeWith(tree, "MindmapShape", "opener", "(("),
        "label",
        nodeWith(tree, "MindmapLiteral", "value", "d"),
      )
    },
    expected: at(
      "MindmapShape",
      "the field label holds a MindmapLiteral, not a MindmapLabel",
    ),
  },
  {
    name: "a label as the icon of an icon line",
    built: everyKindOfLine,
    mutate: (tree) => {
      setField(
        nodeWith(tree, "MindmapIconStatement"),
        "icon",
        nodeWith(tree, "MindmapLabel", "value", "r"),
      )
    },
    expected: at(
      "MindmapIconStatement",
      "the field icon holds a MindmapLabel, not a MindmapLiteral",
    ),
  },
  {
    name: "a label as the class of a class line",
    built: everyKindOfLine,
    mutate: (tree) => {
      setField(
        nodeWith(tree, "MindmapClassStatement"),
        "cssClass",
        nodeWith(tree, "MindmapLabel", "value", "r"),
      )
    },
    expected: at(
      "MindmapClassStatement",
      "the field cssClass holds a MindmapLabel, not a MindmapLiteral",
    ),
  },
]

// ast/mindmap.md, MindmapShape and MindmapLabel: the opener, the closer, and
// the kind are words of the lists that the Meaning column gives.
const WRONG_WORDS: readonly BrokenCase[] = [
  {
    name: "an opener that is none of the openers",
    built: everyKindOfLine,
    mutate: setOf("MindmapShape", "opener", "((", "opener", "<"),
    expected: at(
      "MindmapShape",
      'the field opener is "<", none of (, ((, [, {{, ), )), (-, -)',
    ),
  },
  {
    name: "a closer that is none of the closers",
    built: everyKindOfLine,
    mutate: setOf("MindmapShape", "opener", "((", "closer", ">"),
    expected: at(
      "MindmapShape",
      'the field closer is ">", none of ), )), ], }}, (, ((, (-, -)',
    ),
  },
  {
    name: "a kind of a label that is none of the kinds",
    built: everyKindOfLine,
    mutate: setOf("MindmapLabel", "value", "r", "kind", "word"),
    expected: at(
      "MindmapLabel",
      'the field kind is "word", none of text, string, markdown',
    ),
  },
]

// ast/mindmap.md, MindmapNode, and diagrams/mindmap.md, Units and contexts:
// a node has a node text or a shape or both, and its `indent` is the number
// of whitespace characters before it on its line, each one character.
const BROKEN_NODES: readonly BrokenCase[] = [
  {
    name: "an indent that is no integer",
    built: everyKindOfLine,
    mutate: setOf("MindmapNode", "indent", 2, "indent", 1.5),
    expected: at("MindmapNode", "the indent 1.5 is no integer of 0 or more"),
  },
  {
    name: "an indent below 0",
    built: everyKindOfLine,
    mutate: setOf("MindmapNode", "indent", 2, "indent", -1),
    expected: at("MindmapNode", "the indent -1 is no integer of 0 or more"),
  },
  {
    name: "a node with neither a node text nor a shape",
    built: everyKindOfLine,
    mutate: setOf("MindmapNode", "indent", 6, "id", null),
    expected: at("MindmapNode", "has neither a node text nor a shape"),
  },
  {
    name: "an indent of the root that is one too many",
    built: everyKindOfLine,
    mutate: setOf("MindmapNode", "indent", 2, "indent", 3),
    expected: at("MindmapNode", indentWas(3, 2)),
  },
  {
    name: "an indent of a child that is one too few",
    built: everyKindOfLine,
    mutate: setOf("MindmapNode", "indent", 6, "indent", 5),
    expected: at("MindmapNode", indentWas(5, 6)),
  },
  {
    name: "an indent of a tab that is the width of a tab stop",
    built: tabIsOneCharacter,
    mutate: setOf("MindmapNode", "indent", 1, "indent", 4),
    expected: at("MindmapNode", indentWas(4, 1)),
  },
  {
    name: "an indent of a U+3000 that is two",
    built: ideographicSpaceIsOneCharacter,
    mutate: setOf("MindmapNode", "indent", 1, "indent", 2),
    expected: at("MindmapNode", indentWas(2, 1)),
  },
  {
    name: "an indent of a root on the line of the header that is 0",
    built: rootOnTheHeaderLine,
    mutate: setOf("MindmapNode", "indent", 2, "indent", 0),
    expected: at("MindmapNode", indentWas(0, 2)),
  },
  {
    name: "an indent of a root right after the header that is 1",
    built: rootRightAfterTheHeader,
    mutate: setOf("MindmapNode", "indent", 0, "indent", 1),
    expected: at("MindmapNode", indentWas(1, 0)),
  },
  {
    name: "an indent that counts the whitespace before a directive only",
    built: directiveInIndentation,
    mutate: setOf("MindmapNode", "indent", 2, "indent", 1),
    expected: at("MindmapNode", indentWas(1, 2)),
  },
  {
    name: "an indent that counts the whitespace of a comment line before it",
    built: indentedCommentLine,
    mutate: setOf("MindmapNode", "indent", 2, "indent", 5),
    expected: at("MindmapNode", indentWas(5, 2)),
  },
  {
    name: "an indent that leaves out a U+2028",
    built: otherWhitespaceCharacters,
    mutate: setOf("MindmapNode", "indent", 1, "indent", 0),
    expected: at("MindmapNode", indentWas(0, 1)),
  },
  {
    name: "an indent that leaves out a vertical tab",
    built: otherWhitespaceCharacters,
    mutate: setOf("MindmapNode", "indent", 2, "indent", 1),
    expected: at("MindmapNode", indentWas(1, 2)),
  },
  {
    name: "an indent after a CRLF that is one too many",
    built: lineTerminatorsAreCrlf,
    mutate: setOf("MindmapNode", "indent", 2, "indent", 3),
    expected: at("MindmapNode", indentWas(3, 2)),
  },
  {
    name: "a node text that ends before the whitespace at its end",
    built: trailingWhitespace,
    mutate: (tree) => {
      shrink(tree, "root   ", "start", 4)
    },
    expected: at(
      "MindmapNode",
      'the node text ends before " ", which does not end its line',
    ),
  },
  {
    name: "a node text at the end of the text that ends before the whitespace at its end",
    built: trailingWhitespace,
    mutate: (tree) => {
      shrink(tree, "b  ", "start", 1)
    },
    expected: at(
      "MindmapNode",
      'the node text ends before " ", which does not end its line',
    ),
  },
  {
    name: "a node text that ends before the whitespace in front of its shape",
    built: everyKindOfLine,
    mutate: (tree) => {
      shrink(tree, "a ", "start", 1)
    },
    expected: at(
      "MindmapNode",
      'the written text between the node text and the shape is " ", not empty',
    ),
  },
  {
    name: "the opener `-)` after a node text",
    built: labelsAndShapes,
    mutate: setOf("MindmapShape", "opener", "[", "opener", "-)"),
    expected: at(
      "MindmapNode",
      "the shape after a node text has the opener `-)`, which only a shape that starts a unit has",
    ),
  },
]

// diagrams/mindmap.md, Indentation and parents: the parent of a node is the
// nearest node before it whose indentation is smaller, and the children of a
// node are those nodes in source order.
const BROKEN_PARENTS: readonly BrokenCase[] = [
  {
    name: "a child that belongs to the sibling before it",
    built: everyKindOfLine,
    mutate: (tree) => {
      const root = nodeWith(tree, "MindmapNode", "indent", 2)
      const [a, d] = listOf(root, "children")
      const child = a === undefined ? undefined : listOf(a, "children").pop()
      if (d === undefined || child === undefined) throw new Error("no child")
      setField(d, "children", [child])
    },
    expected: at("MindmapNode", CHILDREN),
  },
  {
    name: "children in another order than the source",
    built: everyKindOfLine,
    mutate: (tree) => {
      listOf(nodeWith(tree, "MindmapNode", "indent", 2), "children").reverse()
    },
    expected: at("MindmapNode", CHILDREN),
  },
  {
    name: "a node that is a child of a node that is indented more",
    built: indentationExample,
    mutate: (tree) => {
      const root = nodeWith(tree, "MindmapNode", "indent", 0)
      const [a, b] = listOf(root, "children")
      if (a === undefined || b === undefined) throw new Error("no children")
      setField(root, "children", [a])
      setField(a, "children", [b])
    },
    expected: at("MindmapNode", CHILDREN),
  },
  {
    name: "a node that is a child of the root, not of the sibling before it",
    built: indentationExample,
    mutate: (tree) => {
      const root = nodeWith(tree, "MindmapNode", "indent", 0)
      const b = nodeWith(tree, "MindmapNode", "indent", 2)
      const c = listOf(b, "children").pop()
      if (c === undefined) throw new Error("no child")
      setField(root, "children", [...listOf(root, "children"), c])
    },
    expected: at("MindmapNode", CHILDREN),
  },
  {
    name: "a node as indented as the root, which would be a second root",
    built: everyKindOfLine,
    mutate: (tree) => {
      setField(nodeWith(tree, "MindmapNode", "indent", 4), "indent", 2)
    },
    expected: at(
      "MindmapNode",
      "is not the first node and has no node before it with a smaller indent, so it would be a second root",
    ),
  },
]

// diagrams/mindmap.md, Nodes and shapes and The shape context: a shape is
// its opener, its label, and its closer, and nothing else; the closer `-)`
// follows only a string or a markdown string.
const BROKEN_SHAPES: readonly BrokenCase[] = [
  {
    name: "an opener that is not the written one",
    built: everyKindOfLine,
    mutate: setOf("MindmapShape", "opener", "((", "opener", "("),
    expected: at(
      "MindmapShape",
      'the written text before the label, which is the opener: "((", not "("',
    ),
  },
  {
    name: "a closer that is not the written one",
    built: everyKindOfLine,
    mutate: setOf("MindmapShape", "opener", "((", "closer", ")"),
    expected: at(
      "MindmapShape",
      'the written text after the label, which is the closer: "))", not ")"',
    ),
  },
  {
    name: "a closer `-)` after a text",
    built: shapesAlone,
    mutate: setOf("MindmapShape", "closer", "]", "closer", "-)"),
    expected: at(
      "MindmapShape",
      "the closer `-)` follows a text, which reads the `-` before the `)` as its own",
    ),
  },
]

// ast/mindmap.md, MindmapLabel, and diagrams/mindmap.md, The shape context:
// a label is never empty; a string and a markdown string are written with
// their delimiters; a text starts with no `"`; and a label holds none of the
// characters that end a label of its kind.
const BROKEN_LABELS: readonly BrokenCase[] = [
  {
    name: "an empty text label",
    built: everyKindOfLine,
    mutate: labelBecomes("r", ""),
    expected: at("MindmapLabel", "the label is empty"),
  },
  {
    name: "an empty string label",
    built: everyKindOfLine,
    mutate: labelBecomes("s", ""),
    expected: at("MindmapLabel", "the label is empty"),
  },
  {
    name: "an empty markdown label",
    built: labelsAndShapes,
    mutate: labelBecomes("m", ""),
    expected: at("MindmapLabel", "the label is empty"),
  },
  {
    name: "a text that starts with a quote",
    built: labelsAndShapes,
    mutate: labelBecomes("t", '"t'),
    expected: at(
      "MindmapLabel",
      'the text "\\"t" starts with a `"`, with which a string starts',
    ),
  },
  {
    name: "a string recorded as a text with its quotes",
    built: labelsAndShapes,
    mutate: (tree) => {
      const label = nodeWith(tree, "MindmapLabel", "value", "q")
      setField(label, "kind", "text")
      setField(label, "value", '"q"')
    },
    expected: at(
      "MindmapLabel",
      `the text ${JSON.stringify('"q"')} starts with a \`"\`, with which a string starts`,
    ),
  },
  {
    name: "a string recorded as a markdown string",
    built: labelsAndShapes,
    mutate: setOf("MindmapLabel", "value", "q", "kind", "markdown"),
    expected: "of a markdown does not start with",
  },
  {
    name: "a text recorded as a string",
    built: labelsAndShapes,
    mutate: setOf("MindmapLabel", "value", "t", "kind", "string"),
    expected: "of a string does not start with",
  },
  {
    name: "a markdown string recorded as a string",
    built: labelsAndShapes,
    mutate: setOf("MindmapLabel", "value", "m", "kind", "string"),
    expected: at("MindmapLabel", NOT_WRITTEN_TEXT),
  },
  {
    name: "a string whose range ends before its closing quote",
    built: labelsAndShapes,
    mutate: (tree) => {
      const label = nodeWith(tree, "MindmapLabel", "value", "q")
      setField(label, "range", [label.range[0], label.range[1] - 1])
    },
    expected: "of a string does not start with",
  },
  {
    name: "a string whose range starts after its opening quote",
    built: labelsAndShapes,
    mutate: (tree) => {
      const label = nodeWith(tree, "MindmapLabel", "value", "q")
      setField(label, "range", [label.range[0] + 1, label.range[1]])
    },
    expected: "of a string does not start with",
  },
  {
    name: "a markdown string whose range ends before its closing delimiter",
    built: labelsAndShapes,
    mutate: (tree) => {
      const label = nodeWith(tree, "MindmapLabel", "value", "m")
      setField(label, "range", [label.range[0], label.range[1] - 1])
    },
    expected: "of a markdown does not start with",
  },
  {
    name: "a markdown string whose range starts after its opening delimiter",
    built: labelsAndShapes,
    mutate: (tree) => {
      const label = nodeWith(tree, "MindmapLabel", "value", "m")
      setField(label, "range", [label.range[0] + 1, label.range[1]])
    },
    expected: "of a markdown does not start with",
  },
  {
    name: "a markdown string recorded as a text",
    built: labelsAndShapes,
    mutate: setOf("MindmapLabel", "value", "m", "kind", "text"),
    expected: at("MindmapLabel", NOT_WRITTEN_TEXT),
  },
]

/** The cases of a character that a label of the kind `kind` holds none of: `base` with the character at its end. */
function labelWithCharacter(
  kind: string,
  base: string,
  characters: readonly string[],
): BrokenCase[] {
  return characters.map((character) => ({
    name: `a ${kind} label that holds ${JSON.stringify(character)}`,
    built: labelsAndShapes,
    mutate: labelBecomes(base, base + character),
    expected: at(
      "MindmapLabel",
      `the value ${JSON.stringify(base + character)} of a ${kind} holds ${JSON.stringify(character)}, which ends it`,
    ),
  }))
}

const BROKEN_LABEL_CHARACTERS: readonly BrokenCase[] = [
  ...labelWithCharacter("text", "t", [")", "]", "(", "}"]),
  ...labelWithCharacter("string", "q", ['"']),
  ...labelWithCharacter("markdown", "m", ["`", '"']),
]

// ast/mindmap.md, MindmapLiteral, and diagrams/mindmap.md, Units and contexts
// and The icon and class contexts: the text of a node, an icon, or a class is
// not empty and holds none of the characters that end it; a node text starts
// with no whitespace and with none of the units that a rule before it reads;
// an icon lies between `::icon(` and `)`, a class after `:::` to the end of
// its line segment.
const BROKEN_LITERALS: readonly BrokenCase[] = [
  {
    name: "an empty node text",
    built: everyKindOfLine,
    mutate: literalBecomes("d", ""),
    expected: at("MindmapLiteral", "the literal is empty"),
  },
  {
    name: "an empty icon",
    built: everyKindOfLine,
    mutate: literalBecomes("fa book", ""),
    expected: at("MindmapLiteral", "the literal is empty"),
  },
  {
    name: "an empty class",
    built: everyKindOfLine,
    mutate: literalBecomes("big red", ""),
    expected: at("MindmapLiteral", "the literal is empty"),
  },
  {
    name: "a node text that starts with whitespace",
    built: everyKindOfLine,
    mutate: literalBecomes("d", " d"),
    expected: at(
      "MindmapLiteral",
      'the node text " d" starts with whitespace, which is the indentation',
    ),
  },
  {
    name: "a node text that starts with a U+3000",
    built: everyKindOfLine,
    mutate: literalBecomes("d", `${IDEOGRAPHIC_SPACE}d`),
    expected: at(
      "MindmapLiteral",
      `the node text ${JSON.stringify(`${IDEOGRAPHIC_SPACE}d`)} starts with whitespace, which is the indentation`,
    ),
  },
  {
    name: "an icon that holds a `)`",
    built: everyKindOfLine,
    mutate: literalBecomes("fa book", "fa book)"),
    expected: at(
      "MindmapLiteral",
      'the icon "fa book)" holds a `)`, which ends it',
    ),
  },
  {
    name: "an icon that starts one character late",
    built: everyKindOfLine,
    mutate: (tree) => {
      shrink(tree, "fa book", "end", 6)
    },
    expected: at(
      "MindmapLiteral",
      'the written text before the icon is ":icon(f", not `::icon(`',
    ),
  },
  {
    name: "an icon that ends one character early",
    built: everyKindOfLine,
    mutate: (tree) => {
      shrink(tree, "fa book", "start", 6)
    },
    expected: at(
      "MindmapLiteral",
      'the written text after the icon starts with "k", not `)`',
    ),
  },
  {
    name: "an icon at the end of the text that ends one character early",
    built: decorationsOfOneNode,
    mutate: (tree) => {
      shrink(tree, "i\nj", "start", 2)
    },
    expected: at(
      "MindmapLiteral",
      'the written text after the icon starts with "j", not `)`',
    ),
  },
  {
    name: "a class that starts one character late",
    built: everyKindOfLine,
    mutate: (tree) => {
      shrink(tree, "big red", "end", 6)
    },
    expected: at(
      "MindmapLiteral",
      'the written text before the class is "::b", not `:::`',
    ),
  },
  {
    name: "a class that ends one character early",
    built: everyKindOfLine,
    mutate: (tree) => {
      shrink(tree, "big red", "start", 6)
    },
    expected: at(
      "MindmapLiteral",
      'the class ends before "d", which does not end its line segment',
    ),
  },
]

/** The cases of a character that a node text holds none of: `d` with the character at its end. */
function nodeTextWithCharacter(character: string): BrokenCase {
  return {
    name: `a node text that holds ${JSON.stringify(character)}`,
    built: everyKindOfLine,
    mutate: literalBecomes("d", `d${character}`),
    expected: at(
      "MindmapLiteral",
      `the node text ${JSON.stringify(`d${character}`)} holds ${JSON.stringify(character)}, which ends a node text`,
    ),
  }
}

/** The cases of a character that ends a class: `big red` with the character at its end. */
function classWithCharacter(character: string): BrokenCase {
  return {
    name: `a class that holds ${JSON.stringify(character)}`,
    built: everyKindOfLine,
    mutate: literalBecomes("big red", `big red${character}`),
    expected: at(
      "MindmapLiteral",
      `the class ${JSON.stringify(`big red${character}`)} holds ${JSON.stringify(character)}, which ends a class`,
    ),
  }
}

/** The case of a node text that starts with `start`, which a rule before the rule of the node text reads. */
function nodeTextStartingWith(start: string, reads: string): BrokenCase {
  return {
    name: `a node text that starts with ${JSON.stringify(start)}`,
    built: everyKindOfLine,
    mutate: literalBecomes("d", `${start}d`),
    expected: at(
      "MindmapLiteral",
      `the node text ${JSON.stringify(`${start}d`)} starts with ${reads}, which a rule before the rule of the node text reads`,
    ),
  }
}

const BROKEN_LITERAL_CHARACTERS: readonly BrokenCase[] = [
  ...["(", "[", ")", "{", "}", "\n", "\r"].map(nodeTextWithCharacter),
  ...["\n", "\r", LINE_SEPARATOR, PARAGRAPH_SEPARATOR].map(classWithCharacter),
  nodeTextStartingWith("%%", '"%%"'),
  nodeTextStartingWith("::icon(", '"::icon("'),
  nodeTextStartingWith("::ICON(", '"::icon("'),
  nodeTextStartingWith(":::", '":::"'),
  nodeTextStartingWith("mindmap ", "the keyword `mindmap`"),
  nodeTextStartingWith("mindmap-", "the keyword `mindmap`"),
  nodeTextStartingWith("MindMap(", "the keyword `mindmap`"),
]

// ast/mindmap.md, MindmapNode: the decorations of a node are the icon and
// class lines between its line and the next node line.
const BROKEN_DECORATIONS: readonly BrokenCase[] = [
  {
    name: "an icon line of a child among the decorations of the node before it",
    built: everyKindOfLine,
    mutate: (tree) => {
      const root = nodeWith(tree, "MindmapNode", "indent", 2)
      const a = nodeWith(tree, "MindmapNode", "indent", 4)
      const icon = listOf(a, "decorations").shift()
      if (icon === undefined) throw new Error("no icon")
      setField(root, "decorations", [icon])
    },
    expected: at(
      "MindmapNode",
      "the decoration MindmapIconStatement at # does not end before the next node starts, which it decorates",
    ),
  },
  {
    name: "an icon line of a node among the decorations of the node after it",
    built: decorationsAmongLines,
    mutate: (tree) => {
      const root = nodeWith(tree, "MindmapNode", "indent", 0)
      const a = nodeWith(tree, "MindmapNode", "indent", 4)
      const icon = listOf(root, "decorations").pop()
      if (icon === undefined) throw new Error("no icon")
      setField(a, "decorations", [icon, ...listOf(a, "decorations")])
    },
    expected: at(
      "MindmapNode",
      "the decoration MindmapIconStatement at # does not start after the text of the node ends",
    ),
  },
]

// The same, at the boundaries: a decoration starts after the text of its node
// and ends before the next node, with a line terminator between; the text of
// a node with a shape ends with the shape.
const BROKEN_DECORATION_BOUNDARIES: readonly BrokenCase[] = [
  {
    name: "an icon line that starts where the node text ends",
    built: decorationsAmongLines,
    mutate: (tree) => {
      const id = nodeWith(tree, "MindmapLiteral", "value", "r")
      const icon = nodeWith(tree, "MindmapIconStatement")
      setField(icon, "range", [id.range[1], icon.range[1]])
    },
    expected: at(
      "MindmapNode",
      "the decoration MindmapIconStatement at # does not start after the text of the node ends",
    ),
  },
  {
    name: "an icon line that starts where the shape of the node ends",
    built: everyKindOfLine,
    mutate: (tree) => {
      const shape = nodeWith(tree, "MindmapShape", "opener", "(")
      const icon = nodeWith(tree, "MindmapIconStatement")
      setField(icon, "range", [shape.range[1], icon.range[1]])
    },
    expected: at(
      "MindmapNode",
      "the decoration MindmapIconStatement at # does not start after the text of the node ends",
    ),
  },
  {
    name: "an icon line that ends where the next node starts",
    built: decorationsAmongLines,
    mutate: (tree) => {
      const next = nodeWith(tree, "MindmapNode", "indent", 4)
      const icon = nodeWith(tree, "MindmapIconStatement")
      setField(icon, "range", [icon.range[0], next.range[0]])
    },
    expected: at(
      "MindmapNode",
      "the decoration MindmapIconStatement at # does not end before the next node starts, which it decorates",
    ),
  },
  {
    name: "a node with decorations and neither a node text nor a shape",
    built: decorationsAmongLines,
    mutate: setOf("MindmapNode", "indent", 0, "id", null),
    expected: at("MindmapNode", "has neither a node text nor a shape"),
  },
]

// ast.md, Nodes, and ast/mindmap.md: the value of a literal and of a label is
// its written text, the text of a string and of a markdown string without
// their delimiters.
const BROKEN_VALUES: readonly BrokenCase[] = [
  {
    name: "a node text that is not the written one",
    built: everyKindOfLine,
    mutate: literalBecomes("c", "cZ"),
    expected: at("MindmapLiteral", NOT_WRITTEN_TEXT),
  },
  {
    name: "an icon that is not the written one",
    built: everyKindOfLine,
    mutate: literalBecomes("fa book", "fa bookZ"),
    expected: at("MindmapLiteral", NOT_WRITTEN_TEXT),
  },
  {
    name: "a class that is not the written one",
    built: everyKindOfLine,
    mutate: literalBecomes("big red", "Zbig red"),
    expected: at("MindmapLiteral", NOT_WRITTEN_TEXT),
  },
  {
    name: "a node text that leaves out the directive and keeps its text",
    built: directiveInNodeText,
    mutate: literalBecomes("ab", "a%%{x}%%b"),
    expected: at("MindmapLiteral", NOT_WRITTEN_TEXT),
  },
  {
    name: "a text label that is not the written one",
    built: labelsAndShapes,
    mutate: labelBecomes("t", "tZ"),
    expected: at("MindmapLabel", NOT_WRITTEN_TEXT),
  },
  {
    name: "a string label that keeps its quotes",
    built: labelsAndShapes,
    mutate: labelBecomes("q", '"q"'),
    expected: at("MindmapLabel", NOT_WRITTEN_TEXT),
  },
  {
    name: "a markdown label that keeps one of its backquotes",
    built: labelsAndShapes,
    mutate: labelBecomes("m", "m`"),
    expected: at("MindmapLabel", NOT_WRITTEN_TEXT),
  },
  {
    name: "a markdown string cut by a directive after its backquote whose value keeps a backquote",
    built: directiveBetweenBackquoteAndQuote,
    mutate: labelBecomes("x", "x`"),
    expected: at("MindmapLabel", NOT_WRITTEN_TEXT),
  },
  {
    name: "a markdown string cut by a directive before its backquote whose value keeps a backquote",
    built: directiveBetweenQuoteAndBackquote,
    mutate: labelBecomes("x", "`x"),
    expected: at("MindmapLabel", NOT_WRITTEN_TEXT),
  },
  {
    name: "a label of a string that a directive cuts and that keeps the directive",
    built: directiveInLabels,
    mutate: (tree) => {
      setField(
        nodeWith(tree, "MindmapLabel", "kind", "string"),
        "value",
        "x%%{x}%%y",
      )
    },
    expected: at("MindmapLabel", NOT_WRITTEN_TEXT),
  },
]

// The records of every tree, for the mindmap diagram: the diagram comments
// have the mark `%%` (diagrams/mindmap.md, Comments), and the id of the
// diagram type is `mindmap` (ast.md, Root).
const BROKEN_RECORDS: readonly BrokenCase[] = [
  {
    name: "a diagram comment with the mark #",
    built: commentsAmongLines,
    mutate: (tree) => {
      setField(tree.comments[2] ?? tree, "mark", "#")
    },
    expected: "is no mark of the comments of a MindmapDiagram",
  },
  {
    name: "a diagram comment with the mark %",
    built: commentsAmongLines,
    mutate: (tree) => {
      setField(tree.comments[2] ?? tree, "mark", "%")
    },
    expected: "the mark % is no mark of the comments of a MindmapDiagram",
  },
  {
    name: "the diagram type of another diagram",
    built: everyKindOfLine,
    mutate: (tree) => {
      setField(tree, "diagramType", "error")
    },
    expected:
      "Root: the diagram type error is not one of those of a MindmapDiagram: mindmap",
  },
]

// parser/docs/tokens.md, Comment: the range of a diagram comment of a mindmap
// diagram ends before the U+2028 or U+2029 that ends it.
const BROKEN_COMMENT_ENDS: readonly BrokenCase[] = [
  {
    name: "a comment whose range includes the U+2028 that ends it",
    built: commentEndedByASeparator(LINE_SEPARATOR),
    mutate: (tree) => {
      const [comment] = tree.comments
      if (comment === undefined) throw new Error("no comment")
      setField(comment, "range", [comment.range[0], comment.range[1] + 1])
    },
    expected: "ends with a line terminator",
  },
  {
    name: "a comment whose range includes the U+2029 that ends it",
    built: commentEndedByASeparator(PARAGRAPH_SEPARATOR),
    mutate: (tree) => {
      const [comment] = tree.comments
      if (comment === undefined) throw new Error("no comment")
      setField(comment, "range", [comment.range[0], comment.range[1] + 1])
    },
    expected: "ends with a line terminator",
  },
  {
    name: "a comment whose range runs past the U+2028 that ends it",
    built: commentEndedByASeparator(LINE_SEPARATOR),
    mutate: (tree) => {
      const [comment] = tree.comments
      if (comment === undefined) throw new Error("no comment")
      setField(comment, "range", [comment.range[0], comment.range[1] + 2])
    },
    expected: "runs past the line terminator at",
  },
  {
    name: "a comment whose range ends before its text ends",
    built: commentEndedByASeparator(LINE_SEPARATOR),
    mutate: (tree) => {
      const [comment] = tree.comments
      if (comment === undefined) throw new Error("no comment")
      setField(comment, "range", [comment.range[0], comment.range[1] - 1])
    },
    expected: "does not end where its line ends",
  },
]

describe("checkTree: the conditions of a mindmap tree", () => {
  itFailsEach(WRONG_CHILD_TYPES)
  itFailsEach(WRONG_WORDS)
  itFailsEach(BROKEN_NODES)
  itFailsEach(BROKEN_PARENTS)
  itFailsEach(BROKEN_SHAPES)
  itFailsEach(BROKEN_LABELS)
  itFailsEach(BROKEN_LABEL_CHARACTERS)
  itFailsEach(BROKEN_LITERALS)
  itFailsEach(BROKEN_LITERAL_CHARACTERS)
  itFailsEach(BROKEN_DECORATIONS)
  itFailsEach(BROKEN_DECORATION_BOUNDARIES)
  itFailsEach(BROKEN_VALUES)
  itFailsEach(BROKEN_RECORDS)
  itFailsEach(BROKEN_COMMENT_ENDS)
})

/** The words between backquotes in `meaning`: the words that a Meaning cell of ast/mindmap.md lists. */
function wordsOfMeaning(meaning: string): string[] {
  return [...meaning.matchAll(/`([^`]+)`/gu)].map((match) => match[1] ?? "")
}

describe("the tables of the check of a mindmap tree", () => {
  it("give the child types that the Type column of ast/mindmap.md gives", () => {
    const documented = readFieldTables()
    const differing: string[] = []
    for (const [type, fields] of Object.entries(MINDMAP_CHILD_TYPES)) {
      for (const [field, allowed] of Object.entries(fields)) {
        const cell = documented.get(type)?.get(field) ?? ""
        const named = [...cell.matchAll(/[A-Z][A-Za-z]*[a-z][A-Za-z]*/gu)].map(
          (match) => match[0],
        )
        if (
          JSON.stringify(named.sort()) !== JSON.stringify([...allowed].sort())
        ) {
          differing.push(`${type}.${field}: ${cell}`)
        }
      }
    }
    expect(differing).toEqual([])
  })

  it("give a child type for every field of the mindmap types that holds a node", () => {
    const missing: string[] = []
    for (const [type, fields] of readFieldTables()) {
      if (!type.startsWith("Mindmap")) continue
      for (const [field, cell] of fields) {
        if (
          /Mindmap[A-Za-z]+/u.test(cell) &&
          MINDMAP_CHILD_TYPES[type]?.[field] === undefined
        ) {
          missing.push(`${type}.${field}: ${cell}`)
        }
      }
    }
    expect(missing).toEqual([])
  })

  it("give the words that the Meaning column of ast/mindmap.md lists", () => {
    const meanings = readFieldMeanings()
    const differing: string[] = []
    for (const [type, fields] of Object.entries(MINDMAP_FIELD_WORDS)) {
      for (const [field, words] of Object.entries(fields)) {
        const meaning = meanings.get(type)?.get(field) ?? ""
        if (JSON.stringify(wordsOfMeaning(meaning)) !== JSON.stringify(words)) {
          differing.push(`${type}.${field}: ${meaning}`)
        }
      }
    }
    expect(differing).toEqual([])
  })
})

// The same sentences against the recorded trees of the corpus: each case
// changes one thing of the tree of a named fixture. The kinds of the tokens
// and the ranges of nodes and statements are not among them (see the top of
// this file).

/** A case that sets `field` of the first node of the type `type` to `value`. */
function setFirst(
  type: string,
  field: string,
  value: unknown,
): MutationCase["mutate"] {
  return (root) => {
    setField(firstNode(root, type), field, value)
  }
}

/** A case that sets the `value` of the node that the field `field` of the first node of the type `type` holds to `value`. */
function setValueOfFirst(
  type: string,
  field: string,
  value: string,
): MutationCase["mutate"] {
  return (root) => {
    setField(firstNode(root, type)[field] as CheckedNode, "value", value)
  }
}

const RECORDED_CASES: readonly MutationCase[] = [
  {
    name: "an indent of the root that is one too many",
    fixture: "db-indent-parent-is-nearest-shallower",
    mutate: setFirst("MindmapNode", "indent", 3),
    expected: indentWas(3, 2),
  },
  {
    name: "a node that is a child of the root, not of the sibling before it",
    fixture: "db-indent-parent-is-nearest-shallower",
    mutate: (root) => {
      const top = firstNode(root, "MindmapNode")
      const children = top.children as CheckedNode[]
      const sibling = children[1]
      if (sibling === undefined) throw new Error("no second child")
      const [grandchild] = sibling.children as CheckedNode[]
      if (grandchild === undefined) throw new Error("no grandchild")
      setField(sibling, "children", [])
      children.push(grandchild)
    },
    expected: CHILDREN,
  },
  {
    name: "a node with neither a node text nor a shape",
    fixture: "db-shape-without-id",
    mutate: setFirst("MindmapNode", "shape", null),
    expected: "has neither a node text nor a shape",
  },
  {
    name: "an opener that is not the written one",
    fixture: "db-shape-circle",
    mutate: setFirst("MindmapShape", "opener", "("),
    expected: 'the opener: "((", not "("',
  },
  {
    name: "a closer that is not the written one",
    fixture: "db-shape-circle",
    mutate: setFirst("MindmapShape", "closer", ")"),
    expected: 'the closer: "))", not ")"',
  },
  {
    name: "an opener that is none of the openers",
    fixture: "db-shape-circle",
    mutate: setFirst("MindmapShape", "opener", "<"),
    expected: 'the field opener is "<", none of',
  },
  {
    name: "a kind of a label that is none of the kinds",
    fixture: "db-shape-circle",
    mutate: setFirst("MindmapLabel", "kind", "word"),
    expected: 'the field kind is "word", none of text, string, markdown',
  },
  {
    name: "a string recorded as a text",
    fixture: "db-shape-string",
    mutate: setFirst("MindmapLabel", "kind", "text"),
    expected: "value is not its written text",
  },
  {
    name: "an empty markdown label",
    fixture: "db-shape-markdown-string",
    mutate: setFirst("MindmapLabel", "value", ""),
    expected: "the label is empty",
  },
  {
    name: "an empty class",
    fixture: "db-class-line",
    mutate: setValueOfFirst("MindmapClassStatement", "cssClass", ""),
    expected: "the literal is empty",
  },
  {
    name: "an icon that holds a `)`",
    fixture: "db-icon-line",
    mutate: setValueOfFirst("MindmapIconStatement", "icon", "fa fa-book)"),
    expected: 'the icon "fa fa-book)" holds a `)`, which ends it',
  },
  {
    name: "a label as the node text of a node",
    fixture: "db-shape-circle",
    mutate: (root) => {
      const shape = firstNode(root, "MindmapShape")
      setField(firstNode(root, "MindmapNode"), "id", shape.label)
    },
    expected: "the field id holds a MindmapLabel, not a MindmapLiteral",
  },
  {
    name: "a comment whose range includes the line separator that ends it",
    fixture: "lex-comment-ends-at-line-separator",
    mutate: (root) => {
      const [comment] = root.comments
      if (comment === undefined) throw new Error("no comment")
      setField(comment, "range", [comment.range[0], comment.range[1] + 1])
    },
    expected: "ends with a line terminator",
  },
]

const OWN_KIND = "the kind of a token that the node writes itself"
const HULL =
  "the range, which runs from the first of its tokens and child nodes to the last"
const OWN_JOINED = "the tokens of the node outside its child nodes, joined"

/** Sets the range of the `index`-th (from 0) node of the type `type`, in the order of the tree, to `range(node)`. */
function rangeOf(
  type: string,
  index: number,
  range: (node: CheckedNode) => [number, number],
): MutationCase["mutate"] {
  return (root) => {
    const node = nodesOf(root).filter((candidate) => candidate.type === type)[
      index
    ]
    if (node === undefined) throw new Error(`the tree has no ${type} ${index}`)
    setField(node, "range", range(node))
  }
}

/** Sets the kind of the first token of the tree with the text `value` to `to`. */
function retypeToken(value: string, to: string): MutationCase["mutate"] {
  return (root) => {
    const token = root.tokens.find((candidate) => candidate.value === value)
    if (token === undefined) throw new Error(`the tree has no token ${value}`)
    setField(token, "type", to)
  }
}

/** Removes the first token of the kind `kind` with the text `value` from the tokens of the tree. */
function dropToken(kind: string, value: string): MutationCase["mutate"] {
  return (root) => {
    const index = root.tokens.findIndex(
      (token) => token.type === kind && token.value === value,
    )
    if (index === -1) throw new Error(`the tree has no ${kind} ${value}`)
    setField(
      root,
      "tokens",
      root.tokens.filter((_, position) => position !== index),
    )
  }
}

const RECORDED_TOKEN_AND_RANGE_CASES: readonly MutationCase[] = [
  // ast.md, Nodes: the child fields of a node, here `id`, `shape`,
  // `decorations`, and `children`, are in source order, and so is a list.
  {
    name: "the decorations and the children of a node that change places",
    fixture: "gram-icon-then-child",
    mutate: (root) => {
      const node = firstNode(root, "MindmapNode")
      const { decorations, children } = node
      setField(node, "decorations", children)
      setField(node, "children", decorations)
    },
    expected: "which the child fields list before it",
  },
  {
    name: "the two decorations of a node that change places",
    fixture: "db-class-then-icon-on-node",
    mutate: (root) => {
      const node = firstNode(root, "MindmapNode")
      setField(
        node,
        "decorations",
        [...(node.decorations as unknown[])].reverse(),
      )
    },
    expected: "which the child fields list before it",
  },
  // parser/docs/tokens/mindmap.md, Tokens: the tokens that a node writes itself.
  {
    name: "the header as a RawText token",
    fixture: "db-header-only",
    mutate: retypeIn("MindmapDiagram", "Keyword", "mindmap", "RawText"),
    expected: `${OWN_KIND}: "RawText", not "Keyword"`,
  },
  {
    name: "`::icon(` as a Punctuator token",
    fixture: "db-icon-line",
    mutate: retypeIn(
      "MindmapIconStatement",
      "Keyword",
      "::icon(",
      "Punctuator",
    ),
    expected: `${OWN_KIND}: "Punctuator", not "Keyword"`,
  },
  {
    name: "the `)` of an icon line as a Keyword token",
    fixture: "db-icon-line",
    mutate: retypeIn("MindmapIconStatement", "Punctuator", ")", "Keyword"),
    expected: `${OWN_KIND}: "Keyword", not "Punctuator"`,
  },
  {
    name: "the `:::` of a class line as a Keyword token",
    fixture: "db-class-line",
    mutate: retypeIn("MindmapClassStatement", "Punctuator", ":::", "Keyword"),
    expected: `${OWN_KIND}: "Keyword", not "Punctuator"`,
  },
  {
    name: "the opener of a shape as a Keyword token",
    fixture: "db-shape-rect",
    mutate: retypeIn("MindmapShape", "Punctuator", "[", "Keyword"),
    expected: `${OWN_KIND}: "Keyword", not "Punctuator"`,
  },
  {
    name: "the closer of a shape as a Keyword token",
    fixture: "db-shape-rect",
    mutate: retypeIn("MindmapShape", "Punctuator", "]", "Keyword"),
    expected: `${OWN_KIND}: "Keyword", not "Punctuator"`,
  },
  {
    name: "the closer of an icon line that is left out",
    fixture: "db-icon-line",
    mutate: dropToken("Punctuator", ")"),
    expected: `${OWN_JOINED}: "::icon(", not "::icon()"`,
  },
  {
    name: "the header in upper case",
    fixture: "db-header-only",
    mutate: (root) => {
      const header = root.tokens[0]
      if (header === undefined) throw new Error("no token")
      setField(header, "value", "MINDMAP")
    },
    expected: `${OWN_JOINED}: "MINDMAP", not "mindmap"`,
  },
  // parser/docs/tokens/mindmap.md, Tokens: the tokens of a text and of a string.
  {
    name: "the node text as an Identifier token",
    fixture: "db-shape-circle",
    mutate: retypeIn("MindmapLiteral", "RawText", "r", "Identifier"),
    expected: "the tokens of a text are not all of the kind RawText",
  },
  {
    name: "the text of a label as a String token",
    fixture: "db-shape-circle",
    mutate: retypeIn("MindmapLabel", "RawText", "text", "String"),
    expected: "the tokens of a text are not all of the kind RawText",
  },
  {
    name: "the icon as a Keyword token",
    fixture: "db-icon-line",
    mutate: retypeToken("fa fa-book", "Keyword"),
    expected: "the tokens of a text are not all of the kind RawText",
  },
  {
    name: "the class as a Keyword token",
    fixture: "db-class-line",
    mutate: retypeToken("big red", "Keyword"),
    expected: "the tokens of a text are not all of the kind RawText",
  },
  {
    name: "a string as a RawText token",
    fixture: "db-shape-string",
    mutate: retypeIn("MindmapLabel", "String", null, "RawText"),
    expected:
      "the tokens of a string are not all of the kind String or StringFragment",
  },
  {
    name: "a markdown string as a RawText token",
    fixture: "db-shape-markdown-string",
    mutate: retypeIn("MindmapLabel", "String", null, "RawText"),
    expected:
      "the tokens of a markdown are not all of the kind String or StringFragment",
  },
  // parser/docs/positions/mindmap.md, Ranges: MindmapNode.
  {
    name: "a node that ends before the last token of its last descendant",
    fixture: "gram-icon-then-child",
    mutate: setEnd("MindmapNode", (root) => root.tokens[1]?.range[1] ?? 0),
    expected: HULL,
  },
  {
    name: "a node whose range covers the line break after its last descendant",
    fixture: "db-indent-sibling-after-deeper",
    mutate: rangeOf("MindmapNode", 2, (node) => [
      node.range[0],
      node.range[1] + 1,
    ]),
    expected: HULL,
  },
  {
    name: "a node whose range starts in the indentation before it",
    fixture: "db-indent-sibling-after-deeper",
    mutate: rangeOf("MindmapNode", 1, (node) => [
      node.range[0] - 2,
      node.range[1],
    ]),
    expected: HULL,
  },
  {
    name: "a root on the line of the header that starts at the header",
    fixture: "db-first-node-on-header-line",
    mutate: rangeOf("MindmapNode", 0, (node) => [0, node.range[1]]),
    expected: `${OWN_JOINED}: "mindmap", not ""`,
  },
  // parser/docs/positions/mindmap.md, Ranges: MindmapShape, MindmapIconStatement, MindmapClassStatement.
  {
    name: "a shape that ends before its closer",
    fixture: "db-shape-rect",
    mutate: rangeOf("MindmapShape", 0, (node) => [
      node.range[0],
      node.range[1] - 1,
    ]),
    expected: `${OWN_JOINED}: "[", not "[]"`,
  },
  {
    name: "an icon line that ends before its `)`",
    fixture: "db-icon-line",
    mutate: rangeOf("MindmapIconStatement", 0, (node) => [
      node.range[0],
      node.range[1] - 1,
    ]),
    expected: `${OWN_JOINED}: "::icon(", not "::icon()"`,
  },
  {
    name: "a class line that ends before the whitespace at the end of its class",
    fixture: "db-class-trailing-space",
    mutate: rangeOf("MindmapClassStatement", 0, (node) => [
      node.range[0],
      node.range[1] - 2,
    ]),
    expected: HULL,
  },
  {
    name: "a class line that covers the line feed after its class",
    fixture: "db-class-trailing-space",
    mutate: rangeOf("MindmapClassStatement", 0, (node) => [
      node.range[0],
      node.range[1] + 1,
    ]),
    expected: HULL,
  },
  {
    name: "a diagram that ends before its root",
    fixture: "db-shape-rect",
    mutate: rangeOf("MindmapDiagram", 0, (node) => [
      node.range[0],
      node.range[1] - 1,
    ]),
    expected: HULL,
  },
  // parser/docs/positions/mindmap.md, Ranges: MindmapLabel and MindmapLiteral.
  {
    name: "a markdown string whose range leaves out its delimiters",
    fixture: "db-shape-markdown-string",
    mutate: rangeOf("MindmapLabel", 0, (node) => [
      node.range[0] + 2,
      node.range[1] - 2,
    ]),
    expected: "does not run from the start of a token to the end of a token",
  },
  {
    name: "a node text whose range leaves out the whitespace at its end",
    fixture: "db-node-trailing-whitespace",
    mutate: rangeOf("MindmapLiteral", 0, (node) => [
      node.range[0],
      node.range[1] - 1,
    ]),
    expected: "does not run from the start of a token to the end of a token",
  },
]

describe("the check of a mindmap tree against the recorded trees", () => {
  for (const mutation of [
    ...RECORDED_CASES,
    ...RECORDED_TOKEN_AND_RANGE_CASES,
  ]) {
    it(`passes the recorded tree of ${mutation.fixture} and fails ${mutation.name}`, () => {
      const { base, mutated } = problemsOf("mindmap", mutation)
      expect(base).toEqual([])
      expect(
        says(mutated, mutation.expected),
        JSON.stringify(mutated, null, 1),
      ).toBe(true)
    })
  }
})
