import type { Range } from "./ast.ts"
import { isOutsideBmp } from "./character-classes.ts"
import type { ReadCharacter, SourceLexer } from "./source-lexer.ts"

/**
 * common.md, Reading a source: one character of the diagram text in
 * converted form, with the place in the source that it was read from. The
 * `#` and the `;` of an entity are read as the opening and the closing of
 * its placeholder, which are several characters each; they all have the
 * place of that `#` or `;`.
 */
export interface DiagramCharacter {
  /** The character in converted form. */
  readonly codePoint: number
  /** Where the source characters that it was read from start. */
  readonly start: number
  /** The offset after those source characters. */
  readonly end: number
  /** The converted form of those source characters: this character, or the placeholder that it is part of. */
  readonly convertedForm: string
  /** Where this character is in `convertedForm`. */
  readonly offsetInConvertedForm: number
  /** Whether this is the `\n` read after the last character of the source, or stands for whitespace that ends with it. */
  readonly endOfText: boolean
  /**
   * Entities: for the first character of the opening of a placeholder, the
   * offset after the entity's `;`, where the placeholder ends; null for
   * every other character.
   */
  readonly placeholderEnd: number | null
}

/** A place in the diagram text: the character there, or null at the end of the text, after its last character. */
export type DiagramPosition = DiagramCharacter | null

/**
 * common.md, Reading a source: the diagram text as a diagram's lexer reads
 * it, one character at a time. A diagram whose document adds a rule of how
 * its text is read wraps the reader of {@link openDiagramText} in one of
 * its own with this shape.
 */
export interface DiagramText {
  /** The first character of the diagram text. */
  first(): DiagramCharacter
  /** The place after `character`. */
  after(character: DiagramCharacter): DiagramPosition
}

/**
 * common.md, Reading a source, and A directive is a token boundary: the
 * diagram text, read one character at a time from `start`, the first
 * character of the text that is not trivia (common.md, Leading whitespace),
 * through {@link SourceLexer.readAt}. The shared lexer gives the characters in
 * converted form and reads through comment regions and the `;` that the
 * line rule ignores. This reader reads through the directives as well: the
 * rules after the directive scan read the text without its directives, and
 * a diagram's lexer and grammar never see one. The `\n` that the shared
 * lexer reads after the last character of the source is the last character
 * of the diagram text.
 *
 * Nothing is kept but the ranges of the directives that were read through,
 * which the common rule for a directive inside a unit needs (see
 * `diagram-parsing.ts`): every character is read from the source where it
 * is asked for.
 */
export class DiagramTextReader implements DiagramText {
  /** The ranges of the directives read through so far, in source order. */
  private readonly directivesReadThrough: Range[] = []

  private readonly lexer: SourceLexer

  /** Where the diagram text starts. */
  private readonly start: number

  public constructor(lexer: SourceLexer, start: number) {
    this.lexer = lexer
    this.start = start
  }

  /**
   * The ranges of the directives read through so far, in source order.
   * These are the directives between characters of the diagram text; a
   * directive inside a comment region is read through with the region and
   * is not one of them.
   */
  public get directives(): readonly Range[] {
    return this.directivesReadThrough
  }

  /** The first character of the diagram text: the one at `start`. */
  public first(): DiagramCharacter {
    return firstCharacterOf(this.readCharacter(this.start))
  }

  /** The place after `character`. */
  public after(character: DiagramCharacter): DiagramPosition {
    const nextInConvertedForm =
      character.offsetInConvertedForm +
      (isOutsideBmp(character.codePoint) ? 2 : 1)
    const codePoint = character.convertedForm.codePointAt(nextInConvertedForm)
    if (codePoint !== undefined) {
      return {
        ...character,
        codePoint,
        offsetInConvertedForm: nextInConvertedForm,
        placeholderEnd: null,
      }
    }
    if (character.endOfText) return null
    return firstCharacterOf(this.readCharacter(character.end))
  }

  /**
   * The next character that the shared lexer reads from `offset`, after the
   * directives there. The text is read from its start without a gap, so a
   * directive that was not read through before starts after all those that
   * were.
   */
  private readCharacter(offset: number): ReadCharacter {
    let current = offset
    for (;;) {
      const element = this.lexer.readAt(current)
      if (element.kind === "character") return element
      const last = this.directivesReadThrough.at(-1)
      if (last === undefined || last[0] < element.start) {
        this.directivesReadThrough.push([element.start, element.end])
      }
      current = element.end
    }
  }
}

/** The first character of the converted form of `read`. */
function firstCharacterOf(read: ReadCharacter): DiagramCharacter {
  const codePoint = read.text.codePointAt(0)
  if (codePoint === undefined) {
    throw new Error(
      `mmd-toolkit parser bug: the character at ${read.start} has an empty converted form`,
    )
  }
  return {
    codePoint,
    start: read.start,
    end: read.end,
    convertedForm: read.text,
    offsetInConvertedForm: 0,
    endOfText: read.endOfText,
    placeholderEnd: read.placeholderEnd,
  }
}
