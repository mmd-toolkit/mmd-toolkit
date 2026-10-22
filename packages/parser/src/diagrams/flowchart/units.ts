import { GraphUnitLexer, isOneOf } from "../../graph-unit-lexer.ts"
import type { Range } from "../../ast.ts"
import { isWhitespace } from "../../character-classes.ts"
import {
  EQUALS_SIGN,
  FULL_STOP,
  HYPHEN_MINUS,
  LEFT_CURLY_BRACKET,
  LEFT_PARENTHESIS,
  LEFT_SQUARE_BRACKET,
  LINE_FEED,
  QUESTION_MARK,
  QUOTATION_MARK,
  REVERSE_SOLIDUS,
  RIGHT_CURLY_BRACKET,
  RIGHT_PARENTHESIS,
  RIGHT_SQUARE_BRACKET,
  SOLIDUS,
  TILDE,
  VERTICAL_LINE,
} from "../../code-points.ts"

import type { LineIndex } from "../../positions.ts"
import type {
  ArrowMatch,
  ClosedArrowParts,
  LinkTextKind,
  OpeningArrowParts,
} from "./arrows.ts"
import { matchArrow, matchClosedArrow } from "./arrows.ts"
import type { DiagramCharacter, DiagramText } from "../../diagram-text.ts"

import {
  isCodePointAt,
  isWhitespaceAt,
  samePosition,
  skipWhile,
} from "../../scanning.ts"

import type { DiagramUnit } from "../../diagram-units.ts"
import { significantRangeOf } from "../../diagram-units.ts"

/**
 * diagrams/flowchart.md, Lexical structure: the names of the units. A unit
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
  | "subgraph"
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
 * diagrams/flowchart.md, Lexical structure: what the lexer reads from the
 * diagram text: its units; the whitespace characters with which it left a
 * click context, which belong to no unit and which the name text of a
 * subgraph leaves out (Rejections outside the grammar, Subgraph members), as
 * the Db does of a style.
 */
export interface FlowchartLexing {
  readonly units: readonly Unit[]
  readonly clickContextExits: readonly Range[]
}

/**
 * diagrams/flowchart.md, Units and contexts: one unit of the diagram text.
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

/** diagrams/flowchart.md, Units and contexts: the contexts of the lexer. */
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
  | "thick-link-text"
  | "dotted-link-text"

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
  "thick-link-text": null,
  "dotted-link-text": null,
}

/** The header keywords of the statement context, rule 10, in the order in which they are tried. */
const HEADER_KEYWORDS = [
  "flowchart-elk",
  "swimlane-beta",
  "graph",
  "flowchart",
] as const

/** The units that close a label, label context rule 4, in the order in which they are tried. */
const LABEL_CLOSERS = ["])", "]]", ")]", ")))", "|", ")", "]", "}"] as const

/** The context of the text of a link with an opening arrow of each kind. */
const LINK_TEXT_CONTEXTS: Readonly<Record<LinkTextKind, Context>> = {
  dash: "dash-link-text",
  thick: "thick-link-text",
  dotted: "dotted-link-text",
}

/** The character that the text of a link of each kind cannot contain. */
const LINK_TEXT_FORBIDDEN: Readonly<Record<LinkTextKind, number>> = {
  dash: HYPHEN_MINUS,
  thick: EQUALS_SIGN,
  dotted: FULL_STOP,
}

/**
 * diagrams/flowchart.md, Lexical structure: the lexer that divides the
 * diagram text into units. It keeps a stack of contexts and, at each place,
 * applies the first rule of the current context that matches. The rules are
 * those of the specification, in its order; each method that reads a context
 * names the section it follows.
 *
 * The lexer does not depend on the grammar: a rule alone decides which
 * context is entered or left.
 */
export class FlowchartUnitLexer extends GraphUnitLexer<
  "thick-link-text" | "dotted-link-text",
  "subgraph",
  ClosedArrowParts | OpeningArrowParts
> {
  protected override readonly headerKeywords: readonly string[] =
    HEADER_KEYWORDS

  public constructor(reader: DiagramText, lines: LineIndex) {
    super(reader, lines, "statement", END_OF_TEXT_MESSAGES)
  }

  /** Divides the diagram text into units. Throws `ParseError` where no rule matches. */
  public lex(): FlowchartLexing {
    this.readToEnd()
    this.checkEndOfText()
    return {
      units: this.units,
      clickContextExits: this.clickContextExits,
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
        this.readInLinkTextContext(at, "dash")
        return
      case "thick-link-text":
        this.readInLinkTextContext(at, "thick")
        return
      case "dotted-link-text":
        this.readInLinkTextContext(at, "dotted")
        return
      default:
        throw new Error(
          `mmd-toolkit parser bug: unknown context ${JSON.stringify(context satisfies never)}`,
        )
    }
  }

  /**
   * diagrams/flowchart.md, The statement context: applies the first of the
   * 26 rules that matches at `at`. At whitespace, where of rules 18 to 26
   * only rule 18, with the whitespace before an arrow, and rules 25 and 26
   * match, the three are read together over the whitespace run (see
   * {@link FlowchartUnitLexer.readWhitespaceRun}).
   */
  private readInStatementContext(at: DiagramCharacter): void {
    if (this.readRulesBeforeArrow(at)) return
    // Rules 25 and 26 cut a whitespace run into units, one for each run of
    // line feeds and one for each run of other whitespace, and the lookahead
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
      this.readSubgraphKeyword(at) ||
      this.readEndKeyword(at) ||
      this.readLinkTarget(at) ||
      this.readDirectionLine(at) ||
      this.readEdgeId(at) ||
      this.readNumber(at) ||
      this.readStatementPunctuation(at)
    )
  }

  /** Statement context, rule 11: `subgraph` that no word character follows. */
  private readSubgraphKeyword(at: DiagramCharacter): boolean {
    const match = this.wholeWord(at, "subgraph")
    if (match === null) return false
    this.read("subgraph", at, match.end)
    return true
  }

  /**
   * Statement context, rule 12: `end` that no word character follows, and
   * all whitespace after it, line feeds included, as one `end` unit.
   */
  private readEndKeyword(at: DiagramCharacter): boolean {
    const match = this.wholeWord(at, "end")
    if (match === null) return false
    const end = this.afterWhitespace(match.end)
    this.read("end", at, end)
    return true
  }

  /**
   * Statement context, rule 18, at a character `at` that is not
   * whitespace: the arrow itself at `at` (see
   * {@link FlowchartUnitLexer.readArrowFrom}). The whitespace before an
   * arrow is read by {@link FlowchartUnitLexer.readWhitespaceRun}.
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
      this.enter(
        LINK_TEXT_CONTEXTS[arrow.parts.opens],
        significantRangeOf(unit),
      )
    }
  }

  /**
   * Statement context, rules 18, 25, and 26, at a whitespace character
   * `at`, where rules 1 to 17 match nothing and rules 19 to 24 match no
   * whitespace. Where an arrow follows the whitespace run from `at`, line
   * feeds included, rule 18 reads the run, the arrow, and the whitespace
   * after it as one unit. Otherwise the run is the units of rules 25 and
   * 26 in order, a `newline` unit for each maximal run of line feeds and a
   * `space` unit for each maximal run of other whitespace. Every place of
   * the run is followed by the same end of the run, where no arrow is, so
   * rule 18 is not tried again at the start of the next unit; rules 1 to 17
   * are, as at the start of any unit, and the first that matches there
   * reads on from it.
   */
  private readWhitespaceRun(at: DiagramCharacter): void {
    const arrow = matchArrow(this.reader, this.afterWhitespace(at))
    if (arrow !== null) {
      this.readArrowFrom(at, arrow)
      return
    }
    let start: DiagramCharacter = at
    for (;;) {
      const lineFeeds = start.codePoint === LINE_FEED
      const end = skipWhile(
        this.reader,
        start,
        (character) =>
          isWhitespace(character.codePoint) &&
          (character.codePoint === LINE_FEED) === lineFeeds,
      )
      this.read(lineFeeds ? "newline" : "space", start, end)
      if (!isWhitespaceAt(end) || this.readRulesBeforeArrow(end)) return
      start = end
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
    this.read("description-block-text", at, end)
  }

  /**
   * The label, slanted, and ellipse contexts, rule 2: zero or more
   * whitespace and three or more `~` are rejected.
   */
  private rejectTildesAt(at: DiagramCharacter): void {
    let tildes = 0
    let position = this.afterWhitespace(at)
    while (isCodePointAt(position, TILDE)) {
      tildes += 1
      position = this.reader.after(position)
    }
    if (tildes >= 3) throw this.noRuleMatches(at)
  }

  /**
   * diagrams/flowchart.md, The label context: a string; whitespace and
   * `~~~`, rejected; `(-`, `([`, or `(((`, rejected; a unit that closes a
   * label, which leaves the context; `(` or `{`, which enters the label
   * context; one or more characters other than `[`, `]`, `(`, `)`, `{`,
   * `}`, `|`, and `"`, a `text-run` unit.
   */
  private readInLabelContext(at: DiagramCharacter): void {
    if (this.readString(at)) return
    this.rejectTildesAt(at)
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
    const end = skipWhile(
      this.reader,
      at,
      (character) =>
        !isOneOf(character, [
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
   * diagrams/flowchart.md, The slanted context: a string; whitespace and
   * `~~~`, rejected; one of `\`, `(`, `?`, `=`, `]`, `)` followed by `]`, a
   * `backslash-end` unit, which leaves the context; `/]`, a `slash-end`
   * unit, which leaves the context; `/` or `\` not followed by `]`, or one
   * or more characters other than `\`, `[`, `]`, `(`, `)`, `{`, `}`, and
   * `/`, a `text-run` unit.
   */
  private readInSlantedContext(at: DiagramCharacter): void {
    if (this.readString(at)) return
    this.rejectTildesAt(at)
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
   * diagrams/flowchart.md, The ellipse context: a string; whitespace and
   * `~~~`, rejected; `-`, `/`, or `)` followed by `)`, an `ellipse-end`
   * unit, which leaves the context; one character other than `(`, `)`,
   * `[`, `]`, `{`, and `}`, a `text-run` unit of that one character, or of
   * the whole placeholder of an entity.
   */
  private readInEllipseContext(at: DiagramCharacter): void {
    if (this.readString(at)) return
    this.rejectTildesAt(at)
    if (isWhitespace(at.codePoint)) {
      // Every character of a run of whitespace reaches the same place after
      // the run, so the `~` there, which are not three or more, reject none
      // of them, and no other rule reads whitespace: each is a `text-run`
      // unit. Read together, the run is walked once, not again from each of
      // its characters, which would take time in the square of its length.
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
   * diagrams/flowchart.md, The link text contexts: a string; a closed arrow
   * of the same kind with its whitespace, an `arrow` unit, which leaves the
   * context; one character other than the kind's character, or, in the
   * dash context, a `-` that another `-` does not follow, a
   * `link-text-char` unit, which is the whole placeholder of an entity.
   */
  private readInLinkTextContext(
    at: DiagramCharacter,
    kind: LinkTextKind,
  ): void {
    if (this.readString(at)) return
    const arrow = matchClosedArrow(this.reader, this.afterWhitespace(at), kind)
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
    if (at.codePoint === LINK_TEXT_FORBIDDEN[kind]) {
      const isLoneDash =
        kind === "dash" && !isCodePointAt(following, HYPHEN_MINUS)
      if (!isLoneDash) throw this.noRuleMatches(at)
    }
    const end = this.afterOneCharacter(at)
    this.read("link-text-char", at, end)
  }
}
