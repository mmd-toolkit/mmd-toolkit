import type { AstPath, Doc, ParserOptions } from "prettier"
import type {
  Node,
  SequenceDiagram,
  SequenceSection,
  SequenceStatement,
  Token,
} from "@mmd-toolkit/parser"
import type { MermaidAst } from "../parser.ts"
import { printAtoms } from "./atoms.ts"
import type { BlockRules, PrintedBlock } from "./blocks.ts"
import {
  openingLine,
  printBlock,
  printClosedBlock,
  printDiagramBlock,
} from "./blocks.ts"
import { expectToken } from "./layout.ts"
import type { Line } from "./lines.ts"
import { indentationOf } from "./lines.ts"
import { findSequenceKeptLines } from "./sequence-kept-lines.ts"
import type {
  SequenceBodyBlockStatement,
  SequenceSectionBlockStatement,
} from "./sequence-layout.ts"
import {
  classifySequenceStatement,
  findTitleText,
  layoutBlockHeader,
  layoutSequenceHeader,
  layoutSequenceStatement,
} from "./sequence-layout.ts"
import type { Source } from "./source.ts"
import { findTokenEndingBefore, findTokenStartingAt } from "./source.ts"

/**
 * Prints the body of a sequence diagram and the nodes below it, to the end
 * of the text (docs/sequence.md).
 *
 * Each statement stands on a line of its own, one level deeper than the
 * header or the line that opens its block. A block's `else`, `and`,
 * `option`, and `end` stand at the level of the block. The rest is as in a
 * flowchart: the `;` that separate statements are dropped, comments and
 * directives on lines of their own stand at the level of the statements
 * around them, runs of empty lines become one, and empty lines at the start
 * and the end of a block are dropped (see `printBlock`).
 */
export function printSequence(
  path: AstPath<MermaidAst>,
  options: ParserOptions<MermaidAst>,
  print: (path: AstPath<MermaidAst>) => Doc,
  source: Source,
): Doc {
  const node = path.node
  if (node.type === "SequenceDiagram") {
    return printDiagram(path, options, print, source, node)
  }
  const classified = classifySequenceStatement(node)
  if (classified === null) {
    throw new Error(
      `prettier-plugin-mmd: ${node.type} is no node of a sequence diagram that is printed`,
    )
  }
  switch (classified.kind) {
    case "body":
      return printBodyBlock(path, options, print, source, classified.statement)
    case "sections":
      return printSectionBlock(
        path,
        options,
        print,
        source,
        classified.statement,
      )
    case "simple": {
      const { statement } = classified
      const depth = depthOf(path)
      return printAtoms(
        source,
        layoutSequenceStatement(
          source,
          statement,
          findSequencePrintedEnd(source, statement),
        ),
        {
          statement: indentationOf(options, depth),
          continuation: indentationOf(options, depth + 1),
        },
      ).doc
    }
    default:
      throw new Error(
        `prettier-plugin-mmd: unknown kind of statement ${JSON.stringify(classified satisfies never)}`,
      )
  }
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
  diagram: SequenceDiagram,
): Doc {
  const keyword = expectToken(
    findTokenStartingAt(source, diagram.range[0]),
    "the header keyword",
  )
  const headerEnd = keyword.range[1]
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
    sequenceBlockRules(source),
  )
  const header = openingLine(
    printAtoms(source, layoutSequenceHeader(source, keyword), {
      statement: "",
      continuation: indentationOf(options, 1),
    }).doc,
    block,
    false,
  )
  return printDiagramBlock(source, header, block, options)
}

/**
 * Prints a block with one body: its keyword and text, its statements one
 * level deeper, and its `end` (docs/sequence.md, Blocks).
 */
function printBodyBlock(
  path: AstPath<MermaidAst>,
  options: ParserOptions<MermaidAst>,
  print: (path: AstPath<MermaidAst>) => Doc,
  source: Source,
  statement: SequenceBodyBlockStatement,
): Doc {
  const depth = depthOf(path)
  const text =
    statement.type === "SequenceRectStatement"
      ? statement.color
      : statement.text
  const endKeyword = findEndKeyword(source, statement)
  const opened = openBlock(
    source,
    options,
    path.map(print, "body" as never),
    statement.body,
    { start: statement.range[0], text, end: endKeyword.range[0] },
    depth,
  )
  return printClosedBlock(
    opened.header,
    opened.block,
    endKeyword.value,
    depth,
    options,
  )
}

/**
 * Prints a block of sections: each section's keyword and text, its
 * statements one level deeper, and the block's `end` (docs/sequence.md,
 * Blocks). Each section is closed by the next one, and the last by `end`,
 * all at the level of the block.
 */
function printSectionBlock(
  path: AstPath<MermaidAst>,
  options: ParserOptions<MermaidAst>,
  print: (path: AstPath<MermaidAst>) => Doc,
  source: Source,
  statement: SequenceSectionBlockStatement,
): Doc {
  const depth = depthOf(path)
  const endKeyword = findEndKeyword(source, statement)
  const { sections } = statement
  const opened = path.map(
    (sectionPath, index) => {
      const section = sectionPath.node as SequenceSection
      return openBlock(
        source,
        options,
        sectionPath.map(print, "body" as never),
        section.body,
        {
          start: section.range[0],
          text: section.text,
          end: sections[index + 1]?.range[0] ?? endKeyword.range[0],
        },
        depth,
      )
    },
    // AstPath<MermaidAst> takes only field names that every node type of
    // the union has; the node here is a block of sections.
    "sections" as never,
  )
  let closing: Doc = endKeyword.value
  for (const { header, block } of [...opened].reverse()) {
    closing = printClosedBlock(header, block, closing, depth, options)
  }
  return closing
}

/** Where the line that opens a block lies, and its text. */
interface BlockOpening {
  /** The start of its keyword. */
  readonly start: number
  /** The text after the keyword, or null. */
  readonly text: Node | null
  /** The start of what closes the block: the next section, or `end`. */
  readonly end: number
}

/**
 * The line that opens a block or a section, and the block of its
 * statements, at `depth`.
 */
function openBlock(
  source: Source,
  options: ParserOptions<MermaidAst>,
  docs: readonly Doc[],
  statements: readonly SequenceStatement[],
  opening: BlockOpening,
  depth: number,
): { readonly header: Line; readonly block: PrintedBlock } {
  const keyword = expectToken(
    findTokenStartingAt(source, opening.start),
    "the keyword of a block",
  )
  const headerEnd = opening.text?.range[1] ?? keyword.range[1]
  const block = printBlock(
    docs,
    source,
    { statements, start: headerEnd, end: opening.end, isTopLevel: false },
    sequenceBlockRules(source),
  )
  const header = openingLine(
    printAtoms(
      source,
      layoutBlockHeader(source, opening.start, headerEnd, opening.text),
      {
        statement: indentationOf(options, depth),
        continuation: indentationOf(options, depth + 1),
      },
    ).doc,
    block,
    false,
  )
  return { header, block }
}

/**
 * The block rules of a sequence diagram (see `BlockRules`): the blocks and
 * boxes hold statements, and no statement is dropped.
 */
function sequenceBlockRules(source: Source): BlockRules<SequenceStatement> {
  return {
    kept: findSequenceKeptLines(source),
    printedEnd: (statement) => findSequencePrintedEnd(source, statement),
    holdsStatements: (statement) =>
      classifySequenceStatement(statement).kind !== "simple",
    isDroppedAtTopLevel: () => false,
    keepsWhitespaceLineAfterComment: false,
  }
}

/**
 * Where the printed text of a statement ends: at its last token, except for
 * a title, whose text in the Db keeps the whitespace at its end (see
 * `findTitleText`).
 */
function findSequencePrintedEnd(
  source: Source,
  statement: SequenceStatement,
): number {
  if (statement.type !== "SequenceTitleStatement") return statement.range[1]
  return findTitleText(source, statement).end
}

/** The `end` keyword that closes a block: its last token. */
function findEndKeyword(source: Source, statement: Node): Token {
  const token = expectToken(
    findTokenEndingBefore(source, statement.range[1]),
    "the end of a block",
  )
  if (token.range[1] !== statement.range[1] || token.type !== "Keyword") {
    throw new Error(
      `prettier-plugin-mmd: the block at offset ${statement.range[0]} does not end with a keyword`,
    )
  }
  return token
}

/**
 * The level of the lines of the statement at `path`: 1 at the top level,
 * one more inside each block with one body and each section of a block of
 * sections (see `classifySequenceStatement`).
 */
function depthOf(path: AstPath<MermaidAst>): number {
  return (
    1 +
    path.ancestors.filter(
      (ancestor) =>
        ancestor.type === "SequenceSection" ||
        classifySequenceStatement(ancestor)?.kind === "body",
    ).length
  )
}
