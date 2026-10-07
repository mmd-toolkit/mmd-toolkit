import type { Range } from "../../ast.ts"
import {
  isAsciiDigit,
  isAsciiLetter,
  isWhitespace,
} from "../../character-classes.ts"
import {
  AMPERSAND,
  APOSTROPHE,
  ASTERISK,
  COLON,
  COMMA,
  DOLLAR_SIGN,
  EQUALS_SIGN,
  EXCLAMATION_MARK,
  FULL_STOP,
  GRAVE_ACCENT,
  GREATER_THAN_SIGN,
  HYPHEN_MINUS,
  LEFT_CURLY_BRACKET,
  LEFT_PARENTHESIS,
  LEFT_SQUARE_BRACKET,
  LESS_THAN_SIGN,
  LINE_FEED,
  LOW_LINE,
  NUMBER_SIGN,
  PERCENT_SIGN,
  PLUS_SIGN,
  QUESTION_MARK,
  QUOTATION_MARK,
  REVERSE_SOLIDUS,
  RIGHT_CURLY_BRACKET,
  RIGHT_PARENTHESIS,
  RIGHT_SQUARE_BRACKET,
  SEMICOLON,
  SOLIDUS,
  TILDE,
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
  matchWholeWord,
  matchWord,
  samePosition,
  skipWhile,
  skipWhitespace,
} from "../../scanning.ts"
import { isUnicodeLetter } from "../../unicode-letters.ts"
import type { MemberLineKind, MemberLineUnitName } from "./member-lines.ts"
import { divideMemberLine } from "./member-lines.ts"

/** diagrams/class.md, Units and contexts: the names of the units. */
export type UnitName =
  | "direction-text"
  | "direction"
  | "direction-value"
  | "accTitle"
  | "accDescr"
  | ":"
  | "{"
  | "}"
  | "newline"
  | "header"
  | "[*]"
  | "call"
  | "string"
  | "empty-string"
  | "style"
  | "classDef"
  | "namespace"
  | "class"
  | "cssClass"
  | "callback"
  | "link"
  | "click"
  | "for"
  | "note"
  | "<<"
  | ">>"
  | "href"
  | "~"
  | "backquoted"
  | "empty-backquoted"
  | "link-target"
  | "<|"
  | "|>"
  | ">"
  | "<"
  | "*"
  | "o"
  | "()"
  | "--"
  | ".."
  | "label"
  | ":::"
  | "-"
  | "."
  | "+"
  | "%"
  | "="
  | "word"
  | "["
  | "]"
  | "punctuation"
  | "letter"
  | ","
  | "#"
  | "generic-text"
  | "("
  | ")"
  | "callback-name"
  | "callback-arguments"
  | "title-text"
  | "description-text"
  | "description-block-text"
  | MemberLineUnitName

/**
 * diagrams/class.md, Member lines: the member line that units belong to.
 * The units of one member line share the same object, which says what the
 * line is.
 */
export interface MemberLine {
  readonly kind: MemberLineKind
}

/**
 * `docs/tokens/class.md`, Tokens: the two parts of a `label` unit, its `:` and the
 * text after it, which are tokens of their own.
 */
export interface LabelParts {
  readonly colon: Unit
  readonly text: Unit
  /** The first character of the text, and the place after the label, for reading the text again as a member line. */
  readonly textFrom: DiagramCharacter
  readonly textTo: DiagramPosition
}

/** diagrams/class.md, Units and contexts: one unit of the diagram text. */
export interface Unit extends DiagramUnit<UnitName> {
  /** Member lines: for a unit of a member line, the line; null for every other unit. */
  readonly memberLine: MemberLine | null
  /** For a `label` unit, its parts; null for every other unit. */
  readonly label: LabelParts | null
}

/**
 * Strings, backquoted names, and generic types: whether the `backquoted`
 * unit `unit` ends with its closing backquote. A backquoted name that is
 * not closed has no backquote after its first, so it ends with one only
 * when the backquote is all of it.
 */
export function isClosedBackquotedName(unit: Unit): boolean {
  return unit.text.length > 1 && unit.text.endsWith("`")
}

/** diagrams/class.md, Units and contexts: the contexts of the lexer. */
type Context =
  | "statement"
  | "class"
  | "member"
  | "namespace"
  | "namespace-body"
  | "generic"
  | "callback-name"
  | "callback-arguments"
  | "title"
  | "description"
  | "description-block"

/** diagrams/class.md, Lexical structure: what the lexer reads from the diagram text. */
export interface ClassLexing {
  readonly units: readonly Unit[]
  /** The diagram comments, in source order. */
  readonly comments: readonly DiagramComment[]
  /**
   * Members and annotations: the units of the text of the label `label`
   * divided as a member line. Throws `ParseError` when it is a method line
   * that cannot be divided.
   */
  readonly memberLineOfLabel: (label: Unit) => readonly Unit[]
}

/**
 * known-divergences/headerless-empty-ending.md: the message of the error
 * for a diagram text whose first unit is not a `header` unit. Not public
 * API: the tests declare the divergence for this error.
 */
export const MISSING_HEADER_MESSAGE =
  "A class diagram starts with classDiagram or classDiagram-v2"

/** The direction line: the values, in the order in which they are tried. */
const DIRECTION_LINE_VALUES: readonly string[] = ["TB", "BT", "RL", "LR"]

/** The statement context, rule 8: the header keywords, the longer first. */
const HEADER_KEYWORDS: readonly string[] = ["classDiagram-v2", "classDiagram"]

/** The shared rules, rule 1: the keywords of one word, after `note for`. */
const SHARED_KEYWORDS: readonly (UnitName & string)[] = [
  "cssClass",
  "callback",
  "link",
  "click",
  "note",
]

/** The shared rules, rule 6: the link targets. */
const LINK_TARGETS: readonly string[] = ["_self", "_blank", "_parent", "_top"]

/** The shared rules, rule 7: the relation ends of two characters, before those of one. */
const TWO_CHARACTER_RELATION_ENDS: readonly ("<|" | "|>" | "()")[] = [
  "<|",
  "|>",
  "()",
]

/** The shared rules, rule 7: the relation ends of one character other than `o`. */
const ONE_CHARACTER_RELATION_ENDS: Readonly<Partial<Record<number, UnitName>>> =
  {
    [GREATER_THAN_SIGN]: ">",
    [LESS_THAN_SIGN]: "<",
    [ASTERISK]: "*",
  }

/** The shared rules, rule 11: the characters that are a unit named by their text. */
const SINGLE_CHARACTER_UNITS: Readonly<Partial<Record<number, UnitName>>> = {
  [HYPHEN_MINUS]: "-",
  [FULL_STOP]: ".",
  [PLUS_SIGN]: "+",
  [PERCENT_SIGN]: "%",
  [EQUALS_SIGN]: "=",
}

/** The shared rules, rule 14: the characters of a `punctuation` unit in every context. */
const PUNCTUATION: readonly number[] = [
  EXCLAMATION_MARK,
  DOLLAR_SIGN,
  AMPERSAND,
  APOSTROPHE,
  QUESTION_MARK,
  REVERSE_SOLIDUS,
  SOLIDUS,
]

/** The statement context, rule 15: the characters that are a unit named by their text there, where rule 14 would read a `punctuation` unit elsewhere. */
const STATEMENT_PUNCTUATION_UNITS: Readonly<Partial<Record<number, UnitName>>> =
  {
    [COLON]: ":",
    [COMMA]: ",",
    [NUMBER_SIGN]: "#",
  }

/** Whether the character is an ASCII letter, an ASCII digit, or `_`, a character of a `word` unit. */
function isWordCodePoint(codePoint: number): boolean {
  return (
    isAsciiLetter(codePoint) ||
    isAsciiDigit(codePoint) ||
    codePoint === LOW_LINE
  )
}

/**
 * diagrams/class.md, Lexical structure: the lexer that divides the diagram
 * text into units. It keeps a stack of contexts and, at each place,
 * applies the first rule of the current context that matches. The rules
 * are those of the specification, in its order; each method that reads a
 * context names the section it follows. Letters are compared as written.
 */
export class ClassUnitLexer {
  private readonly reader: DiagramText

  private readonly lines: LineIndex

  private readonly units: Unit[] = []

  private readonly comments: DiagramComment[] = []

  /** The stack of contexts; the last one is the current context. */
  private readonly contexts: Context[] = ["statement"]

  /** For each context on the stack but the statement context, the unit that entered it, for the error at the end of the text. */
  private readonly entries: Unit[] = []

  /** The place of the next character to read; null at the end of the text. */
  private position: DiagramPosition

  /** Whether the first unit has been checked to be the header (see `checkHeader`). */
  private headerChecked = false

  /** The statement context, rule 2: whether a unit was read on the current line. */
  private lineHasUnit = false

  /** The member context, rule 1: whether the next character comes right after the `{` of the body or after a line feed. */
  private atMemberStart = false

  /** The statement context, rule 1: the direction line, with the values of class. */
  private readonly directionLine: DirectionLineRule

  public constructor(reader: DiagramText, lines: LineIndex) {
    this.reader = reader
    this.lines = lines
    this.position = reader.first()
    this.directionLine = new DirectionLineRule(
      reader,
      DIRECTION_LINE_VALUES,
      matchWord,
    )
  }

  /**
   * Divides the diagram text into units. Throws `ParseError` where no rule
   * matches and where the text ends in a context that may not end there.
   */
  public lex(): ClassLexing {
    while (this.position !== null) {
      const context = this.currentContext()
      this.readInContext(this.position, context)
      if (this.units.length > 0 && !this.headerChecked) this.checkHeader()
    }
    this.checkEndOfText()
    return {
      units: this.units,
      comments: this.comments,
      memberLineOfLabel: (label) => this.memberLineOfLabel(label),
    }
  }

  /**
   * Diagram and statements, and known-divergences/headerless-empty-ending.md:
   * the first unit of the diagram text must be a `header` unit. The grammar
   * rejects any other first unit as well; the lexer rejects it as soon as it
   * reads it, so that the missing header is the error also where the text ends
   * in a context that may not end there, which mermaid.js accepts without a
   * header.
   */
  private checkHeader(): void {
    this.headerChecked = true
    const [first] = this.units
    if (first.name === "header") return
    const range = first.significantRange ?? [first.start, first.end]
    throw new ParseError(
      MISSING_HEADER_MESSAGE,
      range,
      this.lines.location(range),
    )
  }

  /** The current context: the top of the stack. */
  private currentContext(): Context {
    return this.contexts[this.contexts.length - 1]
  }

  /** Units and contexts: enters `context`, which the unit `entry` entered. */
  private enter(context: Context, entry: Unit): void {
    this.contexts.push(context)
    this.entries.push(entry)
  }

  /** Units and contexts: leaves the current context. Leaving the statement context keeps it. */
  private leave(): void {
    if (this.contexts.length > 1) {
      this.contexts.pop()
      this.entries.pop()
    }
  }

  /** The last unit read. */
  private lastUnit(): Unit {
    const unit = this.units.at(-1)
    if (unit === undefined) {
      throw new Error("mmd-toolkit parser bug: no unit was read")
    }
    return unit
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
  ): Unit {
    const unit: Unit = {
      ...readUnit(this.reader, name, this.units.length, from, to, null, ends),
      memberLine: null,
      label: null,
    }
    this.units.push(unit)
    this.lineHasUnit = name !== "newline"
    return unit
  }

  /** Reads the unit named `name` from `at` up to `to`, as a unit of its own, and goes on after it; `ends` as in {@link ClassUnitLexer.addUnit}. */
  private read(
    name: UnitName,
    at: DiagramCharacter,
    to: DiagramPosition,
    ends: UnitEnds = "trim-whitespace",
  ): Unit {
    const unit = this.addUnit(name, at, to, ends)
    this.position = to
    return unit
  }

  /** The error for a place where no rule of the current context matches. */
  private noRuleMatches(at: DiagramCharacter): ParseError {
    const range: Range = [at.start, at.end]
    return new ParseError(
      "Unexpected character",
      range,
      this.lines.location(range),
    )
  }

  /**
   * Units and contexts: the text may end only in the statement context, and
   * after a backquoted name that is not closed. In another context, the
   * error is at the unit that entered it, and says what is not closed.
   */
  private checkEndOfText(): void {
    const context = this.currentContext()
    const entry = this.entries.at(-1)
    if (context === "statement" || entry === undefined) return
    if (this.lastUnit().name === "backquoted" && this.isUnclosed()) return
    const messages: Readonly<Partial<Record<Context, string>>> = {
      member: "The member body has no } before the end of the text",
      "namespace-body":
        "The namespace body has no } before the end of the text",
      generic: "The generic type has no closing ~ before the end of the text",
      "callback-name":
        "The callback after call has no ( before the end of the text",
      "callback-arguments":
        "The arguments of the callback have no ) before the end of the text",
      title: "accTitle has no text before the end of the text",
      description: "accDescr has no text before the end of the text",
      "description-block":
        "The description block has no } before the end of the text",
    }
    const message = messages[context]
    if (message === undefined) return
    const range = entry.significantRange ?? [entry.start, entry.end]
    throw new ParseError(message, range, this.lines.location(range))
  }

  /** Strings, backquoted names, and generic types: whether the last unit, a backquoted name, has no closing backquote. */
  private isUnclosed(): boolean {
    return !isClosedBackquotedName(this.lastUnit())
  }

  /** Applies the first rule of `context` that matches at `at`. */
  private readInContext(at: DiagramCharacter, context: Context): void {
    switch (context) {
      case "statement":
        this.readInStatementContext(at)
        return
      case "class":
        this.readInClassContext(at)
        return
      case "member":
        this.readInMemberContext(at)
        return
      case "namespace":
        this.readInNamespaceContext(at)
        return
      case "namespace-body":
        this.readInNamespaceBodyContext(at)
        return
      case "generic":
        this.readInGenericContext(at)
        return
      case "callback-name":
        this.readInCallbackNameContext(at)
        return
      case "callback-arguments":
        this.readInCallbackArgumentsContext(at)
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

  /** diagrams/class.md, The statement context: rules 1 to 15, in order. */
  private readInStatementContext(at: DiagramCharacter): void {
    if (
      this.readDirectionLine(at) ||
      this.readComment(at) ||
      this.readAccessibilityKeyword(at) ||
      this.readNewline(at) ||
      this.skipOtherWhitespace(at) ||
      this.readKeyword(at, HEADER_KEYWORDS, "header") ||
      this.readEdgeState(at) ||
      this.readCall(at) ||
      this.readString(at) ||
      this.readKeyword(at, ["style"], "style") ||
      this.readKeyword(at, ["classDef"], "classDef") ||
      this.readEnteringKeyword(at, "namespace", "namespace") ||
      this.readEnteringKeyword(at, "class", "class") ||
      this.readSharedRules(at, true)
    ) {
      return
    }
    throw this.noRuleMatches(at)
  }

  /** The statement context, rule 1: a direction line (see `DirectionLineRule`). */
  private readDirectionLine(at: DiagramCharacter): boolean {
    const line = this.directionLine.match(at)
    if (line === null) return false
    for (const unit of line.units) this.addUnit(unit.name, unit.from, unit.to)
    this.position = line.end
    return true
  }

  /**
   * The statement context, rule 2: `%%` and the rest of its line, up to the
   * line feed, a diagram comment whose mark is `%%`. A comment with only
   * whitespace before it makes a comment-only line, which is not counted as
   * a line, and neither are the empty lines right after it: their line
   * feeds belong to no unit.
   */
  private readComment(at: DiagramCharacter): boolean {
    const second = this.reader.after(at)
    if (at.codePoint !== PERCENT_SIGN || second?.codePoint !== PERCENT_SIGN) {
      return false
    }
    const lineFeed = lineFeedAfter(this.reader, second)
    this.comments.push({
      range: [at.start, lineFeed.start],
      mark: "%%",
      valueStart: second.end,
    })
    let position: DiagramPosition = lineFeed
    if (!this.lineHasUnit) {
      while (position !== null && position.codePoint === LINE_FEED) {
        position = this.reader.after(position)
      }
    }
    this.position = position
    return true
  }

  /**
   * The statement context, rules 3 to 5: `accTitle` or `accDescr`, zero or
   * more whitespace, and `:` or `{`, followed by zero or more whitespace:
   * the keyword unit and a unit of the `:` or `{`; enters the title, the
   * description, or the description block context.
   */
  private readAccessibilityKeyword(at: DiagramCharacter): boolean {
    for (const word of ["accTitle", "accDescr"] as const) {
      const match = matchWord(this.reader, at, word)
      if (match === null) continue
      const mark = skipWhitespace(this.reader, match.end)
      const isColon = isCodePointAt(mark, COLON)
      const isBrace =
        word === "accDescr" && isCodePointAt(mark, LEFT_CURLY_BRACKET)
      if (mark === null || (!isColon && !isBrace)) continue
      const keyword = this.addUnit(word, at, match.end)
      const afterMark = this.reader.after(mark)
      const end = skipWhitespace(this.reader, afterMark)
      this.read(isColon ? ":" : "{", mark, end)
      let context: Context = "description-block"
      if (isColon) context = word === "accTitle" ? "title" : "description"
      this.enter(context, keyword)
      return true
    }
    return false
  }

  /**
   * The statement context, rule 6, and the same rule of the class,
   * namespace, and namespace body contexts: zero or more whitespace
   * followed by one or more line feeds, as many as possible, so that the
   * last character read is a line feed: a `newline` unit.
   */
  private readNewline(at: DiagramCharacter): boolean {
    let end: DiagramPosition | undefined
    for (
      let position: DiagramPosition = at;
      position !== null && isWhitespace(position.codePoint);
      position = this.reader.after(position)
    ) {
      if (position.codePoint === LINE_FEED) end = this.reader.after(position)
    }
    if (end === undefined) return false
    this.read("newline", at, end)
    return true
  }

  /** The statement context, rule 7, and the same rule of other contexts: one or more other whitespace characters, which make no unit. */
  private skipOtherWhitespace(at: DiagramCharacter): boolean {
    if (!isWhitespace(at.codePoint) || at.codePoint === LINE_FEED) return false
    this.position = skipWhile(
      this.reader,
      at,
      (character) =>
        isWhitespace(character.codePoint) && character.codePoint !== LINE_FEED,
    )
    return true
  }

  /** A keyword of `words`, not followed by a word character: a unit named `name`. */
  private readKeyword(
    at: DiagramCharacter,
    words: readonly string[],
    name: UnitName,
  ): boolean {
    for (const word of words) {
      const match = this.wholeWord(at, word)
      if (match === null) continue
      this.read(name, at, match.end)
      return true
    }
    return false
  }

  /** A keyword `word` that enters a context: a unit named `name`, and the context of `name`. */
  private readEnteringKeyword(
    at: DiagramCharacter,
    word: "namespace" | "class",
    name: "namespace" | "class",
  ): boolean {
    const match = this.wholeWord(at, word)
    if (match === null) return false
    const unit = this.read(name, at, match.end)
    this.enter(name, unit)
    return true
  }

  /** The statement context, rule 9, and the same rule of the member and namespace body contexts: `[*]`. */
  private readEdgeState(at: DiagramCharacter): boolean {
    const match = matchWord(this.reader, at, "[*]")
    if (match === null) return false
    this.read("[*]", at, match.end)
    return true
  }

  /** The statement context, rule 10: `call` and one or more whitespace, a `call` unit; enters the callback name context. */
  private readCall(at: DiagramCharacter): boolean {
    const match = matchWord(this.reader, at, "call")
    if (match === null || match.end === null) return false
    if (!isWhitespace(match.end.codePoint)) return false
    const end = skipWhitespace(this.reader, match.end)
    const unit = this.read("call", at, end)
    this.enter("callback-name", unit)
    return true
  }

  /**
   * Strings, backquoted names, and generic types: `"`, the characters up to
   * the next `"`, line feeds included, and that `"`, a `string` unit, or an
   * `empty-string` unit when nothing is between the quotes. Without a `"`
   * after the first, the input is rejected at the first.
   */
  private readString(at: DiagramCharacter): boolean {
    if (at.codePoint !== QUOTATION_MARK) return false
    const content = this.reader.after(at)
    const closing = skipWhile(
      this.reader,
      content,
      (character) => character.codePoint !== QUOTATION_MARK,
    )
    if (closing === null) throw this.noRuleMatches(at)
    const empty = samePosition(content, closing)
    this.read(empty ? "empty-string" : "string", at, this.reader.after(closing))
    return true
  }

  /** diagrams/class.md, The shared rules, rules 1 to 15, in order; `inStatement` for the statement context, where `:`, `,`, and `#` are units of their own. */
  private readSharedRules(at: DiagramCharacter, inStatement: boolean): boolean {
    const noteFor = matchSpacedWords(
      this.reader,
      at,
      ["note", "for"],
      matchWord,
    )
    if (noteFor !== null) {
      const [note, forWord] = noteFor
      this.read("note", note.start, note.end)
      this.read("for", forWord.start, forWord.end)
      return true
    }
    for (const keyword of SHARED_KEYWORDS) {
      const match = this.wholeWord(at, keyword)
      if (match !== null) {
        this.read(keyword, at, match.end)
        return true
      }
    }
    for (const mark of ["<<", ">>"] as const) {
      const match = matchWord(this.reader, at, mark)
      if (match !== null) {
        this.read(mark, at, match.end)
        return true
      }
    }
    const href = this.wholeWord(at, "href")
    if (href !== null) {
      this.read("href", at, href.end)
      return true
    }
    if (at.codePoint === TILDE) {
      const unit = this.read("~", at, this.reader.after(at))
      this.enter("generic", unit)
      return true
    }
    if (this.readBackquoted(at)) return true
    for (const target of LINK_TARGETS) {
      const match = this.wholeWord(at, target)
      if (match !== null) {
        this.read("link-target", at, match.end)
        return true
      }
    }
    if (this.readRelationEnd(at)) return true
    for (const line of ["--", ".."] as const) {
      const match = matchWord(this.reader, at, line)
      if (match !== null) {
        this.read(line, at, match.end)
        return true
      }
    }
    if (this.readLabel(at)) return true
    const tripleColon = matchWord(this.reader, at, ":::")
    if (tripleColon !== null) {
      this.read(":::", at, tripleColon.end)
      return true
    }
    const single = SINGLE_CHARACTER_UNITS[at.codePoint]
    if (single !== undefined) {
      this.read(single, at, this.reader.after(at))
      return true
    }
    if (isWordCodePoint(at.codePoint)) {
      this.read(
        "word",
        at,
        skipWhile(this.reader, at, (character) =>
          isWordCodePoint(character.codePoint),
        ),
      )
      return true
    }
    if (
      at.codePoint === LEFT_SQUARE_BRACKET ||
      at.codePoint === RIGHT_SQUARE_BRACKET
    ) {
      this.read(
        at.codePoint === LEFT_SQUARE_BRACKET ? "[" : "]",
        at,
        this.reader.after(at),
      )
      return true
    }
    const statementUnit = inStatement
      ? STATEMENT_PUNCTUATION_UNITS[at.codePoint]
      : undefined
    if (statementUnit !== undefined) {
      this.read(statementUnit, at, this.reader.after(at))
      return true
    }
    if (
      PUNCTUATION.includes(at.codePoint) ||
      (!inStatement && (at.codePoint === COMMA || at.codePoint === NUMBER_SIGN))
    ) {
      this.read("punctuation", at, this.reader.after(at))
      return true
    }
    if (isUnicodeLetter(at.codePoint)) {
      this.read("letter", at, this.reader.after(at))
      return true
    }
    return false
  }

  /**
   * The shared rules, rule 5: `` ` ``, the characters up to the next `` ` ``,
   * line feeds included, and that `` ` ``, a `backquoted` unit, or an
   * `empty-backquoted` unit when nothing is between the backquotes. Without
   * a `` ` `` after the first, the unit takes the rest of the text.
   */
  private readBackquoted(at: DiagramCharacter): boolean {
    if (at.codePoint !== GRAVE_ACCENT) return false
    const content = this.reader.after(at)
    const closing = skipWhile(
      this.reader,
      content,
      (character) => character.codePoint !== GRAVE_ACCENT,
    )
    if (closing === null) {
      // `docs/tokens/class.md`, Tokens: mermaid.js reads the name to the end of the
      // source, whitespace and line feeds included.
      this.read("backquoted", at, null, "keep-whitespace")
      return true
    }
    const empty = samePosition(content, closing)
    this.read(
      empty ? "empty-backquoted" : "backquoted",
      at,
      this.reader.after(closing),
    )
    return true
  }

  /** The shared rules, rule 7: a relation end, `<|`, `|>`, `>`, `<`, `*`, `o` not followed by a word character, or `()`. */
  private readRelationEnd(at: DiagramCharacter): boolean {
    for (const end of TWO_CHARACTER_RELATION_ENDS) {
      const match = matchWord(this.reader, at, end)
      if (match !== null) {
        this.read(end, at, match.end)
        return true
      }
    }
    const single = ONE_CHARACTER_RELATION_ENDS[at.codePoint]
    if (single !== undefined) {
      this.read(single, at, this.reader.after(at))
      return true
    }
    const circle = this.wholeWord(at, "o")
    if (circle !== null) {
      this.read("o", at, circle.end)
      return true
    }
    return false
  }

  /**
   * The shared rules, rule 9: `:` and one or more characters other than
   * `:`, `;`, and line feed, as many as possible, a `label` unit, with its
   * `:` and the text after it as its parts.
   */
  private readLabel(at: DiagramCharacter): boolean {
    if (at.codePoint !== COLON) return false
    const textStart = this.reader.after(at)
    const end = skipWhile(
      this.reader,
      textStart,
      (character) =>
        character.codePoint !== COLON &&
        character.codePoint !== SEMICOLON &&
        character.codePoint !== LINE_FEED,
    )
    if (textStart === null || samePosition(textStart, end)) return false
    const label = readUnit(
      this.reader,
      "label",
      this.units.length,
      at,
      end,
      null,
    )
    const colon: Unit = {
      ...readUnit(this.reader, "label", label.index, at, textStart, null),
      memberLine: null,
      label: null,
    }
    const text: Unit = {
      ...readUnit(this.reader, "label", label.index, textStart, end, null),
      memberLine: null,
      label: null,
    }
    this.units.push({
      ...label,
      memberLine: null,
      label: { colon, text, textFrom: textStart, textTo: end },
    })
    this.lineHasUnit = true
    this.position = end
    return true
  }

  /**
   * diagrams/class.md, The class context: a string; a `newline` unit, which
   * leaves the context; other whitespace; `}`, which leaves this context
   * and the one below it; `{`, which enters the member context; and the
   * shared rules.
   */
  private readInClassContext(at: DiagramCharacter): void {
    if (this.readString(at)) return
    if (this.readNewline(at)) {
      this.leave()
      return
    }
    if (this.skipOtherWhitespace(at)) return
    if (at.codePoint === RIGHT_CURLY_BRACKET) {
      this.read("}", at, this.reader.after(at))
      this.leave()
      this.leave()
      return
    }
    if (at.codePoint === LEFT_CURLY_BRACKET) {
      const unit = this.read("{", at, this.reader.after(at))
      this.enter("member", unit)
      this.atMemberStart = true
      return
    }
    if (this.readSharedRules(at, false)) return
    throw this.noRuleMatches(at)
  }

  /**
   * diagrams/class.md, The member context: `"` right after the `{` or after
   * a line feed, a string; `}`, which leaves the context; `[*]`; `{`; a line
   * feed, which makes no unit; and a member line, divided into its units.
   */
  private readInMemberContext(at: DiagramCharacter): void {
    const atMemberStart = this.atMemberStart
    this.atMemberStart = false
    if (atMemberStart && this.readString(at)) return
    if (at.codePoint === RIGHT_CURLY_BRACKET) {
      this.read("}", at, this.reader.after(at))
      this.leave()
      return
    }
    if (this.readEdgeState(at)) return
    if (at.codePoint === LEFT_CURLY_BRACKET) {
      this.read("{", at, this.reader.after(at))
      return
    }
    if (at.codePoint === LINE_FEED) {
      this.position = this.reader.after(at)
      this.atMemberStart = true
      return
    }
    const characters: DiagramCharacter[] = []
    let position: DiagramPosition = at
    while (
      position !== null &&
      position.codePoint !== LEFT_CURLY_BRACKET &&
      position.codePoint !== RIGHT_CURLY_BRACKET &&
      position.codePoint !== LINE_FEED
    ) {
      characters.push(position)
      position = this.reader.after(position)
    }
    for (const unit of this.memberLineUnits(characters, position)) {
      this.units.push({ ...unit, index: this.units.length })
    }
    this.position = position
  }

  /**
   * Member lines: the units of the member line `characters`, which `end`
   * follows. Throws `ParseError` for a method line that cannot be divided,
   * at its member text.
   */
  private memberLineUnits(
    characters: readonly DiagramCharacter[],
    end: DiagramPosition,
  ): Unit[] {
    const divided = divideMemberLine(characters, end)
    if (divided === null) {
      const significant = characters.filter(
        (character) => !isWhitespace(character.codePoint),
      )
      const range: Range = [
        significant[0].start,
        significant[significant.length - 1].end,
      ]
      throw new ParseError(
        "A method line needs a ( that is not its first character and that a ) follows",
        range,
        this.lines.location(range),
      )
    }
    const memberLine: MemberLine = { kind: divided.kind }
    // The division gives each part its exact range, the whitespace at its
    // ends that mermaid.js reads included (Member lines), so the token of a
    // part is the whole part; a blank member has no token.
    return divided.parts.map((part): Unit => ({
      ...readUnit(
        this.reader,
        part.name,
        -1,
        part.from,
        part.to,
        null,
        part.name === "blank-member" ? "trim-whitespace" : "keep-whitespace",
      ),
      memberLine,
      label: null,
    }))
  }

  /**
   * Members and annotations: the units of the text of the label `label`
   * after its `:`, divided as a member line. Their index is that of the
   * label.
   */
  private memberLineOfLabel(label: Unit): readonly Unit[] {
    if (label.label === null) {
      throw new Error(
        `mmd-toolkit parser bug: the unit at ${label.start} is no label`,
      )
    }
    const { textFrom, textTo } = label.label
    const characters: DiagramCharacter[] = []
    for (
      let position: DiagramPosition = textFrom;
      position !== null && !samePosition(position, textTo);
      position = this.reader.after(position)
    ) {
      characters.push(position)
    }
    return this.memberLineUnits(characters, textTo).map((unit) => ({
      ...unit,
      index: label.index,
    }))
  }

  /**
   * diagrams/class.md, The namespace context: a string; `namespace`, which
   * enters another namespace context; a `newline` unit, which leaves the
   * context; other whitespace; `{`, which enters the namespace body
   * context; `}`, which leaves the context without being read; and the
   * shared rules.
   */
  private readInNamespaceContext(at: DiagramCharacter): void {
    if (this.readString(at)) return
    if (this.readEnteringKeyword(at, "namespace", "namespace")) return
    if (this.readNewline(at)) {
      this.leave()
      return
    }
    if (this.skipOtherWhitespace(at)) return
    if (at.codePoint === LEFT_CURLY_BRACKET) {
      const unit = this.read("{", at, this.reader.after(at))
      this.enter("namespace-body", unit)
      return
    }
    if (at.codePoint === RIGHT_CURLY_BRACKET) {
      this.leave()
      return
    }
    if (this.readSharedRules(at, false)) return
    throw this.noRuleMatches(at)
  }

  /**
   * diagrams/class.md, The namespace body context: a string; `namespace`;
   * `}`, which leaves the context; a `newline` unit; other whitespace;
   * `[*]`; `class`; and the shared rules.
   */
  private readInNamespaceBodyContext(at: DiagramCharacter): void {
    if (this.readString(at)) return
    if (this.readEnteringKeyword(at, "namespace", "namespace")) return
    if (at.codePoint === RIGHT_CURLY_BRACKET) {
      this.read("}", at, this.reader.after(at))
      this.leave()
      return
    }
    if (this.readNewline(at)) return
    if (this.skipOtherWhitespace(at)) return
    if (this.readEdgeState(at)) return
    if (this.readEnteringKeyword(at, "class", "class")) return
    if (this.readSharedRules(at, false)) return
    throw this.noRuleMatches(at)
  }

  /** Strings, backquoted names, and generic types: in the generic context, `~`, which leaves it, and one or more other characters, line feeds included, a `generic-text` unit. */
  private readInGenericContext(at: DiagramCharacter): void {
    if (at.codePoint === TILDE) {
      this.read("~", at, this.reader.after(at))
      this.leave()
      return
    }
    // ast/class.md, ClassName: mermaid.js reads the generic type as written,
    // whitespace and line breaks included.
    this.read(
      "generic-text",
      at,
      skipWhile(this.reader, at, (character) => character.codePoint !== TILDE),
      "keep-whitespace",
    )
  }

  /**
   * diagrams/class.md, The callback contexts: in the callback name context,
   * `(`, zero or more whitespace, and `)`, a `(` and a `)` unit, which leave
   * the context; `(`, which leaves it and enters the callback arguments
   * context; and one or more characters other than `(`, line feeds
   * included, a `callback-name` unit, whose whitespace before the `(`
   * mermaid.js reads as part of the name.
   */
  private readInCallbackNameContext(at: DiagramCharacter): void {
    if (at.codePoint === LEFT_PARENTHESIS) {
      const afterParenthesis = this.reader.after(at)
      const closing = skipWhitespace(this.reader, afterParenthesis)
      const opening = this.read("(", at, afterParenthesis)
      if (isCodePointAt(closing, RIGHT_PARENTHESIS)) {
        if (closing !== null) {
          this.position = closing
          this.read(")", closing, this.reader.after(closing))
        }
        this.leave()
        return
      }
      this.leave()
      this.enter("callback-arguments", opening)
      return
    }
    this.read(
      "callback-name",
      at,
      skipWhile(
        this.reader,
        at,
        (character) => character.codePoint !== LEFT_PARENTHESIS,
      ),
      "keep-whitespace",
    )
  }

  /**
   * The callback contexts: in the callback arguments context, `)`, which
   * leaves it, and one or more other characters, line feeds included, a
   * `callback-arguments` unit, whose whitespace at its ends mermaid.js
   * passes on as part of the arguments.
   */
  private readInCallbackArgumentsContext(at: DiagramCharacter): void {
    if (at.codePoint === RIGHT_PARENTHESIS) {
      this.read(")", at, this.reader.after(at))
      this.leave()
      return
    }
    this.read(
      "callback-arguments",
      at,
      skipWhile(
        this.reader,
        at,
        (character) => character.codePoint !== RIGHT_PARENTHESIS,
      ),
      "keep-whitespace",
    )
  }

  /** Accessibility values: in the title and the description context, the rest of the line, a unit named `name`; leaves the context. */
  private readRestOfLine(
    at: DiagramCharacter,
    name: "title-text" | "description-text",
  ): void {
    const end = skipWhile(
      this.reader,
      at,
      (character) => character.codePoint !== LINE_FEED,
    )
    if (!samePosition(end, at)) this.read(name, at, end)
    this.leave()
  }

  /** Accessibility values: in the description block context, `}`, which leaves it, and one or more other characters, a `description-block-text` unit. */
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

  /** Lexical structure: reads `word` from `at` as a keyword, where no word character follows it. */
  private wholeWord(at: DiagramPosition, word: string): Match | null {
    return matchWholeWord(this.reader, at, word)
  }
}
