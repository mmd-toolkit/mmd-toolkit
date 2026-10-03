import { expect } from "vitest"
import {
  isLineTerminatorCharacter,
  isLineWhitespace,
  isWhitespace,
} from "../../src/character-classes.ts"
import type {
  ClassArrow,
  ClassAttribute,
  ClassMethod,
  Comment,
  Directive,
  FlowchartDiagram,
  FlowchartLink,
  FlowchartShape,
  Identifier,
  Location,
  Node,
  Position,
  Range,
  Root,
  SequenceArrow,
  StateNoteStatement,
  StatePseudostateDefinitionStatement,
  Token,
} from "../../src/index.ts"
import { ignoredSemicolons, traverseNodes } from "../../src/index.ts"
import { openSource } from "../../src/parse.ts"
import { lineTerminatorEnd, nextOffset } from "../../src/text-cursor.ts"
import { readDirective } from "../../src/directives.ts"
import type { SourceLexer } from "../../src/source-lexer.ts"
import type { DiagramUnit } from "../../src/diagram-units.ts"
import { ClassSource } from "./class-source.ts"
import { FlowchartSource } from "./flowchart-source.ts"
import { SequenceSource } from "./sequence-source.ts"
import { StateSource } from "./state-source.ts"

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
 * common.md, The `style` and `classDef` lines: the offsets of the `;` of
 * `text` that the line rule ignores (`ignoredSemicolons`).
 */
function ignoredSemicolonsOf(text: string): Set<number> {
  return new Set(ignoredSemicolons(text).map(([start]) => start))
}

/**
 * ast.md, Comment: whether a comment region follows `offset` on its line,
 * after line whitespace. A region can start with a whitespace-only line, so
 * each offset is looked at before its whitespace is passed.
 */
function regionFollowsOnLine(
  text: string,
  offset: number,
  commentRegions: readonly Range[],
): boolean {
  let current = offset
  for (;;) {
    const position = current
    if (commentRegions.some(([start]) => start === position)) return true
    const codePoint = text.codePointAt(current)
    if (codePoint === undefined || !isLineWhitespace(codePoint)) return false
    current = nextOffset(text, current)
  }
}

/**
 * ast.md, Comment: whether a comment region ends right before `offset`, with
 * only line whitespace between, as before a fragment of a diagram comment
 * that has no mark.
 */
function followsRegion(
  text: string,
  offset: number,
  commentRegions: readonly Range[],
): boolean {
  let current = offset
  for (;;) {
    const position = current
    if (commentRegions.some(([, end]) => end === position)) return true
    // Line whitespace is all in the Basic Multilingual Plane, one code unit.
    const codePoint = current > 0 ? text.codePointAt(current - 1) : undefined
    if (codePoint === undefined || !isLineWhitespace(codePoint)) return false
    current -= 1
  }
}

/**
 * ast.md, Comment, and common.md, Comment lines: checks where `comment`
 * ends. It runs past a line terminator only where a directive in it takes
 * that line terminator, and it ends at none that a directive takes. Where
 * a directive in the comment takes all that follows to the end of the text,
 * its scan reaching there, the comment ends where that directive ends. Where
 * comment regions follow it on its line, after U+2028 or U+2029, it is a
 * fragment of a diagram comment and ends at its last character that is not
 * whitespace, a `;` that the line rule ignores among them, since that `;`
 * has characters of the comment after it on its line. Otherwise it ends
 * before the line terminator that ends its line, or at the end of the text,
 * and a diagram comment before a `;` that the line rule ignores and that is
 * its last character, which is among `ignoredSemicolonStarts`. So no comment
 * ends with a line terminator.
 */
function checkCommentEnd(
  text: string,
  comment: Comment,
  directives: readonly Directive[],
  ignoredSemicolonStarts: ReadonlySet<number>,
  commentRegions: readonly Range[],
): void {
  const end = comment.range[1]
  expect(
    isLineTerminatorCharacter(text.charCodeAt(end - 1)),
    `${label(comment)} ends with a line terminator`,
  ).toBe(false)
  const inComment = directives.filter((directive) =>
    contains(comment.range, directive.range),
  )
  // A comment runs on past a line terminator only where a directive in it
  // takes that line terminator.
  for (let offset = comment.range[0]; offset < end; offset++) {
    if (!isLineTerminatorCharacter(text.charCodeAt(offset))) continue
    expect(
      inComment.some(
        (directive) =>
          directive.range[0] < offset && offset < scanEndOf(text, directive),
      ),
      `${label(comment)} runs past the line terminator at ${offset}, which no directive in it takes`,
    ).toBe(true)
  }
  const lastDirective = inComment.at(-1)
  if (
    lastDirective !== undefined &&
    scanEndOf(text, lastDirective) === text.length
  ) {
    expect(
      end,
      `${label(comment)} ends where the directive that takes the rest of the text ends`,
    ).toBe(lastDirective.range[1])
    return
  }
  if (regionFollowsOnLine(text, end, commentRegions)) {
    expect(
      isWhitespaceAt(text, end - 1),
      `${label(comment)} ends with whitespace before a comment region`,
    ).toBe(false)
    return
  }
  expect(
    ignoredSemicolonStarts.has(end - 1),
    `${label(comment)} ends with a \`;\` that the line rule ignores`,
  ).toBe(false)
  const after = ignoredSemicolonStarts.has(end) ? end + 1 : end
  expect(
    after === text.length || lineTerminatorEnd(text, after) !== null,
    `${label(comment)} ends where its line ends`,
  ).toBe(true)
  // common.md, Comment lines: the line terminator it ends at is the next one
  // that is not part of a directive, that no directive scan takes.
  expect(
    directives.some(
      (directive) =>
        directive.range[0] < after && after < scanEndOf(text, directive),
    ),
    `${label(comment)} ends at a line terminator that a directive takes`,
  ).toBe(false)
}

/**
 * common.md, Where a directive is: where the scan of `directive` ends, after
 * the whitespace and line terminators that it takes after its argument,
 * which its range leaves out (ast.md, Directive). The text without the
 * directives goes on there.
 */
function scanEndOf(text: string, directive: Directive): number {
  const match = readDirective(text, directive.range[0])
  if (match === null) {
    throw new Error(`no directive starts at ${directive.range[0]}`)
  }
  return match.range[1]
}

/**
 * The offset after the directives that start at `offset`, one after another,
 * each with what its scan takes after it; `offset` itself when none starts
 * there.
 */
function afterDirectivesAt(
  text: string,
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
    current = scanEndOf(text, directive)
  }
}

/**
 * The marks of the diagram comments of each diagram type, as its document
 * defines them: diagrams/sequence.md, Units and contexts; diagrams/state.md,
 * Comments; diagrams/class.md, The statement context. A flowchart and the
 * `error` pseudo-diagram have only comment lines.
 */
const diagramCommentMarks: Record<
  Root["body"]["type"],
  readonly ("%%" | "#" | "%")[]
> = {
  ErrorDiagram: [],
  FlowchartDiagram: [],
  SequenceDiagram: ["#", "%%", "%"],
  ClassDiagram: ["%%"],
  StateDiagram: ["#", "%%"],
}

/**
 * Where the mark of the diagram comment `comment` ends, as the document of
 * each diagram type that has diagram comments defines the mark: in a
 * sequence diagram (diagrams/sequence.md, Lexical structure), `#` when it
 * starts with `#`, `%%` when it starts with `%%`, and `%` otherwise; in a
 * class diagram (diagrams/class.md, The statement context), `%%`. As in
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
  const second = afterDirectivesAt(text, start + 1, directives)
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
 * ast.md, Shared leaf nodes > Identifier: the name of `identifier` is the
 * text of the range of each of its units, joined in order, and holds no
 * whitespace. Its units are those of `units`, the units of the diagram's
 * lexer, whose text, without the whitespace at its ends, lies in its range;
 * that they are its units, and not others, is checked through the Db,
 * which is compared with mermaid.js.
 */
function expectIdentifierName(
  lexer: SourceLexer,
  units: readonly DiagramUnit<string>[],
  identifier: Identifier,
): void {
  const written = units
    .flatMap((unit) =>
      unit.significantRange !== null &&
      contains(identifier.range, unit.significantRange)
        ? [lexer.textOfRange(...unit.significantRange, [])]
        : [],
    )
    .join("")
  expect(
    identifier.name,
    `the name ${JSON.stringify(identifier.name)} of ${label(identifier)} is not the texts of its units, ${JSON.stringify(written)}`,
  ).toBe(written)
  expect(
    [...identifier.name].some((character) =>
      isWhitespace(character.codePointAt(0) ?? 0),
    ),
    `the name ${JSON.stringify(identifier.name)} of ${label(identifier)} holds whitespace`,
  ).toBe(false)
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
  const ignoredSemicolonStarts = ignoredSemicolonsOf(text)
  for (const comment of comments) {
    const isCommentLine = commentRegions.some((region) =>
      contains(region, comment.range),
    )
    checkCommentEnd(
      text,
      comment,
      directives,
      isCommentLine ? new Set() : ignoredSemicolonStarts,
      commentRegions,
    )
    if (isCommentLine) {
      // ast.md, Comment: the range of a comment line starts at the first `%`
      // of the `%%`, whose two `%` can have directives between them, and
      // `value` is the source text after the second `%`.
      expect(comment.mark, `mark of ${label(comment)}`).toBe("%%")
      expect(text[comment.range[0]], `start of ${label(comment)}`).toBe("%")
      const secondPercent = afterDirectivesAt(
        text,
        comment.range[0] + 1,
        directives,
      )
      expect(text[secondPercent], `the \`%%\` of ${label(comment)}`).toBe("%")
      expect(comment.value, `value of ${label(comment)}`).toBe(
        text.slice(secondPercent + 1, comment.range[1]),
      )
    } else if (comment.mark === null) {
      // ast.md, Comment: a fragment of a diagram comment after a comment
      // region has no mark; it starts at its first character, right after
      // the region and the line whitespace after it, and its `value` is the
      // source text of its range.
      expect(
        followsRegion(text, comment.range[0], commentRegions),
        `${label(comment)} has no mark and follows no comment region`,
      ).toBe(true)
      expect(
        isWhitespaceAt(text, comment.range[0]),
        `${label(comment)} starts with whitespace`,
      ).toBe(false)
      expect(comment.value, `value of ${label(comment)}`).toBe(
        text.slice(...comment.range),
      )
    } else {
      // ast.md, Comment: another comment outside the comment regions is a
      // diagram comment, whose range starts at its mark and whose `value` is
      // the source text after the mark. `mark` holds the characters of the
      // mark, without the directives between them.
      expect(
        diagramCommentMarks[body.type],
        `mark of ${label(comment)} in a ${body.type}`,
      ).toContain(comment.mark)
      const markEnd = diagramCommentMarkEnd(text, comment, directives)
      expect(comment.mark, `mark of ${label(comment)}`).toBe(
        text[comment.range[0]] === "#"
          ? "#"
          : markEnd === comment.range[0] + 1
            ? "%"
            : "%%",
      )
      expect(comment.value, `value of ${label(comment)}`).toBe(
        text.slice(markEnd, comment.range[1]),
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

  // Invariant 5: a comment lies outside all tokens.
  for (const comment of comments) {
    for (const token of tokens) {
      expect(
        overlap(comment.range, token.range),
        `${label(comment)} lies inside ${label(token)}`,
      ).toBe(false)
    }
  }

  // Invariant 6: a directive lies inside no other token. Every directive
  // that lies outside all other tokens and all comments has exactly one
  // `Directive` token, with its range, and every `Directive` token is such a
  // directive's.
  const otherTokens = tokens.filter((token) => token.type !== "Directive")
  const directiveTokens = tokens.filter((token) => token.type === "Directive")
  const directivesOutside: Directive[] = []
  for (const directive of directives) {
    for (const token of otherTokens) {
      expect(
        overlap(directive.range, token.range),
        `${label(directive)} lies inside ${label(token)}`,
      ).toBe(false)
    }
    const insideComment = comments.some((comment) =>
      overlap(comment.range, directive.range),
    )
    if (!insideComment) directivesOutside.push(directive)
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
  // other node runs from the start of its first token to the end of its last,
  // inside the range of its parent. A node's tokens are never `Directive`
  // tokens or tokens of the frontmatter. The tree does not say which tokens are
  // a node's own, so what is checked is that the range starts where a token of
  // the diagram starts and ends where one ends. A node without a token, which
  // is a label that is all whitespace, covers its units instead (ast.md,
  // Nodes). The units are not in the tree, so what is checked is that its value
  // is all whitespace, that its range is not empty, and that it holds no
  // character of a token and nothing but whitespace, line terminators,
  // comments, and directives.
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

  // ast.md, Shared leaf nodes > StringLiteral: a string is closed by its
  // second quote, so its `closed` is whether its `raw` has more than one
  // character and ends with the quote that it starts with.
  for (const node of nodes) {
    if (node.type === "StringLiteral") {
      const quote = node.raw.slice(0, 1)
      expect(node.closed, `closed of ${label(node)}`).toBe(
        node.raw.length > 1 && node.raw.endsWith(quote),
      )
    }
  }
}

/**
 * ast.md, Shared leaf nodes, and the Nodes and Tokens of each diagram: for
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
  SequenceIdentifier: true,
  SequenceText: false,
  SequenceLiteral: true,
  SequenceDataBlock: true,
  ClassDiagram: false,
  ClassDeclaration: false,
  ClassMemberStatement: false,
  ClassNameStatement: false,
  ClassAnnotationStatement: false,
  ClassRelationStatement: false,
  ClassArrow: false,
  ClassNamespaceStatement: false,
  ClassNoteStatement: false,
  ClassCallbackStatement: false,
  ClassLinkStatement: false,
  ClassStyleStatement: false,
  ClassCssClassStatement: false,
  ClassClassDefStatement: false,
  ClassDirectionStatement: false,
  ClassAccTitleStatement: false,
  ClassAccDescrStatement: false,
  ClassAccDescrBlockStatement: false,
  ClassName: false,
  ClassMethod: false,
  ClassAttribute: false,
  ClassAnnotation: false,
  ClassLiteral: true,
  ClassIgnoredText: true,
  StateDiagram: false,
  StateDefinitionStatement: false,
  StateTransitionStatement: false,
  StateReference: false,
  StateTerminal: false,
  StateCompositeStatement: false,
  StateAliasDefinitionStatement: false,
  StatePseudostateDefinitionStatement: false,
  StateDividerStatement: false,
  StateNoteStatement: false,
  StateFloatingNoteStatement: false,
  StateClickStatement: false,
  StateClassDefStatement: false,
  StateClassStatement: false,
  StateStyleStatement: false,
  StateDirectionStatement: false,
  StateAccTitleStatement: false,
  StateAccDescrStatement: false,
  StateAccDescrBlockStatement: false,
  StateScaleStatement: false,
  StateHideEmptyDescriptionStatement: false,
  StateIgnoredStatement: true,
  StateLiteral: true,
  StateIgnoredText: true,
}

/** The node types of the data blocks, whose delimiters lie in their range. */
const dataBlockNodeTypes: readonly Node["type"][] = [
  "FlowchartDataBlock",
  "SequenceDataBlock",
]

/**
 * ast/state.md, StateIgnoredText: the value node types whose range holds
 * the tokens of their units, of whatever kind the units have: the empty
 * strings, empty description blocks, and `%%` of a StateIgnoredText.
 */
const nodeTypesWithTokensOfAnyKind: readonly Node["type"][] = [
  "StateIgnoredText",
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
 * The Tokens of each diagram's ast/<diagram>.md: the tokens of a diagram and
 * the value nodes they lie in. A token of a value, `Identifier`, `RawText`,
 * `Numeric`, `String`, or `StringFragment`, lies in a value node. A `Keyword`
 * or `Punctuator` token lies in no value node, except the delimiters of a data
 * block, which the block's range covers, and the tokens of the units of a node
 * that holds them whatever their kind ({@link nodeTypesWithTokensOfAnyKind}). A
 * `;` that the line rule ignores and that is a token of its own is left out: it
 * affects no value, whatever kind the diagram gives it (ast.md, Tokens).
 */
function checkTokensInValueNodes(text: string, root: Root): void {
  const ignoredSemicolonStarts = ignoredSemicolonsOf(text)
  const nodes = nodesOf(root)
  const valueNodes = nodes.filter((node) => valueNodeTypes[node.type])
  for (const token of diagramTokensOf(root)) {
    if (token.value === ";" && ignoredSemicolonStarts.has(token.range[0])) {
      continue
    }
    const holders = valueNodes.filter((node) =>
      contains(node.range, token.range),
    )
    const isValue =
      token.type === "Identifier" ||
      token.type === "RawText" ||
      token.type === "Numeric" ||
      token.type === "String" ||
      token.type === "StringFragment"
    if (isValue) {
      expect(
        holders.length > 0,
        `${label(token)} of ${JSON.stringify(token.value)} lies in no value node`,
      ).toBe(true)
    } else if (token.type === "Keyword" || token.type === "Punctuator") {
      const allowed = holders.every(
        (node) =>
          nodeTypesWithTokensOfAnyKind.includes(node.type) ||
          (token.type === "Punctuator" &&
            dataBlockNodeTypes.includes(node.type)),
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

/** The ranges of the tokens of `root` in `range`, other than the `Directive` tokens. */
function nonDirectiveTokenRangesIn(root: Root, range: Range): Range[] {
  return tokensIn(root, range)
    .filter((token) => token.type !== "Directive")
    .map((token) => token.range)
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
        expectIdentifierName(source.lexer, source.units, node)
        continue
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
 * is a `;`. That every comment is outside the tokens holds for every tree
 * (Invariants). The tree does not tell whether a `;` was ignored, so the
 * third condition cannot ask for more.
 * Tokens of other diagrams do not satisfy these conditions.
 */
function checkErrorDiagramTokens(root: Root): void {
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
  })
}

/**
 * ast/sequence.md: the value of every leaf node is the text of its range, or
 * the part of it that its node type names: an Identifier, a SequenceIdentifier,
 * a SequenceLiteral, a SequenceBoxText, and a SequenceIgnoredStatement the
 * whole text, a SequenceDataBlock the text between `@{` and `}`, and a
 * NumericLiteral the number that its `raw` writes.
 */
function checkSequenceValues(text: string, root: Root): void {
  const { lexer, units } = new SequenceSource(text, root)
  for (const node of nodesOf(root)) {
    const [start, end] = node.range
    let value: string | number, written: string | number
    switch (node.type) {
      case "Identifier":
        expectIdentifierName(lexer, units, node)
        continue
      case "SequenceIdentifier":
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
        // ast/sequence.md, SequenceBoxText: each part is one token, unless a
        // directive cuts it into tokens of the same kind, so the tokens of
        // the text are those that lie in its parts. That the range of each
        // part runs from a token to a token is invariant 9.
        const parts = [node.colorCandidate, node.remainder].filter(
          (part) => part !== null,
        )
        expect(
          nonDirectiveTokenRangesIn(root, node.range),
          `the tokens of ${label(node)} are those of its parts`,
        ).toEqual(
          parts.flatMap((part) => nonDirectiveTokenRangesIn(root, part.range)),
        )
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
 * ast/class.md: the value of every leaf node is the text of its range, or
 * the part of it that its node type names: an Identifier, a ClassLiteral,
 * and a ClassIgnoredText the whole text, a StringLiteral the text without
 * its quotes, or without its opening quote alone when it is not closed
 * (ast.md, StringLiteral), and a ClassArrow the texts of its tokens.
 */
function checkClassValues(text: string, root: Root): void {
  const { lexer, units } = new ClassSource(text, root)
  for (const node of nodesOf(root)) {
    const [start, end] = node.range
    let value: string, written: string
    switch (node.type) {
      case "Identifier":
        expectIdentifierName(lexer, units, node)
        continue
      case "ClassLiteral":
      case "ClassIgnoredText":
        value = node.value
        written = lexer.textOfRange(start, end, [])
        break
      case "StringLiteral":
        value = node.value
        written = lexer.textOfRange(start + 1, node.closed ? end - 1 : end, [])
        break
      case "ClassArrow":
        value = node.value
        written = tokensIn(root, node.range)
          .filter((token) => token.type !== "Directive")
          .map((token) => token.value)
          .join("")
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

/** ast/class.md, ClassArrow: the marker of each relation end. */
const CLASS_MARKERS: Readonly<Record<string, string>> = {
  "<|": "triangle",
  "|>": "triangle",
  "*": "filled-diamond",
  o: "hollow-diamond",
  "<": "arrow",
  ">": "arrow",
  "()": "lollipop",
}

/** ast/class.md, ClassArrow: the line of each line token. */
const CLASS_LINES: Readonly<Record<string, string>> = {
  "--": "solid",
  "..": "dotted",
}

/**
 * ast/class.md, ClassArrow: each relation end and the line are one
 * `Punctuator` token, and the fields are what the tokens write.
 */
function checkClassArrow(root: Root, arrow: ClassArrow): void {
  const tokens = tokensIn(root, arrow.range).filter(
    (token) => token.type !== "Directive",
  )
  for (const token of tokens) {
    expect(token.type, `the kind of ${label(token)} in ${label(arrow)}`).toBe(
      "Punctuator",
    )
  }
  const values = tokens.map((token) => token.value)
  const lineAt = values.findIndex((value) => value in CLASS_LINES)
  expect(lineAt, `the line of ${label(arrow)}`).not.toBe(-1)
  const before = values.slice(0, lineAt)
  const after = values.slice(lineAt + 1)
  expect(
    before.length <= 1 && after.length <= 1,
    `${label(arrow)} has at most one relation end on each side of its line`,
  ).toBe(true)
  expect(
    {
      startMarker: arrow.startMarker,
      line: arrow.line,
      endMarker: arrow.endMarker,
    },
    `the fields of ${label(arrow)}, written ${arrow.value}`,
  ).toEqual({
    startMarker: before.length === 0 ? "none" : CLASS_MARKERS[before[0]],
    line: CLASS_LINES[values[lineAt]],
    endMarker: after.length === 0 ? "none" : CLASS_MARKERS[after[0]],
  })
}

/** ast/class.md, ClassMethod: the mark of each visibility. */
const CLASS_VISIBILITY_MARKS: Readonly<Record<string, string>> = {
  "+": "public",
  "-": "private",
  "#": "protected",
  "~": "package",
}

/** ast/class.md, ClassMethod: the mark of each classifier. */
const CLASS_CLASSIFIER_MARKS: Readonly<Record<string, string>> = {
  $: "static",
  "*": "abstract",
}

/**
 * ast/class.md, ClassMethod and ClassAttribute: the marks of visibility and
 * classifier are `Punctuator` tokens of the member: the visibility mark
 * comes before every other `Punctuator`, and the classifier mark is the
 * one `$` or `*` among them.
 */
function checkClassMember(
  root: Root,
  member: ClassMethod | ClassAttribute,
): void {
  const punctuators = tokensIn(root, member.range)
    .filter((token) => token.type === "Punctuator")
    .map((token) => token.value)
  const [first] = punctuators
  expect(member.visibility, `the visibility of ${label(member)}`).toBe(
    first !== undefined && first in CLASS_VISIBILITY_MARKS
      ? CLASS_VISIBILITY_MARKS[first]
      : "none",
  )
  const classifiers = punctuators.filter(
    (value) => value in CLASS_CLASSIFIER_MARKS,
  )
  expect(
    classifiers.length,
    `${label(member)} has at most one classifier mark`,
  ).toBeLessThanOrEqual(1)
  expect(member.classifier, `the classifier of ${label(member)}`).toBe(
    classifiers.length === 0 ? "none" : CLASS_CLASSIFIER_MARKS[classifiers[0]],
  )
}

/**
 * ast/class.md: asserts what the class document states about its tree
 * beyond the invariants of ast.md: the values of the leaf nodes are the
 * texts of their ranges, the tokens of values lie in value nodes, and the
 * fixed words and marks of a node are its tokens: the relation ends and
 * the line of an arrow, the visibility and classifier marks of a member,
 * the value of a direction statement, and the target of a link.
 */
function checkClassTree(text: string, root: Root): void {
  checkClassValues(text, root)
  checkTokensInValueNodes(text, root)
  for (const node of nodesOf(root)) {
    switch (node.type) {
      case "ClassArrow":
        checkClassArrow(root, node)
        break
      case "ClassMethod":
      case "ClassAttribute":
        checkClassMember(root, node)
        break
      case "ClassDirectionStatement":
        expect(
          tokensIn(root, node.range)
            .filter((token) => token.type === "Keyword")
            .map((token) => token.value),
          `the keywords of ${label(node)}`,
        ).toEqual(["direction", node.direction])
        break
      case "ClassLinkStatement": {
        const last = tokensIn(root, node.range).at(-1)
        expect(
          last?.type === "Keyword" ? last.value : null,
          `the target of ${label(node)} is its last token`,
        ).toBe(node.target)
        break
      }
      default:
        break
    }
  }
}

/**
 * ast/state.md: the value of every leaf node is the text of its range, or
 * the part of it that its node type names: an Identifier, a StateLiteral,
 * a StateIgnoredText, and a StateIgnoredStatement the whole text, and a
 * StringLiteral, which is
 * always closed in this diagram, the text between its quotes.
 */
function checkStateValues(text: string, root: Root): void {
  const { lexer, units } = new StateSource(text, root)
  for (const node of nodesOf(root)) {
    const [start, end] = node.range
    let value: string, written: string
    switch (node.type) {
      case "Identifier":
        expectIdentifierName(lexer, units, node)
        continue
      case "StateLiteral":
      case "StateIgnoredText":
      case "StateIgnoredStatement":
        value = node.value
        written = lexer.textOfRange(start, end, [])
        break
      case "StringLiteral":
        expect(node.closed, `${label(node)} is closed`).toBe(true)
        value = node.value
        written = lexer.textOfRange(start + 1, end - 1, [])
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

/** The values of the `Keyword` tokens of `root` in `range`, in lower case. */
function lowerCaseKeywordsIn(root: Root, range: Range): string[] {
  return tokensIn(root, range)
    .filter((token) => token.type === "Keyword")
    .map((token) => token.value.toLowerCase())
}

/**
 * ast/state.md, StatePseudostateDefinitionStatement: the kind is the word
 * of its mark, the last `Keyword` token, written in any case.
 */
function checkStatePseudostate(
  root: Root,
  statement: StatePseudostateDefinitionStatement,
): void {
  const mark = lowerCaseKeywordsIn(root, statement.range).at(-1)
  expect(
    [`<<${statement.kind}>>`, `[[${statement.kind}]]`],
    `the kind of ${label(statement)}, written ${mark}`,
  ).toContain(mark)
}

/**
 * ast/state.md, StateNoteStatement: the position is the first word of its
 * `position` token, the second `Keyword` token, written in any case.
 */
function checkStateNote(root: Root, statement: StateNoteStatement): void {
  const position = lowerCaseKeywordsIn(root, statement.range)[1]
  expect(
    position,
    `the position of ${label(statement)}, written ${position}`,
  ).toBe(`${statement.position} of`)
}

/**
 * ast/state.md: asserts what the state document states about its tree
 * beyond the invariants of ast.md: the values of the leaf nodes are the
 * texts of their ranges, the tokens of values lie in value nodes, and the
 * fixed words and marks of a node are its tokens: `[*]` and `--`, the
 * kind of a pseudostate, the position of a note, the value of a direction
 * statement, and the `}` of a closed description block.
 */
function checkStateTree(text: string, root: Root): void {
  checkStateValues(text, root)
  checkTokensInValueNodes(text, root)
  for (const node of nodesOf(root)) {
    switch (node.type) {
      case "StateTerminal":
      case "StateDividerStatement":
        expect(
          tokensIn(root, node.range).map((token) => [token.type, token.value]),
          `the token of ${label(node)}`,
        ).toEqual([
          ["Punctuator", node.type === "StateTerminal" ? "[*]" : "--"],
        ])
        break
      case "StatePseudostateDefinitionStatement":
        checkStatePseudostate(root, node)
        break
      case "StateNoteStatement":
        checkStateNote(root, node)
        break
      case "StateDirectionStatement":
        expect(
          lowerCaseKeywordsIn(root, node.range),
          `the keywords of ${label(node)}`,
        ).toEqual(["direction", node.direction.toLowerCase()])
        break
      case "StateAccDescrBlockStatement": {
        const last = tokensIn(root, node.range).at(-1)
        expect(
          last?.type === "Punctuator" && last.value === "}",
          `${label(node)} is closed when it ends with }`,
        ).toBe(node.closed)
        break
      }
      default:
        break
    }
  }
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
  if (root.body.type === "ClassDiagram") checkClassTree(text, root)
  if (root.body.type === "StateDiagram") checkStateTree(text, root)
}
