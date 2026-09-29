import type { Doc, ParserOptions } from "prettier"
import { builders, utils } from "prettier/doc"
import type { MermaidAst } from "../parser.ts"
import type { ItemRun } from "./gap.ts"
import type { Source } from "./source.ts"

const { hardline, literalline } = builders
const { replaceEndOfLine } = utils

/** One printed line. */
export interface Line {
  readonly doc: Doc
  /** Whether an empty line comes before it. */
  readonly blankBefore: boolean
  /**
   * Whether the line ends with spaces or tabs that must be kept, such as
   * the space of the comment `%% `.
   */
  readonly endsWithWhitespace: boolean
  /**
   * The indentation that the line keeps as written, or undefined when it is
   * indented as its block (see `findDirectionTextLines`).
   */
  readonly writtenIndentation?: string
}

/**
 * Joins lines with line breaks, with one empty line where a line has
 * `blankBefore`. See `lineBreakBetween`.
 */
export function joinLines(lines: readonly Line[], indentation: string): Doc {
  return lines.map((line, index) =>
    index === 0
      ? line.doc
      : [lineBreakBetween(lines[index - 1], line, indentation), line.doc],
  )
}

/**
 * The line break between two lines, with one empty line when the next line
 * has `blankBefore`.
 *
 * Prettier removes spaces and tabs at the end of a line when it breaks the
 * line with `hardline`. After a line that ends with whitespace to keep, the
 * break is a `literalline`, which keeps them but starts the next line at the
 * indentation of the root; `indentation` then gives the next line the
 * indentation it should have. A line that keeps its written indentation
 * always follows a literal line.
 */
export function lineBreakBetween(
  previous: Line,
  next: Pick<Line, "blankBefore" | "writtenIndentation">,
  indentation: string,
): Doc {
  if (next.writtenIndentation !== undefined) {
    // A literal line starts at the first column, where the written
    // indentation follows; it keeps the end of the previous line too.
    const lineBreak = next.blankBefore
      ? [literalline, literalline]
      : literalline
    return [lineBreak, next.writtenIndentation]
  }
  if (!previous.endsWithWhitespace) {
    return next.blankBefore ? [hardline, hardline] : hardline
  }
  return next.blankBefore ? [literalline, hardline] : [literalline, indentation]
}

/**
 * Breaks the line after `last` and starts the next line at `indentation`,
 * keeping whitespace at the end of `last`.
 */
export function breakAfter(last: Line, indentation: string): Doc {
  return lineBreakBetween(last, { blankBefore: false }, indentation)
}

/**
 * The indentation of `depth` levels, as Prettier's `indent` writes it.
 */
export function indentationOf(
  options: ParserOptions<MermaidAst>,
  depth: number,
): string {
  return (options.useTabs ? "\t" : " ".repeat(options.tabWidth)).repeat(depth)
}

/**
 * Prints the source between two offsets as written. Its inner lines keep
 * their source columns.
 */
export function printAsWritten(
  source: Source,
  start: number,
  end: number,
): Doc {
  return replaceEndOfLine(source.text.slice(start, end))
}

/** Prints items that stand after `doc` on its line. */
export function withTrailing(doc: Doc, run: ItemRun | null): Doc {
  if (run === null) return doc
  return [doc, run.spaceBefore ? " " : "", run.doc]
}

/** Prints items that stand before `doc` on its line. */
export function withLeading(run: ItemRun | null, doc: Doc): Doc {
  if (run === null) return doc
  return [run.doc, run.spaceAfter ? " " : "", doc]
}

/**
 * Whether the text ends inside a directive that is not closed: its range,
 * which leaves out the whitespace at its end (ast.md, Comments, directives,
 * and frontmatter), ends at the end of the text. mermaid.js reads such a
 * directive to the end of the text, so a line break added after it would
 * become part of it. Whether a directive is closed is in its record in
 * `Root.directives`, not in its token.
 */
export function endsInsideOpenDirective(source: Source): boolean {
  const last = source.root.directives.at(-1)
  return (
    last !== undefined && !last.closed && last.range[1] === source.text.length
  )
}
