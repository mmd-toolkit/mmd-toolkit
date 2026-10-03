import type { Range } from "../../ast.ts"
import type { FlowchartLabel } from "../../ast/flowchart.ts"
import { emptyDescriptionBlocksIn } from "../../empty-forms.ts"
import { holdsWhitespace, trimmed } from "./subgraph-members.ts"
import type { Unit } from "./units.ts"

// diagrams/flowchart.md, Rejections outside the grammar, Subgraph members:
// how the id of a subgraph is made from its name, which the grammar reads
// for the members of a subgraph.

/** Subgraph members: where the name text of a subgraph lies in the source. */
export interface SubgraphNameText {
  /** From the start of the name to what follows it, the `[` of its title or its separator. */
  readonly range: Range
  /**
   * What the name text leaves out of the range: the delimiters of the
   * string that the name starts with, and what the written text
   * leaves out besides the directives and the comment regions, the empty
   * description blocks in it (ast.md, Nodes).
   */
  readonly leftOut: readonly Range[]
}

/**
 * Subgraph members: the name text of the subgraph name `name`, among the units
 * `units` of the diagram text: the name's value, then the text up to the
 * first `[`, `newline`, or `;` unit after the name, without the delimiters
 * of the string or markdown string that the name starts with, as the text
 * of a range (ast.md, Nodes).
 */
export function subgraphNameTextOf(
  units: readonly Unit[],
  name: FlowchartLabel,
): SubgraphNameText {
  const follower = units.find(
    (unit) =>
      unit.start >= name.range[1] &&
      (unit.name === "[" || unit.name === "newline" || unit.name === ";"),
  )
  if (follower === undefined) {
    throw new Error(
      `mmd-toolkit parser bug: nothing follows the subgraph name at ${name.range[0]}`,
    )
  }
  const range: Range = [name.range[0], follower.start]
  const first = units.find((unit) => unit.start === name.range[0])
  const content = first?.content ?? null
  const delimiters: Range[] =
    first === undefined || content === null
      ? []
      : [
          [first.start, content[0]],
          [content[1], first.end],
        ]
  return {
    range,
    leftOut: [...delimiters, ...emptyDescriptionBlocksIn(units, range)],
  }
}

/**
 * Subgraph members: whether the Db id of a subgraph is a number instead of its
 * name text: when the subgraph has no title and its name text `nameText`
 * contains whitespace.
 */
export function isNumberedSubgraph(
  nameText: string,
  hasTitle: boolean,
): boolean {
  return !hasTitle && holdsWhitespace(nameText)
}

/**
 * Subgraph members: the Db id of a subgraph with the name text `nameText`: the
 * name text, trimmed, or, for a numbered subgraph, `subGraph` followed by
 * `number`, the number of subgraphs added before it.
 */
export function subgraphIdOf(
  nameText: string,
  hasTitle: boolean,
  number: number,
): string {
  return isNumberedSubgraph(nameText, hasTitle)
    ? `subGraph${number}`
    : trimmed(nameText)
}
