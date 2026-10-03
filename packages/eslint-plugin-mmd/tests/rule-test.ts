/**
 * Runs the tests of a rule: eslint-snapshot-rule-tester on the cases of
 * `ruleCases`, and, for a rule that offers suggestions, checks on each
 * suggestion of each invalid case. The tester's snapshot shows each suggestion
 * and the text that it gives; the checks add that the parser accepts that
 * text, that the rule reports less there than before, and that no other rule
 * of the plugin reports more, except a rule that the test names as one whose
 * reports a suggestion may reveal: a mistake that the text already holds,
 * which the rewrite makes visible.
 */
import type { Linter, Rule } from "eslint"
import { Linter as LinterClass } from "eslint"
import { SnapshotRuleTester } from "eslint-snapshot-rule-tester"
import { describe, expect, it } from "vitest"
import { parse } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../src/index.ts"
import { rules } from "../src/rules/index.ts"
import { LANGUAGE_CONFIG, withoutByteOrderMark } from "./helpers.ts"
import type { RuleCase } from "./rule-cases.ts"
import { ruleCases } from "./rule-cases.ts"

/**
 * The configuration that enables every implemented rule of the plugin: the
 * rules that have messages to report with.
 */
const IMPLEMENTED_RULES_CONFIG: Linter.Config = {
  ...LANGUAGE_CONFIG,
  rules: Object.fromEntries(
    Object.entries(rules)
      .filter(([, rule]) => Object.keys(rule.meta?.messages ?? {}).length > 0)
      .map(([name]) => [`mmd/${name}`, "error"]),
  ),
}

/**
 * The rules whose reports the suggestions of a rule may reveal: mistakes that
 * the text already holds, which the rewrite makes visible. Any other rule that
 * reports more after a suggestion fails the test. A suggestion that only
 * removes text reveals nothing.
 */
export type RevealedReports =
  | { readonly kind: "none" }
  | {
      readonly kind: "rules"
      /** The rules, by name, each with the mistake that its reports show. */
      readonly rules: Readonly<Record<string, string>>
    }
  | {
      readonly kind: "anyRule"
      /** Why the reports of any rule may be revealed. */
      readonly because: string
    }

/** `text` with the edit of a suggestion applied. */
function applyFix(text: string, fix: Rule.Fix): string {
  return text.slice(0, fix.range[0]) + fix.text + text.slice(fix.range[1])
}

/** The number of reports of each rule in `messages`, by rule id. */
function reportCounts(
  messages: readonly Linter.LintMessage[],
): Map<string, number> {
  const counts = new Map<string, number>()
  for (const message of messages) {
    if (message.ruleId === null) continue
    counts.set(message.ruleId, (counts.get(message.ruleId) ?? 0) + 1)
  }
  return counts
}

/** Whether the suggestions may reveal the reports of the rule `otherId`. */
function mayReveal(revealed: RevealedReports, otherId: string): boolean {
  if (revealed.kind === "none") return false
  if (revealed.kind === "anyRule") return true
  return Object.keys(revealed.rules).some((name) => `mmd/${name}` === otherId)
}

/**
 * Checks each suggestion of the rule `ruleId` on an invalid case, applied to
 * its text: the parser accepts the result, the rule reports less on it, and
 * no other implemented rule reports more, except those in `revealed`.
 */
function checkSuggestions(
  linter: LinterClass,
  ruleId: string,
  testCase: RuleCase,
  revealed: RevealedReports,
): void {
  const text = withoutByteOrderMark(testCase.code)
  const messages = linter.verify(
    text,
    IMPLEMENTED_RULES_CONFIG,
    testCase.filename,
  )
  const before = reportCounts(messages)
  for (const message of messages) {
    if (message.ruleId !== ruleId) continue
    for (const suggestion of message.suggestions ?? []) {
      const output = applyFix(text, suggestion.fix)
      expect(() => parse(output)).not.toThrow()
      const after = reportCounts(
        linter.verify(output, IMPLEMENTED_RULES_CONFIG, testCase.filename),
      )
      expect(after.get(ruleId) ?? 0).toBeLessThan(before.get(ruleId) ?? 0)
      for (const [otherId, count] of after) {
        if (otherId === ruleId || mayReveal(revealed, otherId)) continue
        expect({ ruleId: otherId, count }).toEqual({
          ruleId: otherId,
          count: Math.min(count, before.get(otherId) ?? 0),
        })
      }
    }
  }
}

/**
 * Tests the rule `name` (such as `flowchart/no-ignored-text`) on the examples
 * of its document and on the inputs of its fixture directory (see
 * `ruleCases`).
 */
export function testRule(
  name: string,
  rule: MermaidRuleDefinition,
  revealed: RevealedReports = { kind: "none" },
): void {
  const cases = ruleCases(name)
  // The tester takes the rule types of JavaScript; ESLint runs a rule of any
  // language the same way.
  new SnapshotRuleTester(LANGUAGE_CONFIG).run(
    name,
    rule as unknown as Rule.RuleModule,
    cases,
  )
  if (rule.meta?.hasSuggestions !== true) return
  const ruleId = `mmd/${name}`
  const linter = new LinterClass({ configType: "flat" })
  describe(`${name} suggestions`, () => {
    it("are checked with the rule of the plugin", () => {
      expect(rules[name]).toBe(rule)
      if (revealed.kind === "rules") {
        for (const revealedName of Object.keys(revealed.rules)) {
          expect(rules).toHaveProperty([revealedName])
        }
      }
    })
    it.each(cases.invalid.map((testCase) => [testCase.name, testCase]))(
      "%s",
      (_name, testCase) => {
        checkSuggestions(linter, ruleId, testCase, revealed)
      },
    )
    it("are offered on some invalid case", () => {
      const offered = cases.invalid.some((testCase) =>
        linter
          .verify(
            withoutByteOrderMark(testCase.code),
            IMPLEMENTED_RULES_CONFIG,
            testCase.filename,
          )
          .some(
            (message) =>
              message.ruleId === ruleId &&
              (message.suggestions ?? []).length > 0,
          ),
      )
      expect(offered).toBe(true)
    })
  })
}
