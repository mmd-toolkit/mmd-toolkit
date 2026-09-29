import type {
  DiagramBody,
  DiagramTokenKind,
  DiagramType,
  Frontmatter,
  Location,
  Range,
  Root,
} from "./ast.ts"
import { DiagramTextReader } from "./diagram-text.ts"
import { ParseError } from "./errors.ts"
import type { PendingToken, SourceLexer } from "./source-lexer.ts"
import { isWhitespace } from "./character-classes.ts"
import { codePointBefore } from "./text-cursor.ts"

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
 * ast/<diagram>.md, Tokens: a unit of the diagram's lexer that is not all
 * whitespace, with the token kind of the item it belongs to.
 */
export interface UnitWithKind {
  /** The token kind of the unit's item. */
  readonly kind: DiagramTokenKind
  /** The source range from the first to the last character of the unit that is not whitespace. */
  readonly range: Range
}

/**
 * ast.md, Comment: a diagram comment, text that a diagram's own lexer reads
 * as a comment: its range, from its mark to before the line terminator, and
 * where its value, the text after the mark, starts.
 */
export interface DiagramComment {
  readonly range: Range
  readonly valueStart: number
}

/**
 * What a diagram's parser makes of the diagram text, which has no
 * directives: its units with their kinds, and its tokens, before the
 * directives cut them. {@link finishDiagram} checks both.
 */
export interface DiagramAnalysis {
  /** The units that are not all whitespace, in source order, without overlapping. */
  readonly units: readonly UnitWithKind[]
  /**
   * The tokens, in source order, without overlapping, each from its first
   * to its last character that is not whitespace. A directive can lie
   * inside one.
   */
  readonly tokens: readonly PendingToken[]
  /** The diagram comments, in source order, outside the tokens. */
  readonly comments: readonly DiagramComment[]
  /**
   * ast.md, Tokens: the kind that the diagram gives a `;` that stands alone
   * at the place `offset` of a `;` that the line rule ignores and that lies
   * in none of the tokens.
   */
  readonly ignoredSemicolonKindAt: (offset: number) => DiagramTokenKind
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
 * common.md, A directive is a token boundary, and ast.md: finishes the tree
 * of a diagram whose text `text` was read and analysed into `analysis`. It
 * checks the analysis, rejects the input when a directive lies inside a unit
 * that may not have one, records the tokens through the shared lexer, which
 * cuts them at the directives and records the comments and directives, with
 * the `Directive` tokens and the tokens of the frontmatter, and builds the
 * root. `bodyAt` makes the body node at its place: from the start of the
 * first of the diagram's own tokens to the end of the last, which no
 * `Directive` token and no token in the range of the frontmatter is
 * (ast.md, Nodes).
 */
export function finishDiagram(
  input: DiagramInput,
  text: DiagramTextReader,
  analysis: DiagramAnalysis,
  bodyAt: (place: Place) => DiagramBody,
): Root {
  const { lexer } = input
  checkAnalysis(lexer.text, analysis)
  rejectDirectiveInsideUnit(input, analysis.units, text.directives)
  lexer.recordTokens(
    analysis.tokens,
    analysis.comments,
    analysis.ignoredSemicolonKindAt,
    input.frontmatter,
  )
  const { tokens } = lexer
  const frontmatterEnd = input.frontmatter?.range[1] ?? 0
  const diagramTokens = tokens.filter(
    (token) => token.type !== "Directive" && token.range[0] >= frontmatterEnd,
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
 * The promises of {@link DiagramAnalysis}: the units and the tokens are in
 * source order and do not overlap, and each starts and ends with a
 * character of the source that is not whitespace. A broken promise is a bug
 * of the diagram's parser.
 */
function checkAnalysis(source: string, analysis: DiagramAnalysis): void {
  const lists: readonly [string, readonly { readonly range: Range }[]][] = [
    ["unit", analysis.units],
    ["token", analysis.tokens],
  ]
  for (const [what, list] of lists) {
    let previousEnd = 0
    for (const { range } of list) {
      const [start, end] = range
      if (start < previousEnd || end <= start || end > source.length) {
        throw new Error(
          `mmd-toolkit parser bug: the ${what} at ${start} to ${end} is empty, outside the source, or out of source order`,
        )
      }
      const first = source.codePointAt(start)
      const last = codePointBefore(source, end)
      if (
        first === undefined ||
        last === undefined ||
        isWhitespace(first) ||
        isWhitespace(last)
      ) {
        throw new Error(
          `mmd-toolkit parser bug: the ${what} at ${start} to ${end} starts or ends with whitespace`,
        )
      }
      previousEnd = end
    }
  }
}

/**
 * common.md, A directive is a token boundary: a unit of a kind other than
 * `RawText` and `Identifier` may not have a directive between two of its
 * characters that are not whitespace. Throws `ParseError` at the first
 * directive that lies inside such a unit. `units` and `directives` are in
 * source order.
 */
function rejectDirectiveInsideUnit(
  input: DiagramInput,
  units: readonly UnitWithKind[],
  directives: readonly Range[],
): void {
  /** The first directive that does not end before the unit at hand starts. */
  let next = 0
  for (const unit of units) {
    while (next < directives.length && directives[next][1] <= unit.range[0]) {
      next += 1
    }
    if (next === directives.length) return
    const directive = directives[next]
    const insideUnit = directive[0] < unit.range[1]
    if (insideUnit && unit.kind !== "RawText" && unit.kind !== "Identifier") {
      throw new ParseError(
        "Unexpected directive",
        directive,
        input.lexer.lines.location(directive),
      )
    }
  }
}
