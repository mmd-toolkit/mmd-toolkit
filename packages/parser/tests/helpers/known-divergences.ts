/**
 * The known divergences that a test declares for what `parse()` does with a
 * text. The parser does not tell a known divergence apart, so the tests
 * declare it, each by its own rule and not from where the parser rejects
 * (known-divergences/*.md): `fixtures.test.ts` checks that a fixture marked
 * with a divergence has its form.
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
import { detectDiagram } from "../../src/detection.ts"
import { diagramInputOf, openSource } from "../../src/parse.ts"
import { readGitgraphDiagram } from "../../src/diagrams/gitgraph/index.ts"
import { checkGitgraphHistory } from "../../src/diagrams/gitgraph/history.ts"
import {
  commentsAfterMatchStarts,
  commentsAfterUnits,
  commentsAfterOneCharacterUnits,
  doublePercentsAfterUnitStarts,
  percentBracesReachedDirectly,
  percentCommentsReachedDirectly,
  percentsAfterUnitStarts,
  frontmatterChangesAttributeQuotes,
  ignoredSemicolonsBySegment,
  namesStartingWithUnits,
  rejectsWithoutHeader,
  removedEmptyFormsIn,
  reservedClicksIn,
  textStartOf,
  withoutDirectives,
  withoutTokenCuts,
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
 * What parse() does under its defaults, with external maxEdges and gitgraph
 * acceptance settings applied by their holder. A configured gitgraph can
 * reject a default tree or accept a history rejected under the default name
 * and escaping settings; neither direction adds configuration to parse().
 */
export function outcomeOf(text: string, config?: MermaidConfig): Outcome {
  const gitgraph = configuredGitgraphOutcome(text, config)
  if (gitgraph !== null) return gitgraph
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

/** Semantic acceptance conditions: apply only externally held name/escaping settings to the shared source analysis. */
function configuredGitgraphOutcome(
  text: string,
  config: MermaidConfig | undefined,
): Outcome | null {
  const graph = config?.gitGraph as
    Readonly<Record<string, unknown>> | undefined
  const mainBranchName =
    typeof graph?.mainBranchName === "string" ? graph.mainBranchName : "main"
  const escapeHtml =
    graph?.htmlLabels !== false && graph?.securityLevel !== "loose"
  if (mainBranchName === "main" && escapeHtml) return null
  const opened = openSource(text)
  const detection = detectDiagram(opened.lexer)
  if (detection.detected !== "gitGraph") return null
  try {
    const { root, decodedValues } = readGitgraphDiagram(
      diagramInputOf(opened, detection, "gitGraph"),
    )
    try {
      checkGitgraphHistory(root.body, decodedValues, {
        mainBranchName,
        escapeHtml,
      })
    } catch (error) {
      if (error instanceof ParseError) return { kind: "reject", at: null }
      throw error
    }
    return { kind: "tree", text, root }
  } catch (error) {
    if (error instanceof ParseError) return { kind: "reject", at: error.range }
    throw error
  }
}

/**
 * known-divergences/directive-as-token-boundary.md: whether the parser rejects
 * the text at a directive that lies inside a token that may not be cut,
 * which is decided on the reference input, apart from the parser's own
 * decision ({@link cutsInsideTokens}). The divergence goes one way only:
 * such a directive makes the specification reject what mermaid.js accepts.
 * A rejection elsewhere, or at a directive between two tokens, which is
 * always allowed, is no rejection for it.
 */
function rejectsForDirective(
  text: string,
  config: MermaidConfig | undefined,
  outcome: Exclude<Outcome, { readonly kind: "unsupported" }>,
): boolean {
  return cutsInsideTokens(text, config).directives.some((directive) =>
    rejectsAt(outcome, directive),
  )
}

/**
 * known-divergences/ignored-semicolon-as-token-boundary.md: whether the
 * parser rejects the text at a `;` that the line rule ignores and that lies
 * inside a token that may not be cut, which is decided on the reference
 * input, apart from the parser's own decision ({@link cutsInsideTokens}).
 * The divergence goes one way only, as that of directives.
 */
function rejectsForIgnoredSemicolon(
  text: string,
  config: MermaidConfig | undefined,
  outcome: Exclude<Outcome, { readonly kind: "unsupported" }>,
): boolean {
  return cutsInsideTokens(text, config).semicolons.some((semicolon) =>
    rejectsAt(outcome, semicolon),
  )
}

/**
 * The ranges of the directives and of the `;` that the line rule ignores
 * of `text` that lie inside a token that may not be cut
 * ({@link isInsideTokenThatMayNotBeCut}) in the tree of the reference input
 * that leaves out both ({@link withoutTokenCuts}), so that an input with
 * both forms is decided for each of them; none when the reference input is
 * not accepted, which then cannot tell.
 */
function cutsInsideTokens(
  text: string,
  config: MermaidConfig | undefined,
): { readonly directives: Range[]; readonly semicolons: Range[] } {
  const directives = findDirectives(text, textStartOf(text))
  const segments = ignoredSemicolonsBySegment(withoutDirectives(text))
  const inside: { directives: Range[]; semicolons: Range[] } = {
    directives: [],
    semicolons: [],
  }
  if (directives.length === 0 && segments.length === 0) return inside
  const reference = withoutTokenCuts(text)
  const referenceOutcome = outcomeOf(reference, config)
  if (referenceOutcome.kind !== "tree") return inside
  const { root } = referenceOutcome

  /**
   * Where the offset `at` of the text without directives lies in the
   * reference input: less the ignored `;` before it in its line segment,
   * which are moved to the end of the segment; each segment before it
   * keeps its length.
   */
  function inReference(at: number): number {
    let moved = 0
    for (const { semicolons, end } of segments) {
      if (at > end) continue
      moved += semicolons.filter((semicolon) => semicolon < at).length
    }
    return at - moved
  }

  /** The starts of the directives in the text without directives, with their lengths, in source order. */
  const removals = directives.map((directive, index) => ({
    at:
      directive.range[0] -
      directives
        .slice(0, index)
        .reduce((sum, before) => sum + before.range[1] - before.range[0], 0),
    length: directive.range[1] - directive.range[0],
  }))
  for (const [index, directive] of directives.entries()) {
    const at = inReference(removals[index].at)
    if (isInsideTokenThatMayNotBeCut(reference, root, at)) {
      inside.directives.push(directive.range)
    }
  }
  for (const { semicolons } of segments) {
    for (const semicolon of semicolons) {
      if (
        !isInsideTokenThatMayNotBeCut(reference, root, inReference(semicolon))
      ) {
        continue
      }
      // Where the `;` lies in `text`: its offset in the text without
      // directives, more the directives before it.
      const original =
        semicolon +
        removals
          .filter((removal) => removal.at <= semicolon)
          .reduce((sum, removal) => sum + removal.length, 0)
      inside.semicolons.push([original, original + 1])
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
 * names read otherwise than this specification, the Gantt text a `%`
 * right after the first character of a unit, the journey text a `%%`
 * there, or the XY chart or the quadrant chart text a comment right
 * after a unit of one character. The divergence goes both ways.
 */
function commentTakesCharacter(text: string): boolean {
  const places =
    commentsAfterMatchStarts(text) ??
    percentsAfterUnitStarts(text) ??
    doublePercentsAfterUnitStarts(text) ??
    commentsAfterOneCharacterUnits(text)
  return (places?.length ?? 0) > 0
}

/**
 * known-divergences/comment-takes-line-break.md: whether the class
 * text has a diagram comment that follows a unit on its line, whose line
 * feed mermaid.js takes, or the Gantt text a comment with the mark `%` that
 * mermaid.js reaches directly. The divergence goes both ways.
 */
function commentTakesLineBreak(text: string): boolean {
  const places =
    commentsAfterUnits(text) ?? percentCommentsReachedDirectly(text)
  return (places?.length ?? 0) > 0
}

/**
 * known-divergences/percent-brace-after-unit.md: whether the Gantt text
 * has a `%%{` that starts no directive and that mermaid.js reaches
 * directly, where it rejects the input. The divergence goes one way: this
 * specification accepts what mermaid.js rejects.
 */
function percentBraceAfterUnit(text: string): boolean {
  return (percentBracesReachedDirectly(text)?.length ?? 0) > 0
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
  const cuts = cutsInsideTokens(text, config)
  if (cuts.directives.length > 0) found.push("directive-as-token-boundary")
  if (cuts.semicolons.length > 0) {
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
 *   mermaid.js would take the character before, a Gantt text such a `%`,
 *   or a journey text such a `%%`;
 * - `comment-takes-line-break` when a class text has a diagram comment
 *   after a unit on its line, whose line feed mermaid.js would take, or a
 *   Gantt text a `%` comment that mermaid.js reaches directly;
 * - `percent-brace-after-unit` when a Gantt text has a `%%{` that
 *   mermaid.js reaches directly;
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
  if (percentBraceAfterUnit(text)) return "percent-brace-after-unit"
  if ((namesStartingWithUnits(text)?.length ?? 0) > 0) {
    return "name-start-reads-unit"
  }
  if (frontmatterChangesAttributeQuotes(text)) return "html-tag-in-frontmatter"
  if (root !== null && hasEmbeddedData(root)) return "embedded-data-opaque"
  return undefined
}
