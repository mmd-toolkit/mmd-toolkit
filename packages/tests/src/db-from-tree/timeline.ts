import type { EmbeddedValues } from "../mermaid.ts"
import type { DbSummary } from "../types.ts"
import { ConvertedText, readConvertedCharacters } from "./converted-text.ts"
import type { TextReplacement } from "./text-replacement.ts"
import { textReplacementOf } from "./text-replacement.ts"
import type {
  TimelineDiagram,
  TimelineLiteral,
  TimelinePeriodStatement,
  TimelineStatement,
} from "./timeline-tree.ts"
import type { TreeRoot } from "./tree.ts"
import { descriptionOf, trimmed } from "./values.ts"

// docs/db-from-tree/timeline.md: the summary of the Db that a timeline tree
// denotes, in the form of `normalizeTimeline()` of `@mmd-toolkit/tests`. The
// statements are executed in source order, as mermaid.js executes them while
// it parses; each step names the paragraph of "Building the summary from the
// tree" that defines it. Every value is read in converted form (see
// `converted-text.ts`).

/** The direction of a diagram whose header has none. */
const DEFAULT_DIRECTION = "LR"

/** The builder of the summary: the statements are executed in source order. */
class TimelineDbBuilder {
  private direction = DEFAULT_DIRECTION

  private title = ""

  private accTitle = ""

  private accDescr = ""

  private readonly sections: string[] = []

  private readonly tasks: {
    section: string
    task: string
    events: string[]
  }[] = []

  /** The converted form of ranges of the source. */
  private readonly text: ConvertedText

  /** The replacement of characters that the configuration gives the texts that the Db keeps. */
  private readonly replace: TextReplacement

  public constructor(source: string, root: TreeRoot, embedded: EmbeddedValues) {
    this.text = new ConvertedText(readConvertedCharacters(source, root))
    this.replace = textReplacementOf(embedded.config)
  }

  /** The summary of `diagram`. */
  public summaryOf(diagram: TimelineDiagram): DbSummary {
    if (diagram.direction !== null) {
      this.direction = diagram.direction.toUpperCase()
    }
    for (const statement of diagram.body) this.execute(statement)
    return {
      direction: this.direction,
      title: this.title,
      accTitle: this.accTitle,
      accDescr: this.accDescr,
      sections: this.sections,
      tasks: this.tasks,
    }
  }

  /** Executing: what one statement changes. */
  private execute(statement: TimelineStatement): void {
    switch (statement.type) {
      case "TimelinePeriodStatement":
        this.executePeriod(statement)
        break
      case "TimelineEventStatement":
        this.addEvents(statement.events)
        break
      case "TimelineTitleStatement":
        this.title = this.replace(this.textOf(statement.value))
        break
      case "TimelineSectionStatement":
        this.sections.push(this.textOf(statement.name))
        break
      case "TimelineAccTitleStatement":
        this.accTitle = this.replace(trimmed(this.textOf(statement.value)))
        break
      case "TimelineAccDescrStatement":
        this.accDescr = this.replace(
          descriptionOf(this.textOf(statement.value)),
        )
        break
      case "TimelineAccDescrBlockStatement":
        // A block without text changes nothing.
        if (statement.value !== null) {
          this.accDescr = this.replace(
            descriptionOf(this.textOf(statement.value)),
          )
        }
        break
      default:
        throw new Error(
          `timeline Db: unknown statement ${JSON.stringify(statement satisfies never)}`,
        )
    }
  }

  /** Periods: adds the task of a period statement, with its events. */
  private executePeriod(statement: TimelinePeriodStatement): void {
    this.tasks.push({
      section: this.sections.at(-1) ?? "",
      task: this.textOf(statement.period),
      events: [],
    })
    this.addEvents(statement.events)
  }

  /** Events: adds the events to the last task, which a statement between them and it does not change. */
  private addEvents(events: readonly TimelineLiteral[]): void {
    const task = this.tasks.at(-1)
    if (task === undefined) {
      // The input that has an event before every period is rejected.
      throw new Error("timeline Db: an event before every period")
    }
    for (const event of events) task.events.push(this.textOf(event))
  }

  /** The text of a leaf node: the converted form of its range. */
  private textOf(node: TimelineLiteral): string {
    return this.text.of(node.range)
  }
}

/**
 * docs/db-from-tree/timeline.md: the summary of the Db that the timeline tree
 * `diagram` of the source `source` denotes (see `dbFromTree()`).
 */
export function timelineDbOf(
  source: string,
  root: TreeRoot,
  diagram: TimelineDiagram,
  embedded: EmbeddedValues,
): DbSummary {
  return new TimelineDbBuilder(source, root, embedded).summaryOf(diagram)
}
