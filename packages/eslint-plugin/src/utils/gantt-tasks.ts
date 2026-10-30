import type { GanttLiteral, GanttTaskStatement } from "@mmd-toolkit/parser"

/**
 * The roles that mermaid.js gives the items of the data of a task, after the
 * tags, by their number: with one item, it is the end; with two, the start and
 * the end; with three, the id, the start, and the end; with four items or more,
 * mermaid.js reads none of them and draws no chart. A role is null when the
 * data has no item for it, and also when its item is empty.
 */
export interface TaskItemRoles {
  /**
   * How the task gets its id: `written` with three items, `numbered` with one
   * or two (mermaid.js gives it `task1`, `task2`, and so on, in the order of
   * the text), and `none` with four items or more.
   */
  readonly idKind: "written" | "numbered" | "none"
  /** The written id: the first of three items. */
  readonly id: GanttLiteral | null
  /** The start: the first of two items, the second of three. */
  readonly start: GanttLiteral | null
  /** The end: the last item of one to three. */
  readonly end: GanttLiteral | null
}

/** The roles of the items of the data of `task`. */
export function itemRolesOf(task: GanttTaskStatement): TaskItemRoles {
  const [first = null, second = null, third = null] = task.items
  switch (task.items.length) {
    case 1:
      return { idKind: "numbered", id: null, start: null, end: first }
    case 2:
      return { idKind: "numbered", id: null, start: first, end: second }
    case 3:
      return { idKind: "written", id: first, start: second, end: third }
    default:
      return { idKind: "none", id: null, start: null, end: null }
  }
}

/**
 * The ids of the tasks, as mermaid.js gives them: the written id of each task
 * that writes one (the empty text for an empty one), and `task1`, `task2`, and
 * so on, counted over the tasks that mermaid.js numbers, in the order of the
 * text.
 */
export function taskIdsOf(tasks: readonly GanttTaskStatement[]): Set<string> {
  const ids = new Set<string>()
  let numbered = 0
  for (const task of tasks) {
    const { idKind, id } = itemRolesOf(task)
    if (idKind === "written") {
      ids.add(id?.value ?? "")
    } else if (idKind === "numbered") {
      numbered++
      ids.add(`task${numbered}`)
    }
  }
  return ids
}
