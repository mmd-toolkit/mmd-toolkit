/**
 * Runs eslint-snapshot-rule-tester on the examples of a rule's English
 * document and on the inputs of its fixture directory. The snapshots record
 * the reports and the text of each suggestion.
 */
import type { Rule } from "eslint"
import { SnapshotRuleTester } from "eslint-snapshot-rule-tester"
import type { MermaidRuleDefinition } from "../src/index.ts"
import { LANGUAGE_CONFIG } from "./helpers.ts"
import type { CorpusCases } from "./rule-cases.ts"
import { ruleCases } from "./rule-cases.ts"

/**
 * Tests the reports and suggestions of `name` on its document and fixtures.
 * A rule that cites the fixtures of the conformance corpus has no fixture
 * directory: its test builds those cases and passes them as `corpusCases`.
 */
export function testRule(
  name: string,
  rule: MermaidRuleDefinition,
  corpusCases?: CorpusCases,
): void {
  // The tester takes the rule types of JavaScript; ESLint runs a rule of any
  // language the same way.
  new SnapshotRuleTester(LANGUAGE_CONFIG).run(
    name,
    rule as unknown as Rule.RuleModule,
    ruleCases(name, corpusCases),
  )
}
