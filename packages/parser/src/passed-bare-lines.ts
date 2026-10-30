import type { PassedPart } from "./detection.ts"
import type {
  DiagramCharacter,
  DiagramPosition,
  DiagramText,
} from "./diagram-text.ts"
import { firstIndexWhere } from "./ordered-search.ts"

/**
 * common.md, Diagram detection: the diagram text of a diagram type that
 * keeps the forms retained before its header (those that `diagramInputOf`
 * in `src/parse.ts` names), without the bare `%%` lines that detection
 * passed and the trivia that it passed with each. Those lines are diagram
 * comments already and are not read again; the retained forms between them
 * stay readable.
 *
 * The first character needs no skip: the text starts at `textStart` of
 * `diagramInputOf` (`src/parse.ts`), which is the start of a retained
 * frontmatter block, the opening of the first directive found once more, or
 * the position that detection reached. Each is a place that detection
 * reached after trivia, so it is a character of the text itself, and no
 * passed line contains it: detection records a passed line only from a
 * place it reached, and goes on after the line, so every passed line ends
 * at or before the next place reached.
 */
export class DiagramTextWithoutPassedLines implements DiagramText {
  private readonly reader: DiagramText

  /** The passed bare lines, in source order, each from its `%%` up to the place after its trivia. */
  private readonly lines: readonly Extract<
    PassedPart,
    { kind: "bare-percent-line" }
  >[]

  public constructor(reader: DiagramText, passed: readonly PassedPart[]) {
    this.reader = reader
    this.lines = passed.filter((part) => part.kind === "bare-percent-line")
  }

  public first(): DiagramCharacter {
    return this.reader.first()
  }

  public after(character: DiagramCharacter): DiagramPosition {
    return this.outsidePassedLines(this.reader.after(character))
  }

  /**
   * The first character from `position` on that lies in no passed line. The
   * first line that may hold it is found by its position: looking through
   * every passed line for every character of the text would take time in
   * the square of their number.
   */
  private outsidePassedLines(position: DiagramPosition): DiagramPosition {
    if (position === null) return null
    let index = firstIndexWhere(
      this.lines,
      (line) => line.next > position.start,
    )
    let next: DiagramPosition = position
    while (next !== null) {
      const line = this.lines[index]
      if (line === undefined || next.start < line.start) return next
      if (next.start < line.next) next = this.reader.after(next)
      else index += 1
    }
    return null
  }
}
