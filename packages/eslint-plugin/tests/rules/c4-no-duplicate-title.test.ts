/**
 * The rule `c4-no-duplicate-title`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { RuleTester } from "eslint"
import { c4NoDuplicateTitle } from "../../src/rules/c4-no-duplicate-title.ts"
import { testRule } from "../rule-test.ts"

testRule("c4-no-duplicate-title", c4NoDuplicateTitle)

new RuleTester(LANGUAGE_CONFIG).run(
  "c4-no-duplicate-title",
  c4NoDuplicateTitle,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/c4/title-crlf",
        filename:
          "tests/fixtures/rules/c4-no-duplicate-title/invalid/c4/title-crlf-input.mmd",
        code: `C4Context\r
title Banking\r
title Payments\r
`,
        errors: [
          {
            message: "mermaid.js replaces the earlier title with this `title`.",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 15,
          },
        ],
      },
    ],
  },
)
