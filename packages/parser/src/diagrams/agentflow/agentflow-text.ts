import { isWhitespace } from "../../character-classes.ts"
import { LINE_FEED, RIGHT_CURLY_BRACKET } from "../../code-points.ts"
import type {
  DiagramCharacter,
  DiagramPosition,
  DiagramText,
} from "../../diagram-text.ts"

/** diagrams/agentflow.md, Label and closing-brace differences: fold only the first LF after }. */
export class AgentflowText implements DiagramText {
  private readonly text: DiagramText

  public constructor(text: DiagramText) {
    this.text = text
  }

  /** The first character before any brace has been read. */
  public first(): DiagramCharacter {
    return this.text.first()
  }

  /** After }, line whitespace immediately followed by LF is read as that LF. */
  public after(character: DiagramCharacter): DiagramPosition {
    const next = this.text.after(character)
    if (character.codePoint !== RIGHT_CURLY_BRACKET) return next
    let end = next
    while (
      end !== null &&
      end.codePoint !== LINE_FEED &&
      isWhitespace(end.codePoint)
    )
      end = this.text.after(end)
    if (next === null || end?.codePoint !== LINE_FEED) return next
    return {
      codePoint: LINE_FEED,
      start: next.start,
      end: end.end,
      convertedForm: "\n",
      offsetInConvertedForm: 0,
      endOfText: end.endOfText,
      placeholderEnd: null,
    }
  }
}
