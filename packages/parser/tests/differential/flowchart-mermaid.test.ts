/**
 * Layer 4 for the flowchart: compares `parse()` with `mermaid.parse()` of
 * the pinned mermaid.js on mutants of the flowchart fixtures, each one edit
 * away from a fixture input: acceptance, the diagram type, and the Db
 * summary built from the tree. `mermaid-comparison.ts` says how each outcome
 * of `parse()` is compared.
 */
import { describe, expect, it } from "vitest"
import { loadFixtures } from "@mmd-toolkit/tests"
import type { MutationInput } from "@mmd-toolkit/tests/mutation"
import { mutate } from "@mmd-toolkit/tests/mutation"
import {
  checkDirectiveDivergences,
  checkEmptyFormDivergences,
  checkHtmlTagDivergences,
  checkReservedClickDivergences,
  compareDecided,
  inputsByOutcome,
  unsupportedMismatches,
} from "./mermaid-comparison.ts"
import { runSizeFromEnvironment, timeoutFor } from "./run-size.ts"

/**
 * Mutants per fixture: 1, kept small for CI, or what
 * `MMD_MUTANTS_PER_FIXTURE` gives. Raising it to 20 (about 27,000 inputs,
 * several minutes) is the full check.
 */
const MUTANTS_PER_FIXTURE = runSizeFromEnvironment("MMD_MUTANTS_PER_FIXTURE", 1)

/** The seed of the mutations. */
const SEED = 1

describe("the flowchart parser agrees with mermaid.js", async () => {
  const mutants: MutationInput[] = []
  for (const fixture of await loadFixtures("flowchart")) {
    for (const mutant of mutate(fixture.input, {
      seed: SEED,
      count: MUTANTS_PER_FIXTURE,
    })) {
      mutants.push({
        name: `${fixture.name}: ${mutant.description}`,
        text: mutant.text,
        ...(fixture.config === undefined ? {} : { config: fixture.config }),
      })
    }
  }
  const { decided, unsupported } = inputsByOutcome(mutants)
  const timeout = timeoutFor(decided.length + unsupported.length)

  it(
    "accepts and rejects what mermaid.js does, with the same diagram type and Db",
    async () => {
      const comparison = await compareDecided(decided)
      expect(comparison.skipped).toEqual([])
      expect(
        comparison.mismatches.map((mismatch) => ({
          from: mismatch.from,
          text: mismatch.text,
          kind: mismatch.kind,
        })),
      ).toEqual([])
      expect(comparison.compared).toBe(decided.length)
      // Guards against the check passing vacuously.
      expect(comparison.comparedParts.diagramType).toBeGreaterThan(0)
      expect(comparison.comparedParts.db).toBeGreaterThan(0)

      // A declared `embedded-data-opaque` difference must be a rejection of
      // mermaid.js for embedded data, never a difference in type or Db.
      expect(
        comparison.unexplainedEmbeddedData.map((divergence) => ({
          text: divergence.text,
          kind: divergence.kind,
          mermaid: divergence.mermaid,
        })),
      ).toEqual([])
      expect(
        comparison.divergences.filter(
          (divergence) => divergence.id === "embedded-data-opaque",
        ).length,
      ).toBeGreaterThan(0)
    },
    timeout,
  )

  it(
    "differs from mermaid.js on `directive-as-token-boundary` only because of a directive",
    async () => {
      const check = await checkDirectiveDivergences(decided)
      expect(check.mismatches).toEqual([])
      expect(
        check.unexplained.map((divergence) => ({
          from: divergence.from,
          text: divergence.text,
          kind: divergence.kind,
        })),
      ).toEqual([])
      // Guards against the check passing vacuously.
      expect(check.divergences.length).toBeGreaterThan(0)
    },
    timeout,
  )

  it(
    "differs from mermaid.js on `click-reserved-word` only because of a `click` that does not start a click statement",
    async () => {
      const check = await checkReservedClickDivergences(decided)
      expect(check.mismatches).toEqual([])
      expect(
        check.unexplained.map((divergence) => ({
          from: divergence.from,
          text: divergence.text,
          kind: divergence.kind,
        })),
      ).toEqual([])
      // Guards against the check passing vacuously.
      expect(check.divergences.length).toBeGreaterThan(0)
    },
    timeout,
  )

  it(
    "differs from mermaid.js on `tokenless-empty-forms` only because of an empty form",
    async () => {
      const check = await checkEmptyFormDivergences(decided)
      expect(check.mismatches).toEqual([])
      expect(
        check.unexplained.map((divergence) => ({
          from: divergence.from,
          text: divergence.text,
          kind: divergence.kind,
        })),
      ).toEqual([])
      // Guards against the check passing vacuously.
      expect(check.divergences.length).toBeGreaterThan(0)
    },
    timeout,
  )

  it(
    "differs from mermaid.js on `html-tag-in-frontmatter` only because of a tag that starts in the frontmatter",
    async () => {
      const check = await checkHtmlTagDivergences(decided)
      expect(check.mismatches).toEqual([])
    },
    timeout,
  )

  it(
    "detects the same diagram type as mermaid.js where a mutant has a type that is not supported yet",
    async () => {
      expect(await unsupportedMismatches(unsupported)).toEqual([])
    },
    timeout,
  )
})
