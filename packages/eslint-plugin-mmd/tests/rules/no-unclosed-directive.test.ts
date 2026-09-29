/**
 * The rule `no-unclosed-directive`, with the inputs of the fixtures that its
 * document cites.
 */
import type { Rule } from "eslint"
import { SnapshotRuleTester } from "eslint-snapshot-rule-tester"
import { loadFixtures } from "@mmd-toolkit/tests"
import plugin from "../../src/index.ts"
import { noUnclosedDirective } from "../../src/rules/no-unclosed-directive.ts"

const fixtures = new Map(
  (await loadFixtures("common")).map((fixture) => [fixture.name, fixture]),
)

/** The test case of the input of a fixture of `common/`. */
function fixtureCase(name: string): {
  name: string
  filename: string
  code: string
} {
  const fixture = fixtures.get(name)
  if (fixture === undefined) throw new Error(`No fixture common/${name}`)
  return {
    name: `common/${name}`,
    filename: `common/${name}.mmd`,
    code: fixture.input,
  }
}

const tester = new SnapshotRuleTester(plugin.configs.recommended)

// The tester takes the rule types of JavaScript; ESLint runs a rule of any
// language the same way.
tester.run(
  "no-unclosed-directive",
  noUnclosedDirective as unknown as Rule.RuleModule,
  {
    valid: [fixtureCase("directive-init-theme")],
    invalid: [
      fixtureCase("directive-unclosed"),
      fixtureCase("directive-unclosed-after-header"),
      fixtureCase("directive-word-argument-unclosed-next-line"),
    ],
  },
)
