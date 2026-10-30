import type { DbSummary, JsonObject, JsonValue } from "../types.ts"
import { numberOrText } from "../summary-number.ts"
import { ownProperties, toJsonObject } from "./json.ts"

/**
 * A block of mermaid's block diagram Db (`diagrams/block/blockTypes.ts`), as
 * far as the normalizer reads it. Every field may be missing: which ones a
 * block has depends on the statement that made it, and a statement that is an
 * edge chain makes a block with none.
 */
interface BlockLike {
  id?: string
  label?: string
  type?: string
  children?: BlockLike[]
  columns?: number
  width?: number
  widthInColumns?: number
  directions?: string[]
  classes?: string[]
  styles?: string[]
}

/** An edge of the Db: the block shape with the fields of a link. */
interface EdgeLike {
  start?: string
  end?: string
  label?: string
  thickness?: string
  pattern?: string
  arrowTypeStart?: string
  arrowTypeEnd?: string
  directions?: string[]
}

/**
 * The part of mermaid's block diagram Db (`diagrams/block/blockDB.ts`) that
 * the normalizer reads and the patch wraps. The Db is one object that every
 * block diagram shares, with its state in module variables; `clear()` resets
 * it before each parse.
 */
interface BlockDbLike {
  getBlocksFlat(): BlockLike[]
  getBlock(id: string): BlockLike | undefined
  getEdges(): EdgeLike[]
  getClasses(): Map<string, { id: string; styles: string[] }>
  // The methods that the patch wraps are properties, so that the patch can take
  // them out of the Db and put its own in their place.
  generateId: () => string
  clear: (...args: unknown[]) => unknown
}

/** The ids that `generateId()` gave since the last `clear()`, for each Db. */
const generatedIds: WeakMap<object, Set<string>> = new WeakMap()

/**
 * Summarizes the block diagram Db (`block`).
 *
 * Kept: `root`, the block that holds the diagram, and the lists `unplaced`,
 * `edges`, and `classes`.
 *
 * - A block is `{ id, label, type, ... }` with the fields it has, as the Db
 *   holds them: `widthInColumns` (the `:N` of a node, which an endpoint of an
 *   edge does not get), `width` (of a `space`, which is also the number of
 *   `space` blocks it makes), `directions` (of a block arrow, as the lexer
 *   read them, with the whitespace that follows a direction), `columns` (the
 *   last `columns` of a composite), `classes` (the class names that `class`
 *   gave it, in the order of the statements), and `styles` (the styles of the
 *   last `style` statement for it, split at each `,`). A composite has its
 *   `children`, the blocks of its own list in the order of the text; so has
 *   `root`, whose `children` is the diagram. A block has no `id` where the Db
 *   made it up (a `block` with no id, and every `space`).
 * - `root.columns` is `-1` where the diagram has no `columns` at its top level.
 * - `unplaced` lists the blocks that the Db holds in its table of blocks and
 *   that no list of children holds: the block that `class` made for an id
 *   that no statement had defined yet, or that it did not find because white
 *   space stands before it (`class A, B c`, which puts the new block in the
 *   table's entry of `B`); a later definition of the id takes the block, and it
 *   stays out of the diagram. The other unplaced blocks are those inside a
 *   composite whose id the Db had already. A block that another listed block
 *   holds in its `children` is listed there only. The order is that of the
 *   table.
 * - An edge is `{ start, end, label, thickness, pattern, arrowTypeStart,
 *   arrowTypeEnd }`, with `directions` where the block at its end is a block
 *   arrow. The edges are in the order of the text, nested ones included.
 * - A class is `{ id, styles }`, in the order of its first `classDef`, with the
 *   styles of every `classDef` of that id one after the other.
 *
 * Dropped:
 *
 * - `colorIndex` of a composite: the palette slot for the renderer, counted in
 *   the order of the composites.
 * - `textStyles` of a class: the styles that name a colour, written again for
 *   the renderer.
 * - `id` and `type` of an edge: the id is the number of the edge between the
 *   same two ids, with the two ids, and the type is always `edge`.
 * - `children` of a block that is not a composite and holds none (`[]`),
 *   `label` of a `space`
 *   (the id that the Db made up), and the table's own entry for each `space`
 *   statement (the `space` blocks hold its width).
 * - The fields `0`, `1`, and `2` of a composite whose `block:` is followed by
 *   an edge statement: the Db spreads the statement's list of three blocks into
 *   the composite, and nothing reads the fields.
 * - The layout (`size`, `intersect`, `node`) that the renderer fills in.
 *
 * The ids that `generateId()` makes are random, so the patch
 * ({@link patchBlockDb}) records them and the summary leaves them out.
 */
export function normalizeBlock(dbValue: unknown): DbSummary {
  const db = dbValue as BlockDbLike
  const generated = generatedIds.get(db)
  if (generated === undefined) {
    throw new TypeError(
      "normalizeBlock: the Db was not patched by patchBlockDb",
    )
  }
  const root = db.getBlock("root")
  if (root === undefined) {
    throw new TypeError("normalizeBlock: the Db has no root block")
  }
  const entries = db.getBlocksFlat().filter((block) => block !== root)
  // The blocks that a list of children holds, and the blocks that an
  // unplaced one holds.
  const placed = new Set<BlockLike>()
  collectChildren(root, placed)
  const unplaced = entries.filter(
    (block) => !placed.has(block) && !isSpaceStatement(block, generated),
  )
  const nested = new Set<BlockLike>()
  for (const block of unplaced) collectChildren(block, nested)
  return {
    root: blockSummary(root, generated, true),
    unplaced: unplaced
      .filter((block) => !nested.has(block))
      .map((block) => blockSummary(block, generated, false)),
    edges: db.getEdges().map(edgeSummary),
    classes: [...db.getClasses().values()].map((entry) =>
      toJsonObject({ id: entry.id, styles: entry.styles }),
    ),
  }
}

/** Adds the blocks that `block` holds in its lists of children, at any depth, to `found`. */
function collectChildren(block: BlockLike, found: Set<BlockLike>): void {
  for (const child of block.children ?? []) {
    found.add(child)
    collectChildren(child, found)
  }
}

/** Whether `block` is the entry that a `space` statement makes in the table (the blocks of its width are other entries). */
function isSpaceStatement(block: BlockLike, generated: Set<string>): boolean {
  return (
    block.type === "space" && block.id !== undefined && generated.has(block.id)
  )
}

/** A number the Db read from text, as a summary holds it. */
function numberSummary(value: number): JsonValue {
  return numberOrText(value)
}

/** The summary of a block; `isRoot` for the block that holds the diagram. */
function blockSummary(
  block: BlockLike,
  generated: Set<string>,
  isRoot: boolean,
): JsonObject {
  const entries: [string, JsonValue][] = []
  if (!isRoot && block.id !== undefined && !madeUp(block, generated)) {
    entries.push(["id", block.id])
  }
  if (block.label !== undefined && !generated.has(block.label)) {
    entries.push(["label", block.label])
  }
  if (block.type !== undefined) entries.push(["type", block.type])
  if (block.widthInColumns !== undefined) {
    entries.push(["widthInColumns", numberSummary(block.widthInColumns)])
  }
  if (block.width !== undefined) {
    entries.push(["width", numberSummary(block.width)])
  }
  if (block.directions !== undefined) {
    entries.push(["directions", block.directions])
  }
  if (block.columns !== undefined) {
    entries.push(["columns", numberSummary(block.columns)])
  }
  if (block.classes !== undefined) entries.push(["classes", block.classes])
  if (block.styles !== undefined) entries.push(["styles", block.styles])
  if (
    block.children !== undefined &&
    (isRoot || block.type === "composite" || block.children.length > 0)
  ) {
    entries.push([
      "children",
      block.children.map((child) => blockSummary(child, generated, false)),
    ])
  }
  return ownProperties(entries)
}

/** Whether the id of `block` is one that `generateId()` made, or the id of one of the blocks of a `space` statement. */
function madeUp(block: BlockLike, generated: Set<string>): boolean {
  return block.type === "space" || generated.has(block.id ?? "")
}

/** The summary of an edge. */
function edgeSummary(edge: EdgeLike): JsonObject {
  const entries: [string, JsonValue][] = []
  if (edge.start !== undefined) entries.push(["start", edge.start])
  if (edge.end !== undefined) entries.push(["end", edge.end])
  entries.push(
    ["label", edge.label ?? ""],
    ["thickness", edge.thickness ?? ""],
    ["pattern", edge.pattern ?? ""],
    ["arrowTypeStart", edge.arrowTypeStart ?? ""],
    ["arrowTypeEnd", edge.arrowTypeEnd ?? ""],
  )
  if (edge.directions !== undefined) {
    entries.push(["directions", edge.directions])
  }
  return ownProperties(entries)
}

/**
 * Patches the block diagram Db for summarizing. Applied to the Db itself: it is
 * one object that every block diagram shares, with its state in module
 * variables. The generated parser calls the methods on a copy of the Db's
 * properties (`yy`), so `this` in a method is not the Db; the patch uses `db`.
 *
 * - `clear()` forgets the ids that `generateId()` made.
 * - `generateId()` records the id it makes, since the summary leaves out the
 *   ids of the blocks that the Db made up and keeps the ids that the text wrote.
 */
export function patchBlockDb(dbValue: object): void {
  const db = dbValue as BlockDbLike
  const { generateId, clear } = db
  generatedIds.set(db, new Set())
  db.clear = (...args: unknown[]): unknown => {
    generatedIds.set(db, new Set())
    return clear.apply(db, args)
  }
  db.generateId = (): string => {
    const id = generateId.call(db)
    generatedIds.get(db)?.add(id)
    return id
  }
}
