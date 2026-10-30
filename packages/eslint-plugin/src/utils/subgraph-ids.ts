import type {
  FlowchartAccDescrBlockStatement,
  FlowchartStatement,
  FlowchartSubgraphStatement,
  Node,
  Range,
} from "@mmd-toolkit/parser"
import type { MermaidSourceCode } from "../source-code.ts"

// The Db id of a subgraph, from the tree (the tests package, docs/db-from-tree/
// flowchart.md, Building the summary from the tree, Subgraphs; the
// specification, ast/flowchart.md, FlowchartSubgraphStatement).
// The Db reads the name of a subgraph with the text after it, so the id depends
// on where the name text ends: `blocksInNameText` decides that once, and the
// id and the rule `flowchart-no-empty-description-block` both use it.

/** Whether `statement` is an empty `accDescr` block: closed, and without a value. */
export function isEmptyBlock(
  statement: FlowchartStatement,
): statement is FlowchartAccDescrBlockStatement {
  return (
    statement.type === "FlowchartAccDescrBlockStatement" &&
    statement.closed &&
    statement.value === null
  )
}

/** Whether `text` holds a whitespace character (common.md, Notation). */
export function holdsWhitespace(text: string): boolean {
  return [...text].some((character) => character.trim() === "")
}

/**
 * Whether a `;` or a line break lies between the end of `previous` and the
 * start of `next`, outside the directives there. An unclosed directive takes
 * the line breaks after it into the name text.
 */
function isSeparatedFrom(
  sourceCode: MermaidSourceCode,
  previous: Node,
  next: Node,
): boolean {
  const between = sourceCode.getTokensBetween(previous, next)
  if (
    between.some((token) => token.type === "Punctuator" && token.value === ";")
  ) {
    return true
  }
  const directives = sourceCode.ast.directives.filter(
    (directive) =>
      previous.range[1] <= directive.range[0] &&
      directive.range[1] <= next.range[0],
  )
  if (directives.some((directive) => !directive.closed)) return false
  const insideDirectives = directives.reduce(
    (lines, directive) =>
      lines + directive.loc.end.line - directive.loc.start.line,
    0,
  )
  return next.loc.start.line - previous.loc.end.line > insideDirectives
}

/**
 * The empty blocks that the Db reads into the name text of `subgraph`: for a
 * subgraph without a title, mermaid.js reads the text after the name up to the
 * end of the line or a `;`, apart from empty blocks and directives, as part of
 * the name. These are the empty blocks that follow the name in the body, each
 * on the line where the one before it ends, with no `;` between. A subgraph
 * with a title has none: its name ends at the `[`.
 */
export function blocksInNameText(
  sourceCode: MermaidSourceCode,
  subgraph: FlowchartSubgraphStatement,
): FlowchartAccDescrBlockStatement[] {
  const blocks: FlowchartAccDescrBlockStatement[] = []
  if (subgraph.title !== null) return blocks
  let previous: Node = subgraph.name
  for (const statement of subgraph.body) {
    if (!isEmptyBlock(statement)) break
    if (isSeparatedFrom(sourceCode, previous, statement)) break
    blocks.push(statement)
    previous = statement
  }
  return blocks
}

/**
 * The value of the name of `subgraph` without the whitespace after the name,
 * which the value of a name without a title holds: the whitespace at the end
 * of the tokens after the last string, directives apart. Whitespace inside a
 * string is part of the name.
 */
export function nameOwnText(
  sourceCode: MermaidSourceCode,
  subgraph: FlowchartSubgraphStatement,
): string {
  const { value } = subgraph.name
  const tokens = sourceCode.getTokens(subgraph.name)
  let trailing = 0
  for (const token of tokens.toReversed()) {
    if (token.type === "Directive") continue
    if (token.type !== "RawText") break
    const content = token.value.trimEnd()
    trailing += token.value.length - content.length
    if (content !== "") break
  }
  return value.slice(0, value.length - trailing)
}

/**
 * The text of the source in `range`, without the directives and the comments
 * in it, which belong to no text.
 */
function textWithoutDirectivesAndComments(
  sourceCode: MermaidSourceCode,
  range: Range,
): string {
  const cut: Range[] = [
    ...sourceCode.ast.directives,
    ...sourceCode.ast.comments,
  ]
    .map((element): Range => element.range)
    .filter((cutRange) => range[0] <= cutRange[0] && cutRange[1] <= range[1])
    .sort((a, b) => a[0] - b[0])
  let text = ""
  let offset = range[0]
  for (const [start, end] of cut) {
    text += sourceCode.text.slice(offset, start)
    offset = end
  }
  return text + sourceCode.text.slice(offset, range[1])
}

/**
 * Whether the name text of `subgraph` holds whitespace. Without a title, the
 * value of the name holds the whitespace after the name up to its separator or
 * the first empty block. The whitespace between the blocks of
 * `blocksInNameText`, and between the last of them and a `;`, belongs to no
 * token; the Db reads it from the source. The whitespace after the last block,
 * at the end of its line, is read as a line feed and is no part of the name
 * text.
 */
function nameTextHoldsWhitespace(
  sourceCode: MermaidSourceCode,
  subgraph: FlowchartSubgraphStatement,
): boolean {
  if (holdsWhitespace(subgraph.name.value)) return true
  const blocks = blocksInNameText(sourceCode, subgraph)
  return blocks.some((block, index) => {
    const next = blocks[index + 1]
    if (next !== undefined) {
      return holdsWhitespace(
        textWithoutDirectivesAndComments(sourceCode, [
          block.range[1],
          next.range[0],
        ]),
      )
    }
    const after = sourceCode.getTokenAfter(block, {
      filter: (token) => token.type !== "Directive",
    })
    if (after?.type !== "Punctuator" || after.value !== ";") return false
    return holdsWhitespace(
      textWithoutDirectivesAndComments(sourceCode, [
        block.range[1],
        after.range[0],
      ]),
    )
  })
}

/**
 * The Db id of every subgraph of the diagram, in the form of the values of the
 * tree. The id is the name text, trimmed; when the subgraph has no title and
 * its name text holds whitespace, it is `subGraph` followed by the number of
 * subgraphs added before it. A subgraph is added after the subgraphs in its
 * body.
 */
export function subgraphIdsOf(
  sourceCode: MermaidSourceCode,
): ReadonlyMap<FlowchartSubgraphStatement, string> {
  const ids = new Map<FlowchartSubgraphStatement, string>()
  const { body } = sourceCode.ast
  if (body.type !== "FlowchartDiagram") return ids

  /** Adds the subgraphs among `statements` and in their bodies. */
  function addSubgraphs(statements: readonly FlowchartStatement[]): void {
    for (const statement of statements) {
      if (statement.type !== "FlowchartSubgraphStatement") continue
      addSubgraphs(statement.body)
      const generated =
        statement.title === null &&
        nameTextHoldsWhitespace(sourceCode, statement)
      ids.set(
        statement,
        generated ? `subGraph${ids.size}` : statement.name.value.trim(),
      )
    }
  }

  addSubgraphs(body.body)
  return ids
}
