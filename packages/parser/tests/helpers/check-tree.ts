import { expect } from "vitest"
import { isWhitespace } from "../../src/character-classes.ts"
import type {
  Comment,
  Directive,
  FlowchartDiagram,
  FlowchartLink,
  FlowchartShape,
  Location,
  Node,
  Position,
  Range,
  Root,
  SequenceArrow,
  Token,
} from "../../src/index.ts"
import { traverseNodes } from "../../src/index.ts"
import { openSource } from "../../src/parse.ts"
import { FlowchartSource } from "./flowchart-source.ts"

/** Something of the tree that has a place in the source: a node, a token, a comment, a directive, or the frontmatter. */
interface Placed {
  readonly type: string
  readonly range: Range
  readonly loc: Location
}

/** Line and column of `offset`, counting `\r\n`, `\r`, and `\n` as one line terminator each. */
function positionOf(text: string, offset: number): Position {
  let line = 1
  let lineStart = 0
  for (let i = 0; i < offset; i++) {
    const c = text[i]
    if (c === "\n" || (c === "\r" && text[i + 1] !== "\n")) {
      line++
      lineStart = i + 1
    }
  }
  return { line, column: offset - lineStart }
}

/** `type` and range of `placed`, for messages. */
function label(placed: Placed): string {
  return `${placed.type} at ${placed.range[0]}-${placed.range[1]}`
}

/** Whether the two ranges share a character. */
function overlap(a: Range, b: Range): boolean {
  return a[0] < b[1] && b[0] < a[1]
}

/** Whether `outer` holds every character of `inner`. */
function contains(outer: Range, inner: Range): boolean {
  return outer[0] <= inner[0] && inner[1] <= outer[1]
}

/**
 * ast.md, Tokens and Nodes: the tokens of `root` that its diagram's lexer
 * made, without the `Directive` tokens and the tokens in the range of the
 * frontmatter, which are no node's tokens.
 */
function diagramTokensOf(root: Root): Token[] {
  const frontmatterEnd = root.frontmatter?.range[1] ?? 0
  return root.tokens.filter(
    (token) => token.type !== "Directive" && token.range[0] >= frontmatterEnd,
  )
}

/** Whether the character of `text` at `offset` is whitespace or part of a line terminator. */
function isWhitespaceAt(text: string, offset: number): boolean {
  const codePoint = text.codePointAt(offset)
  return codePoint !== undefined && isWhitespace(codePoint)
}

/** Asserts that `list` is in source order, that no two of its entries overlap, and that none is empty. */
function expectInOrderWithoutOverlap(list: readonly Placed[]): void {
  let previousEnd = 0
  for (const placed of list) {
    expect(
      placed.range[0],
      `${label(placed)} overlaps the ${placed.type} before it, or comes before it`,
    ).toBeGreaterThanOrEqual(previousEnd)
    expect(placed.range[1], `${label(placed)} is empty`).toBeGreaterThan(
      placed.range[0],
    )
    previousEnd = placed.range[1]
  }
}

/**
 * common.md, Comment lines: the comment regions of `text`, as the shared
 * lexer decides them. Every comment of the tree lies in one.
 */
function commentRegionsOf(text: string): Range[] {
  const regions: Range[] = []
  for (const entry of openSource(text).lexer.lineEntries()) {
    if (entry.kind === "region") regions.push([entry.start, entry.end])
  }
  return regions
}

/**
 * common.md, `style` and `classDef` lines: the offsets of the `;` that the
 * line rule ignores in `text`, as the shared lexer decides them.
 */
function ignoredSemicolonsOf(text: string): Set<number> {
  const offsets = new Set<number>()
  for (const entry of openSource(text).lexer.lineEntries()) {
    if (entry.kind === "segment") {
      for (const offset of entry.ignoredSemicolons) offsets.add(offset)
    }
  }
  return offsets
}

/** The offset after the directives that start at `offset`, one after another; `offset` itself when none starts there. */
function afterDirectivesAt(
  offset: number,
  directives: readonly Directive[],
): number {
  let current = offset
  for (;;) {
    const position = current
    const directive = directives.find(
      (candidate) => candidate.range[0] === position,
    )
    if (directive === undefined) return current
    current = directive.range[1]
  }
}

/**
 * Where the mark of the diagram comment `comment` ends, as the document of
 * each diagram type that has diagram comments defines the mark: in a
 * sequence diagram (diagrams/sequence.md, Lexical structure), `#` when it
 * starts with `#`, `%%` when it starts with `%%`, and `%` otherwise. As in
 * the `%%` of a comment line, directives may lie between the two `%`.
 */
function diagramCommentMarkEnd(
  text: string,
  comment: Comment,
  directives: readonly Directive[],
): number {
  const start = comment.range[0]
  if (text[start] === "#") return start + 1
  expect(text[start], `the mark of ${label(comment)}`).toBe("%")
  const second = afterDirectivesAt(start + 1, directives)
  return second < comment.range[1] && text[second] === "%"
    ? second + 1
    : start + 1
}

/**
 * ast.md, Nodes: the child nodes of `parent`, `children` in the order of its
 * child fields, put in the source order that the documents state. That is
 * the order of the child fields, except in the one node that a document
 * names: ast/flowchart.md, FlowchartLink, whose text between two arrows is
 * its `label`, written between `opening` and `arrow`, while the child fields
 * visit `arrow` before `label`.
 */
function inSourceOrder(parent: Node, children: readonly Node[]): Node[] {
  if (
    parent.type !== "FlowchartLink" ||
    parent.opening === null ||
    parent.label === null
  ) {
    return [...children]
  }
  const { arrow, label: text } = parent
  return children.map((child) => {
    if (child === arrow) return text
    if (child === text) return arrow
    return child
  })
}

/**
 * ast.md, Nodes: a node without a token, a label that is all whitespace,
 * covers its units. Asserts what the tree can show of that:
 * its value is all whitespace, and its range is not empty and holds no
 * character of a token of the diagram and nothing but whitespace, line
 * terminators, comments, and directives.
 */
function expectCoversUnitsWithoutToken(
  text: string,
  root: Root,
  node: { readonly type: string; readonly value: string } & Placed,
): void {
  for (let offset = 0; offset < node.value.length; offset++) {
    expect(
      isWhitespaceAt(node.value, offset),
      `${label(node)} has no token, but its value is not all whitespace`,
    ).toBe(true)
  }
  expect(node.range[0], `${label(node)} is empty`).toBeLessThan(node.range[1])
  for (const token of diagramTokensOf(root)) {
    expect(
      overlap(token.range, node.range),
      `${label(node)} has no token, but holds ${label(token)}`,
    ).toBe(false)
  }
  const trivia = [...root.comments, ...root.directives]
  for (let offset = node.range[0]; offset < node.range[1]; offset++) {
    expect(
      isWhitespaceAt(text, offset) ||
        trivia.some(
          (placed) => placed.range[0] <= offset && offset < placed.range[1],
        ),
      `${label(node)} has no token, but holds ${JSON.stringify(text[offset])}`,
    ).toBe(true)
  }
}

/**
 * Asserts the conditions that ast.md states for every tree, whatever its
 * diagram: the rule of Positions that a `loc` is the same place as its
 * `range`, and then each condition of Invariants, in the order of that
 * section.
 */
export function checkInvariants(text: string, root: Root): void {
  const { body, frontmatter, comments, directives, tokens } = root
  const records: readonly Placed[] = [
    ...(frontmatter === null ? [] : [frontmatter]),
    ...comments,
    ...directives,
  ]

  const nodes: Node[] = []
  traverseNodes(root, {
    enterNode(node) {
      nodes.push(node)
    },
    leaveNode() {
      // Nothing to do on the way back.
    },
  })

  // Positions: every range lies inside the input, and every `loc` is the
  // same place as its `range`.
  for (const placed of [...nodes, ...tokens, ...records]) {
    const [start, end] = placed.range
    expect(start, `start of ${label(placed)}`).toBeGreaterThanOrEqual(0)
    expect(end, `end of ${label(placed)}`).toBeLessThanOrEqual(text.length)
    expect(placed.loc, `loc of ${label(placed)}`).toEqual({
      start: positionOf(text, start),
      end: positionOf(text, end),
    })
  }

  // Invariant 1: every character of the input is in a token or a comment,
  // or it is whitespace or a line terminator.
  const covered = new Set<number>()
  for (const placed of [...tokens, ...comments]) {
    for (let offset = placed.range[0]; offset < placed.range[1]; offset++) {
      covered.add(offset)
    }
  }
  for (let offset = 0; offset < text.length; offset++) {
    if (covered.has(offset)) continue
    expect(
      isWhitespaceAt(text, offset),
      `the character at offset ${offset}, outside the tokens and comments, is not whitespace: ${JSON.stringify(text[offset])}`,
    ).toBe(true)
  }

  // Invariant 2: the text of every token, comment, directive, and
  // frontmatter equals the source text of its range. For a token that text
  // is `value`; the others have no field for it, so what is checked is that
  // their content fields are that text without its delimiters.
  for (const token of tokens) {
    expect(token.value, `value of ${label(token)}`).toBe(
      text.slice(...token.range),
    )
  }
  const commentRegions = commentRegionsOf(text)
  for (const comment of comments) {
    if (commentRegions.some((region) => contains(region, comment.range))) {
      // ast.md, Comment: the range of a comment line starts at the first `%`
      // of the `%%`, whose two `%` can have directives between them, and
      // `value` is the source text after the second `%`.
      expect(text[comment.range[0]], `start of ${label(comment)}`).toBe("%")
      const secondPercent = afterDirectivesAt(comment.range[0] + 1, directives)
      expect(text[secondPercent], `the \`%%\` of ${label(comment)}`).toBe("%")
      expect(comment.value, `value of ${label(comment)}`).toBe(
        text.slice(secondPercent + 1, comment.range[1]),
      )
    } else {
      // ast.md, Comment: a comment outside the comment regions is a diagram
      // comment, whose range starts at its mark and whose `value` is the
      // source text after the mark.
      expect(comment.value, `value of ${label(comment)}`).toBe(
        text.slice(
          diagramCommentMarkEnd(text, comment, directives),
          comment.range[1],
        ),
      )
    }
  }
  for (const directive of directives) {
    // ast.md, Directive: the range is a match of the scan without the
    // whitespace at its end.
    const source = text.slice(...directive.range)
    expect(source.slice(0, 3), `start of ${label(directive)}`).toBe("%%{")
    if (directive.closed) {
      expect(source.slice(-3), `end of ${label(directive)}`).toBe("}%%")
    }
    expect(
      isWhitespaceAt(text, directive.range[1] - 1),
      `${label(directive)} ends with whitespace`,
    ).toBe(false)
    expect(directive.value, `value of ${label(directive)}`).toBe(
      directive.closed ? source.slice(3, -3) : source.slice(3),
    )
  }
  if (frontmatter !== null) {
    // ast.md, Frontmatter: the range runs from the `---` of the opening
    // delimiter line through the closing `---`.
    const source = text.slice(...frontmatter.range)
    expect(source.slice(0, 3), "start of the frontmatter").toBe("---")
    expect(source.slice(-3), "end of the frontmatter").toBe("---")
    expect(
      contains(frontmatter.range, frontmatter.valueRange),
      "the value of the frontmatter lies outside it",
    ).toBe(true)
    expect(frontmatter.value, "value of the frontmatter").toBe(
      text.slice(...frontmatter.valueRange),
    )
  }

  // Invariant 3: `Root.tokens` is in source order, and its tokens do not
  // overlap.
  expectInOrderWithoutOverlap(tokens)

  // Invariant 4: no token starts or ends with whitespace or a line
  // terminator.
  for (const token of tokens) {
    expect(
      isWhitespaceAt(text, token.range[0]) ||
        isWhitespaceAt(text, token.range[1] - 1),
      `${label(token)} starts or ends with whitespace or a line terminator`,
    ).toBe(false)
  }

  // Invariant 5: a comment lies outside all tokens, or entirely inside the
  // range of one token.
  for (const comment of comments) {
    for (const token of tokens) {
      expect(
        !overlap(comment.range, token.range) ||
          contains(token.range, comment.range),
        `${label(comment)} lies partly inside ${label(token)}`,
      ).toBe(true)
    }
  }

  // Invariant 6: a directive lies inside no other token, except as part of
  // a comment region that lies inside a token. Every directive that lies
  // outside all other tokens and all comments has exactly one `Directive`
  // token, with its range, and every `Directive` token is such a
  // directive's.
  const otherTokens = tokens.filter((token) => token.type !== "Directive")
  const directiveTokens = tokens.filter((token) => token.type === "Directive")
  const directivesOutside: Directive[] = []
  for (const directive of directives) {
    let insideToken = false
    for (const token of otherTokens) {
      if (!overlap(directive.range, token.range)) continue
      insideToken = true
      expect(
        commentRegions.some(
          (region) =>
            contains(region, directive.range) && contains(token.range, region),
        ),
        `${label(directive)} lies inside ${label(token)}, and not in a comment region inside that token`,
      ).toBe(true)
    }
    const insideComment = comments.some((comment) =>
      overlap(comment.range, directive.range),
    )
    if (!insideToken && !insideComment) directivesOutside.push(directive)
  }
  expect(
    directiveTokens.map((token) => token.range),
    "the Directive tokens are those of the directives outside all other tokens and all comments",
  ).toEqual(directivesOutside.map((directive) => directive.range))

  // Invariant 7: no two comments overlap, and no two directives overlap.
  // Both lists are in source order (ast.md, Root).
  expectInOrderWithoutOverlap(comments)
  expectInOrderWithoutOverlap(directives)

  // Invariant 8: when there is frontmatter, the first tokens are the
  // tokens in its range: the opening `---`, a `Punctuator`; the body, a
  // `RawText` from its first character that is not whitespace to its last,
  // when it is not all whitespace; and the closing `---`, a `Punctuator`
  // (ast.md, Frontmatter). They come before all comments and directives.
  if (frontmatter !== null) {
    const [start, end] = frontmatter.range
    const [bodyStart, bodyEnd] = frontmatter.valueRange
    let bodyFirst = bodyStart
    while (bodyFirst < bodyEnd && isWhitespaceAt(text, bodyFirst)) {
      bodyFirst += 1
    }
    let bodyLast = bodyEnd
    while (bodyLast > bodyFirst && isWhitespaceAt(text, bodyLast - 1)) {
      bodyLast -= 1
    }
    const expected: [string, Range][] = [["Punctuator", [start, start + 3]]]
    if (bodyFirst < bodyLast) expected.push(["RawText", [bodyFirst, bodyLast]])
    expected.push(["Punctuator", [end - 3, end]])
    expect(
      tokens
        .filter((token) => token.range[0] < end)
        .map((token): [string, Range] => [token.type, token.range]),
      "the tokens in the range of the frontmatter",
    ).toEqual(expected)
    expect(text.slice(start, start + 3), "the opening delimiter").toBe("---")
    expect(text.slice(end - 3, end), "the closing delimiter").toBe("---")
    for (const placed of [...comments, ...directives]) {
      expect(
        placed.range[0],
        `${label(placed)} comes before the end of the frontmatter`,
      ).toBeGreaterThanOrEqual(frontmatter.range[1])
    }
  }

  // Invariant 9: `Root.range` covers the whole input, and the range of every
  // other node runs from the start of its first token to the end of its
  // last, inside the range of its parent. A node's tokens are never
  // `Directive` tokens or tokens of the frontmatter. The tree does not say which tokens
  // are a node's own, so what is checked is that the range starts where a
  // token of the diagram starts and ends where one ends. A node without a token, which
  // is a label that is all whitespace, covers its units instead (ast.md,
  // Nodes). The units are not in the tree, so what is
  // checked is that its value is all whitespace, that its range is not
  // empty, and that it holds no character of a token and nothing but
  // whitespace, line terminators, comments, and directives.
  expect(root.range, "the root covers the whole input").toEqual([
    0,
    text.length,
  ])
  const diagramTokens = diagramTokensOf(root)
  const tokenStarts = new Set(diagramTokens.map((token) => token.range[0]))
  const tokenEnds = new Set(diagramTokens.map((token) => token.range[1]))
  // The child nodes of a node do not overlap, and they are in source order
  // when taken in the order of its child fields, except in the nodes that a
  // diagram document names (ast.md, Nodes; see `inSourceOrder`).
  const childrenOf = new Map<Node, Node[]>()
  traverseNodes(root, {
    enterNode(node, parent) {
      if (parent === null) return
      expect(
        contains(parent.range, node.range),
        `${label(node)} lies outside ${label(parent)}`,
      ).toBe(true)
      const children = childrenOf.get(parent) ?? []
      children.push(node)
      childrenOf.set(parent, children)
      const runsBetweenTokens =
        tokenStarts.has(node.range[0]) && tokenEnds.has(node.range[1])
      if (node.type === "FlowchartLabel" && !runsBetweenTokens) {
        expectCoversUnitsWithoutToken(text, root, node)
        return
      }
      expect(
        runsBetweenTokens,
        `${label(node)} does not run from the start of a token to the end of a token`,
      ).toBe(true)
    },
    leaveNode() {
      // Nothing to do on the way back.
    },
  })
  for (const [parent, children] of childrenOf) {
    let lastEnd = parent.range[0]
    for (const child of inSourceOrder(parent, children)) {
      expect(
        child.range[0],
        `${label(child)} overlaps the child node of ${label(parent)} before it in source order, or comes before it`,
      ).toBeGreaterThanOrEqual(lastEnd)
      lastEnd = child.range[1]
    }
  }
  if (body.type === "ErrorDiagram") {
    // ast.md, ErrorDiagram: it has no child nodes, so all tokens of the
    // diagram are its own, and it has at least the token that holds `error`.
    expect(
      diagramTokens.length,
      "an ErrorDiagram has at least one token",
    ).toBeGreaterThanOrEqual(1)
    expect(
      body.range,
      "the body runs from its first token to its last",
    ).toEqual([
      diagramTokens[0].range[0],
      diagramTokens[diagramTokens.length - 1].range[1],
    ])
  }

  // Invariant 11: the `raw` of a node that has it, a StringLiteral or a
  // NumericLiteral, equals the source text of its range.
  for (const node of nodes) {
    if (node.type === "StringLiteral" || node.type === "NumericLiteral") {
      expect(node.raw, `raw of ${label(node)}`).toBe(text.slice(...node.range))
    }
  }
}

/**
 * ast.md, Shared leaf nodes, and ast/flowchart.md, Nodes and Tokens: for
 * each node type, whether it is a value node: a node whose value is what
 * the author wrote, made of the units of one item of the grammar. The
 * other nodes are made of other nodes and of keywords and punctuation.
 */
const valueNodeTypes: Readonly<Record<Node["type"], boolean>> = {
  Root: false,
  ErrorDiagram: false,
  Identifier: true,
  StringLiteral: true,
  NumericLiteral: true,
  FlowchartDiagram: false,
  FlowchartEmptyStatement: false,
  FlowchartVertexStatement: false,
  FlowchartVertexGroup: false,
  FlowchartVertex: false,
  FlowchartShape: false,
  FlowchartShapeProperty: false,
  FlowchartLink: false,
  FlowchartArrow: false,
  FlowchartOpeningArrow: false,
  FlowchartLabel: true,
  FlowchartDataBlock: true,
  FlowchartSubgraphStatement: false,
  FlowchartStyleStatement: false,
  FlowchartClassDefStatement: false,
  FlowchartClassStatement: false,
  FlowchartClickCallbackStatement: false,
  FlowchartClickUrlStatement: false,
  FlowchartLinkStyleStatement: false,
  FlowchartDefaultLinkStyleStatement: false,
  FlowchartDirectionStatement: false,
  FlowchartAccTitleStatement: false,
  FlowchartAccDescrStatement: false,
  FlowchartAccDescrBlockStatement: false,
  FlowchartLiteral: true,
  FlowchartIgnoredText: true,
  SequenceDiagram: false,
  SequenceParticipantStatement: false,
  SequenceDestroyStatement: false,
  SequenceBoxStatement: false,
  SequenceBoxText: true,
  SequenceMessageStatement: false,
  SequenceArrow: false,
  SequenceAutonumberStatement: false,
  SequenceActivateStatement: false,
  SequenceDeactivateStatement: false,
  SequenceNoteStatement: false,
  SequenceLinksStatement: false,
  SequenceLinkStatement: false,
  SequencePropertiesStatement: false,
  SequenceDetailsStatement: false,
  SequenceTitleStatement: false,
  SequenceAccTitleStatement: false,
  SequenceAccDescrStatement: false,
  SequenceAccDescrBlockStatement: false,
  SequenceLoopStatement: false,
  SequenceOptStatement: false,
  SequenceBreakStatement: false,
  SequenceRectStatement: false,
  SequenceAltStatement: false,
  SequenceParStatement: false,
  SequenceParOverStatement: false,
  SequenceCriticalStatement: false,
  SequenceSection: false,
  SequenceIgnoredStatement: true,
  SequenceText: false,
  SequenceLiteral: true,
  SequenceDataBlock: true,
}

/** The node types of the data blocks, whose delimiters lie in their range. */
const dataBlockNodeTypes: readonly Node["type"][] = [
  "FlowchartDataBlock",
  "SequenceDataBlock",
]

/** Every node of the tree under `root`, in the order of a walk. */
function nodesOf(root: Root): Node[] {
  const nodes: Node[] = []
  traverseNodes(root, {
    enterNode(node) {
      nodes.push(node)
    },
    leaveNode() {
      // Nothing to do on the way back.
    },
  })
  return nodes
}

/**
 * ast/flowchart.md and ast/sequence.md, Tokens: the tokens of a diagram and
 * the value nodes they lie in. A token of a value, `Identifier`, `RawText`, `Numeric`, or
 * `String`, lies in a value node. A `Keyword` or `Punctuator` token lies in
 * no value node, except the delimiters of a data block, which the block's
 * range covers. A `;` that the line rule ignores and that is a token of its
 * own is left out: it affects no value, whatever kind the diagram gives it
 * (ast.md, Tokens).
 */
function checkTokensInValueNodes(text: string, root: Root): void {
  const ignoredSemicolons = ignoredSemicolonsOf(text)
  const nodes = nodesOf(root)
  const valueNodes = nodes.filter((node) => valueNodeTypes[node.type])
  for (const token of diagramTokensOf(root)) {
    if (token.value === ";" && ignoredSemicolons.has(token.range[0])) {
      continue
    }
    const holders = valueNodes.filter((node) =>
      contains(node.range, token.range),
    )
    const isValue =
      token.type === "Identifier" ||
      token.type === "RawText" ||
      token.type === "Numeric" ||
      token.type === "String"
    if (isValue) {
      expect(
        holders.length > 0,
        `${label(token)} of ${JSON.stringify(token.value)} lies in no value node`,
      ).toBe(true)
    } else if (token.type === "Keyword" || token.type === "Punctuator") {
      const allowed = holders.every(
        (node) =>
          token.type === "Punctuator" && dataBlockNodeTypes.includes(node.type),
      )
      expect(
        allowed,
        `${label(token)} of ${JSON.stringify(token.value)} lies in the value node ${holders.map(label).join(", ")}`,
      ).toBe(true)
    }
  }
}

/** The tokens of `root` that lie in `range`. */
function tokensIn(root: Root, range: Range): Token[] {
  return root.tokens.filter((token) => contains(range, token.range))
}

/**
 * diagrams/flowchart.md, Shapes: the name that the delimiters `opening`
 * and `closing` give a shape, as its table lists them; null for delimiters
 * that no row has. `closing` is the source text of the closing unit.
 */
function shapeNameOf(opening: string, closing: string): string | null {
  const isBackslashEnd =
    closing.length === 2 &&
    closing.endsWith("]") &&
    "\\(?=])".includes(closing[0])
  switch (opening) {
    case "[":
      return closing === "]" ? "rectangle" : null
    case "(":
      return closing === ")" ? "rounded" : null
    case "((":
      return closing === "))" ? "circle" : null
    case "(((":
      return closing === ")))" ? "double-circle" : null
    case "{":
      return closing === "}" ? "diamond" : null
    case "{{":
      return closing === "}}" ? "hexagon" : null
    case "([":
      return closing === "])" ? "stadium" : null
    case "[[":
      return closing === "]]" ? "framed-rectangle" : null
    case "[(":
      return closing === ")]" ? "cylinder" : null
    case ">":
      return closing === "]" ? "odd" : null
    case "(-":
      return ["-)", "/)", "))"].includes(closing) ? "ellipse" : null
    case "[/":
      if (closing === "/]") return "lean-right"
      return isBackslashEnd ? "trapezoid-bottom" : null
    case "[\\":
      if (closing === "/]") return "trapezoid-top"
      return isBackslashEnd ? "lean-left" : null
    case "[|":
      return closing === "]" ? "rectangle" : null
    default:
      return null
  }
}

/**
 * The delimiters in `range`: its `Punctuator` tokens, joined (a directive
 * can cut `((` into two tokens), without a `;` that the line rule ignores
 * and that is a token of its own (ast/flowchart.md, Tokens).
 */
function delimitersIn(root: Root, range: Range): string {
  return tokensIn(root, range)
    .filter((token) => token.type === "Punctuator" && token.value !== ";")
    .map((token) => token.value)
    .join("")
}

/**
 * diagrams/flowchart.md, Shapes: the name of `shape` is the one that its
 * delimiters give: those before its property or label, and those after its
 * label; and it has a property exactly when it is written with `[|`.
 */
function checkShape(root: Root, shape: FlowchartShape): void {
  const firstInside = shape.property ?? shape.label
  const opening = delimitersIn(root, [shape.range[0], firstInside.range[0]])
  const closing = delimitersIn(root, [shape.label.range[1], shape.range[1]])
  expect(
    shapeNameOf(opening, closing),
    `the name of ${label(shape)}, written ${opening} and ${closing}`,
  ).toBe(shape.name)
  // ast/flowchart.md, FlowchartShape: `property` is not null exactly when
  // the shape is written as `[|name:value|...]`.
  expect(
    shape.property !== null,
    `${label(shape)} has a property exactly when it is written with [|`,
  ).toBe(opening === "[|")
}

/**
 * ast/flowchart.md, FlowchartArrow and FlowchartOpeningArrow: the markers
 * that the characters before and after the line write.
 */
const FLOWCHART_START_MARKERS: Readonly<Record<string, string>> = {
  "<": "arrow",
  x: "cross",
  o: "circle",
}
const FLOWCHART_END_MARKERS: Readonly<Record<string, string>> = {
  ">": "arrow",
  x: "cross",
  o: "circle",
}

/** ast/flowchart.md, FlowchartArrow: the line that each line character writes. */
const FLOWCHART_LINES: Readonly<Record<string, string>> = {
  "-": "solid",
  "=": "thick",
  ".": "dotted",
  "~": "invisible",
}

/** ast/flowchart.md, FlowchartOpeningArrow: the line that each opening arrow writes after its marker. */
const FLOWCHART_OPENING_LINES: Readonly<Record<string, string>> = {
  "--": "solid",
  "==": "thick",
  "-.": "dotted",
}

/**
 * ast/flowchart.md, FlowchartLink, FlowchartArrow, and
 * FlowchartOpeningArrow: each arrow of the link is one `Punctuator` token,
 * and its fields are what its value writes: a start marker for a first
 * character that is no line character, an end marker for such a last
 * character, the line of its line characters (`dotted` when it has a `.`),
 * and their number, the `.` only for a dotted line. The opening arrow has
 * the line of the closing arrow.
 */
function checkLink(root: Root, link: FlowchartLink): void {
  const { arrow, opening } = link
  for (const node of opening === null ? [arrow] : [opening, arrow]) {
    expect(
      tokensIn(root, node.range).map((token) => [token.type, token.range]),
      `the token of ${label(node)}`,
    ).toEqual([["Punctuator", node.range]])
  }
  if (opening !== null) {
    expect(
      opening.line,
      `the line of ${label(opening)} is that of the closing arrow`,
    ).toBe(arrow.line)
  }
  const characters = [...arrow.value]
  const first = characters[0]
  const last = characters[characters.length - 1]
  const lineCharacters = characters.filter(
    (character) => FLOWCHART_LINES[character] !== undefined,
  )
  const line = lineCharacters.includes(".")
    ? "dotted"
    : FLOWCHART_LINES[lineCharacters[0]]
  expect(
    {
      startMarker: arrow.startMarker,
      line: arrow.line,
      length: arrow.length,
      endMarker: arrow.endMarker,
    },
    `the fields of ${label(arrow)}, written ${arrow.value}`,
  ).toEqual({
    startMarker:
      FLOWCHART_LINES[first] === undefined
        ? FLOWCHART_START_MARKERS[first]
        : "none",
    line,
    length: lineCharacters.filter((character) =>
      line === "dotted" ? character === "." : true,
    ).length,
    endMarker:
      FLOWCHART_LINES[last] === undefined
        ? FLOWCHART_END_MARKERS[last]
        : "none",
  })
  if (opening !== null) {
    const openingCharacters = [...opening.value]
    const marked = FLOWCHART_LINES[openingCharacters[0]] === undefined
    expect(
      { startMarker: opening.startMarker, line: opening.line },
      `the fields of ${label(opening)}, written ${opening.value}`,
    ).toEqual({
      startMarker: marked
        ? FLOWCHART_START_MARKERS[openingCharacters[0]]
        : "none",
      line: FLOWCHART_OPENING_LINES[
        openingCharacters.slice(marked ? 1 : 0).join("")
      ],
    })
  }
}

/**
 * ast.md, Nodes, and ast/flowchart.md: the value of a leaf node is the text
 * of its range, or the part of it that its node type names: an
 * Identifier, a FlowchartLiteral, a FlowchartIgnoredText, and an arrow the
 * whole text, a StringLiteral and a label that
 * starts with a string or a markdown string the text without the
 * delimiters of that string, and a data block the text between `@{` and
 * `}`. The text of a range leaves out the directives, the comment regions,
 * and the `;` that the line rule ignores; nothing else is left out, added,
 * or rewritten. What the lexer and the grammar
 * decide comes from the parser through `source`; the check is that each
 * value is the text of the right range.
 */
function checkValues(root: Root, source: FlowchartSource): void {
  for (const node of nodesOf(root)) {
    let value: string
    let leftOut: Range[] = []
    const [start, end] = node.range
    switch (node.type) {
      case "Identifier":
        value = node.name
        break
      case "FlowchartLiteral":
      case "FlowchartIgnoredText":
      case "FlowchartArrow":
      case "FlowchartOpeningArrow":
        value = node.value
        break
      case "StringLiteral":
        value = node.value
        leftOut = source.stringDelimitersIn(node.range)
        break
      case "FlowchartDataBlock":
        value = node.value
        leftOut = [
          [start, start + 2],
          [end - 1, end],
        ]
        break
      case "FlowchartLabel":
        value = node.value
        leftOut = source.stringDelimitersIn(node.range)
        break
      default:
        continue
    }
    const written = source.lexer.textOfRange(start, end, leftOut)
    expect(
      value,
      `the value ${JSON.stringify(value)} of ${label(node)} is not the text of its range, ${JSON.stringify(written)}`,
    ).toBe(written)
  }
}

/**
 * ast/flowchart.md: asserts what the flowchart document states about its
 * tree beyond the invariants of ast.md: the values of the leaf nodes are the
 * texts of their ranges, the tokens of values lie in value nodes, the
 * direction of the header is the first token after the header keyword,
 * the name of a shape agrees
 * with its delimiters, each arrow of a link is one token, its fields are
 * what it writes, and the opening arrow has the line of the closing one, and a
 * description block is closed exactly when its last token is `}`.
 */
function checkFlowchartTree(
  text: string,
  root: Root,
  diagram: FlowchartDiagram,
): void {
  const source = new FlowchartSource(text, root)
  checkValues(root, source)
  checkTokensInValueNodes(text, root)
  if (diagram.direction !== null) {
    // FlowchartDiagram: the direction of the header, as written, after the
    // header keyword (The header context, rule 3).
    expect(
      diagramTokensOf(root)[1],
      "the direction of the header is the first token of the diagram after the header keyword",
    ).toMatchObject({ type: "Keyword", value: diagram.direction })
  }
  for (const node of nodesOf(root)) {
    if (node.type === "FlowchartShape") checkShape(root, node)
    if (node.type === "FlowchartLink") checkLink(root, node)
    if (node.type === "FlowchartAccDescrBlockStatement") {
      const last = tokensIn(root, node.range).at(-1)
      expect(
        last?.type === "Punctuator" && last.value === "}",
        `${label(node)} is closed exactly when its last token is \`}\``,
      ).toBe(node.closed)
    }
  }
}

/**
 * ast.md, ErrorDiagram: asserts how the `error` pseudo-diagram splits its
 * text into tokens. Its tokens, besides the `Directive` and `Frontmatter`
 * tokens, are `RawText` tokens, the maximal runs of
 * characters that are not whitespace or line terminators and lie outside
 * directives and comment regions; a `;` that the line rule ignores at the
 * start or the end of a run is a `RawText` token of its own. Together with the
 * first invariant, by which every such character is in a token, four
 * conditions say that: every token is of the kind `RawText`, no token holds
 * whitespace or a line terminator, two tokens touch only when one of them
 * is a `;`, and every comment is outside the tokens. The tree does not tell
 * whether a `;` was ignored, so the third condition cannot ask for more.
 * Tokens of other diagrams do not satisfy these conditions.
 */
function checkErrorDiagramTokens(root: Root): void {
  const { comments } = root
  const tokens = diagramTokensOf(root)
  tokens.forEach((token, index) => {
    expect(token.type, `kind of ${label(token)}`).toBe("RawText")
    for (let offset = 0; offset < token.value.length; offset++) {
      expect(
        isWhitespaceAt(token.value, offset),
        `${label(token)} holds whitespace or a line terminator`,
      ).toBe(false)
    }
    if (index > 0 && token.range[0] === tokens[index - 1].range[1]) {
      expect(
        token.value === ";" || tokens[index - 1].value === ";",
        `${label(token)} touches the token before it, and neither is a \`;\``,
      ).toBe(true)
    }
    for (const comment of comments) {
      expect(
        overlap(comment.range, token.range),
        `${label(comment)} lies inside ${label(token)} of an ErrorDiagram`,
      ).toBe(false)
    }
  })
}

/**
 * ast/sequence.md: the value of every leaf node is the text of its range,
 * or the part of it that its node type names: an Identifier, a
 * SequenceLiteral, a SequenceBoxText, and a SequenceIgnoredStatement the
 * whole text, a SequenceDataBlock the text between `@{` and `}`, and a
 * NumericLiteral the number that its `raw` writes.
 */
function checkSequenceValues(text: string, root: Root): void {
  const { lexer } = openSource(text)
  for (const node of nodesOf(root)) {
    const [start, end] = node.range
    let value: string | number, written: string | number
    switch (node.type) {
      case "Identifier":
        value = node.name
        written = lexer.textOfRange(start, end, [])
        break
      case "SequenceLiteral":
      case "SequenceBoxText":
      case "SequenceIgnoredStatement":
      case "SequenceArrow":
        value = node.value
        written = lexer.textOfRange(start, end, [])
        break
      case "SequenceDataBlock":
        value = node.value
        written = lexer.textOfRange(start, end, [
          [start, start + 2],
          [end - 1, end],
        ])
        break
      case "NumericLiteral":
        value = node.value
        written = Number(node.raw)
        break
      default:
        continue
    }
    expect(
      value,
      `the value ${JSON.stringify(value)} of ${label(node)} is not the text of its range, ${JSON.stringify(written)}`,
    ).toBe(written)
  }
}

/** The values of the tokens of `root` in `range`, in lower case, for the fixed words that the lexer reads case-insensitively. */
function wordsIn(root: Root, range: Range, kind: Token["type"]): string[] {
  return tokensIn(root, range)
    .filter((token) => token.type === kind)
    .map((token) => token.value.toLowerCase())
}

/**
 * ast/sequence.md: asserts what the sequence document states about its tree
 * beyond the invariants of ast.md: the values of the leaf nodes are the
 * texts of their ranges, the tokens of values lie in value nodes, and the
 * fixed words and operators of a node are its tokens: `create` and the
 * keyword of a participant statement, the activation of a message, the
 * placement of a note, the wrap prefix of a text, `off` of an autonumber
 * statement, and the `}` of a closed description block; the arrow of a
 * message is one token, and its fields are what it writes; and each part
 * of a box text is a token of its own.
 */
function checkSequenceTree(text: string, root: Root): void {
  checkSequenceValues(text, root)
  checkTokensInValueNodes(text, root)
  for (const node of nodesOf(root)) {
    const keywords = wordsIn(root, node.range, "Keyword")
    const punctuators = wordsIn(root, node.range, "Punctuator")
    switch (node.type) {
      case "SequenceParticipantStatement":
      case "SequenceDestroyStatement": {
        const [first, second] = keywords
        expect(first === "create", `${label(node)}: created`).toBe(node.created)
        const keyword = node.created ? second : first
        expect(keyword, `the keyword of ${label(node)}`).toBe(
          node.type === "SequenceDestroyStatement" ? "destroy" : node.kind,
        )
        break
      }
      case "SequenceMessageStatement":
        checkSequenceArrow(root, node.arrow)
        if (node.activation !== null) {
          expect(punctuators, `the activation of ${label(node)}`).toContain(
            node.activation,
          )
        }
        expect(
          punctuators.filter((value) => value === "()").length,
          `the central connections of ${label(node)}`,
        ).toBe(
          Number(node.fromCentralConnection) + Number(node.toCentralConnection),
        )
        break
      case "SequenceNoteStatement":
        expect(keywords[1], `the placement of ${label(node)}`).toBe(
          node.placement,
        )
        break
      case "SequenceText": {
        const [first] = tokensIn(root, node.range)
        const prefix = first?.type === "Keyword" ? first.value : null
        expect(
          prefix === null
            ? null
            : prefix.includes("nowrap")
              ? "nowrap"
              : "wrap",
          `the wrap prefix of ${label(node)}`,
        ).toBe(node.wrap)
        break
      }
      case "SequenceAutonumberStatement":
        expect(keywords.includes("off"), `${label(node)}: off`).toBe(node.off)
        break
      case "SequenceBoxText": {
        // ast/sequence.md, SequenceBoxText: each part is a token of its
        // own, so the tokens of the text are those of its parts.
        const parts = [node.colorCandidate, node.remainder].filter(
          (part) => part !== null,
        )
        expect(
          tokensIn(root, node.range)
            .filter((token) => token.type !== "Directive")
            .map((token) => token.range),
          `the tokens of ${label(node)} are its parts`,
        ).toEqual(parts.map((part) => part.range))
        break
      }
      case "SequenceAccDescrBlockStatement": {
        const last = tokensIn(root, node.range).at(-1)
        expect(
          last?.type === "Punctuator" && last.value === "}",
          `${label(node)} is closed exactly when its last token is \`}\``,
        ).toBe(node.closed)
        break
      }
      default:
        break
    }
  }
}

/**
 * ast/sequence.md, SequenceArrow: the markers that an arrow writes before
 * its line, and after it, case-insensitively. An arrow ends with one of
 * the end markers, and with nothing after a start marker other than
 * `arrow`.
 */
const SEQUENCE_START_MARKERS: readonly (readonly [string, string])[] = [
  ["<<", "arrow"],
  ["/|", "half-arrow-top"],
  ["\\|", "half-arrow-bottom"],
  ["//", "half-stick-top"],
  ["\\\\", "half-stick-bottom"],
]
const SEQUENCE_END_MARKERS: Readonly<Record<string, string>> = {
  ">>": "arrow",
  ">": "none",
  x: "cross",
  ")": "open-arrow",
  "|\\": "half-arrow-top",
  "|/": "half-arrow-bottom",
  "\\\\": "half-stick-top",
  "//": "half-stick-bottom",
  "": "none",
}

/**
 * ast/sequence.md, SequenceArrow: the arrow is one `Punctuator` token, and
 * its fields are what its value writes: an optional start marker, the line
 * `-` (`solid`) or `--` (`dotted`), and the end marker.
 */
function checkSequenceArrow(root: Root, arrow: SequenceArrow): void {
  expect(
    tokensIn(root, arrow.range).map((token) => [token.type, token.range]),
    `the token of ${label(arrow)}`,
  ).toEqual([["Punctuator", arrow.range]])
  const value = arrow.value.toLowerCase()
  const start = SEQUENCE_START_MARKERS.find(([written]) =>
    value.startsWith(written),
  )
  const afterStart = value.slice(start?.[0].length ?? 0)
  const line = afterStart.startsWith("--") ? "dotted" : "solid"
  const end = afterStart.slice(line === "dotted" ? 2 : 1)
  expect(
    {
      startMarker: arrow.startMarker,
      line: arrow.line,
      endMarker: arrow.endMarker,
    },
    `the fields of ${label(arrow)}, written ${arrow.value}`,
  ).toEqual({
    startMarker: start?.[1] ?? "none",
    line,
    endMarker: SEQUENCE_END_MARKERS[end],
  })
}

/**
 * Asserts everything ast.md states about a tree returned by `parse(text)`:
 * the conditions of every tree, and the conditions of its diagram.
 */
export function checkTree(text: string, root: Root): void {
  checkInvariants(text, root)
  if (root.body.type === "ErrorDiagram") checkErrorDiagramTokens(root)
  if (root.body.type === "FlowchartDiagram") {
    checkFlowchartTree(text, root, root.body)
  }
  if (root.body.type === "SequenceDiagram") checkSequenceTree(text, root)
}
