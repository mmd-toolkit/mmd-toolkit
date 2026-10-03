/**
 * The rule `flowchart/no-empty-description-block`, on the examples of its document and on the
 * fixtures that record what mermaid.js does with an empty `accDescr` block.
 */
import type { Rule } from "eslint"
import { Linter } from "eslint"
import { describe, expect, it } from "vitest"
import { noEmptyDescriptionBlock } from "../../../src/rules/flowchart/no-empty-description-block.ts"
import { LANGUAGE_CONFIG } from "../../helpers.ts"
import { testRule } from "../../rule-test.ts"

testRule("flowchart/no-empty-description-block", noEmptyDescriptionBlock)

// A U+2028 or a U+2029 cannot stand in a fixture file (see `docs/development.md`),
// so these inputs are written with escapes. Neither is a line terminator of the
// tree, but both take what follows into the name text of a subgraph.
describe("an empty block after a U+2028 or a U+2029 in a subgraph name", () => {
  const linter = new Linter({ configType: "flat" })
  // The linter takes the rule types of JavaScript; ESLint runs a rule of any
  // language the same way.
  const rule = noEmptyDescriptionBlock as unknown as Rule.RuleModule
  const config: Linter.Config[] = [
    LANGUAGE_CONFIG,
    {
      files: ["**/*.mmd"],
      plugins: {
        test: {
          rules: { "no-empty-description-block": rule },
        },
      },
      rules: { "test/no-empty-description-block": "error" },
    },
  ]

  /** The messages of the rule on `code`: its text, and its suggestions. */
  function reports(code: string): { message: string; suggestions: number }[] {
    return linter.verify(code, config, "input.mmd").map((message) => ({
      message: message.message,
      suggestions: message.suggestions?.length ?? 0,
    }))
  }

  const generatedId = "so the subgraph gets a generated id"

  it.each([
    ["U+2028", "\u2028"],
    ["U+2029", "\u2029"],
  ])(
    "on the same physical line after a %s gets the message and no suggestion",
    (_name, separator) => {
      const [report, ...others] = reports(
        `flowchart LR\nsubgraph S${separator} accDescr {}\nA\nend\n`,
      )
      expect(others).toEqual([])
      expect(report?.message).toContain(generatedId)
      expect(report?.suggestions).toBe(0)
    },
  )

  it.each([
    ["U+2028", "\u2028"],
    ["U+2029", "\u2029"],
  ])(
    "on a comment line after a %s gets the message and no suggestion",
    (_name, separator) => {
      const [report, ...others] = reports(
        `flowchart LR\nsubgraph S${separator}\n%% c\n accDescr {}\nA\nend\n`,
      )
      expect(others).toEqual([])
      expect(report?.message).toContain(generatedId)
      expect(report?.suggestions).toBe(0)
    },
  )

  it("still gets a suggestion when it starts a line and nothing stands before it", () => {
    const [report, ...others] = reports(
      "flowchart LR\nsubgraph S\n accDescr {}\nA\nend\n",
    )
    expect(others).toEqual([])
    expect(report?.suggestions).toBe(1)
  })
})
