import type { Range } from "./ast.ts"
import {
  isAsciiDigit,
  isAsciiLetter,
  isWhitespace,
} from "./character-classes.ts"
import {
  AMPERSAND,
  APOSTROPHE,
  ASTERISK,
  CIRCUMFLEX_ACCENT,
  COLON,
  COMMA,
  COMMERCIAL_AT,
  DOLLAR_SIGN,
  EXCLAMATION_MARK,
  FULL_STOP,
  GRAVE_ACCENT,
  GREATER_THAN_SIGN,
  HYPHEN_MINUS,
  LATIN_SMALL_LETTER_V,
  LEFT_CURLY_BRACKET,
  LEFT_PARENTHESIS,
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
  SOLIDUS,
} from "./code-points.ts"
import { ParseError } from "./errors.ts"
import type { LineIndex } from "./positions.ts"
import type {
  DiagramCharacter,
  DiagramPosition,
  DiagramText,
} from "./diagram-text.ts"
import type { Match } from "./scanning.ts"
import {
  isBefore,
  isCodePointAt,
  isWhitespaceAt,
  isWordCharacterAt,
  matchWholeWord,
  matchWord,
  samePosition,
  skipWhile,
  skipWhitespace,
} from "./scanning.ts"
import { isUnicodeLetter } from "./unicode-letters.ts"
import { UnitLexer } from "./unit-lexer.ts"
import { DirectionLineRule } from "./direction-line.ts"
import type { DiagramUnit, UnitEnds } from "./diagram-units.ts"
import { readUnit, significantRangeOf } from "./diagram-units.ts"

/** Unit names of the lexical rules shared by flowchart and agentflow. */
export type GraphUnitName =
  | "accTitle"
  | "accDescr"
  | ":"
  | "{"
  | "}"
  | "data-start"
  | "data-quote"
  | "data-text"
  | "call"
  | "callback-name"
  | "callback-arguments"
  | "string"
  | "markdown-string"
  | "empty-string"
  | "style"
  | "default"
  | "linkStyle"
  | "interpolate"
  | "classDef"
  | "class"
  | "href"
  | "click"
  | "click-id"
  | "click-comma"
  | "header-keyword"
  | "no-direction"
  | "header-direction"
  | "end"
  | "link-target"
  | "direction-text"
  | "direction"
  | "direction-value"
  | "edge-id"
  | "@"
  | "number"
  | "#"
  | ":::"
  | "&"
  | ";"
  | ","
  | "*"
  | "arrow"
  | "opening-arrow"
  | "link-text-char"
  | "(-"
  | "(["
  | "[["
  | ">"
  | "[("
  | "((("
  | "[|"
  | "[/"
  | "[\\"
  | "^"
  | "v"
  | "id-run"
  | "-"
  | "letter"
  | "|"
  | "("
  | "["
  | "])"
  | "]]"
  | ")]"
  | ")))"
  | ")"
  | "]"
  | "text-run"
  | "backslash-end"
  | "slash-end"
  | "ellipse-end"
  | "title-text"
  | "description-text"
  | "description-block-text"
  | "newline"
  | "space"

/** Contexts with the same lexical rules in flowchart and agentflow. */
export type GraphContext =
  | "statement"
  | "header"
  | "title"
  | "description"
  | "description-block"
  | "data"
  | "data-string"
  | "click"
  | "callback-name"
  | "callback-arguments"
  | "label"
  | "slanted"
  | "ellipse"
  | "dash-link-text"

/** A unit's shared source fields; each diagram supplies its arrow vocabulary. */
export interface GraphUnit<
  Name extends string,
  Arrow,
> extends DiagramUnit<Name> {
  /** The source range of a string's one content run; null for other units. */
  readonly content: Range | null
  /** The opening context of an empty-string unit; null for other units. */
  readonly emptyStringKind: "empty-string" | "empty-markdown-string" | null
  /** The diagram's arrow parts; null for units other than arrows. */
  readonly arrow: Arrow | null
}

type GraphName<ExtraName extends string> = GraphUnitName | ExtraName

/** The keywords of the statement context, rule 7, in the order in which they are tried. */
const STATEMENT_KEYWORDS = [
  "style",
  "default",
  "linkStyle",
  "interpolate",
  "classDef",
  "class",
] as const

/** The link targets of the statement context, rule 13. */
const LINK_TARGETS = ["_self", "_blank", "_parent", "_top"] as const

/** The direction line: the values, in the order in which they are tried. */
const DIRECTION_LINE_VALUES: readonly string[] = ["TB", "BT", "RL", "LR", "TD"]

/** The directions of the header context that are words, rule 2. */
const HEADER_DIRECTION_WORDS = [
  "LR",
  "RL",
  "TB",
  "BT",
  "TD",
  "BR",
  "v",
] as const

/** The units of the statement context, rule 17, in the order in which they are tried. */
const STATEMENT_PUNCTUATION = ["#", ":::", ":", "&", ";", ",", "*"] as const

/**
 * The units of the statement context, rule 19, in the order in which they
 * are tried, each with the context that it enters, if any.
 */
const SHAPE_OPENERS: readonly {
  readonly name: GraphUnitName & string
  readonly enters: GraphContext | null
}[] = [
  { name: "(-", enters: "ellipse" },
  { name: "([", enters: "label" },
  { name: "[[", enters: "label" },
  { name: ">", enters: "label" },
  { name: "[(", enters: "label" },
  { name: "(((", enters: "label" },
  { name: "[|", enters: null },
  { name: "[/", enters: "slanted" },
  { name: "[\\", enters: "slanted" },
  { name: "^", enters: null },
]

/** Statement context, rule 21: the characters of an id run that are not ASCII letters or digits, other than `-`. */
const ID_RUN_PUNCTUATION: readonly number[] = [
  EXCLAMATION_MARK,
  QUOTATION_MARK,
  NUMBER_SIGN,
  DOLLAR_SIGN,
  PERCENT_SIGN,
  AMPERSAND,
  APOSTROPHE,
  ASTERISK,
  PLUS_SIGN,
  FULL_STOP,
  GRAVE_ACCENT,
  QUESTION_MARK,
  REVERSE_SOLIDUS,
  LOW_LINE,
  SOLIDUS,
]

/** Whether the character is one of `codePoints`. */
export function isOneOf(
  character: DiagramCharacter,
  codePoints: readonly number[],
): boolean {
  return codePoints.includes(character.codePoint)
}

/** Statement context, rule 21: the characters of an id run other than `-`, which depends on what follows it. */
function isIdRunCharacter(codePoint: number): boolean {
  return (
    isAsciiLetter(codePoint) ||
    isAsciiDigit(codePoint) ||
    ID_RUN_PUNCTUATION.includes(codePoint)
  )
}

/** The identical lexical rules of diagrams/flowchart.md and diagrams/agentflow.md. */
export abstract class GraphUnitLexer<
  ExtraContext extends string,
  ExtraName extends string,
  Arrow extends { readonly form: "closed" | "opening" },
> extends UnitLexer<
  GraphContext | ExtraContext,
  GraphName<ExtraName>,
  GraphUnit<GraphName<ExtraName>, Arrow>
> {
  /** The whitespace characters that leave the click context, in source order. */
  protected readonly clickContextExits: Range[] = []

  /** The diagram's header words, in matching order. */
  protected abstract readonly headerKeywords: readonly string[]

  /** Whether the first header keyword has already entered the header context. */
  private headerKeywordRead = false

  /** The shared direction values, matched in their specified order. */
  private readonly directionLine: DirectionLineRule

  /** A failed edge-id run cannot contain another edge-id start before this position. */
  private noEdgeIdBefore: DiagramPosition

  protected constructor(
    reader: DiagramText,
    lines: LineIndex,
    statementContext: GraphContext | ExtraContext,
    endOfTextMessages: Readonly<
      Record<GraphContext | ExtraContext, string | null>
    >,
  ) {
    super(reader, lines, statementContext, endOfTextMessages)
    this.noEdgeIdBefore = reader.first()
    this.directionLine = new DirectionLineRule(
      reader,
      DIRECTION_LINE_VALUES,
      matchWord,
    )
  }

  /**
   * Adds the unit named `name` that reads the characters from `from` up to,
   * and not including, `to`. Its text is those characters.
   */
  protected override addUnit(
    name: GraphName<ExtraName>,
    from: DiagramCharacter,
    to: DiagramPosition,
    ends: UnitEnds = "trim-whitespace",
  ): GraphUnit<GraphName<ExtraName>, Arrow> {
    return this.addUnitWithText(name, from, to, null, null, ends)
  }

  /**
   * Adds the unit named `name` that reads the characters from `from` up to,
   * and not including, `to`. Its text is `text`, or those characters when
   * `text` is null; `content` is where the content of a string lies; its
   * token keeps the whitespace at its ends as `ends` says.
   */
  protected addUnitWithText(
    name: GraphName<ExtraName>,
    from: DiagramCharacter,
    to: DiagramPosition,
    text: string | null,
    content: Range | null,
    ends: UnitEnds = "trim-whitespace",
    emptyStringKind: "empty-string" | "empty-markdown-string" | null = null,
  ): GraphUnit<GraphName<ExtraName>, Arrow> {
    const unit: GraphUnit<GraphName<ExtraName>, Arrow> = {
      ...readUnit(this.reader, name, this.units.length, from, to, text, ends),
      content,
      emptyStringKind,
      arrow: null,
    }
    this.units.push(unit)
    return unit
  }

  /**
   * Adds the `arrow` or `opening-arrow` unit, as its parts say, that reads
   * the characters from `from` up to, and not including, `to`: the arrow
   * with the whitespace around it.
   */
  protected addArrowUnit(
    from: DiagramCharacter,
    to: DiagramPosition,
    parts: Arrow,
  ): GraphUnit<GraphName<ExtraName>, Arrow> {
    const name = parts.form === "closed" ? "arrow" : "opening-arrow"
    const unit: GraphUnit<GraphName<ExtraName>, Arrow> = {
      ...readUnit(this.reader, name, this.units.length, from, to, null),
      content: null,
      emptyStringKind: null,
      arrow: parts,
    }
    this.units.push(unit)
    return unit
  }

  /** The place after the whitespace at `from`, line feeds included. */
  protected afterWhitespace(from: DiagramPosition): DiagramPosition {
    return skipWhitespace(this.reader, from)
  }

  /** Reads `word` from `at`, one character at a time; null when the diagram text differs. */
  protected word(at: DiagramPosition, word: string): Match | null {
    return matchWord(this.reader, at, word)
  }

  /** Reads `word` from `at` when no word character follows it; null otherwise. */
  protected wholeWord(at: DiagramPosition, word: string): Match | null {
    return matchWholeWord(this.reader, at, word)
  }

  /**
   * Statement context, rules 1 to 3: `accTitle` or `accDescr`, whitespace,
   * `:` (or `{` after `accDescr`), and whitespace. The keyword and the
   * punctuation are a unit each; the whitespace is read outside them.
   */
  protected readAccessibilityMarker(at: DiagramCharacter): boolean {
    const title = this.word(at, "accTitle")
    if (title !== null) {
      const colon = this.afterWhitespace(title.end)
      if (isCodePointAt(colon, COLON)) {
        const keyword = this.addUnit("accTitle", at, title.end)
        this.addUnit(":", colon, this.reader.after(colon))
        this.position = this.afterWhitespace(this.reader.after(colon))
        this.enter("title", significantRangeOf(keyword))
        return true
      }
    }
    const description = this.word(at, "accDescr")
    if (description === null) return false
    const mark = this.afterWhitespace(description.end)
    if (isCodePointAt(mark, COLON)) {
      const keyword = this.addUnit("accDescr", at, description.end)
      this.addUnit(":", mark, this.reader.after(mark))
      this.position = this.afterWhitespace(this.reader.after(mark))
      this.enter("description", significantRangeOf(keyword))
      return true
    }
    if (isCodePointAt(mark, LEFT_CURLY_BRACKET)) {
      const keyword = this.addUnit("accDescr", at, description.end)
      this.addUnit("{", mark, this.reader.after(mark))
      this.position = this.afterWhitespace(this.reader.after(mark))
      this.enter("description-block", significantRangeOf(keyword))
      return true
    }
    return false
  }

  /** Statement context, rule 4: `@{` is a `data-start` unit and enters the data context. */
  protected readDataStart(at: DiagramCharacter): boolean {
    const match = this.word(at, "@{")
    if (match === null) return false
    const start = this.read("data-start", at, match.end)
    this.enter("data", significantRangeOf(start))
    return true
  }

  /**
   * Statement context, rule 5: `call` and one or more whitespace. The word
   * is a `call` unit; the rule enters the callback name context.
   */
  protected readCallKeyword(at: DiagramCharacter): boolean {
    const match = this.word(at, "call")
    if (match === null || !isWhitespaceAt(match.end)) return false
    const call = this.addUnit("call", at, match.end)
    this.position = this.afterWhitespace(match.end)
    this.enter("callback-name", significantRangeOf(call))
    return true
  }

  /**
   * Statement context, rule 7: a keyword that no word character follows is a
   * unit named by its text.
   */
  protected readStatementKeyword(at: DiagramCharacter): boolean {
    for (const keyword of STATEMENT_KEYWORDS) {
      const match = this.wholeWord(at, keyword)
      if (match !== null) {
        this.read(keyword, at, match.end)
        return true
      }
    }
    return false
  }

  /** Statement context, rule 8: `href` and one whitespace character; the word is an `href` unit. */
  protected readHrefKeyword(at: DiagramCharacter): boolean {
    const match = this.word(at, "href")
    if (match === null || !isWhitespaceAt(match.end)) return false
    this.addUnit("href", at, match.end)
    this.position = this.reader.after(match.end)
    return true
  }

  /**
   * Statement context, rule 9: `click` and one or more whitespace. The word
   * is a `click` unit; the rule enters the click context.
   */
  protected readClickKeyword(at: DiagramCharacter): boolean {
    const match = this.word(at, "click")
    if (match === null || !isWhitespaceAt(match.end)) return false
    const click = this.addUnit("click", at, match.end)
    this.position = this.afterWhitespace(match.end)
    this.enter("click", significantRangeOf(click))
    // Click and callbacks: the text may not end in the click context before
    // it reads anything. The error is at the `click`.
    if (this.position === null) {
      const range = significantRangeOf(click)
      throw new ParseError(
        "click has no click id before the end of the text",
        range,
        this.lines.location(range),
      )
    }
    return true
  }

  /**
   * Statement context, rule 10: a header keyword that no word character
   * follows. The first one in the text also enters the header context.
   */
  protected readHeaderKeyword(at: DiagramCharacter): boolean {
    for (const keyword of this.headerKeywords) {
      const match = this.wholeWord(at, keyword)
      if (match !== null) {
        const unit = this.read("header-keyword", at, match.end)
        if (!this.headerKeywordRead) {
          this.enter("header", significantRangeOf(unit))
        }
        this.headerKeywordRead = true
        return true
      }
    }
    return false
  }

  /** Statement context, rule 13: a link target that no word character follows. */
  protected readLinkTarget(at: DiagramCharacter): boolean {
    for (const target of LINK_TARGETS) {
      const match = this.wholeWord(at, target)
      if (match !== null) {
        this.read("link-target", at, match.end)
        return true
      }
    }
    return false
  }

  /**
   * Statement context, rule 14, The direction line: the units of the
   * direction line that starts at `at`, with the values of the flowchart
   * (see `DirectionLineRule`).
   */
  protected readDirectionLine(at: DiagramCharacter): boolean {
    const line = this.directionLine.match(at)
    if (line === null) return false
    for (const unit of line.units) this.addUnit(unit.name, unit.from, unit.to)
    this.position = line.end
    return true
  }

  /**
   * Statement context, rule 15: an edge id. A run of characters that are
   * neither whitespace nor `"`, ending with an `@` that is followed by a
   * character other than `{` and `"`; the run ends at the last such `@`
   * before the next whitespace or `"`. The characters before that `@` are
   * an `edge-id` unit, and the `@` is an `@` unit.
   */
  protected readEdgeId(at: DiagramCharacter): boolean {
    if (isBefore(at, this.noEdgeIdBefore)) return false
    let lastAt: DiagramCharacter | null = null
    let position: DiagramPosition = at
    while (
      position !== null &&
      !isWhitespace(position.codePoint) &&
      position.codePoint !== QUOTATION_MARK
    ) {
      if (position.codePoint === COMMERCIAL_AT && !samePosition(position, at)) {
        const following = this.reader.after(position)
        if (
          following !== null &&
          following.codePoint !== LEFT_CURLY_BRACKET &&
          following.codePoint !== QUOTATION_MARK
        ) {
          lastAt = position
        }
      }
      position = this.reader.after(position)
    }
    if (lastAt === null) {
      // When the rule fails at a start, it fails at every start up to the
      // end of the run, `position`: whether an `@` is one that the rule
      // takes does not depend on the start, and the run from a later start
      // lies inside the run from this one. So the end is kept, and a start
      // before it fails without walking the run, which, walked again from
      // every start, would take time in the square of its length.
      this.noEdgeIdBefore = position
      return false
    }
    this.addUnit("edge-id", at, lastAt)
    this.read("@", lastAt, this.reader.after(lastAt))
    return true
  }

  /** Statement context, rule 16: one or more ASCII digits are a `number` unit. */
  protected readNumber(at: DiagramCharacter): boolean {
    const end = skipWhile(this.reader, at, (character) =>
      isAsciiDigit(character.codePoint),
    )
    if (samePosition(end, at)) return false
    this.read("number", at, end)
    return true
  }

  /** Statement context, rule 17: `#`, `:::`, `:`, `&`, `;`, `,`, or `*`, a unit named by its text. */
  protected readStatementPunctuation(at: DiagramCharacter): boolean {
    for (const punctuation of STATEMENT_PUNCTUATION) {
      const match = this.word(at, punctuation)
      if (match !== null) {
        this.read(punctuation, at, match.end)
        return true
      }
    }
    return false
  }

  /**
   * Statement context, rule 19: the units that open a shape other than with
   * a single `(`, `[`, or `{`, and `^`, each named by its text; then `\|`,
   * which is rejected.
   */
  protected readShapeOpener(at: DiagramCharacter): boolean {
    for (const opener of SHAPE_OPENERS) {
      const match = this.word(at, opener.name)
      if (match !== null) {
        const unit = this.read(opener.name, at, match.end)
        if (opener.enters !== null) {
          this.enter(opener.enters, significantRangeOf(unit))
        }
        return true
      }
    }
    if (this.word(at, "\\|") !== null) throw this.noRuleMatches(at)
    return false
  }

  /** Statement context, rule 20: `v` that no word character follows is a `v` unit. */
  protected readLetterV(at: DiagramCharacter): boolean {
    if (at.codePoint !== LATIN_SMALL_LETTER_V) return false
    const end = this.reader.after(at)
    if (isWordCharacterAt(end)) return false
    this.read("v", at, end)
    return true
  }

  /**
   * Statement context, rule 21: an id run, as many characters as possible,
   * each an ASCII letter or digit, one of the listed characters, or a `-`
   * followed by a character other than `>`, `-`, and `.`.
   */
  protected readIdRun(at: DiagramCharacter): boolean {
    const end = skipWhile(this.reader, at, (character) => {
      if (character.codePoint !== HYPHEN_MINUS) {
        return isIdRunCharacter(character.codePoint)
      }
      const following = this.reader.after(character)
      return (
        following !== null &&
        !isOneOf(following, [GREATER_THAN_SIGN, HYPHEN_MINUS, FULL_STOP])
      )
    })
    if (samePosition(end, at)) return false
    this.read("id-run", at, end)
    return true
  }

  /** Statement context, rule 22: `-` is a `-` unit. */
  protected readMinus(at: DiagramCharacter): boolean {
    if (at.codePoint !== HYPHEN_MINUS) return false
    this.read("-", at, this.reader.after(at))
    return true
  }

  /** Statement context, rule 23: a Unicode letter is a `letter` unit of one character. */
  protected readLetter(at: DiagramCharacter): boolean {
    if (!isUnicodeLetter(at.codePoint)) return false
    this.read("letter", at, this.reader.after(at))
    return true
  }

  /** Statement context, rule 24: `|`, `(`, `[`, or `{` is a unit named by its text and enters the label context. */
  protected readLabelOpener(at: DiagramCharacter): boolean {
    for (const opener of ["|", "(", "[", "{"] as const) {
      const match = this.word(at, opener)
      if (match !== null) {
        const unit = this.read(opener, at, match.end)
        this.enter("label", significantRangeOf(unit))
        return true
      }
    }
    return false
  }

  /**
   * diagrams/flowchart.md and diagrams/agentflow.md, Strings: a string starts at a `"` and is read in
   * the string context, or in the markdown string context when a backtick
   * follows the `"`. These contexts may enter further string contexts, and
   * the string ends when the lexer leaves the context that its opening `"`
   * entered. The whole string is one unit: an `empty-string` unit without
   * content, a `string` or `markdown-string` unit whose text is its one run
   * of content, and rejected with two or more runs.
   */
  protected readString(at: DiagramCharacter): boolean {
    if (at.codePoint !== QUOTATION_MARK) return false
    /** The string contexts entered and not left yet; the last one is the current one. */
    const stringContexts: ("string" | "markdown-string")[] = []
    const runs: {
      readonly name: GraphName<ExtraName>
      readonly text: string
      readonly range: Range
    }[] = []
    let position = this.enterStringContext(at, stringContexts)
    const emptyStringKind =
      stringContexts[0] === "markdown-string"
        ? "empty-markdown-string"
        : "empty-string"
    while (stringContexts.length > 0) {
      if (position === null) throw this.noRuleMatches(at)
      const current = stringContexts[stringContexts.length - 1]
      if (current === "string") {
        if (position.codePoint === QUOTATION_MARK) {
          const following = this.reader.after(position)
          if (isCodePointAt(following, GRAVE_ACCENT)) {
            // String context, rule 1.
            position = this.enterStringContext(position, stringContexts)
          } else {
            // String context, rule 2.
            stringContexts.pop()
            position = following
          }
        } else {
          // String context, rule 3.
          const end = skipWhile(
            this.reader,
            position,
            (character) => character.codePoint !== QUOTATION_MARK,
          )
          runs.push({
            name: "string",
            text: this.textBetween(position, end),
            range: this.rangeBetween(position, end),
          })
          position = end
        }
      } else if (position.codePoint === GRAVE_ACCENT) {
        // Markdown string context, rule 2; a backtick that `"` does not
        // follow matches no rule.
        const following = this.reader.after(position)
        if (!isCodePointAt(following, QUOTATION_MARK)) {
          throw this.noRuleMatches(position)
        }
        stringContexts.pop()
        position = this.reader.after(following)
      } else if (position.codePoint === QUOTATION_MARK) {
        // Markdown string context, rules 3 and 4.
        position = this.enterStringContext(position, stringContexts)
      } else {
        // Markdown string context, rule 1.
        const end = skipWhile(
          this.reader,
          position,
          (character) =>
            character.codePoint !== GRAVE_ACCENT &&
            character.codePoint !== QUOTATION_MARK,
        )
        runs.push({
          name: "markdown-string",
          text: this.textBetween(position, end),
          range: this.rangeBetween(position, end),
        })
        position = end
      }
    }
    if (runs.length > 1) throw this.noRuleMatches(at)
    if (runs.length === 0) {
      this.addUnitWithText(
        "empty-string",
        at,
        position,
        "",
        null,
        "trim-whitespace",
        emptyStringKind,
      )
    } else {
      const [run] = runs
      this.addUnitWithText(run.name, at, position, run.text, run.range)
    }
    this.position = position
    return true
  }

  /**
   * Strings: enters the string context that the `"` at `quote` opens: the
   * markdown string context when a backtick follows it, and the string
   * context otherwise. Returns the place after the `"`, and after the
   * backtick.
   */
  protected enterStringContext(
    quote: DiagramCharacter,
    stringContexts: ("string" | "markdown-string")[],
  ): DiagramPosition {
    const following = this.reader.after(quote)
    if (isCodePointAt(following, GRAVE_ACCENT)) {
      stringContexts.push("markdown-string")
      return this.reader.after(following)
    }
    stringContexts.push("string")
    return following
  }

  /** Where the characters from `from` up to, and not including, `to` lie in the source. */
  protected rangeBetween(from: DiagramCharacter, to: DiagramPosition): Range {
    let end = from.start
    for (
      let position: DiagramPosition = from;
      position !== null && !samePosition(position, to);
      position = this.reader.after(position)
    ) {
      end = position.end
    }
    return [from.start, end]
  }

  /** The characters from `from` up to, and not including, `to`, in converted form. */
  protected textBetween(from: DiagramCharacter, to: DiagramPosition): string {
    let text = ""
    for (
      let position: DiagramPosition = from;
      position !== null && !samePosition(position, to);
      position = this.reader.after(position)
    ) {
      text += String.fromCodePoint(position.codePoint)
    }
    return text
  }

  /**
   * diagrams/flowchart.md and diagrams/agentflow.md, The header context: whitespace that contains a
   * line feed, up to and including its last line feed, is a `no-direction`
   * unit; zero or more whitespace and a direction is a `header-direction`
   * unit of the direction. Both leave the context. A `"` is a string, after
   * which the lexer is back in the header context.
   */
  protected readInHeaderContext(at: DiagramCharacter): void {
    // Rule 3; rules 1 and 2 start with whitespace or a direction, never
    // with `"`.
    if (this.readString(at)) return
    let lastLineFeed: DiagramCharacter | null = null
    let direction: DiagramPosition = at
    while (isWhitespaceAt(direction)) {
      if (direction.codePoint === LINE_FEED) lastLineFeed = direction
      direction = this.reader.after(direction)
    }
    if (lastLineFeed !== null) {
      const afterLastLineFeed = this.reader.after(lastLineFeed)
      this.read("no-direction", at, afterLastLineFeed)
      this.leave()
      return
    }
    if (direction === null) throw this.noRuleMatches(at)
    for (const word of HEADER_DIRECTION_WORDS) {
      const match = this.wholeWord(direction, word)
      if (match !== null) {
        this.read("header-direction", direction, match.end)
        this.leave()
        return
      }
    }
    if (
      isOneOf(direction, [LESS_THAN_SIGN, GREATER_THAN_SIGN, CIRCUMFLEX_ACCENT])
    ) {
      this.read("header-direction", direction, this.reader.after(direction))
      this.leave()
      return
    }
    throw this.noRuleMatches(direction)
  }

  /**
   * diagrams/flowchart.md and diagrams/agentflow.md, Accessibility values: in the title context and
   * in the description context, a line feed leaves the context without
   * being read, and one or more other characters are a unit named `name`.
   */
  protected readRestOfLine(
    at: DiagramCharacter,
    name: "title-text" | "description-text",
  ): void {
    if (at.codePoint === LINE_FEED) {
      this.leave()
      return
    }
    const end = skipWhile(
      this.reader,
      at,
      (character) => character.codePoint !== LINE_FEED,
    )
    this.read(name, at, end)
  }

  /**
   * diagrams/flowchart.md and diagrams/agentflow.md, Data blocks, the data context: `"` is a
   * `data-quote` unit and enters the data string context; one or more
   * characters other than `}`, `^`, and `"` are a `data-text` unit, whose
   * token keeps the whitespace at its ends, which the value of the data
   * block holds (ast.md, Nodes); `}` is a `}` unit and leaves the context.
   */
  protected readInDataContext(at: DiagramCharacter): void {
    if (at.codePoint === QUOTATION_MARK) {
      const quote = this.read("data-quote", at, this.reader.after(at))
      this.enter("data-string", significantRangeOf(quote))
      return
    }
    if (at.codePoint === RIGHT_CURLY_BRACKET) {
      this.read("}", at, this.reader.after(at))
      this.leave()
      return
    }
    const end = skipWhile(
      this.reader,
      at,
      (character) =>
        !isOneOf(character, [
          RIGHT_CURLY_BRACKET,
          CIRCUMFLEX_ACCENT,
          QUOTATION_MARK,
        ]),
    )
    if (samePosition(end, at)) throw this.noRuleMatches(at)
    this.read("data-text", at, end, "keep-whitespace")
  }

  /**
   * Data blocks, the data string context: `"` is a `data-quote` unit and
   * leaves the context, and one or more other characters are a `data-text`
   * unit.
   */
  protected readInDataStringContext(at: DiagramCharacter): void {
    if (at.codePoint === QUOTATION_MARK) {
      this.read("data-quote", at, this.reader.after(at))
      this.leave()
      return
    }
    const end = skipWhile(
      this.reader,
      at,
      (character) => character.codePoint !== QUOTATION_MARK,
    )
    this.read("data-text", at, end, "keep-whitespace")
  }

  /**
   * diagrams/flowchart.md and diagrams/agentflow.md, Click and callbacks, the click context: `"` is
   * a string, after which the lexer is back in the click context; one
   * whitespace character leaves the context; one or more characters other
   * than whitespace are read at once: each `,` among them is a
   * `click-comma` unit, and each run of the other characters is a
   * `click-id` unit. So the string rule applies only at the start of the
   * context and right after a string, and a `"` after a `,` or inside an id
   * belongs to the id.
   */
  protected readInClickContext(at: DiagramCharacter): void {
    if (this.readString(at)) return
    if (isWhitespace(at.codePoint)) {
      this.clickContextExits.push([at.start, at.end])
      this.position = this.reader.after(at)
      this.leave()
      return
    }
    const end = skipWhile(
      this.reader,
      at,
      (character) => !isWhitespace(character.codePoint),
    )
    let position: DiagramPosition = at
    while (position !== null && !samePosition(position, end)) {
      if (position.codePoint === COMMA) {
        const afterComma = this.reader.after(position)
        this.addUnit("click-comma", position, afterComma)
        position = afterComma
      } else {
        const runEnd = skipWhile(
          this.reader,
          position,
          (character) =>
            character.codePoint !== COMMA && !isWhitespace(character.codePoint),
        )
        this.addUnit("click-id", position, runEnd)
        position = runEnd
      }
    }
    this.position = end
  }

  /**
   * Click and callbacks, the callback name context: `(`, whitespace, and
   * `)` are a `(` unit and a `)` unit and leave the context; `(` alone is a
   * `(` unit, leaves the context, and enters the callback arguments
   * context; one or more characters other than `(` are a `callback-name`
   * unit, whose whitespace before the `(` mermaid.js reads as part of the
   * name.
   */
  protected readInCallbackNameContext(at: DiagramCharacter): void {
    if (at.codePoint !== LEFT_PARENTHESIS) {
      const end = skipWhile(
        this.reader,
        at,
        (character) => character.codePoint !== LEFT_PARENTHESIS,
      )
      this.read("callback-name", at, end, "keep-whitespace")
      return
    }
    const opening = this.addUnit("(", at, this.reader.after(at))
    this.leave()
    const closing = this.afterWhitespace(this.reader.after(at))
    if (isCodePointAt(closing, RIGHT_PARENTHESIS)) {
      this.read(")", closing, this.reader.after(closing))
      return
    }
    this.position = this.reader.after(at)
    this.enter("callback-arguments", significantRangeOf(opening))
  }

  /**
   * Click and callbacks, the callback arguments context: `)` is a `)` unit
   * and leaves the context, and one or more other characters are a
   * `callback-arguments` unit, whose whitespace at its ends mermaid.js
   * passes on as part of the arguments.
   */
  protected readInCallbackArgumentsContext(at: DiagramCharacter): void {
    if (at.codePoint === RIGHT_PARENTHESIS) {
      this.read(")", at, this.reader.after(at))
      this.leave()
      return
    }
    const end = skipWhile(
      this.reader,
      at,
      (character) => character.codePoint !== RIGHT_PARENTHESIS,
    )
    this.read("callback-arguments", at, end, "keep-whitespace")
  }

  /**
   * The ellipse and link text contexts: the run of whitespace from `at`,
   * line feeds included, each character a unit named `name` of its own;
   * reads on after the run.
   */
  protected readEachWhitespaceCharacter(
    at: DiagramCharacter,
    name: "text-run" | "link-text-char",
  ): void {
    let position: DiagramPosition = at
    while (position !== null && isWhitespace(position.codePoint)) {
      const after = this.reader.after(position)
      this.addUnit(name, position, after)
      position = after
    }
    this.position = position
  }

  /**
   * common.md, Entities: where a rule that reads one character at a time
   * ends its unit at `at`. That is after the one character, except at the
   * start of the placeholder of an entity: the placeholder stands for the
   * entity's source characters as a whole, so the rule reads all of it as
   * one unit, which holds the whole entity.
   */
  protected afterOneCharacter(at: DiagramCharacter): DiagramPosition {
    const { placeholderEnd } = at
    let end = this.reader.after(at)
    if (placeholderEnd === null) return end
    while (end !== null && end.start < placeholderEnd) {
      end = this.reader.after(end)
    }
    return end
  }
}
