import { isWhitespace } from "../../character-classes.ts"
import type {
  DiagramCharacter,
  DiagramPosition,
  DiagramText,
} from "../../diagram-text.ts"

/**
 * diagrams/sankey.md, Lexical structure, The end of the text: the diagram
 * text as the sankey lexer reads it, which ends at its last character that
 * is not whitespace. The whitespace after it, line feeds included, and the
 * `\n` that the lexer reads after the last character (common.md, End of
 * text), are not read.
 */
export class SankeyText implements DiagramText {
  private readonly text: DiagramText

  /** The end of the last character of the diagram text that is not whitespace. */
  private readonly end: number

  public constructor(text: DiagramText) {
    this.text = text
    let end = 0
    for (
      let character: DiagramPosition = text.first();
      character !== null;
      character = text.after(character)
    ) {
      if (!isWhitespace(character.codePoint)) end = character.end
    }
    this.end = end
  }

  /** The first character of the diagram text, the first of the header, which is not whitespace. */
  public first(): DiagramCharacter {
    return this.text.first()
  }

  /** The place after `character`; null after the last character that is not whitespace. */
  public after(character: DiagramCharacter): DiagramPosition {
    const next = this.text.after(character)
    return next === null || next.start >= this.end ? null : next
  }
}
