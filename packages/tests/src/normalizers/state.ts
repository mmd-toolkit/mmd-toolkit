import type { DbSummary, JsonObject } from "../types.ts"
import { toJsonObject } from "./json.ts"

/**
 * One node of the layout data that `StateDB.getData()` builds: a state, a
 * region of a composite state, a note, or the group that holds a state and
 * its notes.
 */
interface StateNode {
  readonly id: string
  readonly shape: string
  readonly label?: string | string[]
  readonly description?: string[]
  readonly parentId?: string
  readonly dir?: string
  readonly position?: string
}

/** One edge of the layout data: a transition, or the line to a note. */
interface StateEdge {
  readonly start: string
  readonly end: string
  readonly label?: string
}

/**
 * The part of mermaid's `StateDB` (`diagrams/state/stateDb.ts`) that the
 * normalizer reads.
 */
interface StateDbLike {
  getData(): {
    nodes: StateNode[]
    edges: StateEdge[]
    direction: string
  }
  getStates(): Map<string, { classes?: string[]; styles?: string[] }>
  getClasses(): Map<string, { id: string; styles: string[] }>
  getLinks(): Map<unknown, { url: string; tooltip: string }>
  getDiagramTitle(): string
  getAccTitle(): string
  getAccDescription(): string
}

/** The shape of a note node, and of the group around a state and its notes. */
const NOTE_SHAPE = "note"
const NOTE_GROUP_SHAPE = "noteGroup"

/**
 * Summarizes a state Db (`stateDiagram`, for both `stateDiagram` and
 * `stateDiagram-v2`).
 *
 * The source is the layout data that the renderer draws (`getData()`), which
 * mermaid.js builds from the statements while parsing: each state once, with
 * its labels, its composite state or region, and the classes and styles that
 * apply to it. The statement tree and the table of top-level states are not
 * summarized: the tree keeps statements that change nothing (a `classDef`,
 * `class` or `style` inside a composite state, a floating note, `scale`), and
 * the table holds only the states of the top level.
 *
 * Kept, in the order of the layout data:
 *
 * - `states`: every node but notes, with its `id`, `shape`, `label` and
 *   `description`, the `classes` and `styles` that the table of states gives
 *   its id, the composite state or region it lies in (`parentId`), and the
 *   direction of a composite state or region (`dir`);
 * - `notes`: each note, with the state it belongs to, its `position` and its
 *   `text`;
 * - `transitions`: each transition, with its `start`, `end` and `label`;
 * - `classDefs`: the class definitions, with their `styles`;
 * - `links`: each click, with its state, `url` and `tooltip` as written;
 * - the direction the renderer uses, and the title and accessibility texts.
 *
 * Dropped:
 *
 * - The fields of the layout data used only for drawing: DOM ids, edge ids,
 *   padding, corner radii, `look`, label types and positions, the CSS class
 *   names mermaid.js adds, the palette slot of a composite state, the arrow
 *   markers, and the sizes `getData()` takes from the configuration.
 * - Values derived from kept ones: whether a node is a group (from `shape`),
 *   the styles of a node's classes (`cssCompiledStyles`, from `classDefs`),
 *   `classDefs[].textStyles` (from `styles`), and the group around a state and
 *   its notes (its label and position are those of the last note).
 *
 * mermaid.js gives the region after the last `--` of a composite state an id
 * made at random. It is recorded as `generated-region-1`,
 * `generated-region-2`, ... in the order of the nodes, wherever it appears
 * (in node ids, in the ids and labels of the start and end states of that
 * region, in `parentId` and in transitions).
 */
export function normalizeState(dbValue: unknown): DbSummary {
  const db = dbValue as StateDbLike
  const { nodes, edges, direction } = db.getData()
  const rename = generatedRegionRenamer(nodes)
  const noteIds = new Set(
    nodes.filter((node) => node.shape === NOTE_SHAPE).map((node) => node.id),
  )
  const tableOfStates = db.getStates()
  return {
    direction,
    title: db.getDiagramTitle(),
    accTitle: db.getAccTitle(),
    accDescr: db.getAccDescription(),
    states: nodes
      .filter(
        (node) => node.shape !== NOTE_SHAPE && node.shape !== NOTE_GROUP_SHAPE,
      )
      .map((node) => {
        const tableEntry = tableOfStates.get(node.id)
        return toJsonObject({
          id: rename(node.id),
          shape: node.shape,
          label:
            typeof node.label === "string" ? rename(node.label) : node.label,
          description: node.description,
          classes: tableEntry?.classes ?? [],
          styles: tableEntry?.styles ?? [],
          parentId:
            node.parentId === undefined ? undefined : rename(node.parentId),
          dir: node.dir,
        })
      }),
    notes: nodes
      .filter((node) => node.shape === NOTE_SHAPE)
      .map((note) => noteSummary(note, edges, rename)),
    transitions: edges
      .filter((edge) => !noteIds.has(edge.start) && !noteIds.has(edge.end))
      .map((edge) =>
        toJsonObject({
          start: rename(edge.start),
          end: rename(edge.end),
          label: edge.label,
        }),
      ),
    classDefs: [...db.getClasses().values()].map(({ id, styles }) => ({
      id,
      styles: [...styles],
    })),
    links: [...db.getLinks().entries()].map(([key, { url, tooltip }]) => ({
      state: linkedStateId(key),
      url,
      tooltip,
    })),
  }
}

/**
 * The summary of one note: the state at the other end of its line, and its
 * position and text.
 */
function noteSummary(
  note: StateNode,
  edges: readonly StateEdge[],
  rename: (text: string) => string,
): JsonObject {
  const line = edges.find(
    (edge) => edge.start === note.id || edge.end === note.id,
  )
  if (line === undefined || typeof note.label !== "string") {
    throw new TypeError(`normalizeState: note ${note.id} has no line or text`)
  }
  const state = line.start === note.id ? line.end : line.start
  return toJsonObject({
    state: rename(state),
    position: note.position,
    text: note.label,
  })
}

/**
 * The id of the state a click belongs to. The grammar passes the state
 * statement as the key of the map of links; the renderer reads its `id`.
 */
function linkedStateId(key: unknown): string {
  if (typeof key === "string") return key
  const { id } = key as { id?: unknown }
  if (typeof id !== "string") {
    throw new TypeError("normalizeState: a link has no state id")
  }
  return id
}

/**
 * Returns a function that replaces, in a text, each id that mermaid.js made
 * at random for the region after the last `--` of a composite state with
 * `generated-region-<number>`, numbered in the order of `nodes`. A region
 * made by a `--` has the id `divider-id-<number>`, from a counter; any other
 * node of shape `divider` is such a region.
 */
function generatedRegionRenamer(
  nodes: readonly StateNode[],
): (text: string) => string {
  const generated = nodes
    .filter((node) => node.shape === "divider" && !isCountedDividerId(node.id))
    .map((node) => node.id)
  return (text) =>
    generated.reduce(
      (renamed, id, index) =>
        renamed.split(id).join(`generated-region-${index + 1}`),
      text,
    )
}

/** Whether `id` is `divider-id-` followed by digits. */
function isCountedDividerId(id: string): boolean {
  const prefix = "divider-id-"
  if (!id.startsWith(prefix)) return false
  const digits = id.slice(prefix.length)
  return (
    digits !== "" && [...digits].every((char) => char >= "0" && char <= "9")
  )
}
