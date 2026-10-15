import {
  isLineTerminatorCode,
  isWhitespace,
  isWordCharacter,
} from "../db-from-tree/characters.ts"
import type { TreeRange } from "../db-from-tree/tree.ts"
import { checkChildTypes, checkFieldWords } from "./field-rules.ts"
import type { Problems } from "./problems.ts"
import { label } from "./problems.ts"
import {
  between,
  checkJoinedOwnText,
  checkOwnKinds,
  checkRangeIsHull,
  checkTokenKinds,
  childOf,
  ownOf,
  readingOf,
  nextWrittenCharacter,
  startsWithWhitespace,
  textOf,
} from "./statement-checks.ts"
import type { Reading } from "./statement-checks.ts"
import { checkTokensInValueNodes, nodeTokensIn } from "./tokens.ts"
import type { CheckedNode, CheckedRoot } from "./types.ts"
import type { StringDelimitersOf } from "./values.ts"
import { isNode, nodesOf, walkNodes } from "./walk.ts"
import { WrittenText } from "./written-text.ts"

// ast/mindmap.md and diagrams/mindmap.md: what the mindmap documents state
// about the tree beyond the conditions of every tree (ast.md), as far as the
// tree and the source text say it; parser/docs/tokens/mindmap.md and
// parser/docs/positions/mindmap.md: the kinds of the tokens and the ranges of
// the nodes.

/** ast/mindmap.md, MindmapShape: the texts of the openers. */
export const MINDMAP_OPENERS: readonly string[] = [
  "(",
  "((",
  "[",
  "{{",
  ")",
  "))",
  "(-",
  "-)",
]

/** ast/mindmap.md, MindmapShape: the texts of the closers. */
export const MINDMAP_CLOSERS: readonly string[] = [
  ")",
  "))",
  "]",
  "}}",
  "(",
  "((",
  "(-",
  "-)",
]

/**
 * parser/docs/tokens/mindmap.md, Tokens: the texts of the `Punctuator`
 * tokens that a node writes itself, one entry for each text: the class marker,
 * the `)` of an icon line, and the openers and closers of a shape. Every other
 * token that a node writes itself is a `Keyword` token (the header and
 * `::icon(`). `tests/check-tree-punctuators.test.ts` requires the table of
 * the `Punctuator` tokens to agree with the row of the document.
 */
export const MINDMAP_PUNCTUATORS: readonly string[] = [
  ":::",
  ")",
  "))",
  "(",
  "((",
  "[",
  "]",
  "{{",
  "}}",
  "(-",
  "-)",
]

/** ast/mindmap.md, MindmapLabel: the kinds of a label. */
export const MINDMAP_LABEL_KINDS: readonly string[] = [
  "text",
  "string",
  "markdown",
]

/**
 * The words that a value field of a node type has, by node type and field.
 * `tests/check-tree-mindmap.test.ts` requires each list to be the words that
 * the Meaning column of ast/mindmap.md gives for the field.
 */
export const MINDMAP_FIELD_WORDS: Readonly<
  Record<string, Readonly<Record<string, readonly string[]>>>
> = {
  MindmapShape: { opener: MINDMAP_OPENERS, closer: MINDMAP_CLOSERS },
  MindmapLabel: { kind: MINDMAP_LABEL_KINDS },
}

/**
 * ast/mindmap.md: the node types that a field of a node type holds, as the
 * Type column of its table gives them; a field that holds a value is not in
 * it. `tests/check-tree-mindmap.test.ts` requires the table to be that column.
 */
export const MINDMAP_CHILD_TYPES: Readonly<
  Record<string, Readonly<Record<string, readonly string[]>>>
> = {
  MindmapDiagram: { root: ["MindmapNode"] },
  MindmapNode: {
    id: ["MindmapLiteral"],
    shape: ["MindmapShape"],
    decorations: ["MindmapIconStatement", "MindmapClassStatement"],
    children: ["MindmapNode"],
  },
  MindmapShape: { label: ["MindmapLabel"] },
  MindmapIconStatement: { icon: ["MindmapLiteral"] },
  MindmapClassStatement: { cssClass: ["MindmapLiteral"] },
}

/**
 * diagrams/mindmap.md, The shape context, rules 1 and 2: the delimiters of a
 * string and of a markdown string, which belong to the label and lie in its
 * range; the value is what lies between them.
 */
const LABEL_DELIMITERS: ReadonlyMap<string, readonly [string, string]> =
  new Map([
    ["string", ['"', '"']],
    ["markdown", ['"`', '`"']],
  ])

/**
 * diagrams/mindmap.md, The shape context, rules 1, 2, and 4: the characters
 * that a label of each kind holds none of. A shape text runs to the first
 * `)`, `]`, `(`, or `}`; a string ends at the first `"`; a markdown string
 * ends at the first backquote or `"`.
 */
const LABEL_NEVER_HOLDS: ReadonlyMap<string, readonly string[]> = new Map([
  ["text", [")", "]", "(", "}"]],
  ["string", ['"']],
  ["markdown", ["`", '"']],
])

/**
 * diagrams/mindmap.md, Units and contexts, Node texts: the characters that a
 * node text holds none of, `(`, `[`, `)`, `{`, `}`, and a line feed (a CR is
 * a line feed).
 */
const NODE_TEXT_NEVER_HOLDS: readonly string[] = [
  "(",
  "[",
  ")",
  "{",
  "}",
  "\n",
  "\r",
]

/**
 * diagrams/mindmap.md, The statement context, rules 1, 3, and 4: what a node
 * text does not start with, since a unit that starts with it is read by a rule
 * that comes before the rule of the node text: a diagram comment, a class
 * line, and an icon line, in lower case. The keyword `mindmap` of rule 2 is a
 * keyword only where no word character follows it, so it is looked at on its
 * own.
 */
const NODE_TEXT_NEVER_STARTS_WITH: readonly string[] = ["%%", ":::", "::icon("]

/** diagrams/mindmap.md, The statement context, rule 2, and Detection: the keyword of the header, which is written in lower case. */
const HEADER_KEYWORD = "mindmap"

/** diagrams/mindmap.md, The icon and class contexts: the text before the icon, in lower case. */
const ICON_START = "::icon("

/** diagrams/mindmap.md, The icon and class contexts: the text before the class. */
const CLASS_START = ":::"

/** diagrams/mindmap.md, The icon and class contexts: the characters that a class holds none of; the first of them ends it. */
const CLASS_ENDS: readonly string[] = ["\n", "\r", "\u2028", "\u2029"]

/** The first character of `characters` that `value` holds, none if it holds none of them. */
function firstHeld(
  value: string,
  characters: readonly string[],
): string | undefined {
  return characters.find((character) => value.includes(character))
}

/** The last `count` characters of the written text before `offset`; fewer at the start of the text. */
function writtenBefore(
  reading: Reading,
  offset: number,
  count: number,
): string {
  let found = ""
  for (let at = offset - 1; at >= 0 && found.length < count; at--) {
    if (!reading.written.isLeftOut(at)) found = reading.text.charAt(at) + found
  }
  return found
}

/**
 * diagrams/mindmap.md, Units and contexts: the indentation of a node is the
 * whitespace characters before it on its line, in the text without its
 * directives, every one of them (a tab, a U+3000, a U+2028) counted as one.
 * The line starts after a line terminator, or at the start of the text; where
 * the node follows the header on its line, the whitespace after the header is
 * its indentation.
 */
function indentationBefore(reading: Reading, offset: number): number {
  let count = 0
  for (let at = offset - 1; at >= 0; at--) {
    if (reading.written.isLeftOut(at)) continue
    const code = reading.text.charCodeAt(at)
    if (isLineTerminatorCode(code) || !isWhitespace(code)) break
    count++
  }
  return count
}

/**
 * The delimiters of the labels of the tree (see {@link LABEL_DELIMITERS}):
 * none for a text. A delimiter is the first characters of the written text of
 * the label and its last characters, one range for each character, since a
 * directive may lie between the two characters of a delimiter of a markdown
 * string (`"`, a directive, and a backquote), and the directive is no part of
 * the text.
 */
export function mindmapLabelDelimitersFor(
  text: string,
  root: CheckedRoot,
): StringDelimitersOf {
  const written = new WrittenText(text, root)
  return (node) => {
    const delimiters = LABEL_DELIMITERS.get(textOf(node, "kind"))
    if (delimiters === undefined) return []
    const [opening, closing] = delimiters
    const writtenOffsets: number[] = []
    for (let offset = node.range[0]; offset < node.range[1]; offset++) {
      if (!written.isLeftOut(offset)) writtenOffsets.push(offset)
    }
    return [
      ...writtenOffsets.slice(0, opening.length),
      ...writtenOffsets.slice(-closing.length),
    ].map((offset): TreeRange => [offset, offset + 1])
  }
}

/**
 * ast/mindmap.md, MindmapNode, and diagrams/mindmap.md, Units and contexts,
 * The statement context, and Nodes and shapes: a node is a node text, a node
 * text and a shape, or a shape alone; its `indent` is the number of
 * whitespace characters before it on its line; the node text runs to the
 * first `(`, `[`, `)`, `{`, or `}`, which starts the shape, or to the end of
 * its line, so that it keeps the whitespace at its end and the shape starts
 * where it ends; and a unit that starts with `-)` is a shape, so the opener
 * `-)` is the opener of a shape alone.
 */
function checkNode(reading: Reading, node: CheckedNode): void {
  const where = label(node)
  const id = childOf(node, "id")
  const shape = childOf(node, "shape")
  reading.problems.expect(
    Number.isInteger(node.indent) && (node.indent as number) >= 0,
    where,
    `the indent ${JSON.stringify(node.indent)} is no integer of 0 or more`,
  )
  if (id === null && shape === null) {
    reading.problems.report(where, "has neither a node text nor a shape")
    return
  }
  reading.problems.expectEqual(
    node.indent,
    indentationBefore(reading, node.range[0]),
    where,
    "the indent, which is the number of whitespace characters before the node on its line",
  )
  if (id !== null && shape !== null) {
    const gap = between(reading, id.range[1], shape.range[0])
    reading.problems.expect(
      gap === "",
      where,
      `the written text between the node text and the shape is ${JSON.stringify(gap)}, not empty: the node text runs to the shape`,
    )
    reading.problems.expect(
      textOf(shape, "opener") !== "-)",
      where,
      "the shape after a node text has the opener `-)`, which only a shape that starts a unit has",
    )
  }
  if (id !== null && shape === null) {
    const next = nextWrittenCharacter(reading, id.range[1])
    reading.problems.expect(
      next === undefined || isLineTerminatorCode(next.charCodeAt(0)),
      where,
      `the node text ends before ${JSON.stringify(next)}, which does not end its line: a node text runs to the end of its line or to a shape`,
    )
  }
}

/**
 * ast/mindmap.md, MindmapShape, and diagrams/mindmap.md, The shape context
 * and Nodes and shapes: the shape is written as its opener, its label, and its
 * closer, and nothing else; the closer `-)` follows only a string or a
 * markdown string, since a shape text reads a `-` before a `)`.
 */
function checkShape(reading: Reading, node: CheckedNode): void {
  const where = label(node)
  const textLabel = childOf(node, "label")
  if (textLabel === null) return
  reading.problems.expectEqual(
    between(reading, node.range[0], textLabel.range[0]),
    textOf(node, "opener"),
    where,
    "the written text before the label, which is the opener",
  )
  reading.problems.expectEqual(
    between(reading, textLabel.range[1], node.range[1]),
    textOf(node, "closer"),
    where,
    "the written text after the label, which is the closer",
  )
  reading.problems.expect(
    textOf(node, "closer") !== "-)" || textOf(textLabel, "kind") !== "text",
    where,
    "the closer `-)` follows a text, which reads the `-` before the `)` as its own",
  )
}

/**
 * ast/mindmap.md, MindmapLabel, and diagrams/mindmap.md, The shape context:
 * the label is never empty; a string and a markdown string are written with
 * their delimiters, which the value leaves out, and a text starts with no
 * `"`, since the rule of a string comes before the rule of a text; and the value holds none of the characters
 * that end a label of its kind.
 */
function checkLabel(reading: Reading, node: CheckedNode): void {
  const where = label(node)
  const kind = textOf(node, "kind")
  const value = textOf(node)
  reading.problems.expect(value !== "", where, "the label is empty")
  const delimiters = LABEL_DELIMITERS.get(kind)
  if (delimiters === undefined) {
    reading.problems.expect(
      !value.startsWith('"'),
      where,
      `the text ${JSON.stringify(value)} starts with a \`"\`, with which a string starts`,
    )
  } else {
    const [opening, closing] = delimiters
    const written = between(reading, node.range[0], node.range[1])
    reading.problems.expect(
      written.startsWith(opening) && written.endsWith(closing),
      where,
      `the written text ${JSON.stringify(written)} of a ${kind} does not start with ${JSON.stringify(opening)} and end with ${JSON.stringify(closing)}`,
    )
  }
  const held = firstHeld(value, LABEL_NEVER_HOLDS.get(kind) ?? [])
  reading.problems.expect(
    held === undefined,
    where,
    `the value ${JSON.stringify(value)} of a ${kind} holds ${JSON.stringify(held)}, which ends it`,
  )
}

/**
 * diagrams/mindmap.md, Units and contexts, Node texts, and The statement
 * context: a node text starts with no whitespace, which is the indentation,
 * and with none of the units that a rule before the node text reads (a
 * diagram comment, an icon line, a class line, the header keyword), and holds
 * none of the characters that end it. It keeps the whitespace at its end,
 * which {@link checkNode} checks against the text after it.
 */
function checkNodeText(reading: Reading, node: CheckedNode): void {
  const where = label(node)
  const value = textOf(node)
  const held = firstHeld(value, NODE_TEXT_NEVER_HOLDS)
  reading.problems.expect(
    held === undefined,
    where,
    `the node text ${JSON.stringify(value)} holds ${JSON.stringify(held)}, which ends a node text`,
  )
  reading.problems.expect(
    !startsWithWhitespace(value),
    where,
    `the node text ${JSON.stringify(value)} starts with whitespace, which is the indentation`,
  )
  const lower = value.toLowerCase()
  const reads = NODE_TEXT_NEVER_STARTS_WITH.find((unit) =>
    lower.startsWith(unit),
  )
  reading.problems.expect(
    reads === undefined,
    where,
    `the node text ${JSON.stringify(value)} starts with ${JSON.stringify(reads)}, which a rule before the rule of the node text reads`,
  )
  reading.problems.expect(
    !(
      lower.startsWith(HEADER_KEYWORD) &&
      !isWordCharacter(lower.charCodeAt(HEADER_KEYWORD.length))
    ),
    where,
    `the node text ${JSON.stringify(value)} starts with the keyword \`${HEADER_KEYWORD}\`, which a rule before the rule of the node text reads`,
  )
}

/**
 * diagrams/mindmap.md, The icon and class contexts: an icon lies between
 * `::icon(` (in any case) and `)`, whatever whitespace is next to them, and
 * holds no `)`.
 */
function checkIconText(reading: Reading, node: CheckedNode): void {
  const where = label(node)
  const value = textOf(node)
  reading.problems.expect(
    !value.includes(")"),
    where,
    `the icon ${JSON.stringify(value)} holds a \`)\`, which ends it`,
  )
  const before = writtenBefore(reading, node.range[0], ICON_START.length)
  reading.problems.expect(
    before.toLowerCase() === ICON_START,
    where,
    `the written text before the icon is ${JSON.stringify(before)}, not \`${ICON_START}\``,
  )
  const after = nextWrittenCharacter(reading, node.range[1])
  reading.problems.expect(
    after === ")",
    where,
    `the written text after the icon starts with ${JSON.stringify(after)}, not \`)\``,
  )
}

/**
 * diagrams/mindmap.md, The icon and class contexts: a class lies after `:::`
 * to the end of its line segment (a line feed, a U+2028, a U+2029, or the end
 * of the text), and holds none of them.
 */
function checkClassText(reading: Reading, node: CheckedNode): void {
  const where = label(node)
  const value = textOf(node)
  const held = firstHeld(value, CLASS_ENDS)
  reading.problems.expect(
    held === undefined,
    where,
    `the class ${JSON.stringify(value)} holds ${JSON.stringify(held)}, which ends a class`,
  )
  const before = writtenBefore(reading, node.range[0], CLASS_START.length)
  reading.problems.expect(
    before === CLASS_START,
    where,
    `the written text before the class is ${JSON.stringify(before)}, not \`${CLASS_START}\``,
  )
  const after = nextWrittenCharacter(reading, node.range[1])
  reading.problems.expect(
    after === undefined || CLASS_ENDS.includes(after),
    where,
    `the class ends before ${JSON.stringify(after)}, which does not end its line segment: a class runs to the end of its line segment`,
  )
}

/** The check of a literal by the type of the node that holds it: its node text, its icon, or its class. */
const LITERAL_CHECKS: ReadonlyMap<
  string,
  (reading: Reading, node: CheckedNode) => void
> = new Map([
  ["MindmapNode", checkNodeText],
  ["MindmapIconStatement", checkIconText],
  ["MindmapClassStatement", checkClassText],
])

/**
 * ast/mindmap.md, MindmapLiteral: the text of a node, an icon, or a class is
 * not empty, and keeps the whitespace that lies in its unit, which the check
 * of its kind reads.
 */
function checkLiteral(
  reading: Reading,
  node: CheckedNode,
  parent: CheckedNode | null,
): void {
  reading.problems.expect(
    textOf(node) !== "",
    label(node),
    "the literal is empty",
  )
  LITERAL_CHECKS.get(parent?.type ?? "")?.(reading, node)
}

/** The tokens that a node writes itself, joined, and whether the case of the letters is ignored when they are compared. */
interface OwnText {
  readonly text: string
  readonly ignoresCase: boolean
}

/**
 * parser/docs/tokens/mindmap.md, Tokens: the tokens that a node writes itself,
 * joined, by node type, and whether the case of the letters is ignored. The
 * header is the keyword in lower case; `::icon(` is read in any case; a shape
 * writes its opener and its closer; a node and its text write no token of their
 * own.
 */
const OWN_TEXTS: ReadonlyMap<string, (node: CheckedNode) => OwnText> = new Map<
  string,
  (node: CheckedNode) => OwnText
>([
  ["MindmapDiagram", () => ({ text: HEADER_KEYWORD, ignoresCase: false })],
  ["MindmapNode", () => ({ text: "", ignoresCase: false })],
  [
    "MindmapShape",
    (node) => ({
      text: textOf(node, "opener") + textOf(node, "closer"),
      ignoresCase: false,
    }),
  ],
  [
    "MindmapIconStatement",
    () => ({ text: `${ICON_START})`, ignoresCase: true }),
  ],
  ["MindmapClassStatement", () => ({ text: CLASS_START, ignoresCase: false })],
])

/**
 * parser/docs/tokens/mindmap.md, Tokens, and parser/docs/positions/mindmap.md,
 * Ranges: the tokens that a node writes itself are `Punctuator` tokens for the
 * texts of {@link MINDMAP_PUNCTUATORS} and `Keyword` tokens for the others,
 * those of the node text, the shape text, the icon, and the class are `RawText`
 * tokens, and those of a string and a markdown string are `String` or
 * `StringFragment` tokens. The range of a node runs from the first of its
 * tokens and child nodes to the last; the range of a leaf is that of its
 * tokens, which the checks of every tree read.
 */
function checkTokensAndRange(reading: Reading, node: CheckedNode): void {
  if (node.type === "MindmapLiteral" || node.type === "MindmapLabel") {
    const isString =
      textOf(node, "kind") !== "text" && node.type === "MindmapLabel"
    const what =
      node.type === "MindmapLabel" ? `a ${textOf(node, "kind")}` : "a text"
    if (!isString) {
      checkTokenKinds(reading, node, ["RawText"], what)
      return
    }
    const kinds = nodeTokensIn(reading.root, node.range).map(
      (token) => token.type,
    )
    const expected = reading.written.stringTokenKinds(node.range)
    reading.problems.expect(
      kinds.length === expected.length &&
        kinds.every((kind, index) => kind === expected[index]),
      label(node),
      `the tokens of ${what} are not all of the kind String or StringFragment, one String token where nothing cuts it and one StringFragment token more than there are cuts: ${kinds.join(", ")}`,
    )
    return
  }
  const own = ownOf(reading.root, node)
  checkOwnKinds(reading, node, own, MINDMAP_PUNCTUATORS)
  checkRangeIsHull(reading, node, own)
  const expected = OWN_TEXTS.get(node.type)?.(node)
  if (expected !== undefined) {
    checkJoinedOwnText(reading, node, own, expected.text, expected.ignoresCase)
  }
}

/** The nodes of the tree, in the order of the source: by where they start. */
function nodesInSourceOrder(root: CheckedRoot): CheckedNode[] {
  return nodesOf(root)
    .filter((node) => node.type === "MindmapNode")
    .sort((a, b) => a.range[0] - b.range[0])
}

/** The nodes in the list `field` of `node`; the form of a tree makes it a list of nodes. */
function nodesIn(node: CheckedNode, field: string): CheckedNode[] {
  return (node[field] as unknown[]).filter(isNode)
}

/**
 * ast/mindmap.md, MindmapNode, and diagrams/mindmap.md, Indentation and
 * parents: every node but the first, the root, is a child of the nearest node
 * before it whose indentation is smaller than its own, so a node as indented
 * as an earlier one is a sibling of it, after the nodes below that one. The
 * children of a node are those nodes, in source order. A node that is not the
 * first and has no such node would be a second root, which the input does not
 * have.
 */
function checkParents(reading: Reading, ordered: readonly CheckedNode[]): void {
  const expectedChildren = new Map<CheckedNode, CheckedNode[]>()
  const earlier: CheckedNode[] = []
  for (const [index, node] of ordered.entries()) {
    let parent = earlier.at(-1)
    while (
      parent !== undefined &&
      Number(parent.indent) >= Number(node.indent)
    ) {
      earlier.pop()
      parent = earlier.at(-1)
    }
    if (parent === undefined) {
      reading.problems.expect(
        index === 0,
        label(node),
        "is not the first node and has no node before it with a smaller indent, so it would be a second root",
      )
    } else {
      expectedChildren.set(parent, [
        ...(expectedChildren.get(parent) ?? []),
        node,
      ])
    }
    earlier.push(node)
  }
  for (const node of ordered) {
    reading.problems.expectEqual(
      nodesIn(node, "children").map((child) => child.range),
      (expectedChildren.get(node) ?? []).map((child) => child.range),
      label(node),
      "the ranges of the children, which are the nodes whose nearest earlier node with a smaller indent is this one",
    )
  }
}

/**
 * ast/mindmap.md, MindmapNode: the decorations of a node are the icon and
 * class lines between its line and the next node line, whatever their
 * indentation, because mermaid.js gives them to the node it added last: each
 * starts after the text of the node and ends before the next node in the
 * source, whichever node that is.
 */
function checkDecorations(
  reading: Reading,
  ordered: readonly CheckedNode[],
): void {
  for (const [index, node] of ordered.entries()) {
    const next = ordered[index + 1]
    const own = childOf(node, "shape") ?? childOf(node, "id")
    // A node with neither is reported by `checkNode()`.
    if (own === null) continue
    for (const decoration of nodesIn(node, "decorations")) {
      reading.problems.expect(
        own.range[1] < decoration.range[0],
        label(node),
        `the decoration ${label(decoration)} does not start after the text of the node ends`,
      )
      reading.problems.expect(
        next === undefined || decoration.range[1] < next.range[0],
        label(node),
        `the decoration ${label(decoration)} does not end before the next node starts, which it decorates`,
      )
    }
  }
}

/** The check of each node type that has one besides its literals (see {@link checkLiteral}). */
const NODE_CHECKS: ReadonlyMap<
  string,
  (reading: Reading, node: CheckedNode) => void
> = new Map([
  ["MindmapNode", checkNode],
  ["MindmapShape", checkShape],
  ["MindmapLabel", checkLabel],
])

/**
 * Checks what the mindmap documents state about a mindmap tree beyond the
 * conditions of every tree (ast.md): the child nodes are of the types that
 * the tables give; the words of the fields are those of the documents; a node
 * has a node text, a shape, or both, an `indent` that is the whitespace before
 * it on its line, and the parent that its indentation gives it; the
 * decorations of a node lie between its line and the next node; and the leaves
 * keep what their unit holds: a literal and a label are not empty, hold none
 * of the characters that end their unit, and lie between the text that
 * delimits them.
 */
export function checkMindmapTree(
  text: string,
  root: CheckedRoot,
  problems: Problems,
): void {
  checkTokensInValueNodes(root, problems)
  const reading = readingOf(text, root, problems)
  walkNodes(root, (node, parent) => {
    // The root holds the tokens of the frontmatter, which no statement has.
    if (node.type !== "Root") checkTokensAndRange(reading, node)
    checkChildTypes(reading, node, MINDMAP_CHILD_TYPES)
    checkFieldWords(reading, node, MINDMAP_FIELD_WORDS)
    if (node.type === "MindmapLiteral") {
      checkLiteral(reading, node, parent)
    } else {
      NODE_CHECKS.get(node.type)?.(reading, node)
    }
  })
  const ordered = nodesInSourceOrder(root)
  checkParents(reading, ordered)
  checkDecorations(reading, ordered)
}
