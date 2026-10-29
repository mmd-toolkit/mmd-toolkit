import { Linter } from "eslint"
import { describe, expect, it } from "vitest"
import plugin from "../src/index.ts"
import { LANGUAGE_CONFIG, observe } from "./helpers.ts"
import { ruleCases } from "./rule-cases.ts"

/** Fixed rule inputs exercise the prior history that a removal exposes. */
const RULES = [
  "gantt-no-duplicate-setting",
  "requirement-no-duplicate-field",
  "mindmap-no-duplicate-decoration",
  "quadrant-no-duplicate-style",
  "quadrant-no-redefined-class",
  "quadrant-no-redefined-quadrant",
  "block-no-duplicate-columns",
  "block-no-redefined-style",
  "venn-no-duplicate-style",
  "flowchart-no-duplicate-direction",
  "agentflow-no-duplicate-direction",
  "usecase-no-duplicate-direction",
  "usecase-no-duplicate-metadata",
  "usecase-no-redefined-class",
]

describe("removing the earlier setter", () => {
  it.each(RULES)(
    "%s does not report the same place after removePrevious",
    (name) => {
      const config: Linter.Config = {
        ...LANGUAGE_CONFIG,
        plugins: { m: plugin },
        language: "m/mermaid",
        rules: { [`m/${name}`]: "error" },
      }
      const linter = new Linter()
      let checked = 0
      for (const input of ruleCases(name).invalid) {
        const source = observe(input.code).sourceCode
        if (source === null) throw new Error("A fixed rule input must parse")
        for (const message of linter.verify(input.code, config, "input.mmd")) {
          for (const suggestion of message.suggestions ?? []) {
            if (suggestion.messageId !== "removePrevious") continue
            checked++
            const { range, text } = suggestion.fix
            const start = source.getIndexFromLoc({
              line: message.line,
              column: message.column - 1,
            })
            const moved =
              range[1] <= start
                ? start + text.length - (range[1] - range[0])
                : start
            expect(range[1] <= start || start < range[0], input.name).toBe(true)
            const result =
              input.code.slice(0, range[0]) + text + input.code.slice(range[1])
            const after = observe(result).sourceCode
            if (after === null)
              throw new Error("A removal must keep accepted syntax")
            const remaining = linter.verify(result, config, "input.mmd")
            expect(
              remaining.some(
                (report) =>
                  after.getIndexFromLoc({
                    line: report.line,
                    column: report.column - 1,
                  }) === moved,
              ),
              input.name,
            ).toBe(false)
          }
        }
      }
      expect(checked).toBeGreaterThan(0)
    },
  )
})
