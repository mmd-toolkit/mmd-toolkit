import {
  isAsciiDigit,
  isAsciiLetter,
  isWhitespace,
} from "../../character-classes.ts"
import { CommonFormUnitLexer, isHws } from "../../common-form-unit-lexer.ts"
import type { CommonFormUnitName } from "../../common-form-unit-lexer.ts"
import type { DiagramCharacter, DiagramPosition } from "../../diagram-text.ts"
import type { DiagramUnit } from "../../diagram-units.ts"
import { readUnit } from "../../diagram-units.ts"
import {
  LOW_LINE,
  HYPHEN_MINUS,
  LINE_FEED,
  QUESTION_MARK,
  SEMICOLON,
} from "../../code-points.ts"
import { matchWord, samePosition, skipWhile } from "../../scanning.ts"

/** diagrams/railroad.md: authored atoms and the shared composite metadata components. */
export type UnitName =
  | CommonFormUnitName
  | "header"
  | "name"
  | "string"
  | "special-sequence"
  | "numeric-value"
  | "repeat-minimum"
  | "repeat-star"
  | "repeat-maximum"
  | "exact-repeat"
  | "nonterminal"
  | "zeroOrMore"
  | "oneOrMore"
  | "sequence"
  | "optional"
  | "terminal"
  | "special"
  | "choice"
  | "="
  | ";"
  | "("
  | ","
  | ")"
  | "::="
  | "|"
  | "["
  | "]"
  | "?"
  | "*"
  | "+"
  | "-"
  | "/"
  | "<-"
  | "&"
  | "!"
  | "."

/** Composite repeat matches split only at their authored decimal/star boundaries. */
export type Unit = DiagramUnit<UnitName>

/** Shared railroad terminals only; no common grammar or visible EOL is imported. */
export abstract class RailroadUnitLexer extends CommonFormUnitLexer<UnitName> {
  /** Names differ only in whether an initial/continuing underscore is permitted. */
  protected nameEnd(
    at: DiagramCharacter,
    underscores = true,
  ): DiagramPosition | undefined {
    if (
      !isAsciiLetter(at.codePoint) &&
      !(underscores && at.codePoint === LOW_LINE)
    )
      return undefined
    return skipWhile(
      this.reader,
      this.reader.after(at),
      (c) =>
        isAsciiLetter(c.codePoint) ||
        isAsciiDigit(c.codePoint) ||
        c.codePoint === HYPHEN_MINUS ||
        (underscores && c.codePoint === LOW_LINE),
    )
  }

  /** IR/EBNF/ABNF/PEG name: maximal ASCII name, with the dialect's underscore rule. */
  protected readName(at: DiagramCharacter, underscores = true): boolean {
    const end = this.nameEnd(at, underscores)
    if (end === undefined) return false
    this.read("name", at, end)
    return true
  }

  /** Exact header and shared boundary, with the dialect's explicit longer-name alternative. */
  protected readHeader(
    at: DiagramCharacter,
    spelling: string,
    underscores = true,
  ): boolean {
    const match = this.matchKeyword(at, spelling)
    if (match === null) return false
    this.readUnitOrLongerAlternative(
      at,
      "header",
      match.end,
      "name",
      this.nameEnd(at, underscores),
    )
    return true
  }

  /** IR constructors alone have the explicit longer ir-name alternative. */
  protected readConstructor(at: DiagramCharacter, name: UnitName): boolean {
    const match = matchWord(this.reader, at, name)
    if (match === null) return false
    this.readUnitOrLongerAlternative(
      at,
      name,
      match.end,
      "name",
      this.nameEnd(at),
    )
    return true
  }

  /** Each compound assignment is one atom; all other punctuation is one character. */
  protected readSymbol(at: DiagramCharacter, name: UnitName): boolean {
    const match = matchWord(this.reader, at, name)
    if (match === null) return false
    this.read(name, at, match.end)
    return true
  }

  /** Metadata priority is title, access title, then colon/block access description. */
  protected readMetadata(at: DiagramCharacter): boolean {
    return this.readTitle(at) || this.readAccTitle(at) || this.readAccDescr(at)
  }

  /** Native padding: ASCII space/tab and converted CR/LF only; never a visible unit. */
  protected readPadding(at: DiagramCharacter): boolean {
    if (!isHws(at) && at.codePoint !== LINE_FEED) return false
    this.position = skipWhile(
      this.reader,
      at,
      (c) => isHws(c) || c.codePoint === LINE_FEED,
    )
    return true
  }

  /** Shared native YAML, DIRECTIVE and percent comment rules in that order. */
  protected readHidden(at: DiagramCharacter): boolean {
    return this.readYaml(at) || this.readDirective(at) || this.readComment(at)
  }

  /** Native block comments take the first closer, including that closer in the comment range. */
  protected readBlockComment(
    at: DiagramCharacter,
    mark: "/*" | "(*",
    closer: string,
  ): boolean {
    const opening = matchWord(this.reader, at, mark)
    if (opening === null) return false
    let cursor = opening.end
    while (cursor !== null) {
      const close = matchWord(this.reader, cursor, closer)
      if (close !== null) {
        const end = readUnit(this.reader, "comment", 0, at, close.end, null).end
        this.comments.push({
          range: [at.start, end],
          mark,
          valueStart: this.reader.after(at)!.end,
        })
        this.position = close.end
        return true
      }
      cursor = this.reader.after(cursor)
    }
    return false
  }

  /** ABNF/PEG native line comments stop only at physical line endings, not LS/PS. */
  protected readLineComment(
    at: DiagramCharacter,
    mark: ";" | "#",
    longerOnly = false,
  ): boolean {
    const opening = matchWord(this.reader, at, mark)
    if (opening === null) return false
    const end = skipWhile(
      this.reader,
      opening.end,
      (c) => c.codePoint !== LINE_FEED,
    )
    if (longerOnly && samePosition(opening.end, end)) return false
    this.comments.push({
      range: [at.start, end?.start ?? at.end],
      mark,
      valueStart: at.end,
    })
    this.position = end
    return true
  }

  /** EBNF special sequence: the first question mark closes nonblank, semicolon-free content. */
  protected readSpecialSequence(at: DiagramCharacter): boolean {
    if (at.codePoint !== QUESTION_MARK) return false
    let cursor = this.reader.after(at)
    let nonblank = false
    while (
      cursor !== null &&
      !cursor.endOfText &&
      cursor.codePoint !== SEMICOLON
    ) {
      if (cursor.codePoint === QUESTION_MARK) {
        if (!nonblank) return false
        this.read("special-sequence", at, this.reader.after(cursor))
        return true
      }
      nonblank ||= !isWhitespace(cursor.codePoint)
      cursor = this.reader.after(cursor)
    }
    return false
  }
}
