/**
 * The rule `quadrant-no-duplicate-description`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { RuleTester } from "eslint"
import { quadrantNoDuplicateDescription } from "../../src/rules/quadrant-no-duplicate-description.ts"
import { testRule } from "../rule-test.ts"

testRule("quadrant-no-duplicate-description", quadrantNoDuplicateDescription)

new RuleTester(LANGUAGE_CONFIG).run(
  "quadrant-no-duplicate-description",
  quadrantNoDuplicateDescription,
  {
    valid: [
      {
        name: "valid/quadrant/acc-descr-blocks-cr-and-lf",
        filename:
          "tests/fixtures/rules/quadrant-no-duplicate-description/valid/quadrant/acc-descr-blocks-cr-and-lf-input.mmd",
        code: `quadrantChart
  accDescr {\r    d\r    e\r  }
  accDescr {
    d
    e
  }
  A: [0.3, 0.6]
`,
      },
      {
        name: "valid/quadrant/acc-descr-blocks-crlf-and-lf",
        filename:
          "tests/fixtures/rules/quadrant-no-duplicate-description/valid/quadrant/acc-descr-blocks-crlf-and-lf-input.mmd",
        code: `quadrantChart
  accDescr {\r
    d\r
    e\r
  }\r
  accDescr {
    d
    e
  }
  A: [0.3, 0.6]
`,
      },
    ],
    invalid: [
      {
        name: "invalid/quadrant/description-equal-predecessor-crlf",
        filename:
          "tests/fixtures/rules/quadrant-no-duplicate-description/invalid/quadrant/description-equal-predecessor-crlf-input.mmd",
        code: `quadrantChart\r
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
                output: `quadrantChart\r
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
