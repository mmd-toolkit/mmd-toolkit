/**
 * The rule `xychart-no-duplicate-title`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { RuleTester } from "eslint"
import { xychartNoDuplicateTitle } from "../../src/rules/xychart-no-duplicate-title.ts"
import { testRule } from "../rule-test.ts"

testRule("xychart-no-duplicate-title", xychartNoDuplicateTitle)

new RuleTester(LANGUAGE_CONFIG).run(
  "xychart-no-duplicate-title",
  xychartNoDuplicateTitle,
  {
    valid: [],
    invalid: [
      {
        name: "invalid/xychart/title-twice-crlf",
        filename:
          "tests/fixtures/rules/xychart-no-duplicate-title/invalid/xychart/title-twice-crlf-input.mmd",
        code: `xychart\r
  title a\r
  title b\r
  line [1]\r
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier title with the one of this `title`.",
            line: 3,
            column: 3,
            endLine: 3,
            endColumn: 10,
          },
        ],
      },
    ],
  },
)
