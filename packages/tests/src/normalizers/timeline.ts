import type { DbSummary, JsonObject } from "../types.ts"
import { toJsonObject } from "./json.ts"

/**
 * The part of mermaid's timeline Db (`diagrams/timeline/timelineDb.js`) that
 * the normalizer reads. The Db is one module that every timeline diagram
 * shares; `clear()` resets its state before each parse, but for the counter of
 * the tasks.
 */
interface TimelineDbLike {
  getDirection(): string
  getSections(): string[]
  getTasks(): object[]
  getCommonDb(): {
    getDiagramTitle(): string
    getAccTitle(): string
    getAccDescription(): string
  }
}

/**
 * Summarizes the timeline Db (`timeline`).
 *
 * Kept: the direction (`LR`, or `TD` for `timeline TD`), the title and the
 * accessibility texts, the sections, and the tasks. A task is
 * `{ section, task, events }`: the section it lies in (the empty text before
 * the first section), its period as written, and its events in the order they
 * are written, each with the text after the colon and the whitespace after it.
 *
 * `getTasks()` appends the tasks to the Db's list of tasks every time it is
 * called, so the summary reads the list once and empties it again, which
 * leaves the Db as it was.
 *
 * Dropped:
 *
 * - `tasks[].id`: the number of the task, taken from a counter that `clear()`
 *   does not reset, so that it depends on the diagrams parsed before this one.
 *   The order of the tasks is their order in the list.
 * - `tasks[].type`: the section again.
 * - `tasks[].score`: always 0, since the grammar adds every task with the score
 *   0.
 *
 * The Db reads no browser feature, no time and no random value, and its syntax
 * has no links, so the summary needs no patch of the Db.
 */
export function normalizeTimeline(dbValue: unknown): DbSummary {
  const db = dbValue as TimelineDbLike
  const list = db.getTasks()
  const tasks = list.map(taskSummary)
  list.length = 0
  const common = db.getCommonDb()
  return {
    direction: db.getDirection(),
    title: common.getDiagramTitle(),
    accTitle: common.getAccTitle(),
    accDescr: common.getAccDescription(),
    // A copy: the Db empties its own list when it is cleared for the next text.
    sections: [...db.getSections()],
    tasks,
  }
}

/** The summary of one task. */
function taskSummary(task: object): JsonObject {
  const {
    section,
    task: period,
    events,
  } = task as {
    section: string
    task: string
    events: string[]
  }
  return toJsonObject({ section, task: period, events })
}
