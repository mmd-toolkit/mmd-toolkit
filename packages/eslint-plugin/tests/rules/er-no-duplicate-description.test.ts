/**
 * The rule `er-no-duplicate-description`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { RuleTester } from "eslint"
import { erNoDuplicateDescription } from "../../src/rules/er-no-duplicate-description.ts"
import { testRule } from "../rule-test.ts"

testRule("er-no-duplicate-description", erNoDuplicateDescription)

new RuleTester(LANGUAGE_CONFIG).run(
  "er-no-duplicate-description",
  erNoDuplicateDescription,
  {
    valid: [
      {
        name: "valid/er/acc-descr-blocks-cr-and-lf",
        filename:
          "tests/fixtures/rules/er-no-duplicate-description/valid/er/acc-descr-blocks-cr-and-lf-input.mmd",
        code: `erDiagram
  accDescr {\r    d\r    e\r  }
  accDescr {
    d
    e
  }
  A
`,
      },
      {
        name: "valid/er/acc-descr-blocks-crlf-and-lf",
        filename:
          "tests/fixtures/rules/er-no-duplicate-description/valid/er/acc-descr-blocks-crlf-and-lf-input.mmd",
        code: `erDiagram\r
  accDescr {\r
    d\r
    e\r
  }\r
  accDescr {
  d

        e
  }
  A
`,
      },
    ],
    invalid: [
      {
        name: "invalid/er/description-equal-predecessor-crlf",
        filename:
          "tests/fixtures/rules/er-no-duplicate-description/invalid/er/description-equal-predecessor-crlf-input.mmd",
        code: `erDiagram\r
accDescr: A\r
accDescr: A\r
accDescr: B\r
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier description with the one of this `accDescr`.",
            line: 4,
            column: 1,
            endLine: 4,
            endColumn: 12,
            suggestions: [
              {
                desc: "Remove this statement.",
                output: `erDiagram\r
accDescr: A\r
accDescr: A\r
`,
              },
            ],
          },
        ],
      },
    ],
  },
)
