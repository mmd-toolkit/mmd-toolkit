import type { Range } from "../../src/index.ts"
import type { DiagramPosition, DiagramText } from "../../src/diagram-text.ts"

/** A character of the converted form, with where it was read from. */
interface ConvertedCharacter {
  readonly start: number
  readonly codePoint: number
}

/**
 * Test helper, not public API: the converted form of common.md, Reading a
 * source, of ranges of a diagram's source, as the Db normalization of each
 * diagram document reads the values of the tree: each line terminator as
 * `\n`, each attribute quote as `'`, each entity as its placeholder, and
 * whatever else the diagram's document adds to how its text is read (in
 * flowchart, the whitespace after `}`). The reading is the parser's own:
 * the diagram text is read once from its start by `reader`, as the
 * diagram's lexer reads it, and a range takes the characters read from
 * inside it. Like the text of a range (ast.md, Nodes),
 * it leaves out directives, comment regions, and the `;` that the line rule
 * ignores.
 */
export class ConvertedText {
  /** The characters of the diagram text in converted form, in source order. */
  private readonly characters: readonly ConvertedCharacter[]

  public constructor(reader: DiagramText) {
    const characters: ConvertedCharacter[] = []
    for (
      let position: DiagramPosition = reader.first();
      position !== null;
      position = reader.after(position)
    ) {
      characters.push({ start: position.start, codePoint: position.codePoint })
    }
    this.characters = characters
  }

  /**
   * The converted form of the text of `range`, without the characters in
   * `leftOut`, such as the delimiters of a string.
   */
  public of(range: Range, leftOut: readonly Range[] = []): string {
    return this.characters
      .filter(
        ({ start }) =>
          range[0] <= start &&
          start < range[1] &&
          !leftOut.some(([from, to]) => from <= start && start < to),
      )
      .map(({ codePoint }) => String.fromCodePoint(codePoint))
      .join("")
  }
}
