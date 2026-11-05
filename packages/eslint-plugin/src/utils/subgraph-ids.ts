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

// A subgraph (or a flow) does not get a member that a subgraph before it has.
// This repeats the derivation of the Db, as `subgraph-ids.ts` does for ids:
// `addSubGraph`, `makeUniq`, `recordDroppedMembers`, and `isNestedIn` of
// https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L701-L818
// and `addSubGraph` and `addGlobal` of
// https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/agentflow/agentflowDb.ts#L1175-L1310

/** A subgraph or a flow, and the ids that its body lists. */
export interface Container<Statement> {
  readonly statement: Statement
  readonly id: string
  readonly listed: readonly string[]
}

/** A vertex of a group, for the ids of a statement. */
interface VertexOfGroup {
  readonly id: { readonly name: string }
}

/** The vertex ids of the groups of a statement, in source order. */
export function vertexIdsOf(
  statement: {
    readonly first: { readonly vertices: readonly VertexOfGroup[] }
    readonly links: readonly {
      readonly target: { readonly vertices: readonly VertexOfGroup[] }
    }[]
  },
  normalize: (name: string) => string,
): string[] {
  return [statement.first, ...statement.links.map((link) => link.target)]
    .flatMap((group) => group.vertices)
    .map((vertex) => normalize(vertex.id.name))
}

/**
 * The ids that each container lists but leaves to a container added before it:
 * the container that ends first keeps an id, and a container never loses an
 * id that it has already, to one inside it or to one with its own id.
 */
export function lostMembers<Statement>(
  containers: readonly Container<Statement>[],
): ReadonlyMap<Statement, ReadonlySet<string>> {
  const owners = new Map<string, string>()
  const lost = new Map<Statement, ReadonlySet<string>>()
  for (const { statement, id, listed } of containers) {
    const lostIds = new Set<string>()
    for (const member of listed) {
      if (member === id || member.trim() === "") continue
      const owner = owners.get(member)
      if (owner === undefined) owners.set(member, id)
      else if (owner !== id && !isUnder(owner, listed, owners)) {
        lostIds.add(member)
      }
    }
    lost.set(statement, lostIds)
  }
  return lost
}

/** Whether the container `id` is listed by, or at any depth under, a container that lists `listed`. */
function isUnder(
  id: string,
  listed: readonly string[],
  owners: ReadonlyMap<string, string>,
): boolean {
  const visited = new Set<string>()
  for (
    let current: string | undefined = id;
    current !== undefined && !visited.has(current);
    current = owners.get(current)
  ) {
    if (listed.includes(current)) return true
    visited.add(current)
  }
  return false
}

/**
 * The members that each subgraph of a flowchart loses to a subgraph that ended
 * before it. A subgraph lists the vertices of its statements and the ids of
 * the subgraphs directly in it.
 */
export function flowchartLostMembers(
  sourceCode: MermaidSourceCode,
): ReadonlyMap<FlowchartSubgraphStatement, ReadonlySet<string>> {
  const { body } = sourceCode.ast
  if (body.type !== "FlowchartDiagram") return new Map()
  const ids = subgraphIdsOf(sourceCode)
  const containers: Container<FlowchartSubgraphStatement>[] = []

  /** The ids that `statements` list, in source order. */
  function listedIn(statements: readonly FlowchartStatement[]): string[] {
    return statements.flatMap((statement) => {
      if (statement.type === "FlowchartVertexStatement") {
        return vertexIdsOf(statement, (name) => name)
      }
      if (statement.type === "FlowchartSubgraphStatement") {
        return [ids.get(statement) ?? ""]
      }
      return []
    })
  }

  /** Adds the subgraphs among `statements` after the subgraphs in their bodies. */
  function addSubgraphs(statements: readonly FlowchartStatement[]): void {
    for (const statement of statements) {
      if (statement.type !== "FlowchartSubgraphStatement") continue
      addSubgraphs(statement.body)
      containers.push({
        statement,
        id: ids.get(statement) ?? "",
        listed: listedIn(statement.body),
      })
    }
  }

  addSubgraphs(body.body)
  return lostMembers(containers)
}
