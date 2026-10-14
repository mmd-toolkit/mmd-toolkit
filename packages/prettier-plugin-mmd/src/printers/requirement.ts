import type { AstPath, Doc, ParserOptions } from "prettier"
import type {
  RequirementDiagram,
  RequirementStatement,
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
import { expectToken, layoutKeywordHeader } from "./layout.ts"
import { indentationOf } from "./lines.ts"
import { findRequirementKeptLines } from "./requirement-kept-lines.ts"
import type {
  RequirementBlockStatement,
  RequirementBodyItem,
} from "./requirement-layout.ts"
import {
  classifyRequirementStatement,
  findBlockBraces,
  layoutBlockOpening,
  layoutBodyItem,
  layoutRequirementStatement,
} from "./requirement-layout.ts"
import type { Source } from "./source.ts"
import { findTokenStartingAt } from "./source.ts"

/** The level of the lines of the statements, one deeper than the header. */
const statementDepth = 1

/** The level of the lines of the fields of a body, one deeper than their statement. */
const itemDepth = statementDepth + 1

/**
 * Prints the body of a requirement diagram and the nodes below it, to the end
 * of the text (docs/requirement.md).
 *
 * Each statement stands on a line of its own, one level deeper than the
 * header. The fields of a requirement or an element stand one level deeper
 * than the line of the statement, one on each line, and the `}` that closes
 * the body stands on a line of its own, at the level of that line. The rest
 * is as in an ER diagram: comments and directives on lines of their own stand
 * at the level of the statements around them, runs of empty lines become one,
 * and empty lines at the start and the end of a block are dropped (see
 * `printBlock`).
 */
export function printRequirement(
  path: AstPath<MermaidAst>,
  options: ParserOptions<MermaidAst>,
  print: (path: AstPath<MermaidAst>) => Doc,
  source: Source,
): Doc {
  const node = path.node
  if (node.type === "RequirementDiagram") {
    return printDiagram(path, options, print, source, node)
  }
  if (isBodyItem(node)) {
    return printLine(source, options, layoutBodyItem(source, node), itemDepth)
  }
  const classified = classifyRequirementStatement(node)
  if (classified === null) {
    throw new Error(
      `prettier-plugin-mmd: ${node.type} is no node of a requirement diagram that is printed`,
    )
  }
  switch (classified.kind) {
    case "block":
      return printBody(path, options, print, source, classified.statement)
    case "simple":
      return printLine(
        source,
        options,
        layoutRequirementStatement(source, classified.statement, node.range[1]),
        statementDepth,
      )
    default:
      throw new Error(
        `prettier-plugin-mmd: unknown kind of statement ${JSON.stringify(classified satisfies never)}`,
      )
  }
}

/** Whether a node is an item of the body of a requirement or an element. */
function isBodyItem(node: MermaidAst): node is RequirementBodyItem {
  switch (node.type) {
    case "RequirementValueField":
    case "RequirementRiskField":
    case "RequirementVerifyMethodField":
    case "RequirementElementField":
    case "RequirementIgnoredText":
      return true
    default:
      return false
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

/** Prints the header and the statements of the diagram, and the end of the text. */
function printDiagram(
  path: AstPath<MermaidAst>,
  options: ParserOptions<MermaidAst>,
  print: (path: AstPath<MermaidAst>) => Doc,
  source: Source,
  diagram: RequirementDiagram,
): Doc {
  const keyword = expectToken(
    findTokenStartingAt(source, diagram.range[0]),
    "the header keyword",
  )
  const block = printBlock<RequirementStatement>(
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
 * Prints a requirement or an element: the line with its keyword, name,
 * classes, and `{`, its fields one level deeper, one on each line, and the
 * `}` (docs/requirement.md, Bodies). A body without items is the `{` and
 * the `}` on two lines: mermaid.js needs the line break after the `{`.
 */
function printBody(
  path: AstPath<MermaidAst>,
  options: ParserOptions<MermaidAst>,
  print: (path: AstPath<MermaidAst>) => Doc,
  source: Source,
  statement: RequirementBlockStatement,
): Doc {
  const { opening, closing } = findBlockBraces(source, statement)
  const block = printBlock<RequirementBodyItem>(
    path.map(print, "body" as never),
    source,
    {
      statements: statement.body,
      start: opening.range[1],
      end: closing.range[0],
      isTopLevel: false,
    },
    bodyBlockRules(source),
  )
  const header = openingLine(
    printLine(
      source,
      options,
      layoutBlockOpening(source, statement, opening),
      statementDepth,
    ),
    block,
    false,
  )
  return printClosedBlock(header, block, closing.value, statementDepth, options)
}

/**
 * The block rules of the statements of a requirement diagram (see
 * `BlockRules`): a requirement and an element hold a body of their own, and
 * no statement is dropped. A diagram comment takes the rest of its line and
 * no line break, so no line of only whitespace is kept after one
 * (docs/requirement.md, Comments).
 */
function statementBlockRules(source: Source): BlockRules<RequirementStatement> {
  return {
    kept: findRequirementKeptLines(source),
    printedEnd: (statement) => statement.range[1],
    holdsStatements: (statement) =>
      classifyRequirementStatement(statement).kind === "block",
    isDroppedAtTopLevel: () => false,
    keepsWhitespaceLineAfterComment: false,
    keepsDirectiveLinesUnindented: false,
  }
}

/** The block rules of the items of a body: each ends at its last token, and none holds others or is dropped. */
function bodyBlockRules(source: Source): BlockRules<RequirementBodyItem> {
  return {
    kept: findRequirementKeptLines(source),
    printedEnd: (item) => item.range[1],
    holdsStatements: () => false,
    isDroppedAtTopLevel: () => false,
    keepsWhitespaceLineAfterComment: false,
    keepsDirectiveLinesUnindented: false,
  }
}
