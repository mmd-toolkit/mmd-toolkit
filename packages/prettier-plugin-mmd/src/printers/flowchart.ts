import type { AstPath, Doc, ParserOptions } from "prettier"
import type {
  FlowchartDiagram,
  FlowchartStatement,
  FlowchartSubgraphStatement,
} from "@mmd-toolkit/parser"
import type { MermaidAst } from "../parser.ts"
import { printAtoms } from "./atoms.ts"
import { lineEndOf } from "./kept-lines.ts"
import type { BlockRules } from "./blocks.ts"
import {
  openingLine,
  printBlock,
  printClosedBlock,
  printDiagramBlock,
} from "./blocks.ts"
import {
  findFlowchartKeptLines,
  findSemicolonOnLaterLine,
} from "./flowchart-kept-lines.ts"
import { layoutStatement, layoutSubgraphHeader } from "./flowchart-layout.ts"
import { endsWithSpaceOrTab } from "./gap.ts"
import {
  layoutGraphHeader as layoutHeader,
  findGraphHeaderEnd as findHeaderEnd,
  findGraphTitleEnd as findTitleEnd,
  findGraphEndKeyword as findEndKeyword,
  findStyleStatementEnd,
} from "./graph-layout.ts"
import { narrowPath } from "./paths.ts"
import {
  indentationOf,
  significantIndentationWidth,
  withSignificantIndentation,
} from "./lines.ts"
import type { Source } from "./source.ts"

/**
 * Prints the body of a flowchart and the nodes below it, to the end of the
 * text.
 *
 * Each statement stands on a line of its own, one level deeper than the
 * header or the `subgraph` line that contains it. The `;` that separate
 * statements are dropped; a `;` that is a statement of its own is dropped
 * at the top level and kept, on a line of its own, inside a subgraph, where
 * the Db lists it. Comments and directives on lines of their own stand at
 * the level of the statements around them. Runs of empty lines become one,
 * and empty lines at the start and the end of a block are dropped.
 *
 * Within a statement, see `layoutStatement` and `printAtoms`.
 */
export function printFlowchart(
  path: AstPath<MermaidAst>,
  options: ParserOptions<MermaidAst>,
  print: (path: AstPath<MermaidAst>) => Doc,
  source: Source,
): Doc {
  // An indented direction statement can become accessibility text or rejected
  // syntax at column one. Use the shared positive step for the whole body,
  // including tabWidth zero (diagrams/flowchart.md, The statement context;
  // docs/flowchart.md, Indentation).
  const bodyOptions = {
    ...options,
    tabWidth: significantIndentationWidth(options.tabWidth),
  }
  const node = path.node
  switch (node.type) {
    case "FlowchartDiagram":
      return withSignificantIndentation(
        printDiagram(path, bodyOptions, print, source, node),
        options,
      )
    case "FlowchartSubgraphStatement":
      return printSubgraph(path, bodyOptions, print, source, node)
    default: {
      const statement = node as Exclude<
        FlowchartStatement,
        FlowchartSubgraphStatement
      >
      const layout = layoutStatement(
        source,
        statement,
        findPrintedEnd(source, statement),
      )
      const depth = depthOf(path)
      return printAtoms(source, layout, {
        statement: indentationOf(bodyOptions, depth),
        continuation: indentationOf(bodyOptions, depth + 1),
      }).doc
    }
  }
}

/**
 * Prints the header and the statements of the diagram, and the end of the
 * text. The statements run to the end of the text, so comments and
 * directives after the last one stand at its level.
 */
function printDiagram(
  path: AstPath<MermaidAst>,
  options: ParserOptions<MermaidAst>,
  print: (path: AstPath<MermaidAst>) => Doc,
  source: Source,
  diagram: FlowchartDiagram,
): Doc {
  const headerEnd = findHeaderEnd(source, diagram)
  const block = printBlock(
    narrowPath(path, diagram.type).map(print, "body"),
    source,
    {
      statements: diagram.body,
      start: headerEnd,
      end: source.text.length,
      isTopLevel: true,
    },
    flowchartBlockRules(source),
  )
  const header = openingLine(
    printAtoms(source, layoutHeader(source, diagram, headerEnd), {
      statement: "",
      continuation: indentationOf(options, 1),
    }).doc,
    block,
    false,
  )
  return printDiagramBlock(source, header, block, options)
}

/**
 * Prints a subgraph: the `subgraph` line, the statements one level deeper,
 * and the `end` line.
 */
function printSubgraph(
  path: AstPath<MermaidAst>,
  options: ParserOptions<MermaidAst>,
  print: (path: AstPath<MermaidAst>) => Doc,
  source: Source,
  subgraph: FlowchartSubgraphStatement,
): Doc {
  const depth = depthOf(path)
  const headerEnd = findSubgraphHeaderEnd(source, subgraph)
  const endKeyword = findEndKeyword(source, subgraph)
  const block = printBlock(
    narrowPath(path, subgraph.type).map(print, "body"),
    source,
    {
      statements: subgraph.body,
      start: headerEnd,
      end: endKeyword.range[0],
      isTopLevel: false,
    },
    flowchartBlockRules(source),
  )
  const headerDoc = printAtoms(
    source,
    layoutSubgraphHeader(source, subgraph, headerEnd),
    {
      statement: indentationOf(options, depth),
      continuation: indentationOf(options, depth + 1),
    },
  ).doc
  const header = openingLine(
    headerDoc,
    block,
    endsWithSpaceOrTab(source.text.slice(subgraph.range[0], headerEnd)),
  )
  return printClosedBlock(header, block, endKeyword.value, depth, options)
}

/**
 * The block rules of a flowchart (see `BlockRules`): a subgraph holds
 * statements, and a `;` of its own is dropped at the top level, where the
 * Db does not list it.
 */
function flowchartBlockRules(source: Source): BlockRules<FlowchartStatement> {
  return {
    kept: findFlowchartKeptLines(source),
    printedEnd: (statement) => findPrintedEnd(source, statement),
    holdsStatements: (statement) =>
      statement.type === "FlowchartSubgraphStatement",
    isDroppedAtTopLevel: (statement) =>
      statement.type === "FlowchartEmptyStatement",
    keepsWhitespaceLineAfterComment: false,
    keepsDirectiveLinesUnindented: false,
  }
}

/**
 * Where the printed text of a statement ends.
 *
 * A statement ends at its last token, except for a list of styles whose
 * last style is all whitespace, or whose text ends with a `,`: the grammar
 * needs a style after every `,` it reads, and the whitespace after the last
 * `,` is that style (diagrams/flowchart.md, Style, class, and link style
 * statements). `style A fill:red, ` is accepted and `style A fill:red,` is
 * rejected. A style that is all whitespace is null in the tree, so the
 * whitespace lies after the range. The `,` may end the last token of the
 * tree's last style: in `classDef c fill:x\, ` the `,` after the `\` belongs
 * to the style `fill:x\,`, yet the grammar reads it and needs the whitespace
 * after it. That whitespace belongs to the statement: it ends where the
 * whitespace written after it ends (see `findWrittenWhitespaceEnd`). A
 * subgraph ends at its `end`.
 */
function findPrintedEnd(source: Source, statement: FlowchartStatement): number {
  switch (statement.type) {
    case "FlowchartStyleStatement":
    case "FlowchartClassDefStatement":
    case "FlowchartLinkStyleStatement":
    case "FlowchartDefaultLinkStyleStatement": {
      return findStyleStatementEnd(source, statement)
    }
    default:
      return statement.range[1]
  }
}

/**
 * Where the `subgraph` line ends: after the `]` of its title, or else after
 * its name, whose tokens and value run over the whitespace after it (ast/
 * flowchart.md, FlowchartSubgraphStatement). A subgraph without a title
 * whose name is followed by whitespace does not get its name as its id:
 * `subgraph S ` has the id `subGraph0`. The empty description blocks after
 * the name are statements of the subgraph, and the line ends before the
 * first of them, or before the line feed that the name may reach over: after
 * a name that ends with `end`, which takes the line feed after it. A `;` that
 * stands on a later line after such a name is part of the line (see
 * `findSemicolonOnLaterLine`).
 */
function findSubgraphHeaderEnd(
  source: Source,
  subgraph: FlowchartSubgraphStatement,
): number {
  if (subgraph.title !== null) return findTitleEnd(source, subgraph.title)
  const semicolon = findSemicolonOnLaterLine(source, subgraph)
  if (semicolon !== undefined) return semicolon.range[1]
  const { range } = subgraph.name
  return Math.min(range[1], lineEndOf(source, range[1] - 1))
}

/**
 * The level of the lines of the statement at `path`: 1 at the top level, one
 * more inside each subgraph.
 */
function depthOf(path: AstPath<MermaidAst>): number {
  return (
    1 +
    path.ancestors.filter(
      (ancestor) => ancestor.type === "FlowchartSubgraphStatement",
    ).length
  )
}
