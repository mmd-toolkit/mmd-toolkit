/**
 * The rule `timeline-no-duplicate-description`, on the examples of its document and on the
 * inputs of its fixture directory.
 */
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { RuleTester } from "eslint"
import { timelineNoDuplicateDescription } from "../../src/rules/timeline-no-duplicate-description.ts"
import { testRule } from "../rule-test.ts"

testRule("timeline-no-duplicate-description", timelineNoDuplicateDescription)

new RuleTester(LANGUAGE_CONFIG).run(
  "timeline-no-duplicate-description",
  timelineNoDuplicateDescription,
  {
    valid: [
      {
        name: "valid/timeline/acc-descr-blocks-cr-and-lf",
        filename:
          "tests/fixtures/rules/timeline-no-duplicate-description/valid/timeline/acc-descr-blocks-cr-and-lf-input.mmd",
        code: `timeline
  accDescr {\r    d\r    e\r  }
  accDescr {
    d
    e
  }
  2020 : a
`,
      },
      {
        name: "valid/timeline/acc-descr-blocks-crlf-and-lf",
        filename:
          "tests/fixtures/rules/timeline-no-duplicate-description/valid/timeline/acc-descr-blocks-crlf-and-lf-input.mmd",
        code: `timeline\r
  accDescr {\r
    d\r
    e\r
  }\r
  accDescr {
  d

        e
  }
  2020 : a
`,
      },
    ],
    invalid: [
      {
        name: "invalid/timeline/acc-descr-twice-crlf",
        filename:
          "tests/fixtures/rules/timeline-no-duplicate-description/invalid/timeline/acc-descr-twice-crlf-input.mmd",
        code: `timeline\r
  accDescr: a\r
  accDescr: b\r
  2020 : a\r
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier description with the one of this `accDescr`.",
            line: 3,
            column: 3,
            endLine: 3,
            endColumn: 14,
            suggestions: [
              {
                desc: "Remove this statement.",
                output: `timeline\r
  accDescr: a\r
  2020 : a\r
`,
              },
              {
                desc: "Remove the earlier statement that sets the description.",
                output: `timeline\r
  accDescr: b\r
  2020 : a\r
`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/timeline/description-equal-predecessor-crlf",
        filename:
          "tests/fixtures/rules/timeline-no-duplicate-description/invalid/timeline/description-equal-predecessor-crlf-input.mmd",
        code: `timeline\r
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
                output: `timeline\r
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
