import type { AstPath, Doc, ParserOptions } from "prettier"
import type {
  ClassDeclaration,
  ClassDiagram,
  ClassMember,
  ClassNamespaceStatement,
  ClassStatement,
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
import { findClassKeptLines } from "./class-kept-lines.ts"
import {
  classifyClassStatement,
  findClassPrintedEnd,
  findMemberBraces,
  hasMemberBlock,
  layoutBlockOpening,
  layoutClassHeader,
  layoutClassStatement,
} from "./class-layout.ts"
import { expectToken, expectValue } from "./layout.ts"
import { indentationOf, printAsWritten } from "./lines.ts"
import type { Source } from "./source.ts"
import {
  findTokenEndingBefore,
  findTokenStartingAt,
  findTokensBetween,
  isStructural,
} from "./source.ts"

/**
 * Prints the body of a class diagram and the nodes below it, to the end of
 * the text (docs/class.md).
 *
 * Each statement stands on a line of its own, one level deeper than the
 * header or the line that opens its namespace. The member lines of a class
 * stand one level deeper than the line of the class, and the `}` that
 * closes a namespace or a member body stands on a line of its own, at the
 * level of the line that opens it. The rest is as in a flowchart: comments
 * and directives on lines of their own stand at the level of the
 * statements around them, runs of empty lines become one, and empty lines
 * at the start and the end of a block are dropped (see `printBlock`).
 */
export function printClass(
  path: AstPath<MermaidAst>,
  options: ParserOptions<MermaidAst>,
  print: (path: AstPath<MermaidAst>) => Doc,
  source: Source,
): Doc {
  const node = path.node
  switch (node.type) {
    case "ClassDiagram":
      return printDiagram(path, options, print, source, node)
    case "ClassMethod":
    case "ClassAttribute":
    case "ClassAnnotation":
      // A member line of a body, kept as written (docs/class.md, Member
      // lines).
      return printAsWritten(source, node.range[0], node.range[1])
    default:
      break
  }
  const classified = classifyClassStatement(node)
  if (classified === null) {
    throw new Error(
      `prettier-plugin-mmd: ${node.type} is no node of a class diagram that is printed`,
    )
  }
  const depth = depthOf(path)
  switch (classified.kind) {
    case "namespace":
      return printNamespace(
        path,
        options,
        print,
        source,
        classified.statement,
        depth,
      )
    case "declaration":
      if (hasMemberBlock(source, classified.statement)) {
        return printMemberBlock(
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
        layoutClassStatement(
          source,
          classified.statement,
          findClassPrintedEnd(source, classified.statement),
        ),
        depth,
      )
    case "simple":
      return printLine(
        source,
        options,
        layoutClassStatement(
          source,
          classified.statement,
          findClassPrintedEnd(source, classified.statement),
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
  diagram: ClassDiagram,
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
    classBlockRules(source),
  )
  const header = openingLine(
    printLine(source, options, layoutClassHeader(source, keyword), 0),
    block,
    false,
  )
  return printDiagramBlock(source, header, block, options)
}

/**
 * Prints a namespace: its keyword, name, and label with its `{`, its
 * statements one level deeper, and its `}` (docs/class.md, Indentation).
 */
function printNamespace(
  path: AstPath<MermaidAst>,
  options: ParserOptions<MermaidAst>,
  print: (path: AstPath<MermaidAst>) => Doc,
  source: Source,
  statement: ClassNamespaceStatement,
  depth: number,
): Doc {
  const opening = findNamespaceOpening(source, statement)
  const closing = findClosingBrace(source, statement)
  const block = printBlock<ClassStatement>(
    path.map(print, "body" as never),
    source,
    {
      statements: statement.body,
      start: opening.range[1],
      end: closing.range[0],
      isTopLevel: false,
    },
    classBlockRules(source),
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

/**
 * Prints a class statement with its member body: the line of the class with
 * its `{`, the member lines one level deeper, each as written, and the `}`
 * (docs/class.md, Member bodies).
 */
function printMemberBlock(
  path: AstPath<MermaidAst>,
  options: ParserOptions<MermaidAst>,
  print: (path: AstPath<MermaidAst>) => Doc,
  source: Source,
  statement: ClassDeclaration,
  depth: number,
): Doc {
  const { opening, closing } = findMemberBraces(source, statement)
  const block = printBlock<ClassMember>(
    path.map(print, "members" as never),
    source,
    {
      statements: statement.members ?? [],
      start: opening.range[1],
      end: closing.range[0],
      isTopLevel: false,
    },
    memberBlockRules(source),
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

/**
 * The `{` that opens the body of a namespace: the first after its name, and
 * after the `]` of its label when it has one.
 */
function findNamespaceOpening(
  source: Source,
  statement: ClassNamespaceStatement,
): Token {
  const opening = expectToken(
    findTokensBetween(
      source,
      (statement.label ?? statement.name).range[1],
      statement.range[1],
    ).find((token) => isStructural(source, token) && token.value === "{"),
    "the `{` of a namespace",
  )
  return opening
}

/** The `}` that closes a namespace: its last token. */
function findClosingBrace(
  source: Source,
  statement: ClassNamespaceStatement,
): Token {
  const closing = expectToken(
    findTokenEndingBefore(source, statement.range[1]),
    "the `}` of a namespace",
  )
  expectValue(closing, "}")
  return closing
}

/**
 * The block rules of the statements of a class diagram (see `BlockRules`):
 * a namespace and a class statement with a member block hold lines of
 * their own, no statement is dropped, and a line of only whitespace after a
 * comment that follows a statement is kept (docs/class.md, Comments).
 */
function classBlockRules(source: Source): BlockRules<ClassStatement> {
  return {
    kept: findClassKeptLines(source),
    printedEnd: (statement) => findClassPrintedEnd(source, statement),
    holdsStatements: (statement) => {
      const classified = classifyClassStatement(statement)
      return (
        classified.kind === "namespace" ||
        (classified.kind === "declaration" &&
          hasMemberBlock(source, classified.statement))
      )
    },
    isDroppedAtTopLevel: () => false,
    keepsWhitespaceLineAfterComment: true,
    keepsDirectiveLinesUnindentedAfterBareMarker: true,
  }
}

/**
 * The block rules of the member lines of a body: each ends at its last
 * token, and none holds others or is dropped. A `%%` on a member line is a
 * character of the member (diagrams/class.md, The member context), so no
 * comment follows a member.
 */
function memberBlockRules(source: Source): BlockRules<ClassMember> {
  return {
    kept: findClassKeptLines(source),
    printedEnd: (member) => member.range[1],
    holdsStatements: () => false,
    isDroppedAtTopLevel: () => false,
    keepsWhitespaceLineAfterComment: false,
    keepsDirectiveLinesUnindentedAfterBareMarker: false,
  }
}

/**
 * The level of the lines of the statement at `path`: 1 at the top level,
 * one more inside each namespace.
 */
function depthOf(path: AstPath<MermaidAst>): number {
  return (
    1 +
    path.ancestors.filter(
      (ancestor) => classifyClassStatement(ancestor)?.kind === "namespace",
    ).length
  )
}
