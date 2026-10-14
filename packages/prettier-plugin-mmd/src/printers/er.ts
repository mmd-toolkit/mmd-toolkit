import type { AstPath, Doc, ParserOptions } from "prettier"
import type {
  ErAttribute,
  ErDiagram,
  ErEntityStatement,
  ErIgnoredText,
  ErStatement,
  ErSubgraphStatement,
  Token,
} from "@mmd-toolkit/parser"
import type { MermaidAst } from "../parser.ts"
import type { AtomLayout } from "./atoms.ts"
import { printAtoms } from "./atoms.ts"
import type { BlockRules } from "./blocks.ts"
import {
  openingLine,
  printBlock,
  printClosedBlock,
  printDiagramBlock,
} from "./blocks.ts"
import { findErKeptLines } from "./er-kept-lines.ts"
import {
  classifyErStatement,
  findAttributeBraces,
  findSubgraphHeaderEnd,
  hasAttributeBlock,
  layoutAttribute,
  layoutBlockOpening,
  layoutErStatement,
  layoutSubgraphOpening,
} from "./er-layout.ts"
import { expectToken, layoutKeywordHeader, toAsciiLowerCase } from "./layout.ts"
import { indentationOf, printAsWritten } from "./lines.ts"
import type { Source } from "./source.ts"
import { findTokenEndingBefore, findTokenStartingAt } from "./source.ts"

/**
 * Prints the body of an ER diagram and the nodes below it, to the end of the
 * text (docs/er.md).
 *
 * Each statement stands on a line of its own, one level deeper than the
 * header or the line that opens its subgraph. The attributes of an entity
 * stand one level deeper than the line of the entity, one on each line, and
 * the `}` that closes the block, like the `end` that closes a subgraph,
 * stands on a line of its own, at the level of the line that opens it. The
 * rest is as in a class diagram: comments and directives on lines of their
 * own stand at the level of the statements around them, runs of empty lines
 * become one, and empty lines at the start and the end of a block are dropped
 * (see `printBlock`).
 */
export function printEr(
  path: AstPath<MermaidAst>,
  options: ParserOptions<MermaidAst>,
  print: (path: AstPath<MermaidAst>) => Doc,
  source: Source,
): Doc {
  const node = path.node
  switch (node.type) {
    case "ErDiagram":
      return printDiagram(path, options, print, source, node)
    case "ErAttribute":
      return printLine(
        source,
        options,
        layoutAttribute(source, node),
        depthOf(path) + 1,
      )
    case "ErIgnoredText":
      // An item of an attribute block that mermaid.js does not read, kept as
      // written (docs/er.md, Attribute blocks).
      return printAsWritten(source, node.range[0], node.range[1])
    default:
      break
  }
  const classified = classifyErStatement(node)
  if (classified === null) {
    throw new Error(
      `prettier-plugin-mmd: ${node.type} is no node of an ER diagram that is printed`,
    )
  }
  const depth = depthOf(path)
  switch (classified.kind) {
    case "subgraph":
      return printSubgraph(
        path,
        options,
        print,
        source,
        classified.statement,
        depth,
      )
    case "entity":
      if (hasAttributeBlock(source, classified.statement)) {
        return printAttributeBlock(
          path,
          options,
          print,
          source,
          classified.statement,
          depth,
        )
      }
      return printLine(
        source,
        options,
        layoutErStatement(source, classified.statement, node.range[1]),
        depth,
      )
    case "simple":
      return printLine(
        source,
        options,
        layoutErStatement(source, classified.statement, node.range[1]),
        depth,
      )
    default:
      throw new Error(
        `prettier-plugin-mmd: unknown kind of statement ${JSON.stringify(classified satisfies never)}`,
      )
  }
}

/** Prints a statement laid out on its lines at `depth`. */
function printLine(
  source: Source,
  options: ParserOptions<MermaidAst>,
  layout: AtomLayout,
  depth: number,
): Doc {
  return printAtoms(source, layout, {
    statement: indentationOf(options, depth),
    continuation: indentationOf(options, depth + 1),
  }).doc
}

/**
 * Prints the header and the statements of the diagram, and the end of the
 * text.
 */
function printDiagram(
  path: AstPath<MermaidAst>,
  options: ParserOptions<MermaidAst>,
  print: (path: AstPath<MermaidAst>) => Doc,
  source: Source,
  diagram: ErDiagram,
): Doc {
  const keyword = expectToken(
    findTokenStartingAt(source, diagram.range[0]),
    "the header keyword",
  )
  const block = printBlock(
    // AstPath<MermaidAst> takes only field names that every node type of the
    // union has; the node here is the diagram, which has `body`.
    path.map(print, "body" as never),
    source,
    {
      statements: diagram.body,
      start: keyword.range[1],
      end: source.text.length,
      isTopLevel: true,
    },
    statementBlockRules(source),
  )
  const header = openingLine(
    printLine(source, options, layoutKeywordHeader(source, keyword), 0),
    block,
    false,
  )
  return printDiagramBlock(source, header, block, options)
}

/**
 * Prints a subgraph: its keyword, name, and title, its statements one level
 * deeper, and its `end` (docs/er.md, Subgraphs).
 */
function printSubgraph(
  path: AstPath<MermaidAst>,
  options: ParserOptions<MermaidAst>,
  print: (path: AstPath<MermaidAst>) => Doc,
  source: Source,
  statement: ErSubgraphStatement,
  depth: number,
): Doc {
  const headerEnd = findSubgraphHeaderEnd(source, statement)
  const closing = findSubgraphEnd(source, statement)
  const block = printBlock<ErStatement>(
    path.map(print, "body" as never),
    source,
    {
      statements: statement.body,
      start: headerEnd,
      end: closing.range[0],
      isTopLevel: false,
    },
    statementBlockRules(source),
  )
  const header = openingLine(
    printLine(
      source,
      options,
      layoutSubgraphOpening(source, statement, headerEnd),
      depth,
    ),
    block,
    false,
  )
  return printClosedBlock(header, block, closing.value, depth, options)
}

/**
 * Prints an entity statement with its attribute block: the line of the
 * entity with its `{`, the attributes one level deeper, one on each line, and
 * the `}` (docs/er.md, Attribute blocks).
 */
function printAttributeBlock(
  path: AstPath<MermaidAst>,
  options: ParserOptions<MermaidAst>,
  print: (path: AstPath<MermaidAst>) => Doc,
  source: Source,
  statement: ErEntityStatement,
  depth: number,
): Doc {
  const { opening, closing } = findAttributeBraces(source, statement)
  const block = printBlock<ErAttribute | ErIgnoredText>(
    path.map(print, "attributes" as never),
    source,
    {
      statements: statement.attributes ?? [],
      start: opening.range[1],
      end: closing.range[0],
      isTopLevel: false,
    },
    attributeBlockRules(source),
  )
  const header = openingLine(
    printLine(
      source,
      options,
      layoutBlockOpening(source, statement, opening),
      depth,
    ),
    block,
    false,
  )
  return printClosedBlock(header, block, closing.value, depth, options)
}

/** The `end` that closes a subgraph: its last token. */
function findSubgraphEnd(
  source: Source,
  statement: ErSubgraphStatement,
): Token {
  const closing = expectToken(
    findTokenEndingBefore(source, statement.range[1]),
    "the `end` of a subgraph",
  )
  if (toAsciiLowerCase(closing.value) !== "end") {
    throw new Error(
      `prettier-plugin-mmd: expected the \`end\` of a subgraph, found ${JSON.stringify(closing.value)} at offset ${closing.range[0]}`,
    )
  }
  return closing
}

/**
 * The block rules of the statements of an ER diagram and of a subgraph (see
 * `BlockRules`): a subgraph and an entity statement with an attribute block
 * hold lines of their own, and no statement is dropped. A comment line is
 * the only comment of the diagram, and it takes no line break after it, so
 * no line of only whitespace is kept after one (docs/er.md, Comments).
 */
function statementBlockRules(source: Source): BlockRules<ErStatement> {
  return {
    kept: findErKeptLines(source),
    printedEnd: (statement) => statement.range[1],
    holdsStatements: (statement) => {
      const classified = classifyErStatement(statement)
      return (
        classified.kind === "subgraph" ||
        (classified.kind === "entity" &&
          hasAttributeBlock(source, classified.statement))
      )
    },
    isDroppedAtTopLevel: () => false,
    keepsWhitespaceLineAfterComment: false,
    keepsDirectiveLinesUnindented: false,
  }
}

/**
 * The block rules of the items of an attribute block: each ends at its last
 * token, and none holds others or is dropped.
 */
function attributeBlockRules(
  source: Source,
): BlockRules<ErAttribute | ErIgnoredText> {
  return {
    kept: findErKeptLines(source),
    printedEnd: (item) => item.range[1],
    holdsStatements: () => false,
    isDroppedAtTopLevel: () => false,
    keepsWhitespaceLineAfterComment: false,
    keepsDirectiveLinesUnindented: false,
  }
}

/**
 * The level of the lines of the statement at `path`: 1 at the top level,
 * one more inside each subgraph. The attributes of an entity stand one level
 * deeper than its line.
 */
function depthOf(path: AstPath<MermaidAst>): number {
  return (
    1 +
    path.ancestors.filter(
      (ancestor) => classifyErStatement(ancestor)?.kind === "subgraph",
    ).length
  )
}
