import type {
  Comment,
  DiagramTokenKind,
  Directive,
  Frontmatter,
  Range,
  Token,
  TokenKind,
} from "./ast.ts"
import { isWhitespace } from "./character-classes.ts"
import { APOSTROPHE } from "./code-points.ts"
import type { DiagramComment } from "./diagram-parsing.ts"
import type { DirectiveMatch } from "./directives.ts"
import type { EntityDelimiter } from "./entities.ts"
import { frontmatterTokensOf } from "./frontmatter.ts"
import { findAttributeQuotes } from "./html-quotes.ts"
import type { CommentRegionEntry, LineEntry } from "./line-lookahead.ts"
import { commentEnd, lookAheadFromCommentStart } from "./line-lookahead.ts"
import { LineIndex } from "./positions.ts"
import {
  lineTerminatorEnd,
  nextOffset,
  skipBackWhile,
  skipWhile,
} from "./text-cursor.ts"

/**
 * common.md, Reading a source: one character of the diagram text as a
 * diagram's token rules read it. `text` is its converted form: `\n` for a
 * line terminator, `'` for an attribute quote, the opening of the
 * placeholder for the `#` of an entity and its closing for the `;` of the
 * entity, and the character itself otherwise. At the end of the source it is
 * the extra `\n` of End of text, with `endOfText` set and `start` and `end`
 * at the end of the source.
 *
 * The lexer reads through comment regions and the `;` that the line rule
 * ignores, which are not diagram text, so `start` can lie after the offset
 * that was asked about. Between the two lie comment regions, which only a
 * comment start can be followed by, and after them ignored `;` characters.
 * They are still characters of the source: a token that goes on after them
 * holds them (ast.md, Tokens).
 */
export interface ReadCharacter {
  readonly kind: "character"
  /** The character in converted form. */
  readonly text: string
  /** Where the character itself starts, after what the lexer read through. */
  readonly start: number
  /** The offset after the source characters of the character. */
  readonly end: number
  /** Whether this is the `\n` read after the last character of the source. */
  readonly endOfText: boolean
  /**
   * Entities: for the opening of a placeholder, read in place of the `#` of
   * an entity, the offset after the entity's `;`, where the placeholder
   * ends; null for every other character.
   */
  readonly placeholderEnd: number | null
}

/**
 * Whether `character` is a whitespace character or a line terminator. Its
 * converted form tells: a line terminator is read as `\n`, which is
 * whitespace, as is the `\n` read at the end of the text; an attribute quote
 * and an entity are read as characters that are not whitespace; every other
 * character is read as itself.
 */
function isWhitespaceCharacter(character: ReadCharacter): boolean {
  const codePoint = character.text.codePointAt(0)
  return codePoint !== undefined && isWhitespace(codePoint)
}

/**
 * common.md, A directive is a token boundary: a directive where the next
 * character of the diagram text would be. A directive is not diagram text.
 * The diagram's token rules go on at `end` as if the directive were absent,
 * except that no token has a directive between two of its characters that
 * are not whitespace.
 */
export interface ReadDirective {
  readonly kind: "directive"
  /** Where the directive starts, after what the lexer read through. */
  readonly start: number
  /** The offset after the directive. */
  readonly end: number
}

/**
 * A part of a diagram comment, at its offset `at`, recorded in source order:
 * a directive inside it, a comment region that cuts it, a fragment of it,
 * or a `;` that the line rule ignores right after it.
 */
type DiagramCommentPart =
  | {
      readonly kind: "directive"
      readonly at: number
      readonly directive: DirectiveMatch
    }
  | {
      readonly kind: "region"
      readonly at: number
      readonly region: CommentRegionEntry
    }
  | { readonly kind: "fragment"; readonly at: number; readonly range: Range }
  | { readonly kind: "semicolon"; readonly at: number }

/**
 * ast.md, Comment: the kind of each piece of a token of kind `kind` that is
 * recorded as `pieces` pieces: a piece of a `String` token cut by a comment
 * region is a `StringFragment` token, and every other piece keeps the kind of
 * its token. A directive never cuts a `String` token, since a directive
 * inside a string makes the input rejected.
 */
function pieceKindOf(kind: DiagramTokenKind, pieces: number): TokenKind {
  return kind === "String" && pieces > 1 ? "StringFragment" : kind
}

/** What a reader finds when it reads the text from an offset: the next character of the diagram text, or a directive that comes before it. */
export type ReadElement = ReadCharacter | ReadDirective

/**
 * A token that a diagram's parser has found in the diagram text, which has
 * no directives, and that the shared lexer has not recorded yet. A directive
 * may lie inside its range.
 */
export interface PendingToken {
  /** The token kind. */
  readonly kind: DiagramTokenKind
  /** Where the token is in the source, from its first to its last character that is not whitespace. */
  readonly range: Range
}

/** The rule of Reading a source that applies at a position, or none. */
type RuleAtPosition =
  | { readonly rule: "region"; readonly entry: CommentRegionEntry }
  | { readonly rule: "ignored-semicolon" }
  | { readonly rule: "directive"; readonly directive: DirectiveMatch }
  | { readonly rule: "none" }

/** The range of `ranges` that holds `offset`, if one does. */
function rangeHolding(
  ranges: readonly Range[],
  offset: number,
): Range | undefined {
  return ranges.find((range) => range[0] <= offset && offset < range[1])
}

/**
 * common.md, Reading a source: the lexer of the rules every diagram shares.
 * It reads the source from `start`, the position after the frontmatter
 * trivia, which `parse()` decides once at the start of the source, and
 * builds no rewritten text.
 *
 * It offers three things. {@link SourceLexer.lineEntries} walks the comment
 * regions and line segments for detection. {@link SourceLexer.readAt} reads
 * the text from any offset as a diagram's token rules read it, through
 * comment regions and the `;` that the line rule ignores; the diagram text
 * reader of `diagram-text.ts` builds on it. {@link SourceLexer.recordTokens}
 * walks the source once from `start` to the end and records the three lists
 * of ast.md (`tokens`, `comments`, `directives`): the tokens of the
 * frontmatter;
 * the tokens that a diagram's parser found, cut at the directives, each
 * checked; the comment regions and directives between them, with a
 * `Directive` token for each directive outside every token and comment;
 * and each `;` that the line rule ignores and that lies in no token. Only
 * whitespace and line terminators are passed without being in a list.
 *
 * The decisions of items 1 to 3 (where the comment regions and the line
 * segments are, which `;` the line rule ignores, and where the directives
 * are) come from one look-ahead per comment start
 * ({@link lookAheadFromCommentStart}), a pure function that the lexer runs
 * forward from the start of the text as far as any read needs it and whose
 * results it keeps as {@link LineEntry} values. No position is judged for a
 * directive twice.
 *
 * For agentflow, item 1 does not apply (its lexer reads comment lines
 * itself); the switch belongs in {@link SourceLexer.decideEntries}, which
 * would then ask the look-ahead for line segments only.
 */
export class SourceLexer {
  public readonly text: string

  /** The position table: lines and columns of offsets. */
  public readonly lines: LineIndex

  /** Where the reading starts: the first position the rules apply to. The lexer never reads a position before it. */
  public readonly start: number

  /** Every token recorded, in source order. */
  private readonly tokensRead: Token[] = []

  /** Every comment recorded, in source order. */
  private readonly commentsRead: Comment[] = []

  /** Every directive recorded, in source order. */
  private readonly directivesRead: Directive[] = []

  /** Whether {@link SourceLexer.recordTokens} has run; it runs once. */
  private recorded = false

  /** HTML attribute quotes: the set of the `"` characters read as `'`, found from `start` to the end before reading. */
  private readonly attributeQuotes: ReadonlySet<number>

  /** The decided entries, in source order. */
  private readonly entries: LineEntry[] = []

  /** The comment start where the next entry begins, or the end of the source. */
  private nextEntryStart: number

  /**
   * Reads `text` from `start`. The constructor only builds the two tables
   * that reading needs before it starts: the positions of lines, and the
   * HTML attribute quotes, which the specification finds in the text from
   * `start` to the end, because a tag can start far before the `"` it
   * changes.
   */
  public constructor(text: string, start: number) {
    if (!Number.isInteger(start) || start < 0 || start > text.length) {
      throw new Error(
        `mmd-toolkit parser bug: a lexer starts at ${start}, outside the source of length ${text.length}`,
      )
    }
    this.text = text
    this.lines = new LineIndex(text)
    this.attributeQuotes = findAttributeQuotes(text, start)
    this.start = start
    this.nextEntryStart = start
  }

  /** ast.md, Root: every token recorded, in source order. */
  public get tokens(): readonly Token[] {
    return this.tokensRead
  }

  /** ast.md, Root: every comment recorded, in source order. */
  public get comments(): readonly Comment[] {
    return this.commentsRead
  }

  /** ast.md, Root: every directive recorded, in source order. */
  public get directives(): readonly Directive[] {
    return this.directivesRead
  }

  /**
   * The entries decided so far and those still to decide, in source order,
   * as detection walks the source.
   */
  public *lineEntries(): Generator<LineEntry> {
    for (let index = 0; ; index += 1) {
      while (index >= this.entries.length) {
        if (!this.decideEntries()) return
      }
      yield this.entries[index]
    }
  }

  /**
   * ast.md, Nodes: the text of the range from `start` to `end`: its source
   * text without the directives, the comment regions, and the `;` that the
   * line rule ignores, and without `leftOut`, the ranges that the node's
   * type leaves out as well, such as the delimiters of a string, in source
   * order. Nothing is converted: line
   * terminators, attribute quotes, and entities stay as written.
   */
  public textOfRange(
    start: number,
    end: number,
    leftOut: readonly Range[],
  ): string {
    let text = ""
    let offset = start
    while (offset < end) {
      const found = this.ruleAt(offset)
      const leftOutRange = rangeHolding(leftOut, offset)
      if (leftOutRange !== undefined) {
        offset = leftOutRange[1]
      } else if (found.rule === "region") {
        offset = found.entry.end
      } else if (found.rule === "directive") {
        offset = found.directive.range[1]
      } else if (found.rule === "ignored-semicolon") {
        offset += 1
      } else {
        const next = this.characterEnd(offset)
        text += this.text.slice(offset, next)
        offset = next
      }
    }
    return text
  }

  /**
   * common.md, Leading whitespace: where the first character of the text is
   * that is not whitespace, a line terminator, part of a directive, or part
   * of a comment region; the end of the source when there is none.
   */
  public firstTokenStart(): number {
    let offset = this.start
    while (offset < this.text.length) {
      const found = this.ruleAt(offset)
      if (found.rule === "region") {
        offset = found.entry.end
      } else if (found.rule === "directive") {
        offset = found.directive.range[1]
      } else if (found.rule === "none" && this.isWhitespaceAt(offset)) {
        // One character at a time, so that the rules are asked again at
        // the comment start after a line terminator.
        offset = this.characterEnd(offset)
      } else {
        return offset
      }
    }
    return this.text.length
  }

  /**
   * Reading a source, item 4: what the text holds from `offset`, at or after
   * `start`, as a diagram's token rules read it. The lexer reads through
   * comment regions and ignored `;` characters as if they were not there,
   * and reports the character after them in converted form, with where it
   * starts. Where a directive comes first it reports the directive with its
   * range. After the last character of the source the lexer reads one more
   * `\n`. An offset inside a comment region is a bug of the caller.
   */
  public readAt(offset: number): ReadElement {
    if (offset < this.start) {
      throw new Error(
        this.bug(`a read at ${offset}, before the start at ${this.start}`),
      )
    }
    let current = offset
    for (;;) {
      if (current >= this.text.length) {
        return {
          kind: "character",
          text: "\n",
          start: this.text.length,
          end: this.text.length,
          endOfText: true,
          placeholderEnd: null,
        }
      }
      const found = this.ruleAt(current)
      if (found.rule === "region") {
        current = found.entry.end
        continue
      }
      if (found.rule === "ignored-semicolon") {
        current += 1
        continue
      }
      if (found.rule === "directive") {
        return {
          kind: "directive",
          start: current,
          end: found.directive.range[1],
        }
      }
      const terminatorEnd = lineTerminatorEnd(this.text, current)
      if (terminatorEnd !== null) {
        return {
          kind: "character",
          text: "\n",
          start: current,
          end: terminatorEnd,
          endOfText: false,
          placeholderEnd: null,
        }
      }
      if (this.isAttributeQuote(current)) {
        return {
          kind: "character",
          text: String.fromCodePoint(APOSTROPHE),
          start: current,
          end: current + 1,
          endOfText: false,
          placeholderEnd: null,
        }
      }
      const entityDelimiter = this.entityDelimiterAt(current)
      if (entityDelimiter !== null) {
        return {
          kind: "character",
          text: entityDelimiter.text,
          start: current,
          end: current + 1,
          endOfText: false,
          placeholderEnd: entityDelimiter.placeholderEnd,
        }
      }
      const next = nextOffset(this.text, current)
      return {
        kind: "character",
        text: this.text.slice(current, next),
        start: current,
        end: next,
        endOfText: false,
        placeholderEnd: null,
      }
    }
  }

  /**
   * ast.md, Tokens and Invariants: records the tokens of a diagram, `tokens`,
   * in source order, walking the source once from `start` to the end, after the
   * tokens of `frontmatter`, the frontmatter before `start`, when there is one
   * (see `frontmatterTokensOf`). On the way it records each comment region's
   * directives and comment and each directive, with a `Directive` token for
   * each directive outside every token and comment, and passes whitespace and
   * line terminators. A token with a directive or a comment region between two
   * of its characters that are not whitespace is recorded as its pieces
   * (common.md, A directive is a token boundary; ast.md, Comment), and the
   * comment regions between the pieces lie outside every token. The pieces of a
   * `String` token are `StringFragment` tokens. A `;` that the line rule
   * ignores and that lies in none of the tokens is a token of its own, of the
   * kind `ignoredSemicolonKindAt` of its offset, which the diagram gives a `;`
   * that stands alone at its place. The end of every token is checked (see
   * {@link SourceLexer.endOfPiece}), and a character that is not whitespace and
   * lies in no token is a bug of the diagram's parser.
   */
  public recordTokens(
    tokens: readonly PendingToken[],
    diagramComments: readonly DiagramComment[],
    ignoredSemicolonKindAt: (offset: number) => DiagramTokenKind,
    frontmatter: Frontmatter | null,
  ): void {
    if (this.recorded)
      throw new Error(this.bug("the tokens are recorded twice"))
    this.recorded = true
    if (frontmatter !== null) {
      for (const token of frontmatterTokensOf(this.text, frontmatter)) {
        this.recordToken(token.range, token.kind)
      }
    }
    /** How many of `tokens` are recorded whole. */
    let recorded = 0
    /** The pieces of the token `tokens[recorded]`, once its first piece is reached. */
    let pieces: readonly Range[] | null = null
    /** How many of `pieces` are recorded. */
    let piecesRecorded = 0
    /** How many of `diagramComments` are recorded. */
    let commentsRecorded = 0
    let offset = this.start
    while (offset < this.text.length) {
      const diagramComment = diagramComments.at(commentsRecorded)
      if (diagramComment?.range[0] === offset) {
        offset = this.recordDiagramComment(
          diagramComment,
          ignoredSemicolonKindAt,
        )
        commentsRecorded += 1
        continue
      }
      const found = this.ruleAt(offset)
      if (found.rule === "region") {
        this.recordCommentRegion(found.entry)
        offset = found.entry.end
        continue
      }
      if (found.rule === "directive") {
        this.recordDirective(found.directive, "token")
        offset = found.directive.range[1]
        continue
      }
      if (found.rule === "ignored-semicolon") {
        this.recordToken([offset, offset + 1], ignoredSemicolonKindAt(offset))
        offset += 1
        continue
      }
      if (this.isWhitespaceAt(offset)) {
        offset = this.characterEnd(offset)
        continue
      }
      const token = tokens.at(recorded)
      if (token !== undefined && pieces === null && token.range[0] === offset) {
        pieces = this.piecesOf(token.range)
      }
      const piece = pieces?.[piecesRecorded]
      if (token === undefined || pieces === null || piece?.[0] !== offset) {
        throw new Error(this.bug(`the character at ${offset} is in no token`))
      }
      this.recordToken(piece, pieceKindOf(token.kind, pieces.length))
      offset = piece[1]
      piecesRecorded += 1
      if (piecesRecorded === pieces.length) {
        recorded += 1
        pieces = null
        piecesRecorded = 0
      }
    }
    if (commentsRecorded !== diagramComments.length) {
      throw new Error(
        this.bug(
          `the diagram comment at ${diagramComments[commentsRecorded].range[0]} does not start where the lexer passes`,
        ),
      )
    }
    if (recorded !== tokens.length) {
      throw new Error(
        this.bug(
          `the source ends before the end of the token at ${tokens[recorded].range[0]}`,
        ),
      )
    }
  }

  /**
   * common.md, A directive is a token boundary, and ast.md, Tokens and
   * Comment: the pieces of the token whose range is `range`, in source
   * order, each the range of a token that is recorded. A token that has a
   * directive or a comment region between two of its characters that are
   * not whitespace is cut there, and each piece is a part without the
   * whitespace and line terminators at its ends; a part that is all
   * whitespace is no piece, and a token without such a cut is one piece,
   * its range. A piece starts at the first character of the diagram text
   * that is not whitespace, after the directives, comment regions, and
   * whitespace before it (see {@link SourceLexer.endOfPiece} for its end).
   */
  private piecesOf(range: Range): Range[] {
    const pieces: Range[] = []
    let offset = range[0]
    while (offset < range[1]) {
      const element = this.readAt(offset)
      if (element.kind === "directive" || isWhitespaceCharacter(element)) {
        offset = element.end
        continue
      }
      const end = this.endOfPiece(element.start, range[1])
      pieces.push([element.start, end])
      offset = end
    }
    if (pieces.length === 0) {
      throw new Error(
        this.bug(`the token from ${range[0]} to ${range[1]} has no character`),
      )
    }
    return pieces
  }

  /**
   * common.md, A directive is a token boundary, and ast.md, Tokens,
   * Comment, and Invariants: the end of the piece of a token that starts at
   * `start`, in the token that ends at `tokenEnd`. A token that has a
   * directive or a comment region between two of its characters that are
   * not whitespace is cut there, and each piece, without the whitespace at
   * its ends, is a token. The piece is read as the token rules read it, and
   * its end is the end of its last character that is not whitespace before
   * the next directive or comment region, or `tokenEnd` when none follows
   * in the token.
   *
   * The end is found by reading, so it is always the end of a character of
   * the diagram text that is not whitespace: at a character boundary, not
   * inside a line terminator or a comment region, after no directive, and
   * not at a `;` that the line rule ignores, which the reading passes. A
   * token whose end is not such an end, because it ends with whitespace, a
   * line terminator, a comment region, or an ignored `;`, inside a character,
   * or after the end of the text, is a bug of the diagram's parser.
   */
  private endOfPiece(start: number, tokenEnd: number): number {
    let end = start
    let offset = start
    while (offset < tokenEnd) {
      if (this.regionStartsAt(offset)) return end
      const element = this.readAt(offset)
      if (element.kind === "directive") return end
      if (element.endOfText) break
      if (!isWhitespaceCharacter(element)) end = element.end
      offset = element.end
    }
    if (end !== tokenEnd) {
      throw new Error(
        this.bug(
          `the token from ${start} to ${tokenEnd} does not end with a character of the diagram text that is not whitespace`,
        ),
      )
    }
    return end
  }

  /**
   * ast.md, Comment: whether a comment region starts at `offset`, where the
   * reading of a token goes on, also after the `;` characters that the line
   * rule ignores there. The reading passes a comment region as a whole, so
   * that it starts at the end of a character that was read.
   */
  private regionStartsAt(offset: number): boolean {
    let current = offset
    for (;;) {
      if (current >= this.text.length) return false
      const found = this.ruleAt(current)
      if (found.rule === "region") return true
      if (found.rule !== "ignored-semicolon") return false
      current += 1
    }
  }

  /** Records the token of kind `kind` at `range`. */
  private recordToken(range: Range, kind: TokenKind): void {
    this.tokensRead.push({
      type: kind,
      value: this.text.slice(...range),
      range,
      loc: this.lines.location(range),
    })
  }

  /** Whether the character at `offset` is whitespace or part of a line terminator. */
  private isWhitespaceAt(offset: number): boolean {
    const codePoint = this.text.codePointAt(offset)
    return codePoint !== undefined && isWhitespace(codePoint)
  }

  /** The offset after the character at `offset`, with a line terminator counted as one character. */
  private characterEnd(offset: number): number {
    return lineTerminatorEnd(this.text, offset) ?? nextOffset(this.text, offset)
  }

  /**
   * Reading a source: the rule that applies at `offset`, judged in one
   * place: a comment region at its start, a `;` that the line rule ignores, a
   * directive, or none. A position inside a comment region is never asked
   * about, because a region is passed as a whole.
   */
  private ruleAt(offset: number): RuleAtPosition {
    const entry = this.entryAt(offset)
    if (entry === null) return { rule: "none" }
    if (entry.kind === "region") {
      if (offset !== entry.start) {
        throw new Error(
          this.bug(`a read inside the comment region at ${entry.start}`),
        )
      }
      return { rule: "region", entry }
    }
    if (entry.ignoredSemicolons.has(offset)) {
      return { rule: "ignored-semicolon" }
    }
    const directive = entry.directives.get(offset)
    if (directive !== undefined) return { rule: "directive", directive }
    return { rule: "none" }
  }

  /**
   * Decides the entries that the look-ahead from the comment start at
   * `nextEntryStart` gives: one comment region, or line segments up to the
   * separator where the look-ahead stopped. Returns false at the end of the
   * source.
   */
  private decideEntries(): boolean {
    const start = this.nextEntryStart
    if (start >= this.text.length) return false
    const entries = lookAheadFromCommentStart(this.text, start)
    this.entries.push(...entries)
    const last = entries[entries.length - 1]
    if (last.kind === "region") {
      this.nextEntryStart = last.end
    } else {
      // The separator after the last segment: a line terminator, or U+2028 or
      // U+2029.
      this.nextEntryStart =
        last.end >= this.text.length
          ? this.text.length
          : (lineTerminatorEnd(this.text, last.end) ?? last.end + 1)
    }
    return true
  }

  /**
   * The entry that covers `offset`, deciding entries forward as far as
   * needed, or null before the text starts, at a separator, or at the end.
   */
  private entryAt(offset: number): LineEntry | null {
    if (offset < this.start || offset >= this.text.length) return null
    while (this.nextEntryStart <= offset && this.decideEntries()) {
      // Decide until an entry reaches past the offset.
    }
    // Binary search for the last entry that starts at or before the offset.
    let low = 0
    let high = this.entries.length - 1
    while (low < high) {
      const middle = Math.ceil((low + high) / 2)
      if (this.entries[middle].start <= offset) {
        low = middle
      } else {
        high = middle - 1
      }
    }
    const entry = this.entries[low]
    return entry !== undefined && entry.start <= offset && offset < entry.end
      ? entry
      : null
  }

  /**
   * Entities: what the lexer reads in place of the character at `offset`
   * when it is the `#` or the `;` of an entity: the opening or the closing
   * of the placeholder. Returns null for every other character.
   */
  private entityDelimiterAt(offset: number): EntityDelimiter | null {
    const entry = this.entryAt(offset)
    if (entry === null || entry.kind !== "segment") return null
    return entry.entityDelimiters.get(offset) ?? null
  }

  /** HTML attribute quotes: whether the `"` at `offset` is read as `'`. */
  private isAttributeQuote(offset: number): boolean {
    return this.attributeQuotes.has(offset)
  }

  /**
   * ast.md, Directive: records the `Directive` of one match of the directive
   * scan, `directive`, and, when `token` is `"token"`, its `Directive` token
   * with the same range. The range is the match without the whitespace at
   * its end, which an unclosed directive can take after its argument; that
   * whitespace is whitespace of the tree. The value of an unclosed
   * directive runs to the end of the range.
   */
  private recordDirective(
    directive: DirectiveMatch,
    token: "token" | "no-token",
  ): void {
    const [start, matchEnd] = directive.range
    const end = skipBackWhile(this.text, matchEnd, isWhitespace)
    const range: Range = [start, end]
    const valueStart = directive.valueRange[0]
    const valueEnd = directive.closed ? directive.valueRange[1] : end
    this.directivesRead.push({
      type: "Directive",
      name: directive.name,
      value: this.text.slice(valueStart, valueEnd),
      closed: directive.closed,
      range,
      loc: this.lines.location(range),
    })
    if (token === "token") this.recordToken(range, "Directive")
  }

  /**
   * Comment lines, and ast.md, Comment and Directive: adds what a comment
   * region holds to the lists, in source order: its directives, those
   * before the comment's `%%` and those inside the comment, and its comment.
   * A comment region lies outside every token, also where it cuts one. A
   * directive before the comment's `%%` lies outside the comment and is a
   * `Directive` token; a directive inside the comment is part of it. The
   * whitespace and line terminators of the region are in no list.
   */
  private recordCommentRegion(region: CommentRegionEntry): void {
    for (const directive of region.directives.values()) {
      const beforeComment = directive.range[0] < region.comment[0]
      this.recordDirective(directive, beforeComment ? "token" : "no-token")
    }
    const end = region.comment[1]
    this.commentsRead.push({
      type: "Comment",
      mark: "%%",
      value: this.text.slice(region.afterMarker, end),
      range: region.comment,
      loc: this.lines.location(region.comment),
    })
  }

  /**
   * ast.md, Comment and Directive: records the diagram comment `comment`,
   * which a diagram's own lexer found, with the directives inside it, which
   * are part of the comment and have no token of their own, and the comment
   * regions inside it, in source order, and returns where its line ends.
   *
   * A comment region on its line, after U+2028 or U+2029, cuts the comment
   * as it cuts a token: each fragment, the text before a region or after
   * it without the whitespace and line terminators at its ends, is a
   * `Comment`, and a fragment that is empty or all whitespace is none. The
   * first fragment starts at the mark and has the comment's mark and the
   * value after it; a fragment after a region has no mark, and the value of
   * its range.
   *
   * The comment ends where its line ends, as `commentEnd` says, except
   * that a `;` that the line rule ignores and that is its last character
   * lies outside it, as a token of its own of the kind
   * `ignoredSemicolonKindAt` gives: the comment is found as if that `;` were
   * not there. That is decided on the whole comment, before the regions cut
   * it, so a `;` with characters of the comment after it on its line, a
   * U+2028 or U+2029 before a region among them, lies inside.
   */
  private recordDiagramComment(
    comment: DiagramComment,
    ignoredSemicolonKindAt: (offset: number) => DiagramTokenKind,
  ): number {
    const [start, lineEnd] = comment.range
    const directives: DirectiveMatch[] = []
    const regions: CommentRegionEntry[] = []
    let offset = start
    while (offset < lineEnd) {
      const found = this.ruleAt(offset)
      if (found.rule === "region") {
        regions.push(found.entry)
        offset = found.entry.end
      } else if (found.rule === "directive") {
        directives.push(found.directive)
        offset = found.directive.range[1]
      } else {
        offset = this.characterEnd(offset)
      }
    }
    const fragments: Range[] = []
    let fragmentStart = start
    for (const region of regions) {
      const fragmentEnd = skipBackWhile(this.text, region.start, isWhitespace)
      if (fragmentEnd > fragmentStart)
        fragments.push([fragmentStart, fragmentEnd])
      fragmentStart = Math.min(
        skipWhile(this.text, region.end, isWhitespace),
        lineEnd,
      )
    }
    // Whether a `;` that the line rule ignores lies inside the comment is
    // decided on the whole comment, before the regions cut it: only its
    // last character, at the end of the line, lies outside.
    const lastEnd = commentEnd(this.text, fragmentStart, lineEnd)
    const semicolon = lastEnd - 1
    const endsWithIgnoredSemicolon =
      lastEnd > fragmentStart &&
      this.ruleAt(semicolon).rule === "ignored-semicolon"
    const end = endsWithIgnoredSemicolon ? semicolon : lastEnd
    if (end > fragmentStart) fragments.push([fragmentStart, end])
    const parts: DiagramCommentPart[] = [
      ...directives.map((directive): DiagramCommentPart => ({
        kind: "directive",
        at: directive.range[0],
        directive,
      })),
      ...regions.map((region): DiagramCommentPart => ({
        kind: "region",
        at: region.start,
        region,
      })),
      ...fragments.map((fragment): DiagramCommentPart => ({
        kind: "fragment",
        at: fragment[0],
        range: fragment,
      })),
      ...(endsWithIgnoredSemicolon
        ? [{ kind: "semicolon", at: semicolon } as const]
        : []),
    ]
    parts.sort((a, b) => a.at - b.at)
    for (const part of parts) {
      switch (part.kind) {
        case "directive":
          this.recordDirective(part.directive, "no-token")
          break
        case "region":
          this.recordCommentRegion(part.region)
          break
        case "fragment":
          this.recordCommentFragment(part.range, comment)
          break
        case "semicolon":
          this.recordToken(
            [part.at, part.at + 1],
            ignoredSemicolonKindAt(part.at),
          )
          break
        default:
          throw new Error(
            this.bug(
              `unknown part of a diagram comment ${JSON.stringify(part satisfies never)}`,
            ),
          )
      }
    }
    return lineEnd
  }

  /**
   * Records the fragment `range` of the diagram comment `comment`. The
   * fragment that starts at the comment's mark has the mark and the value
   * after it; a fragment after a comment region has no mark, and the value
   * of its range.
   */
  private recordCommentFragment(range: Range, comment: DiagramComment): void {
    const startsAtMark = range[0] === comment.range[0]
    this.commentsRead.push({
      type: "Comment",
      mark: startsAtMark ? comment.mark : null,
      value: this.text.slice(
        startsAtMark ? comment.valueStart : range[0],
        range[1],
      ),
      range,
      loc: this.lines.location(range),
    })
  }

  /** The message of an error for a broken invariant of this lexer. */
  private bug(what: string): string {
    return `mmd-toolkit parser bug: ${what}`
  }
}
