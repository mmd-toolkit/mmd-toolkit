import type { AstPath, Doc, ParserOptions } from "prettier"
import { builders } from "prettier/doc"
import type {
  ErAttribute,
  ErDiagram,
  ErEntityStatement,
  ErIgnoredText,
  ErStatement,
  ErSubgraphStatement,
  Token,
} from "@mmd-toolkit/ast"
import type { MermaidAst } from "../parser.ts"
import { printedToken } from "./spelling.ts"
import type { AtomLayout } from "./atoms.ts"
import { printAtoms } from "./atoms.ts"
import type { BlockRules } from "./blocks.ts"
import {
  openingLine,
  printBlock,
  printClosedBlock,
  printDiagramBlock,
} from "./blocks.ts"
import {
  findErClassNameGaps,
  findErKeptLines,
  isDirectionBroughtToTheColon,
  isNameWhitespace,
  followsSplitKeyword,
} from "./er-kept-lines.ts"
import {
  classifyErStatement,
  findAttributeBraces,
  findEmptyBlockClosingIndentation,
  findSubgraphHeaderEnd,
  hasAttributeBlock,
  isBlockAfterJoinedLine,
  keepsEmptyBlockLines,
  isEmptyAttributeBlock,
  touchesKeywordWithDash,
  layoutAttribute,
  layoutBlockOpening,
  layoutErStatement,
  layoutSubgraphOpening,
} from "./er-layout.ts"
import { expectToken, layoutKeywordHeader, toAsciiLowerCase } from "./layout.ts"
import { isFirstOnItsLine, lineEndOf, lineStartOf } from "./kept-lines.ts"
import { indentationOf, printAsWritten } from "./lines.ts"
import { narrowPath } from "./paths.ts"
import type { Source } from "./source.ts"
import {
  findTokenEndingBefore,
  findTokenStartingAt,
  findTriviaAt,
  isSpaceOrTab,
  isWhitespace,
  skipRemoved,
} from "./source.ts"

const { literalline } = builders

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
      if (keepsEmptyBlockLines(source, classified.statement)) {
        return printEmptyBlockOverLines(
          options,
          source,
          classified.statement,
          depth,
        )
      }
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
      break
    case "simple":
      break
    default:
      throw new Error(
        `prettier-plugin-mmd: unknown kind of statement ${JSON.stringify(classified satisfies never)}`,
      )
  }
  return printLine(
    source,
    options,
    layoutErStatement(source, classified.statement, node.range[1], depth > 1),
    depth,
  )
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
    narrowPath(path, diagram.type).map(print, "body"),
    source,
    {
      statements: diagram.body,
      start: keyword.range[1],
      end: source.text.length,
      isTopLevel: true,
    },
    statementBlockRules(source, indentationOf(options, 1)),
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
    narrowPath(path, statement.type).map(print, "body"),
    source,
    {
      statements: statement.body,
      start: headerEnd,
      end: closing.range[0],
      isTopLevel: false,
    },
    statementBlockRules(source, indentationOf(options, depth + 1)),
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
  return printClosedBlock(
    header,
    block,
    [
      printedToken(source, closing),
      printAsWritten(source, closing.range[1], printedErEnd(source, statement)),
    ],
    depth,
    options,
  )
}

/**
 * The end of the printed statement, including the whitespace characters that
 * are no space or tab (`isNameWhitespace`: a U+2028, a U+2029, a U+00A0, and
 * the others) after the `end` of a subgraph, through the last of them before a
 * comment or a directive, or no extension where another statement follows on
 * the line. The block consumes exactly what the closing prints, so a following
 * written gap cannot print them again. `end` followed by a U+2028 is the
 * keyword to the pinned lexer, and one name to a version that counts
 * (docs/er.md, Line separators).
 */
function printedErEnd(source: Source, statement: ErStatement): number {
  const from = statement.range[1]
  if (statement.type !== "ErSubgraphStatement") return from
  const lineEnd = lineEndOf(source, from)
  let end = from
  for (let position = from; position < lineEnd; position++) {
    position = skipRemoved(source, position)
    if (
      position >= lineEnd ||
      findTriviaAt(source, position)?.type === "Comment"
    )
      break
    const character = source.text.charAt(position)
    if (!isWhitespace(character)) return from
    if (isNameWhitespace(character)) end = position + 1
  }
  return end
}

/**
 * Prints an entity statement with its attribute block: the line of the
 * entity with its `{`, the attributes one level deeper, one on each line, and
 * the `}` (docs/er.md, Attribute blocks). An empty block over several lines,
 * which `hasAttributeBlock` takes for a block, is printed as `{ }` after the
 * line up to the `{`, whatever stands between the braces, as every empty block
 * is, also where its line stays as written, unless its lines stay over several
 * lines (`keepsEmptyBlockLines`, which `printEr` asks first; docs/er.md,
 * Attribute blocks and Multi-line statements).
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
  const opened = printLine(
    source,
    options,
    layoutBlockOpening(source, statement, opening),
    depth,
  )
  if (isEmptyAttributeBlock(source, statement)) {
    return [opened, " ", closing.value]
  }
  const block = printBlock<ErAttribute | ErIgnoredText>(
    narrowPath(path, statement.type).map(print, "attributes"),
    source,
    {
      statements: statement.attributes ?? [],
      start: opening.range[1],
      end: closing.range[0],
      isTopLevel: false,
    },
    attributeBlockRules(source),
  )
  return printClosedBlock(
    openingLine(opened, block, false),
    block,
    closing.value,
    depth,
    options,
  )
}

/**
 * Prints an entity statement whose empty attribute block stays over several
 * lines (see `keepsEmptyBlockLines`): spaces, tabs, and line feeds between the
 * braces become one line break before the `}` at the indentation of the entity.
 * Otherwise it stays as written, except that the `}` stands at that indentation
 * where only spaces and tabs precede it on its line (docs/er.md, Attribute
 * blocks).
 */
function printEmptyBlockOverLines(
  options: ParserOptions<MermaidAst>,
  source: Source,
  statement: ErEntityStatement,
  depth: number,
): Doc {
  const { opening, closing } = findAttributeBraces(source, statement)
  const between = source.text.slice(opening.range[1], closing.range[0])
  if (
    [...between].every(
      (character) => isSpaceOrTab(character) || character === "\n",
    )
  ) {
    return [
      printAsWritten(source, statement.range[0], opening.range[1]),
      literalline,
      indentationOf(options, depth),
      closing.value,
    ]
  }
  const indentation = findEmptyBlockClosingIndentation(source, statement)
  if (indentation === null) {
    return printAsWritten(source, statement.range[0], statement.range[1])
  }
  return [
    printAsWritten(source, statement.range[0], indentation[0]),
    indentationOf(options, depth),
    closing.value,
  ]
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
 * Whether a statement is an entity whose attribute block lies outside the line
 * that a joining region joins, and that stands after another statement on that
 * line: the line up to it is printed as written, and it is printed after the
 * gap before it as written, with its block as any entity does (see
 * `isBlockAfterJoinedLine`).
 */
function startsBlockAfterJoinedLine(
  source: Source,
  statement: ErStatement,
): boolean {
  return (
    statement.type === "ErEntityStatement" &&
    isBlockAfterJoinedLine(source, statement) &&
    !isFirstOnItsLine(source, statement.range[0])
  )
}

/**
 * The block rules of the statements of an ER diagram and of a subgraph (see
 * `BlockRules`): a subgraph and an entity statement with an attribute block
 * hold lines of their own, and no statement is dropped. A comment line is
 * the only comment of the diagram, and it takes no line break after it, so
 * no line of only whitespace is kept after one (docs/er.md, Comments). Where
 * a stretch is printed as written, the `}` of an empty attribute block stands
 * at `indentation`, the indentation of the statements of the block, as it does
 * where the statement is printed on its own (docs/er.md, Attribute blocks).
 */
function statementBlockRules(
  source: Source,
  indentation: string,
): BlockRules<ErStatement> {
  return {
    kept: findErKeptLines(source),
    printedEnd: (statement) => printedErEnd(source, statement),
    writtenReplacements: (statement) => {
      if (statement.type !== "ErEntityStatement") return []
      const range = findEmptyBlockClosingIndentation(source, statement)
      return range === null ? [] : [{ range, text: indentation }]
    },
    // An ignored `;` after `end` still needs the line's `style` and `:#`
    // trigger (diagrams/er.md, The statement context; docs/er.md,
    // Statements one per line).
    keptClosingJoin: " ",
    holdsStatements: (statement) => {
      const classified = classifyErStatement(statement)
      return (
        classified.kind === "subgraph" ||
        (classified.kind === "entity" &&
          hasAttributeBlock(source, classified.statement))
      )
    },
    writtenGapBefore: (statement) =>
      touchesKeywordWithDash(source, statement.range[0]) ||
      followsSplitKeyword(source, statement.range[0]) ||
      findErClassNameGaps(source).has(statement.range[0]) ||
      startsBlockAfterJoinedLine(source, statement),
    endsStretchBefore: (statement) =>
      startsBlockAfterJoinedLine(source, statement),
    isDroppedAtTopLevel: () => false,
    keepsWhitespaceLineAfterComment: false,
    keepsDirectiveLinesUnindented: false,
    keptIndentationOf: (statement) =>
      isDirectionBroughtToTheColon(source, statement)
        ? ""
        : source.text.slice(
            lineStartOf(source, statement.range[0]),
            statement.range[0],
          ),
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
