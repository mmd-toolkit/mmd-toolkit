import type {
  AgentflowFlowStatement,
  AgentflowName,
  C4BoundaryStatement,
  C4ElementStatement,
  C4RelationshipStatement,
  FlowchartLabel,
  FlowchartSubgraphStatement,
  Node,
  Range,
} from "@mmd-toolkit/ast"
import type { Doc } from "prettier"
import { traverseNodes, visitorKeys } from "@mmd-toolkit/parser"
import type { Atom } from "./atoms.ts"
import type { TextEdit } from "./layout.ts"
import type { Source } from "./source.ts"
import { findCoveringRange, findTriviaBetween, isSpaceOrTab } from "./source.ts"
import { writtenWithRespellings } from "./spelling.ts"
import {
  blankTextSlots,
  c4ArgumentFields,
  c4NamedTextFields,
  c4TextFields,
  textSlots,
} from "./text-slots.ts"

const holdsProperty = new WeakMap<Source, boolean>()

/** Whether the text of the diagram holds `white-space`, in any case. */
export function holdsWhiteSpaceProperty(source: Source): boolean {
  let holds = holdsProperty.get(source)
  if (holds === undefined) {
    holds = source.text.toLowerCase().includes("white-space")
    holdsProperty.set(source, holds)
  }
  return holds
}

/**
 * The text with each run of spaces and tabs replaced by one space. mermaid.js
 * keeps the runs of a text in the Db and draws the text without them
 * (docs/compatibility.md, Runs of whitespace in a text that are drawn the
 * same).
 */
export function collapseRuns(text: string): string {
  let collapsed = ""
  let inRun = false
  for (const character of text) {
    if (isSpaceOrTab(character)) {
      if (!inRun) collapsed += " "
      inRun = true
    } else {
      collapsed += character
      inRun = false
    }
  }
  return collapsed
}

/**
 * The atom of a text with its runs of spaces and tabs printed as one space,
 * or the atom itself where it has none, or where the text is nothing but
 * spaces and tabs, or where the text stays as written (see
 * `staysAsWritten`), which a style that keeps the runs of a label can need
 * for every text of a diagram that holds `white-space`. An atom that has a
 * planned layout keeps it, with the runs of its text printed as one space.
 */
export function collapsedRunsAtom(
  source: Source,
  atom: Atom,
  options: { readonly printsBlankAsOne?: boolean } = {},
): Atom {
  const text = writtenWithRespellings(source, atom.start, atom.end)
  if (collapseRuns(text) === " ") {
    return options.printsBlankAsOne === true &&
      text !== " " &&
      atom.doc === undefined
      ? { ...atom, doc: " " }
      : atom
  }
  if (staysAsWritten(source, atom.start, atom.end)) return atom
  const doc = collapseDoc(atom.doc ?? text)
  return doc === (atom.doc ?? text) ? atom : { ...atom, doc }
}

/**
 * Whether the text at `[start, end)` stays as written: it holds a comment or a
 * directive, a line break, or a U+2028 or U+2029, which are characters of the
 * text and mark where a rule of mermaid.js reads the line, or a `<`, which may
 * start an HTML tag that keeps the whitespace (`<pre>`), or the diagram holds
 * `white-space`.
 */
export function staysAsWritten(
  source: Source,
  start: number,
  end: number,
): boolean {
  const text = source.text.slice(start, end)
  return (
    text.includes("<") ||
    holdsWhiteSpaceProperty(source) ||
    [...text].some(
      (character) =>
        character === "\n" ||
        character === "\r" ||
        character === "\u2028" ||
        character === "\u2029",
    ) ||
    findTriviaBetween(source, start, end).length > 0
  )
}

/**
 * The edits that print each run of spaces and tabs at `[start, end)` as one
 * space, or none where the text stays as written (see `collapsedRunsAtom`). A
 * layout that makes its own edits to a text uses them for the part of the text
 * that the atom-wide collapse cannot reach: a text that a directive ends.
 */
export function collapseRunEdits(
  source: Source,
  start: number,
  end: number,
): TextEdit[] {
  if (staysAsWritten(source, start, end)) return []
  const edits: TextEdit[] = []
  let position = start
  while (position < end) {
    if (!isSpaceOrTab(source.text[position])) {
      position++
      continue
    }
    let runEnd = position
    while (runEnd < end && isSpaceOrTab(source.text[runEnd])) runEnd++
    edits.push({ range: [position, runEnd], replacement: " " })
    position = runEnd
  }
  return edits
}

/**
 * The doc with the runs of spaces and tabs in its strings printed as one. It
 * reaches the strings and the arrays of the doc only, and not the contents of
 * its commands, which `utils.mapDoc` of `prettier/doc` would also reach: a
 * layout puts text that stays as written inside a command, such as the text
 * that a railroad-beta call ignores: `r = terminal(%%{!  }%% "a");` keeps both
 * spaces of `%%{!  }%%`, which `mapDoc` would print as one.
 */
function collapseDoc(doc: Doc): Doc {
  if (typeof doc === "string") {
    const collapsed = collapseRuns(doc)
    return collapsed === doc ? doc : collapsed
  }
  if (Array.isArray(doc)) {
    const parts = doc.map(collapseDoc)
    return parts.every((part, index) => part === doc[index]) ? doc : parts
  }
  return doc
}

/**
 * The fields of the nodes of a diagram that hold a text whose runs of spaces
 * and tabs are printed as one space, by the type of the node that has the
 * field (see `textSlots`).
 */
export type TextSlots = Readonly<Record<string, readonly string[]>>

interface Texts {
  /** The ranges of the texts, in source order and disjoint. */
  readonly ranges: readonly Range[]
  /**
   * The starts of the ranges where a text of spaces and tabs only is one
   * space.
   */
  readonly blanks: ReadonlySet<number>
}

const textsOfSource = new WeakMap<Source, Texts>()

/**
 * The texts of the tree that `textSlots` and `blankTextSlots` list: of two
 * nested texts, the outer one, and none over several lines, whose lines keep
 * their columns.
 */
function findTexts(source: Source): Texts {
  let texts = textsOfSource.get(source)
  if (texts === undefined) {
    const found: { range: Range; blank: boolean }[] = []
    collectTexts(source, source.root, found)
    found.sort((a, b) => a.range[0] - b.range[0] || b.range[1] - a.range[1])
    const ranges: Range[] = []
    const blanks = new Set<number>()
    for (const { range, blank } of found) {
      if (
        (ranges.length === 0 || range[0] >= ranges[ranges.length - 1][1]) &&
        !source.text.slice(range[0], range[1]).includes("\n")
      ) {
        ranges.push(range)
        if (blank) blanks.add(range[0])
      }
    }
    texts = { ranges, blanks }
    textsOfSource.set(source, texts)
  }
  return texts
}

/**
 * Records the ranges of the texts among the arguments of a C4 statement: a
 * string or a bare literal at the place of a text, and a named attribute of a
 * text at its own place (see `c4ArgumentFields`).
 */
function collectC4Texts(
  node: C4BoundaryStatement | C4ElementStatement | C4RelationshipStatement,
  found: { range: Range; blank: boolean }[],
): void {
  const fields = c4ArgumentFields[node.keyword]
  node.arguments.forEach((argument, index) => {
    const field = fields[index]
    if (argument === null || field === undefined) return
    if (
      (argument.type === "StringLiteral" || argument.type === "C4Literal") &&
      c4TextFields.has(field)
    ) {
      found.push({ range: argument.range, blank: false })
    } else if (
      argument.type === "C4NamedAttribute" &&
      c4NamedTextFields.has(field) &&
      argument.key?.value === field
    ) {
      found.push({ range: argument.value.range, blank: false })
    }
  })
}

interface SubgraphFacts {
  /** The ids that a data block (`S@{ … }`) is written for. */
  readonly dataIds: ReadonlySet<string>
  /** Whether a data block is written for an id that mermaid.js generates. */
  readonly generatedId: boolean
  /** Whether the diagram can draw the lanes of a swimlane diagram. */
  readonly swimlane: boolean
}

const subgraphFactsOfSource = new WeakMap<Source, SubgraphFacts>()

/**
 * What decides how mermaid.js draws the titles of the subgraphs of a diagram
 * (docs/compatibility.md, Runs of whitespace in a text that are drawn the
 * same): a data block written for the id of a subgraph (`S@{ view: collapsed }`
 * draws it as a collapsed group, and mermaid.js names a subgraph whose name
 * holds whitespace `subGraph0`, `subGraph1`, and so on), and a diagram that
 * names `swimlane`, which is the header of a swimlane diagram and the value of
 * the `layout` setting that draws the lanes of any flowchart; a setting can be
 * written in the frontmatter and in a directive.
 */
function findSubgraphFacts(source: Source): SubgraphFacts {
  let facts = subgraphFactsOfSource.get(source)
  if (facts === undefined) {
    const dataIds = new Set<string>()
    collectDataIds(source, source.root, dataIds)
    facts = {
      dataIds,
      generatedId: [...dataIds].some(isGeneratedSubgraphId),
      swimlane: source.text.toLowerCase().includes("swimlane"),
    }
    subgraphFactsOfSource.set(source, facts)
  }
  return facts
}

/** Whether the id is one that mermaid.js generates for a subgraph: `subGraph0`. */
function isGeneratedSubgraphId(id: string): boolean {
  const digits = id.slice("subGraph".length)
  return (
    id.startsWith("subGraph") &&
    digits.length > 0 &&
    [...digits].every((character) => character >= "0" && character <= "9")
  )
}

/** Records the ids of the vertices that carry a data block. */
function collectDataIds(source: Source, node: Node, ids: Set<string>): void {
  traverseNodes(node, {
    enterNode(item) {
      if (item.type === "FlowchartVertex" || item.type === "AgentflowVertex") {
        const data = (item as { readonly data?: unknown }).data
        if (Array.isArray(data) ? data.length > 0 : data != null) {
          ids.add(source.text.slice(...item.id.range))
        }
      }
    },
    leaveNode() {
      // The ids are collected on the way down.
    },
  })
}

/**
 * Records the range of the title of a subgraph, or of a flow of an agentflow
 * diagram, where mermaid.js draws it without a width: a title that is not a
 * markdown string, of a subgraph with no data block, in a diagram that does not
 * name `swimlane`. The three others, a markdown title, a collapsed group, and a
 * lane, pass the width of the subgraph to `createText`, which wraps the title
 * and draws its runs there.
 */
function collectSubgraphTexts(
  source: Source,
  node: AgentflowFlowStatement | FlowchartSubgraphStatement,
  found: { range: Range; blank: boolean }[],
): void {
  const facts = findSubgraphFacts(source)
  if (facts.swimlane || facts.generatedId) return
  const title =
    node.type === "FlowchartSubgraphStatement"
      ? (node.title ?? node.name)
      : node.title
  if (title === null || title.kind === "markdown") return
  if (node.type === "AgentflowFlowStatement" && node.data.length > 0) return
  if (node.name !== null && facts.dataIds.has(subgraphId(source, node.name))) {
    return
  }
  found.push({ range: title.range, blank: false })
}

/**
 * The id that mermaid.js reads from the name of a subgraph or of a flow: the
 * name without the whitespace at its ends, and the text between the quotes
 * where the name is a string or a markdown string (`"S"`, `" S "`, and
 * `"`S`"` are the id `S`).
 */
function subgraphId(
  source: Source,
  name: FlowchartLabel | AgentflowName,
): string {
  const label =
    name.type === "AgentflowName"
      ? name.parts.length === 1
        ? name.parts[0]
        : undefined
      : name
  return label !== undefined && label.kind !== "text"
    ? label.value.trim()
    : source.text.slice(...name.range).trim()
}

/** Records the ranges of the texts below `node` in the fields of the slots. */
function collectTexts(
  source: Source,
  node: Node,
  found: { range: Range; blank: boolean }[],
): void {
  if (
    node.type === "FlowchartSubgraphStatement" ||
    node.type === "AgentflowFlowStatement"
  ) {
    collectSubgraphTexts(source, node, found)
  }
  if (
    node.type === "C4BoundaryStatement" ||
    node.type === "C4ElementStatement" ||
    node.type === "C4RelationshipStatement"
  ) {
    collectC4Texts(node, found)
  }
  const fields = textSlots[node.type] ?? []
  const blankFields = blankTextSlots[node.type] ?? []
  for (const key of visitorKeys[node.type]) {
    const value = (node as unknown as Record<string, unknown>)[key]
    for (const child of Array.isArray(value) ? value : [value]) {
      if (child === null || child === undefined) continue
      const item = child as Node
      if (fields.includes(key)) found.push({ range: item.range, blank: false })
      else if (blankFields.includes(key))
        found.push({ range: item.range, blank: true })
      collectTexts(source, item, found)
    }
  }
}

/**
 * Whether the printer writes the runs of spaces and tabs of the text at
 * `[start, end)` as one space: the text lies in a text of `textSlots`, or of
 * the C4 and subgraph texts, and does not stay as written (see
 * `staysAsWritten`). A text of `blankTextSlots` keeps its inner runs. A
 * decision about the text, such as whether it is read the same without quotes,
 * is about the text as it is printed.
 */
export function printsRunsAsOne(
  source: Source,
  start: number,
  end: number,
): boolean {
  const { ranges, blanks } = findTexts(source)
  const text = findCoveringRange(ranges, start, end)
  return (
    text !== undefined &&
    !blanks.has(text[0]) &&
    !staysAsWritten(source, start, end)
  )
}

/**
 * The atoms with the runs of spaces and tabs of the texts printed as one
 * space, for the atoms that lie in a text of the slots: the atom of a text
 * may be the text without the whitespace that its range takes.
 */
export function collapseTextAtoms(
  source: Source,
  atoms: readonly Atom[],
): readonly Atom[] {
  const { ranges, blanks } = findTexts(source)
  if (ranges.length === 0) return atoms
  return atoms.map((atom) => {
    const text = findCoveringRange(ranges, atom.start, atom.end)
    return text === undefined
      ? atom
      : collapsedRunsAtom(source, atom, {
          printsBlankAsOne: blanks.has(text[0]),
        })
  })
}
