import { numberOrText } from "../summary-number.ts"
import type { DbSummary, JsonObject } from "../types.ts"
import { toJsonObject } from "./json.ts"

/** The shared C4 Db's getters, read immediately after parsing, before layout. */
interface C4DbLike {
  getC4Type(): string
  getTitle(): string
  getAccTitle(): string
  getAccDescription(): string
  getC4ShapeArray(): Record<string, unknown>[]
  getBoundaries(): Record<string, unknown>[]
  getRels(): Record<string, unknown>[]
  getC4ShapeInRow(): number
  getC4BoundaryInRow(): number
}

/**
 * Summarizes the shared C4 Db (`c4`). Each element keeps its complete own
 * attribute bag, including arbitrary named attributes and style updates.
 * Text slots remain `{ text }`: a named argument in a required slot can be
 * the text's value itself, and style updates can replace a text object with
 * a string. No renderer has populated geometry at this point; a geometry-like
 * key present here is an author-written attribute and is kept too.
 *
 * Lists stay in first-insertion order, including the global boundary. The
 * summary drops configuration, constants and the boundary parsing stack;
 * parentBoundary already records membership. The patch resets the shared
 * accessibility texts that C4 clear() otherwise leaves from earlier inputs.
 * Parsing reads no browser feature, random id, time or data block.
 */
export function normalizeC4(dbValue: unknown): DbSummary {
  const db = dbValue as C4DbLike
  return {
    type: db.getC4Type(),
    title: db.getTitle(),
    accTitle: db.getAccTitle(),
    accDescr: db.getAccDescription(),
    shapes: db.getC4ShapeArray().map(attributes),
    boundaries: db.getBoundaries().map(attributes),
    rels: db.getRels().map(attributes),
    c4ShapeInRow: numberOrText(db.getC4ShapeInRow()),
    c4BoundaryInRow: numberOrText(db.getC4BoundaryInRow()),
  }
}

/** Keeps own attributes, spelling non-finite numbers as text because JSON has none. */
function attributes(bag: Record<string, unknown>): JsonObject {
  return toJsonObject(
    Object.fromEntries(
      Object.entries(bag).map(([key, value]) => [
        key,
        typeof value === "number" ? numberOrText(value) : value,
      ]),
    ),
  )
}

/** The shared object methods needed to reset accessibility state between inputs. */
interface PatchableC4Db {
  clear: (...args: unknown[]) => unknown
  setAccTitle: (text: string) => void
  setAccDescription: (text: string) => void
}

/**
 * Resets C4's shared accessibility strings with its own clear(). C4's clear
 * resets its module-local fields but omits these common Db fields; otherwise
 * a summary depends on the previous diagram. Applied to the shared object,
 * using the Db rather than the generated parser's copy of its properties.
 */
export function patchC4Db(dbValue: object): void {
  const db = dbValue as PatchableC4Db
  const { clear } = db
  db.clear = (...args: unknown[]): unknown => {
    const result = clear.apply(db, args)
    db.setAccTitle("")
    db.setAccDescription("")
    return result
  }
}
