import type { Doc, ParserOptions } from "prettier"
import { builders } from "prettier/doc"
import type { Node } from "@mmd-toolkit/parser"
import type { MermaidAst } from "../parser.ts"
import type { Gap, ItemRun } from "./gap.ts"
import { endsWithSpaceOrTab, readGap } from "./gap.ts"
import type { KeptLines } from "./kept-lines.ts"
import { lineEndOf, lineStartOf } from "./kept-lines.ts"
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
import { isWhitespace } from "./source.ts"

const { indent } = builders

/**
 * What a diagram printer tells the printing of its blocks about its
 * statements. Everything else about a block is the same for every diagram
 * type: each statement on a line of its own, the comments and directives
 * between them, the `;` that separate them, and the empty lines. `Statement`
 * is the statement type of the diagram type.
 */
export interface BlockRules<Statement extends Node> {
  /** The lines whose statements stay together (see `KeptLines`). */
  readonly kept: KeptLines
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
}

/** Where a block of statements lies in the source, and which block it is. */
export interface BlockBounds<Statement extends Node> {
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
  /**
   * Whether the first line continues the line that opens the block (see
   * `KeptLines`).
   */
  readonly continuesOpeningLine: boolean
  readonly lines: readonly Line[]
  /** Items on the line that closes the block, before what closes it. */
  readonly endLeading: ItemRun | null
  /** Whether the source has an empty line before `endLeading`. */
  readonly endBlank: boolean
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
export function printBlock<Statement extends Node>(
  docs: readonly Doc[],
  source: Source,
  bounds: BlockBounds<Statement>,
  rules: BlockRules<Statement>,
): PrintedBlock {
  const { statements } = bounds
  const { kept } = rules
  const lines: Line[] = []
  let headerTrailing: ItemRun | null = null
  let offset = bounds.start
  let next = 0
  let continuesOpeningLine = false
  let spaceLinePending = false
  let stretchEndsWithComment = false

  /**
   * Adds a line, after a line of one space when the gap before it asks for
   * one (see `BlockRules.keepsWhitespaceLineAfterComment`).
   */
  function pushLine(line: Line): void {
    lines.push(spaceLinePending ? { ...line, spaceLineBefore: true } : line)
    spaceLinePending = false
  }

  /**
   * Adds the items of a gap: those on the line before it to that line, and
   * those on lines of their own as lines.
   */
  function addItemLines(gap: Gap): void {
    if (lines.length === 0) headerTrailing = gap.trailing
    else appendTrailing(lines, gap.trailing)
    const keepsWhitespaceLines =
      rules.keepsWhitespaceLineAfterComment &&
      (gap.trailingEndsWithComment || stretchEndsWithComment)
    stretchEndsWithComment = false
    for (const line of gap.lines) {
      pushLine({
        doc: line.run.doc,
        blankBefore: lines.length > 0 && line.blankBefore,
        endsWithWhitespace: line.run.endsWithWhitespace,
        spaceLineBefore: keepsWhitespaceLines && line.whitespaceLineBefore,
      })
    }
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
      const lineEnd = Math.min(lineEndOf(source, stretchEnd), bounds.end)
      if (after >= statements.length || statements[after].range[0] >= lineEnd) {
        return { start, end: Math.max(stretchEnd, lineEnd), first, after }
      }
      while (
        after < statements.length &&
        statements[after].range[0] < lineEnd
      ) {
        stretchEnd = Math.max(stretchEnd, rules.printedEnd(statements[after]))
        after++
      }
    }
    return { start, end: stretchEnd, first, after }
  }

  /**
   * Prints a stretch: as written when one of its lines is verbatim or it
   * holds a statement that holds statements, and otherwise its statements
   * as formatted, with what lies between them (see `printInlineGap`).
   */
  function printStretch(stretch: Stretch): Line {
    const covered = statements.slice(stretch.first, stretch.after)
    if (
      covered.some(rules.holdsStatements) ||
      holdsVerbatimLine(source, kept, stretch.start, stretch.end)
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
        printInlineGap(source, position, statement.range[0], {
          atLineStart:
            position === stretch.start && stretch.start !== bounds.start,
          atLineEnd: false,
        }),
        docs[stretch.first + index],
      )
      position = rules.printedEnd(statement)
    }
    const last = covered.at(-1)
    const trailing = printInlineGap(source, position, stretch.end, {
      atLineStart: false,
      atLineEnd: true,
    })
    return {
      doc: [...parts, trailing],
      blankBefore: false,
      endsWithWhitespace:
        position === stretch.end && last !== undefined
          ? endsWithSpaceOrTab(source.text.slice(last.range[0], position))
          : false,
    }
  }

  if (isKept(bounds.start - 1)) {
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
    // A kept line starts where its content starts, so that a `;` or a
    // directive before its first statement stays on it.
    const start =
      startsStretch && isKept(statement.range[0])
        ? Math.max(offset, findContentStart(source, statement.range[0]))
        : statement.range[0]
    const gap = readGap(source, offset, start, false)
    addItemLines(gap)
    if (!startsStretch) {
      pushLine({
        doc: withLeading(gap.leading, docs[index]),
        blankBefore: lines.length > 0 && gap.blankAfter,
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
      doc: withLeading(gap.leading, line.doc),
      blankBefore: lines.length > 0 && gap.blankAfter,
      ...(keepsIndentation
        ? { writtenIndentation: source.text.slice(lineStart, start) }
        : {}),
    })
    stretchEndsWithComment = endsWithComment(stretch.end)
    next = stretch.after
    offset = stretch.end
  }
  const gap = readGap(source, offset, bounds.end, false)
  addItemLines(gap)
  return {
    headerTrailing,
    continuesOpeningLine,
    lines,
    endLeading: gap.leading,
    endBlank: gap.blankAfter,
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
 * and the end of the text. The statements run to the end of the text, so
 * comments and directives after the last one stand at its level, and what
 * stands on the last line is a line of its own.
 */
export function printDiagramBlock(
  source: Source,
  header: Line,
  block: PrintedBlock,
  options: ParserOptions<MermaidAst>,
): Doc {
  const indentation = indentationOf(options, 1)
  const lines =
    block.endLeading === null
      ? block.lines
      : [
          ...block.lines,
          {
            doc: block.endLeading.doc,
            blankBefore: block.lines.length > 0 && block.endBlank,
            endsWithWhitespace: block.endLeading.endsWithWhitespace,
          },
        ]
  const last = lines.at(-1) ?? header
  const endOfText = endsInsideOpenText(source) ? "" : breakAfter(last, "")
  if (lines.length === 0) return [header.doc, endOfText]
  const headerBreak = block.continuesOpeningLine
    ? ""
    : lineBreakBetween(header, lines[0], indentation)
  return [
    header.doc,
    indent([headerBreak, joinLines(lines, indentation)]),
    endOfText,
  ]
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
    breakAfter(last, indentationOf(options, depth)),
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
): Doc {
  if (start >= end) return ""
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

/** Whether a verbatim line lies in the range. */
function holdsVerbatimLine(
  source: Source,
  kept: KeptLines,
  start: number,
  end: number,
): boolean {
  let line = lineStartOf(source, start)
  while (line < end) {
    if (kept.verbatim.has(line)) return true
    line = lineEndOf(source, line) + 1
  }
  return false
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
