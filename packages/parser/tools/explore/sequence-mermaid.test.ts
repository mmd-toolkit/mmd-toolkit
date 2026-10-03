/**
 * An exploration of the sequence diagram: compares `parse()` with
 * `mermaid.parse()` of the pinned mermaid.js on mutants of the sequence
 * fixtures, each one edit away from a fixture input, and on the accepted
 * fixture inputs with `%% c` inserted after a character, the inputs of
 * `comment-takes-character`: acceptance, the diagram type, and the Db summary
 * built from the tree. `mermaid-comparison.ts` says how each outcome of
 * `parse()` is compared.
 */
import { describe, expect, it } from "vitest"
import { loadFixtures } from "@mmd-toolkit/tests"
import type { MutationInput } from "@mmd-toolkit/tests/mutation"
import { mutate } from "@mmd-toolkit/tests/mutation"
import {
  checkCommentDivergences,
  checkDirectiveDivergences,
  checkEmptyFormDivergences,
  checkHtmlTagDivergences,
  checkIgnoredSemicolonDivergences,
  compareDecided,
  inputsByOutcome,
  unsupportedMismatches,
} from "./mermaid-comparison.ts"
import type { InputsByOutcome } from "./mermaid-comparison.ts"
import { commentsAfterMatchStarts } from "../../tests/helpers/reference-inputs.ts"
import { timeoutFor } from "./run-size.ts"

const MUTANTS_PER_FIXTURE = 1

/** The seed of the mutations. */
const SEED = 1

/** Inputs with `%% c` inserted, spread evenly over all of them. */
const COMMENT_INPUTS = 300

/**
 * Registers the checks of the inputs `inputs`, decided and not: every
 * difference from mermaid.js is a declared known divergence, and each
 * divergence is explained by its own cause.
 */
function checkAgreement({ decided, unsupported }: InputsByOutcome): void {
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
    },
    timeout,
  )

  it(
    "differs from mermaid.js on `ignored-semicolon-as-token-boundary` only because of a `;` that the line rule ignores",
    async () => {
      const check = await checkIgnoredSemicolonDivergences(decided)
      expect(check.mismatches).toEqual([])
      expect(
        check.unexplained.map((divergence) => ({
          from: divergence.from,
          text: divergence.text,
          kind: divergence.kind,
        })),
      ).toEqual([])
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
    },
    timeout,
  )

  it(
    "differs from mermaid.js on `comment-takes-character` only because of the character before a `%%`",
    async () => {
      const check = await checkCommentDivergences(decided)
      expect(check.mismatches).toEqual([])
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
}

describe("the sequence parser agrees with mermaid.js", async () => {
  const mutants: MutationInput[] = []
  for (const fixture of await loadFixtures("sequence")) {
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
  checkAgreement(inputsByOutcome(mutants))
})

describe("the sequence parser agrees with mermaid.js on `%% c` after each character", async () => {
  const all: MutationInput[] = []
  const texts = new Set<string>()
  for (const fixture of await loadFixtures("sequence")) {
    // A fixture of another known divergence would give inputs of two
    // divergences at once; the claim of the specification is made apart
    // from the other divergences.
    if (
      !fixture.expected.accepted ||
      (fixture.knownDivergence !== undefined &&
        fixture.knownDivergence !== "comment-takes-character")
    ) {
      continue
    }
    const characters = [...fixture.input]
    for (let index = 1; index <= characters.length; index += 1) {
      const text = [
        ...characters.slice(0, index),
        "%% c",
        ...characters.slice(index),
      ].join("")
      if (texts.has(text)) continue
      texts.add(text)
      all.push({
        name: `${fixture.name}: %% c after character ${index}`,
        text,
        ...(fixture.config === undefined ? {} : { config: fixture.config }),
      })
    }
  }
  const stride = Math.max(1, Math.floor(all.length / COMMENT_INPUTS))
  const inputs = all.filter((_input, index) => index % stride === 0)

  it(
    "has the inputs that it is asked for, and inputs of `comment-takes-character` among them",
    () => {
      expect(inputs.length).toBeGreaterThanOrEqual(
        Math.min(COMMENT_INPUTS, all.length),
      )
      // Guards against the check of the divergence passing vacuously.
      expect(
        inputs.filter(
          (input) => (commentsAfterMatchStarts(input.text)?.length ?? 0) > 0,
        ).length,
      ).toBeGreaterThan(0)
    },
    timeoutFor(inputs.length),
  )

  checkAgreement(inputsByOutcome(inputs))
})
