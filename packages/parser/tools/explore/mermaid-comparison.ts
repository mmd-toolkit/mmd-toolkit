/**
 * What the explorations against mermaid.js share. Each exploration gives
 * the inputs (generated texts, or mutants of fixtures) and states what it
 * expects of the results; the comparison with `mermaid.parse()` of the
 * pinned mermaid.js, through the differential framework of
 * `@mmd-toolkit/tests`, is here, and the known divergence declared for each
 * input comes from `tests/helpers/known-divergences.ts`.
 *
 * `parse()` has three outcomes, and each one is checked differently:
 *
 * - a tree: mermaid.js accepts, with the same diagram type id and the same
 *   Db summary (`compareAll`). The Db summary is built from the tree with
 *   the values that mermaid.js derived from the embedded data of the text,
 *   which the framework passes to the candidate. The parser never reads
 *   the frontmatter body, the directive arguments, or the data blocks, so
 *   when the tree has one of them, the candidate declares
 *   `embedded-data-opaque`; every difference reported under that name is
 *   then checked to be a rejection of mermaid.js for what embedded data
 *   contains (see `isEmbeddedDataRejection`);
 * - `ParseError`: mermaid.js rejects (`compareAll`). The parser does not
 *   tell a known divergence apart, so the test declares
 *   `directive-as-token-boundary` itself, for a text with a directive that
 *   the parser rejects inside a token that may not be cut; a declared
 *   difference is then checked independently: on the text without its
 *   directives, `parse()` must agree with mermaid.js on the original
 *   input, so that nothing but the directive explains the difference. It
 *   declares `ignored-semicolon-as-token-boundary` in the same way, for a
 *   `;` that the line rule ignores, and checks it on the text with each
 *   such `;` moved to the end of its line segment. In
 *   the same way it declares `click-reserved-word` for a flowchart with a
 *   `click` that does not start a click statement, and checks that the
 *   parser, where it accepts the text without such `click` units and
 *   without its empty forms, reads in it the same units but theirs, and
 *   finds each of their click ids within one leaf node, agrees with
 *   mermaid.js on the original input; and it declares
 *   `tokenless-empty-forms` for a flowchart, a sequence diagram, a class
 *   diagram, or a state diagram with an empty form that mermaid.js reads
 *   nothing for, and checks that the parser, where it accepts the text
 *   without those forms and reads in it the same units but theirs, agrees
 *   with mermaid.js on the original input. The divergences that go both
 *   ways, `html-tag-in-frontmatter`, `comment-takes-character`,
 *   `comment-takes-line-break`, and `name-start-reads-unit`, are declared
 *   for a tree as well as for a rejection, and checked against mermaid.js
 *   in their reference reading: on the input whose frontmatter starts no
 *   tag, and on the input itself with the rules of the lexer of mermaid.js
 *   that the divergence names changed;
 * - `UnsupportedDiagramError` (detected, not implemented yet): mermaid.js
 *   either accepts with the same diagram type id, or rejects in that
 *   diagram's own parser or for embedded data. A rejection by the common
 *   rules of mermaid.js (no diagram type, or the `---` pseudo-diagram)
 *   contradicts the detection and is a mismatch. The framework compares
 *   acceptance only, so this case calls `runMermaid()` directly.
 */
import type { MermaidConfig } from "@mmd-toolkit/tests"
import type {
  DivergenceRemoval,
  EmbeddedValues,
  MermaidOutcome,
} from "@mmd-toolkit/tests/mermaid"
import {
  runMermaid,
  runMermaidWithEmbeddedData,
} from "@mmd-toolkit/tests/mermaid"
import type {
  Candidate,
  CandidateOutcome,
  MutationDivergence,
  MutationInput,
  MutationMismatch,
  MutationReport,
} from "@mmd-toolkit/tests/mutation"
import { compareAll } from "@mmd-toolkit/tests/mutation"
import { isDeepStrictEqual } from "node:util"
import type { Root } from "../../src/index.ts"
import { findDirectives } from "../../src/directives.ts"
import { dbOfTree } from "../../tests/helpers/db-of-tree.ts"
import type { Outcome } from "../../tests/helpers/known-divergences.ts"
import {
  declaredDivergence,
  outcomeOf,
} from "../../tests/helpers/known-divergences.ts"
import {
  CLASS_READING_REMOVALS,
  clickIdsWithinLeafNodes,
  clickReferenceOf,
  keepsUnitsWithoutEmptyForms,
  textStartOf,
  withIgnoredSemicolonsAtSegmentEnds,
  withoutDirectives,
  withoutEmptyForms,
  withoutFrontmatterTagStarts,
} from "../../tests/helpers/reference-inputs.ts"

/** The key of a text and its site configuration, by which the candidate finds a decided input. */
function keyOf(text: string, config: MermaidConfig | undefined): string {
  return `${JSON.stringify(config ?? null)}\u0000${text}`
}

/**
 * The candidate for the framework on the inputs `decided`, each of which
 * `inputsByOutcome` parsed once: a tree or a rejection, with the divergence
 * the test declares. `embedded` is what mermaid.js derived from the
 * embedded data of the text, undefined when it rejected the text; the Db
 * summary of a tree is built with it, and left out without it, since there
 * is then no Db of mermaid.js to compare with.
 */
function candidateFor(decided: readonly DecidedInput[]): Candidate {
  const byKey = new Map(
    decided.map((entry): [string, DecidedInput] => [
      keyOf(entry.input.text, entry.input.config),
      entry,
    ]),
  )
  return (text, config, embedded): CandidateOutcome => {
    const entry = byKey.get(keyOf(text, config))
    if (entry === undefined) {
      throw new Error(
        `exploration: the input ${JSON.stringify(text)} was not decided`,
      )
    }
    const { outcome, declared } = entry
    const declaration =
      declared === undefined ? {} : { knownDivergence: declared }
    if (outcome.kind === "reject") return { accepted: false, ...declaration }
    return {
      accepted: true,
      diagramType: outcome.root.diagramType,
      ...(embedded === undefined
        ? {}
        : { db: dbOfTree(text, outcome.root, embedded) }),
      ...declaration,
    }
  }
}

/** Whether the Db summary of the tree of `tree`, built with `embedded`, is `mermaidDb`. */
function hasDb(
  tree: { readonly text: string; readonly root: Root },
  embedded: EmbeddedValues,
  mermaidDb: unknown,
): boolean {
  return isDeepStrictEqual(dbOfTree(tree.text, tree.root, embedded), mermaidDb)
}

/** common.md, Init directives: whether a directive name ends with `init` or `initialize`. */
function hasInitDirective(text: string): boolean {
  return findDirectives(text, textStartOf(text)).some(
    (directive) =>
      directive.name.endsWith("init") || directive.name.endsWith("initialize"),
  )
}

/**
 * Whether mermaid.js rejected the text for what its embedded data contains
 * (known-divergences/embedded-data-opaque.md), judged by the error it threw.
 * The forms are those of the fixtures that the bullets of that section, and the
 * Known divergences of diagrams/flowchart.md, cite:
 *
 * - a `YAMLException` from the frontmatter body or from a data block;
 * - a `TypeError` from a configuration of the wrong shape: "Cannot create
 *   property ..." (a wrap flag or `displayMode` on a string or number),
 *   "str is not iterable" (a number or boolean under a CSS key), or "Cannot
 *   assign to read only property ..." (a string `themeVariables`), and
 *   "Cannot read properties of null (reading 'shape')" (a data block of a
 *   flowchart vertex whose content holds a line break and is YAML without a
 *   value);
 * - an `Error` "Unsupported color format ..." from a theme variable that is
 *   not a colour, or "No such shape: ..." from a data block that names an
 *   unknown shape;
 * - only when the text has an init directive, an `UnknownDiagramError` from
 *   the second detection that mermaid.js runs for the init configuration.
 *
 * Any other error, in particular an `Error` from a diagram's grammar or the
 * `---` pseudo-diagram, is not one.
 */
function isEmbeddedDataRejection(
  text: string,
  mermaid: MermaidOutcome,
): boolean {
  if (mermaid.accepted) return false
  const { name, message } = mermaid.error
  if (name === "YAMLException") return true
  if (name === "TypeError") {
    return (
      message.startsWith("Cannot create property") ||
      message === "str is not iterable" ||
      message.startsWith("Cannot assign to read only property") ||
      message === "Cannot read properties of null (reading 'shape')"
    )
  }
  if (name === "Error") {
    return (
      message.startsWith("Unsupported color format") ||
      message.startsWith("No such shape:")
    )
  }
  return name === "UnknownDiagramError" && hasInitDirective(text)
}

/**
 * Whether mermaid.js rejected the text by the rules this parser implements
 * (no diagram type, or the `---` pseudo-diagram), as opposed to a diagram's
 * own parser or embedded data.
 */
function rejectedByCommonRules(text: string, mermaid: MermaidOutcome): boolean {
  if (mermaid.accepted) return false
  const { name, message } = mermaid.error
  if (message.startsWith("Diagrams beginning with ---")) return true
  return name === "UnknownDiagramError" && !hasInitDirective(text)
}

/** An input whose diagram type the parser detects and does not implement yet. */
export interface UnsupportedInput {
  readonly input: MutationInput
  readonly diagramType: string
}

/**
 * An input that `parse()` decides, with what it does with it, a tree or a
 * rejection, and the known divergence that the test declares for it, each
 * found once, so that no check parses the input again.
 */
export interface DecidedInput {
  readonly input: MutationInput
  readonly outcome: Exclude<Outcome, { readonly kind: "unsupported" }>
  readonly declared: string | undefined
}

/** The inputs by what `parse()` does with them: a tree or a rejection, or a diagram type that is not implemented yet. */
export interface InputsByOutcome {
  readonly decided: readonly DecidedInput[]
  readonly unsupported: readonly UnsupportedInput[]
}

/**
 * Separates the inputs that `parse()` decides from those whose diagram
 * type is not implemented yet, parsing each input once.
 */
export function inputsByOutcome(
  inputs: Iterable<MutationInput>,
): InputsByOutcome {
  const decided: DecidedInput[] = []
  const unsupported: UnsupportedInput[] = []
  for (const input of inputs) {
    const outcome = outcomeOf(input.text, input.config)
    if (outcome.kind === "unsupported") {
      unsupported.push({ input, diagramType: outcome.diagramType })
    } else {
      const declared = declaredDivergence(input.text, input.config, outcome)
      decided.push({ input, outcome, declared })
    }
  }
  return { decided, unsupported }
}

/** The decided inputs `decided` for which the test declares `divergence`. */
function declaredAs(
  decided: readonly DecidedInput[],
  divergence: string,
): DecidedInput[] {
  return decided.filter((entry) => entry.declared === divergence)
}

/** The comparison of `decided` with mermaid.js, through the framework. */
function compareEntries(
  decided: readonly DecidedInput[],
  options?: Parameters<typeof compareAll>[2],
): Promise<MutationReport> {
  return compareAll(
    decided.map((entry) => entry.input),
    candidateFor(decided),
    options,
  )
}

/** The comparison of the decided inputs with mermaid.js. */
export interface DecidedComparison {
  /** How many inputs were compared. */
  readonly compared: number
  /** How many had their diagram type and their Db summary compared. */
  readonly comparedParts: MutationReport["comparedParts"]
  readonly skipped: MutationReport["skipped"]
  readonly mismatches: readonly MutationMismatch[]
  readonly divergences: readonly MutationDivergence[]
  /**
   * The declared `embedded-data-opaque` differences that are not a
   * rejection of mermaid.js for embedded data: a difference in type or Db,
   * or a rejection for another reason.
   */
  readonly unexplainedEmbeddedData: readonly MutationDivergence[]
  /**
   * The declared `headerless-empty-ending` differences that are not an
   * input that mermaid.js accepts: the divergence goes one way only, and
   * the parser rejects for the missing header.
   */
  readonly unexplainedHeaderless: readonly MutationDivergence[]
}

/**
 * Compares every decided input with mermaid.js: acceptance, the diagram
 * type, and the Db summary built from the tree.
 */
export async function compareDecided(
  decided: readonly DecidedInput[],
): Promise<DecidedComparison> {
  const report = await compareEntries(decided, {
    require: ["diagramType", "db"],
  })
  const { divergences } = report
  return {
    compared: report.compared,
    comparedParts: report.comparedParts,
    skipped: report.skipped,
    mismatches: report.mismatches,
    divergences,
    unexplainedEmbeddedData: divergences.filter(
      (divergence) =>
        divergence.id === "embedded-data-opaque" &&
        !(
          divergence.kind === "acceptance" &&
          isEmbeddedDataRejection(divergence.text, divergence.mermaid)
        ),
    ),
    unexplainedHeaderless: divergences.filter(
      (divergence) =>
        divergence.id === "headerless-empty-ending" &&
        !(divergence.kind === "acceptance" && divergence.mermaid.accepted),
    ),
  }
}

/**
 * The check of the differences that the test declared as one divergence
 * that a reference input explains: `directive-as-token-boundary`,
 * `ignored-semicolon-as-token-boundary`, `click-reserved-word`, or
 * `tokenless-empty-forms`.
 */
export interface ExplainedDivergenceCheck {
  readonly mismatches: readonly MutationMismatch[]
  /** The differences from mermaid.js that the test declared as this divergence. */
  readonly divergences: readonly MutationDivergence[]
  /** Those that the reference input of the divergence does not explain. */
  readonly unexplained: readonly MutationDivergence[]
}

/**
 * known-divergences/directive-as-token-boundary.md: every difference that the
 * test declared as this divergence. The parser rejects what mermaid.js accepts,
 * and without its directives the parser gives what mermaid.js gave for the
 * input, so that nothing but a directive explains the difference. A declared
 * input that mermaid.js rejects as well is no difference and needs no
 * explanation.
 */
export async function checkDirectiveDivergences(
  decided: readonly DecidedInput[],
): Promise<ExplainedDivergenceCheck> {
  return checkCutDivergences(
    decided,
    "directive-as-token-boundary",
    withoutDirectives,
  )
}

/**
 * known-divergences/ignored-semicolon-as-token-boundary.md: every difference
 * that the test declared as this divergence. The parser rejects what
 * mermaid.js accepts, and with each `;` that the line rule ignores moved to
 * the end of its line segment the parser gives what mermaid.js gave for
 * the input, so that nothing but such a `;` explains the difference. A
 * declared input that mermaid.js rejects as well needs no explanation.
 */
export async function checkIgnoredSemicolonDivergences(
  decided: readonly DecidedInput[],
): Promise<ExplainedDivergenceCheck> {
  return checkCutDivergences(
    decided,
    "ignored-semicolon-as-token-boundary",
    withIgnoredSemicolonsAtSegmentEnds,
  )
}

/**
 * The check of the differences declared as the divergence `id`, a cut
 * inside a token that may not be cut, which the reference input that
 * `referenceOf` makes explains ({@link explainedByReference}).
 */
async function checkCutDivergences(
  decided: readonly DecidedInput[],
  id: string,
  referenceOf: (text: string) => string,
): Promise<ExplainedDivergenceCheck> {
  const report = await compareEntries(declaredAs(decided, id))
  const unexplained: MutationDivergence[] = []
  for (const divergence of report.divergences) {
    if (!(await explainedByReference(divergence, referenceOf))) {
      unexplained.push(divergence)
    }
  }
  return {
    mismatches: report.mismatches,
    divergences: report.divergences,
    unexplained,
  }
}

/**
 * Whether what the reference input that `referenceOf` makes leaves out
 * explains `divergence` alone: mermaid.js accepts the text, and the parser
 * gives for the reference input what mermaid.js gave for the text, the Db
 * built with the values that mermaid.js derived from the embedded data of
 * the text.
 */
async function explainedByReference(
  divergence: MutationDivergence,
  referenceOf: (text: string) => string,
): Promise<boolean> {
  const { mermaid } = divergence
  if (divergence.kind !== "acceptance" || !mermaid.accepted) return false
  const outcome = outcomeOf(referenceOf(divergence.text), divergence.config)
  if (outcome.kind === "unsupported") {
    return outcome.diagramType === mermaid.diagramType
  }
  if (outcome.kind !== "tree") return false
  if (outcome.root.diagramType !== mermaid.diagramType) return false
  const { embedded } = await runMermaidWithEmbeddedData(
    divergence.text,
    divergence.config === undefined ? {} : { config: divergence.config },
  )
  return embedded !== undefined && hasDb(outcome, embedded, mermaid.db)
}

/**
 * known-divergences/click-reserved-word.md: every difference that the test
 * declared as this divergence. The parser rejects what mermaid.js accepts, and
 * where mermaid.js gives the reference input the Db of the input ({@link
 * clickReferenceOf}), the parser gives it what mermaid.js gave for the input,
 * so that nothing but those `click` units explains the difference.
 */
export async function checkReservedClickDivergences(
  decided: readonly DecidedInput[],
): Promise<ExplainedDivergenceCheck> {
  const report = await compareEntries(
    declaredAs(decided, "click-reserved-word"),
  )
  const unexplained: MutationDivergence[] = []
  for (const divergence of report.divergences) {
    if (!(await explainedByReservedClick(divergence))) {
      unexplained.push(divergence)
    }
  }
  return {
    mismatches: report.mismatches,
    divergences: report.divergences,
    unexplained,
  }
}

/**
 * Whether the reserved `click` units alone explain `divergence`: mermaid.js
 * accepts the text, and the parser gives for the reference input what
 * mermaid.js gave for the text, unless the removal changes the units or
 * puts a click id outside one leaf node, or the parser rejects the
 * reference input.
 */
async function explainedByReservedClick(
  divergence: MutationDivergence,
): Promise<boolean> {
  const { mermaid } = divergence
  if (divergence.kind !== "acceptance" || !mermaid.accepted) return false
  const reference = clickReferenceOf(divergence.text)
  if (reference === null) return false
  if (!reference.keepsUnits) return true
  const outcome = outcomeOf(reference.text, divergence.config)
  if (outcome.kind !== "tree") return true
  if (!clickIdsWithinLeafNodes(reference, outcome.root)) return true
  if (outcome.root.diagramType !== mermaid.diagramType) return false
  const { embedded } = await runMermaidWithEmbeddedData(
    divergence.text,
    divergence.config === undefined ? {} : { config: divergence.config },
  )
  return embedded !== undefined && hasDb(outcome, embedded, mermaid.db)
}

/**
 * known-divergences/tokenless-empty-forms.md: every difference that the test
 * declared as this divergence. The parser rejects what mermaid.js accepts,
 * and where its lexer reads the reference input, the text without its
 * comment regions and without the empty forms that mermaid.js reads nothing
 * for, as the units of the text but theirs, and the parser accepts it, it
 * gives what mermaid.js gave for the input, so that nothing but those forms
 * explains the difference.
 */
export async function checkEmptyFormDivergences(
  decided: readonly DecidedInput[],
): Promise<ExplainedDivergenceCheck> {
  const report = await compareEntries(
    declaredAs(decided, "tokenless-empty-forms"),
  )
  const unexplained: MutationDivergence[] = []
  for (const divergence of report.divergences) {
    if (!(await explainedByEmptyForms(divergence))) {
      unexplained.push(divergence)
    }
  }
  return {
    mismatches: report.mismatches,
    divergences: report.divergences,
    unexplained,
  }
}

/**
 * Whether the empty forms alone explain `divergence`: mermaid.js accepts
 * the text, and the parser gives for the reference input what mermaid.js
 * gave for the text, unless the removal changes the units around a form or
 * the parser rejects the reference input.
 */
async function explainedByEmptyForms(
  divergence: MutationDivergence,
): Promise<boolean> {
  const { mermaid } = divergence
  if (divergence.kind !== "acceptance" || !mermaid.accepted) return false
  const reference = withoutEmptyForms(divergence.text)
  if (reference === null) return false
  if (!keepsUnitsWithoutEmptyForms(divergence.text)) return true
  const outcome = outcomeOf(reference, divergence.config)
  if (outcome.kind !== "tree") return true
  if (outcome.root.diagramType !== mermaid.diagramType) return false
  const { embedded } = await runMermaidWithEmbeddedData(
    divergence.text,
    divergence.config === undefined ? {} : { config: divergence.config },
  )
  return embedded !== undefined && hasDb(outcome, embedded, mermaid.db)
}

/**
 * The check of the inputs for which the test declares a divergence that
 * goes both ways and that a reference reading explains:
 * `html-tag-in-frontmatter`, `comment-takes-character`,
 * `comment-takes-line-break`, or `name-start-reads-unit`.
 */
export interface ReferenceDivergenceCheck {
  /** The inputs for which the parser does not give what mermaid.js gives in the reference reading. */
  readonly mismatches: readonly {
    readonly from: string
    readonly text: string
    readonly reference: ReferenceReading
  }[]
  /** How many of the declared inputs the parser accepts. */
  readonly trees: number
  /** How many of the declared inputs the parser rejects. */
  readonly rejections: number
}

/**
 * How mermaid.js is to read an input so that it reads it as this
 * specification does, but for the other known divergences: the text it
 * reads, and the divergences removed from its lexer, if any.
 */
export interface ReferenceReading {
  readonly text: string
  readonly withoutDivergences?: readonly DivergenceRemoval[]
}

/**
 * Every input for which the test declares `divergence`, a tree or a
 * rejection. The parser must give for it what mermaid.js gives in the
 * reference reading, `referenceOf` of it, so that nothing but the
 * divergence explains a difference from mermaid.js on the input itself. A
 * rejection in the reference reading for what embedded data contains is no
 * difference (`embedded-data-opaque`).
 */
async function checkAgainstReferenceReadings(
  decided: readonly DecidedInput[],
  divergence: string,
  referenceOf: (text: string) => ReferenceReading,
): Promise<ReferenceDivergenceCheck> {
  const mismatches: {
    from: string
    text: string
    reference: ReferenceReading
  }[] = []
  let trees = 0
  let rejections = 0
  for (const { input, outcome } of declaredAs(decided, divergence)) {
    const reference = referenceOf(input.text)
    const { outcome: mermaid, embedded } = await runMermaidWithEmbeddedData(
      reference.text,
      {
        ...(input.config === undefined ? {} : { config: input.config }),
        ...(reference.withoutDivergences === undefined
          ? {}
          : { withoutDivergences: reference.withoutDivergences }),
      },
    )
    let agrees: boolean
    if (outcome.kind === "tree") {
      trees += 1
      agrees = mermaid.accepted
        ? outcome.root.diagramType === mermaid.diagramType &&
          embedded !== undefined &&
          hasDb(outcome, embedded, mermaid.db)
        : isEmbeddedDataRejection(reference.text, mermaid)
    } else {
      rejections += 1
      agrees = !mermaid.accepted
    }
    if (!agrees) {
      mismatches.push({ from: input.name, text: input.text, reference })
    }
  }
  return { mismatches, trees, rejections }
}

/**
 * known-divergences/html-tag-in-frontmatter.md: the reference reading is
 * that of the input whose frontmatter starts no tag.
 */
export function checkHtmlTagDivergences(
  decided: readonly DecidedInput[],
): Promise<ReferenceDivergenceCheck> {
  return checkAgainstReferenceReadings(
    decided,
    "html-tag-in-frontmatter",
    (text) => ({ text: withoutFrontmatterTagStarts(text) }),
  )
}

/**
 * known-divergences/comment-takes-character.md: the reference reading
 * is that of the input itself by mermaid.js with the two rules of its
 * lexer that the divergence names changed (`withoutDivergences` of
 * `@mmd-toolkit/tests/mermaid`).
 */
export function checkCommentDivergences(
  decided: readonly DecidedInput[],
): Promise<ReferenceDivergenceCheck> {
  return checkAgainstReferenceReadings(
    decided,
    "comment-takes-character",
    (text) => ({ text, withoutDivergences: ["comment-takes-character"] }),
  )
}

/**
 * known-divergences/comment-takes-line-break.md: the reference reading
 * is that of the input itself by mermaid.js with the rule of its lexer
 * that the divergence names changed (`withoutDivergences` of
 * `@mmd-toolkit/tests/mermaid`), and with `name-start-reads-unit` removed
 * as well, so that an input of both is read as this specification reads
 * it (`CLASS_READING_REMOVALS`).
 */
export function checkLineBreakCommentDivergences(
  decided: readonly DecidedInput[],
): Promise<ReferenceDivergenceCheck> {
  return checkAgainstReferenceReadings(
    decided,
    "comment-takes-line-break",
    (text) => ({ text, withoutDivergences: CLASS_READING_REMOVALS }),
  )
}

/**
 * known-divergences/name-start-reads-unit.md: the reference reading is
 * that of the input itself by mermaid.js with the rules of its backquote
 * and generic states that the divergence names reordered
 * (`withoutDivergences` of `@mmd-toolkit/tests/mermaid`), and with
 * `comment-takes-line-break` removed as well (`CLASS_READING_REMOVALS`).
 */
export function checkNameStartDivergences(
  decided: readonly DecidedInput[],
): Promise<ReferenceDivergenceCheck> {
  return checkAgainstReferenceReadings(
    decided,
    "name-start-reads-unit",
    (text) => ({ text, withoutDivergences: CLASS_READING_REMOVALS }),
  )
}

/** An unsupported input on which detection disagrees with mermaid.js. */
export interface UnsupportedMismatch {
  readonly from: string
  readonly text: string
  /** The diagram type that the parser detects. */
  readonly ours: string
  readonly mermaid: MermaidOutcome
}

/**
 * The inputs whose diagram type is not implemented yet: mermaid.js must
 * accept them with the same diagram type, or reject them in that diagram's
 * own parser or for embedded data, not by the common rules.
 */
export async function unsupportedMismatches(
  unsupported: readonly UnsupportedInput[],
): Promise<UnsupportedMismatch[]> {
  const mismatches: UnsupportedMismatch[] = []
  for (const { input, diagramType } of unsupported) {
    const mermaid = await runMermaid(
      input.text,
      input.config === undefined ? {} : { config: input.config },
    )
    const agrees = mermaid.accepted
      ? mermaid.diagramType === diagramType
      : !rejectedByCommonRules(input.text, mermaid)
    if (!agrees) {
      mismatches.push({
        from: input.name,
        text: input.text,
        ours: diagramType,
        mermaid,
      })
    }
  }
  return mismatches
}
