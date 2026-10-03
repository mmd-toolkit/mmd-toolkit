/**
 * An exploration of the diagram-independent rules: compares `parse()` with
 * `mermaid.parse()` of the pinned mermaid.js on the inputs of
 * `common-inputs.ts`. `mermaid-comparison.ts` says how each outcome of
 * `parse()` is compared.
 */
import { describe, expect, it } from "vitest"
import { generatedInputs } from "@mmd-toolkit/tests/mutation"
import { commonSeeds, generateCommonInputs } from "./common-inputs.ts"
import {
  checkDirectiveDivergences,
  checkEmptyFormDivergences,
  checkHtmlTagDivergences,
  checkReservedClickDivergences,
  compareDecided,
  inputsByOutcome,
  unsupportedMismatches,
} from "./mermaid-comparison.ts"
import { timeoutFor } from "./run-size.ts"

/** The random inputs per seed, to which `generateCommonInputs` adds its fixed cases. */
const COUNT = 300

describe("common rules agree with mermaid.js", () => {
  const { decided, unsupported } = inputsByOutcome(
    generatedInputs(generateCommonInputs, commonSeeds, COUNT, "common"),
  )
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
      // The generated inputs seldom have such a `click`, so no count is
      // required here; the flowchart comparison requires one.
      const check = await checkReservedClickDivergences(decided)
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
      // The generated inputs seldom have an empty form, so no count is
      // required here; the flowchart comparison requires one.
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
    "differs from mermaid.js on `html-tag-in-frontmatter` only because of a tag that starts in the frontmatter",
    async () => {
      const check = await checkHtmlTagDivergences(decided)
      expect(check.mismatches).toEqual([])
      // Guards against the check passing vacuously, for either outcome.
      expect(check.trees).toBeGreaterThan(0)
      expect(check.rejections).toBeGreaterThan(0)
    },
    timeout,
  )

  it(
    "detects the same diagram type as mermaid.js for unsupported types",
    async () => {
      expect(await unsupportedMismatches(unsupported)).toEqual([])
      expect(unsupported.length).toBeGreaterThan(0)
    },
    timeout,
  )
})
