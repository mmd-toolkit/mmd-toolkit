import type { Range } from "../../ast.ts"
import type { FlowchartLabel } from "../../ast/flowchart.ts"
import { emptyFormsOf } from "../../empty-forms.ts"
import { holdsWhitespace, trimmed } from "./subgraph-members.ts"
import type { Unit, UnitName } from "./units.ts"

// diagrams/flowchart.md, Rejections outside the grammar, Subgraph members:
// how the id of a subgraph is made from its name, which the grammar reads
// for the members of a subgraph.

/** Subgraph members: the units that end the name text of a subgraph. */
const FOLLOWERS: readonly UnitName[] = ["[", "newline", ";"]

/** Subgraph members: whether `unit` is the unit after the name `name` that ends its name text. */
function endsNameText(unit: Unit, name: FlowchartLabel): boolean {
  return unit.start >= name.range[1] && FOLLOWERS.includes(unit.name)
}

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
 * Subgraph members: the name text of the subgraph name `name`, whose first
 * unit is `first` and whose value leaves out `delimiters`, the delimiters
 * of the string or markdown string that it starts with, among the units
 * `units` of the diagram text: the name's value, then the text up to the
 * first `[`, `newline`, or `;` unit after the name, as the text of a range
 * (ast.md, Nodes). The units are read from `first` to that unit.
 */
export function subgraphNameTextOf(
  units: readonly Unit[],
  name: FlowchartLabel,
  first: Unit,
  delimiters: readonly Range[],
): SubgraphNameText {
  let followerIndex = first.index
  while (
    followerIndex < units.length &&
    !endsNameText(units[followerIndex], name)
  ) {
    followerIndex += 1
  }
  const follower = units.at(followerIndex)
  if (follower === undefined) {
    throw new Error(
      `mmd-toolkit parser bug: nothing follows the subgraph name at ${name.range[0]}`,
    )
  }
  const blocks = emptyFormsOf(units.slice(first.index, followerIndex), [
    "empty-description-block",
  ]).map((block) => block.range)
  return {
    range: [name.range[0], follower.start],
    leftOut: [...delimiters, ...blocks],
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
