/**
 * The rule `venn-no-duplicate-subset`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { RuleTester } from "eslint"
import { vennNoDuplicateSubset } from "../../src/rules/venn-no-duplicate-subset.ts"
import { testRule } from "../rule-test.ts"

testRule("venn-no-duplicate-subset", vennNoDuplicateSubset)

new RuleTester(LANGUAGE_CONFIG).run(
  "venn-no-duplicate-subset",
  vennNoDuplicateSubset,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/venn/set-crlf-name",
        filename:
          "tests/fixtures/rules/venn-no-duplicate-subset/invalid/venn/set-crlf-name-input.mmd",
        code: `venn-beta
set "A\r
B"
set "A
B"
`,
        errors: [
          {
            message:
              "mermaid.js draws this area again; an earlier declaration already has these names.",
            line: 4,
            column: 1,
            endLine: 5,
            endColumn: 3,
          },
        ],
      },
    ],
  },
)
