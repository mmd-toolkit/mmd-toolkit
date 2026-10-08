/**
 * The rule `sequence-no-duplicate-title`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { RuleTester } from "eslint"
import { sequenceNoDuplicateTitle } from "../../src/rules/sequence-no-duplicate-title.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("sequence-no-duplicate-title", sequenceNoDuplicateTitle)

new RuleTester(LANGUAGE_CONFIG).run(
  "sequence-no-duplicate-title",
  sequenceNoDuplicateTitle,
  {
    valid: [],
    invalid: [
      {
        name: "a line separator after an accessibility title",
        filename: "input.mmd",
        code: `sequenceDiagram
accTitle: t
accTitle:\u2028foo
`,
        errors: [
          {
            message:
              "mermaid.js replaces the accessible title set on line 2 with the one of this `accTitle`.",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 14,
            suggestions: [],
          },
        ],
      },
    ],
  },
)
