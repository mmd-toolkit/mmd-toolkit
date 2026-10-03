import type { Root } from "./ast.ts"
import type {
  FlowchartStatement,
  FlowchartSubgraphStatement,
} from "./ast/flowchart.ts"
import type { DbText } from "./db-texts.ts"
import { flowchartDbTexts } from "./db-texts.ts"
import { subgraphIdOf } from "./diagrams/flowchart/subgraph-ids.ts"
import { openSource } from "./parse.ts"
import type { SourceLexer } from "./source-lexer.ts"

/**
 * diagrams/flowchart.md, Db normalization, Subgraphs: the Db id of each
 * subgraph of the tree `root`, which `parse(text)` returned, by its
 * statement; empty when the diagram is no flowchart. An id is the name
 * text of the subgraph, trimmed, or `subGraph` followed by the number of
 * subgraphs added before it, when the subgraph has no title and its name
 * text contains whitespace; a nested subgraph is added before the one
 * around it.
 *
 * The id is in the form of the values of the tree: the text as written,
 * without directives and comments, not converted (ast.md, Nodes). The Db
 * of mermaid.js holds its converted form, with the entities, attribute
 * quotes, and line terminators of common.md converted. The source `text`
 * is needed because whitespace after the name, up to the end of its line,
 * makes the id a number, and no node or token holds it; the name text is
 * that of {@link flowchartDbTexts}.
 */
export function flowchartSubgraphIds(
  root: Root,
  text: string,
): ReadonlyMap<FlowchartSubgraphStatement, string> {
  const ids = new Map<FlowchartSubgraphStatement, string>()
  if (root.body.type !== "FlowchartDiagram") return ids
  const { lexer } = openSource(text)
  const { subgraphNameTexts } = flowchartDbTexts(root, text)
  addSubgraphIds(root.body.body, { lexer, subgraphNameTexts }, ids)
  return ids
}

/**
 * Adds to `ids` the Db id of each subgraph among `statements` and in their
 * bodies, in the order in which they are added to the Db: a subgraph after
 * the subgraphs in its body. The ids already in `ids` count as subgraphs
 * added before.
 */
function addSubgraphIds(
  statements: readonly FlowchartStatement[],
  source: {
    readonly lexer: SourceLexer
    readonly subgraphNameTexts: ReadonlyMap<FlowchartSubgraphStatement, DbText>
  },
  ids: Map<FlowchartSubgraphStatement, string>,
): void {
  for (const statement of statements) {
    if (statement.type !== "FlowchartSubgraphStatement") continue
    addSubgraphIds(statement.body, source, ids)
    const nameText = source.subgraphNameTexts.get(statement)
    if (nameText === undefined) {
      throw new Error(
        `mmd-toolkit parser bug: no name text for the subgraph at ${statement.range[0]}`,
      )
    }
    const [start, end] = nameText.range
    ids.set(
      statement,
      subgraphIdOf(
        source.lexer.textOfRange(start, end, nameText.leftOut),
        statement.title !== null,
        ids.size,
      ),
    )
  }
}
