import type { AstPath, Doc, ParserOptions } from "prettier"
import type { StateDiagram, StateStatement } from "@mmd-toolkit/parser"
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
import { expectToken } from "./layout.ts"
import { indentationOf } from "./lines.ts"
import type { Source } from "./source.ts"
import { findTokenStartingAt } from "./source.ts"
import { findStateKeptLines } from "./state-kept-lines.ts"
import type { StateBodyStatement } from "./state-layout.ts"
import {
  classifyStateStatement,
  findBodyBraces,
  findStatePrintedEnd,
  hasBodyBlock,
  isStateNameStatement,
  layoutBodyOpening,
  layoutStateHeader,
  layoutStateStatement,
} from "./state-layout.ts"

/**
 * Prints the body of a state diagram and the nodes below it, to the end of
 * the text (docs/state.md).
 *
 * Each statement stands on a line of its own, one level deeper than the
 * header or the line that opens its body, and the `}` that closes a body
 * stands on a line of its own, at the level of the line that opens it. The
 * rest is as in a flowchart: comments and directives on lines of their own
 * stand at the level of the statements around them, runs of empty lines
 * become one, and empty lines at the start and the end of a body are
 * dropped (see `printBlock`).
 */
export function printState(
  path: AstPath<MermaidAst>,
  options: ParserOptions<MermaidAst>,
  print: (path: AstPath<MermaidAst>) => Doc,
  source: Source,
): Doc {
  const node = path.node
  if (node.type === "StateDiagram") {
    return printDiagram(path, options, print, source, node)
  }
  const classified = classifyStateStatement(node)
  if (classified === null) {
    throw new Error(
      `prettier-plugin-mmd: ${node.type} is no node of a state diagram that is printed`,
    )
  }
  const depth = depthOf(path)
  const followsStateName = isStateNameStatement(path.previous)
  switch (classified.kind) {
    case "body":
      if (hasBodyBlock(source, classified.statement)) {
        return printBodyBlock(
          path,
          options,
          print,
          source,
          classified.statement,
          depth,
          followsStateName,
        )
      }
      return printLine(
        source,
        options,
        layoutStateStatement(
          source,
          classified.statement,
          findStatePrintedEnd(source, classified.statement),
          followsStateName,
        ),
        depth,
      )
    case "simple":
      return printLine(
        source,
        options,
        layoutStateStatement(
          source,
          classified.statement,
          findStatePrintedEnd(source, classified.statement),
          followsStateName,
        ),
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
  diagram: StateDiagram,
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
    stateBlockRules(source),
  )
  const header = openingLine(
    printLine(source, options, layoutStateHeader(source, keyword), 0),
    block,
    false,
  )
  return printDiagramBlock(source, header, block, options)
}

/**
 * Prints a composite statement or an alias definition with its body: the
 * line that opens it, with its `{`, its statements one level deeper, and
 * its `}` (docs/state.md, Composite states).
 */
function printBodyBlock(
  path: AstPath<MermaidAst>,
  options: ParserOptions<MermaidAst>,
  print: (path: AstPath<MermaidAst>) => Doc,
  source: Source,
  statement: StateBodyStatement,
  depth: number,
  followsStateName: boolean,
): Doc {
  const { opening, closing } = findBodyBraces(source, statement)
  const block = printBlock<StateStatement>(
    path.map(print, "body" as never),
    source,
    {
      statements: statement.body ?? [],
      start: opening.range[1],
      end: closing.range[0],
      isTopLevel: false,
    },
    stateBlockRules(source),
  )
  const header = openingLine(
    printLine(
      source,
      options,
      layoutBodyOpening(source, statement, opening, followsStateName),
      depth,
    ),
    block,
    false,
  )
  return printClosedBlock(header, block, closing.value, depth, options)
}

/**
 * The block rules of the statements of a state diagram (see `BlockRules`):
 * a statement with a body block holds lines of its own, and no statement is
 * dropped.
 */
function stateBlockRules(source: Source): BlockRules<StateStatement> {
  return {
    kept: findStateKeptLines(source),
    printedEnd: (statement) => findStatePrintedEnd(source, statement),
    holdsStatements: (statement) => {
      const classified = classifyStateStatement(statement)
      return (
        classified.kind === "body" && hasBodyBlock(source, classified.statement)
      )
    },
    isDroppedAtTopLevel: () => false,
    keepsWhitespaceLineAfterComment: false,
    keepsDirectiveLinesUnindentedAfterBareMarker: false,
  }
}

/**
 * The level of the lines of the statement at `path`: 1 at the top level,
 * one more inside each body.
 */
function depthOf(path: AstPath<MermaidAst>): number {
  return (
    1 +
    path.ancestors.filter(
      (ancestor) => classifyStateStatement(ancestor)?.kind === "body",
    ).length
  )
}
