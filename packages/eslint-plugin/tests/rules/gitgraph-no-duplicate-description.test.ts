/** The rule on its document examples, fixture files, and escaped line terminators. */
import { RuleTester } from "eslint"
import { gitgraphNoDuplicateDescription } from "../../src/rules/gitgraph-no-duplicate-description.ts"
import { LANGUAGE_CONFIG } from "../helpers.ts"
import { testRule } from "../rule-test.ts"

testRule("gitgraph-no-duplicate-description", gitgraphNoDuplicateDescription)

new RuleTester(LANGUAGE_CONFIG).run(
  "gitgraph-no-duplicate-description",
  gitgraphNoDuplicateDescription,
  {
    valid: [
      {
        name: "valid/gitgraph/descriptions-cr-control",
        filename: "descriptions-cr-control.mmd",
        code: `gitGraph
accDescr {A\rB}
accDescr {A
B}
`,
      },
      {
        name: "valid/gitgraph/description-block-ls-ends-line",
        filename: "description-block-ls-ends-line.mmd",
        code: `gitGraph
accDescr {a \u2028  b}
accDescr {a\u2028b}
commit
`,
      },
      {
        name: "valid/gitgraph/description-block-ps-ends-line",
        filename: "description-block-ps-ends-line.mmd",
        code: `gitGraph
accDescr {a  \u2029 b}
accDescr {a\u2029b}
commit
`,
      },
    ],
    invalid: [
      {
        name: "invalid/gitgraph/description-line-ls-is-text",
        filename: "description-line-ls-is-text.mmd",
        code: `gitGraph
accDescr: a  \u2028 b
accDescr {a  \u2028 b}
commit
`,
        errors: [
          {
            messageId: "duplicate",
            line: 3,
            column: 1,
            endLine: 3,
            endColumn: 18,
            suggestions: [
              {
                desc: "Remove this statement.",
                output: `gitGraph
accDescr: a  \u2028 b
commit
`,
              },
              {
                desc: "Remove the earlier statement that sets the description.",
                output: `gitGraph
accDescr {a  \u2028 b}
commit
`,
              },
            ],
          },
        ],
      },

      {
        name: "invalid/gitgraph/description-equal-predecessor-crlf",
        filename:
          "tests/fixtures/rules/gitgraph-no-duplicate-description/invalid/gitgraph/description-equal-predecessor-crlf-input.mmd",
        code: `gitGraph\r
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
                output: `gitGraph\r
accDescr: A\r
accDescr: A\r
`,
              },
            ],
          },
        ],
      },
      {
        name: "invalid/gitgraph/descriptions-crlf",
        filename:
          "tests/fixtures/rules/gitgraph-no-duplicate-description/invalid/gitgraph/descriptions-crlf-input.mmd",
        code: `gitGraph\r
accDescr {First\r
line}\r
accDescr {Second\r
line}\r
`,
        errors: [
          {
            message:
              "mermaid.js replaces the earlier description with the one of this `accDescr`.",
            line: 4,
            column: 1,
            endLine: 5,
            endColumn: 6,
            suggestions: [
              {
                desc: "Remove this statement.",
                output: `gitGraph\r
accDescr {First\r
line}\r
`,
              },
              {
                desc: "Remove the earlier statement that sets the description.",
                output: `gitGraph\r
accDescr {Second\r
line}\r
`,
              },
            ],
          },
        ],
      },
    ],
  },
)
