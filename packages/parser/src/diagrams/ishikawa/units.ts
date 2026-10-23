import {
  isLineSegmentSeparator,
  isWhitespace,
} from "../../character-classes.ts"
import { LINE_FEED, PERCENT_SIGN } from "../../code-points.ts"
import type { DiagramComment } from "../../diagram-parsing.ts"
import type {
  DiagramCharacter,
  DiagramPosition,
  DiagramText,
} from "../../diagram-text.ts"
import type { DiagramUnit, UnitEnds } from "../../diagram-units.ts"
import { readUnit } from "../../diagram-units.ts"
import type { LineIndex } from "../../positions.ts"
import {
  isCodePointAt,
  matchWholeWordIgnoringCase,
  skipWhile,
  skipWhitespace,
} from "../../scanning.ts"
import { UnitLexer } from "../../unit-lexer.ts"

/** diagrams/ishikawa.md, Units and contexts: the ordered rules' units. */
export type UnitName = "header" | "newline" | "indentation" | "node-text"

/** One unit of the Ishikawa diagram text. */
export type Unit = DiagramUnit<UnitName>

/** Units and contexts: the single context may end the text. */
const END_OF_TEXT_MESSAGES: Readonly<Record<"ordinary", string | null>> = {
  ordinary: null,
}

/** The units and diagram comments in source order. */
export interface IshikawaLexing {
  readonly units: readonly Unit[]
  readonly comments: readonly DiagramComment[]
  /** Whether a header is immediately followed by the appended LF. */
  readonly headerEndsText: boolean
}

/** Units and contexts, rule 4: whitespace other than a physical line break. */
function isIndentation(character: DiagramCharacter): boolean {
  return isWhitespace(character.codePoint) && character.codePoint !== LINE_FEED
}

/** diagrams/ishikawa.md, Lexical structure: first matching rule, in one context. */
export class IshikawaUnitLexer extends UnitLexer<"ordinary", UnitName, Unit> {
  private readonly comments: DiagramComment[] = []

  private headerEndsText = false

  public constructor(reader: DiagramText, lines: LineIndex) {
    super(reader, lines, "ordinary", END_OF_TEXT_MESSAGES)
  }

  /** Reads the units and comments; no string or shape contexts exist. */
  public lex(): IshikawaLexing {
    this.readToEnd()
    this.checkEndOfText()
    return {
      units: this.units,
      comments: this.comments,
      headerEndsText: this.headerEndsText,
    }
  }

  /** Makes a unit, keeping all node-text whitespace when requested. */
  protected override addUnit(
    name: UnitName,
    from: DiagramCharacter,
    to: DiagramPosition,
    ends: UnitEnds = "trim-whitespace",
  ): Unit {
    const unit = readUnit(
      this.reader,
      name,
      this.units.length,
      from,
      to,
      null,
      ends,
    )
    this.units.push(unit)
    return unit
  }

  /** Units and contexts, rules 1 through 5, in order. */
  protected override readInContext(at: DiagramCharacter): void {
    if (this.readComment(at) || this.readHeader(at)) return
    if (at.codePoint === LINE_FEED) {
      this.read("newline", at, this.reader.after(at))
      return
    }
    if (isIndentation(at)) {
      this.read("indentation", at, skipWhile(this.reader, at, isIndentation))
      return
    }
    this.read(
      "node-text",
      at,
      skipWhile(
        this.reader,
        at,
        (character) => character.codePoint !== LINE_FEED,
      ),
      "keep-whitespace",
    )
  }

  /** Rule 1 and Comments: optional whitespace, then %% through the end of its segment. */
  private readComment(at: DiagramCharacter): boolean {
    const first = skipWhitespace(this.reader, at)
    if (!isCodePointAt(first, PERCENT_SIGN)) return false
    const second = this.reader.after(first)
    if (!isCodePointAt(second, PERCENT_SIGN)) return false
    const end = skipWhile(
      this.reader,
      this.reader.after(second),
      (character) =>
        character.codePoint !== LINE_FEED &&
        !isLineSegmentSeparator(character.codePoint),
    )
    if (end === null)
      throw new Error("mmd-toolkit parser bug: a comment has no ending LF")
    this.comments.push({
      range: [first.start, end.start],
      mark: "%%",
      valueStart: second.end,
    })
    if (end.codePoint === LINE_FEED) this.position = end
    else this.read("newline", end, end)
    return true
  }

  /** Rule 2: beta before stable, both bounded and case-insensitive; retain whether only the appended LF follows. */
  private readHeader(at: DiagramCharacter): boolean {
    const match =
      matchWholeWordIgnoringCase(this.reader, at, "ishikawa-beta") ??
      matchWholeWordIgnoringCase(this.reader, at, "ishikawa")
    if (match === null) return false
    this.read("header", at, match.end)
    this.headerEndsText = match.end?.endOfText === true
    return true
  }
}
