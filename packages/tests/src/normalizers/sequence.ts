import { numberOrText } from "../summary-number.ts"
import type { DbSummary, JsonObject } from "../types.ts"
import { cssSupportsColor, withGlobal } from "./browser-stand-ins.ts"
import {
  blockEffect,
  recordDataBlockEffect,
  recordDataBlockProblem,
} from "./data-blocks.ts"
import { omit, ownProperties, toJson, toJsonObject } from "./json.ts"

/**
 * The part of mermaid's `SequenceDB` (`diagrams/sequence/sequenceDb.ts`) that
 * the normalizer reads.
 */
interface SequenceDbLike {
  getActors(): Map<string, object>
  getBoxes(): object[]
  getMessages(): object[]
  getCreatedActors(): Map<string, number>
  getDestroyedActors(): Map<string, number>
  getDiagramTitle(): string
  getAccTitle(): string
  getAccDescription(): string
  /** Public at runtime; holds every list the Db builds. */
  state: { records: object }
}

/**
 * Summarizes a sequence Db (`sequence`).
 *
 * Kept: what the Db exposes through its getters, in the order the Db holds it.
 * An actor's `box` is the position of its box in `boxes` instead of the box
 * itself, which `boxes` already holds. Created and destroyed actors are the
 * actor and the number of messages before the statement.
 *
 * Dropped:
 *
 * - `messages[].id`: the position of the message in `messages`, as a string.
 * - `actors[].actorCnt` and `actors[].rectData`: the renderer fills them in;
 *   after parsing they are always `null`.
 * - The notes list: every note is also a message of the `NOTE` type, with the
 *   same text, placement and actors, and the renderer reads the messages.
 * - `sequenceNumbersEnabled`: only the renderer turns it on.
 * - Internal bookkeeping (the last actor added, the open box, the last created
 *   and destroyed actors, the wrap setting copied from the configuration).
 *
 * Texts (messages, notes, descriptions, box names, titles) are recorded as
 * the Db holds them; with DOMPurify made the identity (see
 * docs/expected-results.md) the Db's `sanitizeText()` leaves them unchanged.
 *
 * The `type` and the description of an actor can be set by its `@{ ... }`
 * data block. An implementation that does not read data blocks takes what
 * the block changed from `dataBlockEffects` (see docs/embedded-data.md).
 */
export function normalizeSequence(dbValue: unknown): DbSummary {
  const db = dbValue as SequenceDbLike
  const boxes = db.getBoxes()
  return {
    title: db.getDiagramTitle(),
    accTitle: db.getAccTitle(),
    accDescr: db.getAccDescription(),
    actors: [...db.getActors().values()].map((actor) =>
      actorSummary(actor, boxes),
    ),
    boxes: boxes.map((box) => toJsonObject(box)),
    createdActors: [...db.getCreatedActors()].map(([id, messageIndex]) => ({
      id,
      messageIndex,
    })),
    destroyedActors: [...db.getDestroyedActors()].map(([id, messageIndex]) => ({
      id,
      messageIndex,
    })),
    messages: db
      .getMessages()
      .map((message) => omit(toJsonObject(withFiniteNumbers(message)), ["id"])),
  }
}

/** The type of the message that `autonumber` adds (`LINETYPE.AUTONUMBER`). */
const AUTONUMBER = 26

/**
 * The message `message`, but for the numbers of an `autonumber` that are no
 * finite number (a number of four hundred digits is `Infinity`): they are the
 * text of the number, with `-0` as 0, as `numberOrText()` gives them, since a
 * summary is JSON.
 */
function withFiniteNumbers(message: object): object {
  const { type, message: settings } = message as {
    type?: unknown
    message?: unknown
  }
  if (
    type !== AUTONUMBER ||
    typeof settings !== "object" ||
    settings === null
  ) {
    return message
  }
  const numbers = Object.entries(settings).map(([key, value]) => [
    key,
    typeof value === "number" ? numberOrText(value) : value,
  ])
  return { ...message, message: Object.fromEntries(numbers) }
}

/**
 * The summary of one actor, with its box as a position in `boxes`.
 */
function actorSummary(actor: object, boxes: readonly object[]): JsonObject {
  const { box } = actor as { box?: object }
  const fields = Object.entries(actor).flatMap(
    ([key, value]): [string, unknown][] => {
      if (["actorCnt", "rectData", "box"].includes(key)) return []
      if (key === "links" || key === "properties") {
        return [[key, authorObject(value as object)]]
      }
      return [[key, value]]
    },
  )
  return {
    ...toJsonObject(Object.fromEntries(fields)),
    ...(box === undefined ? {} : { box: boxes.indexOf(box) }),
  }
}

/**
 * An object whose keys an author wrote (the links or properties of an
 * actor). `SequenceDB` copies the parsed JSON into it key by key, so a key
 * `__proto__` sets its prototype instead of adding an entry; mermaid then
 * reads the prototype's entries too (`for ... in`, `properties[key]`). Such a
 * prototype is recorded as a first entry `__proto__`, so the summary holds
 * what the author wrote.
 */
function authorObject(value: object): JsonObject {
  const prototype: unknown = Object.getPrototypeOf(value)
  const own = toJsonObject({ ...value })
  if (prototype === Object.prototype || prototype === null) return own
  return ownProperties([
    ["__proto__", toJson(prototype)],
    ...Object.entries(own),
  ])
}

type DbMethod = (...args: unknown[]) => unknown

/**
 * Prepares `SequenceDB` for summarizing. Applied to the prototype: the
 * grammar's actions reach `addActor` through `apply`, which calls it on the
 * Db, so every Db created afterwards uses the patched method.
 *
 * Two methods call browser functions that Node lacks; the patch gives a
 * stand-in only for the duration of the call (see docs/expected-results.md):
 *
 * - `parseBoxData` asks `window.CSS.supports("color", word)` whether the first
 *   word of a `box` line is a color; the stand-in answers with
 *   `cssSupportsColor()`;
 * - `addDetails` reads the page with `document.getElementById`; the stand-in
 *   finds no element, as on a page without one, so a `details` statement adds
 *   nothing to the actor. The page is not part of the diagram's text.
 *
 * The effect of each `@{ ... }` data block of a participant is recorded (see
 * `src/normalizers/data-blocks.ts`). The grammar passes the block's text to
 * `addActor` as the fifth argument, in the same call that adds the
 * participant. The patch runs that call once without the block, keeps the
 * actor summaries, puts the Db's lists back as they were, and runs the call
 * as mermaid made it; the fields that differ between the two runs are the
 * block's effect. It reads neither the block nor mermaid's rules for it.
 */
export function patchSequenceDb(prototype: object): void {
  const target = prototype as Record<string, unknown>
  const originalAddActor = methodOf(target, "addActor")
  const originalParseBoxData = methodOf(target, "parseBoxData")
  const originalAddDetails = methodOf(target, "addDetails")
  const css = {
    supports: (property: unknown, value: unknown): boolean => {
      if (property !== "color" || typeof value !== "string") {
        throw new TypeError(
          `patchSequenceDb: CSS.supports(${JSON.stringify(property)}, ...) has no stand-in`,
        )
      }
      return cssSupportsColor(value)
    },
  }
  target.parseBoxData = function parseBoxData(
    this: unknown,
    ...args: unknown[]
  ): unknown {
    return withGlobal("window", { CSS: css }, () =>
      originalParseBoxData.apply(this, args),
    )
  }
  target.addDetails = function addDetails(
    this: unknown,
    ...args: unknown[]
  ): unknown {
    return withGlobal("document", { getElementById: () => null }, () =>
      originalAddDetails.apply(this, args),
    )
  }
  target.addActor = function addActor(
    this: SequenceDbLike,
    ...args: unknown[]
  ): void {
    if (args[4] === undefined) {
      originalAddActor.apply(this, args)
      return
    }
    const id = String(args[0])
    const start = structuredClone(this.state.records)
    let withoutBlock: Map<string, JsonObject> | undefined
    try {
      originalAddActor.apply(this, args.slice(0, 4))
      withoutBlock = elementSummaries(this)
    } catch {
      // The call fails without the block too; the run with it reports why.
    }
    this.state.records = start
    originalAddActor.apply(this, args)
    if (!withoutBlock) {
      recordDataBlockProblem(
        this,
        `the block after ${id}: the participant cannot be added without it`,
      )
      return
    }
    const effect = blockEffect(withoutBlock, elementSummaries(this))
    if (typeof effect === "string") {
      recordDataBlockProblem(this, `the block after ${id}: ${effect}`)
      return
    }
    recordDataBlockEffect(this, { id, set: effect })
  }
}

/**
 * Returns the method `name` of a Db prototype, or throws when mermaid no
 * longer has it.
 */
function methodOf(target: Record<string, unknown>, name: string): DbMethod {
  const method = target[name]
  if (typeof method !== "function") {
    throw new TypeError(`patchSequenceDb: SequenceDB has no ${name} method`)
  }
  return method as DbMethod
}

/**
 * The summary of every actor and box of `db`, keyed by kind and id (actors)
 * or position (boxes).
 */
function elementSummaries(db: SequenceDbLike): Map<string, JsonObject> {
  const boxes = db.getBoxes()
  const elements = new Map<string, JsonObject>()
  for (const [id, actor] of db.getActors()) {
    elements.set(`actor ${id}`, actorSummary(actor, boxes))
  }
  boxes.forEach((box, index) => {
    elements.set(`box ${index}`, toJsonObject(box))
  })
  return elements
}
