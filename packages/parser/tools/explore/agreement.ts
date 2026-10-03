/**
 * The whole check of decided inputs against the pinned mermaid.js, for the
 * explorations that check every input in the same way (the insertion
 * explorations): the tree check of `@mmd-toolkit/tests` finds no problem in
 * the tree of an accepted input, and `parse()` agrees with mermaid.js, every
 * difference a declared known divergence that its own cause explains
 * (`mermaid-comparison.ts`).
 */
import { problemsOfTree } from "../../tests/helpers/tree-problems.ts"
import type { DecidedInput, InputsByOutcome } from "./mermaid-comparison.ts"
import {
  checkCommentDivergences,
  checkDirectiveDivergences,
  checkEmptyFormDivergences,
  checkHtmlTagDivergences,
  checkLineBreakCommentDivergences,
  checkNameStartDivergences,
  checkReservedClickDivergences,
  compareDecided,
  unsupportedMismatches,
} from "./mermaid-comparison.ts"

/** The names and texts of the decided inputs `decided` in whose tree the tree check finds a problem, with the first problem. */
export function treeProblemsOf(decided: readonly DecidedInput[]): string[] {
  const problems: string[] = []
  for (const { input, outcome } of decided) {
    if (outcome.kind !== "tree") continue
    const [first] = problemsOfTree(input.text, outcome.root)
    if (first !== undefined) {
      problems.push(
        `${input.name}: ${JSON.stringify(input.text)}: ${first.where}: ${first.message}`,
      )
    }
  }
  return problems
}

/**
 * Every disagreement of the inputs with mermaid.js, one line each with the
 * input: a comparison that was skipped or did not happen, a difference that
 * is not a declared known divergence, and a declared difference that its
 * own cause does not explain. Empty when the inputs agree.
 */
export async function disagreementsOf({
  decided,
  unsupported,
}: InputsByOutcome): Promise<string[]> {
  const problems: string[] = []
  const comparison = await compareDecided(decided)
  for (const skipped of comparison.skipped) {
    problems.push(`skipped: ${JSON.stringify(skipped)}`)
  }
  if (comparison.compared !== decided.length) {
    problems.push(`compared ${comparison.compared} of ${decided.length}`)
  }
  for (const mismatch of comparison.mismatches) {
    problems.push(
      `${mismatch.kind} differs: ${mismatch.from}: ${JSON.stringify(mismatch.text)}`,
    )
  }
  for (const divergence of [
    ...comparison.unexplainedEmbeddedData,
    ...comparison.unexplainedHeaderless,
  ]) {
    problems.push(
      `${divergence.id} not explained: ${divergence.from}: ${JSON.stringify(divergence.text)}`,
    )
  }
  for (const check of [
    checkDirectiveDivergences,
    checkReservedClickDivergences,
    checkEmptyFormDivergences,
  ]) {
    const result = await check(decided)
    for (const mismatch of result.mismatches) {
      problems.push(
        `reference differs: ${mismatch.from}: ${JSON.stringify(mismatch.text)}`,
      )
    }
    for (const divergence of result.unexplained) {
      problems.push(
        `${divergence.id} not explained: ${divergence.from}: ${JSON.stringify(divergence.text)}`,
      )
    }
  }
  for (const check of [
    checkHtmlTagDivergences,
    checkCommentDivergences,
    checkLineBreakCommentDivergences,
    checkNameStartDivergences,
  ]) {
    for (const mismatch of (await check(decided)).mismatches) {
      problems.push(
        `reading differs: ${mismatch.from}: ${JSON.stringify(mismatch.text)}`,
      )
    }
  }
  for (const mismatch of await unsupportedMismatches(unsupported)) {
    problems.push(
      `type differs from ${mismatch.ours}: ${mismatch.from}: ${JSON.stringify(mismatch.text)}`,
    )
  }
  return problems
}
