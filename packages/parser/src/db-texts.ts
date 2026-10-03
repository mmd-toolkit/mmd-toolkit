import type { Node, Range, Root } from "./ast.ts"
import type { ClassName } from "./ast/class.ts"
import type {
  FlowchartClassDefStatement,
  FlowchartDefaultLinkStyleStatement,
  FlowchartLinkStyleStatement,
  FlowchartStyleStatement,
  FlowchartSubgraphStatement,
} from "./ast/flowchart.ts"
import type { SequenceBoxText, SequenceTitleStatement } from "./ast/sequence.ts"
import type {
  StateAliasDefinitionStatement,
  StateNoteStatement,
} from "./ast/state.ts"
import { lexClass } from "./diagrams/class/index.ts"
import { lexFlowchart } from "./diagrams/flowchart/index.ts"
import { subgraphNameTextOf } from "./diagrams/flowchart/subgraph-ids.ts"
import { lexSequence } from "./diagrams/sequence/index.ts"
import { lexState } from "./diagrams/state/index.ts"
import type { DiagramUnit } from "./diagram-units.ts"
import { emptyDescriptionBlocksIn } from "./empty-forms.ts"
import { openSource } from "./parse.ts"
import { traverseNodes } from "./traverse.ts"

// The texts that the Db of mermaid.js reads as a value where they reach past
// the range of the value's node: the whitespace around a value, a value that
// is all whitespace and has no node, and the `;` that the line rule ignores
// in between. Each diagram's Db normalization (diagrams/<diagram>.md) says
// where it reads them; the functions here hold that in one place for the
// tools that keep such a text as written and for the tests that build the
// Db. They give the range only; reading the text in converted form, and
// what the Db does with it afterwards (dropping whitespace, adding a line
// feed), stay with the Db.

/**
 * A text that mermaid.js reads as a value: the text of a range (ast.md,
 * Nodes), from `range`, which leaves out the directives, the comment
 * regions, the `;` that the line rule ignores, and the empty description
 * blocks before the separator of a statement, each a statement of its own,
 * and also leaves out what a diagram's Db names for that value.
 */
export interface DbText {
  /** Where mermaid.js starts and stops reading the value. */
  readonly range: Range
  /**
   * Of what the value leaves out, the parts that the source alone does not
   * show and that `range` holds: the empty description blocks before the
   * separator of a statement, and the delimiters of a string that a
   * subgraph name starts with (Subgraphs). The directives, the comment
   * regions, and the `;` that the line rule ignores are not listed: they
   * follow from the source (`ignoredSemicolons` gives the last).
   */
  readonly leftOut: readonly Range[]
}

/** The texts of a flowchart that its Db reads past the range of a value node. */
export interface FlowchartDbTexts {
  /**
   * diagrams/flowchart.md, Building the summary from the tree, Style
   * statements: the Db text of each style of a statement with styles,
   * null styles included, in the order of `styles`.
   */
  readonly styles: ReadonlyMap<
    | FlowchartStyleStatement
    | FlowchartClassDefStatement
    | FlowchartLinkStyleStatement
    | FlowchartDefaultLinkStyleStatement,
    readonly DbText[]
  >
  /**
   * diagrams/flowchart.md, Building the summary from the tree, Subgraphs:
   * the name text of each subgraph, whose leftOut also holds the delimiters
   * of a string that the name starts with.
   */
  readonly subgraphNameTexts: ReadonlyMap<FlowchartSubgraphStatement, DbText>
}

/** The texts of a sequence diagram that its Db reads past the range of a value node. */
export interface SequenceDbTexts {
  /**
   * diagrams/sequence.md, Titles: the text of the `title-text` unit of
   * each title statement, whitespace included. The range starts where the
   * unit starts; between the keyword and it lie the one whitespace
   * character that the statement context reads after `title` or `title:`
   * (rules 13 and 14), which is a line feed when the text is on the next
   * line, and the directives and comment regions there.
   */
  readonly titles: ReadonlyMap<SequenceTitleStatement, DbText>
}

/** The texts of a class diagram that its Db reads past the range of a value node. */
export interface ClassDbTexts {
  /** diagrams/class.md, Names: the text between the two `~` of each class name with a generic type, also when it is all whitespace. */
  readonly genericTypes: ReadonlyMap<ClassName, DbText>
}

/** The texts of a state diagram that its Db reads past the range of a value node. */
export interface StateDbTexts {
  /**
   * diagrams/state.md, Building the summary from the tree, The walk: the
   * second description of each alias statement with a `:` and without a
   * body, the text between the `:` and the second `:` or the end, also when
   * it is empty or all whitespace.
   */
  readonly secondDescriptions: ReadonlyMap<
    StateAliasDefinitionStatement,
    DbText
  >
  /**
   * diagrams/state.md, Building the summary from the tree: the text of
   * each note on one line from the end of its `note-id` to the end of its
   * `note-text`.
   */
  readonly noteTexts: ReadonlyMap<StateNoteStatement, DbText>
}

/**
 * The flowchart texts of the tree `root`, which `parse(text)` returned,
 * that its Db reads past the range of a value node; empty when the diagram
 * is no flowchart.
 */
export function flowchartDbTexts(root: Root, text: string): FlowchartDbTexts {
  const styles = new Map<
    | FlowchartStyleStatement
    | FlowchartClassDefStatement
    | FlowchartLinkStyleStatement
    | FlowchartDefaultLinkStyleStatement,
    DbText[]
  >()
  const subgraphNameTexts = new Map<FlowchartSubgraphStatement, DbText>()
  if (root.body.type !== "FlowchartDiagram") {
    return { styles, subgraphNameTexts }
  }
  const { lexer, frontmatter } = openSource(text)
  const { units } = lexFlowchart({
    lexer,
    frontmatter,
    diagramType: root.diagramType,
  })
  for (const node of nodesOf(root)) {
    switch (node.type) {
      case "FlowchartStyleStatement":
      case "FlowchartClassDefStatement":
      case "FlowchartLinkStyleStatement":
      case "FlowchartDefaultLinkStyleStatement":
        styles.set(node, styleDbTextsOf(root, units, node))
        break
      case "FlowchartSubgraphStatement":
        subgraphNameTexts.set(node, subgraphNameTextOf(units, node.name))
        break
      default:
        break
    }
  }
  return { styles, subgraphNameTexts }
}

/**
 * diagrams/flowchart.md, Building the summary from the tree, Style
 * statements: the Db text of each style of `statement`, among the units
 * `units` of the diagram text: from the end of the `,` before it to the
 * start of the `,` after it; the first starts at the end of the `space`
 * unit that the rule of the statement reads before `styles`, and the last
 * ends at the separator of the statement. The `,` between the styles are
 * the `Punctuator` tokens `,` after that start, which the grammar records
 * only for the `,` that separate styles.
 */
function styleDbTextsOf(
  root: Root,
  units: readonly DiagramUnit<string>[],
  statement:
    | FlowchartStyleStatement
    | FlowchartClassDefStatement
    | FlowchartLinkStyleStatement
    | FlowchartDefaultLinkStyleStatement,
): DbText[] {
  // `linkStyle` with `interpolate` may have no styles.
  if (statement.styles.length === 0) return []
  const separator = separatorAfter(units, statement.range[0])
  const firstStart = stylesStartOf(units, statement, separator)
  const commas = root.tokens.filter(
    (token) =>
      token.type === "Punctuator" &&
      token.value === "," &&
      firstStart <= token.range[0] &&
      token.range[1] <= statement.range[1],
  )
  return statement.styles.map((_style, index) => {
    const start = index === 0 ? firstStart : commas[index - 1].range[1]
    const end =
      index === statement.styles.length - 1 ? separator : commas[index].range[0]
    const range: Range = [start, end]
    return { range, leftOut: emptyDescriptionBlocksIn(units, range) }
  })
}

/**
 * diagrams/flowchart.md, Building the summary from the tree, Style
 * statements: where the Db text of the first style of `statement` starts,
 * the end of the `space` unit that the rule of the statement reads before
 * `styles`. The rules read the `space` units of a statement, other than
 * those in its styles, in this order: `style` and `classDef` one after the
 * keyword and one before `styles`; `linkStyle` one after the keyword, one
 * after the numbers or `default`, and, with `interpolate`, one after
 * `interpolate` and one after its name, before `styles`. The units are
 * looked for up to `separator`, the separator of the statement, not only
 * in its range: the range runs to the last token, and when the first style
 * is all whitespace, the `space` before it can lie after that token.
 */
function stylesStartOf(
  units: readonly DiagramUnit<string>[],
  statement:
    | FlowchartStyleStatement
    | FlowchartClassDefStatement
    | FlowchartLinkStyleStatement
    | FlowchartDefaultLinkStyleStatement,
  separator: number,
): number {
  const spacesBefore =
    (statement.type === "FlowchartLinkStyleStatement" ||
      statement.type === "FlowchartDefaultLinkStyleStatement") &&
    statement.interpolate !== null
      ? 4
      : 2
  const spaces = units.filter(
    (unit) =>
      unit.name === "space" &&
      statement.range[0] <= unit.start &&
      unit.start < separator,
  )
  const space = spaces.at(spacesBefore - 1)
  if (space === undefined) {
    throw new Error(
      `mmd-toolkit parser bug: no space before the styles of the statement at ${statement.range[0]}`,
    )
  }
  return space.end
}

/**
 * diagrams/flowchart.md, Diagram and statements: where the statement that
 * starts at `offset` ends, the start of the first `newline` or `;` unit at
 * or after `offset` among `units`, which is its separator; the lexer reads
 * the end of the text as a last `newline` unit.
 */
function separatorAfter(
  units: readonly DiagramUnit<string>[],
  offset: number,
): number {
  const separator = units.find(
    (unit) =>
      unit.start >= offset && (unit.name === "newline" || unit.name === ";"),
  )
  if (separator === undefined) {
    throw new Error(`mmd-toolkit parser bug: no separator after ${offset}`)
  }
  return separator.start
}

/**
 * The sequence texts of the tree `root`, which `parse(text)` returned,
 * that its Db reads past the range of a value node; empty when the diagram
 * is no sequence diagram.
 */
export function sequenceDbTexts(root: Root, text: string): SequenceDbTexts {
  const titles = new Map<SequenceTitleStatement, DbText>()
  if (root.body.type !== "SequenceDiagram") return { titles }
  const { lexer, frontmatter } = openSource(text)
  const { units } = lexSequence({
    lexer,
    frontmatter,
    diagramType: root.diagramType,
  })
  for (const node of nodesOf(root)) {
    if (node.type !== "SequenceTitleStatement") continue
    // Titles: the `title-text` unit after the keyword, which may lie on
    // the next line when a line feed follows `title`.
    const unit = units.find(
      (candidate) =>
        candidate.name === "title-text" && candidate.start > node.range[0],
    )
    if (unit === undefined) {
      throw new Error(
        `mmd-toolkit parser bug: no title text after ${node.range[0]}`,
      )
    }
    const range: Range = [unit.start, unit.end]
    titles.set(node, { range, leftOut: emptyDescriptionBlocksIn(units, range) })
  }
  return { titles }
}

/**
 * diagrams/sequence.md, Box colours: the text of each box that mermaid.js
 * splits into the colour candidate and the rest. It runs from the first unit
 * of the box text to where the line context that reads it ends, at the next
 * `#`, `;`, or line feed: the start of the first unit or diagram comment
 * after the last unit of the box text. That includes the whitespace at its
 * end, which the values of the tree leave out, such as a U+2028 or U+2029
 * that makes the box transparent and nameless. Empty when the diagram is no
 * sequence diagram. Not part of the public API: the Db of the tests reads
 * it.
 */
export function sequenceBoxTexts(
  root: Root,
  text: string,
): Map<SequenceBoxText, DbText> {
  const boxTexts = new Map<SequenceBoxText, DbText>()
  if (root.body.type !== "SequenceDiagram") return boxTexts
  const { lexer, frontmatter } = openSource(text)
  const { units, comments } = lexSequence({
    lexer,
    frontmatter,
    diagramType: root.diagramType,
  })
  for (const node of nodesOf(root)) {
    if (node.type !== "SequenceBoxText") continue
    // The units of the box text start in its range; a `text` unit ends
    // after it, with the whitespace at its end.
    const boxUnits = units.filter(
      (unit) =>
        (unit.name === "color-candidate" || unit.name === "text") &&
        node.range[0] <= unit.start &&
        unit.start < node.range[1],
    )
    const lastEnd = boxUnits.at(-1)?.end
    if (lastEnd === undefined) {
      throw new Error(
        `mmd-toolkit parser bug: no unit of the box text at ${node.range[0]}`,
      )
    }
    const nextUnit = units.find((unit) => unit.start >= lastEnd)
    const nextComment = comments.find((comment) => comment.range[0] >= lastEnd)
    const end = Math.min(
      nextUnit?.start ?? text.length,
      nextComment?.range[0] ?? text.length,
    )
    boxTexts.set(node, { range: [node.range[0], end], leftOut: [] })
  }
  return boxTexts
}

/**
 * The class texts of the tree `root`, which `parse(text)` returned, that
 * its Db reads past the range of a value node; empty when the diagram is no
 * class diagram.
 */
export function classDbTexts(root: Root, text: string): ClassDbTexts {
  const genericTypes = new Map<ClassName, DbText>()
  if (root.body.type !== "ClassDiagram") {
    return { genericTypes }
  }
  const { lexer, frontmatter } = openSource(text)
  const { units } = lexClass({
    lexer,
    frontmatter,
    diagramType: root.diagramType,
  })
  for (const node of nodesOf(root)) {
    if (node.type !== "ClassName") continue
    const generic = units.find(
      (unit) =>
        unit.name === "generic-text" &&
        node.range[0] <= unit.start &&
        unit.start < node.range[1],
    )
    if (generic !== undefined) {
      const range: Range = [generic.start, generic.end]
      genericTypes.set(node, { range, leftOut: [] })
    }
  }
  return { genericTypes }
}

/**
 * The state texts of the tree `root`, which `parse(text)` returned, that
 * its Db reads past the range of a value node; empty when the diagram is no
 * state diagram.
 */
export function stateDbTexts(root: Root, text: string): StateDbTexts {
  const secondDescriptions = new Map<StateAliasDefinitionStatement, DbText>()
  const noteTexts = new Map<StateNoteStatement, DbText>()
  if (root.body.type !== "StateDiagram") {
    return { secondDescriptions, noteTexts }
  }
  const { lexer, frontmatter } = openSource(text)
  const { units } = lexState({
    lexer,
    frontmatter,
    diagramType: root.diagramType,
  })
  for (const node of nodesOf(root)) {
    if (node.type === "StateAliasDefinitionStatement" && node.body === null) {
      const colon = unitIn(units, node.range, ":")
      if (colon === null) continue
      // A second description that is all whitespace lies after the range
      // of the statement, which ends at its last token; an empty one is
      // no unit, and its text is empty, at the end of the `:`.
      const second = units.at(colon.index + 1)
      const range: Range =
        second?.name === "second-description"
          ? [second.start, second.end]
          : [colon.end, colon.end]
      secondDescriptions.set(node, { range, leftOut: [] })
    }
    if (node.type === "StateNoteStatement") {
      const id = unitIn(units, node.range, "note-id")
      const noteText = id === null ? undefined : units.at(id.index + 2)
      if (id === null || noteText?.name !== "note-text") continue
      noteTexts.set(node, { range: [id.end, noteText.end], leftOut: [] })
    }
  }
  return { secondDescriptions, noteTexts }
}

/** The first of `units` named `name` that starts in `range`; null when there is none. */
function unitIn(
  units: readonly DiagramUnit<string>[],
  range: Range,
  name: string,
): DiagramUnit<string> | null {
  return (
    units.find(
      (unit) =>
        unit.name === name && range[0] <= unit.start && unit.start < range[1],
    ) ?? null
  )
}

/**
 * common.md, The `style` and `classDef` lines: the range of each `;` of
 * `text` that the line rule ignores, in source order.
 */
export function ignoredSemicolons(text: string): Range[] {
  const offsets: number[] = []
  for (const entry of openSource(text).lexer.lineEntries()) {
    if (entry.kind === "segment") offsets.push(...entry.ignoredSemicolons)
  }
  return offsets
    .sort((a, b) => a - b)
    .map((offset): Range => [offset, offset + 1])
}

/** Every node of the tree under `root`, in the order of a walk. */
function nodesOf(root: Root): Node[] {
  const nodes: Node[] = []
  traverseNodes(root, {
    enterNode(node) {
      nodes.push(node)
    },
    leaveNode() {
      // Nothing to do on the way back.
    },
  })
  return nodes
}
