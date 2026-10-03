import type { Range } from "@mmd-toolkit/parser"
import type { Source } from "./source.ts"
import { findTokensBetween, findTriviaBetween } from "./source.ts"

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
 * statement. `separatesStatements` says whether a `;` token may separate
 * statements, as in a flowchart and a sequence diagram: then only the `;`
 * tokens that the rule ignores and that do not end their line count. In a class diagram and a state
 * diagram no `;` separates statements (diagrams/class.md, Diagram and
 * statements), so every `;` token counts.
 *
 * The line rule (common.md, `style` and `classDef` lines) ignores the last
 * `;` of a line that matches it, and it reads the text of the line. Removing
 * a separating `;`, or moving a statement to a line of its own, can make
 * the rule ignore another `;`, or stop it from ignoring this one:
 * `A[style:#x;];` has the label `style:` with the entity `#x;`, and
 * `A[style:#x;]` the label `style:#x`. So every line that holds such a `;`
 * keeps its statements and its `;`, whether the rule matches it or not. The
 * rule reads only `style`, a `:` before a `#`, and `;`, so whitespace
 * between tokens may change as anywhere else.
 */
export function findLinesWithOwnSemicolons(
  source: Source,
  separatesStatements: boolean,
): ReadonlySet<number> {
  const { root, text } = source
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
 * The offset where the line that holds `offset` starts: after the last line
 * feed before it that no comment or directive spans. A directive, an unclosed
 * one in a comment, and a diagram comment that a comment line cuts (see
 * `createSource`) may span lines, and the printers keep them whole, so their
 * line feeds do not end a line.
 */
export function lineStartOf(source: Source, offset: number): number {
  let lineFeed = source.text.lastIndexOf("\n", offset - 1)
  while (lineFeed !== -1 && isSpannedByTrivia(source, lineFeed)) {
    lineFeed = source.text.lastIndexOf("\n", lineFeed - 1)
  }
  return lineFeed + 1
}

/**
 * The offset of the line feed that ends the line holding `offset`, or the
 * end of the text: the first line feed from it that no comment or directive
 * spans.
 */
export function lineEndOf(source: Source, offset: number): number {
  let lineFeed = source.text.indexOf("\n", offset)
  while (lineFeed !== -1 && isSpannedByTrivia(source, lineFeed)) {
    lineFeed = source.text.indexOf("\n", lineFeed + 1)
  }
  return lineFeed === -1 ? source.text.length : lineFeed
}

/** Whether a comment or a directive spans an offset. */
function isSpannedByTrivia(source: Source, offset: number): boolean {
  return source.trivia.some(
    (item) => item.range[0] < offset && offset < item.range[1],
  )
}
