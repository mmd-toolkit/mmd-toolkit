import type { Range } from "../../ast.ts"
import type {
  C4BoundaryKeyword,
  C4ElementKeyword,
  C4RelationshipKeyword,
  C4UpdateKeyword,
} from "../../ast/c4.ts"
import { isWhitespace } from "../../character-classes.ts"
import {
  COLON,
  COMMA,
  DOLLAR_SIGN,
  EQUALS_SIGN,
  LEFT_CURLY_BRACKET,
  LEFT_PARENTHESIS,
  LINE_FEED,
  NUMBER_SIGN,
  PERCENT_SIGN,
  QUOTATION_MARK,
  RIGHT_CURLY_BRACKET,
  RIGHT_PARENTHESIS,
  SEMICOLON,
  SPACE,
} from "../../code-points.ts"
import type { DiagramComment } from "../../diagram-parsing.ts"
import type {
  DiagramCharacter,
  DiagramPosition,
  DiagramText,
} from "../../diagram-text.ts"
import { lineFeedAfter } from "../../diagram-text.ts"
import type { DiagramUnit, UnitEnds } from "../../diagram-units.ts"
import { readUnit, significantRangeOf } from "../../diagram-units.ts"
import { DirectionLineRule } from "../../direction-line.ts"
import { ParseError } from "../../errors.ts"
import type { LineIndex } from "../../positions.ts"
import {
  isCodePointAt,
  isWhitespaceAt,
  matchWholeWord,
  matchWord,
  skipWhile,
  skipWhitespace,
} from "../../scanning.ts"
import { UnitLexer } from "../../unit-lexer.ts"

/** diagrams/c4.md, The top-level context: the four call families. */
export type CallKeyword =
  C4ElementKeyword | C4BoundaryKeyword | C4RelationshipKeyword | C4UpdateKeyword

/** diagrams/c4.md, Units and contexts: the names of C4 units. */
export type UnitName =
  | CallKeyword
  | "header"
  | "newline"
  | "title"
  | "accDescription"
  | "accTitle"
  | "accDescr"
  | "line-text"
  | "accessibility-text"
  | "description-block-text"
  | "("
  | "(,"
  | ")"
  | ","
  | ",,"
  | "{"
  | "}"
  | ":"
  | "$"
  | "="
  | "quote-open"
  | "quote-close"
  | "string-text"
  | "empty-string"
  | "bare"
  | "key"

/** One unit of the C4 diagram text. */
export type Unit = DiagramUnit<UnitName>

/** diagrams/c4.md, Units and contexts: the context stack. */
type Context =
  | "top-level"
  | "keyword"
  | "argument"
  | "quoted-argument"
  | "named-key"
  | "named-value"
  | "named-string"
  | "acc-title"
  | "acc-descr"
  | "description-block"

/** End of text: the construct that must be completed in each context. */
const END_OF_TEXT_MESSAGES: Readonly<Record<Context, string | null>> = {
  "top-level": null,
  keyword: "The call keyword has no ( before the end of the text",
  argument: "The arguments have no ) before the end of the text",
  "quoted-argument": 'The string has no closing " before the end of the text',
  "named-key": "The named attribute has no = before the end of the text",
  "named-value":
    'The named attribute has no opening " before the end of the text',
  "named-string": 'The string has no closing " before the end of the text',
  "acc-title": "accTitle has no text before the end of the text",
  "acc-descr": "accDescr has no text before the end of the text",
  "description-block":
    "The description block has no } before the end of the text",
}

/** The top-level context, rule 6: headers, in rule order. */
const HEADERS: readonly string[] = [
  "C4Context",
  "C4Container",
  "C4Component",
  "C4Dynamic",
  "C4Deployment",
]

/** The top-level context, rule 7: keywords, in rule order. */
const CALL_KEYWORDS: readonly CallKeyword[] = [
  "Person_Ext",
  "Person",
  "SystemQueue_Ext",
  "SystemDb_Ext",
  "System_Ext",
  "SystemQueue",
  "SystemDb",
  "System",
  "Boundary",
  "Enterprise_Boundary",
  "System_Boundary",
  "ContainerQueue_Ext",
  "ContainerDb_Ext",
  "Container_Ext",
  "ContainerQueue",
  "ContainerDb",
  "Container",
  "Container_Boundary",
  "ComponentQueue_Ext",
  "ComponentDb_Ext",
  "Component_Ext",
  "ComponentQueue",
  "ComponentDb",
  "Component",
  "Deployment_Node",
  "Node",
  "Node_L",
  "Node_R",
  "Rel",
  "BiRel",
  "Rel_Up",
  "Rel_U",
  "Rel_Down",
  "Rel_D",
  "Rel_Left",
  "Rel_L",
  "Rel_Right",
  "Rel_R",
  "Rel_Back",
  "RelIndex",
  "UpdateElementStyle",
  "UpdateRelStyle",
  "UpdateLayoutConfig",
]

/** The units and diagram comments read from C4 diagram text. */
export interface C4Lexing {
  readonly units: readonly Unit[]
  readonly comments: readonly DiagramComment[]
}

/** The top-level context, rule 2: characters of title and accDescription values. */
function isLineValue(character: DiagramCharacter): boolean {
  return (
    character.codePoint !== NUMBER_SIGN &&
    character.codePoint !== SEMICOLON &&
    character.codePoint !== LINE_FEED
  )
}

/** diagrams/c4.md, Lexical structure: first matching rules in the current context. */
export class C4UnitLexer extends UnitLexer<Context, UnitName, Unit> {
  private readonly comments: DiagramComment[] = []

  /** Direction rejection uses the shared direction lookahead with exact case. */
  private readonly direction: DirectionLineRule

  public constructor(reader: DiagramText, lines: LineIndex) {
    super(reader, lines, "top-level", END_OF_TEXT_MESSAGES)
    this.direction = new DirectionLineRule(
      reader,
      ["TB", "BT", "RL", "LR"],
      matchWord,
    )
  }

  /** Reads the text and rejects unfinished contexts. */
  public lex(): C4Lexing {
    this.readToEnd()
    this.checkEndOfText()
    return { units: this.units, comments: this.comments }
  }

  /** Makes one unit, whose exterior whitespace is kept only when `ends` says so. */
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

  /** Units and contexts: only the current context's rules apply. */
  protected override readInContext(
    at: DiagramCharacter,
    context: Context,
  ): void {
    switch (context) {
      case "top-level":
        this.readInTopLevel(at)
        return
      case "keyword":
        this.readInKeyword(at)
        return
      case "argument":
        this.readInArgument(at)
        return
      case "quoted-argument":
      case "named-string":
        this.readInString(at)
        return
      case "named-key":
        this.readInNamedKey(at)
        return
      case "named-value":
        this.readInNamedValue(at)
        return
      case "acc-title":
      case "acc-descr":
        this.readAccessibilityText(at)
        return
      case "description-block":
        this.readInDescriptionBlock(at)
        return
      default:
        throw new Error(
          `mmd-toolkit parser bug: unknown context ${JSON.stringify(context satisfies never)}`,
        )
    }
  }

  /** The top-level context: rules 1 to 8, in order. */
  private readInTopLevel(at: DiagramCharacter): void {
    this.rejectDirection(at)
    if (
      this.readLineValue(at, "title") ||
      this.readLineValue(at, "accDescription") ||
      this.readAccessibilityMarker(at, "accTitle", COLON, "acc-title") ||
      this.readAccessibilityMarker(at, "accDescr", COLON, "acc-descr") ||
      this.readAccessibilityMarker(
        at,
        "accDescr",
        LEFT_CURLY_BRACKET,
        "description-block",
      ) ||
      this.readComment(at) ||
      this.readWhitespace(at) ||
      this.readHeader(at) ||
      this.readCallKeyword(at) ||
      this.readMark(at, "{") ||
      this.readMark(at, "}")
    )
      return
    throw this.noRuleMatches(at)
  }

  /** Direction rejection: report the matched direction keyword through its value. */
  private rejectDirection(at: DiagramCharacter): void {
    const match = this.direction.match(at)
    if (match === null) return
    const word = match.units.find((unit) => unit.name === "direction")!
    const value = match.units.find((unit) => unit.name === "direction-value")!
    const valueUnit = readUnit(
      this.reader,
      "direction-value",
      0,
      value.from,
      value.to,
      null,
    )
    const range: Range = [word.from.start, significantRangeOf(valueUnit)[1]]
    throw new ParseError(
      "A direction line is not allowed in C4",
      range,
      this.lines.location(range),
    )
  }

  /** Title and accessibility contexts: one separator, then a nonempty line value. */
  private readLineValue(
    at: DiagramCharacter,
    name: "title" | "accDescription",
  ): boolean {
    const word = matchWord(this.reader, at, name)
    if (word === null || !isWhitespaceAt(word.end)) return false
    const text = this.reader.after(word.end)
    if (text === null || !isLineValue(text)) return false
    this.addUnit(name, at, word.end)
    this.read(
      "line-text",
      text,
      skipWhile(this.reader, text, isLineValue),
      "keep-whitespace",
    )
    return true
  }

  /** The top-level context, rule 3: separate keyword and delimiter, then skip whitespace. */
  private readAccessibilityMarker(
    at: DiagramCharacter,
    name: "accTitle" | "accDescr",
    mark: typeof COLON | typeof LEFT_CURLY_BRACKET,
    context: Context,
  ): boolean {
    const word = matchWord(this.reader, at, name)
    if (word === null) return false
    const delimiter = skipWhitespace(this.reader, word.end)
    if (!isCodePointAt(delimiter, mark)) return false
    const unit = this.addUnit(name, at, word.end)
    this.addUnit(
      mark === COLON ? ":" : "{",
      delimiter,
      this.reader.after(delimiter),
    )
    this.position = skipWhitespace(this.reader, this.reader.after(delimiter))
    this.enter(context, significantRangeOf(unit))
    return true
  }

  /** Comments: a unit-start %% comment ends before LF, keeping that separator. */
  private readComment(at: DiagramCharacter): boolean {
    if (at.codePoint !== PERCENT_SIGN) return false
    const second = this.reader.after(at)
    if (!isCodePointAt(second, PERCENT_SIGN)) return false
    const end = lineFeedAfter(this.reader, second)
    this.comments.push({
      range: [at.start, end.start],
      mark: "%%",
      valueStart: second.end,
    })
    this.position = end
    return true
  }

  /** Whitespace: fold through the final LF of a run; skip any remainder separately. */
  private readWhitespace(at: DiagramCharacter): boolean {
    if (!isWhitespace(at.codePoint)) return false
    let end: DiagramPosition = at
    let afterLineFeed: DiagramPosition = at
    let foundLineFeed = false
    while (end !== null && isWhitespace(end.codePoint)) {
      const next = this.reader.after(end)
      if (end.codePoint === LINE_FEED) {
        foundLineFeed = true
        afterLineFeed = next
      }
      end = next
    }
    if (foundLineFeed) this.read("newline", at, afterLineFeed)
    else this.position = end
    return true
  }

  /** The top-level context, rule 6: an exact header not followed by a word character. */
  private readHeader(at: DiagramCharacter): boolean {
    for (const word of HEADERS) {
      const match = matchWholeWord(this.reader, at, word)
      if (match !== null) {
        this.read("header", at, match.end)
        return true
      }
    }
    return false
  }

  /** The top-level context, rule 7: an exact call keyword enters its context. */
  private readCallKeyword(at: DiagramCharacter): boolean {
    for (const word of CALL_KEYWORDS) {
      const match = matchWholeWord(this.reader, at, word)
      if (match !== null) {
        const unit = this.read(word, at, match.end)
        this.enter("keyword", significantRangeOf(unit))
        return true
      }
    }
    return false
  }

  /** Reads the exact delimiter `mark` as one unit. */
  private readMark(at: DiagramCharacter, mark: UnitName): boolean {
    const match = matchWord(this.reader, at, mark)
    if (match === null) return false
    this.read(mark, at, match.end)
    return true
  }

  /** The keyword context: EOF, opening with an empty entry, ordinary opening, closing. */
  private readInKeyword(at: DiagramCharacter): void {
    if (
      at.endOfText ||
      (isWhitespace(at.codePoint) && skipWhitespace(this.reader, at) === null)
    ) {
      this.checkEndOfText()
      return
    }
    if (at.codePoint === LEFT_PARENTHESIS) {
      const after = this.reader.after(at)
      const comma = skipWhile(this.reader, after, (c) => c.codePoint === SPACE)
      const unit = isCodePointAt(comma, COMMA)
        ? this.read("(,", at, this.reader.after(comma))
        : this.read("(", at, after)
      this.enter("argument", significantRangeOf(unit))
      return
    }
    if (this.readMark(at, ")")) {
      this.leave()
      return
    }
    throw this.noRuleMatches(at)
  }

  /** The argument context: rules 1 to 6, in their specified order. */
  private readInArgument(at: DiagramCharacter): void {
    if (at.codePoint === RIGHT_PARENTHESIS) {
      this.read(")", at, this.reader.after(at))
      this.leave()
      this.leave()
      return
    }
    if (this.readMark(at, ",,") || this.readMark(at, ",")) return
    const significant = skipWhile(this.reader, at, (c) => c.codePoint === SPACE)
    if (isCodePointAt(significant, QUOTATION_MARK)) {
      const after = this.reader.after(significant)
      if (isCodePointAt(after, QUOTATION_MARK)) {
        this.read("empty-string", significant, this.reader.after(after))
      } else {
        const unit = this.read("quote-open", significant, after)
        this.enter("quoted-argument", significantRangeOf(unit))
      }
      return
    }
    if (isCodePointAt(significant, DOLLAR_SIGN)) {
      const unit = this.read("$", significant, this.reader.after(significant))
      this.enter("named-key", significantRangeOf(unit))
      return
    }
    this.read(
      "bare",
      at,
      skipWhile(this.reader, at, (c) => c.codePoint !== COMMA),
    )
  }

  /** Strings and named attributes: the next quote closes; all other characters are content. */
  private readInString(at: DiagramCharacter): void {
    if (at.codePoint === QUOTATION_MARK) {
      this.read("quote-close", at, this.reader.after(at))
      this.leave()
      return
    }
    this.read(
      "string-text",
      at,
      skipWhile(this.reader, at, (c) => c.codePoint !== QUOTATION_MARK),
      "keep-whitespace",
    )
  }

  /** Strings and named attributes: a key takes everything up to =, which is a separate unit. */
  private readInNamedKey(at: DiagramCharacter): void {
    if (at.codePoint === EQUALS_SIGN) {
      const entry = this.currentEntry()!
      this.read("=", at, this.reader.after(at))
      this.leave()
      this.enter("named-value", entry)
      return
    }
    this.read(
      "key",
      at,
      skipWhile(this.reader, at, (c) => c.codePoint !== EQUALS_SIGN),
    )
  }

  /** Strings and named attributes: ASCII spaces, then an opening quote in a separate unit. */
  private readInNamedValue(at: DiagramCharacter): void {
    const quote = skipWhile(this.reader, at, (c) => c.codePoint === SPACE)
    if (quote !== null && quote.codePoint === QUOTATION_MARK) {
      const unit = this.read("quote-open", quote, this.reader.after(quote))
      this.leave()
      this.enter("named-string", significantRangeOf(unit))
      return
    }
    if (
      quote === null ||
      quote.endOfText ||
      (isWhitespace(quote.codePoint) &&
        skipWhitespace(this.reader, quote) === null)
    ) {
      this.checkEndOfText()
      return
    }
    throw this.noRuleMatches(quote)
  }

  /** Title and accessibility contexts: a colon value takes the rest of its line. */
  private readAccessibilityText(at: DiagramCharacter): void {
    this.read(
      "accessibility-text",
      at,
      skipWhile(this.reader, at, (c) => c.codePoint !== LINE_FEED),
    )
    this.leave()
  }

  /** Title and accessibility contexts: the first } closes a description block. */
  private readInDescriptionBlock(at: DiagramCharacter): void {
    if (at.codePoint === RIGHT_CURLY_BRACKET) {
      this.read("}", at, this.reader.after(at))
      this.leave()
      return
    }
    this.read(
      "description-block-text",
      at,
      skipWhile(this.reader, at, (c) => c.codePoint !== RIGHT_CURLY_BRACKET),
    )
  }
}
