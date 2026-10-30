import { isWhitespace } from "../../character-classes.ts"
import { LINE_FEED, RIGHT_CURLY_BRACKET } from "../../code-points.ts"
import type {
  DiagramCharacter,
  DiagramPosition,
  DiagramText,
} from "../../diagram-text.ts"

/**
 * diagrams/flowchart.md, Lexical structure: the diagram text as the
 * flowchart lexer reads it: the diagram text of common.md, read by `text`,
 * with the rule of Whitespace after `}`. Right after a `}`, whitespace that
 * contains a line feed is read, up to and including its last line feed, as
 * one line feed, which has the place of that whitespace. The whitespace is
 * that of the diagram text, so comment regions and directives inside it are
 * left out.
 */
export class FlowchartText implements DiagramText {
  private readonly text: DiagramText

  public constructor(text: DiagramText) {
    this.text = text
  }

  /** The first character of the diagram text. */
  public first(): DiagramCharacter {
    return this.text.first()
  }

  /** The place after `character`, with the rule of Whitespace after `}`. */
  public after(character: DiagramCharacter): DiagramPosition {
    const next = this.text.after(character)
    if (character.codePoint !== RIGHT_CURLY_BRACKET) return next
    let lastLineFeed: DiagramCharacter | null = null
    for (
      let whitespace = next;
      whitespace !== null && isWhitespace(whitespace.codePoint);
      whitespace = this.text.after(whitespace)
    ) {
      if (whitespace.codePoint === LINE_FEED) lastLineFeed = whitespace
    }
    if (next === null || lastLineFeed === null) return next
    return {
      codePoint: LINE_FEED,
      start: next.start,
      end: lastLineFeed.end,
      convertedForm: "\n",
      offsetInConvertedForm: 0,
      endOfText: lastLineFeed.endOfText,
      placeholderEnd: null,
    }
  }
}
