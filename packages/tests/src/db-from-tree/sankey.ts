import type { EmbeddedValues } from "../mermaid.ts"
import { numberOrText } from "../summary-number.ts"
import type { DbSummary, JsonObject } from "../types.ts"
import { ConvertedText, readConvertedCharacters } from "./converted-text.ts"
import type {
  SankeyDiagram,
  SankeyIdentifier,
  SankeyLinkStatement,
  SankeyLiteral,
} from "./sankey-tree.ts"
import type { TextReplacement } from "./text-replacement.ts"
import { textReplacementOf } from "./text-replacement.ts"
import type { StringLiteral, TreeRoot } from "./tree.ts"
import { trimmed } from "./values.ts"

// docs/db-from-tree/sankey.md: the summary of the Db that a sankey tree
// denotes, in the form of `normalizeSankey()` of `@mmd-toolkit/tests`. The
// records are executed in source order, as mermaid.js executes them while it
// parses; each step names the paragraph of "Building the summary from the
// tree" that defines it. Every value is read in converted form (see
// `converted-text.ts`).

const LINE_FEED = "\n"
const QUOTE = '"'

/** The builder of the summary: the records are executed in source order. */
class SankeyDbBuilder {
  private readonly title: string

  /** The ids of the nodes, in the order in which they were first named. */
  private readonly nodes: string[] = []

  /** The ids in {@link nodes}, to find a node by its id. */
  private readonly nodeIds = new Set<string>()

  private readonly links: JsonObject[] = []

  /** The converted form of ranges of the source. */
  private readonly text: ConvertedText

  /** The replacement of characters that the configuration gives the texts that the Db keeps. */
  private readonly replace: TextReplacement

  public constructor(source: string, root: TreeRoot, embedded: EmbeddedValues) {
    this.text = new ConvertedText(readConvertedCharacters(source, root))
    this.replace = textReplacementOf(embedded.config)
    this.title = this.replace(embedded.title ?? "")
  }

  /** The summary of `diagram`. */
  public summaryOf(diagram: SankeyDiagram): DbSummary {
    for (const link of diagram.body) this.executeLink(link)
    return { title: this.title, nodes: this.nodes, links: this.links }
  }

  /** Links: names the source and then the target, and adds the link. */
  private executeLink(statement: SankeyLinkStatement): void {
    const source = this.nodeOf(this.idTextOf(statement.source))
    const target = this.nodeOf(this.idTextOf(statement.target))
    this.links.push({
      source,
      target,
      value: numberOrText(
        parseFloat(trimmed(this.valueTextOf(statement.value))),
      ),
    })
  }

  /** Nodes: the id of the node that `id` names, which the node list gets when it is new. */
  private nodeOf(id: string): string {
    const node = this.replace(id)
    if (!this.nodeIds.has(node)) {
      this.nodeIds.add(node)
      this.nodes.push(node)
    }
    return node
  }

  /**
   * Ids: the id that the text of a source or a target field gives: without the
   * whitespace at its ends, and each `""` as one `"`.
   */
  private idTextOf(field: SankeyIdentifier | StringLiteral): string {
    return trimmed(this.fieldTextOf(field)).replaceAll(QUOTE + QUOTE, QUOTE)
  }

  /** The text of a value field before it is read as a number. */
  private valueTextOf(field: SankeyLiteral | StringLiteral): string {
    return this.fieldTextOf(field)
  }

  /**
   * The converted form of a field: the content of a string without its quotes,
   * with each run of line feeds as one line feed, or the range of a name or a
   * value.
   */
  private fieldTextOf(
    field: SankeyIdentifier | SankeyLiteral | StringLiteral,
  ): string {
    if (field.type !== "StringLiteral") return this.text.of(field.range)
    const [start, end] = field.range
    return oneLineFeedForEachRun(
      this.text.of([start + 1, field.closed ? end - 1 : end]),
    )
  }
}

/** The text `text` with each run of line feeds as one line feed (`prepareTextForParsing()` of mermaid.js does so for the whole text). */
function oneLineFeedForEachRun(text: string): string {
  let result = ""
  for (const character of text) {
    if (character === LINE_FEED && result.endsWith(LINE_FEED)) continue
    result += character
  }
  return result
}

/**
 * docs/db-from-tree/sankey.md: the summary of the Db that the sankey tree
 * `diagram` of the source `source` denotes (see `dbFromTree()`).
 */
export function sankeyDbOf(
  source: string,
  root: TreeRoot,
  diagram: SankeyDiagram,
  embedded: EmbeddedValues,
): DbSummary {
  return new SankeyDbBuilder(source, root, embedded).summaryOf(diagram)
}
