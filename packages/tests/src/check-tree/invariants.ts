import { agentflowPreservesComments } from "../db-from-tree/converted-text.ts"
import {
  isLineTerminatorCode,
  isWhitespace,
  isWhitespaceAt,
} from "../db-from-tree/characters.ts"
import type { TreeRange } from "../db-from-tree/tree.ts"
import type { ScannedCommentLine, SourceScan } from "../source-scan.ts"
import { scanSource } from "../source-scan.ts"
import { DATA_BLOCK_NODE_TYPES, VALUE_NODE_TYPES } from "./node-types.ts"
import { label } from "./problems.ts"
import type { Problems } from "./problems.ts"
import type {
  CheckedComment,
  CheckedDirective,
  CheckedNode,
  CheckedRoot,
  CheckedToken,
  Placed,
  Position,
} from "./types.ts"
import { childNodesOf, nodesOf, walkNodes } from "./walk.ts"

// packages/parser/docs/positions.md, Positions and Invariants, and
// packages/parser/docs/tokens.md, Comment, and packages/spec/docs/ast.md,
// Directive and Frontmatter: the conditions that every tree satisfies, whatever
// its diagram. Each check below names the condition it implements. The source
// is read for the directives and comment lines by `scanSource()`, not from the
// tree, so that a comment or a directive that the tree lacks is found.

/** Line and column of `offset`, counting `\r\n`, `\r`, and `\n` as one line terminator each. */
function positionOf(text: string, offset: number): Position {
  let line = 1
  let lineStart = 0
  for (let index = 0; index < offset; index++) {
    const character = text[index]
    if (
      character === "\n" ||
      (character === "\r" && text[index + 1] !== "\n")
    ) {
      line++
      lineStart = index + 1
    }
  }
  return { line, column: offset - lineStart }
}

/** Whether the two ranges share a character. */
function overlap(a: TreeRange, b: TreeRange): boolean {
  return a[0] < b[1] && b[0] < a[1]
}

/** Whether `outer` holds every character of `inner`. */
export function contains(outer: TreeRange, inner: TreeRange): boolean {
  return outer[0] <= inner[0] && inner[1] <= outer[1]
}

/**
 * parser/docs/tokens.md, Tokens, and ast.md, Nodes: the tokens of `root` that a
 * node can own: those of the diagram text, without the `Directive` tokens, the
 * `IgnoredSemicolon` tokens, which no grammar reads, and the tokens in the
 * range of the frontmatter.
 */
export function diagramTokensOf(root: CheckedRoot): CheckedToken[] {
  const frontmatterEnd = root.frontmatter?.range[1] ?? 0
  return root.tokens.filter(
    (token) =>
      token.type !== "Directive" &&
      token.type !== "IgnoredSemicolon" &&
      token.range[0] >= frontmatterEnd,
  )
}

/** Reports the entries of `list` that are empty, overlap the one before, or come before it. */
function checkInOrderWithoutOverlap(
  list: readonly Placed[],
  problems: Problems,
): void {
  let previousEnd = 0
  for (const placed of list) {
    problems.expect(
      placed.range[0] >= previousEnd,
      label(placed),
      `overlaps the ${placed.type} before it, or comes before it`,
    )
    problems.expect(
      placed.range[1] > placed.range[0],
      label(placed),
      "is empty",
    )
    previousEnd = placed.range[1]
  }
}

/**
 * parser/docs/tokens.md, Comment: whether a comment region starts at `offset`,
 * after line whitespace. A region can start with a whitespace-only line, so
 * each offset is looked at before its whitespace is passed.
 */
function regionFollowsOnLine(
  text: string,
  offset: number,
  regions: readonly TreeRange[],
): boolean {
  let current = offset
  for (;;) {
    const position = current
    if (regions.some(([start]) => start === position)) return true
    if (current >= text.length) return false
    const code = text.charCodeAt(current)
    if (!isWhitespace(code) || isLineTerminatorCode(code)) return false
    current += 1
  }
}

/**
 * parser/docs/tokens.md, Comment: whether a comment region ends right before
 * `offset`, with only line whitespace between, as before a fragment of a
 * diagram comment that has no mark.
 */
function followsRegion(
  text: string,
  offset: number,
  regions: readonly TreeRange[],
): boolean {
  let current = offset
  for (;;) {
    const position = current
    if (regions.some(([, end]) => end === position)) return true
    if (current === 0) return false
    const code = text.charCodeAt(current - 1)
    if (!isWhitespace(code) || isLineTerminatorCode(code)) return false
    current -= 1
  }
}

/** The offset after the directives that start at `offset`, one after another, each with what its scan takes after it. */
function afterDirectivesAt(scan: SourceScan, offset: number): number {
  let current = offset
  for (;;) {
    const position = current
    const directive = scan.directives.find(
      (candidate) => candidate.range[0] === position,
    )
    if (directive === undefined) return current
    current = directive.scanEnd
  }
}

/**
 * The marks of the diagram comments of each diagram type, as its document
 * defines them: diagrams/sequence.md, Units and contexts; diagrams/state.md,
 * Comments; diagrams/class.md, The statement context; diagrams/er.md,
 * Comments; diagrams/gantt.md, Comments; diagrams/journey.md, Comments;
 * diagrams/requirement.md, Comments; diagrams/mindmap.md, Comments;
 * diagrams/sankey.md, Comments; diagrams/xychart.md, Comments;
 * diagrams/quadrant.md, Comments. A
 * flowchart, an ER diagram, a sankey diagram, and the `error` pseudo-diagram
 * have only comment lines, besides the diagram comments that every diagram type has before its
 * header (see {@link MARKS_BEFORE_THE_HEADER}).
 */
const DIAGRAM_COMMENT_MARKS: Readonly<Record<string, readonly string[]>> = {
  ArchitectureDiagram: ["%%"],
  GitgraphDiagram: ["%%"],
  InfoDiagram: ["%%"],
  PacketDiagram: ["%%"],
  PieDiagram: ["%%"],
  UsecaseDiagram: ["%%"],
  AgentflowDiagram: ["%%"],
  ErrorDiagram: [],
  FlowchartDiagram: [],
  SequenceDiagram: ["#", "%%", "%"],
  ClassDiagram: ["%%"],
  StateDiagram: ["#", "%%"],
  ErDiagram: [],
  GanttDiagram: ["%%", "%"],
  JourneyDiagram: ["#", "%%", "%"],
  RequirementDiagram: ["#", "%%", "%"],
  MindmapDiagram: ["%%"],
  IshikawaDiagram: ["%%"],
  KanbanDiagram: ["%%"],
  C4Diagram: ["%%"],
  VennDiagram: ["%%"],
  TimelineDiagram: ["#", "%%", "%"],
  SankeyDiagram: [],
  XychartDiagram: ["%%"],
  QuadrantDiagram: ["%%"],
  BlockDiagram: [],
}

/**
 * The marks that a diagram type has for the diagram comments before its
 * header only: a line of `%%` alone before the header is a diagram comment
 * with the mark `%%` in every diagram type (common.md, Diagram detection),
 * and a flowchart, an ER diagram, and a sankey diagram have no such comment
 * after their header (diagrams/sankey.md, Detection and Comments).
 */
const MARKS_BEFORE_THE_HEADER: Readonly<Record<string, readonly string[]>> = {
  BlockDiagram: ["%%"],
  FlowchartDiagram: ["%%"],
  ErDiagram: ["%%"],
  SankeyDiagram: ["%%"],
}

/**
 * Where the mark of the diagram comment `comment` ends: `#` when it starts
 * with `#`; `%%` when two `%` are there, with directives between them allowed;
 * `%` otherwise.
 */
function diagramCommentMarkEnd(
  text: string,
  comment: CheckedComment,
  scan: SourceScan,
): number {
  const start = comment.range[0]
  if (text[start] === "#") return start + 1
  const second = afterDirectivesAt(scan, start + 1)
  return second < comment.range[1] && text[second] === "%"
    ? second + 1
    : start + 1
}

/**
 * parser/docs/tokens.md, Comment: the diagram types whose document ends a
 * diagram comment at the end of its line segment, where a U+2028 or a U+2029
 * ends it as a line feed does: the range of the comment ends before it
 * (diagrams/mindmap.md and diagrams/kanban.md, Comments).
 */
const COMMENT_ENDS_AT_LINE_SEGMENT: ReadonlySet<string> = new Set([
  "MindmapDiagram",
  "IshikawaDiagram",
  "KanbanDiagram",
])

/** Whether `code` ends a line segment (common.md, Notation): a line terminator, a U+2028, or a U+2029. */
function isLineSegmentEndCode(code: number): boolean {
  return isLineTerminatorCode(code) || code === 0x2028 || code === 0x2029
}

/**
 * parser/docs/tokens.md, Comment, and common.md, Comment lines: where the
 * diagram comment `comment` ends. It ends before the line terminator that ends
 * its line, or at the end of the text, with three exceptions: where a directive
 * in it takes all that follows, it ends where that directive ends; where a
 * comment region follows it on its line, after U+2028 or U+2029, it is a
 * fragment and ends at its last character that is not whitespace; and a `;`
 * that the line rule ignores and that is the last character of its line is an
 * `IgnoredSemicolon` token after it. No comment ends with a line terminator,
 * and it runs past a line terminator only where a directive in it takes that
 * line terminator. Where the document of the diagram ends a diagram comment at
 * the end of its line segment ({@link COMMENT_ENDS_AT_LINE_SEGMENT}), a U+2028
 * or a U+2029 ends it too, and `endsComment` says so.
 */
function checkDiagramCommentEnd(
  text: string,
  comment: CheckedComment,
  scan: SourceScan,
  regions: readonly TreeRange[],
  ignoredSemicolonStarts: ReadonlySet<number>,
  endsComment: (code: number) => boolean,
  problems: Problems,
): void {
  const where = label(comment)
  const end = comment.range[1]
  problems.expect(
    !endsComment(text.charCodeAt(end - 1)),
    where,
    "ends with a line terminator",
  )
  const inComment = scan.directives.filter((directive) =>
    contains(comment.range, directive.range),
  )
  for (let offset = comment.range[0]; offset < end; offset++) {
    if (!endsComment(text.charCodeAt(offset))) continue
    problems.expect(
      inComment.some(
        (directive) =>
          directive.range[0] < offset && offset < directive.scanEnd,
      ),
      where,
      `runs past the line terminator at ${offset}, which no directive in it takes`,
    )
  }
  const lastDirective = inComment.at(-1)
  if (lastDirective !== undefined && lastDirective.scanEnd === text.length) {
    problems.expect(
      end === lastDirective.range[1],
      where,
      "does not end where the directive that takes the rest of the text ends",
    )
    return
  }
  if (regionFollowsOnLine(text, end, regions)) {
    problems.expect(
      !isWhitespaceAt(text, end - 1),
      where,
      "ends with whitespace before a comment region",
    )
    return
  }
  const after = ignoredSemicolonStarts.has(end) ? end + 1 : end
  const atLineEnd = after === text.length || endsComment(text.charCodeAt(after))
  problems.expect(atLineEnd, where, "does not end where its line ends")
  // common.md, Comment lines: the line terminator it ends at is the next one
  // that is not part of a directive, that no directive scan takes.
  problems.expect(
    !scan.directives.some(
      (directive) => directive.range[0] < after && after < directive.scanEnd,
    ),
    where,
    "ends at a line terminator that a directive takes",
  )
}

/** positions.md, Positions: every range lies inside the input, and every `loc` is the same place as its `range`. */
function checkPositions(
  text: string,
  placedList: readonly Placed[],
  problems: Problems,
): void {
  for (const placed of placedList) {
    const [start, end] = placed.range
    const where = label(placed)
    problems.expect(
      start >= 0 && end <= text.length && start <= end,
      where,
      "lies outside the input",
    )
    problems.expectEqual(
      placed.loc,
      { start: positionOf(text, start), end: positionOf(text, end) },
      where,
      "loc",
    )
  }
}

/** positions.md, Invariants 1: every character of the input is in a token or a comment, or it is whitespace or a line terminator. */
function checkEveryCharacterPlaced(
  text: string,
  root: CheckedRoot,
  problems: Problems,
): void {
  const covered = new Uint8Array(text.length)
  for (const placed of [...root.tokens, ...root.comments]) {
    covered.fill(1, placed.range[0], placed.range[1])
  }
  for (let offset = 0; offset < text.length; offset++) {
    if (covered[offset] === 1) continue
    problems.expect(
      isWhitespaceAt(text, offset),
      `offset ${offset}`,
      `the character outside the tokens and comments is not whitespace: ${JSON.stringify(text[offset])}`,
    )
  }
}

/**
 * positions.md, Invariants 2, and parser/docs/tokens.md, Comment: the text of a
 * comment equals the source text of its range, and its mark and `value` are
 * what the source writes there: a comment line starts at the first `%` of its
 * `%%`, whose two `%` can have directives between them, and its `value` is the
 * source after the second; a fragment of a diagram comment after a comment
 * region has no mark and starts at its first character; any other comment is a
 * diagram comment, whose range starts at its mark and whose `value` is the
 * source after the mark.
 */
function checkComments(
  text: string,
  root: CheckedRoot,
  scan: SourceScan,
  problems: Problems,
): void {
  const regions = scan.commentLines.map((line) => line.region)
  const ignoredSemicolonStarts = new Set(
    root.tokens
      .filter((token) => token.type === "IgnoredSemicolon")
      .map((token) => token.range[0]),
  )
  const lineStarts = new Map<number, ScannedCommentLine>(
    scan.commentLines.map((line) => [line.commentStart, line]),
  )
  const body = root.body.type
  const endsComment = COMMENT_ENDS_AT_LINE_SEGMENT.has(body)
    ? isLineSegmentEndCode
    : isLineTerminatorCode
  for (const comment of root.comments) {
    const where = label(comment)
    const line = lineStarts.get(comment.range[0])
    if (line !== undefined) {
      problems.expectEqual(
        comment.range,
        [line.commentStart, line.commentEnd],
        where,
        "the range of a comment line",
      )
      problems.expect(
        comment.mark === "%%",
        where,
        "the mark of a comment line is not %%",
      )
      // The second `%` of the `%%`, which the scan found, comes after the
      // directives that may lie between the two.
      const secondPercent = afterDirectivesAt(scan, comment.range[0] + 1)
      problems.expectEqual(
        comment.value,
        text.slice(secondPercent + 1, comment.range[1]),
        where,
        "value of a comment line",
      )
    } else if (comment.mark === null) {
      problems.expect(
        followsRegion(text, comment.range[0], regions),
        where,
        "has no mark and follows no comment region",
      )
      problems.expect(
        !isWhitespaceAt(text, comment.range[0]),
        where,
        "starts with whitespace",
      )
      problems.expectEqual(
        comment.value,
        text.slice(...comment.range),
        where,
        "value of a fragment",
      )
      checkDiagramCommentEnd(
        text,
        comment,
        scan,
        regions,
        ignoredSemicolonStarts,
        endsComment,
        problems,
      )
    } else {
      // The header is the first token of the diagram, where the body starts;
      // the frontmatter and the directives before it have tokens of their own.
      const beforeTheHeader = comment.range[1] <= root.body.range[0]
      problems.expect(
        (DIAGRAM_COMMENT_MARKS[body] ?? []).includes(comment.mark) ||
          (beforeTheHeader &&
            (MARKS_BEFORE_THE_HEADER[body] ?? []).includes(comment.mark)),
        where,
        `the mark ${comment.mark} is no mark of the comments of a ${body}`,
      )
      const markEnd = diagramCommentMarkEnd(text, comment, scan)
      problems.expectEqual(
        comment.mark,
        text[comment.range[0]] === "#"
          ? "#"
          : markEnd === comment.range[0] + 1
            ? "%"
            : "%%",
        where,
        "mark",
      )
      problems.expectEqual(
        comment.value,
        text.slice(markEnd, comment.range[1]),
        where,
        "value of a diagram comment",
      )
      checkDiagramCommentEnd(
        text,
        comment,
        scan,
        regions,
        ignoredSemicolonStarts,
        endsComment,
        problems,
      )
    }
  }
  // Every comment line of the source is a comment of the tree.
  for (const line of scan.commentLines) {
    problems.expect(
      root.comments.some((comment) => comment.range[0] === line.commentStart),
      `comment line at ${line.commentStart}-${line.commentEnd}`,
      "is no comment of the tree",
    )
  }
}

/**
 * positions.md, Invariants 2, and ast.md, Directive: the directives of the
 * tree are those that the scan of the source finds, each with the range of
 * the match without the whitespace at its end, which starts with `%%{` and,
 * when the directive is closed, ends with `}%%`; and its `value` is the text
 * between the delimiters, or to the end of the directive when it is not closed.
 */
function checkDirectives(
  text: string,
  root: CheckedRoot,
  scan: SourceScan,
  problems: Problems,
): void {
  problems.expectEqual(
    root.directives.map((directive) => [directive.range, directive.closed]),
    scan.directives.map((directive) => [directive.range, directive.closed]),
    "the directives",
    "the directives of the tree are not those of the source",
  )
  for (const directive of root.directives) {
    const where = label(directive)
    const source = text.slice(...directive.range)
    problems.expectEqual(
      directive.value,
      directive.closed ? source.slice(3, -3) : source.slice(3),
      where,
      "value",
    )
  }
}

/** positions.md, Invariants 2, and ast.md, Frontmatter. */
function checkFrontmatter(
  text: string,
  root: CheckedRoot,
  problems: Problems,
): void {
  const { frontmatter } = root
  if (frontmatter === null) return
  const where = label(frontmatter)
  const source = text.slice(...frontmatter.range)
  problems.expect(source.startsWith("---"), where, "does not start with ---")
  problems.expect(source.endsWith("---"), where, "does not end with ---")
  problems.expect(
    contains(frontmatter.range, frontmatter.valueRange),
    where,
    "its value lies outside it",
  )
  problems.expectEqual(
    frontmatter.value,
    text.slice(...frontmatter.valueRange),
    where,
    "value",
  )
}

/** Where the value starts, inside the opening delimiter of a data block or bracketed label. */
function valueStartOf(node: CheckedNode, root: CheckedRoot): number {
  if (node.type === "UsecaseJsonDataBlock")
    return (
      root.tokens.find(
        (token) => token.value === "{" && contains(node.range, token.range),
      )?.range[1] ?? node.range[0]
    )
  if (node.type === "VennLabel" || node.type === "ArchitectureLabel")
    return node.range[0] + 1
  return DATA_BLOCK_NODE_TYPES.has(node.type)
    ? node.range[0] + 2
    : node.range[0]
}

/** Where the value ends, inside the closing delimiter of a data block or bracketed label. */
function valueEndOf(node: CheckedNode): number {
  return DATA_BLOCK_NODE_TYPES.has(node.type) ||
    node.type === "VennLabel" ||
    node.type === "ArchitectureLabel"
    ? node.range[1] - 1
    : node.range[1]
}

/**
 * positions.md, Invariants 4, and tokens.md, A token that a directive cuts: a
 * token starts or ends with whitespace or a line terminator only where it is
 * at the start or the end of the text that mermaid.js reads as a value, or
 * where a directive, a comment region, or a `;` that the line rule ignores
 * cuts the value and the whitespace next to the cut is read as part of it.
 * The tokens of a value cover that text, and the value's node runs from its
 * first token to its last, so such a token lies in a value node that starts
 * where the token starts, or ends where it ends, or it lies in a value node
 * and starts where a cut ends, or ends where a cut starts. A token that is all
 * whitespace, the whole value or the fragment of it that a cut leaves at its
 * start or its end, starts and ends with whitespace and lies at either end.
 * A token that goes on with a value that the token right before it starts,
 * as the text after the string that a label starts with, keeps the whitespace
 * that mermaid.js reads at its start (positions.md, Invariants, and
 * tokens/flowchart.md, Tokens).
 */
function checkWhitespaceAtTokenEnds(
  text: string,
  root: CheckedRoot,
  nodes: readonly CheckedNode[],
  scan: SourceScan,
  problems: Problems,
): void {
  const valueNodes = nodes.filter((node) => VALUE_NODE_TYPES.has(node.type))
  const cuts: TreeRange[] = [
    ...scan.directives.map((directive): TreeRange => [
      directive.range[0],
      directive.scanEnd,
    ]),
    ...scan.commentLines.map((line) => line.region),
    ...(root.body.type === "AgentflowDiagram"
      ? root.comments.map((comment) => comment.range)
      : []),
    ...root.tokens
      .filter((token) => token.type === "IgnoredSemicolon")
      .map((token) => token.range),
  ]
  const cutEnds = new Set(cuts.map(([, end]) => end))
  const cutStarts = new Set(cuts.map(([start]) => start))
  for (const token of root.tokens) {
    const [start, end] = token.range
    const startsWithWhitespace = isWhitespaceAt(text, start)
    const endsWithWhitespace = isWhitespaceAt(text, end - 1)
    if (!startsWithWhitespace && !endsWithWhitespace) continue
    const allWhitespace = [...token.value].every((character) =>
      isWhitespace(character.codePointAt(0) ?? 0),
    )
    const holders = valueNodes.filter((node) =>
      contains(node.range, token.range),
    )
    const atValueStart = holders.some(
      (node) => valueStartOf(node, root) === start,
    )
    const atValueEnd = holders.some((node) => valueEndOf(node) === end)
    const afterCut = holders.length > 0 && cutEnds.has(start)
    const beforeCut = holders.length > 0 && cutStarts.has(end)
    const goesOn = holders.some((node) =>
      root.tokens.some(
        (other) => other.range[1] === start && node.range[0] <= other.range[0],
      ),
    )
    if (startsWithWhitespace) {
      problems.expect(
        atValueStart ||
          afterCut ||
          goesOn ||
          (allWhitespace && (atValueEnd || beforeCut)),
        label(token),
        "starts with whitespace or a line terminator where no value starts",
      )
    }
    const continues = holders.some((node) =>
      root.tokens.some(
        (other) => other.range[0] === end && other.range[1] <= node.range[1],
      ),
    )
    if (endsWithWhitespace) {
      problems.expect(
        atValueEnd ||
          (allWhitespace && continues) ||
          beforeCut ||
          (allWhitespace && (atValueStart || afterCut)),
        label(token),
        "ends with whitespace or a line terminator where no value ends",
      )
    }
  }
}

/**
 * positions.md, Invariants 6: a directive lies inside no other token. Every
 * directive that lies outside all other tokens and all comments has exactly
 * one `Directive` token, with its range, and every `Directive` token is such a
 * directive's.
 */
function checkDirectiveTokens(root: CheckedRoot, problems: Problems): void {
  const otherTokens = root.tokens.filter((token) => token.type !== "Directive")
  const directiveTokens = root.tokens.filter(
    (token) => token.type === "Directive",
  )
  const directivesOutside: CheckedDirective[] = []
  for (const directive of root.directives) {
    for (const token of otherTokens) {
      problems.expect(
        !overlap(directive.range, token.range),
        label(directive),
        `lies inside ${label(token)}`,
      )
    }
    const insideComment = root.comments.some((comment) =>
      overlap(comment.range, directive.range),
    )
    if (!insideComment) directivesOutside.push(directive)
  }
  problems.expectEqual(
    directiveTokens.map((token) => token.range),
    directivesOutside.map((directive) => directive.range),
    "the Directive tokens",
    "are not those of the directives outside all other tokens and all comments",
  )
}

/**
 * positions.md, Invariants 8: when there is frontmatter, the first tokens are
 * the tokens in its range: the opening `---`, a `Punctuator`; the body, a
 * `RawText` from its first character that is not whitespace to its last, when
 * it is not all whitespace; and the closing `---`, a `Punctuator`. They come
 * before all comments and directives.
 */
function checkFrontmatterTokens(
  text: string,
  root: CheckedRoot,
  problems: Problems,
): void {
  const { frontmatter } = root
  if (frontmatter === null) return
  const [start, end] = frontmatter.range
  const [bodyStart, bodyEnd] = frontmatter.valueRange
  let bodyFirst = bodyStart
  while (bodyFirst < bodyEnd && isWhitespaceAt(text, bodyFirst)) bodyFirst += 1
  let bodyLast = bodyEnd
  while (bodyLast > bodyFirst && isWhitespaceAt(text, bodyLast - 1)) {
    bodyLast -= 1
  }
  const expected: [string, TreeRange][] = [["Punctuator", [start, start + 3]]]
  if (bodyFirst < bodyLast) expected.push(["RawText", [bodyFirst, bodyLast]])
  expected.push(["Punctuator", [end - 3, end]])
  problems.expectEqual(
    root.tokens
      .filter((token) => token.range[0] < end)
      .map((token) => [token.type, token.range]),
    expected,
    "the tokens in the range of the frontmatter",
    "are not the opening delimiter, the body, and the closing delimiter",
  )
  for (const placed of [...root.comments, ...root.directives]) {
    problems.expect(
      placed.range[0] >= frontmatter.range[1],
      label(placed),
      "comes before the end of the frontmatter",
    )
  }
}

/**
 * ast/flowchart.md, FlowchartLink: moves the label in `children` of `link`
 * before its arrow where it starts before it, which is the order of the
 * source.
 */
function placeLabelBeforeArrow(
  link: CheckedNode,
  children: CheckedNode[],
): void {
  const arrowIndex = children.indexOf(link.arrow as CheckedNode)
  const labelIndex = children.indexOf(link.label as CheckedNode)
  const arrow = children[arrowIndex]
  const text = children[labelIndex]
  if (arrow === undefined || text === undefined) return
  if (text.range[0] < arrow.range[0]) {
    children.splice(labelIndex, 1)
    children.splice(arrowIndex, 0, text)
  }
}

/**
 * ast/gantt.md, GanttClickStatement: moves the link in `children` of `click`
 * before the call where it starts before it, which is the order of the source:
 * the child fields keep the call before the link whichever is written first.
 * The ids, which come first in the source whichever part follows, stay first.
 */
function placeHrefBeforeCall(
  click: CheckedNode,
  children: CheckedNode[],
): void {
  const callIndex = children.indexOf(click.call as CheckedNode)
  const hrefIndex = children.indexOf(click.href as CheckedNode)
  const call = children[callIndex]
  const href = children[hrefIndex]
  if (call === undefined || href === undefined) return
  if (href.range[0] < call.range[0]) {
    children[callIndex] = href
    children[hrefIndex] = call
  }
}

/**
 * The nodes whose document says that their child fields are not in source
 * order, each with the function that puts the children of the node in the
 * order of the source from the order of the fields, as the document says.
 * Every other node has its child fields in source order, and a tree that
 * writes them in another order is reported.
 */
export const CHILD_FIELDS_NOT_IN_SOURCE_ORDER: ReadonlyMap<
  string,
  (node: CheckedNode, children: CheckedNode[]) => void
> = new Map([
  // ast/flowchart.md, FlowchartLink: the label written between the opening
  // arrow and the closing one comes before the arrow in the source and after
  // it among the child fields.
  ["FlowchartLink", placeLabelBeforeArrow],
  ["AgentflowLink", placeLabelBeforeArrow],
  // ast/gantt.md, GanttClickStatement: the child fields are always `ids`,
  // `call`, `href`, whichever of the call and the link is written first; the
  // ids are written first whichever part follows.
  ["GanttClickStatement", placeHrefBeforeCall],
])

/**
 * positions.md, Invariants 9 and the child nodes: `Root.range` covers the
 * whole input; the range of every other node runs from the start of its first
 * token to the end of its last, inside the range of its parent; the child
 * nodes of a node do not overlap and can be put in source order. The tree does
 * not say which tokens are a node's own, so what is checked is that the range
 * starts where a token of the diagram starts and ends where one ends: every
 * node has at least one token, a label that is all whitespace the token of
 * that whitespace (positions.md, Invariants).
 */
function checkNodeRanges(
  text: string,
  root: CheckedRoot,
  problems: Problems,
): void {
  problems.expectEqual(
    root.range,
    [0, text.length],
    "Root",
    "the root does not cover the whole input",
  )
  const diagramTokens = diagramTokensOf(root)
  const tokenStarts = new Set(diagramTokens.map((token) => token.range[0]))
  const tokenEnds = new Set(diagramTokens.map((token) => token.range[1]))
  const lastStatement = Array.isArray(root.body.body)
    ? (root.body.body as CheckedNode[]).at(-1)
    : undefined
  const agentflowUnclosed =
    root.body.type === "AgentflowDiagram" &&
    lastStatement?.type === "AgentflowAccDescrBlockStatement" &&
    lastStatement.closed === false
  walkNodes(root, (node, parent) => {
    if (parent === null) return
    const where = label(node)
    problems.expect(
      contains(parent.range, node.range),
      where,
      `lies outside ${label(parent)}`,
    )
    problems.expect(
      tokenStarts.has(node.range[0]) &&
        (tokenEnds.has(node.range[1]) ||
          (agentflowUnclosed &&
            (node === root.body || node === lastStatement) &&
            node.range[1] === text.length)),
      where,
      "does not run from the start of a token to the end of a token",
    )
  })
  // The child nodes of a node do not overlap, and they can be put in source
  // order (positions.md, Invariants): taken in the order of their ranges, one
  // ends before the next starts.
  walkNodes(root, (node) => {
    const children = childNodesOf(node).sort((a, b) => a.range[0] - b.range[0])
    for (let index = 1; index < children.length; index++) {
      const previous = children[index - 1]
      const current = children[index]
      if (previous === undefined || current === undefined) continue
      problems.expect(
        !overlap(previous.range, current.range),
        label(current),
        `overlaps the child node ${label(previous)} of ${label(node)}`,
      )
    }
  })
  // ast.md, Nodes: a list in a child field is in source order, and so are the
  // child fields of a node, which the field tables list in the order of the
  // visit, except for the nodes of `CHILD_FIELDS_NOT_IN_SOURCE_ORDER`, whose
  // document says otherwise.
  walkNodes(root, (node) => {
    const children = childNodesOf(node)
    CHILD_FIELDS_NOT_IN_SOURCE_ORDER.get(node.type)?.(node, children)
    for (let index = 1; index < children.length; index++) {
      const previous = children[index - 1]
      const current = children[index]
      if (previous === undefined || current === undefined) continue
      problems.expect(
        previous.range[0] <= current.range[0],
        label(current),
        `comes before the child node ${label(previous)} of ${label(node)}, which the child fields list before it`,
      )
    }
  })
  // ast.md, Nodes and ErrorDiagram: the tokens of the node in `Root.body` are
  // all the tokens of the diagram text other than the `Directive` and the
  // `IgnoredSemicolon` tokens, so its range runs from the first of them to the
  // last; an ErrorDiagram has at least the token that holds `error`.
  const first = diagramTokens[0]
  const last = diagramTokens.at(-1)
  problems.expect(first !== undefined, "Root.body", "has no token")
  if (first !== undefined && last !== undefined) {
    problems.expectEqual(
      root.body.range,
      [first.range[0], agentflowUnclosed ? text.length : last.range[1]],
      "Root.body",
      "does not run from its first token to its last",
    )
  }
}

/** positions.md, Invariants, last item: the `raw` of a StringLiteral or a NumericLiteral equals the source text of its range; ast.md, StringLiteral: `closed` is whether the `raw` has more than one character and ends with the quote that it starts with. */
function checkRaw(
  text: string,
  nodes: readonly CheckedNode[],
  problems: Problems,
): void {
  for (const node of nodes) {
    if (node.type !== "StringLiteral" && node.type !== "NumericLiteral")
      continue
    const where = label(node)
    problems.expectEqual(node.raw, text.slice(...node.range), where, "raw")
    if (node.type === "StringLiteral" && typeof node.raw === "string") {
      const quote = node.raw.slice(0, 1)
      problems.expectEqual(
        node.closed,
        node.raw.length > 1 && node.raw.endsWith(quote),
        where,
        "closed",
      )
    }
  }
}

/**
 * Checks the conditions that ast.md and positions.md state for every tree,
 * whatever its diagram, in the order of positions.md, Invariants. Problems are
 * added to `problems`.
 */
export function checkInvariants(
  text: string,
  root: CheckedRoot,
  problems: Problems,
): void {
  const nodes = nodesOf(root)
  const found = scanSource(text, root.frontmatter?.range[1] ?? 0)
  const scan =
    root.body.type === "AgentflowDiagram" &&
    agentflowPreservesComments(text, root)
      ? {
          ...found,
          commentLines: found.commentLines.filter(
            (line) => line.commentStart < root.body.range[0],
          ),
        }
      : found
  const records: Placed[] = [
    ...(root.frontmatter === null ? [] : [root.frontmatter]),
    ...root.comments,
    ...root.directives,
  ]
  checkPositions(text, [...nodes, ...root.tokens, ...records], problems)
  // Invariant 1.
  checkEveryCharacterPlaced(text, root, problems)
  // Invariant 2.
  for (const token of root.tokens) {
    problems.expectEqual(
      token.value,
      text.slice(...token.range),
      label(token),
      "value",
    )
  }
  checkComments(text, root, scan, problems)
  checkDirectives(text, root, scan, problems)
  checkFrontmatter(text, root, problems)
  // Invariant 3.
  checkInOrderWithoutOverlap(root.tokens, problems)
  // Invariant 4.
  checkWhitespaceAtTokenEnds(text, root, nodes, scan, problems)
  // Invariant 5: a comment lies outside all tokens.
  for (const comment of root.comments) {
    for (const token of root.tokens) {
      problems.expect(
        !overlap(comment.range, token.range),
        label(comment),
        `lies inside ${label(token)}`,
      )
    }
  }
  // Invariant 6.
  checkDirectiveTokens(root, problems)
  // Invariant 7: no two comments overlap, and no two directives overlap.
  checkInOrderWithoutOverlap(root.comments, problems)
  checkInOrderWithoutOverlap(root.directives, problems)
  // Invariant 8.
  checkFrontmatterTokens(text, root, problems)
  // Invariant 9 and the child nodes.
  checkNodeRanges(text, root, problems)
  // Invariant 11.
  checkRaw(text, nodes, problems)
}
