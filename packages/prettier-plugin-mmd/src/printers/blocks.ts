import type { Doc, ParserOptions } from "prettier"
import { builders } from "prettier/doc"
import type { Range } from "@mmd-toolkit/parser"
import type { MermaidAst } from "../parser.ts"
import type { Gap, ItemRun } from "./gap.ts"
import { endsWithSpaceOrTab, readGap } from "./gap.ts"
import type { KeptLines } from "./kept-lines.ts"
import {
  holdsJoiningRegion,
  lineEndOf,
  lineStartOf,
  withJoinedLines,
} from "./kept-lines.ts"
import { toAsciiLowerCase } from "./layout.ts"
import type { Line } from "./lines.ts"
import {
  breakAfter,
  endsInsideOpenText,
  indentationOf,
  joinLines,
  lineBreakBetween,
  printAsWritten,
  withLeading,
  withTrailing,
} from "./lines.ts"
import type { Source } from "./source.ts"
import {
  findTokenEndingBefore,
  findTokenStartingAt,
  findTokensBetween,
  isStructural,
  isWhitespace,
} from "./source.ts"

const { indent } = builders

/**
 * What the printing of a block needs of a statement: where it lies in the
 * source. A statement of the tree has it, and so has a unit that a diagram
 * printer makes of several statements that stay on one line.
 */
export interface Positioned {
  readonly range: Range
}

/**
 * What a diagram printer tells the printing of its blocks about its
 * statements. Everything else about a block is the same for every diagram
 * type: each statement on a line of its own, the comments and directives
 * between them, the `;` that separate them, and the empty lines. `Statement`
 * is the statement type of the diagram type.
 */
export interface BlockRules<Statement extends Positioned> {
  /**
   * Joining regions already belong to complete value atoms in this layout:
   * skip whole-line joining and verbatim fallback for those regions, so gaps
   * outside the atoms can still format. Kept-line rules otherwise apply.
   */
  readonly joiningRegionsInValues?: boolean
  /** The lines whose statements stay together (see `KeptLines`). */
  readonly kept: KeptLines
  /** Overrides ordinary blank placement before a statement, when supplied. */
  readonly blankBeforeStatement?: (statement: Statement, gap: Gap) => boolean
  /**
   * A retained break after trivia or the preceding printed boundary,
   * excluding the next line's indentation.
   * Ishikawa preserves diagram-comment Unicode boundaries and terminal gaps
   * while still aligning the comments themselves (docs/ishikawa.md, Comments).
   */
  readonly triviaLineBreak?: (
    start: number,
    end: number,
    terminal: boolean,
  ) => Doc | undefined
  /**
   * Where the source text of a gap that is kept stops, or undefined for a gap
   * that is formatted as usual (docs/kanban.md, Blank lines; docs/c4.md,
   * Blank lines and Comments). The gap runs from `start` to `end`. The hook
   * is called before a statement, before the closing brace of a nested body,
   * and at the end of the diagram. `beforeStatement` is true in the first
   * two cases and false at the end of the diagram. A kept gap is printed as
   * written, its line breaks and empty lines included, up to the returned
   * offset. When `beforeStatement` is true, what follows, up to the statement
   * or closing brace, is indentation that the printer decides. Absent for
   * diagrams whose gaps use the ordinary comment and blank-line rules.
   */
  readonly keptGapEnd?: (
    start: number,
    end: number,
    beforeStatement: boolean,
  ) => number | undefined
  /**
   * The end of text kept verbatim within a joined line. Unlike `keptGapEnd`,
   * this preserves inline spacing without preserving a line break.
   */
  readonly keptInlineGapEnd?: (start: number) => number
  /**
   * What precedes a closing delimiter on a joined line even without a
   * following statement. Empty description blocks can require attachment;
   * the ordinary rule only joins a closer when another statement follows it.
   */
  readonly keptClosingJoin?: string
  /**
   * Whether a kept first body line continues the opening line. False when
   * the layout moves an opening delimiter onto its call's line and the
   * grammar then requires a newline before the first child.
   */
  readonly keepsOpeningLine?: boolean
  /**
   * Whether trailing spaces inside trivia at the end of a kept stretch are
   * value text. The default keeps the existing line-ending policy; Venn's
   * diagram comments retain their complete text through LF, including after
   * Unicode separators (docs/venn.md, Comments and Line terminators).
   */
  readonly keepsTrailingWhitespaceInKeptTrivia?: boolean
  /**
   * Where the line of the diagram that holds `offset` ends, when that is
   * before the line feed that ends the line of the source, or undefined: at
   * the U+2028 or U+2029 that ends a diagram comment in a kanban board
   * (docs/kanban.md, Whitespace characters). The statements of a kept line stay
   * together only up to this offset, and a statement after it starts a line
   * of its own.
   */
  readonly diagramLineEnd?: (offset: number) => number | undefined
  /**
   * Indentation of an ordinary statement line that the printer decides apart
   * from the other lines, when its inline directives make the whitespace
   * around them part of its indentation. Gap items still use
   * `extraIndentationOf` (docs/kanban.md, Directives).
   */
  readonly writtenIndentationOf?: (statement: Statement) => string | undefined
  /**
   * Where the printed text of a statement ends: at its last token, or after
   * the whitespace after it that belongs to it.
   */
  readonly printedEnd: (statement: Statement) => number
  /**
   * Whether a statement holds statements of its own, such as a subgraph.
   * On a kept line, such a statement is printed as written with the line,
   * and a kept line inside it starts no stretch of the block around it.
   */
  readonly holdsStatements: (statement: Statement) => boolean
  /**
   * Whether a statement that stands on a line of its own is dropped at the
   * top level, such as a `;` of its own in flowchart.
   */
  readonly isDroppedAtTopLevel: (statement: Statement) => boolean
  /**
   * Whether a line of only whitespace after a line that ends with a comment
   * is kept, as a line of one space where it stands among the comment lines
   * and directive lines after that line, also at the start of a block.
   * mermaid.js reads the line breaks after a comment that
   * follows a unit of a class diagram as part of the comment, over empty
   * lines and comment lines, up to a line of only whitespace (known
   * divergence `comment-takes-line-break`), so without such a line it would
   * read the next line as part of the statement, and formatting would
   * change what it draws (docs/class.md, Comments).
   */
  readonly keepsWhitespaceLineAfterComment: boolean
  /**
   * Whether a line of only directives keeps the indentation it was written
   * with, in the two places where the indentation of the block would change
   * what mermaid.js reads. Right after a line of only `%%`, or after more such
   * lines and comment lines, it has none: in a class diagram, a line of only
   * whitespace after such a `%%` line is a `newline` unit of its own, and the
   * line of a directive, with the indentation before it, is one
   * (diagrams/class.md, The statement context), so with indentation the text
   * would be rejected. After
   * a comment that takes the line breaks after it (see
   * `keepsWhitespaceLineAfterComment`), it keeps the indentation as written:
   * the whitespace that a removed directive leaves is a line of only
   * whitespace, which ends what the comment takes, so the line may not gain
   * or lose its indentation.
   */
  readonly keepsDirectiveLinesUnindented: boolean
  /**
   * Whether directives between same-line statements remain with the previous
   * statement when they split into separate lines (docs/venn.md, Directives).
   * A directive touching the following statement instead requires that line
   * to be joined by the diagram's kept-line rules.
   */
  readonly keepsInlineDirectivesWithPrevious?: boolean
  /** Whether separator semicolons before real comments can be dropped. */
  readonly dropsSeparatorsBeforeComments?: boolean
  /** Whether EOF is inside a diagram-specific value that must gain no LF. */
  readonly endsInsideValue?: () => boolean
  /**
   * The indentation that a statement stands deeper than the block, for a
   * diagram type whose tree keeps statements of different levels in one flat
   * list, as the tasks after a `section` in a Gantt chart and a user journey.
   * The lines of the comments and directives before a statement, and a line
   * of the statement, start with it; the comments and directives at the end
   * of the block start with that of its last statement. Without it, every
   * statement stands at the level of the block.
   */
  readonly extraIndentationOf?: (statement: Statement) => string
  /**
   * The indentation of a line of only a comment that starts with `%%{`
   * without being a directive, and of a line of a comment with the mark `%`
   * that such a line follows, in a Gantt chart: one whitespace character,
   * after the line break, whatever the level of the block. mermaid.js reads a
   * `%%{` only when its whitespace is one character, or one character after
   * the line feeds, and rejects the text otherwise; and a `%` comment that it
   * reaches directly, which it does when the whitespace before it is of
   * another kind, takes the line feeds after it, so that the `%%{` after it
   * is reached directly too (diagrams/gantt.md, Comments; known divergences
   * `percent-brace-after-unit` and `comment-takes-line-break`). A deeper
   * indentation, or none after a blank line, would change what it reads.
   */
  readonly oneCharacterIndentation?: string
  /**
   * The indentation that a kept line starts with, where it keeps its
   * indentation (see `KeptLines.writtenIndentation`), when that is not the
   * whitespace written before the line. In a mindmap the whitespace that
   * counts as the indentation of a node is all the whitespace before its
   * text, the whitespace after a directive on its line included, and the
   * lines' levels come from how many characters it holds (diagrams/mindmap.md,
   * Indentation and parents), so the printer decides the whitespace before the
   * directive.
   */
  readonly keptIndentationOf?: (statement: Statement) => string
  /**
   * Whether the whitespace before a directive on a line of its own, in the
   * gap after the statement, may be read as text of the statement: the line
   * right after the statement, or after comment lines only, is empty once
   * mermaid.js removes the directive and the comment lines before it, and the
   * whitespace that the printer would put before the directive would be a
   * character that the lexer takes for the statement. After an empty line
   * the whitespace is not read, but the printer does not tell the two apart.
   * In a timeline, a period that is the word `title` or `section` alone is a
   * period because the line after it is empty; with whitespace before the
   * directive, the word is a title or a section of that whitespace
   * (diagrams/timeline.md, Trivia between units). Every line of only
   * directives in the gap stands at the first column, which is one rule.
   */
  readonly readsDirectiveLineWhitespaceAfter?: (statement: Statement) => boolean
}

/** Where a block of statements lies in the source, and which block it is. */
export interface BlockBounds<Statement extends Positioned> {
  readonly statements: readonly Statement[]
  /** The end of the line that opens the block. */
  readonly start: number
  /** The start of what closes the block: `end`, or the end of the text. */
  readonly end: number
  readonly isTopLevel: boolean
}

/** The lines of a block, and what stands on the lines that open and close it. */
export interface PrintedBlock {
  /** Items on the line that opens the block. */
  readonly headerTrailing: ItemRun | null
  /** An exact terminal gap, including its final newline, when protected. */
  readonly writtenEnd?: Doc
  /** Whether EOF belongs to a value, so no final newline is added. */
  readonly endsInsideValue?: boolean
  /**
   * Whether the first line continues the line that opens the block (see
   * `KeptLines`).
   */
  readonly continuesOpeningLine: boolean
  readonly lines: readonly Line[]
  /** Items on the line that closes the block, before what closes it. */
  readonly endLeading: ItemRun | null
  /**
   * The indentation that `endLeading`, a line of only directives, keeps (see
   * `BlockRules.keepsDirectiveLinesUnindented`), or undefined.
   */
  readonly endLeadingIndentation: string | undefined
  /** Whether the source has an empty line before `endLeading`. */
  readonly endBlank: boolean
  /**
   * What stands between the last line of the block and what closes it, when
   * the closing `}` or `end` stays on that line: a line of the block that is
   * kept together with a statement after the block, or printed as written
   * (see `KeptLines`), cannot be broken before the closing, or the line would
   * not be the line that the source has, and formatting again would move the
   * statement that follows. Null when the closing stands on a line of its own.
   */
  readonly closingJoin: string | null
  /**
   * The indentation beyond the block's of its last statement (see
   * `BlockRules.extraIndentationOf`), for `endLeading`, which stands on the
   * line after it; empty without one.
   */
  readonly endExtraIndentation: string
}

/** Statements that stay on one line, with what lies between them. */
interface Stretch {
  /** Where the stretch starts in the source. */
  readonly start: number
  /** Where it ends: the end of its last line, or of its last statement. */
  readonly end: number
  /** The position of its first statement in the block. */
  readonly first: number
  /** The position after its last statement in the block. */
  readonly after: number
}

/**
 * The indentation of a line with a comment that starts with `%%{`, which has
 * `gaps` gaps of whitespace before the comment after its first item (see
 * `ItemLine.percentBraceGaps`): the whitespace before the comment is one
 * character in all, the one of a gap or the indentation.
 */
function percentBraceIndentation(gaps: number, one: string): string {
  return gaps === 0 ? one : ""
}

/**
 * Prints the statements of a block, whose printed forms are `docs`, with
 * the comments and directives between them.
 *
 * The statements of a kept line (see `KeptLines`) stay together on it, from
 * its first statement to its end, with the `;` between them; a statement
 * that ends on such a line starts it. When the line that opens the block is
 * one, the rest of it stays on that line. A verbatim line is printed as
 * written; on a joined line, the statements are formatted and the `;` and
 * the directives between them keep the whitespace written beside them. A
 * statement that holds statements is part of such a stretch, and then
 * printed as written as a whole, only when its last line is kept; its other
 * lines are its own.
 */
export function printBlock<Statement extends Positioned>(
  docs: readonly Doc[],
  source: Source,
  bounds: BlockBounds<Statement>,
  rules: BlockRules<Statement>,
): PrintedBlock {
  const { statements } = bounds
  const kept =
    rules.joiningRegionsInValues === true
      ? rules.kept
      : withJoinedLines(source, rules.kept)
  const lines: Line[] = []
  let headerTrailing: ItemRun | null = null
  let offset = bounds.start
  let next = 0
  let continuesOpeningLine = false
  let spaceLinePending = false
  let stretchEndsWithComment = false
  let endsAfterBareMarker = false
  let endsAfterTakingComment = false
  /**
   * The indentation beyond the block's for the lines being added (see
   * `BlockRules.extraIndentationOf`).
   */
  let extra = ""

  /**
   * The indentation that a line of only directives keeps instead of the one
   * of the block, or undefined (see `BlockRules.keepsDirectiveLinesUnindented`):
   * none after a line of only `%%`, and as written after a comment that takes
   * the line breaks after it.
   */
  function keptIndentation(
    afterMarker: boolean,
    afterTakingComment: boolean,
    written: string,
  ): string | undefined {
    if (afterMarker) return ""
    return rules.keepsDirectiveLinesUnindented && afterTakingComment
      ? written
      : undefined
  }

  /**
   * Whether the whitespace before a directive on a line right after the
   * statement is read as its text (see
   * `BlockRules.readsDirectiveLineWhitespaceAfter`).
   */
  function readsWhitespaceAfter(statement: Statement | undefined): boolean {
    return (
      statement !== undefined &&
      rules.readsDirectiveLineWhitespaceAfter?.(statement) === true
    )
  }

  /**
   * Whether a line of the body has been added: the part of the opening line
   * that is kept as written is a line of the block, but a blank line after
   * it is a blank line after the opening line, which is dropped.
   */
  function hasBodyLines(): boolean {
    return lines.length > (continuesOpeningLine ? 1 : 0)
  }

  /**
   * Adds a line, after a line of one space when the gap before it asks for
   * one (see `BlockRules.keepsWhitespaceLineAfterComment`).
   */
  function pushLine(line: Line): void {
    const placed =
      extra === "" || line.writtenIndentation !== undefined
        ? line
        : { ...line, extraIndentation: extra }
    lines.push(spaceLinePending ? { ...placed, spaceLineBefore: true } : placed)
    spaceLinePending = false
  }

  /**
   * The indentation of the line `index` of a gap that a diagram whose comments
   * are read by the whitespace before them decides (see
   * `BlockRules.oneCharacterIndentation`), or undefined for any other line:
   *
   * - A line with a comment that starts with `%%{` stands after one character
   *   in all, the spaces between its items counted.
   * - A line of only directives before such a line stands at the first
   *   column: mermaid.js removes the directives before it reads the text, so
   *   the whitespace of the line counts as whitespace before the comment.
   * - A line with a comment with the mark `%` before such a line stands after
   *   one character.
   */
  function percentCommentIndentation(
    gap: Gap,
    index: number,
  ): string | undefined {
    const one = rules.oneCharacterIndentation
    if (one === undefined) return undefined
    const line = gap.lines[index]
    if (line.percentBraceGaps !== null) {
      return percentBraceIndentation(line.percentBraceGaps, one)
    }
    const nextSpaces =
      index + 1 < gap.lines.length
        ? gap.lines[index + 1].percentBraceGaps
        : gap.leadingPercentBraceGaps
    if (line.singlePercent && nextSpaces !== null) return one
    if (line.directivesOnly && isFollowedByPercentBrace(gap, index)) return ""
    return undefined
  }

  /**
   * Whether only lines of directives lie between the line `index` of a gap
   * and a line with a comment that starts with `%%{`.
   */
  function isFollowedByPercentBrace(gap: Gap, index: number): boolean {
    for (const following of gap.lines.slice(index + 1)) {
      if (following.percentBraceGaps !== null) return true
      if (!following.directivesOnly) return false
    }
    return gap.leadingPercentBraceGaps !== null
  }

  /** A break after the last trivia item in this gap, if the diagram retains it. */
  function triviaBreakBefore(end: number, terminal = false): Doc | undefined {
    const previous = source.trivia.findLast(
      (item) => offset <= item.range[1] && item.range[1] <= end,
    )
    return rules.triviaLineBreak?.(previous?.range[1] ?? offset, end, terminal)
  }

  /**
   * Adds the items of a gap: those on the line before it to that line, and
   * those on lines of their own as lines.
   */
  function addItemLines(gap: Gap, previous: Statement | undefined): void {
    const readsWhitespace = readsWhitespaceAfter(previous)
    if (lines.length === 0) headerTrailing = gap.trailing
    else appendTrailing(lines, gap.trailing)
    const keepsWhitespaceLines =
      rules.keepsWhitespaceLineAfterComment &&
      (gap.trailingEndsWithComment || stretchEndsWithComment)
    stretchEndsWithComment = false
    let afterBareMarker = false
    for (const [index, line] of gap.lines.entries()) {
      const unindented: boolean =
        rules.keepsDirectiveLinesUnindented &&
        afterBareMarker &&
        line.directivesOnly
      const indentation =
        percentCommentIndentation(gap, index) ??
        keptIndentation(
          unindented || (readsWhitespace && line.directivesOnly),
          keepsWhitespaceLines && line.directivesOnly,
          line.indentation,
        )
      afterBareMarker =
        line.bareMarker ||
        unindented ||
        (afterBareMarker && line.commentLinesOnly)
      pushLine({
        doc: line.run.doc,
        ...(triviaBreakBefore(line.run.range[0]) === undefined
          ? {}
          : { writtenBreakBefore: triviaBreakBefore(line.run.range[0]) }),
        blankBefore: hasBodyLines() && line.blankBefore,
        endsWithWhitespace: line.run.endsWithWhitespace,
        spaceLineBefore: keepsWhitespaceLines && line.whitespaceLineBefore,
        ...(indentation === undefined
          ? {}
          : { writtenIndentation: indentation }),
      })
    }
    endsAfterBareMarker = afterBareMarker
    endsAfterTakingComment = keepsWhitespaceLines
    spaceLinePending = keepsWhitespaceLines && gap.whitespaceLineAfter
  }

  /** Whether a comment ends the text of a stretch that ends at `end`. */
  function endsWithComment(end: number): boolean {
    let trimmed = end
    while (trimmed > 0 && isWhitespace(source.text[trimmed - 1])) trimmed--
    return source.root.comments.some((comment) => comment.range[1] === trimmed)
  }

  /** Whether the line that holds `position` keeps its statements together. */
  function isKept(position: number): boolean {
    const line = lineStartOf(source, position)
    return kept.joined.has(line) || kept.verbatim.has(line)
  }

  /**
   * The stretch that starts at `start`, with the statements from `first` to
   * before `after` and the text up to `end`: while the line it ends on is
   * kept, it extends over the rest of that line and every statement that
   * starts on it.
   */
  function findStretch(
    start: number,
    first: number,
    statementsAfter: number,
    end: number,
  ): Stretch {
    let after = statementsAfter
    let stretchEnd = end
    while (isKept(stretchEnd - 1)) {
      const lineEnd = Math.min(
        lineEndOf(source, stretchEnd),
        bounds.end,
        rules.diagramLineEnd?.(stretchEnd) ?? Infinity,
      )
      const following = statements[after]
      if (following === undefined || following.range[0] >= lineEnd) {
        return { start, end: Math.max(stretchEnd, lineEnd), first, after }
      }
      stretchEnd = Math.max(stretchEnd, rules.printedEnd(following))
      after++
    }
    return { start, end: stretchEnd, first, after }
  }

  /**
   * Whether the only verbatim lines of a stretch are the line that opens the
   * block that it holds and the line that closes it, with the body on the
   * lines between: the opening line is printed as written by the layout of
   * the block, the text after the closing `}` as written (see
   * `printStretch`), and the body as the body of any block, which is not as
   * written (docs/state.md, Line separators). A block whose body starts on
   * the opening line, because a directive that is not closed joins the
   * lines, is printed as written.
   */
  function isEdgeLinesOfBlock(
    stretch: Stretch,
    covered: readonly Statement[],
  ): boolean {
    const block = covered.at(-1)
    if (block === undefined || !rules.holdsStatements(block)) return false
    const closer = findTokenEndingBefore(source, block.range[1])
    if (
      closer === undefined ||
      (closer.value !== "}" && toAsciiLowerCase(closer.value) !== "end") ||
      findContentStart(source, closer.range[0]) !== closer.range[0]
    ) {
      return false
    }
    const openingEnd = lineEndOf(source, stretch.start)
    const closingStart = lineStartOf(source, closer.range[0])
    return (
      closingStart > openingEnd &&
      !holdsVerbatimLine(source, kept, openingEnd + 1, closingStart, true)
    )
  }

  /**
   * Prints a stretch: as written when one of its lines is verbatim or it
   * holds a statement that holds statements, and otherwise its statements
   * as formatted, with what lies between them (see `printInlineGap`).
   */
  function printStretch(stretch: Stretch): Line {
    const covered = statements.slice(stretch.first, stretch.after)
    if (
      (holdsVerbatimLine(source, kept, stretch.start, stretch.end) &&
        !isEdgeLinesOfBlock(stretch, covered)) ||
      (rules.joiningRegionsInValues !== true &&
        holdsJoiningRegion(source, stretch.start, stretch.end))
    ) {
      return {
        doc: printAsWritten(source, stretch.start, stretch.end),
        blankBefore: false,
        endsWithWhitespace: endsWithSpaceOrTab(
          source.text.slice(stretch.start, stretch.end),
        ),
      }
    }
    const parts: Doc[] = []
    let position = stretch.start
    for (const [index, statement] of covered.entries()) {
      parts.push(
        printInlineGap(
          source,
          position,
          statement.range[0],
          {
            atLineStart:
              position === stretch.start && stretch.start !== bounds.start,
            atLineEnd: false,
          },
          rules.keptInlineGapEnd,
        ),
        docs[stretch.first + index],
      )
      position = rules.printedEnd(statement)
    }
    const last = covered.at(-1)
    // A line separator is no whitespace to every rule of mermaid.js: the
    // whitespace after the last statement stays as written where it holds
    // one (docs/state.md, Line separators).
    const written = source.text.slice(position, stretch.end)
    const trailing =
      written.trim() === "" &&
      (written.includes("\u2028") || written.includes("\u2029"))
        ? printAsWritten(source, position, stretch.end)
        : printInlineGap(
            source,
            position,
            stretch.end,
            {
              atLineStart: false,
              atLineEnd: true,
            },
            rules.keptInlineGapEnd,
          )
    return {
      doc: [...parts, trailing],
      blankBefore: false,
      endsWithWhitespace:
        (position === stretch.end &&
          last !== undefined &&
          endsWithSpaceOrTab(source.text.slice(last.range[0], position))) ||
        (rules.keepsTrailingWhitespaceInKeptTrivia === true &&
          source.trivia.some(
            (item) =>
              item.range[1] === stretch.end &&
              endsWithSpaceOrTab(
                source.text.slice(item.range[0], item.range[1]),
              ),
          )),
    }
  }

  /**
   * What stands before the closing of the block on its line, or null (see
   * `PrintedBlock.closingJoin`): the closing stays on the line of the last
   * line of the block when that line is kept, as written, or together with a
   * statement that follows the closing on it.
   */
  function findClosingJoin(): string | null {
    if (bounds.isTopLevel || lines.length === 0) return null
    const closingLine = lineStartOf(source, bounds.end)
    if (
      !isKept(bounds.end) ||
      lineStartOf(source, offset - 1) !== closingLine
    ) {
      return null
    }
    if (kept.verbatim.has(closingLine)) return ""
    if (rules.keptClosingJoin !== undefined) return rules.keptClosingJoin
    const closing = findTokenStartingAt(source, bounds.end)
    if (closing === undefined) return null
    const followed = findTokensBetween(
      source,
      closing.range[1],
      lineEndOf(source, bounds.end),
    ).some((token) => isStructural(source, token))
    return followed ? " " : null
  }

  if (rules.keepsOpeningLine !== false && isKept(bounds.start - 1)) {
    const stretch = findStretch(bounds.start, 0, 0, bounds.start)
    if (stretch.end > bounds.start) {
      pushLine(printStretch(stretch))
      stretchEndsWithComment = endsWithComment(stretch.end)
      continuesOpeningLine = true
      next = stretch.after
      offset = stretch.end
    }
  }
  while (next < statements.length) {
    const index = next
    const statement = statements[index]
    const end = rules.printedEnd(statement)
    const startsStretch =
      isKept(end - 1) ||
      (!rules.holdsStatements(statement) && isKept(statement.range[0]))
    if (
      !startsStretch &&
      bounds.isTopLevel &&
      rules.isDroppedAtTopLevel(statement)
    ) {
      next++
      continue
    }
    extra = rules.extraIndentationOf?.(statement) ?? ""
    // A kept line starts where its content starts, so that a `;` or a
    // directive before its first statement stays on it, unless the line of
    // the diagram starts later on the line of the source.
    const contentStart = findContentStart(source, statement.range[0])
    const contentEnd = rules.diagramLineEnd?.(contentStart)
    const start =
      (contentEnd === undefined || statement.range[0] <= contentEnd) &&
      startsStretch &&
      isKept(statement.range[0]) &&
      (rules.diagramLineEnd === undefined || contentStart >= offset)
        ? Math.max(offset, contentStart)
        : statement.range[0]
    const keptEnd = rules.keptGapEnd?.(offset, start, true)
    const triviaBreak = triviaBreakBefore(start)
    const writtenBreak =
      keptEnd === undefined
        ? triviaBreak === undefined
          ? {}
          : { writtenBreakBefore: triviaBreak }
        : { writtenBreakBefore: printAsWritten(source, offset, keptEnd) }
    const gap = readGap(
      source,
      keptEnd === undefined ? offset : start,
      start,
      false,
      false,
      rules.keepsInlineDirectivesWithPrevious,
      rules.dropsSeparatorsBeforeComments,
    )
    addItemLines(gap, statements[index - 1])
    if (!startsStretch) {
      const writtenIndentation = rules.writtenIndentationOf?.(statement)
      pushLine({
        doc: withLeading(gap.leading, docs[index]),
        ...writtenBreak,
        ...(writtenIndentation === undefined ? {} : { writtenIndentation }),
        blankBefore:
          rules.blankBeforeStatement?.(statement, gap) ??
          (hasBodyLines() && gap.blankAfter),
        endsWithWhitespace: endsWithSpaceOrTab(
          source.text.slice(statement.range[0], end),
        ),
      })
      next++
      offset = end
      continue
    }
    const stretch = findStretch(start, index, index + 1, end)
    const line = printStretch(stretch)
    const lineStart = lineStartOf(source, start)
    // A verbatim line that keeps its indentation keeps it when it starts the
    // stretch and nothing of it was printed before.
    const keepsIndentation =
      kept.writtenIndentation.has(lineStart) &&
      offset <= lineStart &&
      gap.leading === null
    pushLine({
      ...line,
      ...writtenBreak,
      doc: withLeading(gap.leading, line.doc),
      blankBefore:
        rules.blankBeforeStatement?.(statement, gap) ??
        (hasBodyLines() && gap.blankAfter),
      ...(keepsIndentation
        ? {
            writtenIndentation:
              rules.keptIndentationOf?.(statement) ??
              source.text.slice(lineStart, start),
          }
        : {}),
    })
    stretchEndsWithComment = endsWithComment(stretch.end)
    next = stretch.after
    offset = stretch.end
  }
  // The top-level block is the body of the diagram, which ends at the end of
  // the text.
  const lastStatement = statements.at(-1)
  extra =
    lastStatement === undefined
      ? ""
      : (rules.extraIndentationOf?.(lastStatement) ?? "")
  const keptEnd = rules.keptGapEnd?.(offset, bounds.end, !bounds.isTopLevel)
  const keepsEnd = keptEnd !== undefined
  const gap = readGap(
    source,
    keepsEnd ? bounds.end : offset,
    bounds.end,
    false,
    bounds.isTopLevel,
    false,
    rules.dropsSeparatorsBeforeComments,
  )
  addItemLines(gap, lastStatement)
  const closingJoin = findClosingJoin()
  const triviaEnd = triviaBreakBefore(bounds.end, bounds.isTopLevel)
  const endsInsideValue = rules.endsInsideValue?.() ?? false
  return {
    headerTrailing,
    endsInsideValue,
    ...(keepsEnd
      ? {
          writtenEnd: [
            printAsWritten(source, offset, keptEnd),
            !bounds.isTopLevel ||
            source.text.endsWith("\n") ||
            endsInsideOpenText(source) ||
            endsInsideValue
              ? ""
              : builders.literalline,
          ],
        }
      : triviaEnd === undefined
        ? {}
        : {
            writtenEnd: [
              triviaEnd,
              source.text.endsWith("\n") ||
              endsInsideOpenText(source) ||
              endsInsideValue
                ? ""
                : builders.literalline,
            ],
          }),
    continuesOpeningLine,
    lines,
    endLeading: gap.leading,
    endLeadingIndentation:
      rules.oneCharacterIndentation !== undefined &&
      gap.leadingPercentBraceGaps !== null
        ? percentBraceIndentation(
            gap.leadingPercentBraceGaps,
            rules.oneCharacterIndentation,
          )
        : keptIndentation(
            gap.leadingDirectivesOnly &&
              ((rules.keepsDirectiveLinesUnindented && endsAfterBareMarker) ||
                readsWhitespaceAfter(lastStatement)),
            endsAfterTakingComment && gap.leadingDirectivesOnly,
            gap.leadingIndentation,
          ),
    endBlank: gap.blankAfter,
    closingJoin,
    endExtraIndentation: extra,
  }
}

/**
 * The line that opens a block: what is printed for it, with the items
 * after it on its line. `endsWithWhitespace` says whether the printed text
 * ends with whitespace to keep when no item follows it.
 */
export function openingLine(
  doc: Doc,
  block: PrintedBlock,
  endsWithWhitespace: boolean,
): Line {
  return {
    doc: withTrailing(doc, block.headerTrailing),
    blankBefore: false,
    endsWithWhitespace:
      block.headerTrailing?.endsWithWhitespace ?? endsWithWhitespace,
  }
}

/**
 * Prints a diagram from its header line: its statements one level deeper,
 * or at the level of the header with `bodyDepth` 0 (a sankey diagram, whose
 * lines cannot be indented), and the end of the text. The statements run to
 * the end of the text, so comments and directives after the last one stand
 * at its level, and what stands on the last line is a line of its own.
 */
export function printDiagramBlock(
  source: Source,
  header: Line,
  block: PrintedBlock,
  options: ParserOptions<MermaidAst>,
  bodyDepth: 0 | 1 = 1,
): Doc {
  const indentation = indentationOf(options, bodyDepth)
  const lines =
    block.endLeading === null
      ? block.lines
      : [
          ...block.lines,
          {
            doc: block.endLeading.doc,
            blankBefore: block.lines.length > 0 && block.endBlank,
            endsWithWhitespace: block.endLeading.endsWithWhitespace,
            ...(block.endLeadingIndentation === undefined
              ? block.endExtraIndentation === ""
                ? {}
                : { extraIndentation: block.endExtraIndentation }
              : { writtenIndentation: block.endLeadingIndentation }),
          },
        ]
  const last = lines.at(-1) ?? header
  const endOfText =
    block.writtenEnd ??
    (endsInsideOpenText(source) || block.endsInsideValue
      ? ""
      : breakAfter(last, ""))
  if (lines.length === 0) return [header.doc, endOfText]
  const headerBreak = block.continuesOpeningLine
    ? ""
    : lineBreakBetween(header, lines[0], indentation)
  const body = [headerBreak, joinLines(lines, indentation)]
  return [header.doc, bodyDepth === 0 ? body : indent(body), endOfText]
}

/**
 * Prints a block that something closes, such as `end`: its opening line,
 * its statements one level deeper than the line, and `closing` on a line of
 * its own at the level of the opening line, after the items that stand
 * before it on its line. Empty lines before `closing` are dropped.
 */
export function printClosedBlock(
  header: Line,
  block: PrintedBlock,
  closing: Doc,
  depth: number,
  options: ParserOptions<MermaidAst>,
): Doc {
  const bodyIndentation = indentationOf(options, depth + 1)
  const last = block.lines.at(-1) ?? header
  const [first] = block.lines
  const body =
    first === undefined
      ? ""
      : indent([
          block.continuesOpeningLine
            ? ""
            : lineBreakBetween(header, first, bodyIndentation),
          joinLines(block.lines, bodyIndentation),
        ])
  return [
    header.doc,
    body,
    block.writtenEnd === undefined
      ? (block.closingJoin ?? breakAfter(last, indentationOf(options, depth)))
      : [block.writtenEnd, indentationOf(options, depth)],
    withLeading(block.endLeading, closing),
  ]
}

/** Where a gap within a kept line lies on the line. */
interface InlinePlace {
  /** Whether nothing is printed before the gap on its line. */
  readonly atLineStart: boolean
  /** Whether nothing is printed after the gap on its line. */
  readonly atLineEnd: boolean
}

/**
 * Prints a gap within a kept line: its `;` and directives, with one space
 * on each side where the source has whitespace, and nothing where it has
 * none, but no space at the start or the end of the line.
 */
function printInlineGap(
  source: Source,
  start: number,
  end: number,
  place: InlinePlace,
  keptEnd?: (start: number) => number,
): Doc {
  if (start >= end) return ""
  if (keptEnd !== undefined && end <= keptEnd(start))
    return printAsWritten(source, start, end)
  const gap = readGap(source, start, end, true)
  if (gap.breaksLine) {
    throw new Error(
      `prettier-plugin-mmd: a line break within a kept line at offset ${start}`,
    )
  }
  const run = gap.leading ?? gap.trailing
  if (run === null) {
    const spaced =
      !place.atLineStart &&
      !place.atLineEnd &&
      [...source.text.slice(start, end)].some(isWhitespace)
    return spaced ? " " : ""
  }
  return [
    run.spaceBefore && !place.atLineStart ? " " : "",
    run.doc,
    run.spaceAfter && !place.atLineEnd ? " " : "",
  ]
}

/**
 * Whether a verbatim line lies in the range. With `exceptClosers`, a line of
 * nothing but a `}` or an `end` does not count: it closes a block of the
 * range, which prints its own closing line as written.
 */
function holdsVerbatimLine(
  source: Source,
  kept: KeptLines,
  start: number,
  end: number,
  exceptClosers = false,
): boolean {
  let line = lineStartOf(source, start)
  while (line < end) {
    if (
      kept.verbatim.has(line) &&
      !(exceptClosers && isCloserLine(source, line))
    ) {
      return true
    }
    line = lineEndOf(source, line) + 1
  }
  return false
}

/** Whether the line that starts at `line` holds nothing but a `}` or an `end`. */
function isCloserLine(source: Source, line: number): boolean {
  const text = source.text.slice(line, lineEndOf(source, line)).trim()
  return text === "}" || toAsciiLowerCase(text) === "end"
}

/** The offset of the first character that is not whitespace on the line of `offset`. */
function findContentStart(source: Source, offset: number): number {
  let start = lineStartOf(source, offset)
  while (start < offset && isWhitespace(source.text[start])) start++
  return start
}

/** Adds items to the end of the last line. */
function appendTrailing(lines: Line[], run: ItemRun | null): void {
  if (run === null) return
  const last = lines.pop() as Line
  lines.push({
    ...last,
    doc: withTrailing(last.doc, run),
    endsWithWhitespace: run.endsWithWhitespace,
  })
}
