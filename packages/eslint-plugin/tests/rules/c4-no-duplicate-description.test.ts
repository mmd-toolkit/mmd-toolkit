/**
 * The rule `c4-no-duplicate-description`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { RuleTester } from "eslint"
import { c4NoDuplicateDescription } from "../../src/rules/c4-no-duplicate-description.ts"
import { testRule } from "../rule-test.ts"

testRule("c4-no-duplicate-description", c4NoDuplicateDescription)

new RuleTester(LANGUAGE_CONFIG).run(
  "c4-no-duplicate-description",
  c4NoDuplicateDescription,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/c4/description-crlf",
        filename:
          "tests/fixtures/rules/c4-no-duplicate-description/invalid/c4/description-crlf-input.mmd",
        code: `C4Context\r
accDescr: Customers\r
accDescr: Administrators\r
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier description with this description.",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 25,
          },
        ],
      },
    ],
  },
)
