import type { DbSummary, JsonObject } from "../types.ts"
import { toJsonObject } from "./json.ts"

/**
 * The part of mermaid's journey Db (`diagrams/user-journey/journeyDb.js`) that
 * the normalizer reads. The Db is one object that every journey diagram
 * shares; `clear()` resets its state before each parse.
 */
interface JourneyDbLike {
  getDiagramTitle(): string
  getAccTitle(): string
  getAccDescription(): string
  getSections(): string[]
  getTasks(): object[]
}

/**
 * Summarizes the journey Db (`journey`).
 *
 * Kept: the title and the accessibility texts, the sections, and the tasks. A
 * task is `{ section, task, people, score }`: the section it lies in (the
 * empty text before the first section), its description as written, the
 * people after the second colon, trimmed, one for each comma, and its score,
 * which is the number that the text before that colon writes. A score that is
 * no finite number (`Number()` gives `NaN` for a text that is no number and
 * `Infinity` for `Infinity`) is recorded as the text of the number, `"NaN"`
 * or `"Infinity"`, since JSON has no such number.
 *
 * `getTasks()` appends the tasks to the Db's list of tasks every time it is
 * called, so the summary reads the list once and empties it again, which
 * leaves the Db as it was.
 *
 * Dropped:
 *
 * - `tasks[].type`: the section again.
 * - `getActors()`: the people of the tasks, without repeats and sorted, made
 *   from the tasks alone.
 *
 * The Db reads no browser feature, no time and no random value, and its
 * syntax has no links, so the summary needs no patch of the Db.
 */
export function normalizeJourney(dbValue: unknown): DbSummary {
  const db = dbValue as JourneyDbLike
  const list = db.getTasks()
  const tasks = list.map(taskSummary)
  list.length = 0
  return {
    title: db.getDiagramTitle(),
    accTitle: db.getAccTitle(),
    accDescr: db.getAccDescription(),
    sections: db.getSections(),
    tasks,
  }
}

/** The summary of one task. */
function taskSummary(task: object): JsonObject {
  const {
    section,
    people,
    task: description,
    score,
  } = task as {
    section: string
    people: string[]
    task: string
    score: number
  }
  return toJsonObject({
    section,
    task: description,
    people,
    score: Number.isFinite(score) ? score : String(score),
  })
}
