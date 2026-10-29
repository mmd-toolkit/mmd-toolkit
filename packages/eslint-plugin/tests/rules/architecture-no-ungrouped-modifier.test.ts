import { LANGUAGE_CONFIG } from "../helpers.ts"
import { RuleTester } from "eslint"
/** The rule on its document examples and fixture files. */
import { architectureNoUngroupedModifier } from "../../src/rules/architecture-no-ungrouped-modifier.ts"
import { testRule } from "../rule-test.ts"

testRule("architecture-no-ungrouped-modifier", architectureNoUngroupedModifier)

new RuleTester(LANGUAGE_CONFIG).run(
  "architecture-no-ungrouped-modifier",
  architectureNoUngroupedModifier,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/architecture/group-junction-right-forward-ungrouped",
        filename:
          "tests/fixtures/rules/architecture-no-ungrouped-modifier/invalid/architecture/group-junction-right-forward-ungrouped-input.mmd",
        code: `architecture-beta\r
a:R -- L:j{group}\r
service a\r
junction j\r
`,
        errors: [
          {
            message:
              "mermaid.js moves this end away from `j` as if it had a group, although it is declared without `in`.",
            line: 2,
            column: 11,
            endLine: 2,
            endColumn: 18,
            suggestions: [
              {
                desc: "Remove this `{group}` modifier.",
                output: `architecture-beta\r
a:R -- L:j\r
service a\r
junction j\r
`,
              },
            ],
          },
        ],
      },
    ],
  },
)
