import type { Range } from "@mmd-toolkit/parser"
import type { Source } from "./source.ts"
import {
  findDirectiveEndingAt,
  findTokenStartingAt,
  findTokensBetween,
  findTriviaBetween,
  isWhitespace,
} from "./source.ts"

/**
 * The lines of a diagram whose statements are not split into lines of
 * their own (docs/flowchart.md, Statements one per line), by line start
 * offset. Each diagram printer finds its own.
 */
export interface KeptLines {
  /**
   * Lines whose statements stay together, with the `;` that separate them,
   * but are formatted otherwise (see `findLinesWithOwnSemicolons`).
   */
  readonly joined: ReadonlySet<number>
  /**
   * Lines printed as written, from their first statement to their end.
   */
  readonly verbatim: ReadonlySet<number>
  /** The verbatim lines that keep their written indentation. */
  readonly writtenIndentation: ReadonlySet<number>
}

/**
 * The lines that hold a `;` other than a `;` that separates statements or
 * is a statement of its own. Such a `;` is in a token, as in `A[x;]`,
 * `accTitle: a;b`, or a directive, or in a comment, or it is a `;` that the
 * line rule ignores (`ignoredSemicolons`), also one that stands after a
 * statement. In a flowchart, a sequence diagram, a quadrant chart, and an XY
 * chart a `;` token may separate statements (see
 * `semicolonsSeparateStatements`): then only the `;` tokens that the rule
 * ignores and that do not end their line count. In the other diagram types
 * no `;` separates statements (diagrams/class.md, Diagram and statements), so
 * every `;` token counts.
 *
 * The line rule (common.md, `style` and `classDef` lines) ignores the last
 * `;` of a line that matches it, and it reads the text of the line. Removing
 * a separating `;`, or moving a statement to a line of its own, can make
 * the rule ignore another `;`, or stop it from ignoring this one:
 * `A[style:#x;];` has the label `style:` with the entity `#x;`, and
 * `A[style:#x;]` the label `style:#x`. So every line that holds such a `;`
 * keeps its statements and its `;`, whether the rule matches it or not. The
 * rule matches only when no whitespace lies between a `:` and a later `#`, so
 * the whitespace between those two keeps whether it is there (see
 * `isInsideStyleRuleStretch`); elsewhere on the line, whitespace between
 * tokens may change as anywhere else.
 */
export function findLinesWithOwnSemicolons(
  source: Source,
): ReadonlySet<number> {
  const { root, text } = source
  const separatesStatements = semicolonsSeparateStatements(source)
  const lines = new Set<number>()

  /** Adds the lines of the `;` characters in a range. */
  function addSemicolonsIn(range: Range): void {
    for (let offset = range[0]; offset < range[1]; offset++) {
      if (text[offset] === ";") lines.add(lineStartOf(source, offset))
    }
  }

  for (const token of root.tokens) {
    if (token.value !== ";") {
      addSemicolonsIn(token.range)
    } else if (
      !separatesStatements ||
      (source.ignoredSemicolons.has(token.range[0]) &&
        !isLastOnItsLine(source, token.range[0]))
    ) {
      lines.add(lineStartOf(source, token.range[0]))
    }
  }
  for (const comment of root.comments) {
    addSemicolonsIn(comment.range)
  }
  for (const offset of source.ignoredSemicolons) {
    if (!isLastOnItsLine(source, offset)) lines.add(lineStartOf(source, offset))
  }
  return lines
}

/**
 * Whether a `;` token may separate statements in the diagram of the source:
 * in a flowchart, in a sequence diagram, in a quadrant chart, and in an XY
 * chart. The other diagram types have no such `;`, so every `;` in them is a
 * character of a token or a `;` that the line rule ignores.
 */
function semicolonsSeparateStatements(source: Source): boolean {
  const { type } = source.root.body
  return (
    type === "FlowchartDiagram" ||
    type === "SequenceDiagram" ||
    type === "QuadrantDiagram" ||
    type === "XychartDiagram"
  )
}

/**
 * The lines that a `;` keeps together, of each source. They are found once per
 * source and remembered because `spansLinesThatCannotJoin` asks for them for
 * every statement that lies on several lines, and each time the whole source
 * would otherwise be read again.
 */
const semicolonLinesBySource = new WeakMap<Source, ReadonlySet<number>>()

/**
 * The lines whose statements the formatter does not move to other lines:
 * the lines that hold a `;` (see `findLinesWithOwnSemicolons`) and the lines
 * that a `;` decides the end of (see `findLinesEndedBySemicolon`). The line
 * rule of mermaid.js reads the text of a line, so a statement that is joined
 * with the lines before or after it, or split from them, can make the rule
 * ignore another `;` or stop it from ignoring this one. The one decision
 * about whether a statement may be joined into one line takes these lines
 * into account (see `spansLinesThatCannotJoin`).
 */
export function findSemicolonLines(source: Source): ReadonlySet<number> {
  const cached = semicolonLinesBySource.get(source)
  if (cached !== undefined) return cached
  const lines = new Set([
    ...findLinesWithOwnSemicolons(source),
    ...findLinesEndedBySemicolon(source),
  ])
  semicolonLinesBySource.set(source, lines)
  return lines
}

/**
 * The lines that hold a `;` that the line rule ignores and, after it on the
 * line, a U+2028 or U+2029: the line is printed as written. The line rule of
 * mermaid.js (common.md, The `style` and `classDef` lines) reads the text up
 * to the character as the line, which ends with that `;`, so with the
 * character printed as a space the line would end elsewhere, and the `;`
 * that follows it would be read otherwise.
 */
function findLinesWithSeparatorAfterIgnoredSemicolon(
  source: Source,
): ReadonlySet<number> {
  const lines = new Set<number>()
  for (const offset of source.ignoredSemicolons) {
    const rest = source.text.slice(offset + 1, lineEndOf(source, offset))
    if (rest.includes("\u2028") || rest.includes("\u2029")) {
      lines.add(lineStartOf(source, offset))
    }
  }
  return lines
}

/**
 * The lines that a `;` decides the end of, in every diagram type: they are
 * printed as written, with the statements on them. The `;` that the line
 * rule ignores is removed from the text before mermaid.js reads it, but the
 * line ends where it ends the text of the line (common.md, The `style` and
 * `classDef` lines), and the scan of a directive takes the whitespace after
 * its argument, line breaks included, until a `;` stops it (common.md, Where
 * a directive is). Dropping a `;` changes where a line ends, or which `;` the
 * line rule ignores, on a line that holds
 *
 * - a `;` after a directive that is not closed, with only whitespace between
 *   them: without it, the directive takes the line break and the next line;
 * - a `;` that the line rule ignores, with only whitespace and directives
 *   between it and another `;`: without the last `;`, the one before it is the one that the
 *   rule ignores;
 * - a `;` that the line rule ignores and, after it, a U+2028 or U+2029: the
 *   rule reads the text up to the character as the line, so the `;` that ends
 *   it is another one when the character is printed as a space.
 *
 * Whether the rule applies to a line also depends on the statements on it, so
 * the line keeps them together.
 */
export function findLinesEndedBySemicolon(source: Source): ReadonlySet<number> {
  const lines = new Set(findLinesWithSeparatorAfterIgnoredSemicolon(source))
  for (const token of source.root.tokens) {
    if (token.value !== ";") continue
    const offset = token.range[0]
    if (
      isAfterUnclosedDirective(source, offset) ||
      (source.ignoredSemicolons.has(offset) &&
        isNextToSemicolon(source, offset))
    ) {
      lines.add(lineStartOf(source, offset))
    }
  }
  return lines
}

/**
 * Whether only whitespace lies between a directive that is not closed and
 * the `;` at `offset` on their line.
 */
function isAfterUnclosedDirective(source: Source, offset: number): boolean {
  let position = offset
  while (position > 0) {
    const directive = findDirectiveEndingAt(source, position)
    if (directive !== undefined) {
      return source.root.directives.some(
        (candidate) =>
          candidate.range[0] === directive.range[0] && !candidate.closed,
      )
    }
    const character = source.text[position - 1]
    if (character === "\n" || character === "\r" || !isWhitespace(character)) {
      return false
    }
    position--
  }
  return false
}

/**
 * Whether only whitespace and directives lie between the `;` at `offset` and
 * another `;` before it on its line. The directives are removed before the
 * line rule reads the text, so the two `;` are next to each other for it.
 */
function isNextToSemicolon(source: Source, offset: number): boolean {
  let position = offset
  while (position > 0) {
    const directive = findDirectiveEndingAt(source, position)
    if (directive !== undefined) {
      position = directive.range[0]
      continue
    }
    const character = source.text[position - 1]
    if (character === ";") return true
    if (character === "\n" || character === "\r" || !isWhitespace(character)) {
      return false
    }
    position--
  }
  return false
}

/**
 * Whether nothing but whitespace follows the `;` at `offset` on its line: no
 * token, comment, or directive starts after it before the line ends. A `;`
 * that the line rule ignores and that ends its line is at the end of a
 * statement: it is dropped as a `;` that separates statements is, since
 * mermaid.js removes it from the text (docs/flowchart.md, Semicolons).
 */
export function isLastOnItsLine(source: Source, offset: number): boolean {
  const lineEnd = lineEndOf(source, offset)
  return (
    findTokensBetween(source, offset + 1, lineEnd).length === 0 &&
    findTriviaBetween(source, offset + 1, lineEnd).length === 0
  )
}

/**
 * Whether the printer drops the `;` at `offset`: one that the line rule
 * ignores at the end of its line, which is dropped as a `;` that separates
 * statements is, since mermaid.js removes it from the text. Not one right
 * after a comment: with whitespace after it, the `;` lies inside the comment,
 * which is printed as written, and a `;` that was dropped only when it stands
 * outside the comment would make a second formatting differ from the first
 * (ast.md, Comment). Not one in a diagram type where no `;` separates
 * statements (see `semicolonsSeparateStatements`): there the line that holds
 * it is kept as written, with the `;`.
 */
export function isDroppedSemicolon(source: Source, offset: number): boolean {
  return (
    semicolonsSeparateStatements(source) &&
    source.ignoredSemicolons.has(offset) &&
    isLastOnItsLine(source, offset) &&
    !source.root.comments.some((comment) => comment.range[1] === offset)
  )
}

/**
 * The offset where the line that holds `offset` starts: after the last line
 * feed before it that no comment or directive spans, and that no comment
 * region that joins lines removes (`Source.removedLineFeeds`). A directive, an
 * unclosed one in a comment, and a diagram comment that a comment line cuts
 * (see `createSource`) may span lines, and the printers keep them whole, so
 * their line feeds do not end a line. A line is the text that mermaid.js
 * reads as one line, which may run over several lines of the source.
 */
export function lineStartOf(source: Source, offset: number): number {
  let lineFeed = source.text.lastIndexOf("\n", offset - 1)
  while (lineFeed !== -1 && isNotALineBreak(source, lineFeed)) {
    lineFeed = source.text.lastIndexOf("\n", lineFeed - 1)
  }
  return lineFeed + 1
}

/**
 * The offset of the line feed that ends the line holding `offset`, or the
 * end of the text: the first line feed from it that no comment or directive
 * spans and that no comment region that joins lines removes (see
 * `lineStartOf`).
 */
export function lineEndOf(source: Source, offset: number): number {
  let lineFeed = source.text.indexOf("\n", offset)
  while (lineFeed !== -1 && isNotALineBreak(source, lineFeed)) {
    lineFeed = source.text.indexOf("\n", lineFeed + 1)
  }
  return lineFeed === -1 ? source.text.length : lineFeed
}

/** Whether the line feed at `offset` ends no line: a comment or a directive spans it, or a region removes it. */
function isNotALineBreak(source: Source, offset: number): boolean {
  return (
    source.removedLineFeeds.has(offset) ||
    source.trivia.some(
      (item) => item.range[0] < offset && offset < item.range[1],
    )
  )
}

/**
 * Whether a comment line of a region that joins lines starts in the range
 * from `start` to `end`. mermaid.js reads the text before and after the
 * region as one line (`Source.joiningRegions`), so the range cannot be
 * printed with its parts on lines of their own, and is printed as written
 * (docs/compatibility.md, A comment line after U+2028 or U+2029).
 */
export function holdsJoiningRegion(
  source: Source,
  start: number,
  end: number,
): boolean {
  return source.joiningRegions.some(
    (region) =>
      start <= region.comment.range[0] && region.comment.range[0] < end,
  )
}

/**
 * The kept lines with the lines that hold a removed line feed added as
 * verbatim lines: a line that mermaid.js reads over several lines of the
 * source is printed as written, from its first line to its end.
 */
export function withJoinedLines(source: Source, kept: KeptLines): KeptLines {
  const joinedLines = [...source.removedLineFeeds].map((lineFeed) =>
    lineStartOf(source, lineFeed),
  )
  return {
    ...kept,
    verbatim: new Set([...kept.verbatim, ...joinedLines]),
  }
}

/**
 * Whether the whitespace between `start` and `end`, which lies between two
 * pieces of a line, may be what the line rule of mermaid.js reads (common.md,
 * The `style` and `classDef` lines): the line holds `style` or `classDef`,
 * later a `:`, later a `#`, and later a `;`, and the whitespace lies after
 * the first such `:` and before the last such `#`. The rule matches when only
 * characters that are not whitespace lie between a `:` and a `#`, so dropping
 * whitespace there, or writing some, decides whether the last `;` of the line
 * is ignored. Such a gap keeps whether it holds whitespace: it is printed as
 * one space where it holds some, and as nothing where the tokens touch.
 * Whitespace elsewhere in the line may change as anywhere else.
 */
export function isInsideStyleRuleStretch(
  source: Source,
  start: number,
  end: number,
): boolean {
  return findStyleRuleStretches(source).some(
    ([first, last]) => first < start && end <= last,
  )
}

/** The stretches of each source, found once per source. */
const styleRuleStretchesBySource = new WeakMap<
  Source,
  readonly (readonly [number, number])[]
>()

/**
 * The index in `line`, which starts at `start`, of its last `;` that the
 * printer keeps, or -1. The printer drops the `;` that the line rule ignores
 * at the end of the line (see `isDroppedSemicolon`), and the `;` tokens that
 * separate statements on a line that keeps no `;` of its own (see
 * `findSemicolonLines`); a `;` inside a token or a comment stays. The line
 * that it prints has the rule only through the `;` that stay, so a stretch is
 * decided by those, or a second formatting would find none.
 */
function findLastKeptSemicolon(
  source: Source,
  start: number,
  line: string,
): number {
  const keepsSeparators = findSemicolonLines(source).has(start)
  for (let index = line.lastIndexOf(";"); index !== -1;) {
    const offset = start + index
    const isToken = findTokenStartingAt(source, offset)?.value === ";"
    if (!isToken || (keepsSeparators && !isDroppedSemicolon(source, offset))) {
      return index
    }
    index = index === 0 ? -1 : line.lastIndexOf(";", index - 1)
  }
  return -1
}

/**
 * The stretch of each line that holds `style` or `classDef`, later a `:`,
 * later a `#`, and later a `;`: from the first `:` after the word to the last
 * `#` before the last `;`. Every pair of a `:` and a later `#` of the line lies
 * in it, so the whitespace that may decide the rule lies in it (see
 * `isInsideStyleRuleStretch`).
 */
function findStyleRuleStretches(
  source: Source,
): readonly (readonly [number, number])[] {
  const cached = styleRuleStretchesBySource.get(source)
  if (cached !== undefined) return cached
  const stretches: (readonly [number, number])[] = []
  let start = 0
  while (start <= source.text.length) {
    const end = lineEndOf(source, start)
    const line = source.text.slice(start, end)
    const words = [line.indexOf("style"), line.indexOf("classDef")].filter(
      (index) => index !== -1,
    )
    const colon = line.indexOf(":", Math.min(...words))
    const hash = line.lastIndexOf(
      "#",
      findLastKeptSemicolon(source, start, line),
    )
    if (words.length > 0 && colon !== -1 && colon < hash) {
      stretches.push([start + colon, start + hash])
    }
    start = end + 1
  }
  styleRuleStretchesBySource.set(source, stretches)
  return stretches
}

/**
 * Where the printed text of a statement that ends at `statementEnd` ends,
 * when a text that starts at `textStart` ends at `textEnd`: the end of the
 * text, but not past the line that it starts on. After an unclosed
 * directive, the range of the text reaches the lines after it, which the
 * printer prints as lines of their own, not as part of the statement.
 */
export function printedEndOf(
  source: Source,
  statementEnd: number,
  textStart: number,
  textEnd: number,
): number {
  return Math.max(statementEnd, Math.min(textEnd, lineEndOf(source, textStart)))
}
