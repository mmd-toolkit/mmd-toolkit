import type { DbSummary, JsonObject } from "../types.ts"
import {
  forgetDataBlockEffects,
  recordDataBlockEffect,
  recordDataBlockProblem,
} from "./data-blocks.ts"
import { omit, toJsonObject } from "./json.ts"

/** The stored model getters consumed by usecase's layout conversion. */
interface UsecaseDbLike {
  getActors(): ReadonlyMap<string, unknown>
  getUseCases(): ReadonlyMap<string, unknown>
  getSystemBoundaries(): ReadonlyMap<string, unknown>
  getRelationships(): readonly { explicitId: boolean }[]
  getNotes(): ReadonlyMap<string, unknown>
  getJsonNodes(): ReadonlyMap<string, unknown>
  getClassDefs(): ReadonlyMap<string, unknown>
  getDirection(): string
  getDiagramTitle(): string
  getAccTitle(): string
  getAccDescription(): string
}

/** Copies records in map order, without constructing sanitized layout data. */
function records(values: ReadonlyMap<string, unknown>): JsonObject[] {
  return [...values.values()].map((value) => toJsonObject(value))
}

/**
 * Keeps the resolved drawing inputs. Anonymous relationship and note ids are
 * generated counters; explicit edge ids remain addressable by classes/styles
 * and metadata. JSON property order is independent of JavaScript key order.
 * Native metadata has a closed grammar. The separate JSON tables supply
 * opaque-data effects through the commit patch below.
 */
export function normalizeUsecase(dbValue: unknown): DbSummary {
  const db = dbValue as UsecaseDbLike
  return {
    direction: db.getDirection(),
    title: db.getDiagramTitle(),
    accTitle: db.getAccTitle(),
    accDescr: db.getAccDescription(),
    actors: records(db.getActors()),
    useCases: records(db.getUseCases()),
    systemBoundaries: records(db.getSystemBoundaries()).map((boundary) =>
      omit(boundary, ["members"]),
    ),
    relationships: db
      .getRelationships()
      .map((relationship) =>
        omit(
          toJsonObject(relationship),
          relationship.explicitId ? ["explicitId"] : ["id", "explicitId"],
        ),
      ),
    notes: records(db.getNotes()).map((note) => omit(note, ["id"])),
    jsonNodes: records(db.getJsonNodes()),
    classDefs: records(db.getClassDefs()),
  }
}

/** The Mermaid publication hook: statements retain authored order, unlike the node maps. */
interface PublishedModel {
  readonly ast?: {
    readonly statements: readonly {
      readonly kind: string
      readonly nodes?: readonly { readonly id: string }[]
    }[]
  }
  readonly jsonNodes: ReadonlyMap<
    string,
    { readonly value: unknown; readonly propertyOrder: unknown }
  >
}

/** The usecase Db is shared; its builder publishes each successful reading through commit. */
interface PatchableUsecaseDb {
  clear(this: void): void
  commit(this: void, model: PublishedModel): void
}

/** Records Mermaid's JSON readings without reading JSON again or changing the stored model. */
export function patchUsecaseDb(dbValue: object): void {
  const db = dbValue as PatchableUsecaseDb
  const clear = db.clear
  const commit = db.commit
  db.clear = function () {
    clear()
    forgetDataBlockEffects(db)
  }
  db.commit = function (model) {
    commit(model)
    try {
      const statements = model.ast?.statements
      if (statements === undefined)
        throw new Error("usecase's published model has no statement list")
      let count = 0
      for (const statement of statements) {
        if (statement.kind !== "json") continue
        const id = statement.nodes?.[0]?.id
        const node = id === undefined ? undefined : model.jsonNodes.get(id)
        if (id === undefined || node === undefined)
          throw new Error("usecase's JSON statement has no stored JSON node")
        recordDataBlockEffect(db, {
          id,
          set: toJsonObject({
            value: node.value,
            propertyOrder: node.propertyOrder,
          }),
        })
        count++
      }
      if (count !== model.jsonNodes.size)
        throw new Error("usecase's JSON statements and stored nodes disagree")
    } catch (error) {
      recordDataBlockProblem(
        db,
        error instanceof Error ? error.message : String(error),
      )
    }
  }
}
