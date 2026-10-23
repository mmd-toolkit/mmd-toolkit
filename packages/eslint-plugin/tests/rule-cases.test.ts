/**
 * Checks the examples of every rule document as `rule-cases.ts` reads
 * them: each document has incorrect and correct examples, and the parser
 * accepts each example, since the tester fails on a parse error and a rule
 * reports only text that mermaid.js accepts.
 */
import { describe, expect, it } from "vitest"
import { parse } from "@mmd-toolkit/parser"
import { rules } from "../src/rules/index.ts"
import { ruleExamples } from "./rule-cases.ts"

describe("the examples of the rule documents", () => {
  it.each(Object.keys(rules))(
    "%s has incorrect and correct examples",
    (name) => {
      const examples = ruleExamples(name)
      expect(examples.incorrect.length).toBeGreaterThan(0)
      expect(examples.correct.length).toBeGreaterThan(0)
    },
  )

  it.each(
    Object.keys(rules).flatMap((name) => {
      const examples = ruleExamples(name)
      return [
        ...examples.incorrect.map((code, index) => [
          `${name} incorrect ${index + 1}`,
          code,
        ]),
        ...examples.correct.map((code, index) => [
          `${name} correct ${index + 1}`,
          code,
        ]),
      ]
    }),
  )("%s is accepted by the parser", (_name, code) => {
    expect(() => parse(code)).not.toThrow()
  })
})
