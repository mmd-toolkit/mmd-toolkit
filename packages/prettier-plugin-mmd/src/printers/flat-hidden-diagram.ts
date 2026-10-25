import type { AstPath, Doc, ParserOptions } from "prettier"
import type { Node } from "@mmd-toolkit/parser"
import type { MermaidAst } from "../parser.ts"
import type { AtomLayout } from "./atoms.ts"
import { printAtoms } from "./atoms.ts"
import { openingLine, printBlock, printDiagramBlock } from "./blocks.ts"
import { findHiddenKeptLines, hiddenBlockRules } from "./hidden-forms.ts"
import type { DiagramPrinter } from "./index.ts"
import { lineStartOf } from "./kept-lines.ts"
import { findLayoutEnd } from "./layout.ts"
import { indentationOf, printAsWritten } from "./lines.ts"
import type { Source } from "./source.ts"

/** One flat body's source layouts and the kind of its retained hidden forms. */
interface FlatHiddenLayouts<Diagram extends Node, Statement extends Node> {
  readonly type: Diagram["type"]
  readonly ignoredType: Statement["type"]
  /**
   * The first atom starts at the header keyword. The printer uses its start
   * as the end of the retained prefix.
   */
  readonly header: (source: Source, diagram: Diagram) => AtomLayout
  readonly statement: (source: Source, statement: Statement) => AtomLayout
  /** Trailing forms can belong to the last member of a grouped statement. */
  readonly suffixes?: (statement: Statement) => readonly Node[]
}

/** The printer and the root-prefix constraint selected with it. */
export interface FlatHiddenPrinter {
  readonly print: DiagramPrinter
  readonly keepsPrefix: (source: Source) => boolean
}

/**
 * Prints a flat body whose hidden forms retain source-owned boundaries, and
 * keeps its detection-skipped prefix from becoming effective frontmatter
 * (docs/pie.md and docs/gitgraph.md, Hidden yaml and Frontmatter yaml).
 */
export function createFlatHiddenDiagramPrinter<
  Diagram extends Node & {
    readonly body: readonly Statement[]
    readonly textBeforeHeader: readonly Node[]
  },
  Statement extends Node & { readonly textAfter?: readonly Node[] },
>(layouts: FlatHiddenLayouts<Diagram, Statement>): FlatHiddenPrinter {
  /** The body type selects this diagram's layouts and prefix rule together. */
  function isDiagram(node: MermaidAst): node is Diagram {
    return node.type === layouts.type
  }

  /** Root cleanup must not promote detection-skipped YAML into frontmatter. */
  function keepsPrefix(source: Source): boolean {
    const diagram = source.root.body
    return isDiagram(diagram) && diagram.textBeforeHeader.length > 0
  }

  /** Applies the selected header and statement layouts through shared blocks. */
  function print(
    path: AstPath<MermaidAst>,
    options: ParserOptions<MermaidAst>,
    _print: (path: AstPath<MermaidAst>) => Doc,
    source: Source,
  ): Doc {
    const diagram = path.node
    if (!isDiagram(diagram))
      throw new Error(
        `prettier-plugin-mmd: ${diagram.type} is no ${layouts.type}`,
      )
    const headerLayout = layouts.header(source, diagram)
    const first = headerLayout.atoms[0]
    if (first === undefined)
      throw new Error("prettier-plugin-mmd: a diagram header has no atoms")
    const indentation = {
      statement: indentationOf(options, 1),
      continuation: indentationOf(options, 2),
    }
    const hidden: Node[] = diagram.body.filter(
      (item) => item.type === layouts.ignoredType,
    )
    // Only leading forms attached to the header belong to its edge. A
    // statement's textAfter remains a body boundary even when a kept segment
    // leaves that statement on the header's line (docs/packet.md, Blank lines).
    const headerHiddenEnds = new Set<number>()
    let headerEnd = findLayoutEnd(headerLayout)
    for (const item of diagram.body) {
      if (
        item.type !== layouts.ignoredType ||
        lineStartOf(source, item.range[0]) !== lineStartOf(source, headerEnd)
      )
        break
      headerHiddenEnds.add(item.range[1])
      headerEnd = item.range[1]
    }
    const statements = new Map<Node, AtomLayout>()
    for (const item of diagram.body) {
      const layout = layouts.statement(source, item)
      const suffixes = layouts.suffixes?.(item) ?? item.textAfter ?? []
      hidden.push(...suffixes)
      // A protected segment can span a suffix boundary. Keep that layout
      // whole rather than cutting an indivisible atom.
      const firstSuffix = suffixes.at(0)
      if (
        firstSuffix === undefined ||
        suffixes.some(
          (suffix) =>
            !layout.atoms.some(
              (atom) =>
                atom.start === suffix.range[0] && atom.end === suffix.range[1],
            ),
        )
      ) {
        statements.set(item, layout)
        continue
      }
      statements.set(item, {
        ...layout,
        atoms: layout.atoms.filter((atom) => atom.end <= firstSuffix.range[0]),
      })
      // Suffix forms are real nodes too. Give their exterior trivia to the
      // shared block printer, including between suffixes of the same statement
      // (diagrams/packet.md, Grammar; docs/packet.md, Blank lines and Comments).
      for (const suffix of suffixes) {
        statements.set(suffix, {
          atoms: [{ start: suffix.range[0], end: suffix.range[1] }],
          rules: new Map(),
          outdented: new Set(),
          lineBreaks: "kept",
        })
      }
    }
    const hiddenEnds = new Set(hidden.map((item) => item.range[1]))
    const block = printBlock(
      [...statements.values()].map(
        (layout) => printAtoms(source, layout, indentation).doc,
      ),
      source,
      {
        statements: [...statements.keys()],
        start: findLayoutEnd(headerLayout),
        end: source.text.length,
        isTopLevel: true,
      },
      hiddenBlockRules(
        source,
        hiddenEnds,
        findHiddenKeptLines(source, hidden),
        (item: Node) => findLayoutEnd(statements.get(item)!),
        headerHiddenEnds,
      ),
    )
    const header = openingLine(
      printAtoms(source, headerLayout, { statement: "", continuation: "" }).doc,
      block,
      false,
    )
    return [
      printAsWritten(source, diagram.range[0], first.start),
      printDiagramBlock(source, header, block, options),
    ]
  }

  return { print, keepsPrefix }
}
