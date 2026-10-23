import type { Doc, ParserOptions } from "prettier"
import { builders, utils } from "prettier/doc"
import type { StringLiteral } from "@mmd-toolkit/parser"
import type { MermaidAst } from "../parser.ts"
import type { ItemRun } from "./gap.ts"
import { walk } from "./layout.ts"
import type { Source } from "./source.ts"

const { align, hardline, literalline } = builders
const { mapDoc, replaceEndOfLine } = utils

/** One printed line. */
export interface Line {
  readonly doc: Doc
  /**
   * An exact source gap before this line, up to its indentation, overriding an
   * ordinary line break.
   */
  readonly writtenBreakBefore?: Doc
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
  /**
   * Whether the empty line before it holds one space, which a line of only
   * whitespace in the source stands for (see `BlockRules`). Such a line
   * comes before it also where `blankBefore` is false.
   */
  readonly spaceLineBefore?: boolean
  /**
   * Indentation added to the line after the one of its block, for a line of
   * a statement that stands deeper than the others of the flat body that it
   * belongs to (see `BlockRules.extraIndentationOf`). A line that keeps its
   * written indentation has none.
   */
  readonly extraIndentation?: string
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
  next: Pick<
    Line,
    | "writtenBreakBefore"
    | "blankBefore"
    | "writtenIndentation"
    | "spaceLineBefore"
    | "extraIndentation"
  >,
  indentation: string,
): Doc {
  const deeper = next.extraIndentation ?? ""
  if (next.writtenBreakBefore !== undefined) {
    return [
      next.writtenBreakBefore,
      next.writtenIndentation ?? indentation + deeper,
    ]
  }
  if (next.spaceLineBefore === true) {
    // Literal lines keep the end of the previous line and the space of the
    // line between, and start the next line at the first column.
    return [
      literalline,
      " ",
      literalline,
      next.writtenIndentation ?? indentation + deeper,
    ]
  }
  if (next.writtenIndentation !== undefined) {
    // A literal line starts at the first column, where the written
    // indentation follows; it keeps the end of the previous line too.
    const lineBreak = next.blankBefore
      ? [literalline, literalline]
      : literalline
    return [lineBreak, next.writtenIndentation]
  }
  if (!previous.endsWithWhitespace) {
    return next.blankBefore ? [hardline, hardline, deeper] : [hardline, deeper]
  }
  return next.blankBefore
    ? [literalline, hardline, deeper]
    : [literalline, indentation + deeper]
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
 * The step width for indentation that carries meaning: diagram node levels,
 * graph direction priority, class member syntax, and YAML block scalars or
 * nested values. One character is the smallest width that preserves the
 * reading and Db when tabWidth is zero
 * (docs/compatibility.md, Frontmatter; docs/mindmap.md, docs/kanban.md,
 * docs/venn.md, docs/ishikawa.md, docs/flowchart.md, docs/agentflow.md and
 * docs/class.md, Indentation).
 */
export function significantIndentationWidth(tabWidth: number): number {
  return Math.max(1, tabWidth)
}

/**
 * Adapts the shared block printer's indent commands once, at the diagram
 * boundary. Graph and class printers use the significant width for explicit
 * columns; Prettier still renders these commands with its original options,
 * so a zero-width body needs the same positive alignment (docs/flowchart.md,
 * docs/agentflow.md and docs/class.md, Indentation). Literal lines keep their
 * written columns.
 */
export function withSignificantIndentation(
  doc: Doc,
  options: ParserOptions<MermaidAst>,
): Doc {
  const width = significantIndentationWidth(options.tabWidth)
  if (options.tabWidth === width || options.useTabs) return doc
  return mapDoc(doc, (part) =>
    typeof part !== "string" && !Array.isArray(part) && part.type === "indent"
      ? align(width, part.contents)
      : part,
  )
}

/**
 * Indentation whose width mermaid.js reads as syntax or a node's level,
 * using the minimum step width of `significantIndentationWidth`.
 */
export function significantIndentationOf(
  options: ParserOptions<MermaidAst>,
  depth: number,
): string {
  return (
    options.useTabs
      ? "\t"
      : " ".repeat(significantIndentationWidth(options.tabWidth))
  ).repeat(depth)
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
 * Whether the text ends inside something that mermaid.js reads to the end of
 * the text, so that a line break added after it would become part of it: a
 * directive that is not closed (see `endsInsideOpenDirective`), or a string
 * that is not closed (see `findOpenString`). Diagram-specific EOF values
 * are supplied by `BlockRules.endsInsideValue`.
 */
export function endsInsideOpenText(source: Source): boolean {
  return endsInsideOpenDirective(source) || findOpenString(source) !== null
}

/**
 * The string that is not closed, or null: a StringLiteral whose `closed` is
 * false (ast.md, StringLiteral). A class backquoted name can be one;
 * usecase plain strings, including single-quoted metadata strings, must be
 * closed (diagrams/usecase.md, Ordered default-context rules). The class
 * name runs to the end of the text. Its range ends at its
 * last character that is not whitespace, while mermaid.js reads the name to
 * the end of the text, the whitespace and line breaks after that character
 * included (diagrams/class.md, Strings, backquoted names, and generic
 * types), so a printer prints that text as written, with no line break
 * after it.
 */
export function findOpenString(source: Source): StringLiteral | null {
  const open: StringLiteral[] = []
  walk(source.root.body, (node) => {
    if (node.type === "StringLiteral" && !node.closed) open.push(node)
  })
  return open.at(0) ?? null
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
