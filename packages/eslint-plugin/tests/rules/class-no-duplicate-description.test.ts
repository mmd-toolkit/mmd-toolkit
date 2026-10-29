/**
 * The rule `class-no-duplicate-description`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { RuleTester } from "eslint"
import { classNoDuplicateDescription } from "../../src/rules/class-no-duplicate-description.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("class-no-duplicate-description", classNoDuplicateDescription)

new RuleTester(LANGUAGE_CONFIG).run(
  "class-no-duplicate-description",
  classNoDuplicateDescription,
  {
    valid: [],
    invalid: [
      {
        name: "a line separator after a description",
        filename: "input.mmd",
        code: `classDiagram
accDescr: d
accDescr:\u2028class A
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier description with the one of this `accDescr`.",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 18,
            suggestions: [],
          },
        ],
      },
    ],
  },
)
