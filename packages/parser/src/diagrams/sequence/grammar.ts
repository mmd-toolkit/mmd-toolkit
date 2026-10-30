import { appendItems } from "../../append-items.ts"
import type { NumericLiteral, Range } from "../../ast.ts"
import type {
  SequenceAccDescrBlockStatement,
  SequenceAccDescrStatement,
  SequenceAccTitleStatement,
  SequenceActivation,
  SequenceArrow,
  SequenceAutonumberStatement,
  SequenceBoxStatement,
  SequenceBoxText,
  SequenceDataBlock,
  SequenceDestroyStatement,
  SequenceIdentifier,
  SequenceIgnoredStatement,
  SequenceLiteral,
  SequenceMessageStatement,
  SequenceNotePlacement,
  SequenceNoteStatement,
  SequenceParticipantStatement,
  SequenceSection,
  SequenceStatement,
  SequenceText,
  SequenceTitleStatement,
} from "../../ast/sequence.ts"
import { significantRangeOf } from "../../diagram-units.ts"
import type { ParseError } from "../../errors.ts"
import type { PendingToken, SourceLexer } from "../../source-lexer.ts"
import { EMPTY_FORM_KINDS } from "../../empty-forms.ts"
import { UnitGrammar } from "../../unit-grammar.ts"
import type { SequenceLexing, Unit, UnitName } from "./units.ts"

/**
 * What the grammar makes of the units of a sequence diagram: the
 * statements and the tokens. The grammar reads the
 * diagram text, which has no directives (diagrams/sequence.md, Directives
 * inside units), so a directive can lie inside the range of a unit or of a
 * token here.
 */
export interface SequenceSyntax {
  /** The statements of the diagram, in source order. */
  readonly body: readonly SequenceStatement[]
  /** The tokens of the diagram, in source order. */
  readonly tokens: readonly PendingToken[]
}

/** Blocks: the keywords of the blocks that hold one section, and the node type of each. */
const SIMPLE_BLOCKS = {
  loop: "SequenceLoopStatement",
  opt: "SequenceOptStatement",
  break: "SequenceBreakStatement",
} as const satisfies Partial<Record<UnitName, string>>

/** Blocks: the keywords of the blocks of sections, the keyword of their later sections, and the node type of each. */
const SECTION_BLOCKS = {
  alt: { section: "else", type: "SequenceAltStatement" },
  par: { section: "and", type: "SequenceParStatement" },
  par_over: { section: "and", type: "SequenceParOverStatement" },
  critical: { section: "option", type: "SequenceCriticalStatement" },
} as const satisfies Partial<
  Record<UnitName, { section: UnitName; type: string }>
>

/** Participants and boxes: the keywords that start a participant statement. */
const PARTICIPANT_KEYWORDS: readonly UnitName[] = [
  "participant",
  "actor",
  "destroy",
]

/**
 * diagrams/sequence.md, Grammar: the recursive-descent parser over the
 * units of the sequence lexer. Each method reads one rule of the grammar,
 * which its comment names, and makes the node that the specification gives
 * for the rule, with the tokens of `docs/tokens/sequence.md`, Tokens.
 *
 * The parser reads units only; it moves no cursor in the source. A unit
 * that no rule takes makes the input rejected, such as the units of an
 * empty description block that does not start a statement
 * (known-divergences/tokenless-empty-forms.md), for which
 * {@link SequenceGrammar.unexpected} names the form.
 */
export class SequenceGrammar extends UnitGrammar<UnitName, Unit> {
  public constructor(lexing: SequenceLexing, lexer: SourceLexer) {
    super(lexing.units, lexer, EMPTY_FORM_KINDS.sequence, lexing.comments)
  }

  /**
   * Diagram and statements: `diagram = newline* "sequenceDiagram" line*`.
   * The `newline` units before the keyword are those of the lines that
   * detection leaves out (Detection).
   */
  public parseDiagram(): SequenceSyntax {
    while (this.peek()?.name === "newline") this.takeNewline()
    this.addItem("Keyword", [this.take("sequenceDiagram")])
    const body = this.parseLines([])
    return {
      body,
      tokens: this.tokensInOrder(),
    }
  }

  /**
   * Diagram and statements: `line*`, where `line = statement | newline |
   * invalid`. The lines end before a unit named in `endsBefore`, the `end`
   * or the next section of the block around them; the lines of the diagram
   * end at the end of the text.
   */
  private parseLines(endsBefore: readonly UnitName[]): SequenceStatement[] {
    const statements: SequenceStatement[] = []
    for (;;) {
      const unit = this.peek()
      if (unit === null) {
        if (endsBefore.length > 0) throw this.unexpected(null)
        return statements
      }
      if (endsBefore.includes(unit.name)) return statements
      if (unit.name === "newline") {
        this.takeNewline()
      } else if (unit.name === "invalid") {
        statements.push(this.parseIgnoredStatement())
      } else {
        appendItems(statements, this.parseStatement(unit))
      }
    }
  }

  /**
   * Diagram and statements: a `newline` unit. One read from `;` is a
   * `Punctuator` token that belongs to no statement; one read from line
   * feeds, or at the end of the text, is whitespace.
   */
  private takeNewline(): void {
    const newline = this.take("newline")
    if (newline.significantRange !== null) {
      this.addItem("Punctuator", [newline])
    }
  }

  /** Grammar: an `invalid` unit as a line, a SequenceIgnoredStatement. */
  private parseIgnoredStatement(): SequenceIgnoredStatement {
    const unit = this.take("invalid")
    this.addItem("RawText", [unit])
    const place = this.placeOf([unit])
    return {
      type: "SequenceIgnoredStatement",
      value: this.unreadTextOf(place.range),
      ...place,
    }
  }

  /**
   * Diagram and statements: `statement`, with the empty description
   * blocks after it. The participant, destroy, message, autonumber,
   * activation, note, and participant text statements end with a
   * `statement-end`; the others need no separator.
   */
  private parseStatement(first: Unit): SequenceStatement[] {
    switch (first.name) {
      case "participant":
      case "actor":
      case "destroy":
        return this.withStatementEnd(
          this.parseParticipantStatement(this.next, false),
        )
      case "create": {
        const start = this.next
        this.addItem("Keyword", [this.take("create")])
        return this.withStatementEnd(
          this.parseParticipantStatement(start, true),
        )
      }
      case "box":
        return [this.parseBoxStatement()]
      case "title":
      case "title:":
        return [this.parseTitleStatement()]
      case "accTitle":
        return [this.parseAccTitleStatement()]
      case "accDescr":
        return [this.parseAccDescrStatement()]
      case "loop":
      case "opt":
      case "break":
        return [this.parseSimpleBlock(first.name)]
      case "rect":
        return [this.parseRectBlock()]
      case "alt":
      case "par":
      case "par_over":
      case "critical":
        return [this.parseSectionBlock(first.name)]
      default:
        return this.withStatementEnd(this.parseStatementWithNewline(first))
    }
  }

  /**
   * Empty description blocks before a separator: the statement
   * `statement`, read up to its last unit, and the empty description blocks
   * of the `statement-end = empty-description-block* newline` after it,
   * each a statement of its own; the `newline` is taken.
   */
  private withStatementEnd(statement: SequenceStatement): SequenceStatement[] {
    const end = this.statementEndAt(["newline"], false)
    const statements = [statement]
    while (this.next < end) {
      statements.push(this.parseEmptyDescriptionBlock())
    }
    this.takeNewline()
    return statements
  }

  /** Diagram and statements: the statements that a `newline` follows. */
  private parseStatementWithNewline(first: Unit): SequenceStatement {
    switch (first.name) {
      case "id":
        return this.parseMessageStatement()
      case "autonumber":
        return this.parseAutonumberStatement()
      case "activate":
      case "deactivate":
        return this.parseActivationStatement(first.name)
      case "note":
        return this.parseNoteStatement()
      case "links":
      case "link":
      case "properties":
      case "details":
        return this.parseParticipantTextStatement(first.name)
      default:
        throw this.unexpected(first)
    }
  }

  /**
   * Participants and boxes: `participant-statement = ( "participant" |
   * "actor" ) id data-block? ( "as" text-part )? newline | "destroy" id
   * newline`, with `create` before it when `created`, up to its last unit:
   * the caller reads the `statement-end` that ends it in place of the
   * `newline`. The node starts at the unit at `start`.
   */
  private parseParticipantStatement(
    start: number,
    created: boolean,
  ): SequenceParticipantStatement | SequenceDestroyStatement {
    const keyword = this.peek()
    if (keyword === null || !PARTICIPANT_KEYWORDS.includes(keyword.name)) {
      throw this.unexpected(keyword)
    }
    this.advance()
    this.addItem("Keyword", [keyword])
    const id = this.sequenceIdentifierOf(this.take("id"))
    if (keyword.name === "destroy") {
      return {
        type: "SequenceDestroyStatement",
        created,
        id,
        ...this.placeFrom(start),
      }
    }
    const data = this.nameAt(this.next) === "@{" ? this.parseDataBlock() : null
    let alias: SequenceText | null = null
    const as = this.takeIf("as")
    if (as !== null) {
      this.addItem("Keyword", [as])
      alias = this.parseTextPart()
    }
    return {
      type: "SequenceParticipantStatement",
      kind: keyword.name === "actor" ? "actor" : "participant",
      created,
      id,
      data,
      alias,
      ...this.placeFrom(start),
    }
  }

  /**
   * Participants and boxes: `data-block = "@{" data-text "}"`. Its value
   * is the text between `@{` and `}`, as written.
   */
  private parseDataBlock(): SequenceDataBlock {
    const start = this.next
    const opening = this.take("@{")
    this.addItem("Punctuator", [opening])
    this.addItem("RawText", [this.take("data-text")])
    const closing = this.take("}")
    this.addItem("Punctuator", [closing])
    const place = this.placeFrom(start)
    return {
      type: "SequenceDataBlock",
      value: this.textOf([
        significantRangeOf(opening)[1],
        significantRangeOf(closing)[0],
      ]),
      ...place,
    }
  }

  /**
   * Participants and boxes: `box-statement = "box" box-text? (
   * participant-statement | "accDescr" "{" "}" | newline )* "end"`.
   */
  private parseBoxStatement(): SequenceBoxStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("box")])
    const text = this.parseBoxText()
    const body: SequenceStatement[] = []
    for (;;) {
      const unit = this.peek()
      if (unit?.name === "end") break
      if (unit?.name === "newline") {
        this.takeNewline()
      } else if (unit !== null && PARTICIPANT_KEYWORDS.includes(unit.name)) {
        appendItems(
          body,
          this.withStatementEnd(
            this.parseParticipantStatement(this.next, false),
          ),
        )
      } else if (unit?.name === "accDescr") {
        body.push(this.parseEmptyDescriptionBlock())
      } else {
        throw this.unexpected(unit)
      }
    }
    this.addItem("Keyword", [this.take("end")])
    return {
      type: "SequenceBoxStatement",
      text,
      body,
      ...this.placeFrom(start),
    }
  }

  /**
   * `"accDescr" "{" "}"`, an empty description block, a description block
   * statement without text: of a `box-statement` (Participants and boxes),
   * where a description block with text and a description statement are no
   * statements, and of a `statement-end` (Empty description blocks before a
   * separator).
   */
  private parseEmptyDescriptionBlock(): SequenceAccDescrBlockStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("accDescr")])
    this.addItem("Punctuator", [this.take("{")])
    this.addItem("Punctuator", [this.take("}")])
    return {
      type: "SequenceAccDescrBlockStatement",
      value: null,
      closed: true,
      ...this.placeFrom(start),
    }
  }

  /**
   * Participants and boxes: `box-text = color-candidate text? | text`, a
   * SequenceBoxText, or null when there is none. Each unit is a literal,
   * one `RawText` item, and the whitespace between them, which the value of
   * the box text holds and neither literal does, is a `RawText` token of
   * the box text itself (`docs/tokens/sequence.md`).
   */
  private parseBoxText(): SequenceBoxText | null {
    const candidate = this.takeIf("color-candidate")
    const text = this.takeIf("text")
    if (candidate === null && text === null) return null
    const between: Range | null =
      candidate?.significantRange == null || text?.significantRange == null
        ? null
        : this.diagramTextIn([
            candidate.significantRange[1],
            text.significantRange[0],
          ])
    if (between !== null) {
      // The whitespace between the parts, which the value holds and neither
      // part does, is a token of the box text itself.
      this.addWhitespaceToken("RawText", between)
    }
    const place = this.placeOf(
      [candidate, text].filter((unit) => unit !== null),
    )
    return {
      type: "SequenceBoxText",
      value: this.textOf(place.range),
      colorCandidate: candidate === null ? null : this.literalOf([candidate]),
      remainder: text === null ? null : this.literalOf([text]),
      ...place,
    }
  }

  /**
   * Messages: `message-statement = id arrow ( "+" | "-" | "()" )? id ":"
   * text-part | id "()" arrow "()"? id ":" text-part`.
   */
  private parseMessageStatement(): SequenceMessageStatement {
    const start = this.next
    const from = this.sequenceIdentifierOf(this.take("id"))
    const fromCentralConnection = this.takePunctuator("()")
    const arrow = this.arrowOf(this.take("arrow"))
    let activation: SequenceActivation | null = null
    let toCentralConnection = false
    if (fromCentralConnection) {
      toCentralConnection = this.takePunctuator("()")
    } else if (this.takePunctuator("+")) {
      activation = "+"
    } else if (this.takePunctuator("-")) {
      activation = "-"
    } else {
      toCentralConnection = this.takePunctuator("()")
    }
    const to = this.sequenceIdentifierOf(this.take("id"))
    this.addItem("Punctuator", [this.take(":")])
    const text = this.parseTextPart()
    return {
      type: "SequenceMessageStatement",
      from,
      fromCentralConnection,
      arrow,
      activation,
      toCentralConnection,
      to,
      text,
      ...this.placeFrom(start),
    }
  }

  /** Reads the next unit, a `Punctuator`, when it is named `name`; whether it was there. */
  private takePunctuator(name: UnitName): boolean {
    const unit = this.takeIf(name)
    if (unit === null) return false
    this.addItem("Punctuator", [unit])
    return true
  }

  /**
   * Other statements: `autonumber-statement = "autonumber" ( number
   * number? | "off" )?`.
   */
  private parseAutonumberStatement(): SequenceAutonumberStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("autonumber")])
    const off = this.takeIf("off")
    if (off !== null) this.addItem("Keyword", [off])
    let startNumber: NumericLiteral | null = null
    let step: NumericLiteral | null = null
    if (off === null) {
      const first = this.takeIf("number")
      if (first !== null) {
        startNumber = this.numericLiteralOf(first)
        const second = this.takeIf("number")
        if (second !== null) step = this.numericLiteralOf(second)
      }
    }
    return {
      type: "SequenceAutonumberStatement",
      start: startNumber,
      step,
      off: off !== null,
      ...this.placeFrom(start),
    }
  }

  /** Diagram and statements: `( "activate" | "deactivate" ) id`. */
  private parseActivationStatement(
    keyword: "activate" | "deactivate",
  ): SequenceStatement {
    const start = this.next
    this.addItem("Keyword", [this.take(keyword)])
    const id = this.sequenceIdentifierOf(this.take("id"))
    const place = this.placeFrom(start)
    return keyword === "activate"
      ? { type: "SequenceActivateStatement", id, ...place }
      : { type: "SequenceDeactivateStatement", id, ...place }
  }

  /**
   * Other statements: `note-statement = "note" ( "left" | "right" ) "of"
   * id ":" text-part | "note" "over" id ( "," id )? ":" text-part`.
   */
  private parseNoteStatement(): SequenceNoteStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("note")])
    const placementUnit = this.peek()
    let placement: SequenceNotePlacement
    if (placementUnit?.name === "left") {
      placement = "left of"
    } else if (placementUnit?.name === "right") {
      placement = "right of"
    } else if (placementUnit?.name === "over") {
      placement = "over"
    } else {
      throw this.unexpected(placementUnit)
    }
    this.advance()
    this.addItem("Keyword", [placementUnit])
    if (placement !== "over") this.addItem("Keyword", [this.take("of")])
    const ids = [this.sequenceIdentifierOf(this.take("id"))]
    if (placement === "over" && this.takePunctuator(",")) {
      ids.push(this.sequenceIdentifierOf(this.take("id")))
    }
    this.addItem("Punctuator", [this.take(":")])
    const text = this.parseTextPart()
    return {
      type: "SequenceNoteStatement",
      placement,
      ids,
      text,
      ...this.placeFrom(start),
    }
  }

  /**
   * Diagram and statements: `( "links" | "link" | "properties" | "details"
   * ) id ":" text-part`.
   */
  private parseParticipantTextStatement(
    keyword: "links" | "link" | "properties" | "details",
  ): SequenceStatement {
    const start = this.next
    this.addItem("Keyword", [this.take(keyword)])
    const id = this.sequenceIdentifierOf(this.take("id"))
    this.addItem("Punctuator", [this.take(":")])
    const text = this.parseTextPart()
    const place = this.placeFrom(start)
    switch (keyword) {
      case "links":
        return { type: "SequenceLinksStatement", id, text, ...place }
      case "link":
        return { type: "SequenceLinkStatement", id, text, ...place }
      case "properties":
        return { type: "SequencePropertiesStatement", id, text, ...place }
      case "details":
        return { type: "SequenceDetailsStatement", id, text, ...place }
      default:
        throw new Error(
          `mmd-toolkit parser bug: unknown keyword ${JSON.stringify(keyword satisfies never)}`,
        )
    }
  }

  /**
   * Other statements: `title-statement = ( "title" | "title:" )
   * title-text`. The value is the whole title text, whitespace included,
   * also when it is all whitespace.
   */
  private parseTitleStatement(): SequenceTitleStatement {
    const start = this.next
    const keyword = this.takeIf("title") ?? this.take("title:")
    this.addItem("Keyword", [keyword])
    const text = this.take("title-text")
    return {
      type: "SequenceTitleStatement",
      value: this.literalOf([text]),
      ...this.placeFrom(start),
    }
  }

  /** Other statements: `"accTitle" ":" title-text?`. */
  private parseAccTitleStatement(): SequenceAccTitleStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("accTitle")])
    this.addItem("Punctuator", [this.take(":")])
    const text = this.takeIf("title-text")
    return {
      type: "SequenceAccTitleStatement",
      value: text === null ? null : this.literalOf([text]),
      ...this.placeFrom(start),
    }
  }

  /**
   * Other statements: `"accDescr" ":" description-text?` and `"accDescr"
   * "{" description-block-text? ( "}" | end-of-text )`.
   */
  private parseAccDescrStatement():
    SequenceAccDescrStatement | SequenceAccDescrBlockStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("accDescr")])
    const colon = this.takeIf(":")
    if (colon !== null) {
      this.addItem("Punctuator", [colon])
      const text = this.takeIf("description-text")
      return {
        type: "SequenceAccDescrStatement",
        value: text === null ? null : this.literalOf([text]),
        ...this.placeFrom(start),
      }
    }
    this.addItem("Punctuator", [this.take("{")])
    const text = this.takeIf("description-block-text")
    const value = text === null ? null : this.literalOf([text])
    // Lexical structure: in the description block context the end of the
    // text reads no `newline` unit, so the block ends with the units.
    const atEndOfText = this.peek() === null
    const closing = atEndOfText ? null : this.take("}")
    if (closing !== null) this.addItem("Punctuator", [closing])
    return {
      type: "SequenceAccDescrBlockStatement",
      value,
      closed: closing !== null,
      ...this.placeFrom(start),
    }
  }

  /** Blocks: `( "loop" | "opt" | "break" ) text-part line* "end"`. */
  private parseSimpleBlock(
    keyword: keyof typeof SIMPLE_BLOCKS,
  ): SequenceStatement {
    const start = this.next
    this.addItem("Keyword", [this.take(keyword)])
    const text = this.parseTextPart()
    const body = this.parseLines(["end"])
    this.addItem("Keyword", [this.take("end")])
    return {
      type: SIMPLE_BLOCKS[keyword],
      text,
      body,
      ...this.placeFrom(start),
    }
  }

  /** Blocks: `"rect" text-part line* "end"`. */
  private parseRectBlock(): SequenceStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("rect")])
    const color = this.parseTextPart()
    const body = this.parseLines(["end"])
    this.addItem("Keyword", [this.take("end")])
    return {
      type: "SequenceRectStatement",
      color,
      body,
      ...this.placeFrom(start),
    }
  }

  /**
   * Blocks: `"alt" text-part line* ( "else" text-part line* )* "end"`, and
   * the same with `par` or `par_over` and `and`, and with `critical` and
   * `option`. Each `text-part line*` is a SequenceSection.
   */
  private parseSectionBlock(
    keyword: keyof typeof SECTION_BLOCKS,
  ): SequenceStatement {
    const start = this.next
    const { section: sectionKeyword, type } = SECTION_BLOCKS[keyword]
    const sections = [this.parseSection(keyword, sectionKeyword)]
    while (this.nameAt(this.next) === sectionKeyword) {
      sections.push(this.parseSection(sectionKeyword, sectionKeyword))
    }
    this.addItem("Keyword", [this.take("end")])
    return { type, sections, ...this.placeFrom(start) }
  }

  /** Blocks: one section, `keyword text-part line*`, whose lines end before `nextSection` or `end`. */
  private parseSection(
    keyword: UnitName,
    nextSection: UnitName,
  ): SequenceSection {
    const start = this.next
    this.addItem("Keyword", [this.take(keyword)])
    const text = this.parseTextPart()
    const body = this.parseLines([nextSection, "end"])
    return {
      type: "SequenceSection",
      text,
      body,
      ...this.placeFrom(start),
    }
  }

  /**
   * Other statements: `text-part = wrap-prefix? text?`, a SequenceText, or
   * null when it has neither unit. The wrap prefix is a `Keyword` item.
   */
  private parseTextPart(): SequenceText | null {
    const prefix = this.takeIf("wrap-prefix")
    const text = this.takeIf("text")
    if (prefix === null && text === null) return null
    if (prefix !== null) this.addItem("Keyword", [prefix])
    return {
      type: "SequenceText",
      wrap: prefix === null ? null : this.wrapOf(prefix),
      value: text === null ? null : this.literalOf([text]),
      ...this.placeOf([prefix, text].filter((unit) => unit !== null)),
    }
  }

  /**
   * ast/sequence.md, SequenceArrow: the arrow of the `arrow` unit `unit`,
   * one `Punctuator` item, with the parts that the lexer read.
   */
  private arrowOf(unit: Unit): SequenceArrow {
    this.addItem("Punctuator", [unit])
    if (unit.arrow === null) {
      throw new Error(
        `mmd-toolkit parser bug: the arrow unit at ${unit.start} has no parts`,
      )
    }
    const place = this.placeOf([unit])
    return {
      type: "SequenceArrow",
      value: this.textOf(place.range),
      startMarker: unit.arrow.startMarker,
      line: unit.arrow.line,
      endMarker: unit.arrow.endMarker,
      ...place,
    }
  }

  /** Text parts: `wrap` after `wrap:` and `nowrap` after `nowrap:`, with or without the `:` before it. */
  private wrapOf(prefix: Unit): "wrap" | "nowrap" {
    return prefix.text.includes("nowrap") ? "nowrap" : "wrap"
  }

  /**
   * ast/sequence.md, SequenceIdentifier: the id of the `id` unit `unit`,
   * one `RawText` item, as a name that may contain whitespace. Its name is
   * the text of the unit's range without the whitespace at its ends: the
   * whitespace inside it is part of it, also next to a directive that cuts
   * the unit.
   */
  private sequenceIdentifierOf(unit: Unit): SequenceIdentifier {
    this.addItem("RawText", [unit])
    return {
      type: "SequenceIdentifier",
      name: this.textOfUnit(unit),
      ...this.placeOf([unit]),
    }
  }

  /**
   * SequenceLiteral: the literal whose units are `units`, one `RawText`
   * item. Its value is its written text.
   */
  private literalOf(units: readonly Unit[]): SequenceLiteral {
    this.addItem("RawText", units)
    const place = this.placeOf(units)
    return {
      type: "SequenceLiteral",
      value: this.textOf(place.range),
      ...place,
    }
  }

  /**
   * The error of a known divergence for the unit `unit`, which the grammar
   * cannot read where it stands: a unit of an empty description block, which
   * no rule takes outside a statement start.
   */
  protected knownDivergenceAt(unit: Unit): ParseError | null {
    return this.emptyFormErrorAt(unit)
  }
}
