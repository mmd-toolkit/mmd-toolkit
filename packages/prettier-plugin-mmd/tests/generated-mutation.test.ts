/**
 * Formats mutants of the fixtures of the conformance corpus, for each
 * diagram type that has a printer: each one edit away from a fixture, made
 * by `mutate()` of `@mmd-toolkit/tests`. The same seed always gives the
 * same mutants.
 */
import { describe, expect, it } from "vitest"
import type { DiagramType } from "@mmd-toolkit/tests"
import { loadFixtures } from "@mmd-toolkit/tests"
import { mutate } from "@mmd-toolkit/tests/mutation"
import type { GeneratedInput } from "./generated.ts"
import {
  checkGeneratedInputs,
  DEFAULT_MUTANTS_PER_FIXTURE,
  describeReport,
  mutantsPerFixture,
} from "./generated.ts"

/** The time limit of the test, longer for a larger run. */
const TIMEOUT =
  600_000 * Math.ceil(mutantsPerFixture / DEFAULT_MUTANTS_PER_FIXTURE)
const SEED = 1

/** The diagram types whose fixtures are mutated. */
const diagrams: readonly DiagramType[] = [
  "flowchart",
  "sequence",
  "class",
  "state",
]

/** The mutants of every fixture. */
function* makeMutants(
  fixtures: Awaited<ReturnType<typeof loadFixtures>>,
): Generator<GeneratedInput> {
  for (const fixture of fixtures) {
    const options =
      fixture.config === undefined ? {} : { config: fixture.config }
    for (const mutant of mutate(fixture.input, {
      count: mutantsPerFixture,
      seed: SEED,
    })) {
      yield { text: mutant.text, options }
    }
  }
}

describe.each(diagrams)("mutants of the %s fixtures", (diagram) => {
  it(
    "are formatted without changing the diagram",
    async ({ annotate }) => {
      const fixtures = await loadFixtures(diagram)
      const report = await checkGeneratedInputs(makeMutants(fixtures))
      await annotate(describeReport(report))
      expect(report.checked).toBeGreaterThan(0)
      expect(report.problems).toEqual([])
    },
    TIMEOUT,
  )
})
