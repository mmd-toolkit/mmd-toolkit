import type {
  DiagramBody,
  DiagramType,
  Frontmatter,
  Location,
  Range,
  Root,
} from "./ast.ts"
import type { PassedPart } from "./detection.ts"
import { DiagramTextReader } from "./diagram-text.ts"
import { ParseError } from "./errors.ts"
import type { PendingToken, SourceLexer } from "./source-lexer.ts"

/**
 * What a diagram's parser starts from: the shared lexer, which `parse()`
 * has set up and used for detection, the frontmatter, the detected diagram
 * type, and where detection left the text.
 */
export interface DiagramInput {
  readonly lexer: SourceLexer
  readonly frontmatter: Frontmatter | null
  readonly diagramType: DiagramType
  /**
   * common.md, Diagram detection: the position that detection reached,
   * where the diagram's lexer starts; the detection point for the `error`
   * pseudo-diagram.
   */
  readonly textStart: number
  /** What detection read and passed before `textStart`, in source order (see {@link commentsBeforeHeader}). */
  readonly passed: readonly PassedPart[]
}

/**
 * ast.md, Comment: a diagram comment, text that a diagram's own lexer reads
 * as a comment: its range, from its mark to the end of its line, its mark,
 * and where its value, the text after the mark, starts.
 */
export interface DiagramComment {
  /**
   * From the mark to the end of its line: where the line feed that ends it
   * starts, directives and comment regions before it included, or the end
   * of the text. The comments of the tree that it makes, cut at the comment
   * regions, are decided by `SourceLexer.recordTokens`.
   */
  readonly range: Range
  /**
   * The characters of the mark, as the diagram's document defines it: `#`,
   * `%%`, or `%` in sequence and journey, `#` or `%%` in state, `%%` in
   * class, and `%%` or `%` in gantt.
   */
  readonly mark: "%%" | "#" | "%"
  readonly valueStart: number
}

/**
 * What a diagram's parser makes of the diagram text, which has no
 * directives: its tokens, before the directives cut them, and its diagram
 * comments. {@link finishDiagram} checks the tokens.
 */
export interface DiagramAnalysis {
  /**
   * The tokens, in source order, without overlapping, each from its first
   * to its last character that is not whitespace, or with the whitespace at
   * its ends where it is that of a value that mermaid.js reads (ast.md,
   * Tokens). A directive or a `;` that the line rule ignores can lie inside
   * one; the shared lexer cuts it there.
   */
  readonly tokens: readonly PendingToken[]
  /** The diagram comments, in source order, outside the tokens. */
  readonly comments: readonly DiagramComment[]
}

/** The range and location of a node. */
export interface Place {
  readonly range: Range
  readonly loc: Location
}

/**
 * common.md, Reading a source, and Diagram detection: the diagram text, from
 * the position that detection reached on. Detection passed the leading
 * trivia (common.md, Leading whitespace) and what it read before that
 * position, which the diagram's lexer does not read again
 * ({@link commentsBeforeHeader}); it found a diagram type there, so the text
 * has a token.
 */
export function openDiagramText(input: DiagramInput): DiagramTextReader {
  const { lexer, textStart } = input
  if (textStart >= lexer.text.length) {
    throw new Error(
      `mmd-toolkit parser bug: the diagram type ${input.diagramType} was detected in a text that has no token`,
    )
  }
  return new DiagramTextReader(lexer, textStart)
}

/**
 * common.md, Diagram detection: what detection passed before the header,
 * which the diagram's lexer does not read again. Each bare `%%` line is a
 * diagram comment with the mark `%%`, from its `%%` to the end of its line,
 * at the places that detection recorded as it passed the line, in every
 * diagram type (known-divergences/bare-percent-line-before-header.md). A
 * directive found once more, which is not in the tree, makes the input
 * rejected (docs/error-positions.md, Before the diagram). Returns the
 * comments, in source order.
 */
export function commentsBeforeHeader(input: DiagramInput): DiagramComment[] {
  const { lexer } = input
  return input.passed.map((part) => {
    if (part.kind === "directive-found-once-more") {
      throw new ParseError(
        "A directive formed across directives or comment lines cannot come before the header",
        part.opening,
        lexer.lines.location(part.opening),
      )
    }
    return {
      range: [part.start, part.end],
      mark: "%%",
      valueStart: part.valueStart,
    }
  })
}

/**
 * ast.md: finishes the tree of a diagram whose text was read and analysed
 * into `analysis`. It checks the analysis, records the tokens through the
 * shared lexer, which cuts them at the directives and the `;` that the line
 * rule ignores, rejecting the input where a token of a kind that may not be
 * cut has one inside it, and records the comments and directives, with the
 * `Directive` tokens and the tokens of the frontmatter, and builds the
 * root. `bodyAt` makes the body node at its place: from the start of the
 * first of the diagram's own tokens to the end of the last, which no
 * `Directive` token, no `IgnoredSemicolon` token, and no token in the range
 * of the frontmatter is (ast.md, Nodes).
 */
export function finishDiagram(
  input: DiagramInput,
  analysis: DiagramAnalysis,
  bodyAt: (place: Place) => DiagramBody,
): Root {
  const { lexer } = input
  checkAnalysis(lexer.text, analysis.tokens)
  lexer.recordTokens(analysis.tokens, analysis.comments, input.frontmatter)
  const { tokens } = lexer
  const frontmatterEnd = input.frontmatter?.range[1] ?? 0
  const diagramTokens = tokens.filter(
    (token) =>
      token.type !== "Directive" &&
      token.type !== "IgnoredSemicolon" &&
      token.range[0] >= frontmatterEnd,
  )
  const first = diagramTokens.at(0)
  const last = diagramTokens.at(-1)
  if (first === undefined || last === undefined) {
    throw new Error(
      `mmd-toolkit parser bug: the diagram ${input.diagramType} has no token`,
    )
  }
  const bodyRange: Range = [first.range[0], last.range[1]]
  const rootRange: Range = [0, lexer.text.length]
  return {
    type: "Root",
    diagramType: input.diagramType,
    body: bodyAt({ range: bodyRange, loc: lexer.lines.location(bodyRange) }),
    frontmatter: input.frontmatter,
    comments: lexer.comments,
    directives: lexer.directives,
    tokens,
    range: rootRange,
    loc: lexer.lines.location(rootRange),
  }
}

/**
 * The promises of {@link DiagramAnalysis}: the tokens `tokens` are in source
 * order, do not overlap, are not empty, and lie in the source. Where a token
 * starts or ends with whitespace is the diagram's to say, and the check of
 * the tree checks it against the values (`docs/positions.md`, Invariants). A broken
 * promise is a bug of the diagram's parser.
 */
function checkAnalysis(source: string, tokens: readonly PendingToken[]): void {
  let previousEnd = 0
  for (const { range } of tokens) {
    const [start, end] = range
    if (start < previousEnd || end <= start || end > source.length) {
      throw new Error(
        `mmd-toolkit parser bug: the token at ${start} to ${end} is empty, outside the source, or out of source order`,
      )
    }
    previousEnd = end
  }
}
