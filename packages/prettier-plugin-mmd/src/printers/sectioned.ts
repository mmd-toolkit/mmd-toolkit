import type { AstPath, Doc, ParserOptions } from "prettier"
import { builders } from "prettier/doc"
import type { Node, Token } from "@mmd-toolkit/parser"
import type { MermaidAst } from "../parser.ts"
import type { AtomLayout } from "./atoms.ts"
import { printAtoms } from "./atoms.ts"
import type { BlockRules } from "./blocks.ts"
import { openingLine, printBlock, printDiagramBlock } from "./blocks.ts"
import type { KeptLines } from "./kept-lines.ts"
import { expectToken } from "./layout.ts"
import { indentationOf } from "./lines.ts"
import type { Source } from "./source.ts"
import { findTokenStartingAt } from "./source.ts"

const { indent } = builders

/**
 * What differs between the diagram types whose body is a flat list of
 * statements that a `section` groups: a Gantt chart and a user journey. The
 * printer of such a diagram type is `printSectionedDiagram` with its own
 * `SectionedDiagram`.
 */
export interface SectionedDiagram<Statement extends Node> {
  /** What the diagram is called in a message: `Gantt chart`. */
  readonly name: string
  /** The statements of a diagram body, or null for any other node. */
  readonly statementsOf: (node: MermaidAst) => readonly Statement[] | null
  /** Whether a statement is a `section`. */
  readonly isSection: (statement: Statement) => boolean
  /** The kept lines of a source (see `KeptLines`). */
  readonly keptLines: (source: Source) => KeptLines
  /** Where the printed text of a statement ends (see `BlockRules`). */
  readonly printedEnd: (source: Source, statement: Statement) => number
  /**
   * The layout of the line of the header: the keyword, and what the header
   * holds after it, such as a direction.
   */
  readonly layoutHeader: (source: Source, keyword: Token) => AtomLayout
  /** The layout of a statement, up to `end`. */
  readonly layoutStatement: (
    source: Source,
    statement: Statement,
    end: number,
  ) => AtomLayout
  /**
   * Whether the comments that the diagram reads by the whitespace before them
   * stand after one whitespace character (see
   * `BlockRules.oneCharacterIndentation`).
   */
  readonly readsCommentsByWhitespaceBefore: boolean
  /**
   * Whether the whitespace before a directive on a line right after the
   * statement is read as its text (see
   * `BlockRules.readsDirectiveLineWhitespaceAfter`). Without it, no statement
   * is.
   */
  readonly readsDirectiveLineWhitespaceAfter?: (statement: Statement) => boolean
}

/**
 * Prints the body of a diagram whose statements a `section` groups, and the
 * nodes below it, to the end of the text (docs/gantt.md and docs/journey.md).
 *
 * Each statement stands on a line of its own, one level deeper than the
 * header, and the statements after a `section`, up to the next `section`, one
 * level deeper still: the tree is flat, so the levels come from the place of
 * a statement among the others. Comments and directives on lines of their own
 * stand at the level of the statement after them, and at the end of the text
 * at that of the last statement; runs of empty lines become one, and empty
 * lines at the start and the end of the body are dropped (see `printBlock`).
 *
 * The statements are printed here, with the statements that stand deeper
 * known, and not by `print` one by one.
 */
export function printSectionedDiagram<Statement extends Node>(
  diagram: SectionedDiagram<Statement>,
  path: AstPath<MermaidAst>,
  options: ParserOptions<MermaidAst>,
  source: Source,
): Doc {
  const statements = diagram.statementsOf(path.node)
  if (statements === null) {
    throw new Error(
      `prettier-plugin-mmd: ${path.node.type} is no node of a ${diagram.name} that is printed on its own`,
    )
  }
  const keyword = expectToken(
    findTokenStartingAt(source, path.node.range[0]),
    "the header keyword",
  )
  const headerLayout = diagram.layoutHeader(source, keyword)
  const deeper = findStatementsAfterSection(statements, diagram.isSection)
  const block = printBlock(
    statements.map((statement) =>
      printStatement(
        diagram,
        source,
        options,
        statement,
        deeper.has(statement),
      ),
    ),
    source,
    {
      statements,
      start: findLayoutEnd(headerLayout),
      end: source.text.length,
      isTopLevel: true,
    },
    statementBlockRules(diagram, source, options, deeper),
  )
  const header = openingLine(
    printLine(source, options, headerLayout, 0),
    block,
    false,
  )
  return printDiagramBlock(source, header, block, options)
}

/**
 * Where a layout ends: the end of its last atom. The statements of the body
 * start after the header, which holds more than the keyword where the header
 * has a direction.
 */
function findLayoutEnd(layout: AtomLayout): number {
  const last = layout.atoms.at(-1)
  if (last === undefined) {
    throw new Error("prettier-plugin-mmd: a header layout without atoms")
  }
  return last.end
}

/**
 * The statements that stand after a `section`, up to the end: one level
 * deeper than the statements before the first `section` and the `section`
 * statements themselves.
 */
function findStatementsAfterSection<Statement extends Node>(
  statements: readonly Statement[],
  isSection: (statement: Statement) => boolean,
): ReadonlySet<Statement> {
  const found = new Set<Statement>()
  let afterSection = false
  for (const statement of statements) {
    if (isSection(statement)) afterSection = true
    else if (afterSection) found.add(statement)
  }
  return found
}

/** Prints a statement on its lines, at the level that the section decides. */
function printStatement<Statement extends Node>(
  diagram: SectionedDiagram<Statement>,
  source: Source,
  options: ParserOptions<MermaidAst>,
  statement: Statement,
  isDeeper: boolean,
): Doc {
  const printed = printLine(
    source,
    options,
    diagram.layoutStatement(source, statement, statement.range[1]),
    isDeeper ? 2 : 1,
  )
  // The line breaks inside the statement stand at the level of the statement,
  // which is one more than the block's under a section; its first line gets
  // that from the line break before it (see `BlockRules.extraIndentationOf`).
  return isDeeper ? indent(printed) : printed
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
 * The block rules of the statements (see `BlockRules`): no statement holds
 * others or is dropped. A diagram comment takes the rest of its line and no
 * line break, so no line of only whitespace is kept after one
 * (docs/gantt.md, Comments).
 */
function statementBlockRules<Statement extends Node>(
  diagram: SectionedDiagram<Statement>,
  source: Source,
  options: ParserOptions<MermaidAst>,
  deeper: ReadonlySet<Statement>,
): BlockRules<Statement> {
  return {
    kept: diagram.keptLines(source),
    printedEnd: (statement) => diagram.printedEnd(source, statement),
    holdsStatements: () => false,
    isDroppedAtTopLevel: () => false,
    keepsWhitespaceLineAfterComment: false,
    keepsDirectiveLinesUnindented: false,
    extraIndentationOf: (statement) =>
      deeper.has(statement) ? indentationOf(options, 1) : "",
    readsDirectiveLineWhitespaceAfter:
      diagram.readsDirectiveLineWhitespaceAfter,
    oneCharacterIndentation: diagram.readsCommentsByWhitespaceBefore
      ? options.useTabs
        ? "\t"
        : " "
      : undefined,
  }
}
