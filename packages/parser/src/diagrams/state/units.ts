import type { Range } from "../../ast.ts"
import {
  isAsciiDigit,
  isLineSegmentSeparator,
  isWhitespace,
  isWordCharacter,
} from "../../character-classes.ts"
import {
  COLON,
  COMMA,
  HYPHEN_MINUS,
  LEFT_CURLY_BRACKET,
  LINE_FEED,
  NUMBER_SIGN,
  PERCENT_SIGN,
  QUOTATION_MARK,
  RIGHT_CURLY_BRACKET,
  SEMICOLON,
} from "../../code-points.ts"
import type { DiagramComment } from "../../diagram-parsing.ts"
import type {
  DiagramCharacter,
  DiagramPosition,
  DiagramText,
} from "../../diagram-text.ts"
import { lineFeedAfter } from "../../diagram-text.ts"
import type { DiagramUnit, UnitEnds } from "../../diagram-units.ts"
import { readUnit } from "../../diagram-units.ts"
import { DirectionLineRule } from "../../direction-line.ts"
import { ParseError } from "../../errors.ts"
import type { LineIndex } from "../../positions.ts"
import type { Match } from "../../scanning.ts"
import {
  isCodePointAt,
  matchSpacedWords,
  matchWholeWordIgnoringCase,
  matchWordIgnoringCase,
  samePosition,
  skipWhile,
  skipWhitespace,
} from "../../scanning.ts"

/** diagrams/state.md, Units and contexts: the names of the units. */
export type UnitName =
  | "click"
  | "href"
  | "string"
  | "empty-string"
  | "default"
  | "direction-text"
  | "direction"
  | "direction-value"
  | "newline"
  | "scale"
  | "accTitle"
  | "accDescr"
  | ":"
  | "{"
  | "}"
  | "classDef"
  | "class"
  | "style"
  | "state"
  | "note"
  | "header"
  | "hide"
  | "empty"
  | "description-word"
  | "[*]"
  | "id"
  | "description"
  | "-->"
  | ":::"
  | "invalid"
  | "--"
  | "pseudostate-name"
  | PseudostateMark
  | "as"
  | "state-name"
  | "alias-id"
  | "second-description"
  | "ignored-text"
  | "ignored-state"
  | "class-name"
  | "id-comma"
  | ","
  | "css-class"
  | "style-text"
  | "number"
  | "width"
  | "position"
  | "of"
  | "note-id"
  | "note-text"
  | "end"
  | "floating-note-id"
  | "floating-note-text"
  | '"'
  | "title-text"
  | "description-text"
  | "description-block-text"

/** The state context, rule 4: the pseudostate marks, in the order in which they are tried. */
export const PSEUDOSTATE_MARKS = [
  "<<fork>>",
  "<<join>>",
  "<<choice>>",
  "[[fork]]",
  "[[join]]",
  "[[choice]]",
] as const

/** The state context, rule 4: a pseudostate mark. */
export type PseudostateMark = (typeof PSEUDOSTATE_MARKS)[number]

/**
 * `docs/tokens/state.md`, Tokens: the two parts of a `description` unit, its `:` and
 * the text after it, which are tokens of their own.
 */
export interface DescriptionParts {
  readonly colon: Unit
  readonly text: Unit
}

/** diagrams/state.md, Units and contexts: one unit of the diagram text. */
export interface Unit extends DiagramUnit<UnitName> {
  /** For a `description` unit, its parts; null for every other unit. */
  readonly description: DescriptionParts | null
  /**
   * The note text context, rule 1: for the `:` unit of a note on one line,
   * whether two or more whitespace characters precede it, so that
   * mermaid.js reads it as the first character of the note text; null for
   * every other unit.
   */
  readonly startsNoteText: boolean | null
}

/** diagrams/state.md, Units and contexts: the contexts of the lexer. */
type Context =
  | "statement"
  | "composite"
  | "state"
  | "state-string"
  | "alias-id"
  | "classDef"
  | "class"
  | "style"
  | "styles"
  | "class-name"
  | "scale"
  | "note"
  | "note-id"
  | "note-text"
  | "floating-note"
  | "floating-note-id"
  | "title"
  | "description"
  | "description-block"

/**
 * Units and contexts: for each context, null when the text may end in it,
 * because its rules may read nothing, as in the statement context and the
 * state context, where a line feed or nothing ends what was read; otherwise
 * the message of the error when the text ends in it, which says what is
 * not closed.
 */
const END_OF_TEXT_MESSAGES: Readonly<Record<Context, string | null>> = {
  statement: null,
  composite: "The composite state has no } before the end of the text",
  state: null,
  "state-string": 'The string has no closing " before the end of the text',
  "alias-id": null,
  classDef: "classDef has no class name before the end of the text",
  class: "class has no state before the end of the text",
  style: "style has no state before the end of the text",
  styles: null,
  "class-name": null,
  scale: "scale has no width before the end of the text",
  note: "The note has no text before the end of the text",
  "note-id": "The note has no state before the end of the text",
  "note-text": "The note has no end note before the end of the text",
  "floating-note": "The floating note has no as before the end of the text",
  "floating-note-id": null,
  title: null,
  description: null,
  "description-block": null,
}

/** The direction line: the values, in the order in which they are tried. */
const DIRECTION_LINE_VALUES: readonly string[] = ["TB", "BT", "RL", "LR"]

/** The statement context, rule 20: the header keywords, the longer first. */
const HEADER_KEYWORDS: readonly string[] = ["stateDiagram-v2", "stateDiagram"]

/** The note context, rule 1: the first words of the positions. */
const NOTE_SIDES: readonly string[] = ["left", "right"]

/** diagrams/state.md, Lexical structure: what the lexer reads from the diagram text. */
export interface StateLexing {
  readonly units: readonly Unit[]
  /** The diagram comments, in source order. */
  readonly comments: readonly DiagramComment[]
}

/**
 * diagrams/state.md, Lexical structure: the lexer that divides the diagram
 * text into units. It keeps a stack of contexts and, at each place,
 * applies the first rule of the current context that matches. The rules
 * are those of the specification, in its order; each method that reads a
 * context names the section it follows. Letters are compared
 * case-insensitively.
 */
export class StateUnitLexer {
  private readonly reader: DiagramText

  private readonly lines: LineIndex

  private readonly units: Unit[] = []

  private readonly comments: DiagramComment[] = []

  /** The stack of contexts; the last one is the current context. */
  private readonly contexts: Context[] = ["statement"]

  /** For each context on the stack but the statement context, where it was entered, for the error at the end of the text. */
  private readonly entries: Range[] = []

  /** The place of the next character to read; null at the end of the text. */
  private position: DiagramPosition

  /** The state string context: the `"` that opened the string. */
  private stringStart: DiagramCharacter | null = null

  /** The statement context, rule 5: the direction line, with the values of state. */
  private readonly directionLine: DirectionLineRule

  public constructor(reader: DiagramText, lines: LineIndex) {
    this.reader = reader
    this.lines = lines
    this.position = reader.first()
    this.directionLine = new DirectionLineRule(
      reader,
      DIRECTION_LINE_VALUES,
      matchWordIgnoringCase,
    )
  }

  /**
   * Divides the diagram text into units. Throws `ParseError` where no rule
   * matches and where the text ends in a context that may not end there.
   */
  public lex(): StateLexing {
    while (this.position !== null) {
      const context = this.currentContext()
      this.readInContext(this.position, context)
    }
    this.checkEndOfText()
    return {
      units: this.units,
      comments: this.comments,
    }
  }

  /** The current context: the top of the stack. */
  private currentContext(): Context {
    return this.contexts[this.contexts.length - 1]
  }

  /** Units and contexts: enters `context`, entered at `entry`. */
  private enter(context: Context, entry: Range): void {
    this.contexts.push(context)
    this.entries.push(entry)
  }

  /** Units and contexts: leaves the current context; leaving the statement context keeps it. */
  private leave(): void {
    if (this.contexts.length > 1) {
      this.contexts.pop()
      this.entries.pop()
    }
  }

  /** Leaves the current context and enters `context` in its place, entered where the current one was. */
  private replace(context: Context): void {
    const entry = this.entries.at(-1)
    this.leave()
    this.enter(context, entry ?? [0, 0])
  }

  /**
   * Adds the unit named `name` that reads the characters from `from` up to,
   * and not including, `to`, whose token leaves out the whitespace at its
   * ends as `ends` says.
   */
  private addUnit(
    name: UnitName,
    from: DiagramCharacter,
    to: DiagramPosition,
    ends: UnitEnds = "trim-whitespace",
    startsNoteText: boolean | null = null,
  ): Unit {
    if (name === "{" || name === "ignored-text") this.markIgnoredStates()
    const unit: Unit = {
      ...readUnit(this.reader, name, this.units.length, from, to, null, ends),
      description: null,
      startsNoteText,
    }
    this.units.push(unit)
    return unit
  }

  /**
   * The statement context, rule 17, for a `{` or an `ignored-text` unit about
   * to be added: when the last unit before it that is not an `empty-string`
   * unit is a `state` unit, that unit is an `ignored-state` unit instead,
   * which mermaid.js reads no token for, so that the `{` starts the body of
   * the statement before it; and so is a `state` unit before an
   * `ignored-state` unit in the same way, from right to left.
   */
  private markIgnoredStates(): void {
    let index = this.units.length - 1
    for (;;) {
      while (this.units[index]?.name === "empty-string") index -= 1
      const unit = this.units[index]
      if (unit?.name !== "state") return
      this.units[index] = { ...unit, name: "ignored-state" }
      index -= 1
    }
  }

  /** Reads the unit named `name` from `at` up to `to`, and goes on after it. */
  private read(
    name: UnitName,
    at: DiagramCharacter,
    to: DiagramPosition,
  ): Unit {
    const unit = this.addUnit(name, at, to)
    this.position = to
    return unit
  }

  /**
   * The error for a place where no rule of the current context matches:
   * the character there, or, when only whitespace follows, so that the
   * text ends in the context, the error of the end of the text.
   */
  private noRuleMatches(at: DiagramCharacter): ParseError {
    const endOfText = this.endOfTextError()
    if (skipWhitespace(this.reader, at) === null && endOfText !== null) {
      return endOfText
    }
    const range: Range = [at.start, at.end]
    return new ParseError(
      "Unexpected character",
      range,
      this.lines.location(range),
    )
  }

  /** Units and contexts: throws when the text ends in a context that may not end there. */
  private checkEndOfText(): void {
    const error = this.endOfTextError()
    if (error !== null) throw error
  }

  /**
   * Units and contexts: the error when the text ends in the current
   * context, at what entered it, saying what is not closed; null when the
   * text may end there.
   */
  private endOfTextError(): ParseError | null {
    const message = END_OF_TEXT_MESSAGES[this.currentContext()]
    if (message === null) return null
    const range = this.entries.at(-1) ?? [0, 0]
    return new ParseError(message, range, this.lines.location(range))
  }

  /** Applies the first rule of `context` that matches at `at`. */
  private readInContext(at: DiagramCharacter, context: Context): void {
    switch (context) {
      case "statement":
        this.readInStatementContext(at)
        return
      case "composite":
        this.readInCompositeContext(at)
        return
      case "state":
        this.readInStateContext(at)
        return
      case "state-string":
        this.readInStateStringContext(at)
        return
      case "alias-id":
        this.readAliasId(at)
        return
      case "classDef":
        this.readInClassDefContext(at)
        return
      case "class":
        this.readInClassContext(at)
        return
      case "style":
        this.readInStyleContext(at)
        return
      case "styles":
        this.readStyles(at)
        return
      case "class-name":
        this.readRestOfLine(at, "css-class")
        return
      case "scale":
        this.readInScaleContext(at)
        return
      case "note":
        this.readInNoteContext(at)
        return
      case "note-id":
        this.readNoteId(at)
        return
      case "note-text":
        this.readInNoteTextContext(at)
        return
      case "floating-note":
        this.readInFloatingNoteContext(at)
        return
      case "floating-note-id":
        this.readFloatingNoteId(at)
        return
      case "title":
        this.readRestOfLine(at, "title-text")
        return
      case "description":
        this.readRestOfLine(at, "description-text")
        return
      case "description-block":
        this.readInDescriptionBlockContext(at)
        return
      default:
        throw new Error(
          `mmd-toolkit parser bug: unknown context ${JSON.stringify(context satisfies never)}`,
        )
    }
  }

  /** diagrams/state.md, The statement context: rules 1 to 27, in order. */
  private readInStatementContext(at: DiagramCharacter): void {
    if (
      this.readKeyword(at, "click", "click") ||
      this.readKeyword(at, "href", "href") ||
      this.readStatementString(at) ||
      this.readKeyword(at, "default", "default") ||
      this.readDirectionLine(at) ||
      this.readLineFeeds(at) ||
      this.skipWhitespaceOf(at, isWhitespace) ||
      this.readHashComment(at) ||
      this.readPercentComment(at) ||
      this.readIgnoredPercent(at) ||
      this.readEnteringKeyword(at, "scale", "scale", "scale") ||
      this.readAccessibilityKeyword(at) ||
      this.readEnteringKeyword(at, "classDef", "classDef", "classDef") ||
      this.readEnteringKeyword(at, "class", "class", "class") ||
      this.readEnteringKeyword(at, "style", "style", "style") ||
      this.readEnteringKeyword(at, "state", "state", "state") ||
      this.readOpeningBrace(at) ||
      this.readEnteringKeyword(at, "note", "note", "note") ||
      this.readHeader(at) ||
      this.readHide(at) ||
      this.readFixed(at, "[*]", "[*]") ||
      this.readId(at, "id") ||
      this.readDescription(at) ||
      this.readFixed(at, "-->", "-->") ||
      this.readFixed(at, ":::", ":::")
    ) {
      return
    }
    // Rule 27: any other character.
    this.read("invalid", at, this.reader.after(at))
  }

  /** diagrams/state.md, The composite body context: rules 1 to 14, in order. */
  private readInCompositeContext(at: DiagramCharacter): void {
    if (
      this.skipWhitespaceOf(at, isLineWhitespaceOrSeparator) ||
      this.readHashComment(at) ||
      this.readPercentComment(at) ||
      this.readEnteringKeyword(at, "classDef", "classDef", "classDef") ||
      this.readEnteringKeyword(at, "class", "class", "class") ||
      this.readEnteringKeyword(at, "style", "style", "style") ||
      this.readEnteringKeyword(at, "state", "state", "state") ||
      this.readDirectionLine(at) ||
      this.readClosingBrace(at) ||
      this.skipLineFeed(at) ||
      this.readEnteringKeyword(at, "note", "note", "note") ||
      this.readFixed(at, "[*]", "[*]") ||
      this.readId(at, "id") ||
      this.readDescription(at) ||
      this.readFixed(at, "-->", "-->") ||
      this.readFixed(at, "--", "--") ||
      this.readFixed(at, ":::", ":::")
    ) {
      return
    }
    throw this.noRuleMatches(at)
  }

  /** diagrams/state.md, The state context: rules 1 to 10, in order. */
  private readInStateContext(at: DiagramCharacter): void {
    if (
      this.skipWhitespaceOf(at, isLineWhitespaceOrSeparator) ||
      this.readHashComment(at) ||
      this.readPercentComment(at) ||
      this.readPseudostate(at) ||
      this.readStateStringStart(at) ||
      this.readAs(at) ||
      this.rejectTwoNames(at) ||
      this.readStateName(at)
    ) {
      return
    }
    if (at.codePoint === LINE_FEED) {
      // Rule 9: a line feed leaves the state context.
      this.position = this.reader.after(at)
      this.leave()
      return
    }
    if (at.codePoint === LEFT_CURLY_BRACKET) {
      // Rule 10: `{` leaves the state context and enters a composite body.
      this.read("{", at, this.reader.after(at))
      this.leave()
      this.enter("composite", [at.start, at.end])
      return
    }
    throw this.noRuleMatches(at)
  }

  /**
   * The statement context, rule 3: `"`, the characters up to the next `"`,
   * line feeds included, and that `"`, a `string` unit. Without a `"`
   * after the first, the rule does not match.
   */
  private readStatementString(at: DiagramCharacter): boolean {
    if (at.codePoint !== QUOTATION_MARK) return false
    const closing = skipWhile(
      this.reader,
      this.reader.after(at),
      (character) => character.codePoint !== QUOTATION_MARK,
    )
    if (closing === null) return false
    this.read("string", at, this.reader.after(closing))
    return true
  }

  /** The statement context, rule 5, and the composite body context, rule 5: a direction line (see `DirectionLineRule`). */
  private readDirectionLine(at: DiagramCharacter): boolean {
    const line = this.directionLine.match(at)
    if (line === null) return false
    for (const unit of line.units) this.addUnit(unit.name, unit.from, unit.to)
    this.position = line.end
    return true
  }

  /** The statement context, rule 6: one or more line feeds, a `newline` unit. */
  private readLineFeeds(at: DiagramCharacter): boolean {
    if (at.codePoint !== LINE_FEED) return false
    this.read(
      "newline",
      at,
      skipWhile(
        this.reader,
        at,
        (character) => character.codePoint === LINE_FEED,
      ),
    )
    return true
  }

  /** One or more characters that `accepts` takes: nothing. */
  private skipWhitespaceOf(
    at: DiagramCharacter,
    accepts: (codePoint: number) => boolean,
  ): boolean {
    if (!accepts(at.codePoint)) return false
    this.position = skipWhile(this.reader, at, (character) =>
      accepts(character.codePoint),
    )
    return true
  }

  /** The composite body context, rule 7: a line feed, nothing. */
  private skipLineFeed(at: DiagramCharacter): boolean {
    if (at.codePoint !== LINE_FEED) return false
    this.position = this.reader.after(at)
    return true
  }

  /** Comments: `#` and the rest of its line, up to the line feed, a diagram comment whose mark is `#`. */
  private readHashComment(at: DiagramCharacter): boolean {
    if (at.codePoint !== NUMBER_SIGN) return false
    this.readComment(at, "#", at.end)
    return true
  }

  /** Comments: `%%` not followed by `{`, and the rest of its line, a diagram comment whose mark is `%%`. */
  private readPercentComment(at: DiagramCharacter): boolean {
    const second = this.reader.after(at)
    if (!this.startsPercentComment(at) || second === null) return false
    this.readComment(at, "%%", second.end)
    return true
  }

  /** Comments: whether `%%` not followed by `{` starts at `at`. */
  private startsPercentComment(at: DiagramCharacter): boolean {
    const second = this.reader.after(at)
    return (
      at.codePoint === PERCENT_SIGN &&
      second?.codePoint === PERCENT_SIGN &&
      !isCodePointAt(this.reader.after(second), LEFT_CURLY_BRACKET)
    )
  }

  /**
   * The statement context, rule 9: `%%` followed by a `{` that starts no
   * directive, an `ignored-text` unit, which mermaid.js does not read. A
   * `{` that starts a directive is never read here, since the directives
   * are not in the text. The composite body context has no such rule: the
   * `%%` is an id there, and the `{` has no rule.
   */
  private readIgnoredPercent(at: DiagramCharacter): boolean {
    const second = this.reader.after(at)
    if (at.codePoint !== PERCENT_SIGN || second?.codePoint !== PERCENT_SIGN) {
      return false
    }
    const after = this.reader.after(second)
    if (!isCodePointAt(after, LEFT_CURLY_BRACKET)) return false
    this.read("ignored-text", at, after)
    return true
  }

  /** A diagram comment from its mark `mark` at `at` to the end of its line, whose value starts at `valueStart`. */
  private readComment(
    at: DiagramCharacter,
    mark: "#" | "%%",
    valueStart: number,
  ): void {
    const lineFeed = lineFeedAfter(this.reader, at)
    this.comments.push({
      range: [at.start, lineFeed.start],
      mark,
      valueStart,
    })
    this.position = lineFeed
  }

  /** The keyword `word` at `at`, compared case-insensitively and not followed by a word character, a unit named `name`. */
  private readKeyword(
    at: DiagramCharacter,
    word: string,
    name: UnitName,
  ): boolean {
    const match = matchWholeWordIgnoringCase(this.reader, at, word)
    if (match === null) return false
    this.read(name, at, match.end)
    return true
  }

  /**
   * The statement context, rules 10 and 14 to 19: `word`, compared
   * case-insensitively, and one or more whitespace characters, line feeds
   * included: a unit named `name`; enters `context`. The whitespace belongs
   * to no unit.
   */
  private readEnteringKeyword(
    at: DiagramCharacter,
    word: string,
    name: UnitName,
    context: Context,
  ): boolean {
    const match = matchWordIgnoringCase(this.reader, at, word)
    if (match === null || !isWhitespaceCharacter(match.end)) return false
    this.addUnit(name, at, match.end)
    this.position = skipWhitespace(this.reader, match.end)
    this.enter(context, [at.start, match.end?.start ?? at.end])
    return true
  }

  /**
   * The statement context, rules 11 to 13: `accTitle` or `accDescr`, zero or
   * more whitespace, and `:` or `{`, followed by zero or more whitespace:
   * the keyword unit and a unit of the `:` or `{`; enters the title, the
   * description, or the description block context.
   */
  private readAccessibilityKeyword(at: DiagramCharacter): boolean {
    for (const word of ["accTitle", "accDescr"] as const) {
      const match = matchWordIgnoringCase(this.reader, at, word)
      if (match === null) continue
      const mark = skipWhitespace(this.reader, match.end)
      const isColon = isCodePointAt(mark, COLON)
      const isBrace =
        word === "accDescr" && isCodePointAt(mark, LEFT_CURLY_BRACKET)
      if (mark === null || (!isColon && !isBrace)) continue
      this.addUnit(word, at, match.end)
      const afterMark = this.reader.after(mark)
      this.addUnit(isColon ? ":" : "{", mark, afterMark)
      this.position = skipWhitespace(this.reader, afterMark)
      let context: Context = "description-block"
      if (isColon) context = word === "accTitle" ? "title" : "description"
      this.enter(context, [at.start, mark.end])
      return true
    }
    return false
  }

  /** The statement context, rule 18: `{`, a `{` unit; enters the composite body context. */
  private readOpeningBrace(at: DiagramCharacter): boolean {
    if (at.codePoint !== LEFT_CURLY_BRACKET) return false
    this.read("{", at, this.reader.after(at))
    this.enter("composite", [at.start, at.end])
    return true
  }

  /** The composite body context, rule 6: `}`, a `}` unit; leaves the context. */
  private readClosingBrace(at: DiagramCharacter): boolean {
    if (at.codePoint !== RIGHT_CURLY_BRACKET) return false
    this.read("}", at, this.reader.after(at))
    this.leave()
    return true
  }

  /**
   * The statement context, rule 20: `stateDiagram` or `stateDiagram-v2`,
   * compared case-insensitively, and one or more whitespace characters: a
   * `header` unit.
   */
  private readHeader(at: DiagramCharacter): boolean {
    for (const word of HEADER_KEYWORDS) {
      const match = matchWordIgnoringCase(this.reader, at, word)
      if (match === null || !isWhitespaceCharacter(match.end)) continue
      this.read("header", at, match.end)
      return true
    }
    return false
  }

  /**
   * The statement context, rule 21: `hide empty description`, read
   * case-insensitively with one space between the words, a `hide`, an
   * `empty`, and a `description-word` unit.
   */
  private readHide(at: DiagramCharacter): boolean {
    const words = matchSpacedWords(
      this.reader,
      at,
      ["hide", "empty", "description"],
      matchWordIgnoringCase,
    )
    if (words === null) return false
    const [hide, empty, description] = words
    this.read("hide", hide.start, hide.end)
    this.read("empty", empty.start, empty.end)
    this.read("description-word", description.start, description.end)
    return true
  }

  /** The text `text` at `at`, a unit named `name`. */
  private readFixed(
    at: DiagramCharacter,
    text: string,
    name: UnitName,
  ): boolean {
    const match = matchWordIgnoringCase(this.reader, at, text)
    if (match === null) return false
    this.read(name, at, match.end)
    return true
  }

  /**
   * Units and contexts, Ids: one or more characters other than `:`, line
   * feed, whitespace, `-`, and `{`, as many as possible, a unit named
   * `name`, which ends before a `%%` after its first character.
   */
  private readId(at: DiagramCharacter, name: "id"): boolean {
    const end = this.endOfId(at, isIdCharacter)
    if (end === null) return false
    this.read(name, at, end)
    return true
  }

  /**
   * Units and contexts, Ids: where an id that starts at `at` ends: after the
   * characters that `accepts` takes, as many as possible, and before a `%%`
   * after its first character. Null when `at` is no such character.
   */
  private endOfId(
    at: DiagramCharacter,
    accepts: (codePoint: number) => boolean,
  ): DiagramPosition | null {
    if (!accepts(at.codePoint)) return null
    let position = this.reader.after(at)
    while (position !== null && accepts(position.codePoint)) {
      if (
        position.codePoint === PERCENT_SIGN &&
        isCodePointAt(this.reader.after(position), PERCENT_SIGN)
      ) {
        break
      }
      position = this.reader.after(position)
    }
    return position
  }

  /**
   * The statement context, rule 24: a description: `:`, and then one or
   * more characters as many as possible, each of which is a character
   * other than `:`, `;`, and line feed, or a `:` followed by such a
   * character: a `description` unit with its `:` and its text.
   */
  private readDescription(at: DiagramCharacter): boolean {
    if (at.codePoint !== COLON) return false
    const textStart = this.reader.after(at)
    let end: DiagramPosition = textStart
    while (end !== null) {
      if (isDescriptionCharacter(end.codePoint)) {
        end = this.reader.after(end)
        continue
      }
      const next = this.reader.after(end)
      if (
        end.codePoint === COLON &&
        next !== null &&
        isDescriptionCharacter(next.codePoint)
      ) {
        end = next
        continue
      }
      break
    }
    if (textStart === null || samePosition(end, textStart)) return false
    const index = this.units.length
    const colon: Unit = {
      ...readUnit(this.reader, ":", index, at, textStart, null),
      description: null,
      startsNoteText: null,
    }
    const text: Unit = {
      ...readUnit(this.reader, "description", index, textStart, end, null),
      description: null,
      startsNoteText: null,
    }
    this.units.push({
      ...readUnit(this.reader, "description", index, at, end, null),
      description: { colon, text },
      startsNoteText: null,
    })
    this.position = end
    return true
  }

  /**
   * The state context, rule 4: a pseudostate mark before the next line feed,
   * U+2028, or U+2029. The marks are tried in their order; for the first that
   * occurs there, the rule reads up to its last occurrence. The characters
   * before it, without the whitespace at their ends, are a `pseudostate-name`
   * unit when they are not empty, and the mark is a unit named by its text;
   * leaves the state context.
   */
  private readPseudostate(at: DiagramCharacter): boolean {
    const line: DiagramCharacter[] = []
    for (
      let position: DiagramPosition = at;
      position !== null && !endsLineSegment(position.codePoint);
      position = this.reader.after(position)
    ) {
      line.push(position)
    }
    for (const mark of PSEUDOSTATE_MARKS) {
      let last: Match | null = null
      let lastStart: DiagramCharacter | null = null
      for (const character of line) {
        const match = matchWordIgnoringCase(this.reader, character, mark)
        if (match !== null) {
          last = match
          lastStart = character
        }
      }
      if (last === null || lastStart === null) continue
      const before = line.slice(0, line.indexOf(lastStart))
      const significant = before.filter(
        (character) => !isWhitespace(character.codePoint),
      )
      const first = significant.at(0)
      const lastSignificant = significant.at(-1)
      if (first !== undefined && lastSignificant !== undefined) {
        this.addUnit(
          "pseudostate-name",
          first,
          this.reader.after(lastSignificant),
        )
      }
      this.read(mark, lastStart, last.end)
      this.leave()
      return true
    }
    return false
  }

  /** The state context, rule 5: `"`; enters the state string context. */
  private readStateStringStart(at: DiagramCharacter): boolean {
    if (at.codePoint !== QUOTATION_MARK) return false
    this.stringStart = at
    this.position = this.reader.after(at)
    this.enter("state-string", [at.start, at.end])
    return true
  }

  /**
   * The state string context: `"` leaves it, and one or more characters
   * other than `"` are the text of the string.
   */
  private readInStateStringContext(at: DiagramCharacter): void {
    if (at.codePoint === QUOTATION_MARK) {
      this.closeString(at)
      this.leave()
      return
    }
    this.position = skipWhile(
      this.reader,
      at,
      (character) => character.codePoint !== QUOTATION_MARK,
    )
  }

  /**
   * The state context, rule 6: zero or more whitespace, `as`, and one or
   * more whitespace characters, line feeds included: an `as` unit; enters
   * the alias id context.
   */
  private readAs(at: DiagramCharacter): boolean {
    const word = skipWhitespace(this.reader, at)
    const match = matchWordIgnoringCase(this.reader, word, "as")
    if (word === null || match === null || !isWhitespaceCharacter(match.end)) {
      return false
    }
    this.addUnit("as", word, match.end)
    this.position = skipWhitespace(this.reader, match.end)
    this.enter("alias-id", [word.start, word.end])
    return true
  }

  /**
   * The state context, rule 7: a word, one or more whitespace characters,
   * line feeds included, another word, and characters other than line
   * feed, U+2028, and U+2029 up to the first `{`: rejected.
   */
  private rejectTwoNames(at: DiagramCharacter): boolean {
    const firstEnd = skipWhile(this.reader, at, (character) =>
      isWordCharacter(character.codePoint),
    )
    if (samePosition(firstEnd, at) || !isWhitespaceCharacter(firstEnd)) {
      return false
    }
    const second = skipWhitespace(this.reader, firstEnd)
    if (second === null || !isWordCharacter(second.codePoint)) return false
    const secondEnd = skipWhile(this.reader, second, (character) =>
      isWordCharacter(character.codePoint),
    )
    const brace = skipWhile(
      this.reader,
      secondEnd,
      (character) =>
        !endsLineSegment(character.codePoint) &&
        character.codePoint !== LEFT_CURLY_BRACKET,
    )
    if (!isCodePointAt(brace, LEFT_CURLY_BRACKET)) return false
    const range: Range = [at.start, brace?.end ?? at.end]
    throw new ParseError(
      "A state name before { must be a single word",
      range,
      this.lines.location(range),
    )
  }

  /** The state context, rule 8: one or more characters other than line feed, whitespace, and `{`, a `state-name` unit. */
  private readStateName(at: DiagramCharacter): boolean {
    const end = skipWhile(
      this.reader,
      at,
      (character) =>
        !isWhitespace(character.codePoint) &&
        character.codePoint !== LEFT_CURLY_BRACKET,
    )
    if (samePosition(end, at)) return false
    this.read("state-name", at, end)
    return true
  }

  /**
   * The alias id context: zero or more characters other than line feed and
   * `{`, which end before the first `%%`, also when that is their first
   * character, so that the state context reads the `%%`. Before a
   * `{`, they are one `alias-id` unit; otherwise they are divided at their
   * first `:` into the `alias-id`, a `:` unit, a `second-description` unit
   * up to the second `:` or the end, and an `ignored-text` unit from the
   * second `:`. Each unit is left out when it has no characters; an
   * `alias-id` has no whitespace at its ends. Leaves the context. The `{`
   * of a body may also be on the next line ({@link bodyFollowsAliasId}).
   */
  private readAliasId(at: DiagramCharacter): void {
    if (this.readIgnoredPercentBeforeBody(at)) return
    const characters: DiagramCharacter[] = []
    let position: DiagramPosition = at
    while (
      position !== null &&
      position.codePoint !== LINE_FEED &&
      position.codePoint !== LEFT_CURLY_BRACKET
    ) {
      if (
        position.codePoint === PERCENT_SIGN &&
        isCodePointAt(this.reader.after(position), PERCENT_SIGN)
      ) {
        break
      }
      characters.push(position)
      position = this.reader.after(position)
    }
    const end = position
    this.leave()
    this.position = end
    const firstColon = this.bodyFollowsAliasId(end)
      ? -1
      : characters.findIndex((character) => character.codePoint === COLON)
    if (firstColon === -1) {
      this.addTrimmed("alias-id", characters)
      return
    }
    this.addTrimmed("alias-id", characters.slice(0, firstColon))
    const colon = characters[firstColon]
    this.addUnit(":", colon, this.reader.after(colon))
    const rest = characters.slice(firstColon + 1)
    const secondColon = rest.findIndex(
      (character) => character.codePoint === COLON,
    )
    // ast/state.md, StateAliasDefinitionStatement: mermaid.js reads the
    // second description as written, whitespace included.
    if (secondColon === -1) {
      if (rest.length > 0) {
        this.addUnit("second-description", rest[0], end, "keep-whitespace")
      }
      return
    }
    if (secondColon > 0) {
      this.addUnit(
        "second-description",
        rest[0],
        rest[secondColon],
        "keep-whitespace",
      )
    }
    this.addUnit("ignored-text", rest[secondColon], end)
  }

  /**
   * The alias id context: when the text starts with `%%` and a `{` follows
   * on its line, the text before the `{`, without the whitespace at its
   * end, is an `ignored-text` unit, which mermaid.js does not read, and
   * there is no `alias-id`; leaves the context before the `{`.
   */
  private readIgnoredPercentBeforeBody(at: DiagramCharacter): boolean {
    if (!isPercentPairAt(this.reader, at)) return false
    const characters: DiagramCharacter[] = []
    let position: DiagramPosition = at
    while (
      position !== null &&
      position.codePoint !== LINE_FEED &&
      position.codePoint !== LEFT_CURLY_BRACKET
    ) {
      characters.push(position)
      position = this.reader.after(position)
    }
    if (!isCodePointAt(position, LEFT_CURLY_BRACKET)) return false
    this.addTrimmed("ignored-text", characters)
    this.leave()
    this.position = position
    return true
  }

  /**
   * The alias id context: whether the alias statement whose id ends at
   * `end` has a body: a `{` there, or on the next line, after the line
   * feed of the line of `end` and only what the `textBeforeBody` may hold
   * before it: whitespace other than line feed, empty description blocks,
   * and a `%%` right before the `{`, or `ignored-state` units
   * ({@link bodyFollowsIgnoredStates}).
   * Comment lines between are not read, and an id that ends before a `%%`
   * that starts a comment has the rest of its line in that comment.
   */
  private bodyFollowsAliasId(end: DiagramPosition): boolean {
    if (end === null) return false
    if (end.codePoint === LEFT_CURLY_BRACKET) return true
    let lineFeed: DiagramPosition = end
    const second = this.reader.after(end)
    if (
      isPercentPairAt(this.reader, end) &&
      second !== null &&
      !isCodePointAt(this.reader.after(second), LEFT_CURLY_BRACKET)
    ) {
      lineFeed = skipWhile(
        this.reader,
        end,
        (character) => character.codePoint !== LINE_FEED,
      )
    }
    if (lineFeed === null || lineFeed.codePoint !== LINE_FEED) return false
    const outer = this.contextAroundState()
    let next = this.afterTriviaWithoutUnit(this.reader.after(lineFeed), outer)
    for (
      let block = this.afterEmptyDescriptionBlock(next);
      block !== null;
      block = this.afterEmptyDescriptionBlock(next)
    ) {
      next = this.afterTriviaWithoutUnit(block, outer)
    }
    return (
      isCodePointAt(next, LEFT_CURLY_BRACKET) ||
      isIgnoredPercentAt(this.reader, next) ||
      this.bodyFollowsIgnoredStates(next, outer)
    )
  }

  /** Units and contexts: the context that the state context was entered from, the statement or the composite body context. */
  private contextAroundState(): "statement" | "composite" {
    return this.contexts.at(-2) === "composite" ? "composite" : "statement"
  }

  /**
   * Units and contexts, read ahead from `at` in `context`: the place after
   * the text there that makes no unit. In the statement context, that is
   * one or more whitespace characters whose first is no line feed, line
   * feeds included (rule 7), since line feeds first are a `newline` unit
   * (rule 6), and a diagram comment there ends with a line feed, which is
   * one; in the composite body context, every whitespace character, line
   * feeds included, and the diagram comments between them (rules 1 to 3
   * and 7), since no line feed makes a unit there.
   */
  private afterTriviaWithoutUnit(
    at: DiagramPosition,
    context: "statement" | "composite",
  ): DiagramPosition {
    if (context === "statement") {
      if (at === null || at.codePoint === LINE_FEED) return at
      return isWhitespace(at.codePoint) ? skipWhitespace(this.reader, at) : at
    }
    let next = skipWhitespace(this.reader, at)
    while (next !== null && this.startsDiagramComment(next)) {
      next = skipWhitespace(
        this.reader,
        skipWhile(
          this.reader,
          next,
          (character) => character.codePoint !== LINE_FEED,
        ),
      )
    }
    return next
  }

  /** Comments: whether a diagram comment starts at `at`, `#`, or `%%` not followed by `{`. */
  private startsDiagramComment(at: DiagramCharacter): boolean {
    return at.codePoint === NUMBER_SIGN || this.startsPercentComment(at)
  }

  /**
   * The statement context, rule 17, read ahead from `at` in `outer`, the
   * context that holds the statement: whether one or more `state` units
   * start there that are `ignored-state` units, a `{` unit after them, or an
   * `ignored-text` unit, a `%%` right before a `{` (rule 9).
   */
  private bodyFollowsIgnoredStates(
    at: DiagramPosition,
    outer: "statement" | "composite",
  ): boolean {
    let next = at
    let states = 0
    for (
      let after = this.afterNamelessState(next, outer);
      after !== null;
      after = this.afterNamelessState(next, outer)
    ) {
      states += 1
      next = after
    }
    return (
      states > 0 &&
      (isCodePointAt(next, LEFT_CURLY_BRACKET) ||
        isIgnoredPercentAt(this.reader, next))
    )
  }

  /**
   * The statement context, rule 17, read ahead from `at` in `outer`: the
   * place after a `state` unit that starts at `at` and that the state
   * context reads no name after; null when none starts there. After `state`
   * and its whitespace, line feeds included, the state context reads
   * whitespace other than line feed, empty strings, and a comment up to a
   * line feed, which leaves the context; `outer` then reads empty strings
   * and the text that makes no unit there ({@link afterTriviaWithoutUnit}).
   * Without that line feed, only a `{` may follow.
   */
  private afterNamelessState(
    at: DiagramPosition,
    outer: "statement" | "composite",
  ): DiagramPosition | null {
    if (at === null) return null
    const word = matchWordIgnoringCase(this.reader, at, "state")
    if (word === null || !isWhitespaceCharacter(word.end)) return null
    // The state context, rules 1 to 3, 5, and 9.
    let next = this.afterEmptyStrings(skipWhitespace(this.reader, word.end))
    if (next !== null && this.startsDiagramComment(next)) {
      next = skipWhile(
        this.reader,
        next,
        (character) => character.codePoint !== LINE_FEED,
      )
    }
    if (!isCodePointAt(next, LINE_FEED) || next === null) {
      return isCodePointAt(next, LEFT_CURLY_BRACKET) ? next : null
    }
    // The context around the state context, after the line feed.
    next = this.reader.after(next)
    for (;;) {
      const after = this.afterEmptyString(
        this.afterTriviaWithoutUnit(next, outer),
      )
      if (after === null) break
      next = after
    }
    return this.afterTriviaWithoutUnit(next, outer)
  }

  /**
   * The state context, read ahead from `at`: the place after the empty
   * strings there and the whitespace other than line feed around them.
   */
  private afterEmptyStrings(at: DiagramPosition): DiagramPosition {
    let next = at
    for (;;) {
      next = skipWhile(this.reader, next, (character) =>
        isLineWhitespaceOrSeparator(character.codePoint),
      )
      const after = this.afterEmptyString(next)
      if (after === null) return next
      next = after
    }
  }

  /** Strings: the place after the empty string `""` that starts at `at`; null when none starts there. */
  private afterEmptyString(at: DiagramPosition): DiagramPosition | null {
    const second = at === null ? null : this.reader.after(at)
    if (
      at === null ||
      at.codePoint !== QUOTATION_MARK ||
      !isCodePointAt(second, QUOTATION_MARK) ||
      second === null
    ) {
      return null
    }
    return this.reader.after(second)
  }

  /**
   * Where the empty description block that starts at `at` ends: after the
   * `}` of `accDescr`, a `{`, and a `}`, with only whitespace between them,
   * as the statement context and the description block context read them;
   * null when none starts there.
   */
  private afterEmptyDescriptionBlock(
    at: DiagramPosition,
  ): DiagramPosition | null {
    if (at === null) return null
    const word = matchWordIgnoringCase(this.reader, at, "accDescr")
    if (word === null) return null
    const opening = skipWhitespace(this.reader, word.end)
    if (!isCodePointAt(opening, LEFT_CURLY_BRACKET) || opening === null) {
      return null
    }
    const closing = skipWhitespace(this.reader, this.reader.after(opening))
    if (!isCodePointAt(closing, RIGHT_CURLY_BRACKET) || closing === null) {
      return null
    }
    return this.reader.after(closing)
  }

  /** A unit named `name` for `characters` without the whitespace at their ends; none when they are empty or all whitespace. */
  private addTrimmed(
    name: UnitName,
    characters: readonly DiagramCharacter[],
  ): void {
    const significant = characters.filter(
      (character) => !isWhitespace(character.codePoint),
    )
    const first = significant.at(0)
    const last = significant.at(-1)
    if (first === undefined || last === undefined) return
    this.addUnit(name, first, this.reader.after(last))
  }

  /**
   * The classDef context: `default` and one or more whitespace characters,
   * a `default` unit, which the grammar does not take; or one or more word
   * characters and one or more whitespace characters, line feeds included:
   * a `class-name` unit, without the whitespace; enters the styles context.
   */
  private readInClassDefContext(at: DiagramCharacter): void {
    const keyword = matchWordIgnoringCase(this.reader, at, "default")
    if (keyword !== null && isWhitespaceCharacter(keyword.end)) {
      this.addUnit("default", at, keyword.end)
      this.position = skipWhitespace(this.reader, keyword.end)
      this.replace("styles")
      return
    }
    const end = skipWhile(this.reader, at, (character) =>
      isWordCharacter(character.codePoint),
    )
    if (samePosition(end, at) || !isWhitespaceCharacter(end)) {
      throw this.noRuleMatches(at)
    }
    this.addUnit("class-name", at, end)
    this.position = skipWhitespace(this.reader, end)
    this.replace("styles")
  }

  /**
   * The class context: one or more word characters, followed by zero or
   * more of `,`, zero or more whitespace, and one or more word characters:
   * an `id` unit for each run of word characters and an `id-comma` unit
   * for each `,`; enters the class name context.
   */
  private readInClassContext(at: DiagramCharacter): void {
    let end = skipWhile(this.reader, at, (character) =>
      isWordCharacter(character.codePoint),
    )
    if (samePosition(end, at)) throw this.noRuleMatches(at)
    this.addUnit("id", at, end)
    while (isCodePointAt(end, COMMA) && end !== null) {
      const comma = end
      const word = skipWhitespace(this.reader, this.reader.after(comma))
      if (word === null || !isWordCharacter(word.codePoint)) break
      const wordEnd = skipWhile(this.reader, word, (character) =>
        isWordCharacter(character.codePoint),
      )
      this.addUnit("id-comma", comma, this.reader.after(comma))
      this.addUnit("id", word, wordEnd)
      end = wordEnd
    }
    this.position = end
    this.replace("class-name")
  }

  /**
   * The style context: one or more word characters and `,`, and one or more
   * whitespace characters, line feeds included: an `id` unit for each run
   * of word characters and an `id-comma` unit for each `,`; enters the
   * styles context. The ids end at the whitespace after them, so a `,`
   * after that whitespace is one of the styles.
   */
  private readInStyleContext(at: DiagramCharacter): void {
    const end = skipWhile(
      this.reader,
      at,
      (character) =>
        isWordCharacter(character.codePoint) || character.codePoint === COMMA,
    )
    if (samePosition(end, at) || !isWhitespaceCharacter(end)) {
      throw this.noRuleMatches(at)
    }
    let position: DiagramPosition = at
    while (position !== null && !samePosition(position, end)) {
      if (position.codePoint === COMMA) {
        const after = this.reader.after(position)
        this.addUnit("id-comma", position, after)
        position = after
      } else {
        const wordEnd = skipWhile(this.reader, position, (character) =>
          isWordCharacter(character.codePoint),
        )
        this.addUnit("id", position, wordEnd)
        position = wordEnd
      }
    }
    this.position = skipWhitespace(this.reader, end)
    this.replace("styles")
  }

  /**
   * The styles context: the rest of the line, up to the line feed, divided
   * at each `,` into `style-text` units, without the whitespace at their
   * ends, and `,` units; leaves the context.
   */
  private readStyles(at: DiagramCharacter): void {
    let piece: DiagramCharacter[] = []
    let position: DiagramPosition = at
    while (position !== null && position.codePoint !== LINE_FEED) {
      if (position.codePoint === COMMA) {
        this.addTrimmed("style-text", piece)
        this.addUnit(",", position, this.reader.after(position))
        piece = []
      } else {
        piece.push(position)
      }
      position = this.reader.after(position)
    }
    this.addTrimmed("style-text", piece)
    this.position = position
    this.leave()
  }

  /** The class name, title, and description contexts: the rest of the line, a unit named `name` when it is not empty; leaves the context. */
  private readRestOfLine(
    at: DiagramCharacter,
    name: "css-class" | "title-text" | "description-text",
  ): void {
    const end = skipWhile(
      this.reader,
      at,
      (character) => character.codePoint !== LINE_FEED,
    )
    if (!samePosition(end, at)) this.read(name, at, end)
    else this.position = end
    this.leave()
  }

  /**
   * Accessibility values: in the description block context, `}` is a `}`
   * unit and leaves the context, and one or more other characters are a
   * `description-block-text` unit.
   */
  private readInDescriptionBlockContext(at: DiagramCharacter): void {
    if (at.codePoint === RIGHT_CURLY_BRACKET) {
      this.read("}", at, this.reader.after(at))
      this.leave()
      return
    }
    this.read(
      "description-block-text",
      at,
      skipWhile(
        this.reader,
        at,
        (character) => character.codePoint !== RIGHT_CURLY_BRACKET,
      ),
    )
  }

  /**
   * The scale context: one or more ASCII digits are a `number` unit, and
   * one or more whitespace characters followed by the keyword `width` are
   * a `width` unit, which leaves the context.
   */
  private readInScaleContext(at: DiagramCharacter): void {
    if (isAsciiDigit(at.codePoint)) {
      this.read(
        "number",
        at,
        skipWhile(this.reader, at, (character) =>
          isAsciiDigit(character.codePoint),
        ),
      )
      return
    }
    if (isWhitespace(at.codePoint)) {
      const word = skipWhitespace(this.reader, at)
      const match = matchWholeWordIgnoringCase(this.reader, word, "width")
      if (word !== null && match !== null) {
        this.read("width", word, match.end)
        this.leave()
        return
      }
    }
    throw this.noRuleMatches(at)
  }

  /**
   * The note context: `left of` or `right of`, read case-insensitively with
   * one space between the words and not followed by a word character, a
   * `position` unit for `left` or `right` and an `of` unit, which enter the
   * note id context; or `"`, which enters the floating note context.
   */
  private readInNoteContext(at: DiagramCharacter): void {
    for (const side of NOTE_SIDES) {
      const words = matchSpacedWords(
        this.reader,
        at,
        [side, "of"],
        matchWordIgnoringCase,
      )
      if (words === null) continue
      const [sideWord, ofWord] = words
      this.read("position", sideWord.start, sideWord.end)
      this.read("of", ofWord.start, ofWord.end)
      // The note contexts that follow keep `note` as what entered them.
      this.replace("note-id")
      return
    }
    if (at.codePoint === QUOTATION_MARK) {
      this.read('"', at, this.reader.after(at))
      this.enter("floating-note", [at.start, at.end])
      return
    }
    throw this.noRuleMatches(at)
  }

  /**
   * The note id context: zero or more whitespace characters, line feeds
   * included, and an id of characters other than `:`, line feed,
   * whitespace, and `-`, a `note-id` unit, which ends before the first
   * `%%`, also when that is its first character, and is then empty, so
   * that the note text context reads from the `%%`; enters the note text
   * context. A `%%` right after the position, with no whitespace between,
   * starts an `ignored-text` unit instead, of the characters of an id from
   * it, after which the context reads on.
   */
  private readNoteId(at: DiagramCharacter): void {
    // Right after the `of` unit of the position, which this context was
    // entered with, `at` is the character of the diagram text after it, so
    // the `%%` there has no whitespace before it; a directive between them
    // is no character of the diagram text.
    if (this.units.at(-1)?.name === "of" && isPercentPairAt(this.reader, at)) {
      // A `%%` right after the position: the characters of an id from it
      // are text that mermaid.js does not read, and the context reads on.
      this.read(
        "ignored-text",
        at,
        skipWhile(this.reader, at, (character) =>
          isNoteIdCharacter(character.codePoint),
        ),
      )
      return
    }
    const start = skipWhitespace(this.reader, at)
    if (start === null) throw this.noRuleMatches(at)
    this.replace("note-text")
    if (isPercentPairAt(this.reader, start)) {
      this.position = start
      return
    }
    const end = this.endOfId(start, isNoteIdCharacter)
    if (end === null) throw this.noRuleMatches(start)
    this.read("note-id", start, end)
  }

  /**
   * The note text context: zero or more whitespace, `:`, and one or more
   * characters other than `:`, `;`, and line feed, as many as possible: a
   * `:` unit, an `ignored-text` unit for the character after it when the
   * `:` follows the note id directly and that character is not whitespace,
   * and a `note-text` unit for the characters after them; or any
   * characters, as few as possible, then a line feed, zero or more
   * whitespace characters, and `end note`: a `note-text` unit for the
   * characters before the line feed and an `end note` unit. Either leaves
   * the note contexts. mermaid.js reads a note text on one line without its
   * first two characters, so with two whitespace characters before the
   * `:`, the `:` is the first character of the text that it reads
   * ({@link Unit.startsNoteText}).
   */
  private readInNoteTextContext(at: DiagramCharacter): void {
    const colon = skipWhitespace(this.reader, at)
    if (colon !== null && colon.codePoint === COLON) {
      const afterColon = this.reader.after(colon)
      let last: DiagramCharacter | null = null
      let end: DiagramPosition = afterColon
      while (
        end !== null &&
        end.codePoint !== COLON &&
        end.codePoint !== SEMICOLON &&
        end.codePoint !== LINE_FEED
      ) {
        last = end
        end = this.reader.after(end)
      }
      if (afterColon !== null && last !== null) {
        const whitespaceBefore = this.charactersBetween(at, colon)
        this.addUnit(
          ":",
          colon,
          afterColon,
          "trim-whitespace",
          whitespaceBefore >= 2,
        )
        let textStart: DiagramPosition = afterColon
        if (whitespaceBefore === 0 && !isWhitespace(afterColon.codePoint)) {
          textStart = this.reader.after(afterColon)
          this.addUnit("ignored-text", afterColon, textStart)
        }
        if (textStart !== null && !samePosition(textStart, end)) {
          this.addUnit("note-text", textStart, end)
        }
        this.position = end
        this.leaveNote()
        return
      }
    }
    for (
      let position: DiagramPosition = at;
      position !== null;
      position = this.reader.after(position)
    ) {
      if (position.codePoint !== LINE_FEED) continue
      const word = skipWhitespace(this.reader, this.reader.after(position))
      if (word === null) continue
      const endNote = matchSpacedWords(
        this.reader,
        word,
        ["end", "note"],
        matchWordIgnoringCase,
      )
      if (endNote === null) continue
      if (!samePosition(position, at)) {
        this.addUnit("note-text", at, position)
      }
      const [end, note] = endNote
      this.read("end", end.start, end.end)
      this.read("note", note.start, note.end)
      this.leaveNote()
      return
    }
    // No `end note` follows: the text ends in the note.
    throw this.endOfTextError() ?? this.noRuleMatches(at)
  }

  /** How many characters of the diagram text lie from `from` up to, and not including, `to`. */
  private charactersBetween(
    from: DiagramCharacter,
    to: DiagramCharacter,
  ): number {
    let count = 0
    for (
      let position: DiagramPosition = from;
      position !== null && !samePosition(position, to);
      position = this.reader.after(position)
    ) {
      count += 1
    }
    return count
  }

  /** Leaves the note contexts, back to the context that `note` was read in. */
  private leaveNote(): void {
    while (
      [
        "note",
        "note-id",
        "note-text",
        "floating-note",
        "floating-note-id",
      ].includes(this.currentContext())
    ) {
      this.leave()
    }
  }

  /**
   * The floating note context: zero or more whitespace, `as`, and zero or
   * more whitespace, an `as` unit, which enters the floating note id
   * context; `"`, a `"` unit; and one or more characters other than `"`,
   * line feeds included, a `floating-note-text` unit. The quotes do not
   * pair: each is a unit of its own.
   */
  private readInFloatingNoteContext(at: DiagramCharacter): void {
    const word = skipWhitespace(this.reader, at)
    const match = matchWordIgnoringCase(this.reader, word, "as")
    if (word !== null && match !== null) {
      this.addUnit("as", word, match.end)
      this.position = skipWhitespace(this.reader, match.end)
      this.replace("floating-note-id")
      return
    }
    if (at.codePoint === QUOTATION_MARK) {
      this.read('"', at, this.reader.after(at))
      return
    }
    this.read(
      "floating-note-text",
      at,
      skipWhile(
        this.reader,
        at,
        (character) => character.codePoint !== QUOTATION_MARK,
      ),
    )
  }

  /**
   * The state string context: the `"` `at` ends the string that the `"` at
   * `stringStart` opened, which is one `string` unit, or, when the two
   * quotes follow one another, an `empty-string` unit.
   */
  private closeString(at: DiagramCharacter): void {
    const start = this.stringStart ?? at
    const empty = samePosition(this.reader.after(start), at)
    this.read(empty ? "empty-string" : "string", start, this.reader.after(at))
    this.stringStart = null
  }

  /**
   * The floating note id context: the rest of the line, a
   * `floating-note-id` unit without the whitespace at its ends, which ends
   * before a `%%` after its first character; leaves the note contexts.
   */
  private readFloatingNoteId(at: DiagramCharacter): void {
    const characters: DiagramCharacter[] = []
    let position: DiagramPosition = at
    while (position !== null && position.codePoint !== LINE_FEED) {
      if (
        characters.length > 0 &&
        position.codePoint === PERCENT_SIGN &&
        isCodePointAt(this.reader.after(position), PERCENT_SIGN)
      ) {
        break
      }
      characters.push(position)
      position = this.reader.after(position)
    }
    this.addTrimmed("floating-note-id", characters)
    this.position = position
    this.leaveNote()
  }
}

/** Whether `%%` starts at `position`. */
function isPercentPairAt(
  reader: DiagramText,
  position: DiagramPosition,
): boolean {
  return (
    position !== null &&
    position.codePoint === PERCENT_SIGN &&
    isCodePointAt(reader.after(position), PERCENT_SIGN)
  )
}

/** The statement context, rule 9: whether `%%` and a `{` after it start at `position`, an `ignored-text` unit. */
function isIgnoredPercentAt(
  reader: DiagramText,
  position: DiagramPosition,
): boolean {
  const second = position === null ? null : reader.after(position)
  return (
    isPercentPairAt(reader, position) &&
    second !== null &&
    isCodePointAt(reader.after(second), LEFT_CURLY_BRACKET)
  )
}

/** Units and contexts, Ids: a character of an id. */
function isIdCharacter(codePoint: number): boolean {
  return (
    codePoint !== COLON &&
    codePoint !== LINE_FEED &&
    !isWhitespace(codePoint) &&
    codePoint !== HYPHEN_MINUS &&
    codePoint !== LEFT_CURLY_BRACKET
  )
}

/** The note id context: a character of a `note-id`. */
function isNoteIdCharacter(codePoint: number): boolean {
  return (
    codePoint !== COLON &&
    codePoint !== LINE_FEED &&
    !isWhitespace(codePoint) &&
    codePoint !== HYPHEN_MINUS
  )
}

/** The statement context, rule 24: a character of a description other than `:`. */
function isDescriptionCharacter(codePoint: number): boolean {
  return (
    codePoint !== COLON && codePoint !== SEMICOLON && codePoint !== LINE_FEED
  )
}

/** Notation: a line feed, U+2028, or U+2029, which end a line segment. */
function endsLineSegment(codePoint: number): boolean {
  return codePoint === LINE_FEED || isLineSegmentSeparator(codePoint)
}

/** Whitespace other than line feed. */
function isLineWhitespaceOrSeparator(codePoint: number): boolean {
  return isWhitespace(codePoint) && codePoint !== LINE_FEED
}

/** Whether a whitespace character is at `position`. */
function isWhitespaceCharacter(position: DiagramPosition): boolean {
  return position !== null && isWhitespace(position.codePoint)
}
