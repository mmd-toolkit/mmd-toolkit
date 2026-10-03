import type { Comment, Directive, Root, Token } from "@mmd-toolkit/parser"

/**
 * A comment or a `Directive` token: text that belongs to no node, which the
 * printers print as written between the things they print (ast.md, Tokens,
 * and Comments, directives, and frontmatter).
 */
export type Trivia = Comment | Token

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
   * The offsets of the line feeds that the joining regions remove: the
   * line feeds that mermaid.js does not read, so that the lines they end
   * go on. A region at the end of the text, with nothing after it to join,
   * removes none.
   */
  readonly removedLineFeeds: ReadonlySet<number>
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
function joinCommentFragments(text: string, root: Root): Comment[] {
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

  const joined: Comment[] = []
  for (const [index, comment] of comments.entries()) {
    if (comment.mark !== null) {
      joined.push(comment)
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
    let start = comments[first]
    while (
      joined.length > 0 &&
      joined[joined.length - 1].range[1] > start.range[0]
    ) {
      const overlapped = joined.pop() as Comment
      if (overlapped.range[0] < start.range[0]) start = overlapped
    }
    joined.push({
      ...start,
      range: [start.range[0], comment.range[1]],
      loc: { start: start.loc.start, end: comment.loc.end },
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
 * Makes the U+2028 or U+2029 that stops a directive that is not closed part
 * of it. The text of such a directive stops before the character
 * (common.md, Directives), which is no whitespace to it: with the character
 * printed as whitespace, the text of the directive would reach past it.
 */
function includeStoppingCharacter(
  text: string,
  directive: Token,
  directives: readonly Directive[],
): Token {
  const next = text[directive.range[1]]
  const record = directives.find(
    (candidate) => candidate.range[0] === directive.range[0],
  )
  if (record?.closed !== false || (next !== "\u2028" && next !== "\u2029")) {
    return directive
  }
  return {
    ...directive,
    range: [directive.range[0], directive.range[1] + 1],
    loc: {
      start: directive.loc.start,
      end: {
        line: directive.loc.end.line,
        column: directive.loc.end.column + 1,
      },
    },
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
  comment: Comment,
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

/** The offsets of the line feeds that the regions remove. */
function findRemovedLineFeeds(
  text: string,
  regions: readonly JoiningRegion[],
): ReadonlySet<number> {
  const removed = new Set<number>()
  for (const region of regions) {
    if (!region.hasTextAfter) continue
    for (let offset = region.start; offset < region.end; offset++) {
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
    .map((token) => includeStoppingCharacter(text, token, root.directives))
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
    removedLineFeeds: findRemovedLineFeeds(text, joiningRegions),
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
