import type { DbSummary, JsonObject } from "../types.ts"
import { clickCallsField, recordClickCall } from "./click-calls.ts"
import { omit, toJsonObject } from "./json.ts"

/**
 * The part of mermaid's `ClassDB` (`diagrams/class/classDb.ts`) that the
 * normalizer reads.
 */
interface ClassDbLike {
  getDirection(): string
  getClasses(): Map<string, object>
  getRelations(): object[]
  getNotes(): Map<string, object>
  getNamespaces(): Map<string, object>
  /** Private in TypeScript, readable at runtime. */
  interfaces: object[]
  getDiagramTitle(): string
  getAccTitle(): string
  getAccDescription(): string
}

/**
 * Summarizes a class Db (`classDiagram`, for both `classDiagram` and
 * `classDiagram-v2`).
 *
 * Kept: what the Db exposes through its getters, and the interfaces of
 * lollipop relations, which the renderer draws; in the order the Db holds
 * them. A namespace lists its classes, notes and child namespaces by id.
 *
 * Added: `clickCalls`, the calls that bind a click callback, as the Db
 * received them (see `src/normalizers/click-calls.ts`): `ClassDB` keeps the
 * function name and arguments only inside closures, and only under
 * `securityLevel: loose`.
 *
 * Dropped:
 *
 * - `classes[].domId` and `namespaces[].domId`: DOM ids built from counters,
 *   used only for rendering.
 * - `classes[].methods[].text` and `classes[].members[].text`: the display text
 *   of a member, built from its other fields.
 * - `notes[].index`: the number in the note's id.
 * - The class definitions (`classDef`): the Db keeps them in a private map
 *   that nothing reads; what they change shows in `classes[].styles`.
 * - Whitespace at the end of each style value (`classes[].styles`), which the
 *   grammar keeps before a comma or the end of the line and nothing reads, as
 *   in the flowchart summary.
 *
 * `classes[].link` and `classes[].linkTarget` are recorded as written; see
 * {@link patchClassDb}.
 */
export function normalizeClass(dbValue: unknown): DbSummary {
  const db = dbValue as ClassDbLike
  return {
    direction: db.getDirection(),
    title: db.getDiagramTitle(),
    accTitle: db.getAccTitle(),
    accDescr: db.getAccDescription(),
    classes: [...db.getClasses().values()].map(classSummary),
    relations: db.getRelations().map((relation) => toJsonObject(relation)),
    notes: [...db.getNotes().values()].map((note) =>
      omit(toJsonObject(note), ["index"]),
    ),
    namespaces: [...db.getNamespaces().values()].map(namespaceSummary),
    interfaces: db.interfaces.map((item) => toJsonObject(item)),
    ...clickCallsField(db),
  }
}

/**
 * The summary of one class.
 */
function classSummary(classNode: object): JsonObject {
  const { methods, members, styles } = classNode as {
    methods: object[]
    members: object[]
    styles: string[]
  }
  return {
    ...omit(toJsonObject({ ...classNode, methods: [], members: [] }), [
      "domId",
    ]),
    methods: methods.map(memberSummary),
    members: members.map(memberSummary),
    styles: styles.map((value) => value.trimEnd()),
  }
}

/**
 * The summary of one member or method, an instance of mermaid's
 * `ClassMember`: its own fields without the display text.
 */
function memberSummary(member: object): JsonObject {
  return omit(toJsonObject({ ...member }), ["text"])
}

/**
 * The summary of one namespace, with its classes, notes and children by id.
 */
function namespaceSummary(namespace: object): JsonObject {
  const { classes, notes, children } = namespace as {
    classes: Map<string, unknown>
    notes: Map<string, unknown>
    children: Map<string, unknown>
  }
  return {
    ...omit(
      toJsonObject({
        ...namespace,
        classes: [],
        notes: [],
        children: [],
      }),
      ["domId"],
    ),
    classes: [...classes.keys()],
    notes: [...notes.keys()],
    children: [...children.keys()],
  }
}

type SetLink = (ids: string, linkStr: string, target?: unknown) => void

/** Stands for a link while `setLink` runs, to see which classes it set. */
const UNSET = Symbol("link not set by this call")

/**
 * Prepares `ClassDB` for summarizing. Applied to the prototype; the
 * constructor binds `this.setLink` from it.
 *
 * Each call that binds a click callback is recorded (see
 * `src/normalizers/click-calls.ts`): the Db keeps the function name and the
 * arguments only in a closure, and only under `securityLevel: loose`.
 *
 * Click links are kept as written. `ClassDB.setLink` stores
 * `utils.formatUrl(linkStr, config)`, which passes the URL through
 * `@braintree/sanitize-url` unless `securityLevel` is `loose`, and sets the
 * link target to `_top` under `securityLevel: sandbox`. Summaries record
 * values with the sanitizers disabled and the same under every
 * `securityLevel` (see docs/expected-results.md), so the patch stores what
 * `loose` gives: the trimmed URL (none when it is empty), and the target as
 * written or `_blank`.
 *
 * To find the classes the call set without repeating how `setLink` resolves
 * ids, the patch first replaces every class's link with a marker; the classes
 * whose marker the call overwrote are the ones it set, and the others get
 * their link back.
 */
export function patchClassDb(prototype: object): void {
  const target = prototype as { setLink?: unknown; setClickFunc?: unknown }
  const originalSetLink = target.setLink
  if (typeof originalSetLink !== "function") {
    throw new TypeError("patchClassDb: ClassDB has no setLink method")
  }
  const originalSetClickFunc = target.setClickFunc
  if (typeof originalSetClickFunc !== "function") {
    throw new TypeError("patchClassDb: ClassDB has no setClickFunc method")
  }
  target.setClickFunc = function setClickFunc(
    this: object,
    domId: unknown,
    functionName: unknown,
    functionArgs: unknown,
  ): void {
    // The Db returns before it keeps the call unless `securityLevel` is
    // `loose`, and keeps it in a closure; record it as it comes.
    recordClickCall(this, domId, functionName, functionArgs)
    ;(originalSetClickFunc as (...args: unknown[]) => void).call(
      this,
      domId,
      functionName,
      functionArgs,
    )
  }
  target.setLink = function setLink(
    this: ClassDbLike,
    ids: string,
    linkStr: string,
    linkTarget?: unknown,
  ): void {
    const classes = [...this.getClasses().values()] as {
      link?: unknown
      linkTarget?: unknown
    }[]
    const saved = classes.map((classNode) => classNode.link)
    for (const classNode of classes) classNode.link = UNSET
    ;(originalSetLink as SetLink).call(this, ids, linkStr, linkTarget)
    classes.forEach((classNode, index) => {
      if (classNode.link === UNSET) {
        classNode.link = saved[index]
        if (classNode.link === undefined) delete classNode.link
        return
      }
      classNode.link = linkStr.trim() || undefined
      classNode.linkTarget =
        typeof linkTarget === "string" ? linkTarget : "_blank"
    })
  }
}
