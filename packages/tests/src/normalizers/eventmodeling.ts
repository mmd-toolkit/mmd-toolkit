import type { DbSummary } from "../types.ts"
import { toJsonObject } from "./json.ts"

/** The published frame fields read when the drawing state is built. */
interface Frame {
  readonly $type: string
  readonly name: string
  readonly modelEntityType: string
  readonly entityIdentifier: string
  readonly sourceFrames: readonly { readonly $refText: string }[]
  readonly dataReference?: { readonly $refText: string }
  readonly dataInlineValue?: string
}

/** The AST stored by setAst; declarations unused by drawing are omitted. */
interface EventModel {
  readonly frames: readonly Frame[]
  readonly dataEntities: readonly {
    readonly name: string
    readonly dataBlockValue: string
  }[]
}

/** The common accessibility getters of the shared Db object. */
interface EventmodelingDb {
  clear(this: void): void
  setAst(this: void, ast: EventModel): void
  getAccTitle(): string
  getAccDescription(): string
}

const models = new WeakMap<object, EventModel>()

/** Observes publication without invoking the DOM-dependent drawing builder. */
export function patchEventmodelingDb(value: object): void {
  const db = value as EventmodelingDb
  const clear = db.clear
  const setAst = db.setAst
  db.clear = function () {
    clear()
    models.delete(db)
  }
  db.setAst = function (ast) {
    setAst(ast)
    models.set(db, ast)
  }
}

/** Keeps drawing inputs, resolving data by the drawing builder's first lookup. */
export function normalizeEventmodeling(value: unknown): DbSummary {
  const db = value as EventmodelingDb
  const ast = models.get(db)
  if (ast === undefined)
    throw new Error("eventmodeling's published AST was not observed")
  return toJsonObject({
    accTitle: db.getAccTitle(),
    accDescr: db.getAccDescription(),
    frames: ast.frames.map((frame) => {
      const block = ast.dataEntities.find(
        (entity) => entity.name === frame.dataReference?.$refText,
      )
      return {
        kind: frame.$type === "EmResetFrame" ? "reset" : "time",
        name: frame.name,
        modelEntityType: frame.modelEntityType,
        entityIdentifier: frame.entityIdentifier,
        // Drawing tests membership while iterating frames in declaration order.
        sourceFrames: [
          ...new Set(frame.sourceFrames.map((ref) => ref.$refText)),
        ].sort(),
        data:
          block !== undefined
            ? { kind: "block", value: block.dataBlockValue }
            : frame.dataInlineValue
              ? { kind: "inline", value: frame.dataInlineValue }
              : null,
      }
    }),
  })
}
