import type { EmbeddedValues } from "../mermaid.ts"
import { numberOrText } from "../summary-number.ts"
import type { DbSummary, JsonObject } from "../types.ts"
import { ConvertedText, readConvertedCharacters } from "./converted-text.ts"
import type {
  JourneyDiagram,
  JourneyLiteral,
  JourneyStatement,
  JourneyTaskStatement,
} from "./journey-tree.ts"
import type { TextReplacement } from "./text-replacement.ts"
import { textReplacementOf } from "./text-replacement.ts"
import type { TreeRoot } from "./tree.ts"
import { descriptionOf, trimmed } from "./values.ts"

// docs/db-from-tree/journey.md: the summary of the Db that a journey tree
// denotes, in the form of `normalizeJourney()` of `@mmd-toolkit/tests`. The
// statements are executed in source order, as mermaid.js executes them while
// it parses; each step names the paragraph of "Building the summary from the
// tree" that defines it. Every value is read in converted form (see
// `converted-text.ts`).

/** The builder of the summary: the statements are executed in source order. */
class JourneyDbBuilder {
  private title: string

  private accTitle = ""

  private accDescr = ""

  private readonly sections: string[] = []

  private readonly tasks: JsonObject[] = []

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
  public summaryOf(diagram: JourneyDiagram): DbSummary {
    for (const statement of diagram.body) this.execute(statement)
    return {
      title: this.title,
      accTitle: this.accTitle,
      accDescr: this.accDescr,
      sections: this.sections,
      tasks: this.tasks,
    }
  }

  /** Executing: what one statement changes. */
  private execute(statement: JourneyStatement): void {
    switch (statement.type) {
      case "JourneyTaskStatement":
        this.executeTask(statement)
        break
      case "JourneyTitleStatement":
        this.title = this.replace(this.textOf(statement.value))
        break
      case "JourneySectionStatement":
        this.sections.push(this.textOf(statement.name))
        break
      case "JourneyAccTitleStatement":
        this.accTitle = this.replace(trimmed(this.textOf(statement.value)))
        break
      case "JourneyAccDescrStatement":
        this.accDescr = this.replace(
          descriptionOf(this.textOf(statement.value)),
        )
        break
      case "JourneyAccDescrBlockStatement":
        // A block without text changes nothing.
        if (statement.value !== null) {
          this.accDescr = this.replace(
            descriptionOf(this.textOf(statement.value)),
          )
        }
        break
      default:
        throw new Error(
          `journey Db: unknown statement ${JSON.stringify(statement satisfies never)}`,
        )
    }
  }

  /** Tasks: adds the task of a task statement. */
  private executeTask(statement: JourneyTaskStatement): void {
    this.tasks.push({
      section: this.sections.at(-1) ?? "",
      task: this.textOf(statement.description),
      people: statement.people.map((person) =>
        person === null ? "" : trimmed(this.textOf(person)),
      ),
      score:
        statement.score === null ? 0 : scoreOf(this.textOf(statement.score)),
    })
  }

  /** The text of a leaf node: the converted form of its range. */
  private textOf(node: JourneyLiteral): string {
    return this.text.of(node.range)
  }
}

/**
 * Tasks: the score that the text of a score part writes: the number that
 * JavaScript makes of the text, as a summary holds it (see
 * {@link numberOrText}).
 */
function scoreOf(text: string): number | string {
  return numberOrText(Number(text))
}

/**
 * docs/db-from-tree/journey.md: the summary of the Db that the journey tree
 * `diagram` of the source `source` denotes (see `dbFromTree()`).
 */
export function journeyDbOf(
  source: string,
  root: TreeRoot,
  diagram: JourneyDiagram,
  embedded: EmbeddedValues,
): DbSummary {
  return new JourneyDbBuilder(source, root, embedded).summaryOf(diagram)
}
