import type { DbSummary, JsonObject } from "../types.ts"
import { omit, toJsonObject } from "./json.ts"

/**
 * The part of mermaid's `RequirementDB`
 * (`diagrams/requirement/requirementDb.ts`) that the normalizer reads.
 */
interface RequirementDbLike {
  getDirection(): string
  getRequirements(): Map<string, object>
  getElements(): Map<string, object>
  getRelationships(): object[]
  getClasses(): Map<string, object>
  getDiagramTitle(): string
  getAccTitle(): string
  getAccDescription(): string
}

/**
 * Summarizes a requirement Db (`requirement`).
 *
 * Kept: what the Db holds in its own lists, in the order it holds them, and
 * not the layout data of `getData()`, which adds values made from the others
 * and changes the stored objects. A requirement is `{ name, type,
 * requirementId, text, risk, verifyMethod, cssStyles, classes }` and an element
 * `{ name, type, docRef, cssStyles, classes }`: `classes` are the names the
 * `class` statements and `:::` gave it, in order, and `cssStyles` the styles
 * that the `style` statements and the classes gave it, in the order they were
 * given. A relationship is `{ type, src, dst }`; `src` and `dst` are names, and
 * the Db does not check that a requirement or an element has the name.
 *
 * Dropped:
 *
 * - The leading `default` of `classes`: every requirement and element starts
 *   with it, whatever the statements say.
 * - `classes[].textStyles`: the styles that mention a color, made from
 *   `styles` alone.
 * - What `getData()` makes of the Db: the `id`, `shape`, `look`, `cssClasses`
 *   and `colorIndex` of the nodes, and the ids, labels, arrow types and line
 *   pattern of the edges.
 * - The requirement and the element being read while parsing: each is reset
 *   when its definition ends.
 */
export function normalizeRequirement(dbValue: unknown): DbSummary {
  const db = dbValue as RequirementDbLike
  return {
    direction: db.getDirection(),
    title: db.getDiagramTitle(),
    accTitle: db.getAccTitle(),
    accDescr: db.getAccDescription(),
    requirements: [...db.getRequirements().values()].map(nodeSummary),
    elements: [...db.getElements().values()].map(nodeSummary),
    relationships: db
      .getRelationships()
      .map((relationship) => toJsonObject(relationship)),
    classes: [...db.getClasses().values()].map((styleClass) =>
      omit(toJsonObject(styleClass), ["textStyles"]),
    ),
  }
}

/** The summary of a requirement or an element: without the leading `default` of its classes. */
function nodeSummary(node: object): JsonObject {
  const { classes } = node as { classes: string[] }
  return { ...toJsonObject(node), classes: classes.slice(1) }
}
