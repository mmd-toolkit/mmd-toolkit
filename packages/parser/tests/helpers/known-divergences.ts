/**
 * The known divergences that a test declares for what `parse()` does with a
 * text. The parser does not tell a known divergence apart, so the tests
 * declare it, each by its own rule and not from where the parser rejects
 * (known-divergences/*.md): `fixtures.test.ts` checks that a fixture marked
 * with a divergence has its form, and the explorations against mermaid.js
 * declare the divergence of each input they compare.
 */
import type { MermaidConfig } from "@mmd-toolkit/tests"
import type { Range, Root, TokenKind } from "../../src/index.ts"
import {
  ParseError,
  UnsupportedDiagramError,
  parse,
  traverseNodes,
} from "../../src/index.ts"
import { isWhitespace } from "../../src/character-classes.ts"
import { findDirectives } from "../../src/directives.ts"
import { exceedsMaxEdges } from "@mmd-toolkit/tests"
import {
  commentsAfterMatchStarts,
  commentsAfterUnits,
  frontmatterChangesAttributeQuotes,
  ignoredSemicolonsBySegment,
  namesStartingWithUnits,
  rejectsWithoutHeader,
  removedEmptyFormsIn,
  reservedClicksIn,
  textStartOf,
  withIgnoredSemicolonsAtSegmentEnds,
  withoutDirectives,
} from "./reference-inputs.ts"

/** What `parse()` does with a text. */
export type Outcome =
  | { readonly kind: "tree"; readonly text: string; readonly root: Root }
  | { readonly kind: "unsupported"; readonly diagramType: string }
  | {
      readonly kind: "reject"
      /** Where `parse()` rejects the text; null for a rejection by the site configuration. */
      readonly at: Range | null
    }

/**
 * What `parse()` does with a text, together with the one rejection of
 * mermaid.js that depends on the site configuration `config` and that
 * `parse()` therefore does not make: more Db edges than `maxEdges`
 * (diagrams/flowchart.md, Rejections outside the grammar).
 */
export function outcomeOf(text: string, config?: MermaidConfig): Outcome {
  try {
    const root = parse(text)
    return exceedsMaxEdges(root, config)
      ? { kind: "reject", at: null }
      : { kind: "tree", text, root }
  } catch (error) {
    if (error instanceof UnsupportedDiagramError) {
      return { kind: "unsupported", diagramType: error.diagramType }
    }
    if (error instanceof ParseError) return { kind: "reject", at: error.range }
    throw error
  }
}

/**
 * known-divergences/directive-as-token-boundary.md: whether the parser rejects
 * the text at a directive that lies inside a token that may not be cut,
 * which is decided on the text without directives, apart from the parser's
 * own decision ({@link directivesInsideTokens}). The divergence goes one
 * way only: such a directive makes the specification reject what
 * mermaid.js accepts. A rejection elsewhere, or at a directive between two
 * tokens, which is always allowed, is no rejection for it.
 */
function rejectsForDirective(
  text: string,
  config: MermaidConfig | undefined,
  outcome: Exclude<Outcome, { readonly kind: "unsupported" }>,
): boolean {
  return directivesInsideTokens(text, config).some((directive) =>
    rejectsAt(outcome, directive),
  )
}

/**
 * known-divergences/ignored-semicolon-as-token-boundary.md: whether the
 * parser rejects the text at a `;` that the line rule ignores and that lies
 * inside a token that may not be cut, which is decided on the reference
 * input, apart from the parser's own decision
 * ({@link ignoredSemicolonsInsideTokens}). The divergence goes one way
 * only, as that of directives.
 */
function rejectsForIgnoredSemicolon(
  text: string,
  config: MermaidConfig | undefined,
  outcome: Exclude<Outcome, { readonly kind: "unsupported" }>,
): boolean {
  return ignoredSemicolonsInsideTokens(text, config).some((semicolon) =>
    rejectsAt(outcome, semicolon),
  )
}

/**
 * The ranges of the directives of `text` that lie inside a token that may
 * not be cut ({@link isInsideTokenThatMayNotBeCut}) in the tree of the text
 * without directives; none when that text is not accepted, which then
 * cannot tell.
 */
function directivesInsideTokens(
  text: string,
  config: MermaidConfig | undefined,
): Range[] {
  const directives = findDirectives(text, textStartOf(text))
  if (directives.length === 0) return []
  const reference = withoutDirectives(text)
  const referenceOutcome = outcomeOf(reference, config)
  if (referenceOutcome.kind !== "tree") return []
  let removed = 0
  const inside: Range[] = []
  for (const directive of directives) {
    // Where the directive lies in the text without directives: its start,
    // less the directives before it.
    const at = directive.range[0] - removed
    if (isInsideTokenThatMayNotBeCut(reference, referenceOutcome.root, at)) {
      inside.push(directive.range)
    }
    removed += directive.range[1] - directive.range[0]
  }
  return inside
}

/**
 * The ranges of the `;` of `text` that the line rule ignores and that lie
 * inside a token that may not be cut ({@link isInsideTokenThatMayNotBeCut})
 * in the tree of the reference input, in which each such `;` is moved to
 * the end of its line segment ({@link withIgnoredSemicolonsAtSegmentEnds});
 * none when the reference input is not accepted, which then cannot tell.
 */
function ignoredSemicolonsInsideTokens(
  text: string,
  config: MermaidConfig | undefined,
): Range[] {
  const segments = ignoredSemicolonsBySegment(text)
  if (segments.length === 0) return []
  const reference = withIgnoredSemicolonsAtSegmentEnds(text)
  const referenceOutcome = outcomeOf(reference, config)
  if (referenceOutcome.kind !== "tree") return []
  const inside: Range[] = []
  for (const { semicolons } of segments) {
    for (const [index, semicolon] of semicolons.entries()) {
      // Where the `;` lies in the reference input: its offset, less the
      // `;` before it in its segment, which are moved to the end of the
      // segment; each segment before it keeps its length.
      const at = semicolon - index
      if (isInsideTokenThatMayNotBeCut(reference, referenceOutcome.root, at)) {
        inside.push([semicolon, semicolon + 1])
      }
    }
  }
  return inside
}

/**
 * common.md, A directive is a token boundary, and `style` and `classDef`
 * lines, decided apart from the parser's own decision: whether a token of
 * the kind `kind` may be cut by a directive or a `;` that the line rule
 * ignores: a text (`RawText`) and a string (`String`, and `StringFragment`
 * for its fragments) may, and no other token.
 */
function mayBeCut(kind: TokenKind): boolean {
  return kind === "RawText" || kind === "String" || kind === "StringFragment"
}

/**
 * Whether the place `at` of the reference input `reference` lies inside a
 * token of `root`, the tree of `reference`, that may not be cut
 * ({@link mayBeCut}), between two of its characters that are not
 * whitespace: one before the place and one after it. The tree of
 * `reference` is compared with mermaid.js on its own, so its tokens can be
 * relied on; a token that may not be cut is whole in it, since the parser
 * rejects a tree where one is cut.
 */
function isInsideTokenThatMayNotBeCut(
  reference: string,
  root: Root,
  at: number,
): boolean {
  return root.tokens.some(
    (token) =>
      !mayBeCut(token.type) &&
      holdsNonWhitespace(reference, token.range[0], at) &&
      holdsNonWhitespace(reference, at, token.range[1]),
  )
}

/** Whether the text of `text` from `start` to `end` holds a character that is not whitespace. */
function holdsNonWhitespace(text: string, start: number, end: number): boolean {
  for (let offset = start; offset < end; offset += 1) {
    const codePoint = text.codePointAt(offset)
    if (codePoint !== undefined && !isWhitespace(codePoint)) return true
  }
  return false
}

/** Whether the rejection `outcome` is at the range `range`. */
function rejectsAt(
  outcome: Exclude<Outcome, { readonly kind: "unsupported" }>,
  range: Range,
): boolean {
  return (
    outcome.kind === "reject" &&
    outcome.at !== null &&
    outcome.at[0] === range[0] &&
    outcome.at[1] === range[1]
  )
}

/**
 * known-divergences/click-reserved-word.md: whether the parser rejects the text
 * at a `click` unit that does not start a click statement, which is where it
 * rejects one. The divergence goes one way only: the specification rejects
 * what mermaid.js accepts. A rejection elsewhere in a text with such a unit
 * is no rejection for it.
 */
function rejectsForReservedClick(
  text: string,
  outcome: Exclude<Outcome, { readonly kind: "unsupported" }>,
): boolean {
  return (reservedClicksIn(text) ?? []).some((click) =>
    rejectsAt(outcome, click.significantRange ?? [click.start, click.end]),
  )
}

/**
 * known-divergences/tokenless-empty-forms.md: whether the parser rejects the
 * text at an empty form that mermaid.js reads nothing for, which is where it
 * rejects one. The divergence goes one way only: the specification rejects
 * what mermaid.js accepts. A rejection elsewhere in a text with such a form
 * is no rejection for it.
 */
function rejectsForEmptyForm(
  text: string,
  outcome: Exclude<Outcome, { readonly kind: "unsupported" }>,
): boolean {
  return (removedEmptyFormsIn(text) ?? []).some((form) =>
    rejectsAt(outcome, form.range),
  )
}

/**
 * known-divergences/comment-takes-character.md: whether the sequence
 * text has a `%%` where the two rules of mermaid.js that the divergence
 * names read otherwise than this specification. The divergence goes both
 * ways.
 */
function commentTakesCharacter(text: string): boolean {
  return (commentsAfterMatchStarts(text)?.length ?? 0) > 0
}

/**
 * known-divergences/comment-takes-line-break.md: whether the class
 * text has a diagram comment that follows a unit on its line, whose line
 * feed mermaid.js takes. The divergence goes both ways.
 */
function commentTakesLineBreak(text: string): boolean {
  return (commentsAfterUnits(text)?.length ?? 0) > 0
}

/**
 * known-divergences/embedded-data-opaque.md: whether the tree has embedded
 * data, which the parser never reads: frontmatter, a directive, or a data block
 * of a flowchart or of a sequence participant.
 */
function hasEmbeddedData(root: Root): boolean {
  if (root.frontmatter !== null || root.directives.length > 0) return true
  let dataBlocks = 0
  traverseNodes(root, {
    enterNode(node) {
      if (
        node.type === "FlowchartDataBlock" ||
        node.type === "SequenceDataBlock"
      ) {
        dataBlocks += 1
      }
    },
    leaveNode() {
      // Nothing to do on the way back.
    },
  })
  return dataBlocks > 0
}

/**
 * The known divergences that go one way only, the parser rejecting what
 * mermaid.js accepts, whose form `text` has, each found by its own rule
 * and not from where the parser rejects: a directive or a `;` that the
 * line rule ignores inside a token that may not be cut, a `click` that
 * does not start a click statement, an empty form that mermaid.js reads
 * nothing for, and a class diagram without its header.
 */
export function oneWayDivergencesIn(
  text: string,
  config: MermaidConfig | undefined,
): string[] {
  const found: string[] = []
  if (directivesInsideTokens(text, config).length > 0) {
    found.push("directive-as-token-boundary")
  }
  if (ignoredSemicolonsInsideTokens(text, config).length > 0) {
    found.push("ignored-semicolon-as-token-boundary")
  }
  if ((reservedClicksIn(text)?.length ?? 0) > 0) {
    found.push("click-reserved-word")
  }
  if ((removedEmptyFormsIn(text)?.length ?? 0) > 0) {
    found.push("tokenless-empty-forms")
  }
  if (rejectsWithoutHeader(text)) found.push("headerless-empty-ending")
  return found
}

/**
 * What the candidate declares for a text. The parser does not tell a known
 * divergence apart, so the test declares it:
 *
 * - `directive-as-token-boundary` when the parser rejects the text at a
 *   directive inside a token that may not be cut;
 * - `ignored-semicolon-as-token-boundary` when the parser rejects the text
 *   at a `;` that the line rule ignores inside a token that may not be cut;
 * - `click-reserved-word` when the parser rejects the text and the text has
 *   a `click` that does not start a click statement;
 * - `tokenless-empty-forms` when the parser rejects the text and the text
 *   has an empty form that mermaid.js reads nothing for;
 * - `comment-takes-character` when a sequence text has a `%%` that
 *   mermaid.js would take the character before;
 * - `comment-takes-line-break` when a class text has a diagram comment
 *   after a unit on its line, whose line feed mermaid.js would take;
 * - `name-start-reads-unit` when a class text has a backquoted name or a
 *   generic type whose text starts with a unit that mermaid.js would read
 *   instead;
 * - `headerless-empty-ending` when the parser rejects a class text whose
 *   first unit is not its header, which mermaid.js accepts where the text
 *   ends in an empty match;
 * - `html-tag-in-frontmatter` when a tag that starts in the frontmatter
 *   changes which `"` mermaid.js reads as `'`;
 * - `embedded-data-opaque` for an accepted text with embedded data, which
 *   mermaid.js may reject for its content.
 */
export function declaredDivergence(
  text: string,
  config: MermaidConfig | undefined,
  outcome: Exclude<Outcome, { readonly kind: "unsupported" }>,
): string | undefined {
  const root = outcome.kind === "tree" ? outcome.root : null
  if (rejectsForDirective(text, config, outcome)) {
    return "directive-as-token-boundary"
  }
  if (rejectsForIgnoredSemicolon(text, config, outcome)) {
    return "ignored-semicolon-as-token-boundary"
  }
  if (rejectsForReservedClick(text, outcome)) return "click-reserved-word"
  if (rejectsForEmptyForm(text, outcome)) return "tokenless-empty-forms"
  if (root === null && rejectsWithoutHeader(text)) {
    return "headerless-empty-ending"
  }
  if (commentTakesCharacter(text)) return "comment-takes-character"
  if (commentTakesLineBreak(text)) return "comment-takes-line-break"
  if ((namesStartingWithUnits(text)?.length ?? 0) > 0) {
    return "name-start-reads-unit"
  }
  if (frontmatterChangesAttributeQuotes(text)) return "html-tag-in-frontmatter"
  if (root !== null && hasEmbeddedData(root)) return "embedded-data-opaque"
  return undefined
}
