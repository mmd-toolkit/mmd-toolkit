/**
 * The rule `gantt-no-duplicate-description`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { RuleTester } from "eslint"
import { ganttNoDuplicateDescription } from "../../src/rules/gantt-no-duplicate-description.ts"
import { testRule } from "../rule-test.ts"

testRule("gantt-no-duplicate-description", ganttNoDuplicateDescription)

new RuleTester(LANGUAGE_CONFIG).run(
  "gantt-no-duplicate-description",
  ganttNoDuplicateDescription,
  {
    valid: [
      {
        name: "valid/gantt/acc-descr-blocks-cr-and-lf",
        filename:
          "tests/fixtures/rules/gantt-no-duplicate-description/valid/gantt/acc-descr-blocks-cr-and-lf-input.mmd",
        code: `gantt
  accDescr {\r    d\r    e\r  }
  accDescr {
    d
    e
  }
  dateFormat YYYY-MM-DD
  a : 2024-01-01, 1d
`,
      },
      {
        name: "valid/gantt/acc-descr-blocks-crlf-and-lf",
        filename:
          "tests/fixtures/rules/gantt-no-duplicate-description/valid/gantt/acc-descr-blocks-crlf-and-lf-input.mmd",
        code: `gantt\r
  accDescr {\r
    d\r
    e\r
  }\r
  accDescr {
  d

        e
  }
  dateFormat YYYY-MM-DD
  a : 2024-01-01, 1d
`,
      },
    ],
    invalid: [
      {
        name: "invalid/gantt/description-equal-predecessor-crlf",
        filename:
          "tests/fixtures/rules/gantt-no-duplicate-description/invalid/gantt/description-equal-predecessor-crlf-input.mmd",
        code: `gantt\r
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
                output: `gantt\r
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
