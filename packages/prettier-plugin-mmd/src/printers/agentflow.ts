import type { AstPath, Doc, ParserOptions } from "prettier"
import type {
  AgentflowDiagram,
  AgentflowStatement,
  AgentflowFlowStatement,
  AgentflowGlobalStatement,
} from "@mmd-toolkit/parser"
import type { MermaidAst } from "../parser.ts"
import { printAtoms } from "./atoms.ts"
import type { BlockRules } from "./blocks.ts"
import {
  openingLine,
  printBlock,
  printClosedBlock,
  printDiagramBlock,
} from "./blocks.ts"
import { findAgentflowKeptLines } from "./agentflow-kept-lines.ts"
import {
  classifyAgentflowStatement,
  findNamePrintedEnd,
  layoutStatement,
  layoutContainerHeader,
} from "./agentflow-layout.ts"
import { endsWithSpaceOrTab } from "./gap.ts"
import { expectToken, walk } from "./layout.ts"
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
import { findTokenStartingAt } from "./source.ts"

/**
 * Prints the body of an agentflow and the nodes below it, to the end of the
 * text.
 *
 * Each statement stands on a line of its own, one level deeper than the
 * header or the `flow` or `global` line that contains it. The `;` that separate
 * statements are dropped; EmptyStatements stay structurally in both flow
 * and global bodies, including after nested end, and drop at the top level
 * (docs/agentflow.md, Semicolons). Comments and directives on their own stand at
 * the level of the statements around them. Runs of empty lines become one,
 * and empty lines at the start and the end of a block are dropped.
 *
 * Within a statement, see `layoutStatement` and `printAtoms`.
 */
export function printAgentflow(
  path: AstPath<MermaidAst>,
  options: ParserOptions<MermaidAst>,
  print: (path: AstPath<MermaidAst>) => Doc,
  source: Source,
): Doc {
  // Indented direction lines can become accessibility or rejected statements
  // at column one. Use the shared positive step for every body level, including
  // tabWidth zero (diagrams/agentflow.md, Direction and accessibility statements;
  // docs/agentflow.md, Indentation). The diagram boundary adapts Prettier's
  // indent commands to the same step.
  const bodyOptions = {
    ...options,
    tabWidth: significantIndentationWidth(options.tabWidth),
  }
  const node = path.node
  if (node.type === "AgentflowDiagram") {
    return withSignificantIndentation(
      printDiagram(path, bodyOptions, print, source, node),
      options,
    )
  }
  const classified = classifyAgentflowStatement(node)
  if (classified === null)
    throw new Error("prettier-plugin-mmd: an unexpected Agentflow node")
  if (classified.kind === "container")
    return printContainer(
      path,
      bodyOptions,
      print,
      source,
      classified.statement,
    )
  const statement = classified.statement
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
  diagram: AgentflowDiagram,
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
    agentflowBlockRules(source),
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
 * Prints a container: the `flow` or `global` line, the statements one level deeper,
 * and the `end` line.
 */
function printContainer(
  path: AstPath<MermaidAst>,
  options: ParserOptions<MermaidAst>,
  print: (path: AstPath<MermaidAst>) => Doc,
  source: Source,
  container: AgentflowFlowStatement | AgentflowGlobalStatement,
): Doc {
  const depth = depthOf(path)
  const headerEnd = findContainerHeaderEnd(source, container)
  const endKeyword = findEndKeyword(source, container)
  const block = printBlock(
    narrowPath(path, container.type).map(print, "body"),
    source,
    {
      statements: container.body,
      start: headerEnd,
      end: endKeyword.range[0],
      isTopLevel: false,
    },
    agentflowBlockRules(source),
  )
  const headerDoc = printAtoms(
    source,
    layoutContainerHeader(source, container, headerEnd),
    {
      statement: indentationOf(options, depth),
      continuation: indentationOf(options, depth + 1),
    },
  ).doc
  const header = openingLine(
    headerDoc,
    block,
    endsWithSpaceOrTab(source.text.slice(container.range[0], headerEnd)),
  )
  return printClosedBlock(header, block, endKeyword.value, depth, options)
}

/**
 * The block rules of an agentflow (see `BlockRules`): a container holds
 * statements, and a `;` of its own is dropped at the top level, where the
 * Db does not list it.
 */
function agentflowBlockRules(source: Source): BlockRules<AgentflowStatement> {
  return {
    kept: findAgentflowKeptLines(source),
    printedEnd: (statement) => findPrintedEnd(source, statement),
    holdsStatements: (statement) =>
      classifyAgentflowStatement(statement).kind === "container",
    isDroppedAtTopLevel: (statement) =>
      statement.type === "AgentflowEmptyStatement",
    keepsWhitespaceLineAfterComment: false,
    // A real comment after a separator needs no retained semicolon, unlike
    // flowchart's percent-as-vertex text (docs/agentflow.md, Comments).
    dropsSeparatorsBeforeComments: true,
    // Adding LF to an unclosed description would add value text, unlike
    // flowchart's closed-only blocks (docs/agentflow.md, Final newline).
    endsInsideValue: () => {
      let open = false
      walk(source.root.body, (node) => {
        if (node.type === "AgentflowAccDescrBlockStatement" && !node.closed)
          open = true
      })
      return open
    },
    keepsDirectiveLinesUnindented: false,
  }
}

/**
 * Reuse flowchart's null-style end rule: required whitespace can lie outside
 * the AST range (docs/agentflow.md, Trailing whitespace).
 */
function findPrintedEnd(source: Source, statement: AgentflowStatement): number {
  switch (statement.type) {
    case "AgentflowConnectorStatement":
      return statement.title === null && statement.data.length === 0
        ? findNamePrintedEnd(source, statement.name)
        : statement.range[1]
    case "AgentflowStyleStatement":
    case "AgentflowClassDefStatement":
    case "AgentflowLinkStyleStatement":
    case "AgentflowDefaultLinkStyleStatement": {
      return findStyleStatementEnd(source, statement)
    }
    default:
      return statement.range[1]
  }
}

/**
 * A global or unnamed flow has only its keyword; otherwise the last written
 * data block, title closer, or complete Name ends the heading. Unlike
 * flowchart, end/global never take LF (diagrams/agentflow.md, Shared units;
 * docs/agentflow.md, Containers and Names and headings).
 */
function findContainerHeaderEnd(
  source: Source,
  container: AgentflowFlowStatement | AgentflowGlobalStatement,
): number {
  if (
    container.type === "AgentflowGlobalStatement" ||
    container.name === null
  ) {
    return expectToken(
      findTokenStartingAt(source, container.range[0]),
      "the container keyword",
    ).range[1]
  }
  const lastData = container.data.at(-1)
  if (lastData !== undefined) return lastData.range[1]
  if (container.title !== null) return findTitleEnd(source, container.title)
  // Agentflow end/global take ASCII spaces and tabs only, never LF. Names
  // with erased click/empty parts keep their entire span and continuation
  // columns (diagrams/agentflow.md, Names; docs/agentflow.md, Names and headings).
  return findNamePrintedEnd(source, container.name)
}

/**
 * The level of the lines of the statement at `path`: 1 at the top level, one
 * more inside each container. Membership follows the AST; direction priority
 * still requires a positive body step (docs/agentflow.md, Indentation).
 */
function depthOf(path: AstPath<MermaidAst>): number {
  return (
    1 +
    path.ancestors.filter(
      (ancestor) => classifyAgentflowStatement(ancestor)?.kind === "container",
    ).length
  )
}
