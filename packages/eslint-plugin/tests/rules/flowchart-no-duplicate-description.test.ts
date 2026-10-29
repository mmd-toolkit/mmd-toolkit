/**
 * The rule `flowchart-no-duplicate-description`, on the examples of its document and
 * on the inputs of its fixture directory.
 */
import { RuleTester } from "eslint"
import { flowchartNoDuplicateDescription } from "../../src/rules/flowchart-no-duplicate-description.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("flowchart-no-duplicate-description", flowchartNoDuplicateDescription)

new RuleTester(LANGUAGE_CONFIG).run(
  "flowchart-no-duplicate-description",
  flowchartNoDuplicateDescription,
  {
    valid: [
      {
        name: "a line separator inside one line description",
        filename: "input.mmd",
        code: `flowchart LR
  A
  accDescr: a\u2028accDescr: b
`,
      },

      {
        name: "valid/flowchart/acc-descr-blocks-cr-and-lf",
        filename:
          "tests/fixtures/rules/flowchart-no-duplicate-description/valid/flowchart/acc-descr-blocks-cr-and-lf-input.mmd",
        code: `flowchart LR
  A
  accDescr {\r    d\r    e\r  }
  accDescr {
    d
    e
  }
`,
      },
      {
        name: "valid/flowchart/acc-descr-blocks-crlf-and-lf",
        filename:
          "tests/fixtures/rules/flowchart-no-duplicate-description/valid/flowchart/acc-descr-blocks-crlf-and-lf-input.mmd",
        code: `flowchart LR\r
  A\r
  accDescr {\r
    d\r
    e\r
  }\r
  accDescr {
  d

        e
  }
`,
      },
    ],
    invalid: [
      {
        name: "a line separator inside a block before another description",
        filename: "input.mmd",
        code: `flowchart LR
  A
  accDescr { a\u2028b }
  accDescr: c
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier description with the one of this `accDescr`.",
            line: 4,
            column: 3,
            endLine: 4,
            endColumn: 14,
            suggestions: [
              {
                desc: "Remove this statement.",
                output: `flowchart LR
  A
  accDescr { a\u2028b }
`,
              },
              {
                desc: "Remove the earlier statement that sets the description.",
                output: `flowchart LR
  A
  accDescr: c
`,
              },
            ],
          },
        ],
      },

      {
        name: "invalid/flowchart/db-duplicate-description-crlf",
        filename:
          "tests/fixtures/rules/flowchart-no-duplicate-description/invalid/flowchart/db-duplicate-description-crlf-input.mmd",
        code: `flowchart LR\r
  A\r
  accDescr: a\r
  accDescr: b\r
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier description with the one of this `accDescr`.",
            line: 4,
            column: 3,
            endLine: 4,
            endColumn: 14,
            suggestions: [
              {
                desc: "Remove this statement.",
                output: `flowchart LR\r
  A\r
  accDescr: a\r
`,
              },
              {
                desc: "Remove the earlier statement that sets the description.",
                output: `flowchart LR\r
  A\r
  accDescr: b\r
`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/flowchart/db-duplicate-description-duplicate-cr",
        filename:
          "tests/fixtures/rules/flowchart-no-duplicate-description/invalid/flowchart/db-duplicate-description-duplicate-cr-input.mmd",
        code: `flowchart LR\r  accDescr: a\r  accDescr: b\r`,
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
                output: `flowchart LR\r  accDescr: a\r`,
              },
              {
                desc: "Remove the earlier statement that sets the description.",
                output: `flowchart LR\r  accDescr: b\r`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/flowchart/description-equal-predecessor-crlf",
        filename:
          "tests/fixtures/rules/flowchart-no-duplicate-description/invalid/flowchart/description-equal-predecessor-crlf-input.mmd",
        code: `flowchart LR\r
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
                output: `flowchart LR\r
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
