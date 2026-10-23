import type { Doc, ParserOptions } from "prettier"
import { printer } from "prettier/doc"
import type { MermaidAst } from "../parser.ts"
import { printAsWritten } from "./lines.ts"
import type { RootTextPlan } from "./root.ts"
import type { Source } from "./source.ts"

const DEFAULT_MAX_TEXT_SIZE = 50000

/**
 * Choose the complete root layout in one place. The written and planned body
 * must both stay strictly below the default UTF-16 boundary; otherwise keep
 * the diagram and its ending. The host may restore a removed BOM. This uses
 * recorded directive spans and the Doc, never an output parse
 * (diagrams/agentflow.md, Preserved comments and the default size limit;
 * docs/agentflow.md, Default size branches).
 */
export function agentflowTextPlan(
  source: Source,
  options: ParserOptions<MermaidAst>,
): RootTextPlan {
  const directives = source.root.directives.map((directive) =>
    source.text.slice(...directive.range),
  )
  const writtenSize = diagramTextSize(
    source.text,
    source.root.frontmatter?.range[1] ?? 0,
    directives,
  )

  /** Render with the same resolved widths used by ordinary layout. */
  function render(doc: Doc): string {
    return printer.printDocToString(doc, {
      printWidth: options.printWidth,
      tabWidth: options.tabWidth,
      useTabs: options.useTabs,
    }).formatted
  }

  return (print, frontmatterEnd, frontmatterDoc) => {
    // A retained-size source needs no ordinary statement layout. This only
    // defers that work; the complete-layout choice below is the size decision.
    const doc = writtenSize < DEFAULT_MAX_TEXT_SIZE ? print() : undefined
    const plannedSize =
      doc === undefined
        ? writtenSize
        : diagramTextSize(
            render(doc),
            frontmatterDoc === undefined ? 0 : render(frontmatterDoc).length,
            directives,
          )
    if (
      doc !== undefined &&
      Math.max(writtenSize, plannedSize) < DEFAULT_MAX_TEXT_SIZE
    )
      return doc
    return [
      frontmatterDoc ?? "",
      printAsWritten(source, frontmatterEnd, source.text.length),
    ]
  }
}

/** Size after the same frontmatter, directive and CR/LF removal in either text. */
function diagramTextSize(
  text: string,
  frontmatterEnd: number,
  directives: readonly string[],
): number {
  let start = frontmatterEnd
  if (start !== 0) {
    const lf = text.indexOf("\n", start)
    start = lf === -1 ? text.length : lf + 1
    for (;;) {
      const end = text.indexOf("\n", start)
      if (end === -1 || text.slice(start, end).trim() !== "") break
      start = end + 1
    }
  }
  return (
    normalizedLength(text.slice(start)) -
    directives.reduce(
      (size, directive) => size + normalizedLength(directive),
      0,
    )
  )
}

/** Mermaid counts a normalized CRLF or CR as one UTF-16 unit. */
function normalizedLength(text: string): number {
  return text.split("\r\n").join("\n").split("\r").join("\n").length
}
