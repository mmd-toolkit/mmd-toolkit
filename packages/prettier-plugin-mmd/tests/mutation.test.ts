/**
 * Formats mutants of the fixtures of the conformance corpus, for each
 * diagram type that has a printer: each one edit away from a fixture, made
 * by `mutate()` of `@mmd-toolkit/tests`, with a mutant from one fixture in
 * `FIXTURE_STEP` of each kind of fixture, a kind being the start of its name
 * (`lex`, `db`, `gram`, ...). The same seed always gives the same mutants.
 */
import type { DiagramType, Fixture } from "@mmd-toolkit/tests"
import { loadFixtures } from "@mmd-toolkit/tests"
import { mutate } from "@mmd-toolkit/tests/mutation"
import type { GeneratedInput } from "./generated.ts"
import { defineCheckedGroups } from "./checked-groups.ts"

const SEED = 1

/** One fixture in this many of each kind has a mutant. */
const FIXTURE_STEP = 3

/** The diagram types whose fixtures are mutated. */
const diagrams: readonly DiagramType[] = [
  "flowchart",
  "sequence",
  "class",
  "state",
]

/** The kind of a fixture: the start of its name, up to the first `-`. */
function kindOf(fixture: Fixture): string {
  const dash = fixture.name.indexOf("-")
  return dash === -1 ? fixture.name : fixture.name.slice(0, dash)
}

/** The mutants of one fixture in `FIXTURE_STEP` of each kind. */
function makeMutants(fixtures: readonly Fixture[]): GeneratedInput[] {
  const counts = new Map<string, number>()
  const inputs: GeneratedInput[] = []
  for (const fixture of fixtures) {
    const kind = kindOf(fixture)
    const count = counts.get(kind) ?? 0
    counts.set(kind, count + 1)
    if (count % FIXTURE_STEP !== 0) continue
    const options =
      fixture.config === undefined ? {} : { config: fixture.config }
    for (const mutant of mutate(fixture.input, { count: 1, seed: SEED })) {
      inputs.push({ text: mutant.text, options })
    }
  }
  return inputs
}

defineCheckedGroups(
  "mutants of the fixtures",
  await Promise.all(
    diagrams.map(
      async (diagram) =>
        [
          `mutants of the ${diagram} fixtures`,
          makeMutants(await loadFixtures(diagram)),
        ] as const,
    ),
  ),
)
