import type { JsonObject } from "../types.ts"

/**
 * The calls that the grammar of a Db makes to bind a click callback, in the
 * order of the text, as the Db received them. `FlowDB.setClickFun` and
 * `ClassDB.setClickFunc` keep the function name and the arguments only inside
 * a closure, and only under `securityLevel: loose`, so a Db patch (see
 * `DbPatch`) records each call before the Db acts on it; the normalizer reads
 * them once the Db is built. A Db is made for each parse, so each Db has its
 * own calls; the gantt Db is one object for every parse, and its patch forgets
 * the calls when the Db is cleared ({@link forgetClickCalls}).
 */
const calls: WeakMap<object, JsonObject[]> = new WeakMap()

/**
 * Records the call `setClickFun(id, functionName, functionArgs)` of the flowchart
 * Db `db`, `setClickFunc(id, functionName, functionArgs)` of the class Db, or
 * `setClickEvent(ids, functionName, functionArgs)` of the gantt Db (`id` is
 * then the comma-separated list of ids): the values are the ones passed, `functionArgs` being the text between the
 * parentheses of the call as written (`null` when there is none).
 */
export function recordClickCall(
  db: object,
  id: unknown,
  functionName: unknown,
  functionArgs: unknown,
): void {
  const list = calls.get(db) ?? []
  list.push({
    id: String(id),
    name: String(functionName),
    args: typeof functionArgs === "string" ? functionArgs : null,
  })
  calls.set(db, list)
}

/**
 * The field `clickCalls` of the summary of `db`: the recorded calls, in the
 * order of the text, and no field when the text binds none or when the Db
 * patch of its diagram type does not record them (a field that the text does
 * not set is absent, as in the other summaries).
 */
export function clickCallsField(db: object): { clickCalls?: JsonObject[] } {
  const list = calls.get(db)
  return list === undefined ? {} : { clickCalls: list }
}

/**
 * Forgets the calls recorded for `db`. A Db that every diagram shares (gantt's)
 * is reset before each parse, and its calls with it.
 */
export function forgetClickCalls(db: object): void {
  calls.delete(db)
}
