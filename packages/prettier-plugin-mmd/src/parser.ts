import type { Parser, ParserOptions } from "prettier"
import type {
  Node,
  ParseError,
  Position,
  Range,
  Root,
} from "@mmd-toolkit/parser"
import { parse } from "@mmd-toolkit/parser"
import type { DiagramPrinter, DiagramTextRules } from "./printers/index.ts"
import { diagramPrinters, diagramTextRules } from "./printers/index.ts"
import type { Source } from "./printers/source.ts"
import { createSource } from "./printers/source.ts"

/**
 * A document whose diagram type has a printer. Prettier walks from this node
 * into `root`, the tree the parser returned.
 *
 * This departs from Prettier's usual shape, where the parser's tree is the
 * top node, for two reasons:
 *
 * - The wrapper carries what is decided once while parsing: the printer of
 *   the diagram type, and the printing context (`source`).
 * - It keeps `Root.comments` away from Prettier's own comment handling.
 *   Prettier reads a `comments` array on the top node, attaches each comment
 *   to a node, and throws for every comment that no printer printed that
 *   way. The diagram printers do not use that mechanism: they print
 *   comments and directives from the source between the things they print,
 *   because a directive can lie inside a name or touch a token without
 *   whitespace, and a comment can lie inside a statement written over
 *   several lines, where attaching them to nodes would move them.
 */
export interface FormattedDocument {
  readonly type: "FormattedDocument"
  readonly range: Range
  readonly root: Root
  /** The printer of the diagram type, chosen once while parsing. */
  readonly printDiagram: DiagramPrinter
  /** The source text with the tree, for the printers. */
  readonly source: Source
  /** Constraints selected with the diagram printer, when it needs them. */
  readonly textRules: DiagramTextRules | undefined
}

/**
 * A document printed as written: the parser does not support its diagram
 * type yet, or the diagram type has no printer yet.
 */
export interface VerbatimDocument {
  readonly type: "VerbatimDocument"
  readonly range: Range
}

/** The node Prettier receives from the parser. */
export type MermaidDocument = FormattedDocument | VerbatimDocument

/** Every node Prettier walks through. */
export type MermaidAst = MermaidDocument | Node

/**
 * Thrown when a document embedded in another language (a code block in
 * Markdown) would be printed as written.
 *
 * An embedded document cannot be printed as written: Prettier strips trailing
 * line breaks from the result of every embed. Throwing is the only way to
 * decline an embed; Prettier then prints the code block as it does without
 * this plugin. Parse errors reach the same outcome the same way. As with
 * parse errors, Prettier rethrows it when `PRETTIER_DEBUG` is set.
 */
export class NotFormattedError extends Error {
  public override name = "NotFormattedError"
}

/**
 * Parses Mermaid text and decides, once, whether the document is formatted
 * or printed as written.
 *
 * A `ParseError` is rethrown with its position in the shape Prettier uses
 * for its code frame. Any other error, such as a bug in the parser, is
 * rethrown unchanged.
 */
export function parseDocument(text: string): MermaidDocument {
  const range: Range = [0, text.length]
  let root: Root
  try {
    root = parse(text)
  } catch (error) {
    if (isUnsupportedDiagramError(error)) {
      return { type: "VerbatimDocument", range }
    }
    if (isParseError(error)) throw toPrettierError(error, text)
    throw error
  }
  const printDiagram = findDiagramPrinter(root.body.type)
  if (!printDiagram) return { type: "VerbatimDocument", range }
  const textRules = diagramTextRules[root.body.type]
  return {
    type: "FormattedDocument",
    range,
    root,
    printDiagram,
    source: createSource(text, root, textRules?.keepsCommentLines),
    textRules,
  }
}

/**
 * Parses for Prettier, and declines an embedded document that would be
 * printed as written. See {@link NotFormattedError}.
 */
function parseForHost(
  text: string,
  options: ParserOptions<MermaidAst>,
): MermaidDocument {
  const document = parseDocument(text)
  if (
    document.type === "VerbatimDocument" &&
    options.parentParser !== undefined
  ) {
    throw new NotFormattedError(
      "prettier-plugin-mmd: this diagram type is not formatted yet",
    )
  }
  return document
}

/**
 * Returns the printer registered for a diagram body type. Only the table's
 * own entries count, so a body type such as `toString` finds nothing.
 */
function findDiagramPrinter(bodyType: string): DiagramPrinter | undefined {
  if (!Object.hasOwn(diagramPrinters, bodyType)) return undefined
  return diagramPrinters[bodyType]
}

/**
 * Checks by name rather than with `instanceof`, so that the check also holds
 * when two copies of the parser are installed.
 */
function isUnsupportedDiagramError(error: unknown): boolean {
  return error instanceof Error && error.name === "UnsupportedDiagramError"
}

/**
 * Checks by name, for the same reason as {@link isUnsupportedDiagramError}.
 */
function isParseError(error: unknown): error is ParseError {
  return error instanceof Error && error.name === "ParseError"
}

/**
 * Converts a `ParseError` to the error Prettier reports with a code frame.
 *
 * Prettier counts lines as its code frame does: a line ends at a line feed,
 * a carriage return, U+2028, and U+2029, and a column is 1-based. The
 * parser counts the lines that Mermaid has, which end at the first three
 * only, so the position is made again from the offsets of the error. An
 * error that ends at the start of a line has no end: the code frame fails
 * on a line that is empty or does not exist. The original error is kept as
 * the `cause`.
 */
function toPrettierError(error: ParseError, text: string): SyntaxError {
  const converted = new SyntaxError(error.message, { cause: error })
  const start = findPosition(text, error.range[0])
  const end = findPosition(text, error.range[1])
  const endsAtLineStart = end.column === 1 && end.line > start.line
  return Object.assign(converted, {
    loc: endsAtLineStart ? { start } : { start, end },
  })
}

/**
 * The 1-based line and column of an offset, with the line ends of Prettier's
 * code frame: `\r\n`, `\n`, `\r`, U+2028, and U+2029.
 */
function findPosition(text: string, offset: number): Position {
  let line = 1
  let lineStart = 0
  for (let index = 0; index < offset; index++) {
    const character = text[index]
    if (character === "\r" && text[index + 1] === "\n") continue
    if (
      character === "\n" ||
      character === "\r" ||
      character === "\u2028" ||
      character === "\u2029"
    ) {
      line++
      lineStart = index + 1
    }
  }
  return { line, column: offset - lineStart + 1 }
}

export const mermaidParser: Parser<MermaidAst> = {
  parse: parseForHost,
  astFormat: "mermaid",
  locStart: (node) => node.range[0],
  locEnd: (node) => node.range[1],
}
