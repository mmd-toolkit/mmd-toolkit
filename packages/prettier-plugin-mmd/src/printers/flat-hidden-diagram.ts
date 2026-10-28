import { appendItems } from "./collections.ts"
import type { AstPath, Doc, ParserOptions } from "prettier"
import type { Node } from "@mmd-toolkit/parser"
import type { MermaidAst } from "../parser.ts"
import type { AtomLayout, GapRule } from "./atoms.ts"
import { printAtoms } from "./atoms.ts"
import type { PrintedBlock } from "./blocks.ts"
import {
  openingLine,
  printBlock,
  printClosedBlock,
  printDiagramBlock,
  printOpenBlock,
} from "./blocks.ts"
import { findHiddenKeptLines, hiddenBlockRules } from "./hidden-forms.ts"
import type { DiagramPrinter } from "./index.ts"
import { lineStartOf } from "./kept-lines.ts"
import { findLayoutEnd } from "./layout.ts"
import { indentationOf, printAsWritten } from "./lines.ts"
import type { Source } from "./source.ts"
import { isWhitespace } from "./source.ts"

/** A statement with its own authored body and opening/closing layouts. */
export interface HiddenBlockLayout<Statement extends Node> {
  /** Ends at the opener, before forms owned by its opening edge. */
  readonly header: AtomLayout
  /** Includes opening-edge hidden forms before the ordinary body items. */
  readonly body: readonly Statement[]
  /** Starts at the closer and includes any trailing hidden forms. */
  readonly closing: AtomLayout
}

/** An authored child body that ends at its range rather than a delimiter. */
export interface HiddenOpenBlockLayout<Statement extends Node> {
  readonly header: AtomLayout
  readonly body: readonly Statement[]
  readonly end: number
}

type HiddenBodyLayout<Statement extends Node> =
  HiddenBlockLayout<Statement> | HiddenOpenBlockLayout<Statement>

/** Source layouts and the kind of the diagram's retained hidden forms. */
interface FlatHiddenLayouts<Diagram extends Node, Statement extends Node> {
  readonly type: Diagram["type"]
  readonly ignoredType: Statement["type"]
  /**
   * The first atom starts at the header keyword. The printer uses its start
   * as the end of the retained prefix.
   */
  readonly header: (source: Source, diagram: Diagram) => AtomLayout
  readonly statement: (
    source: Source,
    statement: Statement,
  ) => AtomLayout | HiddenBodyLayout<Statement>
  /** Keep the complete source gap attached to this unit, including its LF. */
  readonly writtenGapBefore?: (source: Source, statement: Statement) => boolean
  /** A value closer can consume LF outside its range, like a hidden closer. */
  readonly retainsClosingBoundary?: (statement: Statement) => boolean
  /** Forms owned before a child header are printed by the containing body. */
  readonly prefixes?: (statement: Statement) => readonly Statement[]
  /** Trailing forms can belong to the last member of a grouped statement. */
  readonly suffixes?: (statement: Statement) => readonly Node[]
  /** Ordinary gaps when protection keeps neighboring statements on one line. */
  readonly inlineGapBefore?: (statement: Node) => GapRule | undefined
}

/** The printer and the root-prefix constraint selected with it. */
export interface FlatHiddenPrinter {
  readonly print: DiagramPrinter
  readonly keepsPrefix: (source: Source) => boolean
}

/**
 * Prints bodies whose hidden forms retain source-owned boundaries, and
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
    // A hidden form keeps its line at every nesting depth, including the
    // diagram header and child openings. Collect the same set once so moving
    // a child cannot remove its parent's protection on the next formatting
    // (docs/cynefin.md, Hidden boundaries).
    const allHidden: Node[] = []
    collectBodyHidden(diagram.body)
    const kept = findHiddenKeptLines(source, allHidden)
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
    const block = printBody(
      diagram.body,
      findLayoutEnd(headerLayout),
      source.text.length,
      1,
      true,
      headerHiddenEnds,
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

    /** Only authored body boundaries join lines; inner component gaps do not. */
    function collectBodyHidden(body: readonly Statement[]): void {
      for (const item of body) {
        appendItems(allHidden, layouts.prefixes?.(item) ?? [])
        if (item.type === layouts.ignoredType) allHidden.push(item)
        appendItems(allHidden, layouts.suffixes?.(item) ?? item.textAfter ?? [])
        const selected = layouts.statement(source, item)
        if ("body" in selected) collectBodyHidden(selected.body)
      }
    }

    /** The same suffix and hidden-boundary path prints every authored body. */
    function printBody(
      body: readonly Statement[],
      start: number,
      end: number,
      depth: number,
      isTopLevel: boolean,
      openingHiddenEnds: ReadonlySet<number>,
      rangeEnded = false,
    ): PrintedBlock {
      const indentation = {
        statement: indentationOf(options, depth),
        continuation: indentationOf(options, depth + 1),
      }
      const hidden: Node[] = body.flatMap((item) => [
        ...(layouts.prefixes?.(item) ?? []),
        ...(item.type === layouts.ignoredType ? [item] : []),
      ])
      const statements = new Map<Node, AtomLayout>()
      const nested = new Map<Node, HiddenBodyLayout<Statement>>()
      for (const item of body) {
        let selected = layouts.statement(source, item)
        const prefixes = layouts.prefixes?.(item) ?? []
        const prefixEnd = prefixes.at(-1)?.range[1]
        const ownedHeader = "body" in selected ? selected.header : selected
        // As with suffixes below, a protected atom crossing this boundary
        // remains whole (docs/eventmodeling.md, Semicolons).
        if (
          prefixEnd !== undefined &&
          prefixes.every((prefix) =>
            ownedHeader.atoms.some(
              (atom) =>
                atom.start === prefix.range[0] && atom.end === prefix.range[1],
            ),
          )
        ) {
          for (const prefix of prefixes)
            statements.set(prefix, {
              atoms: [{ start: prefix.range[0], end: prefix.range[1] }],
              rules: new Map(),
              outdented: new Set(),
              lineBreaks: "kept",
            })
          const trimmed = {
            ...ownedHeader,
            atoms: ownedHeader.atoms.filter((atom) => atom.start >= prefixEnd),
          }
          selected =
            "body" in selected ? { ...selected, header: trimmed } : trimmed
        }
        const selectedLayout =
          "body" in selected
            ? "closing" in selected
              ? selected.closing
              : selected.header
            : selected
        // A protected opening prefix can already contain a child's value.
        // Keep its suffix as a body boundary, but do not print those covered
        // atoms again (docs/cynefin.md, Hidden boundaries and Semicolons).
        const layout = {
          ...selectedLayout,
          atoms: selectedLayout.atoms.filter((atom) => atom.end > start),
        }
        if ("body" in selected) nested.set(item, selected)
        const suffixes = layouts.suffixes?.(item) ?? item.textAfter ?? []
        appendItems(hidden, suffixes)
        // A protected segment can span a suffix boundary. Keep that layout
        // whole rather than cutting an indivisible atom.
        const firstSuffix = suffixes.at(0)
        if (
          firstSuffix === undefined ||
          suffixes.some(
            (suffix) =>
              !layout.atoms.some(
                (atom) =>
                  atom.start === suffix.range[0] &&
                  atom.end === suffix.range[1],
              ),
          )
        ) {
          if (layout.atoms.length > 0) statements.set(item, layout)
          continue
        }
        const beforeSuffix = layout.atoms.filter(
          (atom) => atom.end <= firstSuffix.range[0],
        )
        if (beforeSuffix.length > 0)
          statements.set(item, { ...layout, atoms: beforeSuffix })
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
      for (const item of body)
        if (layouts.retainsClosingBoundary?.(item) === true) {
          const boundaryEnd = findLayoutEnd(statements.get(item)!)
          if (
            boundaryEnd < source.text.length &&
            isWhitespace(source.text[boundaryEnd])
          )
            hiddenEnds.add(boundaryEnd)
        }
      const rules = hiddenBlockRules(
        source,
        hiddenEnds,
        kept,
        (item: Node) => {
          const bodyLayout = nested.get(item)
          return bodyLayout !== undefined && "end" in bodyLayout
            ? bodyLayout.end
            : findLayoutEnd(statements.get(item)!)
        },
        openingHiddenEnds,
      )
      return printBlock(
        [...statements].map(([item, layout]) => {
          const nestedLayout = nested.get(item)
          if (nestedLayout === undefined)
            return printAtoms(source, layout, indentation).doc
          const nestedBody = printBody(
            nestedLayout.body,
            findLayoutEnd(nestedLayout.header),
            "closing" in nestedLayout
              ? layout.atoms[0].start
              : nestedLayout.end,
            depth + 1,
            false,
            new Set(),
            "end" in nestedLayout,
          )
          if (!("closing" in nestedLayout))
            return printOpenBlock(
              openingLine(
                printAtoms(source, nestedLayout.header, indentation).doc,
                nestedBody,
                false,
              ),
              nestedBody,
              depth,
              options,
            )
          return printClosedBlock(
            openingLine(
              printAtoms(source, nestedLayout.header, indentation).doc,
              nestedBody,
              false,
            ),
            nestedBody,
            printAtoms(source, layout, indentation).doc,
            depth,
            options,
          )
        }),
        source,
        {
          statements: [...statements.keys()],
          start,
          end,
          isTopLevel,
        },
        {
          ...rules,
          printedStart: (item) => {
            const layout = nested.get(item)?.header ?? statements.get(item)!
            return layout.atoms[0].start
          },
          writtenGapBefore: (item) => {
            const statement = body.find((candidate) => candidate === item)
            return (
              statement !== undefined &&
              (layouts.writtenGapBefore?.(source, statement) === true ||
                (rangeEnded &&
                  statement === body[0] &&
                  (layouts.prefixes?.(statement).length ?? 0) > 0))
            )
          },
          ...(layouts.inlineGapBefore === undefined
            ? {}
            : { inlineGapBefore: layouts.inlineGapBefore }),
          holdsStatements: (item) => nested.has(item),
        },
      )
    }
  }

  return { print, keepsPrefix }
}
