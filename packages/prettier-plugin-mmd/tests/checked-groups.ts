/**
 * Defines the tests of groups of generated inputs: each group is cut into
 * tests of at most `INPUTS_PER_TEST` inputs, so that no test is one huge
 * loop and a failure names the group.
 */
import { describe, expect, it } from "vitest"
import type { GeneratedInput } from "./generated.ts"
import { checkGeneratedInputs, describeReport } from "./generated.ts"

/** The most inputs of one test. */
const INPUTS_PER_TEST = 150

/** The time limit of one test. */
const TEST_TIMEOUT = 120_000

/** A group of inputs, with its name. */
export type InputGroup = readonly [string, readonly GeneratedInput[]]

/** Cuts a list into the lists of one test. */
function* chunks<T>(list: readonly T[]): Generator<readonly T[]> {
  for (let start = 0; start < list.length; start += INPUTS_PER_TEST) {
    yield list.slice(start, start + INPUTS_PER_TEST)
  }
}

/** How the inputs of the groups are checked. */
export interface CheckedGroupsOptions {
  /**
   * Whether every input must be one that the parser accepts: an input that
   * it rejects is skipped by the check, and a list that holds one would
   * stop checking it without a word.
   */
  readonly requiresParsed?: boolean
}

/** Defines the tests of the groups, under a title. */
export function defineCheckedGroups(
  title: string,
  groups: readonly InputGroup[],
  { requiresParsed = false }: CheckedGroupsOptions = {},
): void {
  describe(title, () => {
    it("has inputs", () => {
      expect(groups.some(([, inputs]) => inputs.length > 0)).toBe(true)
    })
    for (const [name, inputs] of groups) {
      describe(name, () => {
        for (const [index, chunk] of [...chunks(inputs)].entries()) {
          it(
            `part ${index + 1}`,
            async ({ annotate }) => {
              const report = await checkGeneratedInputs(chunk)
              await annotate(describeReport(report))
              expect(report.problems).toEqual([])
              if (requiresParsed) {
                expect(report.checked + report.checkedRejected).toBe(
                  report.made,
                )
              }
            },
            TEST_TIMEOUT,
          )
        }
      })
    }
  })
}
