import type { AstPath, Doc, ParserOptions } from "prettier"
import type { MermaidAst } from "../parser.ts"
import { printAsWritten } from "./lines.ts"
import type { Source } from "./source.ts"

/**
 * Prints the `error` pseudo-diagram as written, from the start of its body to
 * the end of the text. Its body is raw text and mermaid.js reads nothing from
 * it, so there is nothing to format (docs/compatibility.md, The error
 * pseudo-diagram). The text before the body is printed as written too (see
 * `diagramTextRules.ErrorDiagram`), so the whole text is kept.
 */
export function printError(
  path: AstPath<MermaidAst>,
  _options: ParserOptions<MermaidAst>,
  _print: (path: AstPath<MermaidAst>) => Doc,
  source: Source,
): Doc {
  return printAsWritten(source, path.node.range[0], source.text.length)
}
