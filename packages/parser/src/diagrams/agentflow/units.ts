import { GraphUnitLexer, isOneOf } from "../../graph-unit-lexer.ts"
import type { Range } from "../../ast.ts"
import { isWhitespace } from "../../character-classes.ts"
import {
  CHARACTER_TABULATION,
  SPACE,
  EQUALS_SIGN,
  HYPHEN_MINUS,
  LEFT_CURLY_BRACKET,
  LEFT_PARENTHESIS,
  LEFT_SQUARE_BRACKET,
  LINE_FEED,
  PERCENT_SIGN,
  QUESTION_MARK,
  QUOTATION_MARK,
  REVERSE_SOLIDUS,
  RIGHT_CURLY_BRACKET,
  RIGHT_PARENTHESIS,
  RIGHT_SQUARE_BRACKET,
  SOLIDUS,
  VERTICAL_LINE,
} from "../../code-points.ts"
import type { DiagramComment } from "../../diagram-parsing.ts"
import { lineFeedAfter } from "../../diagram-text.ts"

import type { LineIndex } from "../../positions.ts"
import type {
  ArrowMatch,
  ClosedArrowParts,
  OpeningArrowParts,
} from "./arrows.ts"
import { matchArrow, matchClosedArrow } from "./arrows.ts"
import type {
  DiagramCharacter,
  DiagramPosition,
  DiagramText,
} from "../../diagram-text.ts"

import {
  isCodePointAt,
  isWhitespaceAt,
  samePosition,
  skipWhile,
} from "../../scanning.ts"

import type { DiagramUnit } from "../../diagram-units.ts"
import { significantRangeOf } from "../../diagram-units.ts"

/**
 * diagrams/agentflow.md, Lexical structure: the names of the units. A unit
 * that the specification names by its text has that text as its name.
 */
export type UnitName =
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
  | "flow"
  | "connector"
  | "global"
  | "comment"
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

/**
 * diagrams/agentflow.md, Lexical structure: what the lexer reads from the
 * diagram text: its units; the whitespace characters with which it left a
 * click context, which belong to no unit and which the name text of a
 * Name fragments leave out (Names, strings, and click text), and its comments.
 */
export interface AgentflowLexing {
  readonly units: readonly Unit[]
  readonly clickContextExits: readonly Range[]
  readonly comments: readonly DiagramComment[]
}

/**
 * diagrams/agentflow.md, Units and contexts: one unit of the diagram text.
 * The text of a string unit is the content between its quotes.
 */
export interface Unit extends DiagramUnit<UnitName> {
  /**
   * Strings: for a `string` or `markdown-string` unit, where its content,
   * its one run, lies in the source; null for every other unit.
   */
  readonly content: Range | null
  /** Strings: the recognized empty form; null for other units. */
  readonly emptyStringKind: "empty-string" | "empty-markdown-string" | null
  /**
   * Arrows: for an `arrow` or `opening-arrow` unit, the parts of the arrow
   * that its node holds; null for every other unit.
   */
  readonly arrow: ClosedArrowParts | OpeningArrowParts | null
}

/** diagrams/agentflow.md, Units and contexts: the contexts of the lexer. */
type Context =
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

/**
 * Click and callbacks: for each context, null when the text may end in it;
 * otherwise the message of the error when the text ends in it, which says
 * what is not closed. The text may not end in a callback context; the
 * error is at the unit that entered it, the `call` for the callback name
 * context and the `(` that opens the arguments for the callback arguments
 * context.
 */
const END_OF_TEXT_MESSAGES: Readonly<Record<Context, string | null>> = {
  statement: null,
  header: null,
  title: null,
  description: null,
  "description-block": null,
  data: null,
  "data-string": null,
  click: null,
  "callback-name":
    "The callback after call has no ( before the end of the text",
  "callback-arguments":
    "The arguments of the callback have no ) before the end of the text",
  label: null,
  slanted: null,
  ellipse: null,
  "dash-link-text": null,
}

/** The header keywords of the statement context, rule 10, in the order in which they are tried. */
const HEADER_KEYWORDS = ["agentflow-beta"] as const

/** The units that close a label, label context rule 4, in the order in which they are tried. */
const LABEL_CLOSERS = ["])", "]]", ")]", ")))", "|", ")", "]", "}"] as const

/**
 * diagrams/agentflow.md, Lexical structure: the lexer that divides the
 * diagram text into units. It keeps a stack of contexts and, at each place,
 * applies the first rule of the current context that matches. The rules are
 * those of the specification, in its order; each method that reads a context
 * names the section it follows.
 *
 * The lexer does not depend on the grammar: a rule alone decides which
 * context is entered or left.
 */
export class AgentflowUnitLexer extends GraphUnitLexer<
  never,
  "flow" | "connector" | "global" | "comment",
  ClosedArrowParts | OpeningArrowParts
> {
  private readonly comments: DiagramComment[] = []

  protected override readonly headerKeywords: readonly string[] =
    HEADER_KEYWORDS

  private readonly headerStart: number

  public constructor(
    reader: DiagramText,
    lines: LineIndex,
    headerStart: number,
  ) {
    super(reader, lines, "statement", END_OF_TEXT_MESSAGES)
    this.headerStart = headerStart
  }

  /** Divides the diagram text into units. Throws `ParseError` where no rule matches. */
  public lex(): AgentflowLexing {
    this.readToEnd()
    this.checkEndOfText()
    return {
      units: this.units,
      clickContextExits: this.clickContextExits,
      comments: this.comments,
    }
  }

  /** Applies the first rule of `context` that matches at `at`. */
  protected override readInContext(
    at: DiagramCharacter,
    context: Context,
  ): void {
    switch (context) {
      case "statement":
        this.readInStatementContext(at)
        return
      case "header":
        this.readInHeaderContext(at)
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
      case "data":
        this.readInDataContext(at)
        return
      case "data-string":
        this.readInDataStringContext(at)
        return
      case "click":
        this.readInClickContext(at)
        return
      case "callback-name":
        this.readInCallbackNameContext(at)
        return
      case "callback-arguments":
        this.readInCallbackArgumentsContext(at)
        return
      case "label":
        this.readInLabelContext(at)
        return
      case "slanted":
        this.readInSlantedContext(at)
        return
      case "ellipse":
        this.readInEllipseContext(at)
        return
      case "dash-link-text":
        this.readInLinkTextContext(at)
        return
      default:
        throw new Error(
          `mmd-toolkit parser bug: unknown context ${JSON.stringify(context satisfies never)}`,
        )
    }
  }

  /**
   * diagrams/agentflow.md, The statement context: applies the first of the
   * ordered statement rules that matches at `at`.
   * Whitespace lookahead for arrows is read once per run (see
   * {@link AgentflowUnitLexer.readWhitespaceRun}).
   */
  private readInStatementContext(at: DiagramCharacter): void {
    if (at.start < this.headerStart && this.readComment(at, true, true)) return
    if (this.readRulesBeforeArrow(at)) return
    // Rules 25 and 26 read runs of line feeds and individual other
    // whitespace characters, and the lookahead
    // of rule 18 for an arrow walks the whole rest of the run. Tried at the
    // start of every unit, as the order of the rules has it, that lookahead
    // walks the run again for each unit, so lines of a space and a line feed
    // take time in the square of their number; read together, the lookahead
    // is made once for the run.
    if (isWhitespace(at.codePoint)) {
      this.readWhitespaceRun(at)
      return
    }
    const applied =
      this.readArrow(at) ||
      this.readShapeOpener(at) ||
      this.readLetterV(at) ||
      this.readComment(at, true) ||
      this.readIdRun(at) ||
      this.readMinus(at) ||
      this.readLetter(at) ||
      this.readLabelOpener(at)
    if (!applied) throw this.noRuleMatches(at)
  }

  /** The statement context, rules 1 to 17, in order: the first that matches at `at`; false when none does. */
  private readRulesBeforeArrow(at: DiagramCharacter): boolean {
    return (
      this.readAccessibilityMarker(at) ||
      this.readDataStart(at) ||
      this.readCallKeyword(at) ||
      this.readString(at) ||
      this.readStatementKeyword(at) ||
      this.readHrefKeyword(at) ||
      this.readClickKeyword(at) ||
      this.readHeaderKeyword(at) ||
      this.readContainerKeyword(at) ||
      this.readEndKeyword(at) ||
      this.readLinkTarget(at) ||
      this.readDirectionLine(at) ||
      this.readEdgeId(at) ||
      this.readNumber(at) ||
      this.readStatementPunctuation(at)
    )
  }

  /** Shared keyword position: bounded flow, connector, and global; global takes ASCII padding. */
  private readContainerKeyword(at: DiagramCharacter): boolean {
    for (const word of ["flow", "connector", "global"] as const) {
      const match = this.wholeWord(at, word)
      if (match === null) continue
      this.read(
        word,
        at,
        word === "global"
          ? skipWhile(this.reader, match.end, isAsciiPadding)
          : match.end,
      )
      return true
    }
    return false
  }

  /**
   * Statement context, rule 12: `end` that no word character follows, and
   * ASCII spaces and tabs after it, as one `end` unit; LF is not taken.
   */
  private readEndKeyword(at: DiagramCharacter): boolean {
    const match = this.wholeWord(at, "end")
    if (match === null) return false
    const end = skipWhile(this.reader, match.end, isAsciiPadding)
    this.read("end", at, end)
    return true
  }

  /**
   * Statement context, rule 18, at a character `at` that is not
   * whitespace: the arrow itself at `at` (see
   * {@link AgentflowUnitLexer.readArrowFrom}). The whitespace before an
   * arrow is read by {@link AgentflowUnitLexer.readWhitespaceRun}.
   */
  private readArrow(at: DiagramCharacter): boolean {
    const arrow = matchArrow(this.reader, at)
    if (arrow === null) return false
    this.readArrowFrom(at, arrow)
    return true
  }

  /**
   * Statement context, rule 18, and Arrows: from `start`, zero or more
   * whitespace, the arrow `arrow`, and zero or more whitespace, as one unit.
   * A closed arrow is an `arrow` unit; an opening arrow is an
   * `opening-arrow` unit and enters the link text context of its kind.
   */
  private readArrowFrom(start: DiagramCharacter, arrow: ArrowMatch): void {
    const end = this.afterWhitespace(arrow.end)
    const unit = this.addArrowUnit(start, end, arrow.parts)
    this.position = end
    if (arrow.parts.form === "opening") {
      this.enter("dash-link-text", significantRangeOf(unit))
    }
  }

  /**
   * Statement context, rules 18, 25, and 26, at a whitespace character
   * `at`, where rules 1 to 17 match nothing and rules 19 to 24 match no
   * whitespace. Where an arrow follows the whitespace run from `at`, line
   * feeds included, rule 18 reads the run, the arrow, and the whitespace
   * after it as one unit. Otherwise the run is the units of rules 25 and
   * 26 in order, a `newline` unit for each maximal run of line feeds and a
   * `space` unit for each other whitespace character. Every place of
   * the run is followed by the same end of the run, where no arrow is, so
   * rule 18 is not tried again at the start of the next unit. Rules 1 to 17
   * are tried at the start of each unit of the run except the later `space`
   * units of a run of ASCII spaces and tabs: of them only rule 14, the
   * direction line, can start at whitespace, and it looks at the rest of the
   * line, so what it does not find at the start of such a run it does not
   * find at a later place of the same line.
   */
  private readWhitespaceRun(at: DiagramCharacter): void {
    const arrow = matchArrow(this.reader, this.afterWhitespace(at))
    if (arrow !== null) {
      this.readArrowFrom(at, arrow)
      return
    }
    let start: DiagramCharacter = at
    for (;;) {
      if (this.readComment(start, true)) return
      const lineFeeds = start.codePoint === LINE_FEED
      const end = lineFeeds
        ? skipWhile(
            this.reader,
            start,
            (character) => character.codePoint === LINE_FEED,
          )
        : skipWhile(this.reader, start, isAsciiPadding)
      if (lineFeeds) {
        this.read("newline", start, end)
      } else {
        // The failed comment lookahead covers this ASCII padding run. Keep
        // each space unit while walking once instead of searching the same
        // suffix again.
        const after = samePosition(start, end) ? this.reader.after(start) : end
        let space: DiagramPosition = start
        while (space !== null && !samePosition(space, after)) {
          const next = this.reader.after(space)
          this.addUnit("space", space, next)
          space = next
        }
        this.position = after
      }
      const next = this.position
      if (!isWhitespaceAt(next) || this.readRulesBeforeArrow(next)) return
      start = next
    }
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
    const end = skipWhile(
      this.reader,
      at,
      (character) => character.codePoint !== RIGHT_CURLY_BRACKET,
    )
    this.read(
      "description-block-text",
      at,
      end,
      end === null ? "keep-whitespace" : "trim-whitespace",
    )
  }

  /**
   * The label context: a string;
   * `(-`, `([`, or `(((`, rejected; a unit that closes a
   * label, which leaves the context; `(` or `{`, which enters the label
   * context; one or more characters other than `[`, `]`, `(`, `)`, `{`,
   * `}`, `|`, `"`, and `%`, a `text-run` unit. Before text, %% not followed
   * by { is a diagram comment; a lone percent matches no rule.
   */
  private readInLabelContext(at: DiagramCharacter): void {
    if (this.readString(at)) return
    for (const rejected of ["(-", "([", "((("]) {
      if (this.word(at, rejected) !== null) throw this.noRuleMatches(at)
    }
    for (const closer of LABEL_CLOSERS) {
      const match = this.word(at, closer)
      if (match !== null) {
        this.read(closer, at, match.end)
        this.leave()
        return
      }
    }
    for (const opener of ["(", "{"] as const) {
      const match = this.word(at, opener)
      if (match !== null) {
        const unit = this.read(opener, at, match.end)
        this.enter("label", significantRangeOf(unit))
        return
      }
    }
    if (this.readComment(at, false)) return
    const end = skipWhile(
      this.reader,
      at,
      (character) =>
        !isOneOf(character, [
          PERCENT_SIGN,
          LEFT_SQUARE_BRACKET,
          RIGHT_SQUARE_BRACKET,
          LEFT_PARENTHESIS,
          RIGHT_PARENTHESIS,
          LEFT_CURLY_BRACKET,
          RIGHT_CURLY_BRACKET,
          VERTICAL_LINE,
          QUOTATION_MARK,
        ]),
    )
    if (samePosition(end, at)) throw this.noRuleMatches(at)
    this.read("text-run", at, end)
  }

  /**
   * The slanted context, with comments before closers: a string;
   * one of `\`, `(`, `?`, `=`, `]`, `)` followed by `]`, a
   * `backslash-end` unit, which leaves the context; `/]`, a `slash-end`
   * unit, which leaves the context; `/` or `\` not followed by `]`, or one
   * or more characters other than `\`, `[`, `]`, `(`, `)`, `{`, `}`, and
   * `/` and `%`, a `text-run` unit. A lone percent matches no rule.
   */
  private readInSlantedContext(at: DiagramCharacter): void {
    if (this.readString(at) || this.readComment(at, false)) return
    const following = this.reader.after(at)
    const closesWithBracket = isCodePointAt(following, RIGHT_SQUARE_BRACKET)
    if (
      closesWithBracket &&
      isOneOf(at, [
        REVERSE_SOLIDUS,
        LEFT_PARENTHESIS,
        QUESTION_MARK,
        EQUALS_SIGN,
        RIGHT_SQUARE_BRACKET,
        RIGHT_PARENTHESIS,
      ])
    ) {
      this.read("backslash-end", at, this.reader.after(following))
      this.leave()
      return
    }
    if (closesWithBracket && at.codePoint === SOLIDUS) {
      this.read("slash-end", at, this.reader.after(following))
      this.leave()
      return
    }
    if (isOneOf(at, [SOLIDUS, REVERSE_SOLIDUS])) {
      this.read("text-run", at, following)
      return
    }
    const end = skipWhile(
      this.reader,
      at,
      (character) =>
        !isOneOf(character, [
          PERCENT_SIGN,
          REVERSE_SOLIDUS,
          LEFT_SQUARE_BRACKET,
          RIGHT_SQUARE_BRACKET,
          LEFT_PARENTHESIS,
          RIGHT_PARENTHESIS,
          LEFT_CURLY_BRACKET,
          RIGHT_CURLY_BRACKET,
          SOLIDUS,
        ]),
    )
    if (samePosition(end, at)) throw this.noRuleMatches(at)
    this.read("text-run", at, end)
  }

  /**
   * Shared ellipse context with agentflow comments before closers: a string;
   * `-`, `/`, or `)` followed by `)`, an `ellipse-end`
   * unit, which leaves the context; one character other than `(`, `)`,
   * `[`, `]`, `{`, and `}`, a `text-run` unit of that one character, or of
   * the whole placeholder of an entity.
   */
  private readInEllipseContext(at: DiagramCharacter): void {
    if (this.readString(at) || this.readComment(at, false)) return
    if (isWhitespace(at.codePoint)) {
      // Ellipse whitespace is content, one text-run per character. It must
      // stay outside a following comment, which starts only at its %% mark.
      this.readEachWhitespaceCharacter(at, "text-run")
      return
    }
    const following = this.reader.after(at)
    if (
      isOneOf(at, [HYPHEN_MINUS, SOLIDUS, RIGHT_PARENTHESIS]) &&
      isCodePointAt(following, RIGHT_PARENTHESIS)
    ) {
      this.read("ellipse-end", at, this.reader.after(following))
      this.leave()
      return
    }
    if (
      isOneOf(at, [
        LEFT_PARENTHESIS,
        RIGHT_PARENTHESIS,
        LEFT_SQUARE_BRACKET,
        RIGHT_SQUARE_BRACKET,
        LEFT_CURLY_BRACKET,
        RIGHT_CURLY_BRACKET,
      ])
    ) {
      throw this.noRuleMatches(at)
    }
    const end = this.afterOneCharacter(at)
    this.read("text-run", at, end)
  }

  /**
   * Arrows: the one solid link-text context. A string; a closed solid arrow
   * with its whitespace, which leaves the context; one character other than
   * a dash, or a dash that another dash does not follow, a
   * `link-text-char` unit, which is the whole placeholder of an entity.
   */
  private readInLinkTextContext(at: DiagramCharacter): void {
    if (this.readString(at)) return
    const arrow = matchClosedArrow(this.reader, this.afterWhitespace(at))
    if (arrow !== null) {
      const end = this.afterWhitespace(arrow.end)
      this.addArrowUnit(at, end, arrow.parts)
      this.position = end
      this.leave()
      return
    }
    if (isWhitespace(at.codePoint)) {
      // Every character of a run of whitespace reaches the same place after
      // the run, where no closed arrow starts, so none of them starts one,
      // and whitespace is not the kind's character: each is a
      // `link-text-char` unit. Read together, the run is walked once, not
      // again from each of its characters, which would take time in the
      // square of its length.
      this.readEachWhitespaceCharacter(at, "link-text-char")
      return
    }
    const following = this.reader.after(at)
    if (at.codePoint === HYPHEN_MINUS) {
      const isLoneDash = !isCodePointAt(following, HYPHEN_MINUS)
      if (!isLoneDash) throw this.noRuleMatches(at)
    }
    const end = this.afterOneCharacter(at)
    this.read("link-text-char", at, end)
  }

  /** Preserved comments: %% not followed by {, through the character before LF. */
  private readComment(
    at: DiagramCharacter,
    statement: boolean,
    beforeHeader = false,
  ): boolean {
    const mark = statement ? skipWhile(this.reader, at, isAsciiPadding) : at
    if (!isCodePointAt(mark, PERCENT_SIGN)) return false
    const second = this.reader.after(mark)
    if (!isCodePointAt(second, PERCENT_SIGN)) return false
    if (
      !beforeHeader &&
      isCodePointAt(this.reader.after(second), LEFT_CURLY_BRACKET)
    )
      return false
    const end = lineFeedAfter(this.reader, second)
    this.comments.push({
      range: [mark.start, end.start],
      mark: "%%",
      valueStart: second.end,
    })
    if (statement) this.addUnit("comment", at, end)
    this.position = end
    return true
  }
}

/** Agentflow end/global padding and statement-comment indentation use ASCII space and tab only. */
function isAsciiPadding(character: DiagramCharacter): boolean {
  return (
    character.codePoint === SPACE ||
    character.codePoint === CHARACTER_TABULATION
  )
}
