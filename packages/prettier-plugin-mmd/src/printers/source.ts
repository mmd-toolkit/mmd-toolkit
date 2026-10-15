import type {
  Comment,
  Directive,
  Range,
  Root,
  Token,
} from "@mmd-toolkit/parser"

/**
 * A comment as the printers read it: its kind, its range, and its mark. A
 * comment that a comment line cuts is one comment here, over the range of all
 * its parts (see `joinCommentFragments`).
 */
export interface TriviaComment {
  readonly type: "Comment"
  readonly range: Range
  readonly mark: Comment["mark"]
}

/**
 * A directive as the printers read it: its kind and its range, which takes
 * the whitespace after a directive that is not closed when that holds a
 * U+2028 or U+2029 (see `extendDirective`).
 */
export interface TriviaDirective {
  readonly type: "Directive"
  readonly range: Range
}

/**
 * A comment or a directive: text that belongs to no node, which the printers
 * print as written between the things they print (ast.md, Tokens, and
 * Comments, directives, and frontmatter). They are the printers' own records,
 * not the tokens and comments of the parser: the range of a directive or of a
 * joined comment is not the range of the parser's token or comment, so a
 * parser's token with another range would give a `value` and a `loc` that no
 * longer fit.
 */
export type Trivia = TriviaComment | TriviaDirective

/**
 * What a diagram printer reads besides the tree: the source text, the root
 * with its lists, and the comments and directives merged in source order.
 */
export interface Source {
  readonly text: string
  readonly root: Root
  /**
   * `Root.comments` and the `Directive` tokens of `Root.tokens`, merged in
   * source order. The directives are taken from the tokens, not from
   * `Root.directives`: the tokens hold exactly the directives that lie
   * outside the tokens and comments, with the same ranges, so every scan of
   * the text reads one list of what it covers.
   */
  readonly trivia: readonly Trivia[]
  /**
   * The offsets of the `;` that the line rule ignores (common.md, The
   * `style` and `classDef` lines): the `IgnoredSemicolon` tokens of the
   * tree. A `;` that lies in a comment is no token, and is read with the
   * comment.
   */
  readonly ignoredSemicolons: ReadonlySet<number>
  /**
   * The comment regions that join lines (see `JoiningRegion`), in source
   * order.
   */
  readonly joiningRegions: readonly JoiningRegion[]
  /**
   * The offsets of the line feeds that mermaid.js does not read as line
   * ends, so that the lines they end go on: the line feeds that the joining
   * regions remove, and the ones in the whitespace after a directive that is
   * not closed. Whitespace at the end of the text, with nothing after it to
   * join, removes none.
   */
  readonly removedLineFeeds: ReadonlySet<number>
  /**
   * Whether a diagram comment ends at a U+2028 or a U+2029, so that the text
   * after it is a new line: the lexer of a mindmap ends it at the end of its
   * line segment (diagrams/mindmap.md, Comments). The comment of the other
   * diagram types runs to the line feed, and a U+2028 or U+2029 after it is
   * whitespace to be printed as such.
   */
  readonly commentsEndAtLineSeparators: boolean
}

/**
 * A comment region that joins lines. mermaid.js removes every comment region
 * from the text before it reads it: a comment line `%%` with the
 * whitespace-only lines and directives before it, and the line terminator
 * that ends it (common.md, Comment). When the region starts right after a
 * U+2028 or U+2029, or right where a region that joins ends, the text before
 * it and the text after it become one line. Only a comment with the mark `%%`
 * makes a region: a `#` comment is read by the lexer of its diagram.
 */
export interface JoiningRegion {
  /** The comment line of the region. */
  readonly comment: Comment
  /** Where the region starts: after the earliest comment start before the comment. */
  readonly start: number
  /** Where the region ends: after the line terminator of the comment, if there is one. */
  readonly end: number
  /** Whether anything but whitespace follows the region, to be joined to what comes before. */
  readonly hasTextAfter: boolean
}

/**
 * Whether a character is whitespace as common.md defines it (Notation):
 * U+0009 to U+000D, U+0020, U+00A0, U+1680, U+2000 to U+200A, U+2028,
 * U+2029, U+202F, U+205F, U+3000, and U+FEFF. `String.prototype.trim`
 * removes exactly this set: the characters of the Unicode category Zs, the
 * other ECMAScript whitespace, and the line terminators. If a later Unicode
 * version adds a character to Zs, the two sets differ.
 */
export function isWhitespace(character: string): boolean {
  return character.trim() === ""
}

/**
 * The length of the line terminator that starts at `offset`: 2 for `\r\n`, 1
 * for a lone `\r` or `\n`, and 0 where none starts.
 */
export function lineTerminatorLengthAt(text: string, offset: number): number {
  if (text.startsWith("\r\n", offset)) return 2
  return text[offset] === "\r" || text[offset] === "\n" ? 1 : 0
}

/** The comment as the printers read it. */
function toTriviaComment(comment: Comment): TriviaComment {
  return { type: "Comment", mark: comment.mark, range: comment.range }
}

/**
 * Joins the comments of a diagram comment that a comment line cuts: a
 * diagram comment goes on past a comment line that follows U+2028 or
 * U+2029 on its line, and the tree lists the comment, the comment line, and
 * the text after it, a comment with no mark, as comments (ast.md, Comment).
 * Their text and what lies between them is one text for a printer: a
 * U+2028 or U+2029, or a line break, in another place would end the diagram
 * comment, and the text after the comment line would be read as part of the
 * diagram. The comments from the first one before a U+2028 or U+2029 up to
 * a comment with no mark become one comment, which is printed as written.
 */
function joinCommentFragments(text: string, root: Root): TriviaComment[] {
  const { comments } = root

  /** The text between the comment before `index` and the comment at `index`. */
  function gapBefore(index: number): readonly [number, number] {
    return [comments[index - 1].range[1], comments[index].range[0]]
  }

  /** Whether a U+2028 or U+2029 lies in the gap before the comment at `index`. */
  function hasSeparatorBefore(index: number): boolean {
    const gap = text.slice(...gapBefore(index))
    return gap.includes("\u2028") || gap.includes("\u2029")
  }

  const joined: TriviaComment[] = []
  for (const [index, comment] of comments.entries()) {
    if (comment.mark !== null) {
      joined.push(toTriviaComment(comment))
      continue
    }
    // Back from the text after the comment line, over the comment lines and
    // what lies between them, to the diagram comment that was cut: the
    // comment before the first U+2028 or U+2029 that no comment line
    // follows after another one.
    let first = Math.max(index - 1, 0)
    while (first > 0 && isBlank(text, root, ...gapBefore(first))) {
      const separated = hasSeparatorBefore(first)
      first--
      if (separated && !(first > 0 && hasSeparatorBefore(first))) break
    }
    let start = toTriviaComment(comments[first])
    while (
      joined.length > 0 &&
      joined[joined.length - 1].range[1] > start.range[0]
    ) {
      const overlapped = joined.pop() as TriviaComment
      if (overlapped.range[0] < start.range[0]) start = overlapped
    }
    joined.push({
      type: "Comment",
      mark: start.mark,
      range: [start.range[0], comment.range[1]],
    })
  }
  return joined
}

/** Whether the text from `start` to `end` holds nothing but whitespace and directives. */
function isBlank(
  text: string,
  root: Root,
  start: number,
  end: number,
): boolean {
  for (let offset = start; offset < end; offset++) {
    const covered = root.tokens.some(
      (token) =>
        token.type === "Directive" &&
        token.range[0] <= offset &&
        offset < token.range[1],
    )
    if (!covered && !isWhitespace(text[offset])) return false
  }
  return true
}

/**
 * The whitespace that a directive that is not closed takes after its
 * argument, or `undefined` for a directive that is closed: the scan of such
 * a directive takes all the whitespace that follows, line breaks included
 * (common.md, Where a directive is). The whitespace is no part of the range
 * of the directive. `runsToEnd` says that it runs to the end of the text, and
 * joins nothing.
 */
function findTakenWhitespace(
  text: string,
  directive: Directive,
): { start: number; end: number; runsToEnd: boolean } | undefined {
  if (directive.closed) return undefined
  const start = directive.range[1]
  let end = start
  while (end < text.length && isWhitespace(text[end])) end++
  return { start, end, runsToEnd: end === text.length }
}

/**
 * Makes the directive as the printers read it. The whitespace that a
 * directive that is not closed takes is part of it when it holds a U+2028 or
 * U+2029. The free text of its argument stops before such a character, which
 * is no whitespace to it (common.md, Where a directive is): with the
 * character printed as a space, the argument would reach past it, and take
 * the statements that follow, up to the next `}%%` or the end of the text. So
 * the whitespace is printed as written, with the directive. Whitespace that
 * runs to the end of the text joins nothing, so only what reaches its last
 * U+2028 or U+2029 matters there.
 */
function extendDirective(
  text: string,
  directive: Token,
  directives: readonly Directive[],
): TriviaDirective {
  const record = directives.find(
    (candidate) => candidate.range[0] === directive.range[0],
  )
  const taken = record && findTakenWhitespace(text, record)
  const lastStop =
    taken === undefined
      ? -1
      : Math.max(
          text.lastIndexOf("\u2028", taken.end - 1),
          text.lastIndexOf("\u2029", taken.end - 1),
        )
  if (taken === undefined || lastStop < taken.start) {
    return { type: "Directive", range: directive.range }
  }
  return {
    type: "Directive",
    range: [directive.range[0], taken.runsToEnd ? lastStop + 1 : taken.end],
  }
}

/**
 * Whether a comment with the mark `%%` is a comment line in the sense of
 * mermaid.js (common.md, Comment lines): the first character after the `%%`
 * that is not part of a directive exists, is not `{`, and is not part of a
 * line terminator. A line with only `%%`, and one that starts with `%%{`
 * without being a directive, are comments of the tree (common.md, Comment
 * lines, and diagrams/class.md) that mermaid.js does not remove with the
 * comment lines.
 */
export function isCommentLine(
  text: string,
  root: Root,
  comment: Pick<Comment, "mark" | "range">,
): boolean {
  if (comment.mark !== "%%") return false
  const [start, end] = comment.range
  let withoutDirectives = ""
  let position = start
  for (const directive of root.directives) {
    if (directive.range[0] < start || end < directive.range[1]) continue
    withoutDirectives += text.slice(position, directive.range[0])
    position = directive.range[1]
  }
  withoutDirectives += text.slice(position, end)
  const next = withoutDirectives[2]
  return next !== undefined && next !== "{" && next !== "\r" && next !== "\n"
}

/**
 * Finds the comment regions that join lines (see `JoiningRegion`).
 *
 * The region of a comment starts at the earliest comment start from which
 * only whitespace and directives lead to the `%%` (common.md, Comment): a
 * comment start is the start of the text, or the position right after a line
 * terminator, U+2028, or U+2029 that is not part of a directive. Whitespace is
 * no node of the tree, so it is read from the text here, and only here.
 */
function findJoiningRegions(
  text: string,
  root: Root,
): readonly JoiningRegion[] {
  const directives = root.tokens.filter((token) => token.type === "Directive")
  const directiveStartByEnd = new Map(
    directives.map((token) => [token.range[1], token.range[0]]),
  )
  const directiveEndByStart = new Map(
    directives.map((token) => [token.range[0], token.range[1]]),
  )

  /** Whether the character at `offset` lies in a directive. */
  function isInDirective(offset: number): boolean {
    return directives.some(
      (token) => token.range[0] <= offset && offset < token.range[1],
    )
  }

  /** Whether a comment may start at `offset`. */
  function isCommentStart(offset: number): boolean {
    if (offset === 0) return true
    const before = text[offset - 1]
    const endsLine =
      before === "\n" ||
      (before === "\r" && text[offset] !== "\n") ||
      before === "\u2028" ||
      before === "\u2029"
    return endsLine && !isInDirective(offset - 1)
  }

  /** The earliest comment start from which only whitespace and directives lead to `offset`. */
  function findRegionStart(offset: number): number | undefined {
    let limit = offset
    for (;;) {
      const directiveStart = directiveStartByEnd.get(limit)
      if (directiveStart !== undefined) {
        limit = directiveStart
      } else if (limit > 0 && isWhitespace(text[limit - 1])) {
        limit--
      } else {
        break
      }
    }
    let position = limit
    while (position <= offset) {
      if (isCommentStart(position)) return position
      position = directiveEndByStart.get(position) ?? position + 1
    }
    return undefined
  }

  const regions: JoiningRegion[] = []
  let previousEnd = -1
  for (const comment of root.comments) {
    if (!isCommentLine(text, root, comment)) continue
    const start = findRegionStart(comment.range[0])
    if (start === undefined) continue
    const joins =
      text[start - 1] === "\u2028" ||
      text[start - 1] === "\u2029" ||
      start === previousEnd
    if (!joins) continue
    const end =
      comment.range[1] + lineTerminatorLengthAt(text, comment.range[1])
    previousEnd = end
    regions.push({
      comment,
      start,
      end,
      hasTextAfter: text.slice(end).trim() !== "",
    })
  }
  return regions
}

/**
 * The offsets of the line feeds that mermaid.js does not read as line ends:
 * the ones that a joining region removes, and the ones in the whitespace that
 * a directive that is not closed takes (see `findTakenWhitespace`), so that
 * the next line goes on the line of the directive. Whitespace that runs to
 * the end of the text joins nothing.
 */
function findRemovedLineFeeds(
  text: string,
  root: Root,
  regions: readonly JoiningRegion[],
): ReadonlySet<number> {
  const removed = new Set<number>()
  for (const region of regions) {
    if (!region.hasTextAfter) continue
    for (let offset = region.start; offset < region.end; offset++) {
      if (text[offset] === "\n") removed.add(offset)
    }
  }
  for (const directive of root.directives) {
    const taken = findTakenWhitespace(text, directive)
    if (taken === undefined || taken.runsToEnd) continue
    for (let offset = taken.start; offset < taken.end; offset++) {
      if (text[offset] === "\n") removed.add(offset)
    }
  }
  return removed
}

/**
 * Makes the printing context of a parsed document.
 */
export function createSource(text: string, root: Root): Source {
  const comments = joinCommentFragments(text, root)
  const joiningRegions = findJoiningRegions(text, root)
  const directives = root.tokens
    .filter(
      (token) =>
        token.type === "Directive" &&
        !comments.some(
          (comment) =>
            comment.range[0] <= token.range[0] &&
            token.range[1] <= comment.range[1],
        ),
    )
    .map((token) => extendDirective(text, token, root.directives))
  const trivia = [...comments, ...directives].sort(
    (a, b) => a.range[0] - b.range[0],
  )
  return {
    text,
    root,
    trivia,
    ignoredSemicolons: new Set(
      root.tokens
        .filter((token) => token.type === "IgnoredSemicolon")
        .map((token) => token.range[0]),
    ),
    joiningRegions,
    removedLineFeeds: findRemovedLineFeeds(text, root, joiningRegions),
    commentsEndAtLineSeparators: root.body.type === "MindmapDiagram",
  }
}

/**
 * Returns the token that starts at `offset`, or `undefined`.
 */
export function findTokenStartingAt(
  source: Source,
  offset: number,
): Token | undefined {
  const index = findFirstIndex(
    source.root.tokens,
    (token) => token.range[0] >= offset,
  )
  const token = source.root.tokens[index]
  return token?.range[0] === offset ? token : undefined
}

/**
 * Returns the last token that ends at or before `offset`, or `undefined`.
 */
export function findTokenEndingBefore(
  source: Source,
  offset: number,
): Token | undefined {
  const index = findFirstIndex(
    source.root.tokens,
    (token) => token.range[1] > offset,
  )
  return source.root.tokens[index - 1]
}

/**
 * Returns the first token that starts at or after `offset` and may belong to
 * the structure of a node, or `undefined`.
 *
 * The printers look for the tokens that the structure of a node implies,
 * such as the bracket that closes a shape (see `isStructural`).
 */
export function findStructuralToken(
  source: Source,
  offset: number,
): Token | undefined {
  const { tokens } = source.root
  let index = findFirstIndex(tokens, (token) => token.range[0] >= offset)
  while (index < tokens.length && !isStructural(source, tokens[index])) {
    index++
  }
  return tokens[index]
}

/**
 * Returns the last token that ends at or before `offset` and may belong to
 * the structure of a node, or `undefined` (see `findStructuralToken`).
 */
export function findStructuralTokenEndingBefore(
  source: Source,
  offset: number,
): Token | undefined {
  const { tokens } = source.root
  let index = findFirstIndex(tokens, (token) => token.range[1] > offset) - 1
  while (index >= 0 && !isStructural(source, tokens[index])) index--
  return tokens[index]
}

/**
 * Whether a token may belong to the structure of a node: a token of the
 * diagram text that is not a `Directive` token, which may lie between any
 * two tokens, as in `A%%{init: {}}%%-->B`, and not a `;`, which separates
 * statements or is ignored within one, and may also lie between any two
 * tokens, as in `A[style:#x] e;@-->B` (ast.md, Tokens). The tokens of the
 * frontmatter are not of the diagram text: its delimiters are `---`
 * punctuators, as an arrow of a flowchart link may be, so they are told
 * apart by the range of the frontmatter, not by their kind or value.
 */
export function isStructural(source: Source, token: Token): boolean {
  const { frontmatter } = source.root
  const inFrontmatter =
    frontmatter !== null &&
    frontmatter.range[0] <= token.range[0] &&
    token.range[1] <= frontmatter.range[1]
  return !inFrontmatter && token.type !== "Directive" && token.value !== ";"
}

/**
 * Returns the tokens that start in `[start, end)`.
 */
export function findTokensBetween(
  source: Source,
  start: number,
  end: number,
): readonly Token[] {
  const first = findFirstIndex(
    source.root.tokens,
    (token) => token.range[0] >= start,
  )
  const afterLast = findFirstIndex(
    source.root.tokens,
    (token) => token.range[0] >= end,
  )
  return source.root.tokens.slice(first, afterLast)
}

/**
 * Returns the comments and directives that start in `[start, end)`.
 */
export function findTriviaBetween(
  source: Source,
  start: number,
  end: number,
): readonly Trivia[] {
  const first = findFirstIndex(source.trivia, (item) => item.range[0] >= start)
  const afterLast = findFirstIndex(
    source.trivia,
    (item) => item.range[0] >= end,
  )
  return source.trivia.slice(first, afterLast)
}

/** The comment that ends at `offset`, if there is one. */
export function findCommentEndingAt(
  source: Source,
  offset: number,
): Trivia | undefined {
  return source.trivia.find(
    (item) => item.type === "Comment" && item.range[1] === offset,
  )
}

/** The directive that ends at `offset`, if there is one. */
export function findDirectiveEndingAt(
  source: Source,
  offset: number,
): Trivia | undefined {
  return source.trivia.find(
    (item) => item.type === "Directive" && item.range[1] === offset,
  )
}

/**
 * Binary search over a list sorted so that `isAtOrAfter` is false for a
 * prefix and true for the rest: returns the index of the first element for
 * which it is true, or the length of the list.
 */
function findFirstIndex<T>(
  list: readonly T[],
  isAtOrAfter: (element: T) => boolean,
): number {
  let low = 0
  let high = list.length
  while (low < high) {
    const middle = (low + high) >>> 1
    if (isAtOrAfter(list[middle])) high = middle
    else low = middle + 1
  }
  return low
}
