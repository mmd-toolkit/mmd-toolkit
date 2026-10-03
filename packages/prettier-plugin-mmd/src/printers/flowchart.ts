import type { AstPath, Doc, ParserOptions } from "prettier"
import type {
  FlowchartDiagram,
  FlowchartLabel,
  FlowchartStatement,
  FlowchartSubgraphStatement,
  Token,
} from "@mmd-toolkit/parser"
import { flowchartSubgraphIds } from "@mmd-toolkit/parser"
import type { MermaidAst } from "../parser.ts"
import { printAtoms } from "./atoms.ts"
import type { BlockRules } from "./blocks.ts"
import {
  openingLine,
  printBlock,
  printClosedBlock,
  printDiagramBlock,
} from "./blocks.ts"
import {
  endBeforeBlocks,
  flowchartDbTextsOf,
  printedEndOf,
} from "./db-texts.ts"
import { lineEndOf } from "./kept-lines.ts"
import { findFlowchartKeptLines } from "./flowchart-kept-lines.ts"
import {
  layoutHeader,
  layoutStatement,
  layoutSubgraphHeader,
} from "./flowchart-layout.ts"
import { endsWithSpaceOrTab } from "./gap.ts"
import { expectToken } from "./layout.ts"
import { indentationOf } from "./lines.ts"
import type { Source } from "./source.ts"
import {
  findStructuralToken,
  findTokenEndingBefore,
  findTokenStartingAt,
  findTriviaBetween,
  isWhitespace,
} from "./source.ts"

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
  const node = path.node
  switch (node.type) {
    case "FlowchartDiagram":
      return printDiagram(path, options, print, source, node)
    case "FlowchartSubgraphStatement":
      return printSubgraph(path, options, print, source, node)
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
        statement: indentationOf(options, depth),
        continuation: indentationOf(options, depth + 1),
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
    // AstPath<MermaidAst> takes only field names that every node type of the
    // union has; the node here is the diagram, which has `body`.
    path.map(print, "body" as never),
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
    path.map(print, "body" as never),
    source,
    {
      statements: subgraph.body,
      start: headerEnd,
      end: endKeyword.range[0],
      isTopLevel: false,
    },
    flowchartBlockRules(source),
  )
  const spaceBeforeBlock = hasWhitespaceAfterBlocks(source, subgraph, headerEnd)
  const headerDoc = printAtoms(
    source,
    layoutSubgraphHeader(source, subgraph, headerEnd),
    {
      statement: indentationOf(options, depth),
      continuation: indentationOf(options, depth + 1),
    },
  ).doc
  const header = openingLine(
    spaceBeforeBlock ? [headerDoc, " "] : headerDoc,
    block,
    spaceBeforeBlock ||
      endsWithSpaceOrTab(source.text.slice(subgraph.range[0], headerEnd)),
  )
  return printClosedBlock(header, block, endKeyword.value, depth, options)
}

/**
 * The Db ids of the subgraphs of each source, read once per source: the
 * parser reads the name text of a subgraph (diagrams/flowchart.md, Db
 * normalization, Subgraphs), which this module does not read again.
 */
const subgraphIdsBySource = new WeakMap<
  Source,
  ReadonlyMap<FlowchartSubgraphStatement, string>
>()

/**
 * Whether the name text of a subgraph without a title holds whitespace that
 * neither its name nor the header up to `headerEnd` holds: whitespace around
 * the empty description blocks that follow the name on its line, as in
 * `subgraph "S"accDescr {} accDescr {}` and `subgraph "S"accDescr {} ;A`.
 * The blocks read no token, so for mermaid.js that whitespace follows the
 * name: the subgraph has the id `subGraph0` there, and the id `S` without
 * it. The blocks move to lines of their own, and one space is printed after
 * the header in their place (docs/flowchart.md, Subgraph names).
 *
 * The id that the parser reads from the text is not the name when the name
 * text holds whitespace, so the whitespace that nothing in the header
 * accounts for shows as an id that is not the name.
 */
function hasWhitespaceAfterBlocks(
  source: Source,
  subgraph: FlowchartSubgraphStatement,
  headerEnd: number,
): boolean {
  if (
    subgraph.title !== null ||
    hasWhitespaceOutsideDirectives(source, subgraph.name.range[1], headerEnd) ||
    [...subgraph.name.value].some(isWhitespace)
  ) {
    return false
  }
  let ids = subgraphIdsBySource.get(source)
  if (ids === undefined) {
    ids = flowchartSubgraphIds(source.root, source.text)
    subgraphIdsBySource.set(source, ids)
  }
  return ids.get(subgraph) !== subgraph.name.value
}

/**
 * Whether the text from `from` to `to` holds whitespace that no directive
 * covers: mermaid.js removes the directives before it reads the text, so the
 * whitespace inside one is not in it (common.md, Directives).
 */
function hasWhitespaceOutsideDirectives(
  source: Source,
  from: number,
  to: number,
): boolean {
  let position = from
  while (position < to) {
    const covering = findTriviaBetween(source, position, position + 1).at(0)
    if (covering?.type === "Directive") {
      position = covering.range[1]
    } else if (isWhitespace(source.text.charAt(position))) {
      return true
    } else {
      position++
    }
  }
  return false
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
 * rejected. A style that is all whitespace has no node, so it lies after the
 * range. The `,` may end the last token of the tree's last style: in
 * `classDef c fill:x\, ` the `,` after the `\` belongs to the style
 * `fill:x\,`, yet the grammar reads it and needs the whitespace after it.
 * That whitespace belongs to the statement: it ends where the Db text of
 * the last style ends (`flowchartDbTexts`). A subgraph ends at its `end`.
 */
function findPrintedEnd(source: Source, statement: FlowchartStatement): number {
  switch (statement.type) {
    case "FlowchartStyleStatement":
    case "FlowchartClassDefStatement":
    case "FlowchartLinkStyleStatement":
    case "FlowchartDefaultLinkStyleStatement": {
      const last = expectToken(
        findTokenEndingBefore(source, statement.range[1]),
        "the end of a style statement",
      )
      if (statement.styles.at(-1) !== null && !last.value.endsWith(",")) {
        return statement.range[1]
      }
      const lastText = flowchartDbTextsOf(source).styles.get(statement)?.at(-1)
      return lastText === undefined
        ? statement.range[1]
        : printedEndOf(
            source,
            statement.range[1],
            lastText.range[0],
            endBeforeBlocks(lastText, statement.range[1]),
          )
    }
    default:
      return statement.range[1]
  }
}

/**
 * The end of the header: its keyword, and its direction when it has one.
 */
function findHeaderEnd(source: Source, diagram: FlowchartDiagram): number {
  const keyword = expectToken(
    findTokenStartingAt(source, diagram.range[0]),
    "the header keyword",
  )
  if (diagram.direction === null) return keyword.range[1]
  const direction = expectToken(
    findStructuralToken(source, keyword.range[1]),
    "the header direction",
  )
  if (direction.value !== diagram.direction) {
    throw new Error(
      `prettier-plugin-mmd: the token after the header keyword is ${JSON.stringify(direction.value)}, not the direction ${JSON.stringify(diagram.direction)}`,
    )
  }
  return direction.range[1]
}

/**
 * Where the `subgraph` line ends: after the `]` of its title, or else after
 * its name with the whitespace after it, where the name text of the Db ends
 * (`flowchartDbTexts`). A subgraph without a title whose name is followed by
 * whitespace does not get its name as its id: `subgraph S ` has the id
 * `subGraph0`. The empty description blocks after the name are statements
 * of the subgraph, and the line ends before the first of them, or before
 * the line feed that the name text of the Db may reach over: after a name
 * that ends with `end`, which takes the line feed after it.
 */
function findSubgraphHeaderEnd(
  source: Source,
  subgraph: FlowchartSubgraphStatement,
): number {
  if (subgraph.title !== null) return findTitleEnd(source, subgraph.title)
  const nameText = flowchartDbTextsOf(source).subgraphNameTexts.get(subgraph)
  if (nameText === undefined) {
    throw new Error(
      `prettier-plugin-mmd: no name text for the subgraph at offset ${subgraph.range[0]}`,
    )
  }
  return Math.min(
    endBeforeBlocks(nameText, subgraph.name.range[1]),
    lineEndOf(source, subgraph.name.range[1]),
  )
}

/** The end of the `]` after a subgraph title. */
function findTitleEnd(source: Source, title: FlowchartLabel): number {
  const closing = expectToken(
    findStructuralToken(source, title.range[1]),
    "the `]` after a subgraph title",
  )
  if (closing.value !== "]") {
    throw new Error(
      `prettier-plugin-mmd: the token after a subgraph title is ${JSON.stringify(closing.value)}, not "]"`,
    )
  }
  return closing.range[1]
}

/** The `end` keyword that closes a subgraph: its last token. */
function findEndKeyword(
  source: Source,
  subgraph: FlowchartSubgraphStatement,
): Token {
  const token = expectToken(
    findTokenEndingBefore(source, subgraph.range[1]),
    "the end of a subgraph",
  )
  if (token.range[1] !== subgraph.range[1]) {
    throw new Error(
      "prettier-plugin-mmd: no token ends where a subgraph statement ends",
    )
  }
  return token
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
