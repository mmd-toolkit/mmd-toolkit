import type {
  DiagramBody,
  DiagramType,
  Frontmatter,
  Location,
  Range,
  Root,
} from "./ast.ts"
import { DiagramTextReader } from "./diagram-text.ts"
import type { PendingToken, SourceLexer } from "./source-lexer.ts"

/**
 * What a diagram's parser starts from: the shared lexer, which `parse()`
 * has set up and used for detection, the frontmatter, and the detected
 * diagram type.
 */
export interface DiagramInput {
  readonly lexer: SourceLexer
  readonly frontmatter: Frontmatter | null
  readonly diagramType: DiagramType
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
   * `%%`, or `%` in sequence, `#` or `%%` in state, and `%%` in class.
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
 * common.md, Reading a source: the diagram text, from the first token of
 * the text on. The shared lexer has passed the leading whitespace, comment
 * regions, and directives (common.md, Leading whitespace); detection found
 * a diagram type, so the text has a token.
 */
export function openDiagramText(input: DiagramInput): DiagramTextReader {
  const { lexer } = input
  const start = lexer.firstTokenStart()
  if (start >= lexer.text.length) {
    throw new Error(
      `mmd-toolkit parser bug: the diagram type ${input.diagramType} was detected in a text that has no token`,
    )
  }
  return new DiagramTextReader(lexer, start)
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
 * the tree checks it against the values (ast.md, Invariants). A broken
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
