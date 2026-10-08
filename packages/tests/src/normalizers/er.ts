import type { DbSummary, JsonObject } from "../types.ts"
import { omit, toJsonObject } from "./json.ts"

/**
 * The part of mermaid's `ErDB` (`diagrams/er/erDb.ts`) that the normalizer
 * reads.
 */
interface ErDbLike {
  getDirection(): string
  getEntities(): Map<string, object>
  getRelationships(): object[]
  getClasses(): Map<string, object>
  getSubGraphs(): object[]
  getDiagramTitle(): string
  getAccTitle(): string
  getAccDescription(): string
}

/**
 * Summarizes an ER Db (`er`).
 *
 * Kept: what the Db holds in its own lists, in the order it holds them, and
 * not the layout data of `getData()`, which leaves out what the renderer does
 * not draw (a class definition that no entity uses, an entity that has the id
 * of a subgraph) and adds values made from the others. An entity is
 * `{ id, name, alias, attributes, classes, cssStyles }`: `id` is the
 * `entity-<name>-<number>` that the relationships refer to, `classes` the
 * names the `class` statements and `:::` gave it, in order. A relationship
 * refers to its two ends by the `id` of an entity, or by the id of a subgraph
 * when that subgraph was defined before the relationship.
 *
 * Dropped:
 *
 * - `entities[].shape`, `look`, `labelType`: the fixed shape `erBox` and label
 *   type `markdown`, and the `look` of the site configuration.
 * - `entities[].label`: the name, which the summary already has.
 * - `entities[].cssClasses`: the string `default` followed by the names of
 *   `classes`.
 * - `classes[].textStyles`: the styles that mention a color, made from
 *   `styles` alone.
 * - `subGraphs[].labelType`: the label type `markdown`, which the grammar does
 *   not choose.
 * - The lookup of subgraphs, the counter of subgraphs, and the depth of
 *   subgraphs while parsing: derived from the list of subgraphs or kept only
 *   while parsing.
 * - What `getData()` makes of the Db: the ids of the edges, the arrow types
 *   and the line pattern, the compiled styles, and the color index.
 */
export function normalizeEr(dbValue: unknown): DbSummary {
  const db = dbValue as ErDbLike
  return {
    direction: db.getDirection(),
    title: db.getDiagramTitle(),
    accTitle: db.getAccTitle(),
    accDescr: db.getAccDescription(),
    entities: [...db.getEntities().values()].map(entitySummary),
    relationships: db.getRelationships().map(relationshipSummary),
    classes: [...db.getClasses().values()].map((entityClass) =>
      omit(toJsonObject(entityClass), ["textStyles"]),
    ),
    subGraphs: db
      .getSubGraphs()
      .map((subGraph) => omit(toJsonObject(subGraph), ["labelType"])),
  }
}

/** The summary of one entity. */
function entitySummary(entity: object): JsonObject {
  const { label, cssClasses, attributes } = entity as {
    label: string
    cssClasses: string
    attributes: object[]
  }
  return {
    ...omit(toJsonObject({ ...entity, attributes: [] }), [
      "label",
      "shape",
      "look",
      "labelType",
      "cssClasses",
      "cssCompiledStyles",
      "colorIndex",
    ]),
    // The Db builds an attribute with its keys in the order the grammar gives
    // them, which differs with the attribute (a comment before the keys); the
    // summary has one order.
    attributes: attributes.map(attributeSummary),
    name: label,
    // `default` is the first of the names, whatever the statements say.
    classes: cssClasses.split(" ").slice(1),
  }
}

/** The summary of one attribute: its four fields, in a fixed order. */
function attributeSummary(attribute: object): JsonObject {
  const { type, name, keys, comment } = attribute as {
    type: string
    name: string
    keys: string[]
    comment: string
  }
  return { type, name, keys, comment }
}

/** The summary of one relationship: its `relSpec` is spread into the object. */
function relationshipSummary(relationship: object): JsonObject {
  const { relSpec } = relationship as {
    relSpec: { cardA: string; cardB: string; relType: string }
  }
  return {
    ...omit(toJsonObject(relationship), ["relSpec"]),
    cardA: relSpec.cardA,
    cardB: relSpec.cardB,
    relType: relSpec.relType,
  }
}
