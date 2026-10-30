import type { DbSummary, JsonObject } from "../types.ts"
import {
  clickCallsField,
  forgetClickCalls,
  recordClickCall,
} from "./click-calls.ts"
import { omit, toJsonObject } from "./json.ts"

/**
 * The part of mermaid's gantt Db (`diagrams/gantt/ganttDb.js`) that the
 * normalizer reads. The Db is one object that every gantt diagram shares: its
 * state is module variables that `clear()` resets before each parse.
 */
interface GanttDbLike {
  clear: (...args: unknown[]) => unknown
  getTasks: () => object[]
  addTask: (description: string, data: string) => unknown
  setLink: (ids: string, linkStr: string) => unknown
  setClickEvent: (
    ids: string,
    functionName: unknown,
    functionArgs: unknown,
  ) => unknown
  getLinks(): Map<string, unknown>
  getDateFormat(): string
  getAxisFormat(): string
  getTickInterval(): string | undefined
  getTodayMarker(): string
  getIncludes(): string[]
  getExcludes(): string[]
  endDatesAreInclusive(): boolean
  getWeekday(): string
  isInvalidDate(
    date: object,
    dateFormat: string,
    excludes: string[],
    includes: string[],
  ): boolean
  getDiagramTitle(): string
  getAccTitle(): string
  getAccDescription(): string
  getSections(): string[]
}

/**
 * The array of the tasks of the Db, which `addTask()` fills while the text is
 * parsed (see {@link patchGanttDb}).
 */
const tasksOf: WeakMap<object, object[]> = new WeakMap()

/**
 * Summarizes the gantt Db (`gantt`).
 *
 * Kept: the settings the text gives (`dateFormat`, `axisFormat`,
 * `tickInterval`, `todayMarker`, `includes`, `excludes`,
 * `inclusiveEndDates`, `weekday`, `weekend`), the title and the
 * accessibility texts, the sections, the tasks, and the links. A task is
 * what `addTask()` made of its two texts: its `section`, its description
 * (`task`), its `id` (the one written, or `task` and the number of the
 * tasks without one), the tags it has (`active`, `done`, `crit`, `milestone`,
 * `vert`, each present only when the text has the tag), its `order`, its
 * `classes` (`clickable` for a task that a `click` statement names), and how
 * the text gave its dates: `raw.startTime`, which is the end of the task
 * before (`prevTaskEnd` and its id) or the text of the start (`getStartDate`),
 * and `raw.endTime`, the text of the end or of the length. `weekend` has no
 * getter; it is read through `isInvalidDate()`, the method that uses it.
 *
 * Added: `links`, the tasks' links as written (see {@link patchGanttDb}), and
 * `clickCalls`, the calls that bind a click callback (see
 * `src/normalizers/click-calls.ts`).
 *
 * Dropped:
 *
 * - The dates of the tasks (`startTime`, `endTime`, `renderEndTime`) and the
 *   fields that only say how far they are computed (`processed`,
 *   `manualEndTime`). `getTasks()` computes them when the diagram is drawn,
 *   and not while the text is parsed: they depend on the time zone of the
 *   process, on the day it is run (`after` or `until` an id that is no task
 *   is today), and on `dayjs` reading `dateFormat`, and `getTasks()` throws
 *   for a start that is no date (`Invalid date`) although the text is
 *   accepted. The text determines how the dates are given (`raw`); it does not
 *   determine the dates.
 * - `type`: the section again; `prevTaskId`: the id of the task before, which
 *   `raw.startTime` and the order of the tasks give; `raw.data`: the text
 *   of the data, of which `raw`, the id and the tags are the reading.
 * - `topAxis`: only the method `enableTopAxis()` sets it, and the statement
 *   `topAxis` calls `yy.TopAxis()`, which the Db does not have, so mermaid.js
 *   rejects the text with a `TypeError`; the renderer reads the setting from
 *   the configuration. `displayMode`: no statement sets it; the renderer
 *   reads it from the configuration. `diagramId`, the click functions: set
 *   when the diagram is drawn.
 */
export function normalizeGantt(dbValue: unknown): DbSummary {
  const db = dbValue as GanttDbLike
  const tasks = tasksOf.get(db)
  if (tasks === undefined) {
    throw new TypeError(
      "normalizeGantt: the Db was not patched by patchGanttDb",
    )
  }
  const tickInterval = db.getTickInterval()
  return {
    dateFormat: db.getDateFormat(),
    axisFormat: db.getAxisFormat(),
    ...(tickInterval === undefined ? {} : { tickInterval }),
    todayMarker: db.getTodayMarker(),
    includes: db.getIncludes(),
    excludes: db.getExcludes(),
    inclusiveEndDates: db.endDatesAreInclusive(),
    weekday: db.getWeekday(),
    weekend: weekendOf(db),
    title: db.getDiagramTitle(),
    accTitle: db.getAccTitle(),
    accDescr: db.getAccDescription(),
    sections: db.getSections(),
    tasks: tasks.map(taskSummary),
    links: [...db.getLinks()].map(([id, url]) => toJsonObject({ id, url })),
    ...clickCallsField(db),
  }
}

/**
 * The first day of the weekend, `friday` or `saturday`. The Db has no getter
 * for it; `isInvalidDate()` is the method that reads it, and the only part of
 * a date it reads for `weekends` is the number of the day of the week, so a
 * Friday tells which of the two it is.
 */
function weekendOf(db: GanttDbLike): string {
  const friday = {
    isoWeekday: (): number => 5,
    format: (format: string): string =>
      format === "dddd" ? "friday" : "2000-01-07",
  }
  return db.isInvalidDate(friday, "YYYY-MM-DD", ["weekends"], [])
    ? "friday"
    : "saturday"
}

/** The summary of one task, as `addTask()` made it. */
function taskSummary(task: object): JsonObject {
  const { raw } = task as { raw: { startTime?: unknown; endTime?: unknown } }
  return omit(
    toJsonObject({
      ...task,
      raw: { startTime: raw.startTime, endTime: raw.endTime },
    }),
    ["type", "processed", "manualEndTime", "renderEndTime", "prevTaskId"],
  )
}

/** Stands for a link while `setLink` runs, to see which tasks' links it set. */
const UNSET = Symbol("link not set by this call")

/** A position that no task of a text has. */
const BEYOND_THE_TASKS = 1_000_000

/**
 * Makes the Db forget the ids of the tasks of the text before. `clear()`
 * resets the tasks but not the table that maps an id to the position of its
 * task (`taskDb`), so an id that the next text does not define still finds
 * the task that has its old position, and a `click` on it links that task.
 * The table is private; the only way to change an entry is `addTask()`, which
 * stores the position of the task it pushes. So, before `clear()`, the array
 * of the tasks is made to look long, and a task is added for each id, which
 * moves the position of the id beyond every task of a text.
 */
function forgetTaskIds(db: GanttDbLike, addTask: GanttDbLike["addTask"]): void {
  const tasks = tasksOf.get(db)
  if (tasks === undefined) return
  const ids = new Set(
    tasks.map((task) => String((task as { id?: unknown }).id)),
  )
  tasks.length = BEYOND_THE_TASKS
  for (const id of ids) addTask.call(db, "", `${id}, 2000-01-01, 1d`)
}

/**
 * Prepares the gantt Db for summarizing. Applied to the Db object itself,
 * which every gantt diagram shares and which `clear()` resets before each
 * parse; the patch keeps its records in step with `clear()`.
 *
 * - `clear()` takes hold of the array of the tasks. The Db keeps its tasks in
 *   a private array that only `getTasks()` returns, and `getTasks()` computes
 *   the dates of the tasks it returns, which depend on the time zone and the
 *   day it is run and can throw (see {@link normalizeGantt}). Right after
 *   `clear()` there is no task to compute, and `getTasks()` returns the
 *   array that `addTask()` then fills, with tasks as it makes them.
 * - `clear()` also makes the Db forget the ids of the tasks of the text before
 *   (see {@link forgetTaskIds}), so that the Db of a text does not depend on
 *   the texts before it.
 * - `setLink()` stores the URL as written. `GanttDB.setLink` stores what
 *   `@braintree/sanitize-url` makes of it unless `securityLevel` is `loose`.
 *   Summaries record values with the sanitizers disabled and the same under
 *   every `securityLevel` (see docs/expected-results.md), so the patch stores
 *   what `loose` gives. To find the links the call set without repeating how
 *   `setLink` resolves ids, the patch first replaces every link with a
 *   marker; the links whose marker the call overwrote are the ones it set.
 * - `setClickEvent()` records each call that binds a click callback: the Db
 *   keeps the function name and the arguments only in a closure, and only
 *   under `securityLevel: loose`.
 */
export function patchGanttDb(dbValue: object): void {
  const db = dbValue as GanttDbLike
  const { addTask, clear, getTasks, setLink, setClickEvent } = db
  db.clear = (...args: unknown[]): unknown => {
    forgetTaskIds(db, addTask)
    const result = clear.apply(db, args)
    tasksOf.set(db, getTasks.call(db))
    forgetClickCalls(db)
    return result
  }
  // The generated parser calls the methods on a copy of the Db's properties
  // (`yy`), so `this` in a method is not the Db; the patch uses `db`.
  db.setLink = (ids: string, linkStr: string): unknown => {
    const links = db.getLinks()
    const saved = new Map(links)
    for (const id of links.keys()) links.set(id, UNSET)
    const result = setLink.call(db, ids, linkStr)
    for (const [id, link] of links) {
      links.set(id, link === UNSET ? saved.get(id) : linkStr)
    }
    return result
  }
  db.setClickEvent = (
    ids: string,
    functionName: unknown,
    functionArgs: unknown,
  ): unknown => {
    recordClickCall(db, ids, functionName, functionArgs)
    return setClickEvent.call(db, ids, functionName, functionArgs)
  }
}
