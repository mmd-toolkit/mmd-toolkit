import type { EmbeddedValues } from "../mermaid.ts"
import type { DbSummary, JsonObject } from "../types.ts"
import { isWhitespace } from "./characters.ts"
import { ConvertedText, readConvertedCharacters } from "./converted-text.ts"
import type {
  GanttClickStatement,
  GanttDiagram,
  GanttLiteral,
  GanttStatement,
  GanttTaskStatement,
} from "./gantt-tree.ts"
import type { TextReplacement } from "./text-replacement.ts"
import { textReplacementOf } from "./text-replacement.ts"
import type { Identifier, StringLiteral, TreeRoot } from "./tree.ts"
import { TreeError } from "./tree.ts"
import { descriptionOf, trimmed } from "./values.ts"

// docs/db-from-tree/gantt.md: the summary of the Db that a gantt tree
// denotes, in the form of `normalizeGantt()` of `@mmd-toolkit/tests`. The
// statements are executed in source order, as mermaid.js executes them while
// it parses; each step names the paragraph of "Building the summary from the
// tree" that defines it. Every value is read in converted form (see
// `converted-text.ts`).

/** The tags of a task, in the order in which the summary lists them. */
type GanttTag = "active" | "done" | "crit" | "milestone" | "vert"

const GANTT_TAGS: readonly GanttTag[] = [
  "active",
  "done",
  "crit",
  "milestone",
  "vert",
]

/** The key of the table of ids under which a task without an id is found. */
const KEY_OF_TASK_WITHOUT_ID = "undefined"

/** The id that no click statement finds, whatever task has it. */
const ID_NEVER_FOUND = "__proto__"

/** The summary: one task while it is built. */
interface TaskEntry {
  readonly section: string
  readonly description: string
  /** The id; undefined for a task with four or more items. */
  readonly id: string | undefined
  readonly tags: readonly GanttTag[]
  /** How the text gives the start; null for a task with four or more items. */
  readonly startTime: JsonObject | null
  /** How the text gives the end; null for a task with four or more items. */
  readonly endTime: JsonObject | null
  readonly order: number
  readonly classes: string[]
}

/** The builder of the summary: the statements are executed in source order. */
class GanttDbBuilder {
  private dateFormat = ""

  private axisFormat = ""

  private tickInterval: string | undefined

  private todayMarker = ""

  private readonly includes: string[] = []

  private readonly excludes: string[] = []

  private inclusiveEndDates = false

  private weekday = "sunday"

  private weekend = "saturday"

  private title: string

  private accTitle = ""

  private accDescr = ""

  private readonly sections: string[] = []

  private readonly tasks: TaskEntry[] = []

  /** The task that an id finds at this point, as its position in `tasks`. */
  private readonly positionsById = new Map<string, number>()

  /** The number of the tasks that were given a number as their id. */
  private numberedTasks = 0

  /** The number of the tasks that have an order (all but those with `vert`). */
  private orderedTasks = 0

  /** The links, by id of the task, in the order of the first one set. */
  private readonly links = new Map<string, string>()

  private readonly clickCalls: JsonObject[] = []

  /** The converted form of ranges of the source. */
  private readonly text: ConvertedText

  /** The replacement of characters that the configuration gives the texts that the Db keeps. */
  private readonly replace: TextReplacement

  public constructor(source: string, root: TreeRoot, embedded: EmbeddedValues) {
    this.text = new ConvertedText(readConvertedCharacters(source, root))
    this.replace = textReplacementOf(embedded.config)
    this.title = this.replace(embedded.title ?? "")
  }

  /** The summary of `diagram`. */
  public summaryOf(diagram: GanttDiagram): DbSummary {
    for (const statement of diagram.body) this.execute(statement)
    return {
      dateFormat: this.dateFormat,
      axisFormat: this.axisFormat,
      ...(this.tickInterval === undefined
        ? {}
        : { tickInterval: this.tickInterval }),
      todayMarker: this.todayMarker,
      includes: this.includes,
      excludes: this.excludes,
      inclusiveEndDates: this.inclusiveEndDates,
      weekday: this.weekday,
      weekend: this.weekend,
      title: this.title,
      accTitle: this.accTitle,
      accDescr: this.accDescr,
      sections: this.sections,
      tasks: this.tasks.map(taskSummary),
      links: [...this.links].map(([id, url]) => ({ id, url })),
      ...(this.clickCalls.length === 0 ? {} : { clickCalls: this.clickCalls }),
    }
  }

  /** Executing: what one statement changes. */
  private execute(statement: GanttStatement): void {
    switch (statement.type) {
      case "GanttTaskStatement":
        this.executeTask(statement)
        break
      case "GanttClickStatement":
        this.executeClick(statement)
        break
      case "GanttDateFormatStatement":
        this.dateFormat = this.textOf(statement.value)
        break
      case "GanttAxisFormatStatement":
        this.axisFormat = this.textOf(statement.value)
        break
      case "GanttTickIntervalStatement":
        this.tickInterval = this.textOf(statement.value)
        break
      case "GanttTodayMarkerStatement":
        this.todayMarker = this.textOf(statement.value)
        break
      case "GanttIncludesStatement":
        this.addTokens(this.includes, statement.items)
        break
      case "GanttExcludesStatement":
        this.addTokens(this.excludes, statement.items)
        break
      case "GanttInclusiveEndDatesStatement":
        this.inclusiveEndDates = true
        break
      case "GanttWeekdayStatement":
        this.weekday = statement.day
        break
      case "GanttWeekendStatement":
        this.weekend = statement.day
        break
      case "GanttTitleStatement":
        this.title = this.replace(this.textOf(statement.value))
        break
      case "GanttSectionStatement":
        this.sections.push(this.textOf(statement.name))
        break
      case "GanttAccTitleStatement":
        this.accTitle = this.replace(trimmed(this.textOf(statement.value)))
        break
      case "GanttAccDescrStatement":
        this.accDescr = this.replace(
          descriptionOf(this.textOf(statement.value)),
        )
        break
      case "GanttAccDescrBlockStatement":
        // A block without text changes nothing.
        if (statement.value !== null) {
          this.accDescr = this.replace(
            descriptionOf(this.textOf(statement.value)),
          )
        }
        break
      default:
        throw new Error(
          `gantt Db: unknown statement ${JSON.stringify(statement satisfies never)}`,
        )
    }
  }

  /**
   * Settings: adds the tokens of the list text of an `includes` or `excludes`
   * statement to `list`, in lower case, those that `list` has not. The case is
   * mapped over the list text from the first item to the last, and not item
   * by item, since the lower case of a Greek capital sigma depends on the
   * characters around it.
   */
  private addTokens(list: string[], items: readonly Identifier[]): void {
    const first = items[0]
    const last = items.at(-1)
    if (first === undefined || last === undefined) return
    const listText = this.text.of([first.range[0], last.range[1]])
    for (const token of tokensOf(listText.toLowerCase())) {
      if (!list.includes(token)) list.push(token)
    }
  }

  /** Tasks: adds the task of a task statement. */
  private executeTask(statement: GanttTaskStatement): void {
    const tags = statement.tags.map((tag) => this.tagOf(tag))
    const items = statement.items.map((item) =>
      item === null ? "" : trimmed(this.textOf(item)),
    )
    const [first = "", second = "", third = ""] = items
    const previousId = this.tasks.at(-1)?.id
    let id: string | undefined
    let startTime: JsonObject | null = null
    let endTime: JsonObject | null = null
    switch (items.length) {
      case 0:
        throw new TreeError("gantt", statement.type, "a task has no item")
      case 1:
        id = this.numberedId()
        startTime = {
          type: "prevTaskEnd",
          ...(previousId === undefined ? {} : { id: previousId }),
        }
        endTime = { data: first }
        break
      case 2:
        id = this.numberedId()
        startTime = { type: "getStartDate", startData: first }
        endTime = { data: second }
        break
      case 3:
        id = first
        startTime = { type: "getStartDate", startData: second }
        endTime = { data: third }
        break
      // Four or more items: mermaid.js reads none of them.
      default:
        break
    }
    this.tasks.push({
      section: this.sections.at(-1) ?? "",
      description: this.textOf(statement.description),
      id,
      tags,
      startTime,
      endTime,
      order: tags.includes("vert") ? -1 : this.orderedTasks,
      classes: [],
    })
    if (!tags.includes("vert")) this.orderedTasks += 1
    const key = id ?? KEY_OF_TASK_WITHOUT_ID
    if (key !== ID_NEVER_FOUND) {
      this.positionsById.set(key, this.tasks.length - 1)
    }
  }

  /** Tasks: the id `task1`, `task2`, … of a task without an id. */
  private numberedId(): string {
    this.numberedTasks += 1
    return `task${this.numberedTasks}`
  }

  /** Tasks: the tag that a tag node writes. */
  private tagOf(tag: Identifier): GanttTag {
    const text = trimmed(this.textOf(tag))
    const found = GANTT_TAGS.find((name) => name === text)
    if (found === undefined) {
      throw new TreeError("gantt", tag.type, `${text} is no tag`)
    }
    return found
  }

  /**
   * Click statements: a call part, then a link part, whatever their order in
   * the text. Each part gives the class `clickable` to the task of each id
   * (once for each time the id is written), and a link part sets the link of
   * each of those tasks.
   */
  private executeClick(statement: GanttClickStatement): void {
    const ids = statement.ids.map((id) => (id === null ? "" : this.textOf(id)))
    if (statement.call !== null) {
      this.clickCalls.push({
        id: ids.join(","),
        name: this.textOf(statement.call.name),
        args:
          statement.call.args === null
            ? null
            : this.textOf(statement.call.args),
      })
      this.addClickableClass(ids)
    }
    if (statement.href !== null) {
      const url = this.textOf(statement.href)
      for (const id of ids) {
        if (this.taskOf(id) !== undefined) this.links.set(id, url)
      }
      this.addClickableClass(ids)
    }
  }

  /** Click statements: the task that the id `id` finds at this point. */
  private taskOf(id: string): TaskEntry | undefined {
    const position = this.positionsById.get(id)
    return position === undefined ? undefined : this.tasks[position]
  }

  /** Click statements: gives the class `clickable` to the task of each of `ids`. */
  private addClickableClass(ids: readonly string[]): void {
    for (const id of ids) this.taskOf(id)?.classes.push("clickable")
  }

  /**
   * The text of a leaf node: the converted form of its range, or, for a
   * string, of its range between the quotes.
   */
  private textOf(node: GanttLiteral | Identifier | StringLiteral): string {
    if (node.type !== "StringLiteral") return this.text.of(node.range)
    const [start, end] = node.range
    return this.text.of([start + 1, end - 1])
  }
}

/** Settings: the tokens of `text`, which the whitespace and the commas separate. */
function tokensOf(text: string): string[] {
  const tokens: string[] = []
  let start = 0
  for (let index = 0; index <= text.length; index++) {
    const isSeparator =
      index === text.length ||
      text[index] === "," ||
      isWhitespace(text.charCodeAt(index))
    if (!isSeparator) continue
    if (index > start) tokens.push(text.slice(start, index))
    start = index + 1
  }
  return tokens
}

/** The summary of one task. */
function taskSummary(task: TaskEntry): JsonObject {
  return {
    section: task.section,
    raw: {
      ...(task.startTime === null ? {} : { startTime: task.startTime }),
      ...(task.endTime === null ? {} : { endTime: task.endTime }),
    },
    task: task.description,
    classes: task.classes,
    ...(task.id === undefined ? {} : { id: task.id }),
    ...Object.fromEntries(
      GANTT_TAGS.filter((tag) => task.tags.includes(tag)).map((tag) => [
        tag,
        true,
      ]),
    ),
    order: task.order,
  }
}

/**
 * docs/db-from-tree/gantt.md: the summary of the Db that the gantt tree
 * `diagram` of the source `source` denotes (see `dbFromTree()`).
 */
export function ganttDbOf(
  source: string,
  root: TreeRoot,
  diagram: GanttDiagram,
  embedded: EmbeddedValues,
): DbSummary {
  return new GanttDbBuilder(source, root, embedded).summaryOf(diagram)
}
