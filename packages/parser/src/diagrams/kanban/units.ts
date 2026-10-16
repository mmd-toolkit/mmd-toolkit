import type { Range } from "../../ast.ts"
import type { KanbanCloser, KanbanOpener } from "../../ast/kanban.ts"
import {
  isLineSegmentSeparator,
  isWhitespace,
} from "../../character-classes.ts"
import {
  COMMERCIAL_AT,
  CIRCUMFLEX_ACCENT,
  GRAVE_ACCENT,
  LEFT_CURLY_BRACKET,
  LEFT_PARENTHESIS,
  LEFT_SQUARE_BRACKET,
  LINE_FEED,
  PERCENT_SIGN,
  QUOTATION_MARK,
  RIGHT_CURLY_BRACKET,
  RIGHT_PARENTHESIS,
  RIGHT_SQUARE_BRACKET,
} from "../../code-points.ts"
import type { DiagramComment } from "../../diagram-parsing.ts"
import type {
  DiagramCharacter,
  DiagramPosition,
  DiagramText,
} from "../../diagram-text.ts"
import type { DiagramUnit, UnitEnds } from "../../diagram-units.ts"
import { readUnit, significantRangeOf } from "../../diagram-units.ts"
import { ParseError } from "../../errors.ts"
import type { LineIndex } from "../../positions.ts"
import { UnitLexer } from "../../unit-lexer.ts"
import {
  isCodePointAt,
  matchWholeWordIgnoringCase,
  matchWord,
  matchWordIgnoringCase,
  samePosition,
  skipWhile,
} from "../../scanning.ts"

/** diagrams/kanban.md, Units and contexts: the names of the units. */
export type UnitName =
  // The statement context.
  | "header"
  | ":::"
  | "::icon("
  | "newline"
  | "opener"
  | "node-text"
  | "data-block"
  // The shape context.
  | "markdown-string"
  | "empty-markdown-string"
  | "string"
  | "empty-string"
  | "closer"
  | "shape-text"
  // The icon context.
  | "icon-text"
  | ")"
  // The class context.
  | "class-text"

/** diagrams/kanban.md, Units and contexts: one unit of the kanban lexer. */
export interface Unit extends DiagramUnit<UnitName> {
  /**
   * Whitespace and lines: the number of whitespace characters that rule 8
   * of the statement context read right before the unit, after the unit
   * before it, in the text without directives. For a unit that starts a
   * node, it is the indentation of the node.
   */
  readonly whitespaceBefore: number
  /**
   * The shape context, rules 1 and 2: for a `string` or a
   * `markdown-string` unit, the source range of its content, from its first
   * character after the opening delimiter to the start of the closing
   * delimiter; for a data block, its whole interior including whitespace;
   * null otherwise. A directive may lie between the two characters of a
   * delimiter of a markdown string, so the content is not found by counting
   * characters from the ends of the unit.
   */
  readonly contentRange: Range | null
  /** The data opener and closer, including any trivia inside the opener. */
  readonly dataDelimiters: readonly [Range, Range] | null
}

/** diagrams/kanban.md, Units and contexts: the contexts of the lexer. */
type Context = "statement" | "shape" | "icon" | "class" | "data" | "quoted-data"

/**
 * Units and contexts: for each context, null when the text may end in it,
 * the statement context and the class context; otherwise the message of
 * the error when the text ends in it, which says what is not closed.
 */
const END_OF_TEXT_MESSAGES: Readonly<Record<Context, string | null>> = {
  statement: null,
  shape: "The shape has no closer before the end of the text",
  icon: "The icon has no ) before the end of the text",
  class: null,
  data: "The data block has no } before the end of the text",
  "quoted-data": 'The data string has no closing " before the end of the text',
}

/** The statement context, rule 7: the openers, in the order in which they are tried. */
const OPENERS: readonly KanbanOpener[] = [
  "-)",
  "(-",
  "))",
  ")",
  "((",
  "{{",
  "(",
  "[",
]

/** The shape context, rule 3: the closers, in the order in which they are tried. */
const CLOSERS: readonly KanbanCloser[] = [
  "))",
  ")",
  "]",
  "}}",
  "(-",
  "-)",
  "((",
  "(",
]

/** diagrams/kanban.md, Lexical structure: what the lexer reads from the diagram text. */
export interface KanbanLexing {
  readonly units: readonly Unit[]
  /** The diagram comments, in source order. */
  readonly comments: readonly DiagramComment[]
}

/**
 * Node texts: whether `character` may be a character of a node text: any
 * character other than `(`, `[`, `)`, `{`, `}`, `@`, and a line feed.
 */
function isNodeTextCharacter(character: DiagramCharacter): boolean {
  return (
    character.codePoint !== LEFT_PARENTHESIS &&
    character.codePoint !== LEFT_SQUARE_BRACKET &&
    character.codePoint !== RIGHT_PARENTHESIS &&
    character.codePoint !== LEFT_CURLY_BRACKET &&
    character.codePoint !== RIGHT_CURLY_BRACKET &&
    character.codePoint !== LINE_FEED &&
    character.codePoint !== COMMERCIAL_AT
  )
}

/**
 * The shape context, rule 4: whether `character` may be a character of a
 * shape text: any character other than `)`, `]`, `(`, and `}`, line feeds
 * included.
 */
function isShapeTextCharacter(character: DiagramCharacter): boolean {
  return (
    character.codePoint !== RIGHT_PARENTHESIS &&
    character.codePoint !== RIGHT_SQUARE_BRACKET &&
    character.codePoint !== LEFT_PARENTHESIS &&
    character.codePoint !== RIGHT_CURLY_BRACKET
  )
}

/** Notation: whether `character` ends a line segment: a line feed, U+2028, or U+2029. */
function endsLineSegment(character: DiagramCharacter): boolean {
  return (
    character.codePoint === LINE_FEED ||
    isLineSegmentSeparator(character.codePoint)
  )
}

/**
 * diagrams/kanban.md, Lexical structure: the lexer that divides the
 * diagram text into units and finds its diagram comments. It keeps a stack
 * of contexts and, at each place, applies the first rule of the current
 * context that matches. The rules are those of the specification, in its
 * order; each method that reads a context names the section it follows.
 * Letters of the keywords are compared case-insensitively.
 */
export class KanbanUnitLexer extends UnitLexer<Context, UnitName, Unit> {
  private readonly comments: DiagramComment[] = []

  /** The number of whitespace characters that rule 8 read since the last unit, which the next unit takes (see `Unit.whitespaceBefore`). */
  private whitespaceRead = 0

  /** The opening of the data block being read, before its one unit is made. */
  private dataOpening: {
    readonly from: DiagramCharacter
    readonly end: number
  } | null = null

  public constructor(reader: DiagramText, lines: LineIndex) {
    super(reader, lines, "statement", END_OF_TEXT_MESSAGES)
  }

  /**
   * Divides the diagram text into units. Throws `ParseError` where no rule
   * matches, at a string or a markdown string that is not closed, and where
   * the text ends in a context that may not end there.
   */
  public lex(): KanbanLexing {
    this.readToEnd()
    this.checkEndOfText()
    return { units: this.units, comments: this.comments }
  }

  /**
   * Adds the unit named `name` that reads the characters from `from` up to,
   * and not including, `to`, whose token leaves out the whitespace at its
   * ends as `ends` says, with the whitespace that rule 8 read before it and
   * the range of its content, `contentRange`, for a string.
   */
  protected override addUnit(
    name: UnitName,
    from: DiagramCharacter,
    to: DiagramPosition,
    ends: UnitEnds = "trim-whitespace",
    contentRange: Range | null = null,
    dataDelimiters: readonly [Range, Range] | null = null,
  ): Unit {
    const unit: Unit = {
      ...readUnit(this.reader, name, this.units.length, from, to, null, ends),
      whitespaceBefore: this.whitespaceRead,
      contentRange,
      dataDelimiters,
    }
    this.units.push(unit)
    this.whitespaceRead = 0
    return unit
  }

  /** Reads the string unit named `name` from `at` up to `to`, whose content lies at `contentRange`, and goes on after it. */
  private readWithContent(
    name: UnitName,
    at: DiagramCharacter,
    to: DiagramPosition,
    contentRange: Range,
  ): void {
    this.addUnit(name, at, to, "trim-whitespace", contentRange)
    this.position = to
  }

  /** The error at the character `at`, with the message `message`. */
  private errorAt(message: string, at: DiagramCharacter): ParseError {
    const range: Range = [at.start, at.end]
    return new ParseError(message, range, this.lines.location(range))
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
      case "shape":
        this.readInShapeContext(at)
        return
      case "icon":
        this.readInIconContext(at)
        return
      case "class":
        this.readInClassContext(at)
        return
      case "data":
        this.readInDataContext(at)
        return
      case "quoted-data":
        this.readInQuotedDataContext(at)
        return
      default:
        throw new Error(
          `mmd-toolkit parser bug: unknown context ${JSON.stringify(context satisfies never)}`,
        )
    }
  }

  /** diagrams/kanban.md, The statement context: rules 1 to 9, in order. */
  private readInStatementContext(at: DiagramCharacter): void {
    if (
      this.readDataOpening(at) ||
      this.readComment(at) ||
      this.readHeader(at) ||
      this.readMarker(at, ":::", "class") ||
      this.readMarker(at, "::icon(", "icon") ||
      this.readLineFeeds(at) ||
      this.readOpener(at) ||
      this.skipWhitespace(at) ||
      this.readNodeText(at)
    ) {
      return
    }
    throw this.noRuleMatches(at)
  }

  /** The statement context, rule 1: `@{` enters data; its `}` makes one `data-block` unit. */
  private readDataOpening(at: DiagramCharacter): boolean {
    const match = matchWord(this.reader, at, "@{")
    if (match === null) return false
    const brace = this.reader.after(at)
    if (brace === null) throw new Error("mmd-toolkit parser bug: no data brace")
    this.dataOpening = { from: at, end: brace.end }
    this.enter("data", [at.start, brace.end])
    this.position = match.end
    return true
  }

  /**
   * The statement context, rule 2, and Comments: `%%` and the characters up
   * to the end of its line segment, a diagram comment with the mark `%%`.
   * A line feed that ends it is read next, by rule 6; a U+2028 or a U+2029
   * that ends it ends its line, which a `newline` unit there marks, with no
   * characters, and is read next as the first character of the next line,
   * by rule 8.
   */
  private readComment(at: DiagramCharacter): boolean {
    if (at.codePoint !== PERCENT_SIGN) return false
    const second = this.reader.after(at)
    if (!isCodePointAt(second, PERCENT_SIGN)) return false
    const end = skipWhile(
      this.reader,
      this.reader.after(second),
      (character) => !endsLineSegment(character),
    )
    if (end === null) {
      throw new Error(
        `mmd-toolkit parser bug: no line feed follows the comment at ${at.start}`,
      )
    }
    this.comments.push({
      range: [at.start, end.start],
      mark: "%%",
      valueStart: second.end,
    })
    if (end.codePoint === LINE_FEED) {
      this.position = end
    } else {
      this.read("newline", end, end)
    }
    return true
  }

  /**
   * The statement context, rule 3: the keyword `kanban`, not followed by a
   * word character, a `header` unit. Detection: the header may not end the
   * text, so the input is rejected at it when the `\n` that the lexer reads
   * after the last character follows it directly.
   */
  private readHeader(at: DiagramCharacter): boolean {
    const match = matchWholeWordIgnoringCase(this.reader, at, "kanban")
    if (match === null) return false
    const header = this.read("header", at, match.end)
    if (match.end?.endOfText === true) {
      const range: Range = [header.start, header.end]
      throw new ParseError(
        "The header cannot end the text",
        range,
        this.lines.location(range),
      )
    }
    return true
  }

  /**
   * The statement context, rules 4 and 5: `:::`, a `:::` unit that enters
   * the class context, or `::icon(`, compared case-insensitively, an
   * `::icon(` unit that enters the icon context.
   */
  private readMarker(
    at: DiagramCharacter,
    marker: ":::" | "::icon(",
    context: "class" | "icon",
  ): boolean {
    const match = matchWordIgnoringCase(this.reader, at, marker)
    if (match === null) return false
    const unit = this.read(marker, at, match.end)
    this.enter(context, significantRangeOf(unit))
    return true
  }

  /** The statement context, rule 6: one or more line feeds, a `newline` unit. */
  private readLineFeeds(at: DiagramCharacter): boolean {
    if (at.codePoint !== LINE_FEED) return false
    const end = skipWhile(
      this.reader,
      at,
      (character) => character.codePoint === LINE_FEED,
    )
    this.read("newline", at, end)
    return true
  }

  /** The statement context, rule 7: an opener, tried in the order of {@link OPENERS}, an `opener` unit that enters the shape context. */
  private readOpener(at: DiagramCharacter): boolean {
    for (const opener of OPENERS) {
      const match = matchWord(this.reader, at, opener)
      if (match !== null) {
        const unit = this.read("opener", at, match.end)
        this.enter("shape", significantRangeOf(unit))
        return true
      }
    }
    return false
  }

  /**
   * The statement context, rule 8: one or more whitespace characters other
   * than a line feed, nothing; the next unit counts them (see
   * `Unit.whitespaceBefore`).
   */
  private skipWhitespace(at: DiagramCharacter): boolean {
    let count = 0
    let position: DiagramPosition = at
    while (
      position !== null &&
      isWhitespace(position.codePoint) &&
      position.codePoint !== LINE_FEED
    ) {
      count += 1
      position = this.reader.after(position)
    }
    if (count === 0) return false
    this.whitespaceRead += count
    this.position = position
    return true
  }

  /**
   * The statement context, rule 9 (Node texts): one or more characters
   * that `isNodeTextCharacter` takes, a `node-text` unit, whose token keeps
   * the whitespace at its end, which mermaid.js keeps in the node.
   */
  private readNodeText(at: DiagramCharacter): boolean {
    if (!isNodeTextCharacter(at)) return false
    const end = skipWhile(this.reader, at, isNodeTextCharacter)
    this.read("node-text", at, end, "keep-whitespace")
    return true
  }

  /** diagrams/kanban.md, The shape context: rules 1 to 4, in order. */
  private readInShapeContext(at: DiagramCharacter): void {
    if (this.readMarkdownString(at) || this.readString(at)) return
    for (const closer of CLOSERS) {
      const match = matchWord(this.reader, at, closer)
      if (match !== null) {
        // Rule 3: a closer leaves the shape context.
        this.read("closer", at, match.end)
        this.leave()
        return
      }
    }
    if (!isShapeTextCharacter(at)) {
      // A `}` that does not start `}}`.
      throw this.noRuleMatches(at)
    }
    // Rule 4: a shape text, whose token keeps the whitespace at its ends.
    const end = skipWhile(this.reader, at, isShapeTextCharacter)
    this.read("shape-text", at, end, "keep-whitespace")
  }

  /**
   * The shape context, rule 1: `` "` ``, zero or more characters other than
   * `` ` `` and `"`, line feeds included, and `` `" ``: a `markdown-string`
   * unit, or an `empty-markdown-string` unit when nothing lies between.
   * Inside a markdown string, the first `` ` `` or `"` ends it, so it must
   * start a `` `" ``; when it does not, or when the text ends before it, the
   * input is rejected at the opening `"`, and rule 2 is not tried.
   */
  private readMarkdownString(at: DiagramCharacter): boolean {
    if (at.codePoint !== QUOTATION_MARK) return false
    const backquote = this.reader.after(at)
    if (!isCodePointAt(backquote, GRAVE_ACCENT)) return false
    const contentStart = this.reader.after(backquote)
    const end = skipWhile(
      this.reader,
      contentStart,
      (character) =>
        character.codePoint !== GRAVE_ACCENT &&
        character.codePoint !== QUOTATION_MARK,
    )
    if (contentStart === null || end === null) {
      throw this.errorAt(
        'The markdown string has no closing `" before the end of the text',
        at,
      )
    }
    const quote = this.reader.after(end)
    if (
      end.codePoint !== GRAVE_ACCENT ||
      !isCodePointAt(quote, QUOTATION_MARK)
    ) {
      throw this.errorAt(
        'The markdown string is not closed by `" at its first ` or "',
        at,
      )
    }
    if (samePosition(end, contentStart)) {
      this.read("empty-markdown-string", at, this.reader.after(quote))
    } else {
      this.readWithContent("markdown-string", at, this.reader.after(quote), [
        contentStart.start,
        end.start,
      ])
    }
    return true
  }

  /**
   * The shape context, rule 2: `"`, zero or more characters other than `"`,
   * line feeds included, and `"`: a `string` unit, or an `empty-string`
   * unit when nothing lies between. A string must be closed: the input is
   * rejected at the opening quote of a string that the text ends in.
   */
  private readString(at: DiagramCharacter): boolean {
    if (at.codePoint !== QUOTATION_MARK) return false
    const contentStart = this.reader.after(at)
    const closing = skipWhile(
      this.reader,
      contentStart,
      (character) => character.codePoint !== QUOTATION_MARK,
    )
    if (contentStart === null || closing === null) {
      throw this.errorAt(
        'The string has no closing " before the end of the text',
        at,
      )
    }
    if (samePosition(closing, contentStart)) {
      this.read("empty-string", at, this.reader.after(closing))
    } else {
      this.readWithContent("string", at, this.reader.after(closing), [
        contentStart.start,
        closing.start,
      ])
    }
    return true
  }

  /**
   * The icon and class contexts: in the icon context, `)` is a `)` unit and
   * leaves the context, and one or more characters other than `)`, line
   * feeds included, are an `icon-text` unit, whose token keeps the
   * whitespace at its ends.
   */
  private readInIconContext(at: DiagramCharacter): void {
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
    this.read("icon-text", at, end, "keep-whitespace")
  }

  /**
   * The icon and class contexts: in the class context, one or more
   * characters other than a line feed, U+2028, and U+2029 are a
   * `class-text` unit, whose token keeps the whitespace at its ends, and
   * the context is left; a line feed, a U+2028, or a U+2029 leaves the
   * context without a unit and is read next in the statement context.
   */
  private readInClassContext(at: DiagramCharacter): void {
    if (!endsLineSegment(at)) {
      const end = skipWhile(
        this.reader,
        at,
        (character) => !endsLineSegment(character),
      )
      this.read("class-text", at, end, "keep-whitespace")
    }
    this.leave()
  }

  /** The data context: a quote enters quoted data, nonempty content excludes `}`, `^`, and quotes, and `}` closes the block. */
  private readInDataContext(at: DiagramCharacter): void {
    if (at.codePoint === QUOTATION_MARK) {
      this.enter("quoted-data", [at.start, at.end])
      this.position = this.reader.after(at)
      return
    }
    if (at.codePoint === RIGHT_CURLY_BRACKET) {
      const opening = this.dataOpening
      if (opening === null)
        throw new Error("mmd-toolkit parser bug: data has no opening")
      const end = this.reader.after(at)
      this.addUnit(
        "data-block",
        opening.from,
        end,
        "trim-whitespace",
        [opening.end, at.start],
        [
          [opening.from.start, opening.end],
          [at.start, at.end],
        ],
      )
      this.dataOpening = null
      this.position = end
      this.leave()
      return
    }
    if (at.codePoint === CIRCUMFLEX_ACCENT) throw this.noRuleMatches(at)
    this.position = skipWhile(
      this.reader,
      at,
      (character) =>
        character.codePoint !== RIGHT_CURLY_BRACKET &&
        character.codePoint !== CIRCUMFLEX_ACCENT &&
        character.codePoint !== QUOTATION_MARK,
    )
  }

  /** The quoted-data context: the next quote leaves it; every other character is content. */
  private readInQuotedDataContext(at: DiagramCharacter): void {
    if (at.codePoint === QUOTATION_MARK) {
      this.position = this.reader.after(at)
      this.leave()
      return
    }
    this.position = skipWhile(
      this.reader,
      at,
      (character) => character.codePoint !== QUOTATION_MARK,
    )
  }
}
