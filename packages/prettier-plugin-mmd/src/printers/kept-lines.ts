import type { Range } from "@mmd-toolkit/parser"
import type { Source } from "./source.ts"

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
 * `accTitle: a;b`, or a directive, or in a comment, or it is a `;` within
 * one of `statementRanges`, the ranges of the statements that hold no
 * other statement, which the line rule ignores.
 *
 * The line rule (common.md, `style` and `classDef` lines) ignores the last
 * `;` of a line that matches it, and it reads the text of the line. Removing
 * a separating `;`, or moving a statement to a line of its own, can make
 * the rule ignore another `;`: `A[style:#x;];` has the label `style:` with
 * the entity `#x;`, and `A[style:#x;]` the label `style:#x`. Which `;` the
 * rule ignores is not in the tree, so every line that holds such a `;`
 * keeps its statements and its `;`, whether the rule matches it or not. The
 * rule reads only `style`, a `:` before a `#`, and `;`, so whitespace
 * between tokens may change as anywhere else.
 */
export function findLinesWithOwnSemicolons(
  source: Source,
  statementRanges: readonly Range[],
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
      statementRanges.some(
        ([start, end]) => start < token.range[0] && token.range[1] <= end,
      )
    ) {
      lines.add(lineStartOf(source, token.range[0]))
    }
  }
  for (const comment of root.comments) {
    addSemicolonsIn(comment.range)
  }
  return lines
}

/**
 * The offset where the line that holds `offset` starts: after the last line
 * feed before it that no directive spans. A directive may span lines, and
 * the printers keep it whole, so its line feeds do not end a line.
 */
export function lineStartOf(source: Source, offset: number): number {
  let lineFeed = source.text.lastIndexOf("\n", offset - 1)
  while (lineFeed !== -1 && isSpannedByDirective(source, lineFeed)) {
    lineFeed = source.text.lastIndexOf("\n", lineFeed - 1)
  }
  return lineFeed + 1
}

/**
 * The offset of the line feed that ends the line holding `offset`, or the
 * end of the text: the first line feed from it that no directive spans.
 */
export function lineEndOf(source: Source, offset: number): number {
  let lineFeed = source.text.indexOf("\n", offset)
  while (lineFeed !== -1 && isSpannedByDirective(source, lineFeed)) {
    lineFeed = source.text.indexOf("\n", lineFeed + 1)
  }
  return lineFeed === -1 ? source.text.length : lineFeed
}

/** Whether a directive spans an offset. */
function isSpannedByDirective(source: Source, offset: number): boolean {
  return source.trivia.some(
    (item) =>
      item.type === "Directive" &&
      item.range[0] < offset &&
      offset < item.range[1],
  )
}
